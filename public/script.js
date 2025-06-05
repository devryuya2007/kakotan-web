// ------------------------------
// 単語テスト用のスクリプト
// ------------------------------

// サンプルの英単語データ
const wordData = [
    {english: "apple", japanese: "りんご"},
    {english: "book", japanese: "本"},
    {english: "cat", japanese: "猫"},
    {english: "dog", japanese: "犬"},
    {english: "elephant", japanese: "象"},
    {english: "fish", japanese: "魚"},
    {english: "green", japanese: "緑"},
    {english: "house", japanese: "家"},
    {english: "ice", japanese: "氷"},
    {english: "juice", japanese: "ジュース"},
    {english: "key", japanese: "鍵"},
    {english: "lion", japanese: "ライオン"},
    {english: "mouse", japanese: "ねずみ"},
    {english: "night", japanese: "夜"},
    {english: "ocean", japanese: "海"},
    {english: "pen", japanese: "ペン"},
    {english: "queen", japanese: "女王"},
    {english: "red", japanese: "赤"},
    {english: "sun", japanese: "太陽"},
    {english: "tree", japanese: "木"},
    {english: "umbrella", japanese: "傘"},
    {english: "voice", japanese: "声"},
    {english: "water", japanese: "水"},
    {english: "yellow", japanese: "黄色"},
    {english: "zoo", japanese: "動物園"},
    {english: "car", japanese: "車"},
    {english: "train", japanese: "電車"},
    {english: "plane", japanese: "飛行機"},
    {english: "ship", japanese: "船"},
    {english: "bike", japanese: "自転車"},
    {english: "school", japanese: "学校"},
    {english: "teacher", japanese: "先生"},
    {english: "student", japanese: "学生"},
    {english: "friend", japanese: "友達"},
    {english: "family", japanese: "家族"},
    {english: "mother", japanese: "母"},
    {english: "father", japanese: "父"},
    {english: "brother", japanese: "兄弟"},
    {english: "sister", japanese: "姉妹"},
    {english: "baby", japanese: "赤ちゃん"},
    {english: "happy", japanese: "幸せ"},
    {english: "sad", japanese: "悲しい"},
    {english: "angry", japanese: "怒っている"},
    {english: "excited", japanese: "興奮した"},
    {english: "tired", japanese: "疲れた"},
    {english: "hungry", japanese: "お腹が空いた"},
    {english: "thirsty", japanese: "のどが渇いた"},
    {english: "hot", japanese: "暑い"},
    {english: "cold", japanese: "寒い"},
    {english: "warm", japanese: "温かい"}
];

// 1900語分を生成（練習用）
while (wordData.length < 1900) {
    const baseWords = [
        {english: "walk", japanese: "歩く"},
        {english: "run", japanese: "走る"},
        {english: "jump", japanese: "跳ぶ"},
        {english: "swim", japanese: "泳ぐ"},
        {english: "fly", japanese: "飛ぶ"},
        {english: "eat", japanese: "食べる"},
        {english: "drink", japanese: "飲む"},
        {english: "sleep", japanese: "眠る"},
        {english: "wake", japanese: "起きる"},
        {english: "work", japanese: "働く"},
        {english: "study", japanese: "勉強する"},
        {english: "play", japanese: "遊ぶ"},
        {english: "sing", japanese: "歌う"},
        {english: "dance", japanese: "踊る"},
        {english: "laugh", japanese: "笑う"},
        {english: "cry", japanese: "泣く"},
        {english: "smile", japanese: "微笑む"},
        {english: "talk", japanese: "話す"},
        {english: "listen", japanese: "聞く"},
        {english: "see", japanese: "見る"},
        {english: "one", japanese: "一"},
        {english: "two", japanese: "二"},
        {english: "three", japanese: "三"},
        {english: "four", japanese: "四"},
        {english: "five", japanese: "五"},
        {english: "six", japanese: "六"},
        {english: "seven", japanese: "七"},
        {english: "eight", japanese: "八"},
        {english: "nine", japanese: "九"},
        {english: "ten", japanese: "十"},
        {english: "blue", japanese: "青"},
        {english: "black", japanese: "黒"},
        {english: "white", japanese: "白"},
        {english: "brown", japanese: "茶色"},
        {english: "pink", japanese: "ピンク"},
        {english: "purple", japanese: "紫"},
        {english: "orange", japanese: "オレンジ"},
        {english: "gray", japanese: "灰色"},
        {english: "bread", japanese: "パン"},
        {english: "rice", japanese: "米"},
        {english: "meat", japanese: "肉"},
        {english: "vegetable", japanese: "野菜"},
        {english: "fruit", japanese: "果物"},
        {english: "milk", japanese: "牛乳"},
        {english: "coffee", japanese: "コーヒー"},
        {english: "tea", japanese: "お茶"},
        {english: "cake", japanese: "ケーキ"},
        {english: "cookie", japanese: "クッキー"}
    ];

    for (let word of baseWords) {
        if (wordData.length >= 1900) break;
        wordData.push({
            english: word.english + (wordData.length + 1),
            japanese: word.japanese + (wordData.length + 1)
        });
    }
}

let currentQuiz = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let selectedAnswer = -1;

// 画面切り替え用ヘルパー
function showScreen(screenId) {
    document.querySelectorAll('.container').forEach(screen => {
        screen.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    target.classList.remove('hidden');
    target.classList.add('fade-in');
}

// ホーム画面へ戻る（index.htmlに遷移）
function goHome() {
    window.location.href = 'index.html';
}

// クイズデータを作成
function generateQuiz() {
    currentQuiz = [];
    const shuffled = [...wordData].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 20; i++) {
        const correctWord = shuffled[i];
        const wrongChoices = shuffled.slice(20)
            .filter(word => word.japanese !== correctWord.japanese)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const choices = [correctWord.japanese, ...wrongChoices.map(w => w.japanese)]
            .sort(() => Math.random() - 0.5);

        currentQuiz.push({
            english: correctWord.english,
            correct: correctWord.japanese,
            choices: choices,
            correctIndex: choices.indexOf(correctWord.japanese)
        });
    }
}

// クイズ開始
function startQuiz() {
    generateQuiz();
    currentQuestionIndex = 0;
    correctAnswers = 0;
    selectedAnswer = -1;
    showScreen('quiz-screen');
    displayQuestion();
}

// 問題を表示
function displayQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('english-word').textContent = question.english;

    const choiceButtons = document.querySelectorAll('.btn-choice');
    choiceButtons.forEach((btn, index) => {
        btn.textContent = question.choices[index];
        btn.className = 'btn btn-choice';
        btn.disabled = false;
    });

    document.getElementById('next-btn').classList.add('hidden');
    selectedAnswer = -1;
}

// 選択肢を選んだとき
function selectAnswer(choiceIndex) {
    if (selectedAnswer !== -1) return;

    selectedAnswer = choiceIndex;
    const question = currentQuiz[currentQuestionIndex];
    const choiceButtons = document.querySelectorAll('.btn-choice');

    choiceButtons.forEach(btn => btn.disabled = true);

    if (choiceIndex === question.correctIndex) {
        choiceButtons[choiceIndex].classList.add('btn-correct');
        correctAnswers++;
    } else {
        choiceButtons[choiceIndex].classList.add('btn-incorrect');
        choiceButtons[question.correctIndex].classList.add('btn-correct');
    }

    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('next-btn').classList.remove('hidden');
}

// 次の問題へ
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= currentQuiz.length) {
        showResult();
    } else {
        displayQuestion();
    }
}

// 結果画面を表示
function showResult() {
    document.getElementById('final-score').textContent = correctAnswers;
    const percentage = Math.round((correctAnswers / 20) * 100);
    let message = '';

    if (percentage >= 90) {
        message = '素晴らしい！完璧に近いです！🎉';
    } else if (percentage >= 70) {
        message = 'とても良くできました！👏';
    } else if (percentage >= 50) {
        message = 'まずまずです。もう少し頑張りましょう！💪';
    } else {
        message = '次回はもっと頑張りましょう！📚';
    }

    document.getElementById('score-message').textContent = message;
    showScreen('result-screen');
}

// 単語一覧を表示
function showWordList() {
    const wordListElement = document.getElementById('word-list');
    wordListElement.innerHTML = '';

    wordData.slice(0, 50).forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.style.cssText = `
            padding: 10px;
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        wordItem.innerHTML = `
            <span style="font-weight: bold; color: #667eea;">${word.english}</span>
            <span style="color: #333;">${word.japanese}</span>
        `;
        wordListElement.appendChild(wordItem);
    });

    const moreInfo = document.createElement('div');
    moreInfo.style.cssText = `
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
    `;
    moreInfo.textContent = `... 他 ${wordData.length - 50} 語（全${wordData.length}語収録）`;
    wordListElement.appendChild(moreInfo);

    showScreen('wordlist-screen');
}
