// 単語データ（英語と日本語のペア）
const words = [
    { english: 'apple', japanese: 'りんご' },
    { english: 'book', japanese: '本' },
    { english: 'cat', japanese: '猫' },
    { english: 'dog', japanese: '犬' },
    { english: 'egg', japanese: '卵' }
];

// 現在表示している単語のインデックス
let currentIndex = 0;

// ページ読み込み時に最初の単語を表示
window.onload = () => {
    showWord();
};

// 単語を表示する関数
function showWord() {
    const item = words[currentIndex];
    document.getElementById('word').textContent = item.english;
    document.getElementById('translation').textContent = item.japanese;
    document.getElementById('translation').classList.add('hidden');
    document.getElementById('next-word').disabled = true;
}

// 「答えを見る」ボタンの処理
const showBtn = document.getElementById('show-translation');
showBtn.addEventListener('click', () => {
    document.getElementById('translation').classList.remove('hidden');
    document.getElementById('next-word').disabled = false;
});

// 「次へ」ボタンの処理
const nextBtn = document.getElementById('next-word');
nextBtn.addEventListener('click', () => {
    // 次の単語へ。最後まで来たら最初に戻る
    currentIndex = (currentIndex + 1) % words.length;
    showWord();
});
