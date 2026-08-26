@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
    --bg: #07070a;
    --surface: #0d0d12;
    --surface2: #111118;
    --surface3: #17171f;

    --text: #f5f5f7;
    --muted: #858592;

    --border: rgba(255,255,255,.08);

    --purple: #9270ff;
    --blue: #4c8dff;
    --green: #48d68b;
    --pink: #ff5ca8;
    --yellow: #ffc857;

    --radius: 22px;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    scroll-behavior: smooth;
}

body {
    min-height: 100vh;
    background:
        radial-gradient(
            circle at 50% -10%,
            rgba(126,91,255,.12),
            transparent 35%
        ),
        var(--bg);

    color: var(--text);
    font-family: Inter, sans-serif;
    overflow-x: hidden;
}

button,
input {
    font: inherit;
}

button {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.background-glow {
    position: fixed;
    width: 350px;
    height: 350px;
    border-radius: 50%;
    filter: blur(120px);
    opacity: .08;
    pointer-events: none;
    z-index: -1;
}

.glow-one {
    background: #754cff;
    left: -150px;
    top: 300px;
}

.glow-two {
    background: #ff3d9a;
    right: -150px;
    bottom: 100px;
}

.hidden {
    display: none !important;
}


/* =================================
   TOPBAR
================================= */

.topbar {
    position: sticky;
    top: 0;
    z-index: 100;

    height: 76px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 clamp(18px, 5vw, 70px);

    background: rgba(7,7,10,.78);
    backdrop-filter: blur(20px);

    border-bottom: 1px solid var(--border);
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.brand-icon {
    width: 38px;
    height: 38px;

    display: grid;
    place-items: center;

    border-radius: 12px;

    background:
        linear-gradient(
            135deg,
            #9b7aff,
            #5e45c9
        );

    font-family: "Space Grotesk";
    font-weight: 800;

    box-shadow:
        0 8px 30px rgba(125,90,255,.25);
}

.brand h1 {
    font-family: "Space Grotesk";
    font-size: 17px;
    letter-spacing: -0.5px;
}

.brand span {
    display: block;

    color: #62626d;

    font-size: 7px;
    font-weight: 900;

    letter-spacing: 1.7px;
}

.player-area {
    display: flex;
    align-items: center;
    gap: 10px;
}

.player-name {
    color: #c9c9d0;

    font-size: 11px;
    font-weight: 800;

    letter-spacing: 1px;
    text-transform: uppercase;
}

.small-btn {
    padding: 7px 10px;

    color: #aaaab5;
    background: rgba(255,255,255,.04);

    border: 1px solid var(--border);
    border-radius: 8px;

    font-size: 10px;
}

.small-btn:hover {
    color: white;
    background: rgba(255,255,255,.08);
}


/* =================================
   HERO
================================= */

.hero {
    width: min(1000px, 92%);
    margin: auto;

    padding: 110px 20px 90px;

    text-align: center;
}

.hero-badge {
    display: inline-block;

    padding: 7px 12px;

    color: #a997ff;

    border: 1px solid rgba(146,112,255,.18);
    background: rgba(146,112,255,.06);

    border-radius: 999px;

    font-size: 9px;
    font-weight: 900;

    letter-spacing: 1.8px;
}

.hero h2 {
    margin-top: 22px;

    font-family: "Space Grotesk";
    font-size: clamp(55px, 9vw, 105px);

    line-height: .88;
    letter-spacing: -5px;
}

.hero h2 span {
    color: #9a7cff;

    text-shadow:
        0 0 70px rgba(146,112,255,.25);
}

.hero p {
    max-width: 530px;

    margin: 30px auto 0;

    color: var(--muted);

    font-size: 14px;
}


/* =================================
   MAIN
================================= */

main {
    width: min(1250px, 100%);
    margin: auto;
}

.games-section,
.leaderboard-section {
    padding: 30px 20px 80px;
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: end;

    margin-bottom: 24px;
}

.section-title span {
    color: #666671;

    font-size: 9px;
    font-weight: 900;

    letter-spacing: 2px;
}

.section-title h3 {
    margin-top: 4px;

    font-family: "Space Grotesk";
    font-size: 34px;

    letter-spacing: -1.5px;
}

.game-count {
    color: #62626d;

    font-size: 9px;
    font-weight: 900;

    letter-spacing: 1.5px;
}


/* =================================
   GAME GRID
================================= */

.games-grid {
    display: grid;

    grid-template-columns:
        repeat(2, minmax(0,1fr));

    gap: 14px;
}

.game-card {
    position: relative;

    min-height: 145px;

    display: flex;
    align-items: center;

    padding: 25px;

    text-align: left;

    color: white;

    border: 1px solid var(--border);
    border-radius: var(--radius);

    background:
        linear-gradient(
            145deg,
            rgba(255,255,255,.045),
            rgba(255,255,255,.015)
        );

    transition:
        transform .25s ease,
        border-color .25s ease,
        background .25s ease;

    overflow: hidden;
}

.game-card::after {
    content: "";

    position: absolute;

    width: 160px;
    height: 160px;

    right: -80px;
    top: -80px;

    border-radius: 50%;

    background: var(--card-color);

    filter: blur(70px);

    opacity: .13;
}

.game-card:hover {
    transform: translateY(-4px);

    border-color:
        color-mix(
            in srgb,
            var(--card-color) 35%,
            transparent
        );

    background:
        linear-gradient(
            145deg,
            rgba(255,255,255,.07),
            rgba(255,255,255,.025)
        );
}

.game-icon {
    position: relative;
    z-index: 2;

    width: 60px;
    height: 60px;

    display: grid;
    place-items: center;

    margin-right: 18px;

    border-radius: 18px;

    background:
        color-mix(
            in srgb,
            var(--card-color) 10%,
            transparent
        );

    border: 1px solid
        color-mix(
            in srgb,
            var(--card-color) 20%,
            transparent
        );

    font-size: 27px;
}

.game-info {
    position: relative;
    z-index: 2;
}

.game-info h4 {
    font-family: "Space Grotesk";
    font-size: 22px;
}

.game-info p {
    margin-top: 3px;

    color: #777783;

    font-size: 11px;
}

.play-arrow {
    position: relative;
    z-index: 2;

    margin-left: auto;

    color: #666672;

    font-size: 20px;

    transition: .2s;
}

.game-card:hover .play-arrow {
    color: white;
    transform: translateX(4px);
}

.snake-card {
    --card-color: #48d68b;
}

.ttt-card {
    --card-color: #5d8dff;
}

.reaction-card {
    --card-color: #ffc857;
}

.click-card {
    --card-color: #ff5ca8;
}

.memory-card {
    --card-color: #9a78ff;
}


/* =================================
   LEADERBOARD
================================= */

.leaderboard-section {
    border-top: 1px solid var(--border);
}

.leaderboard-tabs {
    display: flex;
    gap: 7px;

    overflow-x: auto;

    padding-bottom: 12px;

    scrollbar-width: none;
}

.leaderboard-tabs::-webkit-scrollbar {
    display: none;
}

.leader-tab {
    flex-shrink: 0;

    padding: 9px 13px;

    color: #777783;

    background: rgba(255,255,255,.035);

    border: 1px solid var(--border);
    border-radius: 9px;

    font-size: 10px;
    font-weight: 800;
}

.leader-tab.active {
    color: white;
    background: #191922;
    border-color: rgba(255,255,255,.13);
}

.leaderboard {
    margin-top: 10px;

    border: 1px solid var(--border);
    border-radius: 18px;

    overflow: hidden;
}

.leader-row {
    min-height: 65px;

    display: grid;

    grid-template-columns:
        45px 1fr auto;

    align-items: center;

    padding: 0 18px;

    border-bottom: 1px solid var(--border);
}

.leader-row:last-child {
    border-bottom: 0;
}

.rank {
    color: #60606b;

    font-size: 11px;
    font-weight: 900;
}

.rank.first {
    color: #ffc857;
}

.rank.second {
    color: #c5c5ce;
}

.rank.third {
    color: #b77850;
}

.leader-user {
    font-size: 12px;
    font-weight: 700;
}

.you {
    margin-left: 7px;

    padding: 3px 6px;

    color: #9a7cff;

    background: rgba(146,112,255,.08);

    border-radius: 5px;

    font-size: 7px;
    font-weight: 900;
}

.leader-score {
    color: #a997ff;

    font-family: "Space Grotesk";
    font-size: 14px;
    font-weight: 700;
}

.leader-note {
    margin-top: 10px;

    color: #4e4e58;

    text-align: center;

    font-size: 9px;
}


/* =================================
   MODAL
================================= */

.modal {
    position: fixed;
    inset: 0;

    z-index: 500;

    display: grid;
    place-items: center;

    padding: 15px;
}

.modal-backdrop {
    position: absolute;
    inset: 0;

    background: rgba(0,0,0,.78);

    backdrop-filter: blur(15px);
}

.game-window {
    position: relative;
    z-index: 2;

    width: min(700px, 100%);
    max-height: 94vh;

    overflow-y: auto;

    padding: 25px;

    border: 1px solid rgba(255,255,255,.1);
    border-radius: 25px;

    background:
        linear-gradient(
            145deg,
            #121219,
            #0b0b10
        );

    box-shadow:
        0 40px 100px rgba(0,0,0,.6);
}

.game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 20px;
}

.game-header span {
    color: #666672;

    font-size: 8px;
    font-weight: 900;

    letter-spacing: 2px;
}

.game-header h2 {
    font-family: "Space Grotesk";
    font-size: 28px;
}

.close-btn {
    width: 35px;
    height: 35px;

    border: 1px solid var(--border);
    border-radius: 10px;

    color: #aaaab3;
    background: rgba(255,255,255,.04);

    font-size: 22px;
}

.close-btn:hover {
    color: white;
    background: rgba(255,255,255,.09);
}

.game-stats {
    display: flex;
    justify-content: center;
    gap: 35px;

    margin-bottom: 18px;

    color: #777783;

    font-size: 10px;
    font-weight: 800;
}

.game-stats strong {
    color: white;
    margin-left: 4px;
}


/* =================================
   GAME AREA
================================= */

.game-content {
    min-height: 300px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
}


/* =================================
   SNAKE
================================= */

.snake-board {
    width: min(400px, 90vw);
    height: min(400px, 90vw);

    display: grid;

    grid-template-columns: repeat(20, 1fr);
    grid-template-rows: repeat(20, 1fr);

    background: #08080c;

    border: 2px solid rgba(72,214,139,.15);

    border-radius: 14px;

    overflow: hidden;
}

.snake-cell {
    width: 100%;
    height: 100%;
}

.snake {
    background: #48d68b;
}

.snake-head {
    background: #8affb9;
}

.food {
    background: #ff5ca8;
    border-radius: 50%;
    transform: scale(.65);
}

.mobile-controls {
    display: grid;

    grid-template-columns: repeat(3, 55px);
    grid-template-rows: repeat(2, 55px);

    gap: 6px;

    margin-top: 18px;
}

.control-btn {
    border: 1px solid var(--border);
    border-radius: 12px;

    color: white;
    background: rgba(255,255,255,.06);

    font-size: 20px;
}

.control-btn:active {
    background: rgba(255,255,255,.15);
    transform: scale(.94);
}

.up {
    grid-column: 2;
}

.left {
    grid-column: 1;
    grid-row: 2;
}

.down {
    grid-column: 2;
    grid-row: 2;
}

.right {
    grid-column: 3;
    grid-row: 2;
}


/* =================================
   TIC TAC TOE
================================= */

.ttt-board {
    width: min(330px, 90vw);

    display: grid;

    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.ttt-cell {
    aspect-ratio: 1;

    display: grid;
    place-items: center;

    border: 1px solid var(--border);
    border-radius: 14px;

    color: white;
    background: rgba(255,255,255,.04);

    font-family: "Space Grotesk";
    font-size: 40px;
    font-weight: 700;
}

.ttt-cell:hover {
    background: rgba(255,255,255,.08);
}


/* =================================
   REACTION
================================= */

.reaction-box {
    width: min(500px, 90vw);
    height: 280px;

    display: grid;
    place-items: center;

    border-radius: 20px;

    color: white;

    background: #17171f;

    border: 1px solid var(--border);

    font-family: "Space Grotesk";
    font-size: 20px;
    font-weight: 700;

    user-select: none;
    touch-action: manipulation;
}

.reaction-box.waiting {
    background: #5b2028;
}

.reaction-box.ready {
    background: #1d8b59;
}


/* =================================
   CLICK RUSH
================================= */

.click-timer {
    color: #777783;
    font-size: 12px;
}

.click-score {
    margin: 12px 0;

    font-family: "Space Grotesk";
    font-size: 65px;
}

.big-click {
    width: min(300px, 80vw);
    height: 170px;

    border: 0;
    border-radius: 25px;

    color: white;
    background:
        linear-gradient(
            145deg,
            #c44882,
            #733cbd
        );

    box-shadow:
        0 20px 60px rgba(255,92,168,.15);

    font-size: 28px;
    font-weight: 900;

    touch-action: manipulation;
}

.big-click:active {
    transform: scale(.96);
}


/* =================================
   MEMORY
================================= */

.memory-board {
    width: min(420px, 92vw);

    display: grid;

    grid-template-columns: repeat(4, 1fr);

    gap: 8px;
}

.memory-card-game {
    aspect-ratio: 1;

    border: 0;
    border-radius: 12px;

    color: transparent;

    background: #191922;

    font-size: 27px;

    transition: transform .2s;
}

.memory-card-game.flipped,
.memory-card-game.matched {
    color: white;
    background: #29263c;
}

.memory-card-game:active {
    transform: scale(.94);
}


/* =================================
   GAME BUTTON
================================= */

.game-action {
    margin-top: 20px;

    padding: 11px 18px;

    color: white;

    background: rgba(255,255,255,.07);

    border: 1px solid var(--border);
    border-radius: 10px;

    font-size: 11px;
    font-weight: 800;
}

.game-action:hover {
    background: rgba(255,255,255,.12);
}


/* =================================
   NAME MODAL
================================= */

.name-modal {
    position: fixed;
    inset: 0;

    z-index: 1000;

    display: grid;
    place-items: center;

    padding: 20px;

    background: rgba(0,0,0,.82);

    backdrop-filter: blur(20px);
}

.name-card {
    width: min(400px, 100%);

    padding: 38px;

    text-align: center;

    border: 1px solid var(--border);
    border-radius: 25px;

    background: #111117;

    box-shadow:
        0 40px 100px rgba(0,0,0,.6);
}

.brand-icon.big {
    width: 55px;
    height: 55px;

    margin: auto auto 20px;

    font-size: 22px;
}

.name-card h2 {
    font-family: "Space Grotesk";
    font-size: 29px;
}

.name-card p {
    margin: 8px 0 22px;

    color: #777783;

    font-size: 12px;
}

.name-card input {
    width: 100%;

    padding: 14px;

    outline: none;

    color: white;
    background: rgba(255,255,255,.04);

    border: 1px solid var(--border);
    border-radius: 11px;
}

.name-card input:focus {
    border-color: rgba(146,112,255,.5);
}

.primary-btn {
    width: 100%;

    margin-top: 10px;

    padding: 14px;

    border: 0;
    border-radius: 11px;

    color: #08080b;
    background: white;

    font-weight: 900;
}

.primary-btn:hover {
    transform: translateY(-1px);
}


/* =================================
   FOOTER
================================= */

footer {
    padding: 55px 20px 35px;

    text-align: center;

    border-top: 1px solid var(--border);
}

footer strong {
    display: block;

    font-family: "Space Grotesk";
    font-size: 18px;
}

footer span {
    display: block;

    margin-top: 5px;

    color: #50505a;

    font-size: 9px;
}


/* =================================
   MOBILE
================================= */

@media (max-width: 700px) {

    .topbar {
        height: 66px;
    }

    .brand h1 {
        font-size: 14px;
    }

    .brand span {
        font-size: 6px;
    }

    .brand-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
    }

    .player-name {
        display: none;
    }

    .hero {
        padding:
            85px 15px
            70px;
    }

    .hero h2 {
        font-size: clamp(52px, 16vw, 80px);
        letter-spacing: -4px;
    }

    .hero p {
        font-size: 12px;
    }

    .games-grid {
        grid-template-columns: 1fr;
    }

    .games-section,
    .leaderboard-section {
        padding-left: 15px;
        padding-right: 15px;
    }

    .section-title h3 {
        font-size: 28px;
    }

    .game-card {
        min-height: 125px;
        padding: 20px;
    }

    .game-icon {
        width: 52px;
        height: 52px;
        margin-right: 13px;
    }

    .game-info h4 {
        font-size: 19px;
    }

    .game-info p {
        font-size: 10px;
    }

    .game-window {
        padding: 18px;

        max-height: 96vh;

        border-radius: 20px;
    }

    .game-header h2 {
        font-size: 24px;
    }

    .reaction-box {
        height: 240px;
    }

    .big-click {
        height: 160px;
    }
}

@media (max-width: 400px) {

    .hero h2 {
        font-size: 50px;
    }

    .game-card {
        padding: 17px;
    }

    .game-icon {
        width: 47px;
        height: 47px;
        font-size: 22px;
    }

    .play-arrow {
        font-size: 16px;
    }

    .memory-board {
        gap: 6px;
    }
}


/* =================================
   SCROLLBAR
================================= */

::-webkit-scrollbar {
    width: 7px;
}

::-webkit-scrollbar-track {
    background: #07070a;
}

::-webkit-scrollbar-thumb {
    background: #292932;
    border-radius: 20px;
}

::-webkit-scrollbar-thumb:hover {
    background: #3b3b47;
}
