// Game State Management
let currentPlayer = 'X';
let gameActive = true;
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameMode = 'PvP';
let gamePaused = false;

// DOM Elements
const cells = document.querySelectorAll('.cell');
const gameBoardElement = document.getElementById('gameBoard');
const messageElement = document.getElementById('message');
const resultMessage = document.getElementById('resultMessage');
const restartButton = document.getElementById('restartBtn');
const pauseButton = document.getElementById('pauseBtn');
const homeScreen = document.getElementById('homeScreen');
const playPvPButton = document.getElementById('playPvP');
const playPvCButton = document.getElementById('playPvC');

// Event Listeners
playPvPButton.addEventListener('click', () => startGame('PvP'));
playPvCButton.addEventListener('click', () => startGame('PvC'));
restartButton.addEventListener('click', restartGame);
pauseButton.addEventListener('click', togglePause);

// Initialize Game
function startGame(mode) {
    gameMode = mode;
    resetGameState();
    homeScreen.style.display = 'none';
    gameBoardElement.style.display = 'grid';
    messageElement.style.display = 'none';
    
    cells.forEach(cell => {
        cell.classList.remove('winning');
        cell.addEventListener('click', handleCellClick);
    });

    if (gameMode === 'PvC' && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

// Handle Cell Interaction
function handleCellClick(event) {
    if (gamePaused || !gameActive) return;
    
    const cell = event.target;
    const index = cell.dataset.index;

    if (gameBoard[index] === '') {
        gameBoard[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        animateMove(cell);

        if (checkWin()) handleWin();
        else if (checkDraw()) handleDraw();
        else switchPlayer();
    }
}

// AI Minimax Algorithm for Super Hard AI
function minimax(board, depth, isMaximizing) {
    if (checkWinAI(board, 'O')) return 10 - depth; // AI Wins
    if (checkWinAI(board, 'X')) return depth - 10; // Player Wins
    if (board.every(cell => cell !== '')) return 0; // Draw

    let bestScore = isMaximizing ? -Infinity : Infinity;
    
    board.forEach((cell, index) => {
        if (cell === '') {
            board[index] = isMaximizing ? 'O' : 'X';
            let score = minimax(board, depth + 1, !isMaximizing);
            board[index] = ''; // Undo move

            bestScore = isMaximizing 
                ? Math.max(score, bestScore) 
                : Math.min(score, bestScore);
        }
    });

    return bestScore;
}

// Improved AI Move Selection
function computerMove() {
    if (!gameActive || gamePaused) return;

    let bestMove = -1;
    let bestScore = -Infinity;

    gameBoard.forEach((cell, index) => {
        if (cell === '') {
            gameBoard[index] = 'O';
            let score = minimax(gameBoard, 0, false);
            gameBoard[index] = ''; // Undo move

            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }
    });

    if (bestMove !== -1) {
        gameBoard[bestMove] = 'O';
        const cell = cells[bestMove];
        cell.textContent = 'O';
        cell.classList.add('o');
        animateMove(cell);

        if (checkWin()) handleWin();
        else if (checkDraw()) handleDraw();
        else switchPlayer();
    }
}

// Check Win Helper for AI
function checkWinAI(board, player) {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Columns
        [0,4,8], [2,4,6] // Diagonals
    ];

    return winPatterns.some(pattern => 
        board[pattern[0]] === player &&
        board[pattern[1]] === player &&
        board[pattern[2]] === player
    );
}

// Game Logic Helpers
function checkWin() {
    return checkWinAI(gameBoard, currentPlayer);
}

function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

function handleWin() {
    gameActive = false;
    highlightWin();
    resultMessage.textContent = `${currentPlayer} Wins!`;
    messageElement.style.display = 'block';
}

function handleDraw() {
    gameActive = false;
    resultMessage.textContent = "Game Draw!";
    messageElement.style.display = 'block';
}

function highlightWin() {
    const winPatterns = [...document.querySelectorAll('.cell')]
        .map((cell, index) => ({ cell, index }))
        .filter(({ index }) => gameBoard[index] === currentPlayer);

    winPatterns.forEach(({ cell }) => cell.classList.add('winning'));
}

// Utilities
function animateMove(element) {
    gsap.fromTo(element, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (gameMode === 'PvC' && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

function resetGameState() {
    currentPlayer = 'X';
    gameActive = true;
    gamePaused = false;
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
}

function restartGame() {
    messageElement.style.display = 'none';
    startGame(gameMode);
}
