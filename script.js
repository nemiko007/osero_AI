const boardDiv = document.getElementById('board');
const messageP = document.getElementById('message');
const resetBtn = document.getElementById('reset');

let game = null;
let interpreter = null;

async function loadModel() {
    try {
        const response = await fetch('model/model.tflite');
        const buffer = await response.arrayBuffer();
        interpreter = new tflite.TFLite({wasmPaths: ["https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@1.5.0/dist/tf-tflite.min.js"]});
        interpreter.loadModel(buffer);
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

async function updateBoard() {
    const board = game.board;
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.classList.remove('black', 'white');
        cell.textContent = '';
        if (board[row][col] === 1) {
            cell.classList.add('black');
            cell.textContent = '⚫';
        } else if (board[row][col] === -1) {
            cell.classList.add('white');
            cell.textContent = '⚪';
        }
    });
    messageP.textContent = game.message;
}

async function handleMove(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if (game.player === 1) {
        messageP.textContent = "It's AI's turn.";
        return;
    }
    game.make_move(row, col);
    await aiMove();
    await updateBoard();
}

async function aiMove() {
    if (game.is_game_over()) {
        return;
    }
    if (game.player === -1) {
        return;
    }
    const move = await getBestMove();
    if (move) {
        game.make_move(move.row, move.col);
    }
}

async function getBestMove() {
    const validMoves = game.get_valid_moves();
    if (!validMoves || validMoves.length === 0) {
        return null;
    }

    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of validMoves) {
        const row = move.row;
        const col = move.col;
        const boardCopy = game.board.map(row => [...row]);
        boardCopy[row][col] = game.player;

        const inputTensor = tf.tensor([boardCopy.flat()], [1, 8, 8, 1], 'float32');
        interpreter.setInput(inputTensor, 0);

        interpreter.invoke();

        const outputTensor = interpreter.getOutput(0);
        const prediction = await outputTensor.data();
        const score = prediction[0];

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
}

resetBtn.addEventListener('click', async () => {
    game = new Othello();
    await updateBoard();
});

async function init() {
    await loadModel();
    game = new Othello();
    createBoard();
    await updateBoard();
}

class Othello {
    constructor() {
        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, -1, 0, 0, 0],
            [0, 0, 0, -1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        this.player = -1;
        this.message = "Your turn";
    }

    get_valid_moves() {
        let moves = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] === 0) {
                    if (this.is_valid_move(i, j)) {
                        moves.push({row: i, col: j});
                    }
                }
            }
        }
        return moves;
    }

    is_valid_move(row, col) {
        if (this.board[row][col] !== 0) {
            return false;
        }
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) {
                    continue;
                }
                let r = row + dr;
                let c = col + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === -this.player) {
                    while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === -this.player) {
                        r += dr;
                        c += dc;
                    }
                    if (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === this.player) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    make_move(row, col) {
        if (!this.is_valid_move(row, col)) {
            return false;
        }
        this.board[row][col] = this.player;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) {
                    continue;
                }
                let r = row + dr;
                let c = col + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === -this.player) {
                    let toFlip = [];
                    while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === -this.player) {
                        toFlip.push({row: r, col: c});
                        r += dr;
                        c += dc;
                    }
                    if (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === this.player) {
                        for (let flip of toFlip) {
                            this.board[flip.row][flip.col] = this.player;
                        }
                    }
                }
            }
        }
        this.player *= -1;
        return true;
    }

    is_game_over() {
        if (this.get_valid_moves().length > 0) {
            return false;
        }
        this.player *= -1;
        if (this.get_valid_moves().length > 0) {
            this.player *= -1;
            return false;
        }
        return true;
    }

    get_winner() {
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
            return 1;
        } else if (whiteCount > blackCount) {
            return -1;
        } else {
            return 0;
        }
    }
}

init();
