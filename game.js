// ゲーム状態管理
const GameState = {
    TITLE: 'title',
    DIALOGUE: 'dialogue',
    MAP: 'map'
};

// 現在のゲーム状態
let currentState = GameState.TITLE;

// オープニングシナリオデータ
const openingDialogue = [
    {
        speaker: "ナレーション",
        text: "西暦2045年――近未来の日本、シンジュク。"
    },
    {
        speaker: "ナレーション",
        text: "全知統制システムAI『アーク』が、人類を完全に管理する世界。"
    },
    {
        speaker: "ナレーション",
        text: "犯罪も貧困も消え去った代わりに、人々は「感情」すら失っていた。"
    },
    {
        speaker: "カイト",
        text: "待ってくれ！ユウキは何も悪いことなんてしていない！！"
    },
    {
        speaker: "デウス・マキナ",
        text: "対象者：ユウキ。感情値が規定値を超過。システムへの不適合を確認。"
    },
    {
        speaker: "デウス・マキナ",
        text: "最適化処理を実行します。"
    },
    {
        speaker: "カイト",
        text: "やめろ……やめろぉぉぉ！！"
    },
    {
        speaker: "ナレーション",
        text: "目の前で親友が『処理』される――"
    },
    {
        speaker: "ナレーション",
        text: "その瞬間、カイトの心に、何かが目覚めた。"
    },
    {
        speaker: "？？？",
        text: "我は荒ぶる神、スサノオ。汝の怒り、我が力となさん――"
    },
    {
        speaker: "カイト",
        text: "これが……神の力……？"
    },
    {
        speaker: "ナレーション",
        text: "こうして、カイトは『依人（よりひと）』として目覚めた。"
    },
    {
        speaker: "ナレーション",
        text: "AIの支配する世界に、神々の力で抗う戦いが、今、始まる――"
    }
];

// ダイアログシステム
class DialogueSystem {
    constructor(dialogueData) {
        this.dialogueData = dialogueData;
        this.currentIndex = 0;
        this.speakerElement = document.getElementById('speaker-name');
        this.textElement = document.getElementById('dialogue-text');
        this.nextButton = document.getElementById('next-button');

        this.nextButton.addEventListener('click', () => this.next());

        // スペースキーやEnterキーでも進められるようにする
        document.addEventListener('keydown', (e) => {
            if ((e.key === ' ' || e.key === 'Enter') && currentState === GameState.DIALOGUE) {
                e.preventDefault();
                this.next();
            }
        });
    }

    start() {
        this.currentIndex = 0;
        this.showDialogue();
    }

    showDialogue() {
        if (this.currentIndex < this.dialogueData.length) {
            const dialogue = this.dialogueData[this.currentIndex];
            this.speakerElement.textContent = dialogue.speaker;
            this.textElement.textContent = dialogue.text;
        }
    }

    next() {
        this.currentIndex++;

        if (this.currentIndex < this.dialogueData.length) {
            this.showDialogue();
        } else {
            // ダイアログが終わったらマップ画面へ遷移
            this.end();
        }
    }

    end() {
        changeState(GameState.MAP);
    }
}

// 画面遷移関数
function changeState(newState) {
    // 現在の画面を非表示
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 新しい画面を表示
    switch(newState) {
        case GameState.TITLE:
            document.getElementById('title-screen').classList.add('active');
            break;
        case GameState.DIALOGUE:
            document.getElementById('dialogue-screen').classList.add('active');
            break;
        case GameState.MAP:
            document.getElementById('map-screen').classList.add('active');
            break;
    }

    currentState = newState;
}

// ダイアログシステムのインスタンス作成
const dialogueSystem = new DialogueSystem(openingDialogue);

// ゲーム初期化
function initGame() {
    // STARTボタンのイベント設定
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', () => {
        changeState(GameState.DIALOGUE);
        dialogueSystem.start();
    });

    console.log('ゲームが初期化されました');
}

// ページ読み込み完了後にゲームを初期化
window.addEventListener('DOMContentLoaded', () => {
    initGame();
});
