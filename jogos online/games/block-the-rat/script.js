class BlockTheRat {
    constructor() {
        this.boardSize = 11;
        this.gameState = 'instructions'; // 'instructions', 'playing', 'gameOver'
        this.moves = 0;
        this.bestScore = localStorage.getItem('blockRatBest') || null;
        
        // Posições no grid
        this.ratPosition = { x: 5, y: 5 }; // Centro do grid
        this.walls = new Set();
        this.initialWalls = new Set();
        
        // Elementos da interface
        this.gameBoard = document.getElementById('gameBoard');
        this.movesElement = document.getElementById('moves');
        this.bestElement = document.getElementById('best');
        this.finalMovesElement = document.getElementById('finalMoves');
        this.bestScoreElement = document.getElementById('bestScore');
        this.ratingElement = document.getElementById('rating');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.instructions = document.getElementById('instructions');
        this.startBtn = document.getElementById('startBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        this.initEvents();
        this.updateUI();
    }
    
    initEvents() {
        // Eventos de botões
        this.startBtn.addEventListener('click', () => this.startGame());
        this.playAgainBtn.addEventListener('click', () => this.startGame());
        
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') {
                this.startGame();
            }
            if (e.code === 'KeyH' && this.gameState === 'playing') {
                this.showHint();
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.moves = 0;
        this.walls.clear();
        this.initialWalls.clear();
        
        // Posicionar rato no centro
        this.ratPosition = { x: 5, y: 5 };
        
        // Gerar muros iniciais aleatórios
        this.generateInitialWalls();
        
        // Esconder telas
        this.instructions.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        // Criar o tabuleiro
        this.createBoard();
        this.updateUI();
    }
    
    generateInitialWalls() {
        const numInitialWalls = 8 + Math.floor(Math.random() * 5); // 8-12 muros iniciais
        
        for (let i = 0; i < numInitialWalls; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.boardSize);
                y = Math.floor(Math.random() * this.boardSize);
            } while (
                (x === this.ratPosition.x && y === this.ratPosition.y) || // Não no rato
                this.walls.has(`${x},${y}`) || // Não sobrepor muros
                this.isAdjacentToRat(x, y) // Não adjacente ao rato (deixar espaço)
            );
            
            const wallKey = `${x},${y}`;
            this.walls.add(wallKey);
            this.initialWalls.add(wallKey);
        }
    }
    
    isAdjacentToRat(x, y) {
        const dx = Math.abs(x - this.ratPosition.x);
        const dy = Math.abs(y - this.ratPosition.y);
        return dx <= 1 && dy <= 1;
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Adicionar eventos de clique
                cell.addEventListener('click', () => this.handleCellClick(x, y));
                
                this.gameBoard.appendChild(cell);
            }
        }
        
        this.updateBoard();
    }
    
    updateBoard() {
        const cells = this.gameBoard.querySelectorAll('.cell');
        
        cells.forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const cellKey = `${x},${y}`;
            
            // Limpar classes
            cell.className = 'cell';
            
            // Adicionar classes apropriadas
            if (x === this.ratPosition.x && y === this.ratPosition.y) {
                cell.classList.add('rat');
            } else if (this.walls.has(cellKey)) {
                cell.classList.add('wall');
            }
        });
    }
    
    handleCellClick(x, y) {
        if (this.gameState !== 'playing') return;
        
        const cellKey = `${x},${y}`;
        
        // Não permitir clicar no rato ou em muros existentes
        if (x === this.ratPosition.x && y === this.ratPosition.y) return;
        if (this.walls.has(cellKey)) return;
        
        // Adicionar muro
        this.walls.add(cellKey);
        this.moves++;
        
        // Efeito visual
        const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        cell.classList.add('wall-appear');
        
        this.updateBoard();
        this.updateUI();
        
        // Verificar se o rato está bloqueado
        if (this.isRatBlocked()) {
            this.gameWin();
            return;
        }
        
        // Mover o rato
        setTimeout(() => {
            this.moveRat();
        }, 300);
    }
    
    moveRat() {
        const possibleMoves = this.getPossibleMoves();
        
        if (possibleMoves.length === 0) {
            this.gameWin();
            return;
        }
        
        // Escolher movimento aleatório
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        
        // Animar movimento do rato
        const oldCell = document.querySelector(`[data-x="${this.ratPosition.x}"][data-y="${this.ratPosition.y}"]`);
        oldCell.classList.add('rat-move');
        
        this.ratPosition = randomMove;
        
        setTimeout(() => {
            this.updateBoard();
        }, 250);
    }
    
    getPossibleMoves() {
        const moves = [];
        const directions = [
            { dx: -1, dy: 0 },  // Esquerda
            { dx: 1, dy: 0 },   // Direita
            { dx: 0, dy: -1 },  // Cima
            { dx: 0, dy: 1 },   // Baixo
            { dx: -1, dy: -1 }, // Diagonal esquerda-cima
            { dx: 1, dy: -1 },  // Diagonal direita-cima
            { dx: -1, dy: 1 },  // Diagonal esquerda-baixo
            { dx: 1, dy: 1 }    // Diagonal direita-baixo
        ];
        
        for (const dir of directions) {
            const newX = this.ratPosition.x + dir.dx;
            const newY = this.ratPosition.y + dir.dy;
            
            if (this.isValidMove(newX, newY)) {
                moves.push({ x: newX, y: newY });
            }
        }
        
        return moves;
    }
    
    isValidMove(x, y) {
        // Verificar limites do tabuleiro
        if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
            return false;
        }
        
        // Verificar se há muro na posição
        return !this.walls.has(`${x},${y}`);
    }
    
    isRatBlocked() {
        return this.getPossibleMoves().length === 0;
    }
    
    gameWin() {
        this.gameState = 'gameOver';
        
        // Atualizar melhor pontuação
        if (!this.bestScore || this.moves < this.bestScore) {
            this.bestScore = this.moves;
            localStorage.setItem('blockRatBest', this.bestScore);
        }
        
        // Mostrar efeito de vitória
        this.gameBoard.classList.add('game-win');
        
        // Mostrar tela de fim de jogo
        setTimeout(() => {
            this.showGameOverScreen();
        }, 1000);
    }
    
    showGameOverScreen() {
        this.finalMovesElement.textContent = this.moves;
        this.bestScoreElement.textContent = this.bestScore;
        
        // Calcular classificação
        const rating = this.getRating(this.moves);
        this.ratingElement.textContent = rating;
        
        this.gameOverScreen.classList.remove('hidden');
    }
    
    getRating(moves) {
        if (moves <= 8) return '⭐⭐⭐ PERFEITO!';
        if (moves <= 12) return '⭐⭐ EXCELENTE!';
        if (moves <= 16) return '⭐ BOM!';
        if (moves <= 20) return '👍 REGULAR';
        return '💪 CONTINUE TENTANDO';
    }
    
    showHint() {
        // Encontrar células que bloqueiam mais movimentos do rato
        const hintCells = this.getHintCells();
        
        // Limpar hints anteriores
        document.querySelectorAll('.cell.hint').forEach(cell => {
            cell.classList.remove('hint');
        });
        
        // Mostrar dicas
        hintCells.forEach(cell => {
            const cellElement = document.querySelector(`[data-x="${cell.x}"][data-y="${cell.y}"]`);
            if (cellElement && !cellElement.classList.contains('wall') && 
                !(cell.x === this.ratPosition.x && cell.y === this.ratPosition.y)) {
                cellElement.classList.add('hint');
            }
        });
        
        // Remover dicas após 3 segundos
        setTimeout(() => {
            document.querySelectorAll('.cell.hint').forEach(cell => {
                cell.classList.remove('hint');
            });
        }, 3000);
    }
    
    getHintCells() {
        const hints = [];
        const currentMoves = this.getPossibleMoves().length;
        
        // Testar cada célula vazia para ver qual bloqueia mais movimentos
        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                if (this.isValidMove(x, y) && !(x === this.ratPosition.x && y === this.ratPosition.y)) {
                    // Simular parede temporária
                    this.walls.add(`${x},${y}`);
                    const newMoves = this.getPossibleMoves().length;
                    const blockedMoves = currentMoves - newMoves;
                    this.walls.delete(`${x},${y}`);
                    
                    if (blockedMoves >= 2) { // Só mostrar se bloquear pelo menos 2 movimentos
                        hints.push({ x, y, blockedMoves });
                    }
                }
            }
        }
        
        // Ordenar por eficácia e retornar os 3 melhores
        return hints
            .sort((a, b) => b.blockedMoves - a.blockedMoves)
            .slice(0, 3);
    }
    
    updateUI() {
        this.movesElement.textContent = this.moves;
        this.bestElement.textContent = this.bestScore || '-';
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new BlockTheRat();
});

// Prevenir seleção de texto
document.addEventListener('selectstart', e => e.preventDefault());