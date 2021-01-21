'use strict'

const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️';

var gBoard = [];
var gLevel = {
    size: null, mines: null
};
var gGame = {
    isOn: false, //Boolean, when true we let the user play
    shownCount: 0, //didn't use that
    markedCount: 0, //didn't use that
    secsPassed: 0 //didn't use that
}

var gIsWon = false;//var for the score count - to not update the score if the player lost the game
var gFirstCellClicked;//var to help make the game in a way that the first clicked cell will never be a mine
var gLivesCount;//lives counter
var gShowTimeInterval;//var for the timer
var gElLivesCount = document.querySelector('.life');//life element
var gElPlaySmiley = document.querySelector('.play-again');//smily-newGame element
var gElGameOverMessage = document.querySelector('.game-over');//game-over message element
var gElStopWatch = document.querySelector('.time');//timer element
var gElScore = document.querySelector('.score-num');//score element
var gScores = [0, 0, 0];//array of scores for all 3 levels
var gLevelIdx = 0;//so we can pull the needed score from the array. begginer=0, medium=1, expert=2


//initiate Game
function initGame(elButton) {
    gElPlaySmiley.innerText = '😀'
    stopWatch();
    gFirstCellClicked = false;
    gElGameOverMessage.style.display = 'none';

    dificultyCheck(elButton);

    gIsWon = false;
    gElStopWatch.innerText = '0';

    if (gLevel.mines > 2) {//dificulty check for the initial life count. Begginer will receive two hearts instead of 3
        gLivesCount = 3;
    } else gLivesCount = 2;
    gElLivesCount.innerText = LIFE.repeat(gLivesCount);

    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard, '.board-container');
    gGame.isOn = true;
}


//dificulty check
function dificultyCheck(elButton) {
    if (elButton.innerText === 'Beginner') {
        gLevel.size = 4;
        gLevel.mines = 2;
        gLevelIdx = 0;
        gElScore.innerText = score(gLevelIdx );
    }
    else if (elButton.innerText === 'Medium') {
        gLevel.size = 8;
        gLevel.mines = 12;
        gLevelIdx = 1;
        gElScore.innerText = score(gLevelIdx );
    }
    else if (elButton.innerText === 'Expert') {
        gLevel.size = 12;
        gLevel.mines = 30;
        gLevelIdx = 2;
        gElScore.innerText = score(gLevelIdx );
    }
    else if (elButton.innerText === '😀' ||
        elButton.innerText === '🤯' ||
        elButton.innerText === '😎') gElScore.innerText = score(gLevelIdx);
    else if (!gLevel.size) {
        gLevel.size = 4;
        gLevel.mines = 2;
        gElScore.innerText = 0;
    }
}

//score count per lever
function score(idx) {
    if (gIsWon && gElStopWatch.innerText > 0 && gScores[idx] === 0) {
        gElScore.innerText = gElStopWatch.innerText;
        gScores[idx] = gElStopWatch.innerText;

    }
    if (gIsWon && gElStopWatch.innerText > 0 && +(gElStopWatch.innerText) < +(gScores[idx])) {
        gElScore.innerText = gElStopWatch.innerText;
        gScores[idx] = gElStopWatch.innerText;
    }
    console.log('gScores', gScores);
    console.log('gScores[idx]', gScores[idx]);
    gElStopWatch.innerText = '0';
    return gScores[idx];
}


//build Board
function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = { minesAroundCount: null, isShown: false, isMine: false, isMarked: false };
            board[i][j] = cell;
        }
    }
    return board;
}


//insert Random Mines
function insertRandomMines(iIdx, jIdx) {
    var emptyCells = getEmptyCells(gBoard, iIdx, jIdx);
    for (var i = 0; i < gLevel.mines; i++) {
        var randomLocation = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gBoard[randomLocation.i][randomLocation.j] = { minesAroundCount: null, isShown: false, isMine: true, isMarked: false };
        emptyCells.splice(emptyCells.indexOf(randomLocation), 1);
    }
}


//insert NeighborMineCount
function insertNeighborMineCount() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j);
        }
    }
}


//render Board
function renderBoard(board, selector) {
    var strHTML = '<table border="0" class="center"><tbody>';
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

    for (var i = 0; i < board.length; i++) {//add "hidden" class to all sells that are !isShown
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isShown) {
                var className = getClassName(i, j);
                var elCell = document.querySelector(className);
                elCell.classList.add('.hidden');
            }
        }
    }
}


//cell Clicked
function cellClicked(elCell, i, j) {
    if (gGame.isOn === false) return;
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return;

    if (!gFirstCellClicked) {
        addStopWatch();
        insertRandomMines(i, j);
        insertNeighborMineCount();
        gFirstCellClicked = true;
        renderBoard(gBoard, '.board-container');
    }

    if (!gBoard[i][j].isShown) {
        elCell.classList.remove('hidden');
        gBoard[i][j].isShown = true;
    }

    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, i, j);

    if (gBoard[i][j].isMine && gLivesCount > 1) {
        gLivesCount--;
        gElLivesCount.innerText = LIFE.repeat(gLivesCount);
    }
    else if (gBoard[i][j].isMine) {
        gLivesCount--;
        gElLivesCount.innerText = LIFE.repeat(gLivesCount);
        checkGameOver('lose');
    }

    renderBoard(gBoard, '.board-container');
    checkGameOver();
}


//cell Marked
function cellMarked(elCell, i, j) {
    if (gGame.isOn === false) return;
    if (gBoard[i][j].isShown && !gBoard[i][j].isMarked) return;

    if (!gFirstCellClicked) {
        addStopWatch();
        gFirstCellClicked = true;
    }

    if (gBoard[i][j].isMarked === true) {
        gBoard[i][j].isMarked = false;
        elCell.classList.add('hidden');
        gBoard[i][j].isShown = false;
    } else {
        gBoard[i][j].isMarked = true;
        elCell.classList.remove('hidden');
        gBoard[i][j].isShown = true;
    }

    renderBoard(gBoard, '.board-container');
    checkGameOver();
}


function expandShown(board, rowIdx, colIdx) {//expand cells that are neighbors of the given cell, that are not mines
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var currCell = board[i][j];
            if (!currCell.isMine && !currCell.isShown) {
                gBoard[i][j].isShown = true;
                if (!currCell.minesAroundCount) expandShown(board, i, j);
            }
        }
    }
    renderBoard(gBoard, '.board-container');
}


function checkGameOver(winOrLose) {//Game Over process
    if (winOrLose === 'lose') {
        showAllMines();
        gElGameOverMessage.style.display = 'block';
        gElGameOverMessage.innerText = 'Game Over, try again!'
        gElPlaySmiley.innerText = '🤯'
        gGame.isOn = false;
        gIsWon = false;
        stopWatch();
        return;
    }

    if (areAllCellsShown() && areAllMarkedCellsMines() && gLivesCount) victory();
}

function victory() {//victory process
    gElGameOverMessage.style.display = 'block';
    gElGameOverMessage.innerText = 'Victory!';
    gElPlaySmiley.innerText = '😎';
    gGame.isOn = false;
    stopWatch();
    gIsWon = true;
    gElScore.innerText = score(gLevelIdx);
    return;
}

function areAllCellsShown() {//checking if all of the cells on the bored are shown(marked are shown as well)
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isShown) count++;
        }
    }
    if (count === gLevel.size ** 2) return true;
}

function areAllMarkedCellsMines() {//checking if all of the marked cells on the bored are mines
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMarked && !currCell.isMine) return false;
        }
    }
    return true;
}

function showAllMines() {//show all mines if the player lost the game
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine === true) {
                gBoard[i][j].isShown = true;
            }
        }
    }
}