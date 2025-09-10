const domains = [
  { name: "google.com", real: true },
  { name: "goggle.com", real: false },
  { name: "naver.com", real: true },
  { name: "navar.com", real: false },
  { name: "never.com", real: false },
  { name: "googol.com", real: false },
  { name: "youtube.com", real: true },
  { name: "youtbe.com", real: false },
  { name: "yotube.com", real: false }
];

let score = 0;
let time = 30;
let currentDomain;

function nextDomain() {
  const randomIndex = Math.floor(Math.random() * domains.length);
  currentDomain = domains[randomIndex];
  document.getElementById("domain").innerText = currentDomain.name;
}

function check(answer) {
  if(answer === currentDomain.real) score++; else score--;
  document.getElementById("score").innerText = score;
  nextDomain();
}

function countdown() {
  if(time > 0) {
    time--;
    document.getElementById("timer").innerText = time;
    setTimeout(countdown, 1000);
  } else {
    alert("게임 종료! 최종 점수: " + score);
    score = 0; time = 30;
    document.getElementById("score").innerText = score;
    document.getElementById("timer").innerText = time;
    nextDomain(); countdown();
  }
}

// 게임 시작
nextDomain();
countdown();
