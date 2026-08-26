/* =========================================================
   GAMEHUB
   No Supabase
   LocalStorage leaderboard
   PC + Mobile controls
========================================================= */


/* =========================================================
   PLAYER
========================================================= */

const PLAYER_KEY = "gamehub_player";
const SCORES_KEY = "gamehub_scores";

let playerName = localStorage.getItem(PLAYER_KEY) || "";

const playerNameDisplay = document.getElementById("playerNameDisplay");
const nameModal = document.getElementById("nameModal");
const playerNameInput = document.getElementById("playerNameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const changeNameBtn = document.getElementById("changeNameBtn");


function updatePlayerDisplay() {
    playerNameDisplay.textContent = playerName || "Player";
}


function showNameModal() {
    playerNameInput.value = playerName;
    nameModal.classList.add("show");

    setTimeout(() => {
        playerNameInput.focus();
    }, 100);
}


function savePlayerName() {

    const value = playerNameInput.value.trim();

    if (!value) {
        showToast("Enter a name first.");
        return;
    }

    playerName = value.substring(0, 18);

    localStorage.setItem(
        PLAYER_KEY,
        playerName
    );

    updatePlayerDisplay();

    nameModal.classList.remove("show");

    showToast("Name saved.");
}


saveNameBtn.addEventListener(
    "click",
    savePlayerName
);


playerNameInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            savePlayerName();
        }

    }
);


changeNameBtn.addEventListener(
    "click",
    showNameModal
);


updatePlayerDisplay();


if (!playerName) {
    setTimeout(showNameModal, 500);
}


/* =========================================================
   SCREENS
========================================================= */

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");

const gameContainers = {
    clickrush: document.getElementById("clickrushGame"),
    snake: document.getElementById("snakeGame"),
    dodge: document.getElementById("dodgeGame")
};

const gameTitles = {
    clickrush: "Click Rush",
    snake: "Snake",
    dodge: "Dodge"
};

let currentGame = null;


/* =========================================================
   GAME STATE
========================================================= */

let animationFrame = null;

let clickTimer = null;
let clickScore = 0;
let clickTime = 30;
let clickStarted = false;

let snakeState = null;

let dodgeState = null;


/* =========================================================
   GAME NAVIGATION
========================================================= */

document.querySelectorAll(".play-btn").forEach(button => {

    button.addEventListener("click", () => {

        const game = button.dataset.game;

        openGame(game);

    });

});


function openGame(game) {

    if (!gameContainers[game]) {
        console.error("Unknown game:", game);
        return;
    }

    stopCurrentGame();

    currentGame = game;

    homeScreen.classList.remove("active");
    gameScreen.classList.add("active");

    Object.values(gameContainers).forEach(container => {
        container.classList.remove("active");
    });

    gameContainers[game].classList.add("active");

    document.getElementById("activeGameLabel").textContent =
        "GAME 0" + Object.keys(gameTitles).indexOf(game) + 1;

    document.getElementById("activeGameTitle").textContent =
        gameTitles[game];

    document.getElementById("scoreDisplay").textContent = "0";

    document.getElementById("gameOverOverlay").classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (game === "clickrush") {
        startClickRush();
    }

    if (game === "snake") {
        startSnake();
    }

    if (game === "dodge") {
        startDodge();
    }
}


function backToMenu() {

    stopCurrentGame();

    currentGame = null;

    gameScreen.classList.remove("active");
    homeScreen.classList.add("active");

    document.getElementById("gameOverOverlay")
        .classList.add("hidden");

    renderLeaderboard();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


document.getElementById("backBtn")
    .addEventListener("click", backToMenu);


document.getElementById("overlayMenuBtn")
    .addEventListener("click", backToMenu);


/* =========================================================
   STOP GAME
========================================================= */

function stopCurrentGame() {

    if (clickTimer) {
        clearInterval(clickTimer);
        clickTimer = null;
    }

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    clickStarted = false;

    snakeState = null;
    dodgeState = null;
}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver(score, message = "Good game.") {

    stopCurrentGame();

    const finalScore =
        Math.max(0, Math.floor(score));

    document.getElementById("finalScore")
        .textContent = finalScore;

    document.getElementById("gameOverMessage")
        .textContent = message;

    document.getElementById("gameOverOverlay")
        .classList.remove("hidden");

    document.getElementById("scoreDisplay")
        .textContent = finalScore;

    saveScore(
        currentGame,
        finalScore
    );
}


/* =========================================================
   RETRY
========================================================= */

document.getElementById("retryBtn")
    .addEventListener("click", () => {

        if (!currentGame) {
            return;
        }

        openGame(currentGame);

    });


/* =========================================================
   CLICK RUSH
========================================================= */

const bigClickButton =
    document.getElementById("bigClickButton");

const clickTimeDisplay =
    document.getElementById("clickTime");

const clickScoreDisplay =
    document.getElementById("clickScore");

const clickMessage =
    document.getElementById("clickMessage");


function startClickRush() {

    clickScore = 0;
    clickTime = 30;
    clickStarted = false;

    clickScoreDisplay.textContent = "0";
    clickTimeDisplay.textContent = "30";
    clickMessage.textContent = "TAP TO START";

    bigClickButton.textContent = "TAP";
}


bigClickButton.addEventListener(
    "click",
    clickRushTap
);


function clickRushTap() {

    if (!clickStarted) {

        clickStarted = true;

        clickScore = 1;

        clickMessage.textContent =
            "KEEP GOING!";

        clickScoreDisplay.textContent =
            clickScore;

        clickTimer = setInterval(() => {

            clickTime--;

            clickTimeDisplay.textContent =
                clickTime;

            if (clickTime <= 0) {

                clearInterval(clickTimer);
                clickTimer = null;

                gameOver(
                    clickScore,
                    "You survived the full 30 seconds."
                );

            }

        }, 1000);

        return;
    }


    clickScore++;

    clickScoreDisplay.textContent =
        clickScore;

    document.getElementById("scoreDisplay")
        .textContent = clickScore;
}


/* =========================================================
   SNAKE
========================================================= */

const snakeCanvas =
    document.getElementById("snakeCanvas");

const snakeCtx =
    snakeCanvas.getContext("2d");

const snakeScoreDisplay =
    document.getElementById("snakeScore");

const snakeBestDisplay =
    document.getElementById("snakeBest");


const SNAKE_SIZE = 20;
const SNAKE_COLS = 25;
const SNAKE_ROWS = 25;

let snakeLastTime = 0;
let snakeMoveTimer = 0;


function startSnake() {

    const best =
        Number(localStorage.getItem("gamehub_snake_best") || 0);

    snakeBestDisplay.textContent = best;

    snakeState = {

        snake: [
            { x: 12, y: 12 },
            { x: 11, y: 12 },
            { x: 10, y: 12 }
        ],

        direction: {
            x: 1,
            y: 0
        },

        nextDirection: {
            x: 1,
            y: 0
        },

        food: randomSnakeFood(),

        score: 0,

        alive: true

    };

    snakeScoreDisplay.textContent = "0";

    snakeLastTime = performance.now();
    snakeMoveTimer = 0;

    animationFrame =
        requestAnimationFrame(snakeLoop);

}


function randomSnakeFood() {

    let food;

    do {

        food = {
            x: Math.floor(Math.random() * SNAKE_COLS),
            y: Math.floor(Math.random() * SNAKE_ROWS)
        };

    } while (
        snakeState &&
        snakeState.snake.some(
            part =>
                part.x === food.x &&
                part.y === food.y
        )
    );

    return food;
}


function snakeLoop(timestamp) {

    if (!snakeState || !snakeState.alive) {
        return;
    }

    const delta =
        timestamp - snakeLastTime;

    snakeLastTime = timestamp;

    snakeMoveTimer += delta;

    if (snakeMoveTimer >= 105) {

        snakeMoveTimer = 0;

        updateSnake();
    }

    drawSnake();

    animationFrame =
        requestAnimationFrame(snakeLoop);
}


function updateSnake() {

    const state = snakeState;

    state.direction = {
        ...state.nextDirection
    };

    const head = state.snake[0];

    const newHead = {

        x: head.x + state.direction.x,
        y: head.y + state.direction.y

    };


    if (
        newHead.x < 0 ||
        newHead.x >= SNAKE_COLS ||
        newHead.y < 0 ||
        newHead.y >= SNAKE_ROWS
    ) {

        endSnake();

        return;
    }


    const eating =
        newHead.x === state.food.x &&
        newHead.y === state.food.y;


    const bodyToCheck =
        eating
            ? state.snake
            : state.snake.slice(0, -1);


    if (
        bodyToCheck.some(
            part =>
                part.x === newHead.x &&
                part.y === newHead.y
        )
    ) {

        endSnake();

        return;
    }


    state.snake.unshift(newHead);


    if (eating) {

        state.score++;

        state.food =
            randomSnakeFood();

        snakeScoreDisplay.textContent =
            state.score;

        document.getElementById("scoreDisplay")
            .textContent = state.score;

    } else {

        state.snake.pop();

    }

}


function drawSnake() {

    const state = snakeState;

    snakeCtx.fillStyle = "#06070a";

    snakeCtx.fillRect(
        0,
        0,
        snakeCanvas.width,
        snakeCanvas.height
    );


    /* grid */

    snakeCtx.strokeStyle =
        "rgba(255,255,255,.035)";

    snakeCtx.lineWidth = 1;

    for (let x = 0; x <= 25; x++) {

        snakeCtx.beginPath();

        snakeCtx.moveTo(
            x * SNAKE_SIZE,
            0
        );

        snakeCtx.lineTo(
            x * SNAKE_SIZE,
            500
        );

        snakeCtx.stroke();

    }


    for (let y = 0; y <= 25; y++) {

        snakeCtx.beginPath();

        snakeCtx.moveTo(
            0,
            y * SNAKE_SIZE
        );

        snakeCtx.lineTo(
            500,
            y * SNAKE_SIZE
        );

        snakeCtx.stroke();

    }


    /* food */

    snakeCtx.fillStyle = "#ff5570";

    snakeCtx.beginPath();

    snakeCtx.arc(
        state.food.x * SNAKE_SIZE + 10,
        state.food.y * SNAKE_SIZE + 10,
        7,
        0,
        Math.PI * 2
    );

    snakeCtx.fill();


    /* snake */

    state.snake.forEach(
        (part, index) => {

            snakeCtx.fillStyle =
                index === 0
                    ? "#b89fff"
                    : "#7858db";

            snakeCtx.fillRect(
                part.x * SNAKE_SIZE + 2,
                part.y * SNAKE_SIZE + 2,
                SNAKE_SIZE - 4,
                SNAKE_SIZE - 4
            );

        }
    );

}


function endSnake() {

    if (!snakeState) {
        return;
    }

    snakeState.alive = false;

    const score = snakeState.score;

    const best =
        Number(
            localStorage.getItem(
                "gamehub_snake_best"
            ) || 0
        );

    if (score > best) {

        localStorage.setItem(
            "gamehub_snake_best",
            score
        );

        snakeBestDisplay.textContent =
            score;

    }

    gameOver(
        score,
        score > best
            ? "NEW PERSONAL BEST!"
            : "The snake met its destiny."
    );
}


/* =========================================================
   SNAKE CONTROLS
========================================================= */

function changeSnakeDirection(dir) {

    if (!snakeState || !snakeState.alive) {
        return;
    }

    const directions = {

        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }

    };

    const next = directions[dir];

    if (!next) {
        return;
    }


    const current =
        snakeState.direction;


    if (
        current.x + next.x === 0 &&
        current.y + next.y === 0
    ) {
        return;
    }


    snakeState.nextDirection = next;
}


document.querySelectorAll(
    ".snake-controls button"
).forEach(button => {

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            changeSnakeDirection(
                button.dataset.dir
            );

        }
    );

});


document.addEventListener(
    "keydown",
    event => {

        if (
            currentGame !== "snake" ||
            !snakeState
        ) {
            return;
        }

        const key = event.key.toLowerCase();

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                "w",
                "a",
                "s",
                "d"
            ].includes(key)
        ) {
            event.preventDefault();
        }


        if (
            key === "arrowup" ||
            key === "w"
        ) {
            changeSnakeDirection("up");
        }

        if (
            key === "arrowdown" ||
            key === "s"
        ) {
            changeSnakeDirection("down");
        }

        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            changeSnakeDirection("left");
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {
            changeSnakeDirection("right");
        }

    }
);


/* =========================================================
   DODGE
========================================================= */

const dodgeCanvas =
    document.getElementById("dodgeCanvas");

const dodgeCtx =
    dodgeCanvas.getContext("2d");

const dodgeScoreDisplay =
    document.getElementById("dodgeScore");

const dodgeBestDisplay =
    document.getElementById("dodgeBest");


function startDodge() {

    const best =
        Number(
            localStorage.getItem(
                "gamehub_dodge_best"
            ) || 0
        );

    dodgeBestDisplay.textContent = best;


    dodgeState = {

        player: {
            x: 250,
            y: 540,
            width: 42,
            height: 20,
            speed: 7
        },

        blocks: [],

        score: 0,

        spawnTimer: 0,

        speed: 3,

        left: false,

        right: false,

        alive: true,

        lastTime: performance.now()

    };


    dodgeScoreDisplay.textContent = "0";

    animationFrame =
        requestAnimationFrame(dodgeLoop);
}


function dodgeLoop(timestamp) {

    if (!dodgeState || !dodgeState.alive) {
        return;
    }

    const state = dodgeState;

    const delta =
        Math.min(
            timestamp - state.lastTime,
            50
        );

    state.lastTime = timestamp;


    updateDodge(delta);

    drawDodge();


    animationFrame =
        requestAnimationFrame(dodgeLoop);
}


function updateDodge(delta) {

    const state = dodgeState;

    const seconds =
        delta / 1000;


    if (state.left) {
        state.player.x -=
            state.player.speed * 60 * seconds;
    }

    if (state.right) {
        state.player.x +=
            state.player.speed * 60 * seconds;
    }


    state.player.x =
        Math.max(
            0,
            Math.min(
                dodgeCanvas.width -
                    state.player.width,
                state.player.x
            )
        );


    state.spawnTimer += delta;


    const spawnRate =
        Math.max(
            260,
            700 - state.score * 5
        );


    if (state.spawnTimer >= spawnRate) {

        state.spawnTimer = 0;

        state.blocks.push({

            x:
                Math.random() *
                (dodgeCanvas.width - 32),

            y: -40,

            width:
                22 +
                Math.random() * 22,

            height:
                22 +
                Math.random() * 22,

            speed:
                state.speed +
                Math.random() * 2

        });

    }


    state.blocks.forEach(block => {

        block.y +=
            block.speed *
            60 *
            seconds;

    });


    state.blocks =
        state.blocks.filter(
            block =>
                block.y <
                dodgeCanvas.height + 60
        );


    state.score +=
        seconds * 10;

    const shownScore =
        Math.floor(state.score);

    dodgeScoreDisplay.textContent =
        shownScore;

    document.getElementById("scoreDisplay")
        .textContent = shownScore;


    state.speed +=
        seconds * 0.035;


    for (const block of state.blocks) {

        if (
            rectangleCollision(
                state.player,
                block
            )
        ) {

            endDodge();

            return;
        }

    }

}


function rectangleCollision(a, b) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );
}


function drawDodge() {

    const state = dodgeState;

    dodgeCtx.fillStyle = "#050609";

    dodgeCtx.fillRect(
        0,
        0,
        dodgeCanvas.width,
        dodgeCanvas.height
    );


    /* stars */

    dodgeCtx.fillStyle =
        "rgba(255,255,255,.18)";

    for (
        let i = 0;
        i < 50;
        i++
    ) {

        const x =
            (i * 97) %
            dodgeCanvas.width;

        const y =
            (i * 173 +
                Math.floor(state.score * 2)) %
            dodgeCanvas.height;

        dodgeCtx.fillRect(
            x,
            y,
            2,
            2
        );

    }


    /* blocks */

    state.blocks.forEach(block => {

        dodgeCtx.fillStyle = "#ff5570";

        dodgeCtx.shadowColor =
            "rgba(255,85,112,.35)";

        dodgeCtx.shadowBlur = 15;

        dodgeCtx.fillRect(
            block.x,
            block.y,
            block.width,
            block.height
        );

        dodgeCtx.shadowBlur = 0;

    });


    /* player */

    dodgeCtx.fillStyle = "#9b7cff";

    dodgeCtx.shadowColor =
        "rgba(155,124,255,.45)";

    dodgeCtx.shadowBlur = 20;

    dodgeCtx.fillRect(
        state.player.x,
        state.player.y,
        state.player.width,
        state.player.height
    );

    dodgeCtx.shadowBlur = 0;


    /* player center */

    dodgeCtx.fillStyle = "#e6ddff";

    dodgeCtx.fillRect(
        state.player.x + 12,
        state.player.y + 5,
        18,
        5
    );

}


function endDodge() {

    if (!dodgeState) {
        return;
    }

    dodgeState.alive = false;

    const score =
        Math.floor(dodgeState.score);

    const best =
        Number(
            localStorage.getItem(
                "gamehub_dodge_best"
            ) || 0
        );

    if (score > best) {

        localStorage.setItem(
            "gamehub_dodge_best",
            score
        );

        dodgeBestDisplay.textContent =
            score;

    }

    gameOver(
        score,
        score > best
            ? "NEW PERSONAL BEST!"
            : "Those blocks got you."
    );
}


/* =========================================================
   DODGE CONTROLS
========================================================= */

function setDodgeDirection(direction, value) {

    if (!dodgeState) {
        return;
    }

    if (direction === "left") {
        dodgeState.left = value;
    }

    if (direction === "right") {
        dodgeState.right = value;
    }
}


function setupDodgeButton(id, direction) {

    const button =
        document.getElementById(id);

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            setDodgeDirection(
                direction,
                true
            );

        }
    );

    button.addEventListener(
        "pointerup",
        () => {

            setDodgeDirection(
                direction,
                false
            );

        }
    );

    button.addEventListener(
        "pointerleave",
        () => {

            setDodgeDirection(
                direction,
                false
            );

        }
    );

    button.addEventListener(
        "pointercancel",
        () => {

            setDodgeDirection(
                direction,
                false
            );

        }
    );

}


setupDodgeButton(
    "dodgeLeft",
    "left"
);

setupDodgeButton(
    "dodgeRight",
    "right"
);


document.addEventListener(
    "keydown",
    event => {

        if (
            currentGame !== "dodge" ||
            !dodgeState
        ) {
            return;
        }

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            event.preventDefault();

            dodgeState.left = true;

        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {

            event.preventDefault();

            dodgeState.right = true;

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            !dodgeState
        ) {
            return;
        }

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            dodgeState.left = false;

        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {

            dodgeState.right = false;

        }

    }
);


/* =========================================================
   LEADERBOARD
========================================================= */

function getScores() {

    try {

        return JSON.parse(
            localStorage.getItem(
                SCORES_KEY
            ) || "[]"
        );

    } catch {

        return [];

    }
}


function saveScore(game, score) {

    if (!playerName) {
        playerName = "Player";
    }

    const scores =
        getScores();

    scores.push({

        name: playerName,

        game: gameTitles[game] || game,

        score: Math.floor(score),

        date: Date.now()

    });


    scores.sort(
        (a, b) =>
            b.score - a.score
    );


    const trimmed =
        scores.slice(0, 50);


    localStorage.setItem(
        SCORES_KEY,
        JSON.stringify(trimmed)
    );

}


function renderLeaderboard() {

    const body =
        document.getElementById(
            "leaderboardBody"
        );

    const scores =
        getScores();


    body.innerHTML = "";


    if (!scores.length) {

        body.innerHTML = `
            <div class="empty-leaderboard">
                No scores yet. Be the first one on the board.
            </div>
        `;

        return;
    }


    scores.slice(0, 10)
        .forEach((entry, index) => {

            const row =
                document.createElement("div");

            row.className =
                "leader-row";

            row.innerHTML = `

                <span class="rank ${
                    index < 3
                        ? "top"
                        : ""
                }">
                    ${index + 1}
                </span>

                <span class="leader-name">
                    ${escapeHTML(entry.name)}
                </span>

                <span class="leader-game">
                    ${escapeHTML(entry.game)}
                </span>

                <span class="leader-score">
                    ${Number(entry.score).toLocaleString()}
                </span>

            `;

            body.appendChild(row);

        });

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


renderLeaderboard();


/* =========================================================
   CLEAR LEADERBOARD
========================================================= */

document.getElementById(
    "clearScoresBtn"
).addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Clear all local leaderboard scores?"
            );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            SCORES_KEY
        );

        renderLeaderboard();

        showToast(
            "Leaderboard cleared."
        );

    }
);


/* =========================================================
   TOAST
========================================================= */

let toastTimeout = null;

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2200);

}


/* =========================================================
   PREVENT ACCIDENTAL DOUBLE-TAP ZOOM
   ON GAME CONTROLS
========================================================= */

document.querySelectorAll(
    "button"
).forEach(button => {

    button.addEventListener(
        "touchstart",
        event => {

            if (
                button.classList.contains(
                    "big-click-button"
                ) ||
                button.closest(
                    ".mobile-controls"
                )
            ) {
                event.preventDefault();
            }

        },
        {
            passive: false
        }
    );

});
