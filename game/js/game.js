/**
 * Minkey — Banana Scramble
 * A single-file canvas platformer: guide Minkey the monkey through the jungle,
 * grab every banana, dodge the snakes, and reach the golden idol.
 *
 * No build step, no dependencies. Open index.html (or serve the folder) to play.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const W = 960;
  const H = 540;
  const GRAVITY = 2200; // px/s^2
  const MOVE_SPEED = 340; // px/s
  const JUMP_VEL = 780; // px/s
  const MAX_FALL = 1200; // px/s
  const TILE = 40;
  const START_LIVES = 3;
  const HURT_INVULN = 1.5; // seconds of invulnerability after a hit

  const STATE = { TITLE: 0, PLAYING: 1, LEVEL_CLEAR: 2, GAME_OVER: 3, WIN: 4 };

  // ---------------------------------------------------------------------------
  // Levels — ASCII maps, one char per 40px tile (24 cols x 13 rows = 960x520).
  //   # solid ground   = platform (solid from above only)
  //   b banana         s snake (patrols its platform)
  //   P player spawn   G goal idol
  // ---------------------------------------------------------------------------
  const LEVELS = [
    {
      name: "Canopy Basics",
      map: [
        "........................",
        "........................",
        "..........b.............",
        ".........===............",
        "....b...........b.......",
        "...===.........===......",
        "........................",
        "..............b.......G.",
        ".....b.....======....===",
        "....===.................",
        "P................s......",
        "############.###########",
        "############.###########",
      ],
    },
    {
      name: "Snake Alley",
      map: [
        "........................",
        "....b...........b.......",
        "...====.......====......",
        "..............s.........",
        ".........===========....",
        "..b.....b...............",
        ".====..===..........b...",
        "....................===.",
        "........s...............",
        "..===========...........",
        "P.................s...G.",
        "#####.####.#####.#######",
        "#####.####.#####.#######",
      ],
    },
    {
      name: "Idol Ascent",
      map: [
        "......................G.",
        ".....................===",
        "..........b......b......",
        ".........====..====.....",
        "...b..........s.........",
        "..====....=========.....",
        "........b...............",
        ".......===...b......b...",
        "............===....===..",
        "...s....................",
        "P.=======......s........",
        "########....############",
        "########....############",
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const keys = new Set();
  let jumpQueued = false;

  const game = {
    state: STATE.TITLE,
    levelIndex: 0,
    score: 0,
    lives: START_LIVES,
    time: 0, // elapsed play time, shown in HUD
    stateTimer: 0, // used for level-clear pause
    shake: 0,
  };

  const player = {
    x: 0,
    y: 0,
    w: 30,
    h: 36,
    vx: 0,
    vy: 0,
    onGround: false,
    canDoubleJump: true,
    facing: 1,
    invuln: 0,
    animTime: 0,
  };

  let solids = []; // {x,y,w,h}
  let platforms = []; // one-way platforms {x,y,w,h}
  let bananas = []; // {x,y,taken,bob}
  let snakes = []; // {x,y,w,h,dir,minX,maxX,t}
  let goal = { x: 0, y: 0, w: 34, h: 46 };
  let totalBananas = 0;

  // ---------------------------------------------------------------------------
  // Level loading
  // ---------------------------------------------------------------------------
  function loadLevel(index) {
    const rows = LEVELS[index].map;
    solids = [];
    platforms = [];
    bananas = [];
    snakes = [];

    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const ch = rows[r][c];
        const x = c * TILE;
        const y = r * TILE;
        if (ch === "#") solids.push({ x, y, w: TILE, h: TILE });
        else if (ch === "=") platforms.push({ x, y, w: TILE, h: 12 });
        else if (ch === "b") bananas.push({ x: x + TILE / 2, y: y + TILE / 2, taken: false, bob: Math.random() * Math.PI * 2 });
        else if (ch === "P") { player.x = x + 5; player.y = y + TILE - player.h; }
        else if (ch === "G") { goal.x = x + 3; goal.y = y + TILE - goal.h; }
        else if (ch === "s") {
          snakes.push({ x, y: y + TILE - 22, w: 38, h: 22, dir: 1, minX: x, maxX: x, t: Math.random() * 10 });
        }
      }
    }

    // Give each snake a patrol range: walk left/right along contiguous floor.
    for (const s of snakes) {
      const floorY = s.y + s.h; // top of the tile the snake stands on
      const onFloor = (px) =>
        solids.some((t) => t.y === floorY && px >= t.x && px < t.x + t.w) ||
        platforms.some((t) => t.y === floorY && px >= t.x && px < t.x + t.w);
      let minX = s.x;
      while (minX - TILE >= 0 && onFloor(minX - TILE + 1)) minX -= TILE;
      let maxX = s.x;
      while (maxX + TILE < W && onFloor(maxX + TILE + 1)) maxX += TILE;
      s.minX = minX;
      s.maxX = maxX + TILE - s.w;
    }

    totalBananas = bananas.length;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.canDoubleJump = true;
    player.invuln = 0;
  }

  function respawn() {
    // Re-place the player at the level's spawn point without resetting pickups.
    const rows = LEVELS[game.levelIndex].map;
    for (let r = 0; r < rows.length; r++) {
      const c = rows[r].indexOf("P");
      if (c !== -1) {
        player.x = c * TILE + 5;
        player.y = r * TILE + TILE - player.h;
        break;
      }
    }
    player.vx = 0;
    player.vy = 0;
    player.invuln = HURT_INVULN;
  }

  function startGame() {
    game.state = STATE.PLAYING;
    game.levelIndex = 0;
    game.score = 0;
    game.lives = START_LIVES;
    game.time = 0;
    loadLevel(0);
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------
  window.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) e.preventDefault();
    const k = e.key.toLowerCase();
    if (k === "m") { Sfx.toggleMute(); return; }
    if (e.repeat) return;
    keys.add(k);
    if (k === " " || k === "w" || k === "arrowup") jumpQueued = true;
    if (k === "enter") {
      Sfx.unlock();
      if (game.state === STATE.TITLE || game.state === STATE.GAME_OVER || game.state === STATE.WIN) startGame();
    }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  const left = () => keys.has("arrowleft") || keys.has("a");
  const right = () => keys.has("arrowright") || keys.has("d");

  // ---------------------------------------------------------------------------
  // Physics helpers
  // ---------------------------------------------------------------------------
  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function movePlayer(dt) {
    // Horizontal
    player.vx = (right() ? MOVE_SPEED : 0) - (left() ? MOVE_SPEED : 0);
    if (player.vx !== 0) player.facing = Math.sign(player.vx);

    player.x += player.vx * dt;
    for (const t of solids) {
      if (!overlaps(player, t)) continue;
      if (player.vx > 0) player.x = t.x - player.w;
      else if (player.vx < 0) player.x = t.x + t.w;
    }
    player.x = Math.max(0, Math.min(W - player.w, player.x));

    // Jump (with one mid-air double jump)
    if (jumpQueued) {
      if (player.onGround) {
        player.vy = -JUMP_VEL;
        player.onGround = false;
        Sfx.jump();
      } else if (player.canDoubleJump) {
        player.vy = -JUMP_VEL * 0.92;
        player.canDoubleJump = false;
        Sfx.doubleJump();
      }
      jumpQueued = false;
    }

    // Vertical
    const prevBottom = player.y + player.h;
    player.vy = Math.min(player.vy + GRAVITY * dt, MAX_FALL);
    player.y += player.vy * dt;
    player.onGround = false;

    for (const t of solids) {
      if (!overlaps(player, t)) continue;
      if (player.vy > 0) {
        player.y = t.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.canDoubleJump = true;
      } else if (player.vy < 0) {
        player.y = t.y + t.h;
        player.vy = 0;
      }
    }
    // One-way platforms: only catch the player when falling onto them from above.
    if (player.vy >= 0) {
      for (const t of platforms) {
        if (!overlaps(player, t)) continue;
        if (prevBottom <= t.y + 1) {
          player.y = t.y - player.h;
          player.vy = 0;
          player.onGround = true;
          player.canDoubleJump = true;
        }
      }
    }
  }

  function hurtPlayer() {
    if (player.invuln > 0) return;
    game.lives -= 1;
    game.shake = 0.35;
    Sfx.hurt();
    if (game.lives <= 0) {
      game.state = STATE.GAME_OVER;
      Sfx.gameOver();
    } else {
      respawn();
    }
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------
  function update(dt) {
    if (game.state === STATE.LEVEL_CLEAR) {
      game.stateTimer -= dt;
      if (game.stateTimer <= 0) {
        game.levelIndex += 1;
        if (game.levelIndex >= LEVELS.length) {
          game.state = STATE.WIN;
        } else {
          loadLevel(game.levelIndex);
          game.state = STATE.PLAYING;
        }
      }
      return;
    }
    if (game.state !== STATE.PLAYING) return;

    game.time += dt;
    game.shake = Math.max(0, game.shake - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    player.animTime += dt;

    movePlayer(dt);

    // Fell into a pit
    if (player.y > H + 60) hurtPlayer();

    // Snakes patrol
    for (const s of snakes) {
      s.t += dt;
      s.x += s.dir * 90 * dt;
      if (s.x <= s.minX) { s.x = s.minX; s.dir = 1; }
      if (s.x >= s.maxX) { s.x = s.maxX; s.dir = -1; }
      if (player.invuln <= 0 && overlaps(player, s)) hurtPlayer();
    }

    // Bananas
    for (const b of bananas) {
      if (b.taken) continue;
      b.bob += dt * 3;
      const hit = { x: b.x - 12, y: b.y - 12, w: 24, h: 24 };
      if (overlaps(player, hit)) {
        b.taken = true;
        game.score += 100;
        Sfx.banana();
      }
    }

    // Goal — requires all bananas first
    const remaining = bananas.filter((b) => !b.taken).length;
    if (remaining === 0 && overlaps(player, goal)) {
      game.score += 500;
      game.state = STATE.LEVEL_CLEAR;
      game.stateTimer = 1.6;
      Sfx.levelClear();
    }
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#7ec8e3");
    sky.addColorStop(0.6, "#b8e0c8");
    sky.addColorStop(1, "#dff0d8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Distant jungle silhouettes
    ctx.fillStyle = "rgba(46, 105, 66, 0.35)";
    for (let i = 0; i < 6; i++) {
      const bx = i * 180 + 40;
      ctx.beginPath();
      ctx.arc(bx, 480, 130 + (i % 3) * 40, Math.PI, 0);
      ctx.fill();
    }
    // Hanging vines
    ctx.strokeStyle = "rgba(38, 92, 56, 0.45)";
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) {
      const vx = 60 + i * 120;
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.quadraticCurveTo(vx + 18, 60, vx - 6, 110 + (i % 3) * 30);
      ctx.stroke();
    }
    // Sun
    ctx.fillStyle = "rgba(255, 236, 150, 0.9)";
    ctx.beginPath();
    ctx.arc(830, 80, 46, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTiles() {
    for (const t of solids) {
      ctx.fillStyle = "#6b4226";
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.fillStyle = "#3e8e41";
      ctx.fillRect(t.x, t.y, t.w, 10);
      ctx.fillStyle = "#54b25a";
      ctx.fillRect(t.x + 4, t.y, 8, 6);
      ctx.fillRect(t.x + 22, t.y, 10, 6);
    }
    for (const p of platforms) {
      ctx.fillStyle = "#8a5a2b";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#a9773f";
      ctx.fillRect(p.x, p.y, p.w, 4);
    }
  }

  function drawBanana(b) {
    const y = b.y + Math.sin(b.bob) * 4;
    ctx.save();
    ctx.translate(b.x, y);
    ctx.rotate(-0.5);
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0.25 * Math.PI, 1.15 * Math.PI);
    ctx.arc(-3, -3, 8, 1.15 * Math.PI, 0.25 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#8a5a2b";
    ctx.fillRect(8, -9, 4, 5);
    ctx.restore();
  }

  function drawSnake(s) {
    const slither = Math.sin(s.t * 8) * 2;
    ctx.fillStyle = "#2e8b57";
    ctx.beginPath();
    ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2 + slither * 0.3, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    const hx = s.dir === 1 ? s.x + s.w - 6 : s.x + 6;
    ctx.fillStyle = "#246b43";
    ctx.beginPath();
    ctx.arc(hx, s.y + 6 + slither, 8, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(hx + s.dir * 3, s.y + 4 + slither, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Tongue
    ctx.strokeStyle = "#e63946";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx + s.dir * 8, s.y + 7 + slither);
    ctx.lineTo(hx + s.dir * 15, s.y + 6 + slither);
    ctx.stroke();
  }

  function drawGoal() {
    const g = goal;
    const glow = 0.6 + Math.sin(performance.now() / 300) * 0.25;
    ctx.save();
    ctx.shadowColor = `rgba(255, 215, 0, ${glow})`;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#e0a72a";
    ctx.fillRect(g.x + 6, g.y + 14, g.w - 12, g.h - 14);
    // Idol head
    ctx.beginPath();
    ctx.arc(g.x + g.w / 2, g.y + 12, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#7a5514";
    ctx.fillRect(g.x + 10, g.y + 8, 5, 4);
    ctx.fillRect(g.x + g.w - 15, g.y + 8, 5, 4);
    ctx.fillRect(g.x + 12, g.y + 24, g.w - 24, 4);
  }

  function drawPlayer() {
    if (player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0) return; // blink

    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    const run = player.onGround && player.vx !== 0 ? Math.sin(player.animTime * 14) : 0;

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(player.facing, 1);

    // Tail
    ctx.strokeStyle = "#7a4a21";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-12, 8);
    ctx.quadraticCurveTo(-26, 4 + run * 3, -22, -10);
    ctx.stroke();

    // Body
    ctx.fillStyle = "#8b5a2b";
    ctx.beginPath();
    ctx.ellipse(0, 6, 13, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c49a6c";
    ctx.beginPath();
    ctx.ellipse(0, 8, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = "#7a4a21";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-5, 15);
    ctx.lineTo(-8, 22 - run * 4);
    ctx.moveTo(5, 15);
    ctx.lineTo(8, 22 + run * 4);
    ctx.stroke();

    // Head
    ctx.fillStyle = "#8b5a2b";
    ctx.beginPath();
    ctx.arc(4, -10, 11, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.arc(-5, -14, 5, 0, Math.PI * 2);
    ctx.fill();
    // Face
    ctx.fillStyle = "#c49a6c";
    ctx.beginPath();
    ctx.ellipse(7, -8, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = "#231f20";
    ctx.beginPath();
    ctx.arc(5, -11, 1.8, 0, Math.PI * 2);
    ctx.arc(10, -11, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.strokeStyle = "#231f20";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(7.5, -7, 3.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  function drawHUD() {
    const remaining = bananas.filter((b) => !b.taken).length;

    ctx.fillStyle = "rgba(10, 30, 16, 0.55)";
    roundRect(12, 10, 460, 36, 10);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 17px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Score ${game.score}`, 26, 34);
    ctx.fillText(`Bananas ${totalBananas - remaining}/${totalBananas}`, 140, 34);
    ctx.fillText(`Lives ${"❤".repeat(Math.max(0, game.lives))}`, 300, 34);
    ctx.fillText(`⏱ ${game.time.toFixed(0)}s`, 405, 34);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(`Level ${game.levelIndex + 1}/${LEVELS.length} — ${LEVELS[game.levelIndex].name}`, W - 18, 34);

    if (remaining === 0) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffe07a";
      ctx.font = "bold 16px 'Trebuchet MS', sans-serif";
      ctx.fillText("All bananas collected — reach the golden idol!", W / 2, 66);
    }
    if (Sfx.muted) {
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("🔇", W - 18, 62);
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawOverlay(title, subtitle, footer) {
    ctx.fillStyle = "rgba(5, 20, 10, 0.72)";
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd23f";
    ctx.font = "bold 58px 'Trebuchet MS', sans-serif";
    ctx.fillText(title, W / 2, H / 2 - 50);

    ctx.fillStyle = "#eafce9";
    ctx.font = "22px 'Trebuchet MS', sans-serif";
    ctx.fillText(subtitle, W / 2, H / 2 + 4);

    const pulse = 0.6 + Math.sin(performance.now() / 350) * 0.4;
    ctx.fillStyle = `rgba(255, 224, 122, ${pulse})`;
    ctx.font = "bold 24px 'Trebuchet MS', sans-serif";
    ctx.fillText(footer, W / 2, H / 2 + 70);
  }

  function render() {
    ctx.save();
    if (game.shake > 0) {
      ctx.translate((Math.random() - 0.5) * 10 * game.shake, (Math.random() - 0.5) * 10 * game.shake);
    }

    drawBackground();
    drawTiles();
    drawGoal();
    for (const b of bananas) if (!b.taken) drawBanana(b);
    for (const s of snakes) drawSnake(s);
    drawPlayer();
    drawHUD();
    ctx.restore();

    if (game.state === STATE.TITLE) {
      drawOverlay("MINKEY", "Banana Scramble — grab every banana, dodge the snakes, reach the idol", "Press ENTER to play");
    } else if (game.state === STATE.LEVEL_CLEAR) {
      drawOverlay("LEVEL CLEAR!", `${LEVELS[game.levelIndex].name} complete  •  +500 bonus`, "Get ready…");
    } else if (game.state === STATE.GAME_OVER) {
      drawOverlay("GAME OVER", `Final score: ${game.score}`, "Press ENTER to try again");
    } else if (game.state === STATE.WIN) {
      drawOverlay("YOU WIN! 🍌", `Jungle conquered in ${game.time.toFixed(0)}s with ${game.score} points`, "Press ENTER to play again");
    }
  }

  // ---------------------------------------------------------------------------
  // Main loop
  // ---------------------------------------------------------------------------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30); // clamp to avoid tunnelling on tab-switch
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  loadLevel(0);
  requestAnimationFrame(frame);
})();
