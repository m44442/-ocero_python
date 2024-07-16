const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const messageEl = document.getElementById('message');

const SCREEN_W = 360; 
const SCREEN_H = 360; 
const SQUARE_NUM = 8;
const SQUARE_SIZE = SCREEN_W / SQUARE_NUM;

const BLACK = 'black';
const WHITE = 'white';
const RED = 'red';
const GREEN = 'green';
const BLUE = 'blue';
const YELLOW = 'yellow';

let board = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, -1, 1, 0, 0, 0],
    [0, 0, 0, 1, -1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

let player = 1;
let gameOver = false;
let passNum = 0;

const vecTable = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
];

function drawGrid() {
    for (let i = 0; i < SQUARE_NUM; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * SQUARE_SIZE);
        ctx.lineTo(SCREEN_W, i * SQUARE_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i * SQUARE_SIZE, 0);
        ctx.lineTo(i * SQUARE_SIZE, SCREEN_H);
        ctx.stroke();
    }
}

function drawBoard() {
    for (let y = 0; y < SQUARE_NUM; y++) {
        for (let x = 0; x < SQUARE_NUM; x++) {
            if (board[y][x] === 1) {
                ctx.fillStyle = BLACK;
                ctx.beginPath();
                ctx.arc(x * SQUARE_SIZE + SQUARE_SIZE/2, y * SQUARE_SIZE + SQUARE_SIZE/2, SQUARE_SIZE/2 - 5, 0, Math.PI * 2);
                ctx.fill();
            } else if (board[y][x] === -1) {
                ctx.fillStyle = WHITE;
                ctx.beginPath();
                ctx.arc(x * SQUARE_SIZE + SQUARE_SIZE/2, y * SQUARE_SIZE + SQUARE_SIZE/2, SQUARE_SIZE/2 - 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function getValidPosition() {
    let validPositionList = [];
    for (let row = 0; row < SQUARE_NUM; row++) {
        for (let col = 0; col < SQUARE_NUM; col++) {
            if (board[row][col] === 0) {
                for (let [vx, vy] of vecTable) {
                    let x = vx + col;
                    let y = vy + row;
                    if (0 <= x && x < SQUARE_NUM && 0 <= y && y < SQUARE_NUM && board[y][x] === -player) {
                        while (true) {
                            x += vx;
                            y += vy;
                            if (!(0 <= x && x < SQUARE_NUM && 0 <= y && y < SQUARE_NUM)) break;
                            if (board[y][x] === -player) continue;
                            if (board[y][x] === player) {
                                validPositionList.push([col, row]);
                                break;
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
    return validPositionList;
}

function flipPieces(col, row) {
    for (let [vx, vy] of vecTable) {
        let flipList = [];
        let x = vx + col;
        let y = vy + row;
        while (0 <= x && x < SQUARE_NUM && 0 <= y && y < SQUARE_NUM && board[y][x] === -player) {
            flipList.push([x, y]);
            x += vx;
            y += vy;
            if (0 <= x && x < SQUARE_NUM && 0 <= y && y < SQUARE_NUM && board[y][x] === player) {
                for (let [flip_x, flip_y] of flipList) {
                    board[flip_y][flip_x] = player;
                }
                break;
            }
        }
    }
}

function drawMessage(text, color) {
    messageEl.textContent = text;
    messageEl.style.color = color;
}

function resetGame() {
    board = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, -1, 1, 0, 0, 0],
        [0, 0, 0, 1, -1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    player = 1;
    gameOver = false;
    passNum = 0;
    messageEl.textContent = '';
}

function updateGame() {
    ctx.fillStyle = GREEN;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    drawGrid();
    drawBoard();

    let validPositionList = getValidPosition();

    for (let [x, y] of validPositionList) {
        ctx.strokeStyle = YELLOW;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x * SQUARE_SIZE + SQUARE_SIZE/2, y * SQUARE_SIZE + SQUARE_SIZE/2, SQUARE_SIZE/2 - 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (validPositionList.length < 1) {
        player *= -1;
        passNum += 1;
        drawMessage("Skip!", GREEN);
    }

    if (passNum > 1) {
        passNum = 2;
        gameOver = true;
    }

    if (gameOver) {
        let blackNum = board.flat().filter(cell => cell === 1).length;
        let whiteNum = board.flat().filter(cell => cell === -1).length;

        if (blackNum > whiteNum) {
            drawMessage("Black Win!", BLACK);
        } else if (whiteNum > blackNum) {
            drawMessage("White Win!", WHITE);
        } else {
            drawMessage("Draw...", BLUE);
        }
    }
}

canvas.addEventListener('click', (event) => {
    if (gameOver) {
        resetGame();
    } else {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / SQUARE_SIZE);
        const y = Math.floor((event.clientY - rect.top) / SQUARE_SIZE);

        let validPositionList = getValidPosition();
        if (board[y][x] === 0 && validPositionList.some(pos => pos[0] === x && pos[1] === y)) {
            flipPieces(x, y);
            board[y][x] = player;
            player *= -1;
            passNum = 0;
        }
    }
    updateGame();
});

updateGame();