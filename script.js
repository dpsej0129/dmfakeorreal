const domains = [
  { name: "google.com", real: true },
  { name: "goggle.com", real: false },
  { name: "naver.com", real: true },
  { name: "navar.com", real: false },
  { name: "never.com", real: false },
  { name: "googol.com", real: false },
  { name: "youtube.com", real: true },
  { name: "youtbe.com", real: false },
  { name: "yotube.com", real: false },
  { name: "coupang.com", real: true },
  { name: "coupeng.com", real: false },
  { name: "copang.com", real: false },
  { name: "c0upang.com", real: false },
  { name: "netflix.com", real: true },
  { name: "netflixx.com", real: false },
  { name: "natflix.com", real: false },
  { name: "instagram.com", real: true },
  { name: "instargram.com", real: false },
  { name: "instagrem.com", real: false },
  { name: "instagrem.com", real: false },
  { name: "lnstagram.com", real: false },
  { name: "facebook.com", real: true },
  { name: "facebok.com", real: false },
  { name: "facabook.com", real: false },
  { name: "fakebook.com", real: false },
  { name: "faceboook.com", real: false },
  { name: "faceb00k.com", real: false }
];

let score = 0;
let remaining = 10; // 총 문제 개수
let currentDomain;

function nextDomain() {
  if (remaining <= 0) {
    // 마지막 문제 후 다른 파일로 이동
    window.location.href = "result.html"; 
    return;
  }
  const randomIndex = Math.floor(Math.random() * domains.length);
  currentDomain = domains[randomIndex];
  document.getElementById("domain").innerText = currentDomain.name;
}

function check(answer) {
  if (remaining <= 0) return;
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

function loadQuestion() {
  if (remaining <= 0) {
    // 마지막에만 점수 저장
    localStorage.setItem("score1", score); // 반드시 숫자형 점수 저장
    window.location.href = "result.html"; // result.html로 이동
    return;
  }

  const q = quizData[currentIndex];
  document.getElementById("domain").innerText = q.domain;
  document.getElementById("score").innerText = score;
  document.getElementById("remaining").innerText = remaining;
}

