"use strict";

/*
    GAMEHUB
    No Supabase.
    No external backend.
    Scores are stored in localStorage.
*/


/* =========================================
   ELEMENTS
========================================= */

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

const nameSection = document.getElementById("nameSection");
const playerNameInput = document.getElementById("playerNameInput");
const saveNameButton = document.getElementById("saveNameButton");
const nameError = document.getElementById("nameError");

const playerDisplay = document.getElementById("playerDisplay");

const gameTitle = document.getElementById("gameTitle");
const scoreDisplay = document.getElementById("scoreDisplay");

const backButton = document.getElementById("backButton");

const clickRushGame = document.getElementById("clickRushGame");
const reactionGame = document.getElementById("reactionGame");
const snakeGame = document.getElementById("snakeGame");

const scoreModal = document.getElementById("scoreModal");
const modalTitle = document.getElementById("modalTitle");
const modalScore = document.getElementById("modalScore");
const modalMenuButton = document.getElementById("modalMenuButton");
const modalReplayButton = document.getElementById("modalReplayButton");

const leaderboard = document.getElementById("leaderboard");
const clearScoresButton = document.getElementById("clearScoresButton");


/* =========================================
   GLOBAL STATE
========================================= */

let playerName =
    localStorage.getItem("gamehub_player_name") || "";

let currentGame = null;

let lastScore = 0;

let currentGameName = "";


/* =========================================
   GAME NAME HELPERS
========================================= */

const gameNames = {
    clickRush: "Click Rush",
    reaction: "Reaction Test",
    snake: "Snake"
};


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadPlayer();

    setupButtons();

    renderLeaderboard();

});


/* =========================================
   PLAYER NAME
========================================= */

function loadPlayer() {

    if (playerName) {

        playerDisplay.textContent =
            playerName.toUpperCase();

        nameSection.classList.add("saved");

        playerNameInput.value = playerName;

    } else {

        playerDisplay.textContent = "PLAYER";

    }

}


function savePlayerName() {

    const value =
        playerNameInput.value.trim();

    if (!value) {

        nameError.textContent =
            "Enter your name first.";

        playerNameInput.focus();

        return;

    }


    if (value.length < 2) {

        nameError.textContent =
            "Name must be at least 2 characters.";

        playerNameInput.focus();

        return;

    }


    playerName = value;

    localStorage.setItem(
        "gamehub_player_name",
        playerName
    );


    playerDisplay.textContent =
        playerName.toUpperCase();

    nameError.textContent = "";

}


saveNameButton.addEventListener(
    "click",
    savePlayerName
);


playerNameInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            savePlayerName();

        }

    }
);


/* =========================================
   BUTTON SETUP
========================================= */

function setupButtons() {

    document
        .querySelectorAll(".play-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const game =
                        button.dataset.game;

                    startGame(game);

                }
            );

        });


    backButton.addEventListener(
        "click",
        returnToMenu
    );


    modalMenuButton.addEventListener(
        "click",
        () => {

            closeModal();

            returnToMenu();

        }
    );


    modalReplayButton.addEventListener(
        "click",
        () => {

            closeModal();

            startGame(currentGame);

        }
    );


    clearScoresButton.addEventListener(
        "click",
        clearLeaderboard
    );


    setupClickRush();

    setupReaction();

    setupSnake();

}


/* =========================================
   START GAME
========================================= */

function startGame(game) {

    if (!playerName) {

        nameError.textContent =
            "Enter your name before playing.";

        playerNameInput.focus();

        return;

    }


    currentGame = game;

    currentGameName =
        gameNames[game] || "Game";


    menuScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");


    hideAllGames();


    gameTitle.textContent =
        currentGameName.toUpperCase();


    scoreDisplay.textContent =
        "SCORE: 0";


    if (game === "clickRush") {

        clickRushGame.classList.remove("hidden");

        resetClickRush();

    }


    else if (game === "reaction") {

        reactionGame.classList.remove("hidden");

        resetReaction();

    }


    else if (game === "snake") {

        snakeGame.classList.remove("hidden");

        resetSnake();

    }

}


function hideAllGames() {

    clickRushGame.classList.add("hidden");

    reactionGame.classList.add("hidden");

    snakeGame.classList.add("hidden");

}


function returnToMenu() {

    stopAllGames();

    closeModal();

    gameScreen.classList.add("hidden");

    menuScreen.classList.remove("hidden");

    renderLeaderboard();

}


/* =========================================
   MODAL
========================================= */

function showScoreModal(
    title,
    score
) {

    lastScore = score;

    modalTitle.textContent = title;

    modalScore.textContent = score;

    scoreModal.classList.remove("hidden");

}


function closeModal() {

    scoreModal.classList.add("hidden");

}


/* =========================================
   LEADERBOARD
========================================= */

function getScores() {

    try {

        const scores =
            JSON.parse(
                localStorage.getItem(
                    "gamehub_scores"
                )
            );

        return Array.isArray(scores)
            ? scores
            : [];

    } catch {

        return [];

    }

}


function saveScore(
    game,
    score
) {

    if (!playerName) return;

    const scores = getScores();


    scores.push({

        name: playerName,

        game: gameNames[game] || game,

        score: Number(score),

        date: Date.now()

    });


    scores.sort(
        (a, b) => b.score - a.score
    );


    /*
        Keep the top 50 scores.
    */

    const limited =
        scores.slice(0, 50);


    localStorage.setItem(
        "gamehub_scores",
        JSON.stringify(limited)
    );


    renderLeaderboard();

}


function renderLeaderboard() {

    const scores = getScores();


    if (!scores.length) {

        leaderboard.innerHTML = `
            <div class="leaderboard-empty">
                No scores yet.<br>
                Be the first one on the board.
            </div>
        `;

        return;

    }


    leaderboard.innerHTML =
        scores
            .slice(0, 10)
            .map((entry, index) => {

                let rankClass = "";

                if (index === 0) {
                    rankClass = "first";
                }

                else if (index === 1) {
                    rankClass = "second";
                }

                else if (index === 2) {
                    rankClass = "third";
                }


                return `
                    <div class="leader-row">

                        <div class="rank ${rankClass}">
                            #${index + 1}
                        </div>

                        <div class="leader-name">
                            ${escapeHTML(entry.name)}
                        </div>

                        <div class="leader-game">
                            ${escapeHTML(entry.game)}
                        </div>

                        <div class="leader-score">
                            ${entry.score}
                        </div>

                    </div>
                `;

            })
            .join("");

}


function clearLeaderboard() {

    const confirmed =
        confirm(
            "Clear all local leaderboard scores?"
        );


    if (!confirmed) return;


    localStorage.removeItem(
        "gamehub_scores"
    );


    renderLeaderboard();

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================
   CLICK RUSH
========================================= */

let clickScore = 0;
let clickTime = 10;
let clickTimer = null;
let clickStarted = false;


const clickTarget =
    document.getElementById("clickTarget");

const clickTimeDisplay =
    document.getElementById("clickTime");

const clickScoreDisplay =
    document.getElementById("clickScore");

const clickMessage =
    document.getElementById("clickMessage");

const clickRestart =
    document.getElementById("clickRestart");


function setupClickRush() {

    clickTarget.addEventListener(
        "click",
        handleClickRushClick
    );


    clickRestart.addEventListener(
        "click",
        resetClickRush
    );

}


function resetClickRush() {

    clearInterval(clickTimer);

    clickScore = 0;

    clickTime = 10;

    clickStarted = false;


    clickScoreDisplay.textContent =
        "0";

    clickTimeDisplay.textContent =
        "10";

    clickMessage.textContent =
        "Press the button to start.";

    clickTarget.textContent =
        "CLICK!";

    scoreDisplay.textContent =
        "SCORE: 0";

}


function handleClickRushClick() {

    if (!clickStarted) {

        startClickRushTimer();

    }


    if (clickTime <= 0) return;


    clickScore++;


    clickScoreDisplay.textContent =
        clickScore;

    scoreDisplay.textContent =
        "SCORE: " + clickScore;


    clickTarget.style.transform =
        "scale(.94)";


    setTimeout(() => {

        clickTarget.style.transform =
            "";

    }, 70);

}


function startClickRushTimer() {

    clickStarted = true;

    clickMessage.textContent =
        "GO! GO! GO!";

    clickTarget.textContent =
        "KEEP CLICKING";


    clickTimer = setInterval(
        () => {

            clickTime--;

            clickTimeDisplay.textContent =
                clickTime;


            if (clickTime <= 0) {

                finishClickRush();

            }

        },
        1000
    );

}


function finishClickRush() {

    clearInterval(clickTimer);

    clickTimer = null;

    clickStarted = false;


    clickTarget.textContent =
        "TIME!";


    clickMessage.textContent =
        `You got ${clickScore} clicks.`;


    saveScore(
        "clickRush",
        clickScore
    );


    showScoreModal(
        "Nice clicking!",
        clickScore
    );

}


/* =========================================
   REACTION TEST
========================================= */

let reactionState = "waiting";

let reactionTimeout = null;

let reactionStartTime = 0;

let reactionBestTime = null;


const reactionBox =
    document.getElementById("reactionBox");

const reactionText =
    document.getElementById("reactionText");

const reactionInstruction =
    document.getElementById(
        "reactionInstruction"
    );

const reactionBest =
    document.getElementById(
        "reactionBest"
    );

const reactionStart =
    document.getElementById(
        "reactionStart"
    );

const reactionRestart =
    document.getElementById(
        "reactionRestart"
    );


function setupReaction() {

    reactionStart.addEventListener(
        "click",
        startReaction
    );


    reactionRestart.addEventListener(
        "click",
        resetReaction
    );


    reactionBox.addEventListener(
        "click",
        handleReactionClick
    );

}


function resetReaction() {

    clearTimeout(reactionTimeout);

    reactionState = "waiting";

    reactionStartTime = 0;


    reactionBox.className =
        "reaction-box waiting";


    reactionText.textContent =
        "READY?";


    reactionInstruction.textContent =
        "Press start and wait for green.";


    reactionStart.disabled = false;

    reactionStart.textContent =
        "Start Test";


    reactionBest.textContent =
        reactionBestTime
            ? reactionBestTime + " ms"
            : "—";


    scoreDisplay.textContent =
        "SCORE: 0";

}


function startReaction() {

    clearTimeout(reactionTimeout);


    reactionState = "waiting";


    reactionBox.className =
        "reaction-box waiting";


    reactionText.textContent =
        "WAIT...";


    reactionInstruction.textContent =
        "Don't click until it turns green.";


    reactionStart.disabled = true;


    const delay =
        Math.floor(
            Math.random() * 3000
        ) + 1500;


    reactionTimeout =
        setTimeout(
            makeReactionReady,
            delay
        );

}


function makeReactionReady() {

    reactionState = "ready";

    reactionStartTime =
        performance.now();


    reactionBox.className =
        "reaction-box ready";


    reactionText.textContent =
        "CLICK!";


    reactionInstruction.textContent =
        "NOW!";

}


function handleReactionClick() {

    if (reactionState === "waiting") {

        /*
            If they click before green.
        */

        reactionState =
            "tooSoon";


        clearTimeout(
            reactionTimeout
        );


        reactionBox.className =
            "reaction-box too-soon";


        reactionText.textContent =
            "TOO SOON!";


        reactionInstruction.textContent =
            "You clicked too early.";


        reactionStart.disabled = false;


        return;

    }


    if (reactionState !== "ready") {

        return;

    }


    const reactionTime =
        Math.round(
            performance.now() -
            reactionStartTime
        );


    reactionState =
        "finished";


    reactionBox.className =
        "reaction-box waiting";


    reactionText.textContent =
        reactionTime + " MS";


    reactionInstruction.textContent =
        "That's your reaction time.";


    reactionStart.disabled = false;


    reactionStart.textContent =
        "Try Again";


    scoreDisplay.textContent =
        "SCORE: " + reactionTime + " MS";


    /*
        Lower reaction time is better,
        so leaderboard score uses an
        inverted score.
    */

    const leaderboardScore =
        Math.max(
            1,
            1000 - reactionTime
        );


    if (
        reactionBestTime === null ||
        reactionTime < reactionBestTime
    ) {

        reactionBestTime =
            reactionTime;

    }


    reactionBest.textContent =
        reactionBestTime + " ms";


    saveScore(
        "reaction",
        leaderboardScore
    );


    showScoreModal(
        "Lightning fast!",
        reactionTime + " ms"
    );

}


/* =========================================
   SNAKE
========================================= */

const snakeCanvas =
    document.getElementById(
        "snakeCanvas"
    );

const snakeContext =
    snakeCanvas.getContext("2d");


const snakeScoreDisplay =
    document.getElementById(
        "snakeScore"
    );

const snakeMessage =
    document.getElementById(
        "snakeMessage"
    );

const snakeRestart =
    document.getElementById(
        "snakeRestart"
    );


const gridSize = 20;

const tileSize =
    snakeCanvas.width / gridSize;


let snake = [];

let food = {
    x: 10,
    y: 10
};

let snakeDirection = {
    x: 1,
    y: 0
};

let nextDirection = {
    x: 1,
    y: 0
};

let snakeScore = 0;

let snakeTimer = null;

let snakeRunning = false;


/* =========================================
   SNAKE SETUP
========================================= */

function setupSnake() {

    snakeRestart.addEventListener(
        "click",
        resetSnake
    );


    document
        .querySelectorAll(
            ".control-button[data-direction]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    changeSnakeDirection(
                        button.dataset.direction
                    );

                }
            );

        });


    document.addEventListener(
        "keydown",
        handleSnakeKeyboard
    );


    drawSnake();

}


function resetSnake() {

    clearInterval(snakeTimer);


    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];


    snakeDirection = {
        x: 1,
        y: 0
    };


    nextDirection = {
        x: 1,
        y: 0
    };


    snakeScore = 0;

    snakeRunning = true;


    snakeScoreDisplay.textContent =
        "0";


    scoreDisplay.textContent =
        "SCORE: 0";


    snakeMessage.textContent =
        "Use the buttons or arrow keys.";


    placeFood();

    drawSnake();


    snakeTimer =
        setInterval(
            updateSnake,
            115
        );

}


function handleSnakeKeyboard(event) {

    if (
        !snakeRunning ||
        currentGame !== "snake"
    ) {

        return;

    }


    const key =
        event.key.toLowerCase();


    if (
        key === "arrowup" ||
        key === "w"
    ) {

        changeSnakeDirection("up");

    }

    else if (
        key === "arrowdown" ||
        key === "s"
    ) {

        changeSnakeDirection("down");

    }

    else if (
        key === "arrowleft" ||
        key === "a"
    ) {

        changeSnakeDirection("left");

    }

    else if (
        key === "arrowright" ||
        key === "d"
    ) {

        changeSnakeDirection("right");

    }

}


function changeSnakeDirection(direction) {

    if (!snakeRunning) return;


    const directions = {

        up: {
            x: 0,
            y: -1
        },

        down: {
            x: 0,
            y: 1
        },

        left: {
            x: -1,
            y: 0
        },

        right: {
            x: 1,
            y: 0
        }

    };


    const newDirection =
        directions[direction];


    if (!newDirection) return;


    /*
        Prevent immediate reversal.
    */

    if (
        newDirection.x ===
            -snakeDirection.x &&
        newDirection.y ===
            -snakeDirection.y
    ) {

        return;

    }


    nextDirection =
        newDirection;

}


function updateSnake() {

    if (!snakeRunning) return;


    snakeDirection =
        nextDirection;


    const head = {
        x:
            snake[0].x +
            snakeDirection.x,

        y:
            snake[0].y +
            snakeDirection.y
    };


    /*
        Wall collision.
    */

    if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
    ) {

        endSnake();

        return;

    }


    /*
        Body collision.
    */

    const hitsBody =
        snake.some(
            segment =>
                segment.x === head.x &&
                segment.y === head.y
        );


    if (hitsBody) {

        endSnake();

        return;

    }


    snake.unshift(head);


    /*
        Food collision.
    */

    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        snakeScore++;

        snakeScoreDisplay.textContent =
            snakeScore;

        scoreDisplay.textContent =
            "SCORE: " + snakeScore;


        placeFood();

    } else {

        snake.pop();

    }


    drawSnake();

}


function placeFood() {

    let valid = false;


    while (!valid) {

        food = {

            x:
                Math.floor(
                    Math.random() *
                    gridSize
                ),

            y:
                Math.floor(
                    Math.random() *
                    gridSize
                )

        };


        valid =
            !snake.some(
                segment =>
                    segment.x === food.x &&
                    segment.y === food.y
            );

    }

}


function drawSnake() {

    /*
        Background
    */

    snakeContext.fillStyle =
        "#080b09";

    snakeContext.fillRect(
        0,
        0,
        snakeCanvas.width,
        snakeCanvas.height
    );


    /*
        Subtle grid
    */

    snakeContext.strokeStyle =
        "rgba(255,255,255,.035)";

    snakeContext.lineWidth = 1;


    for (
        let i = 0;
        i <= gridSize;
        i++
    ) {

        const position =
            i * tileSize;


        snakeContext.beginPath();

        snakeContext.moveTo(
            position,
            0
        );

        snakeContext.lineTo(
            position,
            snakeCanvas.height
        );

        snakeContext.stroke();


        snakeContext.beginPath();

        snakeContext.moveTo(
            0,
            position
        );

        snakeContext.lineTo(
            snakeCanvas.width,
            position
        );

        snakeContext.stroke();

    }


    /*
        Food
    */

    snakeContext.fillStyle =
        "#ff5267";


    snakeContext.beginPath();

    snakeContext.arc(
        food.x * tileSize +
            tileSize / 2,

        food.y * tileSize +
            tileSize / 2,

        tileSize * .32,

        0,
        Math.PI * 2
    );

    snakeContext.fill();


    /*
        Snake
    */

    snake.forEach(
        (segment, index) => {

            const padding =
                index === 0
                    ? 2
                    : 3;


            snakeContext.fillStyle =
                index === 0
                    ? "#65ed9e"
                    : "#36bd76";


            snakeContext.beginPath();

            snakeContext.roundRect(
                segment.x *
                    tileSize +
                    padding,

                segment.y *
                    tileSize +
                    padding,

                tileSize -
                    padding * 2,

                tileSize -
                    padding * 2,

                5
            );

            snakeContext.fill();

        }
    );

}


function endSnake() {

    snakeRunning = false;

    clearInterval(snakeTimer);

    snakeTimer = null;


    snakeMessage.textContent =
        `Game over! Score: ${snakeScore}`;


    saveScore(
        "snake",
        snakeScore
    );


    showScoreModal(
        "Snake Over!",
        snakeScore
    );


    drawSnake();

}


/* =========================================
   STOP ALL GAMES
========================================= */

function stopAllGames() {

    /*
        Click Rush
    */

    clearInterval(clickTimer);

    clickTimer = null;

    clickStarted = false;


    /*
        Reaction
    */

    clearTimeout(
        reactionTimeout
    );

    reactionTimeout = null;


    /*
        Snake
    */

    clearInterval(snakeTimer);

    snakeTimer = null;

    snakeRunning = false;

}


/* =========================================
   PREVENT ACCIDENTAL PAGE ZOOM / SCROLL
   WHILE USING MOBILE GAME CONTROLS
========================================= */

document
    .querySelectorAll(".control-button")
    .forEach(button => {

        button.addEventListener(
            "touchstart",
            event => {

                event.preventDefault();

            },
            { passive: false }
        );

    });
