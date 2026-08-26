/* =========================================
   VOID ARCADE
   NO SUPABASE
   LOCALSTORAGE ONLY
========================================= */

let player =
    localStorage.getItem("void_arcade_player") || "";

let currentLeaderboard = "reaction";

let gameRunning = false;
let animationFrame = null;


/* =========================================
   PLAYER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    updatePlayerUI();

    if (!player) {
        setTimeout(() => {
            openPlayerModal();
        }, 500);
    }

    showLeaderboard("reaction");

});


function updatePlayerUI() {

    const name =
        player || "Player";

    document.getElementById("navPlayer").textContent =
        name;

    document.getElementById("playerAvatar").textContent =
        name.charAt(0).toUpperCase() || "?";
}


function openPlayerModal() {

    const modal =
        document.getElementById("playerModal");

    modal.classList.add("show");

    setTimeout(() => {

        document
            .getElementById("playerInput")
            .focus();

    }, 100);

}


function closePlayerModal() {

    document
        .getElementById("playerModal")
        .classList.remove("show");

}


function savePlayer() {

    const input =
        document.getElementById("playerInput");

    const name =
        input.value.trim();

    if (!name) {
        input.focus();
        return;
    }

    player = name;

    localStorage.setItem(
        "void_arcade_player",
        player
    );

    updatePlayerUI();

    closePlayerModal();

}


function changePlayer() {

    document
        .getElementById("playerInput")
        .value = player;

    openPlayerModal();

}


function handleNameKey(event) {

    if (event.key === "Enter") {
        savePlayer();
    }

}


/* =========================================
   LEADERBOARD STORAGE
========================================= */

function getScores(game) {

    return JSON.parse(
        localStorage.getItem(
            "void_scores_" + game
        ) || "[]"
    );

}


function saveScore(game, score) {

    if (!player) {
        openPlayerModal();
        return;
    }

    const scores = getScores(game);

    scores.push({
        name: player,
        score: Math.round(score),
        date: Date.now()
    });

    scores.sort((a, b) =>
        b.score - a.score
    );

    const topScores =
        scores.slice(0, 20);

    localStorage.setItem(
        "void_scores_" + game,
        JSON.stringify(topScores)
    );

    showLeaderboard(game);

}


function showLeaderboard(game, clickedButton) {

    currentLeaderboard = game;

    const tabs =
        document.querySelectorAll(".tab");

    tabs.forEach(tab =>
        tab.classList.remove("active")
    );

    if (clickedButton) {
        clickedButton.classList.add("active");
    } else {

        const index = {
            reaction: 0,
            dodge: 1,
            space: 2
        }[game];

        if (tabs[index]) {
            tabs[index].classList.add("active");
        }
    }

    const list =
        document.getElementById(
            "leaderboardList"
        );

    const scores =
        getScores(game);

    if (!scores.length) {

        list.innerHTML = `
            <div class="empty">
                No scores yet.<br>
                Be the first legend. 🏆
            </div>
        `;

        return;
    }

    list.innerHTML =
        scores.map((entry, index) => {

            let rankClass =
                index < 3 ? "top" : "";

            return `
                <div class="score-row">

                    <span class="rank ${rankClass}">
                        ${index + 1}
                    </span>

                    <span class="score-name">
                        ${escapeHTML(entry.name)}
                    </span>

                    <span class="score-value">
                        ${entry.score}
                    </span>

                </div>
            `;

        }).join("");

}


function clearScores() {

    const confirmReset =
        confirm(
            "Reset ALL local leaderboard scores?"
        );

    if (!confirmReset) return;

    ["reaction", "dodge", "space"]
        .forEach(game => {

            localStorage.removeItem(
                "void_scores_" + game
            );

        });

    showLeaderboard(
        currentLeaderboard
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================
   GAME MODAL
========================================= */

function openGame(game) {

    document
        .getElementById("gameModal")
        .classList.add("show");

    if (game === "reaction") {
        startReactionGame();
    }

    if (game === "dodge") {
        startDodgeGame();
    }

    if (game === "space") {
        startSpaceGame();
    }

}


function closeGame() {

    gameRunning = false;

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    document
        .getElementById("gameModal")
        .classList.remove("show");

}


/* =========================================
   REACTION RUSH
========================================= */

function startReactionGame() {

    gameRunning = false;

    document.getElementById("gameContent").innerHTML = `

        <div class="game-title">
            Reaction Rush ⚡
        </div>

        <div class="game-subtitle">
            Click when the circle turns green.
        </div>

        <div class="reaction-area">

            <div
                id="reactionTarget"
                class="reaction-target">
                START
            </div>

        </div>

        <div class="game-controls">

            <span id="reactionStatus">
                Get ready...
            </span>

            <span id="reactionScore">
                —
            </span>

        </div>
    `;

    const target =
        document.getElementById(
            "reactionTarget"
        );

    target.onclick = () => {

        if (!gameRunning) {

            startReactionRound();

        } else {

            finishReactionRound();

        }

    };

}


function startReactionRound() {

    const target =
        document.getElementById(
            "reactionTarget"
        );

    const status =
        document.getElementById(
            "reactionStatus"
        );

    target.textContent =
        "WAIT...";

    target.classList.remove("ready");

    status.textContent =
        "Wait for green...";

    gameRunning = true;

    const delay =
        1200 + Math.random() * 3500;

    setTimeout(() => {

        if (!gameRunning) return;

        target.classList.add("ready");

        target.textContent =
            "CLICK!";

        status.textContent =
            "NOW!";

        target.dataset.start =
            performance.now();

    }, delay);

}


function finishReactionRound() {

    const target =
        document.getElementById(
            "reactionTarget"
        );

    const status =
        document.getElementById(
            "reactionStatus"
        );

    if (!target.classList.contains("ready")) {

        status.textContent =
            "Too early! Try again.";

        gameRunning = false;

        target.textContent =
            "START";

        return;
    }

    const reaction =
        performance.now() -
        Number(target.dataset.start);

    gameRunning = false;

    target.classList.remove("ready");

    target.textContent =
        Math.round(reaction) + "ms";

    document
        .getElementById("reactionScore")
        .textContent =
        Math.round(reaction) + " ms";

    status.textContent =
        "Great! Lower is better.";

    /*
        Leaderboard sorts high to low,
        so convert reaction time
        into a score.
    */

    const score =
        Math.max(
            1,
            5000 - Math.round(reaction)
        );

    saveScore(
        "reaction",
        score
    );

    setTimeout(() => {

        if (
            document
                .getElementById("gameModal")
                .classList.contains("show")
        ) {

            target.textContent =
                "TRY AGAIN";

        }

    }, 1000);

}


/* =========================================
   NEON DODGE
========================================= */

function startDodgeGame() {

    gameRunning = true;

    document.getElementById("gameContent").innerHTML = `

        <div class="game-title">
            Neon Dodge ◆
        </div>

        <div class="game-subtitle">
            Move with WASD or arrow keys. Survive.
        </div>

        <canvas
            id="dodgeCanvas"
            width="640"
            height="360">
        </canvas>

        <div class="game-controls">

            <span>
                WASD / ARROWS
            </span>

            <span
                id="dodgeScore"
                class="game-score">
                0
            </span>

        </div>

    `;

    const canvas =
        document.getElementById(
            "dodgeCanvas"
        );

    const ctx =
        canvas.getContext("2d");

    const playerObj = {
        x: 320,
        y: 180,
        size: 14,
        speed: 4
    };

    const keys = {};

    let obstacles = [];

    let score = 0;

    let spawnTimer = 0;

    function keydown(e) {

        keys[e.key.toLowerCase()] = true;

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright"
            ].includes(e.key.toLowerCase())
        ) {
            e.preventDefault();
        }

    }

    function keyup(e) {

        keys[e.key.toLowerCase()] = false;

    }

    window.addEventListener(
        "keydown",
        keydown
    );

    window.addEventListener(
        "keyup",
        keyup
    );

    function spawnObstacle() {

        const side =
            Math.floor(
                Math.random() * 4
            );

        let x;
        let y;

        if (side === 0) {
            x = -15;
            y = Math.random() * canvas.height;
        }

        if (side === 1) {
            x = canvas.width + 15;
            y = Math.random() * canvas.height;
        }

        if (side === 2) {
            x = Math.random() * canvas.width;
            y = -15;
        }

        if (side === 3) {
            x = Math.random() * canvas.width;
            y = canvas.height + 15;
        }

        const angle =
            Math.atan2(
                playerObj.y - y,
                playerObj.x - x
            );

        const speed =
            1.5 + Math.min(
                3,
                score / 700
            );

        obstacles.push({
            x,
            y,
            size: 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed
        });

    }


    function update() {

        if (!gameRunning) return;

        if (
            keys["w"] ||
            keys["arrowup"]
        ) {
            playerObj.y -= playerObj.speed;
        }

        if (
            keys["s"] ||
            keys["arrowdown"]
        ) {
            playerObj.y += playerObj.speed;
        }

        if (
            keys["a"] ||
            keys["arrowleft"]
        ) {
            playerObj.x -= playerObj.speed;
        }

        if (
            keys["d"] ||
            keys["arrowright"]
        ) {
            playerObj.x += playerObj.speed;
        }

        playerObj.x =
            Math.max(
                playerObj.size,
                Math.min(
                    canvas.width - playerObj.size,
                    playerObj.x
                )
            );

        playerObj.y =
            Math.max(
                playerObj.size,
                Math.min(
                    canvas.height - playerObj.size,
                    playerObj.y
                )
            );


        spawnTimer--;

        if (spawnTimer <= 0) {

            spawnObstacle();

            spawnTimer =
                Math.max(
                    18,
                    55 - score / 50
                );

        }


        obstacles.forEach(o => {

            o.x += o.vx;
            o.y += o.vy;

        });


        obstacles =
            obstacles.filter(o =>
                o.x > -50 &&
                o.x < canvas.width + 50 &&
                o.y > -50 &&
                o.y < canvas.height + 50
            );


        for (const o of obstacles) {

            const dx =
                playerObj.x - o.x;

            const dy =
                playerObj.y - o.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <
                playerObj.size + o.size
            ) {

                endDodgeGame();

                return;

            }

        }


        score += 0.12;

        document
            .getElementById("dodgeScore")
            .textContent =
            Math.floor(score);

    }


    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#08080d";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /* GRID */

        ctx.strokeStyle =
            "rgba(255,255,255,.035)";

        for (
            let x = 0;
            x < canvas.width;
            x += 40
        ) {

            ctx.beginPath();

            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);

            ctx.stroke();

        }

        for (
            let y = 0;
            y < canvas.height;
            y += 40
        ) {

            ctx.beginPath();

            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);

            ctx.stroke();

        }


        /* PLAYER */

        ctx.fillStyle =
            "#9b7cff";

        ctx.shadowBlur = 25;
        ctx.shadowColor =
            "#9b7cff";

        ctx.beginPath();

        ctx.arc(
            playerObj.x,
            playerObj.y,
            playerObj.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;


        /* OBSTACLES */

        obstacles.forEach(o => {

            ctx.fillStyle =
                "#ff4fa3";

            ctx.shadowBlur = 18;
            ctx.shadowColor =
                "#ff4fa3";

            ctx.beginPath();

            ctx.arc(
                o.x,
                o.y,
                o.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

        });

        ctx.shadowBlur = 0;

    }


    function loop() {

        update();
        draw();

        if (gameRunning) {

            animationFrame =
                requestAnimationFrame(loop);

        }

    }

    loop();


    function endDodgeGame() {

        gameRunning = false;

        if (animationFrame) {
            cancelAnimationFrame(
                animationFrame
            );
        }

        saveScore(
            "dodge",
            Math.floor(score)
        );

        setTimeout(() => {

            alert(
                "Game Over!\nScore: " +
                Math.floor(score)
            );

        }, 50);

        window.removeEventListener(
            "keydown",
            keydown
        );

        window.removeEventListener(
            "keyup",
            keyup
        );

    }

}


/* =========================================
   VOID BLASTER
========================================= */

function startSpaceGame() {

    gameRunning = true;

    document.getElementById("gameContent").innerHTML = `

        <div class="game-title">
            Void Blaster ✦
        </div>

        <div class="game-subtitle">
            Move with A/D or arrow keys. Shoot with SPACE.
        </div>

        <canvas
            id="spaceCanvas"
            width="640"
            height="360">
        </canvas>

        <div class="game-controls">

            <span>
                A/D + SPACE
            </span>

            <span
                id="spaceScore"
                class="game-score">
                0
            </span>

        </div>

    `;

    const canvas =
        document.getElementById(
            "spaceCanvas"
        );

    const ctx =
        canvas.getContext("2d");

    const ship = {
        x: 320,
        y: 325,
        width: 30,
        height: 18,
        speed: 5
    };

    const keys = {};

    let bullets = [];
    let enemies = [];

    let score = 0;

    let enemyTimer = 0;

    function keydown(e) {

        keys[e.key.toLowerCase()] = true;

        if (
            e.code === "Space"
        ) {
            e.preventDefault();
        }

    }

    function keyup(e) {

        keys[e.key.toLowerCase()] = false;

    }

    window.addEventListener(
        "keydown",
        keydown
    );

    window.addEventListener(
        "keyup",
        keyup
    );


    function shoot() {

        bullets.push({
            x: ship.x,
            y: ship.y - 15,
            speed: 7
        });

    }


    let shootCooldown = 0;


    function spawnEnemy() {

        enemies.push({
            x:
                20 +
                Math.random() *
                (canvas.width - 40),

            y: -20,

            size:
                10 +
                Math.random() * 8,

            speed:
                1 +
                Math.random() * 1.5
        });

    }


    function update() {

        if (!gameRunning) return;


        if (
            keys["a"] ||
            keys["arrowleft"]
        ) {
            ship.x -= ship.speed;
        }

        if (
            keys["d"] ||
            keys["arrowright"]
        ) {
            ship.x += ship.speed;
        }


        ship.x =
            Math.max(
                20,
                Math.min(
                    canvas.width - 20,
                    ship.x
                )
            );


        shootCooldown--;

        if (
            keys[" "] ||
            keys["space"]
        ) {

            if (shootCooldown <= 0) {

                shoot();

                shootCooldown = 10;

            }

        }


        bullets.forEach(b => {

            b.y -= b.speed;

        });


        bullets =
            bullets.filter(
                b => b.y > -20
            );


        enemyTimer--;

        if (enemyTimer <= 0) {

            spawnEnemy();

            enemyTimer =
                Math.max(
                    12,
                    35 - score / 100
                );

        }


        enemies.forEach(e => {

            e.y += e.speed;

        });


        /* BULLET HIT */

        for (
            let i = enemies.length - 1;
            i >= 0;
            i--
        ) {

            const e =
                enemies[i];

            let destroyed = false;

            for (
                let j = bullets.length - 1;
                j >= 0;
                j--
            ) {

                const b =
                    bullets[j];

                const dx =
                    b.x - e.x;

                const dy =
                    b.y - e.y;

                if (
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) <
                    e.size + 5
                ) {

                    enemies.splice(i, 1);

                    bullets.splice(j, 1);

                    score += 10;

                    destroyed = true;

                    break;

                }

            }

            if (destroyed) continue;


            /* SHIP HIT */

            const dx =
                ship.x - e.x;

            const dy =
                ship.y - e.y;

            if (
                Math.sqrt(
                    dx * dx +
                    dy * dy
                ) <
                e.size + 15
            ) {

                endSpaceGame();

                return;

            }

        }


        enemies =
            enemies.filter(
                e => e.y < canvas.height + 30
            );


        document
            .getElementById("spaceScore")
            .textContent =
            score;

    }


    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.fillStyle =
            "#07070d";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /* STARS */

        ctx.fillStyle =
            "rgba(255,255,255,.35)";

        for (
            let i = 0;
            i < 50;
            i++
        ) {

            const x =
                (i * 97) %
                canvas.width;

            const y =
                (i * 53) %
                canvas.height;

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }


        /* SHIP */

        ctx.fillStyle =
            "#9b7cff";

        ctx.shadowBlur = 25;
        ctx.shadowColor =
            "#9b7cff";

        ctx.beginPath();

        ctx.moveTo(
            ship.x,
            ship.y - 15
        );

        ctx.lineTo(
            ship.x - 17,
            ship.y + 13
        );

        ctx.lineTo(
            ship.x + 17,
            ship.y + 13
        );

        ctx.closePath();

        ctx.fill();

        ctx.shadowBlur = 0;


        /* BULLETS */

        ctx.fillStyle =
            "#52e69b";

        bullets.forEach(b => {

            ctx.fillRect(
                b.x - 2,
                b.y - 8,
                4,
                12
            );

        });


        /* ENEMIES */

        enemies.forEach(e => {

            ctx.fillStyle =
                "#ff4fa3";

            ctx.shadowBlur = 18;

            ctx.shadowColor =
                "#ff4fa3";

            ctx.beginPath();

            ctx.arc(
                e.x,
                e.y,
                e.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

        });

        ctx.shadowBlur = 0;

    }


    function loop() {

        update();
        draw();

        if (gameRunning) {

            animationFrame =
                requestAnimationFrame(loop);

        }

    }


    function endSpaceGame() {

        gameRunning = false;

        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );

        }

        saveScore(
            "space",
            score
        );

        setTimeout(() => {

            alert(
                "Game Over!\nScore: " +
                score
            );

        }, 50);

        window.removeEventListener(
            "keydown",
            keydown
        );

        window.removeEventListener(
            "keyup",
            keyup
        );

    }


    loop();

}
