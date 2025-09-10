// server.js
const express = require('express');
const cors = require('cors');
const dns = require('dns').promises;
const whois = require('whois-json');
const fs = require('fs');
const https = require('https');
const net = require('net');
const punycode = require('punycode/');

const popular = JSON.parse(fs.readFileSync('./popular_domains.json', 'utf8'));

const app = express();
app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

function isValidDomainFormat(domain) {
  // very simple domain format check
  if (!domain || typeof domain !== 'string') return false;
  domain = domain.trim().toLowerCase();
  // allow punycode (xn--) and unicode (we'll check later)
  const re = /^(?:[a-z0-9\-._xn@]+)$/i;
  // We'll also strip protocol if present
  domain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  // remove path
  domain = domain.split('/')[0];
  return domain.length > 1 && domain.length < 255;
}

function normalizeDomain(domain) {
  domain = domain.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  domain = domain.split('/')[0];
  return domain;
}

function containsNonAscii(domain) {
  return /[^\x00-\x7F]/.test(domain);
}

// Levenshtein distance
function levenshtein(a, b) {
  if (!a || !b) return Math.max(a?.length||0, b?.length||0);
  a = a.toLowerCase(); b = b.toLowerCase();
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for (let i=0;i<=m;i++) dp[i][0] = i;
  for (let j=0;j<=n;j++) dp[0][j] = j;
  for (let i=1;i<=m;i++){
    for (let j=1;j<=n;j++){
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[m][n];
}

async function checkDNS(domain) {
  try {
    const a = await dns.resolve(domain, 'A').catch(()=>[]);
    const aaaa = await dns.resolve(domain, 'AAAA').catch(()=>[]);
    const cname = await dns.resolveCname(domain).catch(()=>[]);
    return {
      hasA: Array.isArray(a) && a.length>0,
      A: a || [],
      AAAA: aaaa || [],
      CNAME: cname || []
    };
  } catch (e) {
    return { hasA: false, A: [], AAAA: [], CNAME: [] };
  }
}

async function getWhois(domain) {
  try {
    const data = await whois(domain, { follow: 3, timeout: 15000 });
    return data;
  } catch (e) {
    return null;
  }
}

async function getSSLCert(domain) {
  // try to connect over TLS and get peer certificate
  return new Promise((resolve) => {
    const opts = {
      host: domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: false,
      timeout: 8000
    };
    try {
      const socket = tlsConnect(opts, (err, cert) => {
        if (err) {
          resolve({ ok: false, error: String(err) });
        } else {
          resolve({ ok: true, cert });
        }
      });
      // if timeout
      setTimeout(() => {
        try { socket?.destroy?.(); } catch(e){}
        resolve({ ok: false, error: 'timeout' });
      }, 8000);
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

// small helper using TLS socket to get certificate
function tlsConnect(options, cb) {
  const tls = require('tls');
  const s = tls.connect({
    host: options.host,
    port: options.port,
    servername: options.servername,
    rejectUnauthorized: false
  }, function() {
    try {
      const cert = s.getPeerCertificate(true);
      cb(null, cert);
      s.end();
    } catch (e) {
      cb(e);
      s.end();
    }
  });
  s.on('error', (err)=> cb(err));
  return s;
}

function parseWhoisCreation(whoisData) {
  if (!whoisData) return null;
  // common fields
  const keys = ['creationDate','created','Creation Date','domainRegistrationDate','registered','createdDate'];
  for (let k of keys) {
    if (whoisData[k]) {
      const val = whoisData[k];
      const d = new Date(val);
      if (!isNaN(d)) return d;
      // sometimes it's an array or complex string
      if (Array.isArray(val)) {
        const cand = new Date(val[0]);
        if (!isNaN(cand)) return cand;
      }
    }
  }
  // fallback: try to find date-like string in raw text
  if (whoisData.raw && typeof whoisData.raw === 'string') {
    const m = whoisData.raw.match(/(Created on|Creation Date|Registered on|Registered Date|Domain Create Date|Created):?\s*([0-9A-Za-z\-\:\. ]{6,40})/i);
    if (m && m[2]) {
      const d = new Date(m[2]);
      if (!isNaN(d)) return d;
    }
  }
  return null;
}

function scoreFromFindings(findings) {
  // build a simple risk score 0..100 (higher = more suspicious)
  let score = 0;
  if (findings.containsNonAscii) score += 15;
  if (findings.isPunycode) score += 10;
  if (findings.typoDistance && findings.typoDistance <= 2) score += 25;
  if (!findings.dns.hasA) score += 20;
  if (findings.isNewDomain) score += 20;
  if (!findings.ssl.ok) score += 5;
  // clamp
  if (score > 100) score = 100;
  return score;
}

app.get('/api/check', async (req, res) => {
  const raw = req.query.domain || '';
  const normalized = normalizeDomain(raw);
  if (!normalized) return res.status(400).json({ error: 'domain empty' });
  if (!isValidDomainFormat(normalized)) {
    return res.json({ domain: normalized, validFormat: false, error: 'invalid format' });
  }

  // is punycode?
  const isPuny = normalized.startsWith('xn--') || normalized.includes('.xn--');
  // non-ascii
  const nonAscii = containsNonAscii(normalized);

  // DNS
  const dnsInfo = await checkDNS(normalized);

  // whois
  const whoisData = await getWhois(normalized);
  const created = parseWhoisCreation(whoisData);
  let isNew = false;
  if (created) {
    const ageDays = Math.floor((Date.now() - created.getTime()) / (24*3600*1000));
    isNew = ageDays <= 90; // 90 days threshold for suspicious
  }

  // ssl cert
  let ssl = { ok: false, error: 'not checked' };
  try {
    ssl = await getSSLCert(normalized);
    // if ok, check dates
    if (ssl.ok && ssl.cert && ssl.cert.valid_to) {
      const validTo = new Date(ssl.cert.valid_to);
      if (isNaN(validTo)) {
        // ignore
      } else {
        const daysLeft = Math.floor((validTo - Date.now())/(24*3600*1000));
        ssl.daysLeft = daysLeft;
      }
    }
  } catch (e) {
    ssl = { ok:false, error: String(e) };
  }

  // compare with popular domains
  let bestDistance = Infinity;
  let bestMatch = null;
  for (let p of popular) {
    const dist = levenshtein(normalized, p);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = p;
    }
  }

  const findings = {
    containsNonAscii: nonAscii,
    isPunycode: isPuny,
    dns: dnsInfo,
    whois: whoisData ? { summary: true } : null,
    whoisCreated: created ? created.toISOString() : null,
    isNewDomain: isNew,
    ssl,
    typoDistance: bestDistance,
    typoMatch: bestMatch
  };

  const riskScore = scoreFromFindings(findings);
  let verdict = 'unknown';
  if (riskScore >= 60) verdict = 'suspicious';
  else if (riskScore >= 30) verdict = 'possible-risk';
  else verdict = 'likely-safe';

  res.json({
    domain: normalized,
    findings,
    riskScore,
    verdict
  });
});

app.listen(PORT, () => {
  console.log(`Domain checker listening on http://localhost:${PORT}`);
});

