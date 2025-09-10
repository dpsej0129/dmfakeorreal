const domains = [
  { name: "google.com", real: true },
  { name: "goggle.com", real: false },
  { name: "naver.com", real: true },
  { name: "navar.com", real: false },
  { name: "github.com", real: true },
  { name: "githbub.com", real: false },
  { name: "daum.net", real: true },
  { name: "damu.net", real: false },
  { name: "youtube.com", real: true },
  { name: "youtubee.com", real: false },
  { name: "kakao.com", real: true },
  { name: "cacao.com", real: false },
  { name: "tistory.com", real: true },
  { name: "tistroy.com", real: false },
  { name: "facebook.com", real: true },
  { name: "facebok.com", real: false },
  { name: "instagram.com", real: true },
  { name: "instagrm.com", real: false },
  { name: "twitter.com", real: true },
  { name: "twiter.com", real: false }
];

let score = 0;
let remaining = 20; // 총 문제 개수
let currentDomain;

function nextDomain() {
  if (remaining <= 0) {
    alert("게임 종료! 최종 점수: " + score);
    // 게임 초기화
    score = 0;
    remaining = 20;
    document.getElementById("score").innerText = score;
    document.getElementById("remaining").innerText = remaining;
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
