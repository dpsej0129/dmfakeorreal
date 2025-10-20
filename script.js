const domains = [
  { name: "google.com", real: true },
  { name: "go99le.com", real: false },
  { name: "9oggle.com", real: false },
  { name: "google,com", real: false },
  { name: "naver.com", real: true },
  { name: "nevar.com", real: false },
  { name: "never.com", real: false },
  { name: "googoll.com", real: false },
  { name: "youtube.com", real: true },
  { name: "youtbe.cem", real: false },
  { name: "yoube.com", real: false },
  { name: "netflix.com", real: true },
  { name: "netflex.com", real: false },
  { name: "neetflix.com", real: false },
  { name: "instagram.com", real: true },
  { name: "instargram.com", real: false },
  { name: "instagream.com", real: false },
  { name: "instar.com", real: false },
  { name: "lnstagram.com", real: false },
  { name: "facebook.com", real: true },
  { name: "facebok.com", real: false },
  { name: "fakebooook.com", real: false },
  { name: "faceboook.com", real: false },
  { name: "facep00k.cam", real: false },
  { name: "canva.com", real: true },
  { name: "canver.cam", real: false },
  { name: "cenve.com", real: false },
  { name: "danva.com", real: false },
  { name: "carva.com", real: false }
];

let score = 0;
let remaining = 17; // 총 문제 개수
let currentDomain;

function nextDomain() {
  if (remaining <= 7) {
    // ✅ 마지막 문제 후 점수 저장
    localStorage.setItem("score1", score); 
    window.location.href = "result.html"; 
    return;
  }
  const randomIndex = Math.floor(Math.random() * domains.length);
  currentDomain = domains[randomIndex];
  document.getElementById("domain").innerText = currentDomain.name;
}

function check(answer) {
  if (remaining <= 7) return;
  if (answer === currentDomain.real) {
    score++;
  } else {
    score--;
  }
  remaining--;
  document.getElementById("score").innerText = score;
  document.getElementById("remaining").innerText = remaining;
  nextDomain();
}

// 게임 시작
nextDomain();
