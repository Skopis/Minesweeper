'use strict'

const MINE = '💣'
const FLAG = '🚩'
var gBoard = [];

var gLevel = {
    size: null, mines: null
};

var gGame = {
    isOn: false, //Boolean, when true we let the user play
    shownCount: 0, //How many cells are shown
    markedCount: 0, //How many cells are marked (with a flag)
    secsPassed: 0 //How many seconds passed
}

var isFirstGame = true;
var gFirstCellClicked;
var gShowTimeInterval = null;


//initGame
function initGame(elButton) {
    gGame.shownCount = 0;
    stopWatch();
    gFirstCellClicked = false;

    var elScore = document.querySelector('.score');
    var elStopWatch = document.querySelector('.stop-watch');
    if (!isFirstGame && +(elStopWatch.innerText) < +(elScore.innerText)) {
        elScore.innerText = elStopWatch.innerText;
        var elScoreSpan = document.querySelector('span');
        elScoreSpan.style.display = 'block';
    }
    elStopWatch.innerText = '0';
    isFirstGame = false;

    var elGameOverMessage = document.querySelector('.game-over');
    elGameOverMessage.style.display = 'none';
    gGame.markedCount = 0;

    if (elButton.innerText === 'beginner') {
        gLevel.size = 4;
        gLevel.mines = 2;
    }
    else if (elButton.innerText === 'Medium') {
        gLevel.size = 8;
        gLevel.mines = 12;
    }
    else if (elButton.innerText === 'expert') {
        gLevel.size = 12;
        gLevel.mines = 30;
    }
    else if (!gLevel.size) {
        gLevel.size = 4;
        gLevel.mines = 2;
    }

    gBoard = buildBoard(gLevel.size, gLevel.mines);
    renderBoard(gBoard, '.board-container');
    gGame.isOn = true;
    // console.log(gBoard);
}


//buildBoard
function buildBoard(size, minesNumber) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = { minesAroundCount: null, isShown: false, isMine: false, isMarked: false };
            board[i][j] = cell;
        }
    }

    //insert mines in random coords - make a seperate function!
    var emptyCells = getEmptyCells(board);
    for (var i = 0; i < minesNumber; i++) {
        var randomLocation = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomLocation.i][randomLocation.j] = { minesAroundCount: null, isShown: false, isMine: true, isMarked: false };
        emptyCells.splice(emptyCells.indexOf(randomLocation), 1);
        // console.log(emptyCells)
    }
    //     board[getRandomInt(0, size)][getRandomInt(0, size)] = { minesAroundCount: null, isShown: false, isMine: true, isMarked: false };

    //insert neighbor mines count - make a seperate function!
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j);
        }
    }
    // console.table(board);
    return board;
}


//renderBoard
function renderBoard(board, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = 'cell cell-' + i + '-' + j;
            if (cell.isMine) {
                // var className = 'cell mine-' + i + '-' + j;
                cell = MINE;
            }
            else {
                // var className = 'cell safe-' + i + '-' + j;
                var neighborMines = setMinesNegsCount(board, i, j);
                if (neighborMines > 0) cell = neighborMines;
                else cell = '';
            }
            if (board[i][j].isMarked) {
                cell = FLAG;
            }
            if (board[i][j].isShown) var className2 = 'shown';
            else className2 = 'hidden';

            strHTML += `<td class="${className} ${className2}" onclick="cellClicked(this, ${i}, ${j})"
            oncontextmenu="javascript:cellMarked(this, ${i}, ${j});return false;"> ${cell} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;


    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isShown) {
                var className = getClassName(i, j);
                var elCell = document.querySelector(className);
                elCell.classList.add('.hidden');
            }
        }
    }
    console.log('gBoard after render:');
    console.table(gBoard);
}


//cellClicked
function cellClicked(elCell, i, j) {
    if (gGame.isOn === false) return;
    if (gBoard[i][j].isMarked) return;

    if (gFirstCellClicked === false) {
        addStopWatch();
        gFirstCellClicked = true;
    }

    if (!gBoard[i][j].isShown) {
        elCell.classList.remove('hidden');
        gBoard[i][j].isShown = true;
        gGame.shownCount++;
    }

    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, elCell, i, j);

    if (gBoard[i][j].isMine) {
        checkGameOver('loose');
    }
    renderBoard(gBoard, '.board-container');
    checkGameOver();
}


//cellMarked
function cellMarked(elCell, i, j) {
    if (gGame.isOn === false) return;
    if (gBoard[i][j].isShown && !gBoard[i][j].isMarked) return;

    if (gFirstCellClicked === false) {
        addStopWatch();
        gFirstCellClicked = true;
    }

    if (gBoard[i][j].isMarked === true) {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        elCell.classList.add('hidden');
        gBoard[i][j].isShown = false;
    } else {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        elCell.classList.remove('hidden');
        gBoard[i][j].isShown = true;
    }

    renderBoard(gBoard, '.board-container');
    checkGameOver();
}


//expandShown
function expandShown(board, elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var currCell = board[i][j];
            if (!currCell.isMine && !currCell.isShown) {
                gBoard[i][j].isShown = true;
                elCell.classList.remove('hidden');
                gGame.shownCount++;
            }
        }
    }
    renderBoard(gBoard, '.board-container');
}


//checkGameOver
function checkGameOver(winOrLoose) {
    var elGameOverMessage = document.querySelector('.game-over');

    if (winOrLoose === 'loose') {
        elGameOverMessage.style.display = 'block';
        elGameOverMessage.innerText = 'Game Over, You lost!'
        gGame.isOn = false;
        stopWatch();
        return;
    }

    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine && currCell.isMarked) count++;
        }
    }
    console.log('count:', count);
    console.log('gGame.shownCount', gGame.shownCount);
    if (count === gLevel.mines && gGame.shownCount === (gLevel.size ** 2 - gLevel.mines)) {
        elGameOverMessage.style.display = 'block';
        elGameOverMessage.innerText = 'victory!';
        gGame.isOn = false;
        stopWatch();
        return;
    }
}