/* =========================================
   ARCADE HUB
   NO SUPABASE
   LOCAL STORAGE LEADERBOARD
========================================= */

const $ = (id) => document.getElementById(id);

let playerName = localStorage.getItem("arcade_player") || "";

let currentGame = null;
let currentScore = 0;

let reactionTimeout = null;
let reactionStart = 0;
let reactionReady = false;

let targetInterval = null;
let targetTime = 30;
let targetScore = 0;

let memoryCards = [];
let memoryFirst = null;
let memorySecond = null;
let memoryLocked = false;
let memoryMatches = 0;

let numberAnswer = 0;
let numberScore = 0;


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    if (!playerName) {
        $("nameModal").classList.remove("hidden");
    } else {
        updatePlayerDisplay();
    }

    setupNavigation();
    setupGameButtons();
    renderLeaderboard("all");

});


/* =========================================
   PLAYER
========================================= */

function updatePlayerDisplay() {
    $("playerDisplay").textContent = playerName.toUpperCase();
}

function askForName() {

    $("nameInput").value = playerName || "";

    $("nameModal").classList.remove("hidden");

    setTimeout(() => {
        $("nameInput").focus();
    }, 100);
}

$("saveNameBtn").addEventListener("click", saveName);

$("nameInput").addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        saveName();
    }

});

function saveName() {

    const value = $("nameInput").value.trim();

    if (!value) {
        $("nameInput").focus();
        return;
    }

    playerName = value.slice(0, 16);

    localStorage.setItem(
        "arcade_player",
        playerName
    );

    updatePlayerDisplay();

    $("nameModal").classList.add("hidden");
}

$("changeNameBtn").addEventListener(
    "click",
    askForName
);


/* =========================================
   NAVIGATION
========================================= */

function showScreen(id) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    $(id).classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function setupNavigation() {

    $("playNowBtn").addEventListener("click", () => {
        document.querySelector(".games-section").scrollIntoView({
            behavior: "smooth"
        });
    });

    $("leaderboardBtn").addEventListener("click", () => {
        showScreen("leaderboardScreen");
        renderLeaderboard("all");
    });

    $("leaderboardBackBtn").addEventListener("click", () => {
        showScreen("homeScreen");
    });

    $("backBtn").addEventListener("click", () => {

        stopCurrentGame();

        showScreen("homeScreen");

    });

    $("homeFromGameBtn").addEventListener("click", () => {

        $("gameOverModal").classList.add("hidden");

        stopCurrentGame();

        showScreen("homeScreen");

    });

    $("playAgainBtn").addEventListener("click", () => {

        $("gameOverModal").classList.add("hidden");

        startGame(currentGame);

    });

    document.querySelectorAll(".tab").forEach(tab => {

        tab.addEventListener("click", () => {

            document.querySelectorAll(".tab").forEach(t => {
                t.classList.remove("active");
            });

            tab.classList.add("active");

            renderLeaderboard(
                tab.dataset.board
            );

        });

    });

}


/* =========================================
   GAME BUTTONS
========================================= */

function setupGameButtons() {

    document.querySelectorAll(".game-btn").forEach(button => {

        button.addEventListener("click", () => {

            startGame(button.dataset.game);

        });

    });


    document.querySelectorAll(".start-game").forEach(button => {

        button.addEventListener("click", () => {

            startGame(button.dataset.start);

        });

    });

}


/* =========================================
   START GAME
========================================= */

function startGame(game) {

    if (!playerName) {
        askForName();
        return;
    }

    currentGame = game;
    currentScore = 0;

    showScreen("gameScreen");

    document.querySelectorAll(".game-board").forEach(board => {
        board.classList.add("hidden-game");
    });

    const data = {

        reaction: {
            title: "Reaction Rush",
            type: "REACTION"
        },

        target: {
            title: "Target Tap",
            type: "TARGET"
        },

        memory: {
            title: "Memory Match",
            type: "MEMORY"
        },

        number: {
            title: "Number Rush",
            type: "NUMBER"
        }

    }[game];

    $("activeGameTitle").textContent = data.title;
    $("activeGameType").textContent = data.type;

    $("scoreDisplay").textContent = "0";

    if (game === "reaction") {

        $("reactionGame").classList.remove("hidden-game");

        resetReaction();

    }

    if (game === "target") {

        $("targetGame").classList.remove("hidden-game");

        resetTarget();

    }

    if (game === "memory") {

        $("memoryGame").classList.remove("hidden-game");

        resetMemory();

    }

    if (game === "number") {

        $("numberGame").classList.remove("hidden-game");

        resetNumber();

    }

}


/* =========================================
   REACTION RUSH
========================================= */

function resetReaction() {

    clearTimeout(reactionTimeout);

    reactionReady = false;

    $("reactionArea").className = "reaction-area";

    $("reactionArea").textContent = "WAIT...";

}

$("reactionArea").addEventListener("click", () => {

    if (!reactionReady) {

        if (reactionStart !== 0) {

            clearTimeout(reactionTimeout);

            $("reactionArea").textContent = "TOO EARLY!";

            reactionStart = 0;

        }

        return;
    }

    const reactionTime =
        Date.now() - reactionStart;

    reactionReady = false;
    reactionStart = 0;

    currentScore =
        Math.max(
            1,
            Math.round(1000 / reactionTime * 100)
        );

    $("scoreDisplay").textContent = currentScore;

    setTimeout(() => {

        finishGame(
            currentScore,
            `Your reaction time was ${reactionTime}ms.`
        );

    }, 500);

});


function startReaction() {

    resetReaction();

    $("reactionArea").textContent =
        "GET READY...";

    reactionStart = Date.now();

    const delay =
        Math.floor(Math.random() * 3000) + 1500;

    reactionTimeout = setTimeout(() => {

        reactionReady = true;

        reactionStart = Date.now();

        $("reactionArea").classList.add("ready");

        $("reactionArea").textContent =
            "TAP NOW!";

    }, delay);

}


/* =========================================
   TARGET TAP
========================================= */

function resetTarget() {

    clearInterval(targetInterval);

    targetTime = 30;
    targetScore = 0;

    $("targetTimer").textContent = "30";
    $("targetCircle").style.display = "none";

}

$("targetCircle").addEventListener("click", (e) => {

    e.stopPropagation();

    targetScore++;

    $("scoreDisplay").textContent =
        targetScore;

    moveTarget();

});


function startTarget() {

    resetTarget();

    $("targetCircle").style.display = "block";

    moveTarget();

    targetInterval = setInterval(() => {

        targetTime--;

        $("targetTimer").textContent =
            targetTime;

        if (targetTime <= 0) {

            clearInterval(targetInterval);

            $("targetCircle").style.display =
                "none";

            finishGame(
                targetScore,
                `You hit the target ${targetScore} times.`
            );

        }

    }, 1000);

}


function moveTarget() {

    const area = $("targetArea");
    const circle = $("targetCircle");

    const maxX =
        area.clientWidth - circle.offsetWidth;

    const maxY =
        area.clientHeight - circle.offsetHeight;

    const x =
        Math.random() * Math.max(0, maxX);

    const y =
        Math.random() * Math.max(0, maxY);

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

}


/* =========================================
   MEMORY MATCH
========================================= */

const memorySymbols = [
    "★",
    "◆",
    "●",
    "▲",
    "■",
    "✦",
    "♥",
    "⚡"
];

function resetMemory() {

    memoryCards = [];
    memoryFirst = null;
    memorySecond = null;
    memoryLocked = false;
    memoryMatches = 0;

    $("memoryGrid").innerHTML = "";

}

function startMemory() {

    resetMemory();

    const values =
        [...memorySymbols, ...memorySymbols]
        .sort(() => Math.random() - 0.5);

    values.forEach((symbol, index) => {

        const card =
            document.createElement("button");

        card.className =
            "memory-card";

        card.dataset.symbol =
            symbol;

        card.dataset.index =
            index;

        card.textContent =
            symbol;

        card.addEventListener(
            "click",
            () => flipMemory(card)
        );

        $("memoryGrid").appendChild(card);

        memoryCards.push(card);

    });

}


function flipMemory(card) {

    if (
        memoryLocked ||
        card.classList.contains("flipped") ||
        card.classList.contains("matched")
    ) {
        return;
    }

    card.classList.add("flipped");

    if (!memoryFirst) {

        memoryFirst = card;

        return;

    }

    memorySecond = card;

    memoryLocked = true;

    if (
        memoryFirst.dataset.symbol ===
        memorySecond.dataset.symbol
    ) {

        memoryFirst.classList.add("matched");
        memorySecond.classList.add("matched");

        memoryMatches++;

        currentScore += 100;

        $("scoreDisplay").textContent =
            currentScore;

        memoryFirst = null;
        memorySecond = null;
        memoryLocked = false;

        if (memoryMatches === memorySymbols.length) {

            setTimeout(() => {

                finishGame(
                    currentScore,
                    "All pairs found!"
                );

            }, 500);

        }

    } else {

        setTimeout(() => {

            memoryFirst.classList.remove("flipped");
            memorySecond.classList.remove("flipped");

            memoryFirst = null;
            memorySecond = null;

            memoryLocked = false;

        }, 650);

    }

}


/* =========================================
   NUMBER RUSH
========================================= */

function resetNumber() {

    $("numberQuestion").textContent =
        "Press start.";

    $("numberInstruction").textContent =
        "Correct answer select koro.";

    $("numberOptions").innerHTML = "";

    numberAnswer = 0;
    numberScore = 0;

}

function startNumber() {

    numberScore = 0;

    nextNumberQuestion();

}

function nextNumberQuestion() {

    const a =
        Math.floor(Math.random() * 20) + 1;

    const b =
        Math.floor(Math.random() * 20) + 1;

    const operations = [
        "+",
        "-"
    ];

    const operation =
        operations[
            Math.floor(
                Math.random() * operations.length
            )
        ];

    if (operation === "+") {
        numberAnswer = a + b;
    } else {
        numberAnswer = a - b;
    }

    $("numberQuestion").textContent =
        `${a} ${operation} ${b} = ?`;

    $("numberInstruction").textContent =
        "Correct answer-e tap koro.";

    createNumberOptions();

}


function createNumberOptions() {

    $("numberOptions").innerHTML = "";

    let options = new Set();

    options.add(numberAnswer);

    while (options.size < 4) {

        const variation =
            Math.floor(Math.random() * 11) - 5;

        options.add(
            numberAnswer + variation
        );

    }

    [...options]
        .sort(() => Math.random() - .5)
        .forEach(answer => {

            const button =
                document.createElement("button");

            button.className =
                "number-option";

            button.textContent =
                answer;

            button.addEventListener(
                "click",
                () => answerNumber(answer)
            );

            $("numberOptions")
                .appendChild(button);

        });

}


function answerNumber(answer) {

    if (answer === numberAnswer) {

        numberScore += 100;

        $("scoreDisplay").textContent =
            numberScore;

        nextNumberQuestion();

    } else {

        finishGame(
            numberScore,
            "Wrong answer!"
        );

    }

}


/* =========================================
   START BUTTON HANDLER
========================================= */

document.addEventListener("click", (event) => {

    const button =
        event.target.closest(".start-game");

    if (!button) return;

    const game =
        button.dataset.start;

    if (game === "reaction") {
        startReaction();
    }

    if (game === "target") {
        startTarget();
    }

    if (game === "memory") {
        startMemory();
    }

    if (game === "number") {
        startNumber();
    }

});


/* =========================================
   FINISH GAME
========================================= */

function finishGame(score, message) {

    stopCurrentGame();

    currentScore = score;

    $("finalScore").textContent =
        score;

    $("gameOverTitle").textContent =
        score > 0
            ? "GG! 🔥"
            : "Game Over";

    $("gameOverMessage").textContent =
        message;

    saveScore(
        playerName,
        currentGame,
        score
    );

    $("gameOverModal")
        .classList.remove("hidden");

}


/* =========================================
   STOP GAME
========================================= */

function stopCurrentGame() {

    clearTimeout(reactionTimeout);
    clearInterval(targetInterval);

    reactionReady = false;
    reactionStart = 0;

    if ($("targetCircle")) {
        $("targetCircle").style.display =
            "none";
    }

}


/* =========================================
   LEADERBOARD
========================================= */

function getScores() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "arcade_scores"
            )
        ) || [];

    } catch {

        return [];

    }

}


function saveScore(name, game, score) {

    const scores =
        getScores();

    scores.push({
        name,
        game,
        score,
        date: Date.now()
    });

    scores.sort(
        (a, b) => b.score - a.score
    );

    localStorage.setItem(
        "arcade_scores",
        JSON.stringify(scores.slice(0, 100))
    );

    renderLeaderboard("all");

}


function renderLeaderboard(filter) {

    const list =
        $("leaderboardList");

    list.innerHTML = "";

    let scores =
        getScores();

    if (filter !== "all") {

        scores =
            scores.filter(
                item => item.game === filter
            );

    }

    scores =
        scores
        .sort(
            (a, b) => b.score - a.score
        )
        .slice(0, 50);

    if (scores.length === 0) {

        list.innerHTML = `
            <div style="
                padding:50px 20px;
                text-align:center;
                color:#686873;
                font-size:13px;
            ">
                No scores yet.<br>
                Be the first one 🔥
            </div>
        `;

        return;

    }

    scores.forEach((item, index) => {

        const row =
            document.createElement("div");

        row.className =
            "leader-row";

        const gameNames = {
            reaction: "Reaction Rush",
            target: "Target Tap",
            memory: "Memory Match",
            number: "Number Rush"
        };

        row.innerHTML = `
            <div class="rank">
                #${index + 1}
            </div>

            <div>
                <div class="leader-name">
                    ${escapeHTML(item.name)}
                </div>

                <div class="leader-game">
                    ${gameNames[item.game] || item.game}
                </div>
            </div>

            <div class="leader-score">
                ${item.score}
            </div>
        `;

        list.appendChild(row);

    });

}


/* =========================================
   BASIC HTML ESCAPE
========================================= */

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
