const boardDiv = document.getElementById('board');
const messageP = document.getElementById('message');
const resetBtn = document.getElementById('reset');

let game = null;

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
    try {
        const response = await fetch('/get_board');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        game = await response.json();
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
    } catch (error) {
        console.error("Failed to update board:", error);
        messageP.textContent = "Failed to load board. Check console for errors.";
    }
}

async function handleMove(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    const response = await fetch(`/make_move/${row}/${col}`);
    await updateBoard();
}

resetBtn.addEventListener('click', async () => {
    await fetch('/reset_game');
    await updateBoard();
});

async function init() {
    createBoard();
    await updateBoard();
}

init();
