"use strict";

/* ==========================================
   GAMEHUB
   No Supabase.
   No external JavaScript libraries.
   ========================================== */


/* ==========================================
   GLOBAL STATE
========================================== */

let playerName = "";

const STORAGE_KEY = "gamehub_leaderboards_v1";

const games = [
    "circle",
    "reaction",
    "target",
    "memory"
];

let leaderboard = loadLeaderboard();

let currentScreen = "startScreen";


/* ==========================================
   DOM HELPERS
========================================== */

function $(id) {
    return document.getElementById(id);
}


function showScreen(id) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const screen = $(id);

    if (!screen) {
        console.error("Screen not found:", id);
        return;
    }

    screen.classList.add("active");

    currentScreen = id;

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}


function getPlayerName() {

    return playerName ||
        localStorage.getItem("gamehub_player") ||
        "PLAYER";
}


/* ==========================================
   LEADERBOARD STORAGE
========================================== */

function createEmptyLeaderboard() {

    return {
        circle: [],
        reaction: [],
        target: [],
        memory: []
    };
}


function loadLeaderboard() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return createEmptyLeaderboard();
        }

        const parsed = JSON.parse(saved);

        return {
            circle: Array.isArray(parsed.circle) ? parsed.circle : [],
            reaction: Array.isArray(parsed.reaction) ? parsed.reaction : [],
            target: Array.isArray(parsed.target) ? parsed.target : [],
            memory: Array.isArray(parsed.memory) ? parsed.memory : []
        };

    } catch (error) {

        console.error("Could not load leaderboard:", error);

        return createEmptyLeaderboard();
    }
}


function saveLeaderboard() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(leaderboard)
    );
}


/* ==========================================
   ADD SCORE
========================================== */

function addScore(game, score, extra = "") {

    if (!games.includes(game)) {
        return;
    }

    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
        return;
    }

    leaderboard[game].push({

        name: getPlayerName(),

        score: numericScore,

        extra: extra,

        date: new Date().toLocaleDateString()

    });

    sortLeaderboard(game);

    leaderboard[game] = leaderboard[game].slice(0, 50);

    saveLeaderboard();
}


function sortLeaderboard(game) {

    if (game === "reaction") {

        leaderboard[game].sort(
            (a, b) => a.score - b.score
        );

    } else {

        leaderboard[game].sort(
            (a, b) => b.score - a.score
        );
    }
}


/* ==========================================
   START SCREEN
========================================== */

function startGameHub() {

    const input = $("playerName");

    const error = $("nameError");

    const name = input.value.trim();

    if (!name) {

        error.textContent = "Enter your name first.";

        input.focus();

        return;
    }

    if (name.length < 2) {

        error.textContent = "Name must be at least 2 characters.";

        input.focus();

        return;
    }

    playerName = name;

    localStorage.setItem(
        "gamehub_player",
        playerName
    );

    error.textContent = "";

    $("menuPlayerName").textContent = playerName;

    showScreen("menuScreen");
}


$("startButton").addEventListener(
    "click",
    startGameHub
);


$("playerName").addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            startGameHub();
        }

    }
);


/* ==========================================
   GAME MENU
========================================== */

document.querySelectorAll(".game-button").forEach(button => {

    button.addEventListener("click", () => {

        const game = button.dataset.game;

        if (game === "circle") {
            openCircleGame();
        }

        else if (game === "reaction") {
            openReactionGame();
        }

        else if (game === "target") {
            openTargetGame();
        }

        else if (game === "memory") {
            openMemoryGame();
        }

    });

});


$("menuLeaderboardButton").addEventListener(
    "click",
    () => {

        renderLeaderboard("circle");

        showScreen("leaderboardScreen");

    }
);


$("menuBrand").addEventListener(
    "click",
    () => showScreen("menuScreen")
);


/* ==========================================
   BACK BUTTONS
========================================== */

document.querySelectorAll("[data-back]").forEach(button => {

    button.addEventListener("click", () => {

        const destination = button.dataset.back;

        if (destination === "menu") {

            stopAllGames();

            showScreen("menuScreen");

        }

    });

});


function stopAllGames() {

    stopReactionGame();

    stopTargetGame();

    stopMemoryGame();

    circleDrawing = false;
}


/* ==========================================
   PERFECT CIRCLE GAME
========================================== */

const circleCanvas = $("circleCanvas");

const circleCtx = circleCanvas.getContext("2d");

let circleDrawing = false;

let circlePoints = [];

let circleStartPoint = null;


function resizeCircleCanvas() {

    const rect = circleCanvas.getBoundingClientRect();

    const dpr = Math.max(
        1,
        Math.min(window.devicePixelRatio || 1, 2)
    );

    circleCanvas.width = Math.floor(rect.width * dpr);

    circleCanvas.height = Math.floor(rect.height * dpr);

    circleCtx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    clearCircleCanvas();
}


function clearCircleCanvas() {

    const rect = circleCanvas.getBoundingClientRect();

    circleCtx.clearRect(
        0,
        0,
        rect.width,
        rect.height
    );

    circlePoints = [];

    circleStartPoint = null;

    $("circleAccuracy").textContent = "—";

    $("circleRadius").textContent = "—";

    $("circlePoints").textContent = "0";

    $("circleResult").textContent = "";

    $("circleHint").style.display = "block";
}


function getCanvasPoint(event) {

    const rect = circleCanvas.getBoundingClientRect();

    let clientX;
    let clientY;

    if (event.touches && event.touches.length) {

        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;

    } else {

        clientX = event.clientX;
        clientY = event.clientY;

    }

    return {

        x: clientX - rect.left,

        y: clientY - rect.top

    };
}


function startCircleDrawing(event) {

    event.preventDefault();

    if (circleDrawing) {
        return;
    }

    circleDrawing = true;

    circlePoints = [];

    const point = getCanvasPoint(event);

    circleStartPoint = point;

    circlePoints.push(point);

    $("circleHint").style.display = "none";

    circleCtx.beginPath();

    circleCtx.moveTo(
        point.x,
        point.y
    );
}


function drawCircle(event) {

    if (!circleDrawing) {
        return;
    }

    event.preventDefault();

    const point = getCanvasPoint(event);

    circlePoints.push(point);

    circleCtx.lineTo(
        point.x,
        point.y
    );

    circleCtx.strokeStyle = "#9b7cff";

    circleCtx.lineWidth = 3;

    circleCtx.lineCap = "round";

    circleCtx.lineJoin = "round";

    circleCtx.stroke();
}


function stopCircleDrawing(event) {

    if (!circleDrawing) {
        return;
    }

    event.preventDefault();

    circleDrawing = false;

    finishCircle();
}


function finishCircle() {

    if (circlePoints.length < 15) {

        $("circleResult").textContent =
            "Draw a bigger, complete circle.";

        return;
    }

    const result = calculateCircleScore(
        circlePoints
    );

    $("circleAccuracy").textContent =
        result.accuracy + "%";

    $("circleRadius").textContent =
        Math.round(result.radius) + "px";

    $("circlePoints").textContent =
        result.score;

    $("circleResult").textContent =
        getCircleMessage(result.score);

    addScore(
        "circle",
        result.score,
        result.accuracy + "% accuracy"
    );

    drawPerfectCircleGuide(result);
}


function calculateCircleScore(points) {

    let centerX = 0;

    let centerY = 0;

    for (const point of points) {

        centerX += point.x;
        centerY += point.y;

    }

    centerX /= points.length;

    centerY /= points.length;


    const distances = points.map(point => {

        return Math.hypot(
            point.x - centerX,
            point.y - centerY
        );

    });


    const radius =
        distances.reduce(
            (sum, value) => sum + value,
            0
        ) / distances.length;


    let variance = 0;

    for (const distance of distances) {

        variance += Math.pow(
            distance - radius,
            2
        );

    }

    variance /= distances.length;


    const standardDeviation = Math.sqrt(
        variance
    );


    const radialError =
        radius > 0
            ? standardDeviation / radius
            : 1;


    const radialScore = Math.max(
        0,
        100 * (1 - radialError * 5)
    );


    let totalLength = 0;

    for (let i = 1; i < points.length; i++) {

        totalLength += Math.hypot(
            points[i].x - points[i - 1].x,
            points[i].y - points[i - 1].y
        );

    }


    const closureDistance = Math.hypot(
        points[points.length - 1].x - points[0].x,
        points[points.length - 1].y - points[0].y
    );


    const circumference =
        2 * Math.PI * radius;


    const lengthRatio =
        circumference > 0
            ? totalLength / circumference
            : 0;


    const lengthError =
        Math.abs(1 - lengthRatio);


    const lengthScore = Math.max(
        0,
        100 * (1 - lengthError * 2)
    );


    const closureRatio =
        radius > 0
            ? closureDistance / radius
            : 1;


    const closureScore = Math.max(
        0,
        100 * (1 - closureRatio * 2)
    );


    const score = Math.round(
        radialScore * .65 +
        lengthScore * .2 +
        closureScore * .15
    );


    return {

        score: Math.max(
            0,
            Math.min(100, score)
        ),

        accuracy: Math.max(
            0,
            Math.min(100, Math.round(radialScore))
        ),

        radius,

        centerX,

        centerY

    };
}


function getCircleMessage(score) {

    if (score >= 98) {
        return "PERFECT. Absolutely insane. 🏆";
    }

    if (score >= 95) {
        return "Almost perfect. That's seriously clean.";
    }

    if (score >= 90) {
        return "Excellent circle. You're getting dangerous.";
    }

    if (score >= 80) {
        return "Very solid. Try to make the radius more consistent.";
    }

    if (score >= 65) {
        return "Not bad. Keep your hand smoother.";
    }

    if (score >= 40) {
        return "That's technically a circle... probably. 💀";
    }

    return "Bro what shape is that 😭";
}


function drawPerfectCircleGuide(result) {

    circleCtx.save();

    circleCtx.beginPath();

    circleCtx.arc(
        result.centerX,
        result.centerY,
        result.radius,
        0,
        Math.PI * 2
    );

    circleCtx.strokeStyle =
        "rgba(255,255,255,.18)";

    circleCtx.lineWidth = 1;

    circleCtx.setLineDash([5, 8]);

    circleCtx.stroke();

    circleCtx.restore();
}


function openCircleGame() {

    showScreen("circleScreen");

    setTimeout(() => {

        resizeCircleCanvas();

        clearCircleCanvas();

    }, 50);
}


circleCanvas.addEventListener(
    "pointerdown",
    startCircleDrawing
);

circleCanvas.addEventListener(
    "pointermove",
    drawCircle
);

circleCanvas.addEventListener(
    "pointerup",
    stopCircleDrawing
);

circleCanvas.addEventListener(
    "pointercancel",
    stopCircleDrawing
);


$("circleClearButton").addEventListener(
    "click",
    clearCircleCanvas
);


$("circleFinishButton").addEventListener(
    "click",
    () => {

        if (circleDrawing) {

            circleDrawing = false;

            finishCircle();

        }

    }
);


window.addEventListener(
    "resize",
    () => {

        if (
            currentScreen === "circleScreen"
        ) {

            resizeCircleCanvas();

        }

    }
);


/* ==========================================
   REACTION TEST
========================================== */

let reactionState = "idle";

let reactionTimer = null;

let reactionStartTime = 0;


function openReactionGame() {

    showScreen("reactionScreen");

    stopReactionGame();

    $("reactionButton").className =
        "reaction-button waiting";

    $("reactionButton").textContent =
        "START";

    $("reactionInstruction").textContent =
        "Press START and wait for green.";

    $("reactionScore").textContent =
        "—";
}


function stopReactionGame() {

    if (reactionTimer) {

        clearTimeout(reactionTimer);

        reactionTimer = null;

    }

    reactionState = "idle";
}


$("reactionButton").addEventListener(
    "click",
    handleReactionClick
);


function handleReactionClick() {

    const button = $("reactionButton");

    if (reactionState === "idle") {

        reactionState = "waiting";

        button.className =
            "reaction-button waiting";

        button.textContent =
            "WAIT...";

        $("reactionInstruction").textContent =
            "Don't click until it turns green.";

        const delay =
            1500 + Math.random() * 4000;

        reactionTimer = setTimeout(() => {

            reactionState = "go";

            reactionStartTime =
                performance.now();

            button.className =
                "reaction-button go";

            button.textContent =
                "CLICK!";

            $("reactionInstruction").textContent =
                "NOW!";

        }, delay);

        return;
    }


    if (reactionState === "waiting") {

        if (reactionTimer) {

            clearTimeout(reactionTimer);

            reactionTimer = null;

        }

        reactionState = "idle";

        button.className =
            "reaction-button too-soon";

        button.textContent =
            "TOO SOON";

        $("reactionScore").textContent =
            "—";

        $("reactionInstruction").textContent =
            "You clicked too early. Try again.";

        return;
    }


    if (reactionState === "go") {

        const reaction =
            Math.round(
                performance.now() -
                reactionStartTime
            );

        reactionState = "idle";

        button.className =
            "reaction-button waiting";

        button.textContent =
            "AGAIN";

        $("reactionScore").textContent =
            reaction + " ms";

        $("reactionInstruction").textContent =
            getReactionMessage(reaction);

        addScore(
            "reaction",
            reaction
        );

    }

}


function getReactionMessage(ms) {

    if (ms < 180) {
        return "WHAT?! That's ridiculously fast. ⚡";
    }

    if (ms < 230) {
        return "Excellent reaction time.";
    }

    if (ms < 300) {
        return "Very good!";
    }

    if (ms < 400) {
        return "Pretty solid.";
    }

    if (ms < 550) {
        return "Average-ish. You can do better.";
    }

    return "Bro was AFK 💀";
}


/* ==========================================
   TARGET RUSH
========================================== */

let targetTimerInterval = null;

let targetRunning = false;

let targetTimeLeft = 30;

let targetScoreValue = 0;

let targetHitsValue = 0;


function openTargetGame() {

    showScreen("targetScreen");

    stopTargetGame();

    $("targetTimer").textContent = "30";

    $("targetScore").textContent = "0";

    $("targetHits").textContent = "0";

    $("targetStartOverlay").classList.remove(
        "hidden"
    );

    $("target").classList.add("hidden");
}


function stopTargetGame() {

    targetRunning = false;

    if (targetTimerInterval) {

        clearInterval(targetTimerInterval);

        targetTimerInterval = null;

    }

    $("target")?.classList.add("hidden");

}


$("targetStartButton").addEventListener(
    "click",
    startTargetGame
);


function startTargetGame() {

    targetRunning = true;

    targetTimeLeft = 30;

    targetScoreValue = 0;

    targetHitsValue = 0;

    $("targetTimer").textContent = "30";

    $("targetScore").textContent = "0";

    $("targetHits").textContent = "0";

    $("targetStartOverlay").classList.add(
        "hidden"
    );

    spawnTarget();

    targetTimerInterval = setInterval(() => {

        targetTimeLeft--;

        $("targetTimer").textContent =
            targetTimeLeft;

        if (targetTimeLeft <= 0) {

            finishTargetGame();

        }

    }, 1000);

}


function spawnTarget() {

    if (!targetRunning) {
        return;
    }

    const board = $("targetBoard");

    const target = $("target");

    const rect =
        board.getBoundingClientRect();

    const padding = 35;

    const x =
        padding +
        Math.random() *
        Math.max(
            10,
            rect.width - padding * 2
        );

    const y =
        padding +
        Math.random() *
        Math.max(
            10,
            rect.height - padding * 2
        );

    target.style.left =
        x + "px";

    target.style.top =
        y + "px";

    target.classList.remove(
        "hidden"
    );
}


$("target").addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        if (!targetRunning) {
            return;
        }

        targetHitsValue++;

        targetScoreValue +=
            10 +
            Math.max(
                0,
                targetTimeLeft
            );

        $("targetHits").textContent =
            targetHitsValue;

        $("targetScore").textContent =
            targetScoreValue;

        spawnTarget();

    }
);


function finishTargetGame() {

    if (!targetRunning) {
        return;
    }

    targetRunning = false;

    if (targetTimerInterval) {

        clearInterval(
            targetTimerInterval
        );

        targetTimerInterval = null;

    }

    $("target").classList.add(
        "hidden"
    );

    addScore(
        "target",
        targetScoreValue,
        targetHitsValue + " hits"
    );

    $("targetStartOverlay").classList.remove(
        "hidden"
    );

    $("targetStartOverlay").innerHTML = `

        <h2>TIME!</h2>

        <p>
            You scored
            <strong>${targetScoreValue}</strong>
            with ${targetHitsValue} hits.
        </p>

        <button id="targetRestartButton" class="primary-button">
            PLAY AGAIN →
        </button>
    `;

    $("targetRestartButton").addEventListener(
        "click",
        startTargetGame
    );

}


/* ==========================================
   MEMORY TILES
========================================== */

let memoryLevelValue = 1;

let memorySequence = [];

let memoryUserSequence = [];

let memoryAcceptingInput = false;


function openMemoryGame() {

    showScreen("memoryScreen");

    resetMemoryGame();

}


function resetMemoryGame() {

    memoryLevelValue = 1;

    memorySequence = [];

    memoryUserSequence = [];

    memoryAcceptingInput = false;

    $("memoryLevel").textContent = "1";

    $("memoryInstruction").textContent =
        "Press START LEVEL.";

    $("memoryStartButton").textContent =
        "START LEVEL";

    $("memoryResult").textContent = "";

    clearMemoryTiles();
}


function clearMemoryTiles() {

    document
        .querySelectorAll(".memory-tile")
        .forEach(tile => {

            tile.classList.remove(
                "active",
                "correct",
                "wrong"
            );

        });

}


$("memoryStartButton").addEventListener(
    "click",
    startMemoryLevel
);


function startMemoryLevel() {

    memoryAcceptingInput = false;

    memoryUserSequence = [];

    $("memoryStartButton").disabled =
        true;

    $("memoryResult").textContent = "";

    $("memoryLevel").textContent =
        memoryLevelValue;

    $("memoryInstruction").textContent =
        "Watch the pattern...";

    clearMemoryTiles();

    const newTile =
        Math.floor(
            Math.random() * 9
        );

    memorySequence.push(newTile);

    playMemorySequence();

}


async function playMemorySequence() {

    for (
        let i = 0;
        i < memorySequence.length;
        i++
    ) {

        await wait(350);

        const tile =
            document.querySelector(
                `.memory-tile[data-index="${memorySequence[i]}"]`
            );

        if (tile) {

            tile.classList.add("active");

            await wait(500);

            tile.classList.remove(
                "active"
            );

        }

    }

    await wait(250);

    memoryAcceptingInput = true;

    $("memoryStartButton").disabled =
        false;

    $("memoryStartButton").textContent =
        "RESTART LEVEL";

    $("memoryInstruction").textContent =
        "Your turn. Repeat the pattern.";

}


document.querySelectorAll(".memory-tile").forEach(tile => {

    tile.addEventListener(
        "click",
        () => {

            if (!memoryAcceptingInput) {
                return;
            }

            const index =
                Number(tile.dataset.index);

            memoryUserSequence.push(index);

            const position =
                memoryUserSequence.length - 1;

            if (
                memoryUserSequence[position] !==
                memorySequence[position]
            ) {

                tile.classList.add("wrong");

                finishMemoryGame(false);

                return;
            }

            tile.classList.add("correct");

            setTimeout(() => {

                tile.classList.remove(
                    "correct"
                );

            }, 180);


            if (
                memoryUserSequence.length ===
                memorySequence.length
            ) {

                memoryAcceptingInput = false;

                const points =
                    memoryLevelValue * 100;

                addScore(
                    "memory",
                    points,
                    "Level " +
                    memoryLevelValue
                );

                memoryLevelValue++;

                memoryUserSequence = [];

                $("memoryLevel").textContent =
                    memoryLevelValue;

                $("memoryInstruction").textContent =
                    "Correct! Next level...";

                setTimeout(() => {

                    $("memoryStartButton").disabled =
                        false;

                    startMemoryLevel();

                }, 700);

            }

        }
    );

});


function finishMemoryGame(won) {

    memoryAcceptingInput = false;

    const reached =
        memoryLevelValue;

    $("memoryInstruction").textContent =
        "Pattern broken.";

    $("memoryResult").textContent =
        `You reached level ${reached}.`;

    $("memoryStartButton").disabled =
        false;

    $("memoryStartButton").textContent =
        "TRY AGAIN";

    addScore(
        "memory",
        Math.max(
            1,
            (reached - 1) * 100
        ),
        "Level " + reached
    );

}


function wait(ms) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );

}


/* ==========================================
   LEADERBOARD UI
========================================== */

let activeLeaderboardGame =
    "circle";


function renderLeaderboard(game) {

    activeLeaderboardGame = game;

    document
        .querySelectorAll(".leader-tab")
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.board === game
            );

        });


    const list =
        $("leaderboardList");

    const entries =
        leaderboard[game] || [];


    if (!entries.length) {

        list.innerHTML = `

            <div class="empty-leaderboard">

                No records yet.<br>
                Play this game and become the first legend.

            </div>

        `;

        return;
    }


    list.innerHTML =
        entries
            .slice(0, 50)
            .map((entry, index) => {

                let displayScore;

                if (game === "reaction") {

                    displayScore =
                        entry.score + " ms";

                } else if (game === "circle") {

                    displayScore =
                        entry.score + "/100";

                } else {

                    displayScore =
                        entry.score;
                }


                return `

                    <div class="leader-row">

                        <div class="rank ${index < 3 ? "top" : ""}">
                            #${index + 1}
                        </div>

                        <div>

                            <div class="leader-name">
                                ${escapeHTML(entry.name)}
                            </div>

                            <div class="leader-date">
                                ${escapeHTML(entry.date)}
                                ${entry.extra
                                    ? " • " + escapeHTML(entry.extra)
                                    : ""
                                }
                            </div>

                        </div>

                        <div class="leader-score">
                            ${displayScore}
                        </div>

                    </div>

                `;

            })
            .join("");

}


document.querySelectorAll(".leader-tab").forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            renderLeaderboard(
                tab.dataset.board
            );

        }
    );

});


$("clearLeaderboardButton").addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Clear all local leaderboard records?"
            );

        if (!confirmed) {
            return;
        }

        leaderboard =
            createEmptyLeaderboard();

        saveLeaderboard();

        renderLeaderboard(
            activeLeaderboardGame
        );

    }
);


/* ==========================================
   HTML ESCAPE
========================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ==========================================
   INITIALIZATION
========================================== */

(function init() {

    const savedName =
        localStorage.getItem(
            "gamehub_player"
        );

    if (savedName) {

        playerName = savedName;

        $("playerName").value =
            savedName;

        $("menuPlayerName").textContent =
            savedName;

    }

})();
