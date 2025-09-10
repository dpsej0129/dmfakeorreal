// 1단계 점수 불러오기
const score1 = parseInt(localStorage.getItem("score1") || "0", 10);

// 보안 객관식 문제 세트
const quiz = [
  {
    question: "피싱(Phishing) 공격의 주요 목적은 무엇일까요?",
    choices: ["시스템 속도 향상", "개인 정보 탈취", "네트워크 안정화", "디스크 공간 확보"],
    answer: 1
  },
  {
    question: "강력한 비밀번호를 만들 때 가장 올바른 방법은?",
    choices: ["짧고 기억하기 쉬운 단어 사용", "생일 같은 개인정보 사용", "대문자, 숫자, 특수문자 조합", "모든 사이트에 같은 비밀번호 사용"],
    answer: 2
  },
  {
    question: "바이러스와 달리 스스로 네트워크를 통해 전파되는 악성코드는?",
    choices: ["웜(Worm)", "트로이목마", "애드웨어", "키로거"],
    answer: 0
  },
  {
    question: "HTTPS에서 'S'는 무엇을 의미할까요?",
    choices: ["Safe", "Secure", "Server", "System"],
    answer: 1
  },
  {
    question: "2단계 인증(2FA)의 예시는?",
    choices: ["비밀번호만 입력", "비밀번호 + OTP 코드", "비밀번호 저장", "자동 로그인"],
    answer: 1
  },
  {
    question: "알 수 없는 사람이 보낸 이메일 첨부파일을 열면 위험한 이유는?",
    choices: ["컴퓨터 속도가 느려진다", "자동으로 광고가 뜬다", "악성코드가 설치될 수 있다", "이메일이 삭제된다"],
    answer: 2
  },
  {
    question: "공공 와이파이를 사용할 때 가장 안전한 방법은?",
    choices: ["아무 설정 없이 접속한다", "VPN을 사용한다", "비밀번호를 공유한다", "모든 사이트에 자동 로그인한다"],
    answer: 1
  }
];

// ✅ 배열을 섞는 함수 (Fisher-Yates shuffle)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ✅ 문제 순서를 랜덤으로 바꾸기
let quizData = shuffle([...quiz]);

let score2 = score1;
let remaining2 = quizData.length;
let currentIndex = 0;

function loadQuestion() {
  if (remaining2 <= 0) {
    // 최종 점수 계산
    localStorage.setItem("score2", score2);

    // 결과 화면 표시
    document.body.innerHTML = `
      <h1>퀴즈 종료!</h1>
      <h2>총 점수: ${score2}</h2>
    `;
    return;
  }

  const q = quizData[currentIndex];
  document.getElementById("question").innerText = q.question;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.innerText = String.fromCharCode(65 + index) + ". " + choice;
    btn.onclick = () => checkAnswer(index);
    choicesDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const q = quizData[currentIndex];
  if (selected === q.answer) {
    score2++;
  } else {
    score2--;
  }

  remaining2--;
  document.getElementById("score").innerText = score2;
  document.getElementById("remaining").innerText = remaining2;

  currentIndex++;
  loadQuestion();
}

// ✅ 시작할 때 문제 랜덤 로딩
loadQuestion();
