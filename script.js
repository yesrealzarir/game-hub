```javascript
/* =====================================================
   GAMEZONE
   No Supabase
   LocalStorage leaderboard
===================================================== */

"use strict";


/* =====================================================
   GLOBAL STATE
===================================================== */

let playerName = "";
let currentGame = null;

let gameTimer = null;
let animationFrame = null;

const scoresKey = "gamezone_leaderboard";


/* =====================================================
   DOM
===================================================== */

const menuScreen =
    document.getElementById("menuScreen");

const gameScreen =
    document.getElementById("gameScreen");

const nameModal =
    document.getElementById("nameModal");

const leaderboardModal =
    document.getElementById("leaderboardModal");

const playerNameInput =
    document.getElementById("playerNameInput");

const nameError =
    document.getElementById("nameError");

const gameContainer =
    document.getElementById("gameContainer");

const gameTitle =
    document.getElementById("gameTitle");

const gameScore =
    document.getElementById("gameScore");

const playerDisplay =
    document.getElementById("playerDisplay");


/* =====================================================
   PLAYER
===================================================== */

function openNameModal(game = null) {

    if (game) {
        currentGame = game;
    }

    nameError.textContent = "";

    nameModal.classList.remove("hidden");

    setTimeout(() => {
        playerNameInput.focus();
    }, 100);
}


function closeNameModal() {

    nameModal.classList.add("hidden");
}


function startPlayer() {

    const name =
        playerNameInput.value.trim();

    if (!name) {

        nameError.textContent =
            "Bro naam ta dao 😭";

        playerNameInput.focus();

        return;
    }

    if (name.length < 2) {

        nameError.textContent =
            "At least 2 characters.";

        return;
    }

    playerName = name.substring(0, 16);

    localStorage.setItem(
        "gamezone_player",
        playerName
    );

    playerDisplay.textContent =
        "PLAYER: " + playerName.toUpperCase();

    closeNameModal();

    if (currentGame) {
        startGame(currentGame);
    }
}


/* =====================================================
   MENU
===================================================== */

function goToMenu() {

    stopCurrentGame();

    gameScreen.classList.add("hidden");

    menuScreen.classList.remove("hidden");

    gameContainer.innerHTML = "";

    currentGame = null;
}


function startGame(game) {

    if (!playerName) {

        currentGame = game;

        openNameModal(game);

        return;
    }

    stopCurrentGame();

    menuScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    currentGame = game;

    if (game === "reaction") {
        startReactionGame();
    }

    else if (game === "tap") {
        startTapGame();
    }

    else if (game === "memory") {
        startMemoryGame();
    }

    else if (game === "dodger") {
        startDodgerGame();
    }
}


/* =====================================================
   GAME CLEANUP
===================================================== */

function stopCurrentGame() {

    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    window.onkeydown = null;

    document.querySelectorAll(
        ".game-event-listener"
    ).forEach(el => {
        el.replaceWith(el.cloneNode(true));
    });
}


/* =====================================================
   SCORE
===================================================== */

function setScore(score) {

    gameScore.textContent =
        "SCORE: " + Math.floor(score);
}


function saveScore(game, score) {

    score = Math.floor(score);

    if (score < 0) {
        score = 0;
    }

    const scores =
        JSON.parse(
            localStorage.getItem(scoresKey) || "[]"
        );

    scores.push({
        name: playerName || "Guest",
        game,
        score,
        date: Date.now()
    });

    scores.sort(
        (a, b) => b.score - a.score
    );

    scores.splice(20);

    localStorage.setItem(
        scoresKey,
        JSON.stringify(scores)
    );
}


/* =====================================================
   REACTION RUSH
===================================================== */

function startReactionGame() {

    gameTitle.textContent =
        "REACTION RUSH";

    setScore(0);

    gameContainer.innerHTML = `

        <div class="game-box">

            <h2>Reaction Rush</h2>

            <p>
                Screen green hole instantly click koro.
            </p>

            <div
                id="reactionArea"
                class="reaction-area waiting"
            >
                <div class="reaction-text">
                    CLICK TO START
                </div>
            </div>

        </div>

    `;

    const area =
        document.getElementById("reactionArea");

    let started = false;
    let ready = false;
    let startTime = 0;
    let timeout = null;

    area.addEventListener("click", () => {

        if (!started) {

            started = true;

            area.classList.remove("ready");

            area.classList.add("waiting");

            area.innerHTML = `
                <div class="reaction-text">
                    WAIT FOR GREEN...
                </div>
            `;

            const delay =
                1500 + Math.random() * 3000;

            timeout = setTimeout(() => {

                ready = true;

                startTime =
                    performance.now();

                area.classList.remove("waiting");

                area.classList.add("ready");

                area.innerHTML = `
                    <div class="reaction-text">
                        CLICK!!!
                    </div>
                `;

            }, delay);

            return;
        }


        if (!ready) {

            clearTimeout(timeout);

            area.classList.remove("waiting");

            area.classList.add("ready");

            area.innerHTML = `
                <div class="reaction-text">
                    TOO EARLY 😭<br>
                    CLICK TO TRY AGAIN
                </div>
            `;

            started = false;

            return;
        }


        const reaction =
            performance.now() - startTime;

        const score =
            Math.max(
                1,
                Math.round(
                    1000 / reaction * 100
                )
            );

        setScore(score);

        saveScore(
            "Reaction Rush",
            score
        );

        area.classList.remove("ready");

        area.innerHTML = `
            <div class="reaction-text">
                ${Math.round(reaction)} ms
                <br><br>
                Score: ${score}
                <br><br>
                CLICK TO PLAY AGAIN
            </div>
        `;

        started = false;
        ready = false;
    });
}


/* =====================================================
   TAP FRENZY
===================================================== */

function startTapGame() {

    gameTitle.textContent =
        "TAP FRENZY";

    setScore(0);

    gameContainer.innerHTML = `

        <div class="game-box">

            <h2>Tap Frenzy</h2>

            <p>
                10 seconds. Joto beshi tap, toto beshi score.
            </p>

            <div
                id="tapCountdown"
                class="tap-number"
            >
                10
            </div>

            <button
                id="tapButton"
                class="tap-button"
            >
                START
            </button>

        </div>

    `;

    const button =
        document.getElementById("tapButton");

    const countdown =
        document.getElementById("tapCountdown");

    let running = false;
    let taps = 0;
    let timeLeft = 10;

    button.addEventListener("click", () => {

        if (!running) {

            running = true;
            taps = 0;
            timeLeft = 10;

            button.textContent =
                "TAP!";

            countdown.textContent =
                timeLeft;

            setScore(0);

            gameTimer =
                setInterval(() => {

                    timeLeft--;

                    countdown.textContent =
                        timeLeft;

                    if (timeLeft <= 0) {

                        clearInterval(gameTimer);

                        gameTimer = null;

                        running = false;

                        button.textContent =
                            "DONE!";

                        countdown.textContent =
                            taps;

                        setScore(taps);

                        saveScore(
                            "Tap Frenzy",
                            taps
                        );

                        setTimeout(() => {

                            button.textContent =
                                "START AGAIN";

                        }, 700);
                    }

                }, 1000);

            return;
        }

        taps++;

        setScore(taps);
    });
}


/* =====================================================
   MEMORY MATCH
===================================================== */

function startMemoryGame() {

    gameTitle.textContent =
        "MEMORY MATCH";

    setScore(0);

    const emojis = [
        "🔥", "🔥",
        "⚡", "⚡",
        "🎮", "🎮",
        "🚀", "🚀",
        "👑", "👑",
        "💀", "💀",
        "🐐", "🐐",
        "🏆", "🏆"
    ];

    shuffle(emojis);

    gameContainer.innerHTML = `

        <div class="game-box">

            <h2>Memory Match</h2>

            <p>
                Same emoji pair find koro.
            </p>

            <div
                id="memoryGrid"
                class="memory-grid"
            ></div>

        </div>

    `;

    const grid =
        document.getElementById("memoryGrid");

    let first = null;
    let second = null;

    let locked = false;

    let moves = 0;
    let matches = 0;

    emojis.forEach((emoji, index) => {

        const card =
            document.createElement("button");

        card.className =
            "memory-card";

        card.dataset.value =
            emoji;

        card.dataset.index =
            index;

        card.textContent =
            emoji;

        card.addEventListener(
            "click",
            () => {

                if (
                    locked ||
                    card.classList.contains("matched") ||
                    card === first
                ) {
                    return;
                }

                card.classList.add("flipped");

                if (!first) {

                    first = card;

                    return;
                }

                second = card;

                moves++;

                locked = true;

                if (
                    first.dataset.value ===
                    second.dataset.value
                ) {

                    first.classList.add(
                        "matched"
                    );

                    second.classList.add(
                        "matched"
                    );

                    matches++;

                    locked = false;

                    first = null;
                    second = null;

                    setScore(
                        Math.max(
                            1,
                            1000 - moves * 30
                        )
                    );

                    if (matches === 8) {

                        const finalScore =
                            Math.max(
                                100,
                                1000 - moves * 30
                            );

                        setScore(finalScore);

                        saveScore(
                            "Memory Match",
                            finalScore
                        );

                        setTimeout(() => {

                            showGameOver(
                                "Memory Match Complete!",
                                finalScore
                            );

                        }, 400);
                    }

                } else {

                    setTimeout(() => {

                        first.classList.remove(
                            "flipped"
                        );

                        second.classList.remove(
                            "flipped"
                        );

                        first = null;
                        second = null;

                        locked = false;

                    }, 650);
                }
            }
        );

        grid.appendChild(card);
    });
}


/* =====================================================
   BLOCK DODGER
===================================================== */

function startDodgerGame() {

    gameTitle.textContent =
        "BLOCK DODGER";

    setScore(0);

    gameContainer.innerHTML = `

        <div class="game-box">

            <h2>Block Dodger</h2>

            <p>
                Falling blocks avoid koro.
            </p>

            <div
                id="dodgerArea"
                class="dodger-area"
            >

                <div
                    id="dodgerPlayer"
                    class="player"
                ></div>

            </div>

            <div class="dodger-controls">

                <button
                    id="leftBtn"
                    class="control-btn"
                >
                    ←
                </button>

                <button
                    id="rightBtn"
                    class="control-btn"
                >
                    →
                </button>

            </div>

        </div>

    `;

    const area =
        document.getElementById("dodgerArea");

    const player =
        document.getElementById("dodgerPlayer");

    let playerX = 50;

    let left = false;
    let right = false;

    let enemies = [];

    let score = 0;

    let running = true;

    function updatePlayer() {

        if (left) {
            playerX -= 1.3;
        }

        if (right) {
            playerX += 1.3;
        }

        playerX =
            Math.max(
                5,
                Math.min(95, playerX)
            );

        player.style.left =
            playerX + "%";
    }


    function createEnemy() {

        if (!running) return;

        const enemy =
            document.createElement("div");

        enemy.className =
            "enemy";

        enemy.style.left =
            Math.random() * 90 + "%";

        enemy.style.top =
            "-40px";

        area.appendChild(enemy);

        enemies.push({
            element: enemy,
            y: -40,
            speed:
                2.2 + Math.random() * 2
        });
    }


    function collision(a, b) {

        const ar =
            a.getBoundingClientRect();

        const br =
            b.getBoundingClientRect();

        return !(
            ar.right < br.left ||
            ar.left > br.right ||
            ar.bottom < br.top ||
            ar.top > br.bottom
        );
    }


    function loop() {

        if (!running) {
            return;
        }

        updatePlayer();

        enemies.forEach(enemy => {

            enemy.y += enemy.speed;

            enemy.element.style.top =
                enemy.y + "px";

            if (
                collision(
                    player,
                    enemy.element
                )
            ) {

                running = false;

                const finalScore =
                    Math.floor(score);

                setScore(finalScore);

                saveScore(
                    "Block Dodger",
                    finalScore
                );

                showGameOver(
                    "Game Over!",
                    finalScore
                );
            }
        });

        enemies =
            enemies.filter(enemy => {

                if (
                    enemy.y >
                    area.clientHeight + 50
                ) {

                    enemy.element.remove();

                    score += 10;

                    setScore(score);

                    return false;
                }

                return true;
            });

        animationFrame =
            requestAnimationFrame(loop);
    }


    gameTimer =
        setInterval(
            createEnemy,
            650
        );

    window.onkeydown =
        event => {

            if (
                event.key === "ArrowLeft" ||
                event.key.toLowerCase() === "a"
            ) {
                left = true;
            }

            if (
                event.key === "ArrowRight" ||
                event.key.toLowerCase() === "d"
            ) {
                right = true;
            }
        };


    window.onkeyup =
        event => {

            if (
                event.key === "ArrowLeft" ||
                event.key.toLowerCase() === "a"
            ) {
                left = false;
            }

            if (
                event.key === "ArrowRight" ||
                event.key.toLowerCase() === "d"
            ) {
                right = false;
            }
        };


    const leftBtn =
        document.getElementById("leftBtn");

    const rightBtn =
        document.getElementById("rightBtn");


    function pressLeft(e) {

        e.preventDefault();

        left = true;
    }

    function releaseLeft(e) {

        e.preventDefault();

        left = false;
    }

    function pressRight(e) {

        e.preventDefault();

        right = true;
    }

    function releaseRight(e) {

        e.preventDefault();

        right = false;
    }


    leftBtn.addEventListener(
        "pointerdown",
        pressLeft
    );

    leftBtn.addEventListener(
        "pointerup",
        releaseLeft
    );

    leftBtn.addEventListener(
        "pointercancel",
        releaseLeft
    );

    leftBtn.addEventListener(
        "pointerleave",
        releaseLeft
    );


    rightBtn.addEventListener(
        "pointerdown",
        pressRight
    );

    rightBtn.addEventListener(
        "pointerup",
        releaseRight
    );

    rightBtn.addEventListener(
        "pointercancel",
        releaseRight
    );

    rightBtn.addEventListener(
        "pointerleave",
        releaseRight
    );


    loop();
}


/* =====================================================
   GAME OVER
===================================================== */

function showGameOver(title, score) {

    const box =
        document.createElement("div");

    box.className =
        "game-over";

    box.innerHTML = `

        <h3>
            ${title}
        </h3>

        <p>
            ${playerName} — Score: ${score}
        </p>

        <button
            class="restart-btn"
            id="restartGameBtn"
        >
            PLAY AGAIN
        </button>

    `;

    gameContainer
        .querySelector(".game-box")
        .appendChild(box);

    document
        .getElementById("restartGameBtn")
        .addEventListener(
            "click",
            () => startGame(currentGame)
        );
}


/* =====================================================
   LEADERBOARD
===================================================== */

function openLeaderboard() {

    renderLeaderboard();

    leaderboardModal.classList.remove(
        "hidden"
    );
}


function closeLeaderboard() {

    leaderboardModal.classList.add(
        "hidden"
    );
}


function renderLeaderboard() {

    const list =
        document.getElementById(
            "leaderboardList"
        );

    const scores =
        JSON.parse(
            localStorage.getItem(scoresKey) || "[]"
        );

    list.innerHTML = "";

    if (!scores.length) {

        list.innerHTML = `
            <div class="leader-row">
                <div class="rank">—</div>
                <div>
                    <div class="leader-name">
                        No scores yet
                    </div>
                    <div class="leader-game">
                        Play a game first!
                    </div>
                </div>
                <div class="leader-score">
                    —
                </div>
            </div>
        `;

        return;
    }

    scores.forEach((entry, index) => {

        const row =
            document.createElement("div");

        row.className =
            "leader-row";

        row.innerHTML = `

            <div class="rank">
                #${index + 1}
            </div>

            <div>
                <div class="leader-name">
                    ${escapeHTML(entry.name)}
                </div>

                <div class="leader-game">
                    ${escapeHTML(entry.game)}
                </div>
            </div>

            <div class="leader-score">
                ${entry.score}
            </div>

        `;

        list.appendChild(row);
    });
}


/* =====================================================
   UTILITIES
===================================================== */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }

    return array;
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


/* =====================================================
   BUTTON EVENTS
===================================================== */

document
    .getElementById("letsPlayBtn")
    .addEventListener(
        "click",
        () => openNameModal()
    );


document
    .getElementById("startPlayerBtn")
    .addEventListener(
        "click",
        startPlayer
    );


playerNameInput
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                startPlayer();
            }
        }
    );


document
    .getElementById("closeNameModal")
    .addEventListener(
        "click",
        closeNameModal
    );


document
    .getElementById("backMenuBtn")
    .addEventListener(
        "click",
        goToMenu
    );


document
    .getElementById("leaderboardBtn")
    .addEventListener(
        "click",
        openLeaderboard
    );


document
    .getElementById("closeLeaderboard")
    .addEventListener(
        "click",
        closeLeaderboard
    );


document
    .getElementById("clearLeaderboard")
    .addEventListener(
        "click",
        () => {

            if (
                confirm(
                    "Clear all leaderboard scores?"
                )
            ) {

                localStorage.removeItem(
                    scoresKey
                );

                renderLeaderboard();
            }
        }
    );


/* =====================================================
   GAME BUTTONS
===================================================== */

document
    .querySelectorAll(".play-game-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const game =
                    button.dataset.game;

                startGame(game);
            }
        );
    });


/* =====================================================
   LOAD SAVED PLAYER
===================================================== */

const savedPlayer =
    localStorage.getItem(
        "gamezone_player"
    );

if (savedPlayer) {

    playerName = savedPlayer;

    playerDisplay.textContent =
        "PLAYER: " +
        playerName.toUpperCase();
}


/* =====================================================
   ESCAPE MODALS
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        closeNameModal();

        closeLeaderboard();
    }
);
```
