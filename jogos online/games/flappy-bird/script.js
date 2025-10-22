class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações do jogo
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.bestScore = localStorage.getItem('flappyBestScore') || 0;
        
        // Configurações do pássaro
        this.bird = {
            x: 50,
            y: 300,
            width: 20,
            height: 20,
            velocity: 0,
            gravity: 0.4,
            jumpStrength: -7,
            color: '#ffff00'
        };
        
        // Configurações dos canos
        this.pipes = [];
        this.pipeWidth = 50;
        this.pipeGap = 150;
        this.initialPipeSpeed = 2;
        this.pipeSpeed = 2;
        this.pipeSpacing = 200; // Distância mínima entre canos
        this.lastPipeX = 0;
        this.speedIncrement = 0.3; // Aumento de velocidade a cada 10 túneis
        
        // Elementos da interface
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.bestScoreElement = document.getElementById('bestScore');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startScreen = document.getElementById('startScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Inicializar eventos
        this.initEvents();
        this.updateUI();
        
        // Iniciar loop do jogo
        this.gameLoop();
    }
    
    initEvents() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
            if (e.code === 'KeyR') {
                this.resetGame();
            }
        });
        
        // Eventos de botões
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
        
        // Eventos de toque para mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
        
        // Clique no canvas
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
    }
    
    jump() {
        if (this.gameState === 'playing') {
            this.bird.velocity = this.bird.jumpStrength;
        } else if (this.gameState === 'start') {
            this.startGame();
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startScreen.classList.add('hidden');
        this.resetGame(false);
    }
    
    resetGame(showStart = true) {
        this.bird.y = 300;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.lastPipeX = 0;
        this.pipeSpeed = this.initialPipeSpeed; // Reset velocidade
        
        if (showStart) {
            this.gameState = 'start';
            this.startScreen.classList.remove('hidden');
        }
        
        this.gameOverScreen.classList.add('hidden');
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Atualizar melhor pontuação
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
        
        this.gameOverScreen.classList.remove('hidden');
        this.updateUI();
    }
    
    updateUI() {
        const currentLevel = Math.floor(this.score / 10) + 1;
        this.scoreElement.textContent = this.score;
        this.finalScoreElement.textContent = this.score;
        this.bestScoreElement.textContent = this.bestScore;
        
        // Atualizar display de velocidade/nível se existir
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = currentLevel;
        }
    }
    
    increaseSpeed() {
        this.pipeSpeed += this.speedIncrement;
        const currentLevel = Math.floor(this.score / 10) + 1;
        
        // Efeito visual de aumento de velocidade
        this.showSpeedUpEffect(currentLevel);
        
        // Limitar velocidade máxima para não ficar impossível
        if (this.pipeSpeed > 6) {
            this.pipeSpeed = 6;
        }
    }
    
    showSpeedUpEffect(level) {
        // Criar elemento temporário para mostrar o aumento de velocidade
        const speedUpDiv = document.createElement('div');
        speedUpDiv.style.position = 'absolute';
        speedUpDiv.style.top = '50%';
        speedUpDiv.style.left = '50%';
        speedUpDiv.style.transform = 'translate(-50%, -50%)';
        speedUpDiv.style.color = '#ff0000';
        speedUpDiv.style.fontSize = '1.2rem';
        speedUpDiv.style.fontFamily = '"Press Start 2P", monospace';
        speedUpDiv.style.textShadow = '0 0 10px #ff0000';
        speedUpDiv.style.zIndex = '1001';
        speedUpDiv.style.pointerEvents = 'none';
        speedUpDiv.textContent = `NÍVEL ${level}!`;
        
        document.body.appendChild(speedUpDiv);
        
        // Animar e remover após 2 segundos
        speedUpDiv.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => {
            speedUpDiv.remove();
        };
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Atualizar pássaro
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Verificar colisão com bordas
        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvas.height) {
            this.gameOver();
            return;
        }
        
        // Gerar canos com espaçamento controlado
        if (this.pipes.length === 0 || 
            this.canvas.width - this.pipes[this.pipes.length - 1].x >= this.pipeSpacing) {
            this.spawnPipe();
        }
        
        // Atualizar canos
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Remover canos fora da tela
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
            
            // Verificar colisão
            if (this.checkCollision(pipe)) {
                this.gameOver();
                return;
            }
            
            // Incrementar pontuação
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.updateUI();
                
                // Aumentar velocidade a cada 10 túneis
                if (this.score % 10 === 0 && this.score > 0) {
                    this.increaseSpeed();
                }
            }
        }
    }
    
    spawnPipe() {
        const minPipeHeight = 80;
        const maxPipeHeight = this.canvas.height - this.pipeGap - 80;
        const topPipeHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
        
        // Garantir que o gap está na parte visível da tela
        const adjustedTopHeight = Math.max(minPipeHeight, 
                                         Math.min(topPipeHeight, this.canvas.height - this.pipeGap - 80));
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: adjustedTopHeight,
            bottomY: adjustedTopHeight + this.pipeGap,
            bottomHeight: this.canvas.height - (adjustedTopHeight + this.pipeGap),
            scored: false
        });
        
        this.lastPipeX = this.canvas.width;
    }
    
    checkCollision(pipe) {
        // Adicionar margem de segurança para detecção mais precisa
        const birdLeft = this.bird.x + 2;
        const birdRight = this.bird.x + this.bird.width - 2;
        const birdTop = this.bird.y + 2;
        const birdBottom = this.bird.y + this.bird.height - 2;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Verificar se o pássaro está na mesma posição horizontal do cano
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Verificar colisão com cano superior ou inferior
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        return false;
    }
    
    draw() {
        // Limpar canvas
        this.ctx.fillStyle = '#001133';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar fundo com estrelas
        this.drawStars();
        
        // Desenhar canos
        this.pipes.forEach(pipe => this.drawPipe(pipe));
        
        // Desenhar pássaro
        this.drawBird();
        
        // Desenhar efeitos
        if (this.gameState === 'playing') {
            this.drawTrail();
        }
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 41) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawBird() {
        // Corpo do pássaro (pixel art style)
        this.ctx.fillStyle = this.bird.color;
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        
        // Olho
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.bird.x + 12, this.bird.y + 4, 4, 4);
        
        // Pupila
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.bird.x + 13, this.bird.y + 5, 2, 2);
        
        // Bico
        this.ctx.fillStyle = '#ff8800';
        this.ctx.fillRect(this.bird.x + 20, this.bird.y + 8, 6, 4);
        
        // Asa
        this.ctx.fillStyle = '#ffcc00';
        const wingFlap = Math.sin(Date.now() * 0.01) > 0 ? 2 : 0;
        this.ctx.fillRect(this.bird.x + 4, this.bird.y + 8 + wingFlap, 8, 6);
    }
    
    drawPipe(pipe) {
        // Cano superior
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
        
        // Cano inferior
        this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
        
        // Bordas dos canos (efeito pixel)
        this.ctx.fillStyle = '#00cc00';
        this.ctx.fillRect(pipe.x, 0, 2, pipe.topHeight);
        this.ctx.fillRect(pipe.x + this.pipeWidth - 2, 0, 2, pipe.topHeight);
        this.ctx.fillRect(pipe.x, pipe.bottomY, 2, pipe.bottomHeight);
        this.ctx.fillRect(pipe.x + this.pipeWidth - 2, pipe.bottomY, 2, pipe.bottomHeight);
        
        // Parte superior dos canos (caps)
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, this.pipeWidth + 8, 20);
        this.ctx.fillRect(pipe.x - 4, pipe.bottomY, this.pipeWidth + 8, 20);
        
        // Bordas das partes superiores
        this.ctx.fillStyle = '#00cc00';
        this.ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, 2, 20);
        this.ctx.fillRect(pipe.x + this.pipeWidth + 2, pipe.topHeight - 20, 2, 20);
        this.ctx.fillRect(pipe.x - 4, pipe.bottomY, 2, 20);
        this.ctx.fillRect(pipe.x + this.pipeWidth + 2, pipe.bottomY, 2, 20);
        
        // Área do gap (para debug visual - linha invisível)
        // this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        // this.ctx.fillRect(pipe.x, pipe.topHeight, this.pipeWidth, this.pipeGap);
    }
    
    drawTrail() {
        // Rastro do pássaro
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        for (let i = 1; i <= 3; i++) {
            this.ctx.fillRect(
                this.bird.x - i * 8,
                this.bird.y + 2,
                6,
                16
            );
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new FlappyBird();
});

// Prevenir scroll da página com espaço
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
    }
});