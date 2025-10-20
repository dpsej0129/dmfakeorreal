// 1단계 점수를 불러와 합산 점수로 초기화
let score = parseInt(localStorage.getItem("score1") || "0", 10);
document.getElementById("score").innerText = score;

// 보안 객관식 문제 배열
const quiz = [
  {
    question: "시작하기 버튼을 눌렀을 때 실행 결과는?",
    choices: ["12", "10", "3", "Error"],
    image: "images/entry1.png",
    answer: 1
  },
  {
    question: "기존 관리·분석 체계로 처리하기 어려운 방대한 정형·반정형·비정형 데이터 집합과 이를 수집·저장·관리·분석·시각화하는 기술은?",
    choices: ["스몰데이터", "통계", "빅데이터", "정형화된 데이터"],
    answer: 2
  },
  {
    question: "은유적으로 ‘안전한 장소로 적을 초대해 속이는 책략’을 뜻하며 위장된 악성 소프트웨어를 의미하는 것은?",
    choices: ["스파이웨어", "트로이목마", "랜섬웨어", "디도스"],
    answer: 1
  },
  {
    question: "다음 보기 중 더 안전한 사이트는?",
    choices: ["htps", "http", "htps", "https"],
    answer: 3
  },
  {
    question: "시작하기 버튼을 눌렀을 때 실행 결과는?",
    choices: ["10", "1", "2", "7"],
    image: "images/entry2.png",
    answer: 0
  },
  {
    question: "어떤 문제를 해결하기 위한 단계적인 절차나 방법은?",
    choices: ["알고리즘", "딥러닝", "머신러닝", "사고회로"],
    answer: 0
  },
  {
    question: "평문(원래의 데이터)을 암호문(해독이 어려운 형태로 변환된 데이터)으로 바꾸는 과정은?",
    choices: ["해독", "암호화", "보안 시스템", "압축"],
    answer: 1
  }
];

// 배열 섞기 (문제/보기 공용)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 문제 배열 섞기
let quizData = shuffle([...quiz]);
let remaining = quizData.length;
let currentIndex = 0;

// 점수 업데이트
function updateScore() {
  document.getElementById("score").innerText = score;
}

// 문제 로딩
function loadQuestion() {
  if (remaining <= 0) {
    // 최종 점수 저장
    localStorage.setItem("score_total", score);

    document.body.innerHTML = `
      <h1>퀴즈 종료!</h1>
      <h2>총 점수: ${score}</h2>
    `;
    return;
  }

  const q = quizData[currentIndex];
  document.getElementById("question").innerText = q.question;

const img = document.getElementById("questionImage");
if (q.image) {
  img.src = q.image;
  img.style.display = "block";
} else {
  img.style.display = "none";
}

  // 보기 랜덤 섞기 + 정답 인덱스 다시 지정
  const choiceObjects = q.choices.map((choice, index) => ({
    text: choice,
    isAnswer: index === q.answer
  }));
  const shuffledChoices = shuffle(choiceObjects);

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  shuffledChoices.forEach((c, index) => {
    const btn = document.createElement("button");
    btn.innerText = String.fromCharCode(65 + index) + ". " + c.text;
    btn.onclick = () => checkAnswer(c.isAnswer);
    choicesDiv.appendChild(btn);
  });

  document.getElementById("remaining").innerText = remaining;
  updateScore();
}

// 답 선택 처리
function checkAnswer(isCorrect) {
  if (isCorrect) score++;
  else score--;

  remaining--;
  currentIndex++;
  loadQuestion();
}

// 퀴즈 시작
loadQuestion();
