// public/app.js
const domainInput = document.getElementById('domain');
const checkBtn = document.getElementById('checkBtn');
const resultBox = document.getElementById('result');
const verdictEl = document.getElementById('verdict');
const detailsEl = document.getElementById('details');
const scoreBar = document.getElementById('scoreBar');

function showResult(obj) {
  resultBox.classList.remove('hidden');
  const score = obj.riskScore ?? 0;
  let color = 'var(--safe)';
  if (score >= 60) color = 'var(--danger)';
  else if (score >= 30) color = 'var(--warn)';
  // update header
  let label = '';
  if (obj.verdict === 'likely-safe') label = '안전해 보임 ✔️';
  else if (obj.verdict === 'possible-risk') label = '주의 필요 ⚠️';
  else if (obj.verdict === 'suspicious') label = '의심됨 ❗';
  else label = '판단 불가';

  verdictEl.textContent = `${obj.domain} — ${label} (점수 ${score})`;

  // render bar
  scoreBar.innerHTML = `<div style="width:${Math.min(100,score)}%; background:${color}"></div>`;

  // details (human-friendly)
  const f = obj.findings || {};
  let text = '';
  text += `DNS A 레코드: ${(f.dns && f.dns.hasA) ? '있음 (' + (f.dns.A||[]).join(', ') + ')' : '없음'}\n`;
  text += `비-ASCII 문자: ${f.containsNonAscii ? '있음 (호모글리프/IDN 의심)' : '없음'}\n`;
  text += `Punycode(xn--): ${f.isPunycode ? '예' : '아니오'}\n`;
  text += `유명도 비교: 최단 편집거리 ${f.typoDistance} (대상: ${f.typoMatch})\n`;
  text += `WHOIS 생성일: ${obj.findings.whoisCreated || '조회 불가'}\n`;
  text += `신생 도메인(90일 이하): ${obj.findings.isNewDomain ? '예 (의심)' : '아니오/정보없음'}\n`;
  if (obj.findings.ssl && obj.findings.ssl.ok) {
    text += `SSL 인증서: 가능 (남은일수: ${obj.findings.ssl.daysLeft ?? '알수없음'})\n`;
  } else {
    text += `SSL 인증서: 조회 실패 또는 없음 (${obj.findings.ssl?.error ?? 'N/A'})\n`;
  }
  text += `\n권장: ${obj.verdict === 'suspicious' ? '접속 금지 또는 안전한 경로(북마크, 검색결과) 재확인' : (obj.verdict === 'possible-risk' ? '주소 재확인, 의심 시 직접 방문 금지' : '기록/통지 용도로 사용 가능')}\n`;

  detailsEl.textContent = text;
}

checkBtn.addEventListener('click', async () => {
  const domain = domainInput.value.trim();
  if (!domain) {
    alert('도메인을 입력하세요.');
    return;
  }
  checkBtn.disabled = true;
  checkBtn.textContent = '검사 중...';
  try {
    const url = `/api/check?domain=${encodeURIComponent(domain)}`;
    const res = await fetch(url);
    const data = await res.json();
    showResult(data);
  } catch (e) {
    alert('서버 오류: ' + e.message);
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = '검사하기';
  }
});

domainInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkBtn.click();
});

