const config = {
    type: Phaser.AUTO,
    width: 380,
    height: 480, // Increased to give room for UI at the bottom
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 0, 1, 2, 1, 0, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0, 1, 0, 0, 0, 5, 0, 0, 0, 1, 0, 1, 1, 0, 0], // Tunnel Row (Index 9)
    [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 3, 0, 3, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TILE_SIZE = 20;
let pacman, ghost, pinky, cursors, scoreText, highScoreText, livesText;
let score = 0;
let isGameOver = false;
let currentDir = 'STATIONARY';
let queuedDir = 'STATIONARY';
let highScore = localStorage.getItem('pacman_highscore') || 0;
let lives = 3;
let ghostSpawn = { x: 190, y: 110 };
let pacmanSpawn = { x: 190, y: 190 }; // Adjusted to fit new map
let powerPellets, pellets;
let isGhostFrightened = false;
let frightenedTimer;

function preload() { }

function create() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.lineStyle(2, 0x2121ff).strokeRect(2, 2, 16, 16).generateTexture('wall', 20, 20);
    graphics.clear().fillStyle(0xffff00).slice(10, 10, 8, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(330)).fillPath().generateTexture('pacman', 20, 20);
    graphics.clear().fillStyle(0xff0000).fillCircle(10, 10, 8).generateTexture('ghost', 20, 20);
    graphics.clear().fillStyle(0xffb8de).fillCircle(10, 10, 8).generateTexture('pinky', 20, 20);
    graphics.clear().fillStyle(0xffb8ae).fillCircle(10, 10, 2).generateTexture('pellet', 20, 20);
    graphics.clear().fillStyle(0x0000ff).fillCircle(10, 10, 8).generateTexture('ghost_blue', 20, 20);
    graphics.clear().fillStyle(0xffb8ae).fillCircle(10, 10, 6).generateTexture('powerPellet', 20, 20);

    const walls = this.physics.add.staticGroup();
    pellets = this.physics.add.group();
    powerPellets = this.physics.add.group();

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let px = x * TILE_SIZE + 10, py = y * TILE_SIZE + 10;
            if (tile === 1) walls.create(px, py, 'wall');
            else if (tile === 0) pellets.create(px, py, 'pellet').body.setSize(2, 2);
            else if (tile === 3) powerPellets.create(px, py, 'powerPellet').body.setSize(10, 10);
            else if (tile === 5) {
                pacman = this.physics.add.sprite(px, py, 'pacman');
                pacman.body.setSize(10, 10);
            }
        });
    });

    ghost = this.physics.add.sprite(ghostSpawn.x, ghostSpawn.y, 'ghost');
    ghost.currentDir = 'LEFT';
    ghost.lastGridX = -1;

    pinky = this.physics.add.sprite(ghostSpawn.x, ghostSpawn.y, 'pinky');
    pinky.currentDir = 'RIGHT'; // Start by going right
    pinky.lastGridX = -1;

    // UI - Moved further down to avoid overlap with map
    scoreText = this.add.text(20, 340, 'SCORE: 0', { fontSize: '18px', fill: '#fff', fontFamily: 'Courier New' });
    highScoreText = this.add.text(360, 340, `BEST: ${highScore}`, { fontSize: '18px', fill: '#ff0', fontFamily: 'Courier New' }).setOrigin(1, 0);
    livesText = this.add.text(20, 370, 'LIVES: 3', { fontSize: '18px', fill: '#0f0', fontFamily: 'Courier New' });

    this.physics.add.overlap(pacman, pellets, (p, dot) => {
        dot.disableBody(true, true);
        score += 10;
        scoreText.setText('SCORE: ' + score);
        if (pellets.countActive() === 0) endGame("YOU WIN!", "#0f0");
    });

    this.physics.add.overlap(pacman, ghost, () => {
        if (isGhostFrightened) eatGhost(this);
        else handlePlayerDeath(this);
    });

    this.physics.add.overlap(pacman, pinky, () => {
        if (isGhostFrightened) {
            eatGhost(this, pinky); // Pass pinky to the function
        } else {
            handlePlayerDeath(this);
        }
    });

    this.physics.add.overlap(pacman, powerPellets, (p, dot) => {
        dot.disableBody(true, true);
        score += 50;
        scoreText.setText('SCORE: ' + score);
        startFrightenedMode(this);
    });

    cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
    if (isGameOver) {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) restartGame(this);
        return;
    }

    if (cursors.left.isDown) queuedDir = 'LEFT';
    else if (cursors.right.isDown) queuedDir = 'RIGHT';
    else if (cursors.up.isDown) queuedDir = 'UP';
    else if (cursors.down.isDown) queuedDir = 'DOWN';

    const pGridX = Math.round((pacman.x - 10) / TILE_SIZE);
    const pGridY = Math.round((pacman.y - 10) / TILE_SIZE);
    const gGridX = Math.round((ghost.x - 10) / TILE_SIZE);
    const gGridY = Math.round((ghost.y - 10) / TILE_SIZE);

    const threshold = 5;

    // Pacman Logic
    if (Math.abs(pacman.x - (pGridX * TILE_SIZE + 10)) < threshold && Math.abs(pacman.y - (pGridY * TILE_SIZE + 10)) < threshold) {
        if (queuedDir !== currentDir && canMove(pGridX, pGridY, queuedDir, false)) {
            pacman.x = pGridX * TILE_SIZE + 10;
            pacman.y = pGridY * TILE_SIZE + 10;
            currentDir = queuedDir;
        }
        if (!canMove(pGridX, pGridY, currentDir, false)) {
            pacman.setVelocity(0);
            currentDir = 'STATIONARY';
        }
    }

    // Ghost Logic
    const distG = Math.abs(ghost.x - (gGridX * TILE_SIZE + 10)) + Math.abs(ghost.y - (gGridY * TILE_SIZE + 10));
    if (distG < threshold) {
        const dirs = ['LEFT', 'RIGHT', 'UP', 'DOWN'];
        const validDirs = dirs.filter(d => canMove(gGridX, gGridY, d, true));
        if (!canMove(gGridX, gGridY, ghost.currentDir, true) || (validDirs.length > 2 && ghost.lastGridX !== gGridX)) {
            const opposites = { 'LEFT': 'RIGHT', 'RIGHT': 'LEFT', 'UP': 'DOWN', 'DOWN': 'UP' };
            const filteredDirs = validDirs.length > 1 ? validDirs.filter(d => d !== opposites[ghost.currentDir]) : validDirs;
            ghost.currentDir = filteredDirs[Math.floor(Math.random() * filteredDirs.length)];
            ghost.x = gGridX * TILE_SIZE + 10;
            ghost.y = gGridY * TILE_SIZE + 10;
            ghost.lastGridX = gGridX;
        }
    }

    applyVelocity();
    //moveGhost();
    updateGhost(ghost);
    updateGhost(pinky);
    checkWarp(pacman);
    checkWarp(ghost);
}

function canMove(gx, gy, dir, isGhost) {
    let nx = gx, ny = gy;
    if (dir === 'LEFT') nx--;
    else if (dir === 'RIGHT') nx++;
    else if (dir === 'UP') ny--;
    else if (dir === 'DOWN') ny++;

    // Warp tunnel check
    if (nx < 0 || nx >= map[0].length) return (ny === 9);

    if (ny >= 0 && ny < map.length) {
        const tile = map[ny][nx];
        if (tile === 1) return false;
        if (tile === 2 && !isGhost) return false;
        return true;
    }
    return false;
}

function checkWarp(sprite) {
    if (sprite.x < -10) sprite.x = 390;
    else if (sprite.x > 390) sprite.x = -10;
}

function applyVelocity() {
    const speed = 120;
    pacman.setVelocity(0);
    if (currentDir === 'LEFT') { pacman.setVelocityX(-speed); pacman.setAngle(180); }
    else if (currentDir === 'RIGHT') { pacman.setVelocityX(speed); pacman.setAngle(0); }
    else if (currentDir === 'UP') { pacman.setVelocityY(-speed); pacman.setAngle(-90); }
    else if (currentDir === 'DOWN') { pacman.setVelocityY(speed); pacman.setAngle(90); }
}

function moveGhost() {
    let speed = isGhostFrightened ? 40 : 80;
    ghost.setVelocity(0);
    if (ghost.currentDir === 'LEFT') ghost.setVelocityX(-speed);
    else if (ghost.currentDir === 'RIGHT') ghost.setVelocityX(speed);
    else if (ghost.currentDir === 'UP') ghost.setVelocityY(-speed);
    else if (ghost.currentDir === 'DOWN') ghost.setVelocityY(speed);
}

function startFrightenedMode(scene) {
    isGhostFrightened = true;
    ghost.setTexture('ghost_blue');
    if (frightenedTimer) frightenedTimer.remove();
    if (ghost.blinkTween) ghost.blinkTween.remove();
    ghost.setAlpha(1);

    scene.time.delayedCall(5000, () => {
        if (isGhostFrightened) {
            ghost.blinkTween = scene.tweens.add({ targets: ghost, alpha: 0.2, duration: 200, yoyo: true, loop: -1 });
        }
    });

    frightenedTimer = scene.time.delayedCall(7000, () => stopFrightenedMode());
}

function stopFrightenedMode() {
    isGhostFrightened = false;
    if (ghost.blinkTween) ghost.blinkTween.remove();
    ghost.setAlpha(1);
    ghost.setTexture('ghost');
}

function eatGhost(scene) {
    score += 200;
    scoreText.setText('SCORE: ' + score);
    stopFrightenedMode();
    ghost.x = ghostSpawn.x;
    ghost.y = ghostSpawn.y;
    scene.physics.pause();
    scene.time.delayedCall(200, () => scene.physics.resume());
}

function handlePlayerDeath(scene) {
    lives--;
    livesText.setText(`LIVES: ${lives}`);
    if (lives <= 0) endGame("GAME OVER", "#f00");
    else {
        scene.cameras.main.shake(200, 0.02);
        pacman.x = pacmanSpawn.x; pacman.y = pacmanSpawn.y;
        ghost.x = ghostSpawn.x; ghost.y = ghostSpawn.y;
        currentDir = 'STATIONARY'; queuedDir = 'STATIONARY';
    }
}

function restartGame(scene) {
    score = 0; lives = 3; isGameOver = false;
    currentDir = 'STATIONARY'; queuedDir = 'STATIONARY';
    scene.scene.restart();
}

function endGame(message, color) {
    isGameOver = true;
    const scene = game.scene.scenes[0];
    scene.physics.pause();
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('pacman_highscore', highScore);
    }
    let m = scene.add.text(config.width / 2, 150, message, { fontSize: '42px', fill: color }).setOrigin(0.5);
    let s = scene.add.text(config.width / 2, 220, 'PRESS SPACE TO CONTINUE', { fontSize: '16px', fill: '#f00' }).setOrigin(0.5);
    scene.tweens.add({ targets: s, alpha: 0, duration: 500, yoyo: true, loop: -1 });
}

function updateGhost(g) {
    const gGridX = Math.round((g.x - 10) / TILE_SIZE);
    const gGridY = Math.round((g.y - 10) / TILE_SIZE);
    const threshold = 5;

    const distG = Math.abs(g.x - (gGridX * TILE_SIZE + 10)) + Math.abs(g.y - (gGridY * TILE_SIZE + 10));

    if (distG < threshold) {
        const dirs = ['LEFT', 'RIGHT', 'UP', 'DOWN'];
        const validDirs = dirs.filter(d => canMove(gGridX, gGridY, d, true));

        if (!canMove(gGridX, gGridY, g.currentDir, true) || (validDirs.length > 2 && g.lastGridX !== gGridX)) {
            const opposites = { 'LEFT': 'RIGHT', 'RIGHT': 'LEFT', 'UP': 'DOWN', 'DOWN': 'UP' };
            const filteredDirs = validDirs.length > 1 ? validDirs.filter(d => d !== opposites[g.currentDir]) : validDirs;
            
            g.currentDir = filteredDirs[Math.floor(Math.random() * filteredDirs.length)];
            g.x = gGridX * TILE_SIZE + 10;
            g.y = gGridY * TILE_SIZE + 10;
            g.lastGridX = gGridX;
        }
    }
    
    // Apply velocity to the specific ghost
    let speed = isGhostFrightened ? 40 : 80;
    g.setVelocity(0);
    if (g.currentDir === 'LEFT') g.setVelocityX(-speed);
    else if (g.currentDir === 'RIGHT') g.setVelocityX(speed);
    else if (g.currentDir === 'UP') g.setVelocityY(-speed);
    else if (g.currentDir === 'DOWN') g.setVelocityY(speed);

    checkWarp(g);
}