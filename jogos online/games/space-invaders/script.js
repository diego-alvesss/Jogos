const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

// Background espacial animado
const stars = Array.from({length: 80}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.8 + 0.2
}));

function drawBackground() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
    });
    ctx.restore();
}

// Nave do jogador
const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    w: 40,
    h: 32,
    speed: 6,
    dx: 0,
    alive: true,
    cooldown: 0
};

// Tiros do jogador
let bullets = [];
const bulletSpeed = 8;

// Tiros dos inimigos
let enemyBullets = [];
const enemyBulletSpeed = 5;

// Inimigos
const enemyW = 38;
const enemyH = 32;
let enemies = [];
let enemyTypes = ['shooter', 'random', 'shooter', 'shooter'];
let gameStarted = false;
let initialEnemies = 4;
let currentEnemies = initialEnemies;

function createEnemies() {
    enemies = [];
    enemyTypes = [];
    for (let i = 0; i < currentEnemies; i++) {
        let type = 'shooter'; // Todas as naves são shooter
        enemyTypes.push(type);
        enemies.push({
            x: 60 + i * (canvas.width - 120) / (currentEnemies - 1),
            y: 50,
            w: enemyW,
            h: enemyH,
            alive: true,
            type,
            dir: Math.random() < 0.5 ? 1 : -1,
            speed: 2.2 + Math.random() * 0.8,
            shootCooldown: Math.random() * 80 + 40
        });
    }
}

function nextWave() {
    currentEnemies++;
    createEnemies();
}

function drawPlayer() {
    if (!player.alive) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    // Corpo principal (Galaga style)
    ctx.fillStyle = '#1e90ff';
    ctx.beginPath();
    ctx.moveTo(0, -player.h/2); // ponta
    ctx.lineTo(-player.w/2, player.h/2);
    ctx.lineTo(-player.w/6, player.h/6);
    ctx.lineTo(player.w/6, player.h/6);
    ctx.lineTo(player.w/2, player.h/2);
    ctx.closePath();
    ctx.fill();
    // Cockpit
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -player.h/4, 7, 0, Math.PI * 2);
    ctx.fill();
    // Asas laterais
    ctx.fillStyle = '#0ff';
    ctx.fillRect(-player.w/2, player.h/4, 10, 14);
    ctx.fillRect(player.w/2-10, player.h/4, 10, 14);
    // Detalhe vermelho
    ctx.fillStyle = '#f00';
    ctx.fillRect(-4, player.h/2-6, 8, 8);
    ctx.restore();
}

function drawBullets() {
    ctx.fillStyle = '#fff';
    bullets.forEach(b => {
        ctx.fillRect(b.x-2, b.y, 4, 12);
    });
    // Tiros dos inimigos
    ctx.fillStyle = '#f80';
    enemyBullets.forEach(b => {
        ctx.fillRect(b.x-2, b.y, 4, 12);
    });
}

function drawEnemies() {
    enemies.forEach(e => {
        if (!e.alive) return;
        ctx.save();
        ctx.translate(e.x + e.w/2, e.y + e.h/2);
        // Galaga style
        if (e.type === 'shooter') {
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.moveTo(0, -e.h/2);
            ctx.lineTo(-e.w/2, e.h/2);
            ctx.lineTo(-e.w/6, e.h/6);
            ctx.lineTo(e.w/6, e.h/6);
            ctx.lineTo(e.w/2, e.h/2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#f00';
            ctx.fillRect(-6, e.h/2-8, 12, 8);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, -e.h/4, 7, 0, Math.PI * 2);
            ctx.fill();
        } else if (e.type === 'random') {
            ctx.fillStyle = '#0f0';
            ctx.beginPath();
            ctx.moveTo(-e.w/2, e.h/2);
            ctx.lineTo(0, -e.h/2);
            ctx.lineTo(e.w/2, e.h/2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillRect(-8, 0, 16, 8);
        }
        ctx.restore();
    });
}

function movePlayer() {
    if (!player.alive) return;
    player.x += player.dx;
    if (player.x - player.w/2 < 0) player.x = player.w/2;
    if (player.x + player.w/2 > canvas.width) player.x = canvas.width - player.w/2;
}

function moveBullets() {
    bullets.forEach(b => b.y -= bulletSpeed);
    bullets = bullets.filter(b => b.y > -12);
    enemyBullets.forEach(b => b.y += enemyBulletSpeed);
    enemyBullets = enemyBullets.filter(b => b.y < canvas.height + 12);
}

function moveEnemies() {
    enemies.forEach(e => {
        if (!e.alive) return;
        if (e.type === 'random') {
            e.x += (Math.random() - 0.5) * 2 * e.speed;
            e.y += (Math.random() - 0.5) * 0.5 * e.speed;
            if (e.x < 0) e.x = 0;
            if (e.x + e.w > canvas.width) e.x = canvas.width - e.w;
            if (e.y < 0) e.y = 0;
            if (e.y + e.h > canvas.height/2) e.y = canvas.height/2 - e.h;
        } else {
            e.x += e.dir * e.speed;
            if (e.x < 0 || e.x + e.w > canvas.width) e.dir *= -1;
            // Atira
            e.shootCooldown--;
            if (e.shootCooldown <= 0) {
                enemyBullets.push({ x: e.x + e.w/2, y: e.y + e.h });
                e.shootCooldown = Math.random() * 80 + 40;
            }
        }
    });
}

function checkCollisions() {
    // Tiros do jogador acertando inimigos
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (e.alive &&
                b.x > e.x && b.x < e.x + e.w &&
                b.y > e.y && b.y < e.y + e.h) {
                e.alive = false;
                bullets.splice(bi, 1);
                score += 10;
            }
        });
    });
    // Tiros dos inimigos acertando o jogador
    enemyBullets.forEach((b, bi) => {
        if (player.alive &&
            b.x > player.x - player.w/2 && b.x < player.x + player.w/2 &&
            b.y > player.y - player.h/2 && b.y < player.y + player.h/2) {
            player.alive = false;
            gameOver = true;
        }
    });
    // Inimigos colidindo com o jogador
    enemies.forEach(e => {
        if (e.alive && player.alive &&
            e.x < player.x + player.w/2 && e.x + e.w > player.x - player.w/2 &&
            e.y < player.y + player.h/2 && e.y + e.h > player.y - player.h/2) {
            player.alive = false;
            gameOver = true;
        }
    });
    // Game over se inimigo chegar na nave
    enemies.forEach(e => {
        if (e.alive && e.y + e.h >= player.y - player.h/2) {
            player.alive = false;
            gameOver = true;
        }
    });
}

let score = 0;
let gameOver = false;
let victory = false;

function drawGameOver() {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, canvas.height/2-80, canvas.width, 160);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
    ctx.font = '18px Arial';
    ctx.fillText('Clique em Reiniciar para jogar novamente', canvas.width / 2, canvas.height / 2 + 80);
    ctx.restore();
    restartBtn.style.display = 'inline-block';
}

function drawVictory() {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, canvas.height/2-80, canvas.width, 160);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VOCÊ VENCEU!', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
    ctx.font = '18px Arial';
    ctx.fillText('Clique em Reiniciar para jogar novamente', canvas.width / 2, canvas.height / 2 + 80);
    ctx.restore();
    restartBtn.style.display = 'inline-block';
}

function update() {
    drawBackground();
    if (!gameStarted) return;
    if (gameOver) {
        drawGameOver();
        scoreEl.textContent = 'Score: ' + score;
        return;
    }
    movePlayer();
    moveBullets();
    moveEnemies();
    checkCollisions();
    drawPlayer();
    drawBullets();
    drawEnemies();
    scoreEl.textContent = 'Score: ' + score;
    // Se todos inimigos mortos, próxima onda
    if (enemies.length > 0 && enemies.every(e => !e.alive)) {
        nextWave();
    }
    requestAnimationFrame(update);
}

// Inicializa controles já na primeira entrada
let leftPressed = false;
let rightPressed = false;
window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft') {
        leftPressed = true;
        player.dx = -player.speed;
    }
    if (e.code === 'ArrowRight') {
        rightPressed = true;
        player.dx = player.speed;
    }
    if (e.code === 'Space') {
        if (!gameOver && !victory && player.alive && player.cooldown <= 0) {
            bullets.push({ x: player.x, y: player.y - player.h/2 });
            player.cooldown = 10;
        }
    }
});
window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') {
        leftPressed = false;
        if (!rightPressed) player.dx = 0;
        else player.dx = player.speed;
    }
    if (e.code === 'ArrowRight') {
        rightPressed = false;
        if (!leftPressed) player.dx = 0;
        else player.dx = -player.speed;
    }
});

startBtn.onclick = function() {
    gameStarted = true;
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    score = 0;
    gameOver = false;
    victory = false;
    currentEnemies = initialEnemies;
    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    player.alive = true;
    bullets = [];
    enemyBullets = [];
    createEnemies();
    update();
};

restartBtn.onclick = function() {
    gameStarted = true;
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    score = 0;
    gameOver = false;
    victory = false;
    currentEnemies = initialEnemies;
    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    player.alive = true;
    bullets = [];
    enemyBullets = [];
    createEnemies();
    update();
};

function cooldownTick() {
    if (player.cooldown > 0) player.cooldown--;
    setTimeout(cooldownTick, 16);
}
cooldownTick();

update();
