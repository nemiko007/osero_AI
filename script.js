const boardDiv = document.getElementById('board');
const messageP = document.getElementById('message');
const resetBtn = document.getElementById('reset');

let game = null;
let interpreter = null;

async function loadModel() {
    try {
        const response = await fetch('/model/model.tflite');
        const buffer = await response.arrayBuffer();
        const tfliteModel = new tflite.TFLite({wasmPaths: ["https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@1.5.0/dist/tf-tflite.min.js"]});
        interpreter = await tfliteModel.loadModel(buffer);
        console.log("Model loaded");
    } catch (e) {
        console.error("Failed to load model", e);
        messageP.textContent = "Failed to load model. Check console for errors.";
    }
}

function createBoard() {
    boardDiv.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleMove);
            boardDiv.appendChild(cell);
        }
    }
}

function updateBoard() {
    const board = game.board;
    const cells = document.querySelectorAll('.cell');
    const legalMoves = game.getValidMoves();

    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellValue = board[row][col];

        cell.textContent = '';
        cell.classList.remove('black', 'white', 'legal-move');

        if (cellValue === 1) {
            cell.classList.add('black');
            cell.textContent = '⚫';
        } else if (cellValue === -1) {
            cell.classList.add('white');
            cell.textContent = '⚪';
        }

        if (legalMoves.some(move => move.row === row && move.col === col)) {
            cell.classList.add('legal-move');
            cell.textContent = '🟢';
        }
    });

    messageP.textContent = game.message;
}

async function handleMove(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (game.isValidMove(row, col)) {
        game.makeMove(row, col);
        updateBoard();

        if (game.isGameOver()) {
            game.player *= -1;
            game.message = game.player === -1 ? "Your turn" : "AI's turn";
            updateBoard();
        } else {
            await aiMove();
        }
    }
}

async function aiMove() {
    if (!game.isGameOver() && game.player === 1) {
        const bestMove = await getBestMove();
        if (bestMove) {
            game.makeMove(bestMove.row, bestMove.col);
            updateBoard();
        }
    }
}

async function getBestMove() {
    const validMoves = game.getValidMoves();
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of validMoves) {
        const row = move.row;
        const col = move.col;

        // Simulate the move
        const tempBoard = game.board.map(row => [...row]);
        tempBoard[row][col] = game.player;

        // Evaluate the score (you might need a more sophisticated evaluation function)
        let score = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                score += tempBoard[i][j];
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

resetBtn.addEventListener('click', () => {
    game = new Othello();
    updateBoard();
});

class Othello {
    constructor() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(0));
        this.board[3][3] = 1;
        this.board[4][4] = 1;
        this.board[3][4] = -1;
        this.board[4][3] = -1;
        this.player = -1; // -1: user, 1: AI
        this.message = "Your turn";
    }

    isValidMove(row, col) {
        if (this.board[row][col] !== 0) {
            return false;
        }

        let isValid = false;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                let r = row + dr;
                let c = col + dc;
                let foundOpponent = false;

                while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === -this.player) {
                    foundOpponent = true;
                    r += dr;
                    c += dc;
                }

                if (foundOpponent && r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === this.player) {
                    isValid = true;
                    break;
                }
            }
            if (isValid) break;
        }

        return isValid;
    }

    getValidMoves() {
        const validMoves = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.isValidMove(i, j)) {
                    validMoves.push({ row: i, col: j });
                }
            }
        }
        return validMoves;
    }

    makeMove(row, col) {
        if (!this.isValidMove(row, col)) {
            return false;
        }

        this.board[row][col] = this.player;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                let r = row + dr;
                let c = col + dc;
                let tilesToFlip = [];

                while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === -this.player) {
                    tilesToFlip.push({ row: r, col: c });
                    r += dr;
                    c += dc;
                }

                if (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === this.player) {
                    for (const tile of tilesToFlip) {
                        this.board[tile.row][tile.col] = this.player;
                    }
                }
            }
        }

        this.player *= -1;
        this.message = this.player === -1 ? "Your turn" : "AI's turn";
        return true;
    }

    isGameOver() {
        return this.getValidMoves().length === 0;
    }

    getWinner() {
        let blackCount = 0;
        let whiteCount = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] === 1) {
                    blackCount++;
                } else if (this.board[i][j] === -1) {
                    whiteCount++;
                }
            }
        }

        if (blackCount > whiteCount) {
            return 1; // AI wins
        } else if (whiteCount > blackCount) {
            return -1; // User wins
        } else {
            return 0; // Tie
        }
    }
}

window.onload = () => {
    game = new Othello();
    createBoard();
    updateBoard();
    loadModel();
    alert('Electron app is running!');
};
