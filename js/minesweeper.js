'use strict'

const MINE = '💣'
const FLAG = '🚩'
var gBoard = [];
var life = '❤️';

var gLevel = {
    size: null, mines: null
};

var gGame = {
    isOn: false, //Boolean, when true we let the user play
    shownCount: 0, //How many cells are shown
    markedCount: 0, //didn't use that
    secsPassed: 0 //didn't use that
}

var isWon = false;
var gFirstCellClicked;
var isFirstGame = true;
var gShowTimeInterval = null;
var gLivesCount;
var gElLivesCount = document.querySelector('.life');
var gElPlaySmiley = document.querySelector('.play-again');
var gElGameOverMessage = document.querySelector('.game-over');


//initGame
function initGame(elButton) {
    gElPlaySmiley.innerText = '😀'
    gGame.shownCount = 0;
    stopWatch();
    gFirstCellClicked = false;

    var elScore = document.querySelector('#score-num');
    console.log('elScore', elScore);
    var elStopWatch = document.querySelector('.time');
    console.log('elStopWatch', elStopWatch)
    console.log('elStopWatch.innerText', elStopWatch.innerText)

    if (isWon && isFirstGame) {
        console.log('isFirstGame?', isFirstGame);
        elScore.innerText = elStopWatch.innerText;
        isFirstGame = false;
    }
    if (isWon && elStopWatch.innerText > 0 && +(elStopWatch.innerText) < +(elScore.innerText)) {
        elScore.innerText = elStopWatch.innerText;
        isWon = false;
    }
    elStopWatch.innerText = '0';

    var elGameOverMessage = document.querySelector('.game-over');
    elGameOverMessage.style.display = 'none';

    if (elButton.innerText === 'Beginner') {
        gLevel.size = 4;
        gLevel.mines = 2;
    }
    else if (elButton.innerText === 'Medium') {
        gLevel.size = 8;
        gLevel.mines = 12;
    }
    else if (elButton.innerText === 'Expert') {
        gLevel.size = 12;
        gLevel.mines = 30;
    }
    else if (!gLevel.size) {
        gLevel.size = 4;
        gLevel.mines = 2;
    }

    if (gLevel.mines > 2) {
        gLivesCount = 3;
    } else gLivesCount = 2;
    gElLivesCount.innerText = life.repeat(gLivesCount);

    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard, '.board-container');
    gGame.isOn = true;
    // console.log(gBoard);
}


//buildBoard
function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = { minesAroundCount: null, isShown: false, isMine: false, isMarked: false };
            board[i][j] = cell;
        }
    }
    // console.table(board);
    return board;
}


//insertRandomMines
function insertRandomMines(iIdx, jIdx) {
    //insert mines in random coords - make a seperate function!
    var emptyCells = getEmptyCells(gBoard, iIdx, jIdx);
    for (var i = 0; i < gLevel.mines; i++) {
        var randomLocation = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gBoard[randomLocation.i][randomLocation.j] = { minesAroundCount: null, isShown: false, isMine: true, isMarked: false };
        emptyCells.splice(emptyCells.indexOf(randomLocation), 1);
    }
}


//insertNeighborMineCount
function insertNeighborMineCount() {
    //insert neighbor mines count - make a seperate function!
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j);
        }
    }
}


//renderBoard
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
    console.log('gBoard after render:');
    console.table(gBoard);
}


//cellClicked
function cellClicked(elCell, i, j) {
    if (gGame.isOn === false) return;
    if (gBoard[i][j].isMarked) return;

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
        gGame.shownCount++;
    }

    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, elCell, i, j);

    if (gBoard[i][j].isMine && gLivesCount > 1) {
        gLivesCount--;
        gElLivesCount.innerText = life.repeat(gLivesCount);
    }
    else if (gBoard[i][j].isMine) {
        gLivesCount--;
        gElLivesCount.innerText = life.repeat(gLivesCount);
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


    if (winOrLoose === 'loose') {
        gElGameOverMessage.style.display = 'block';
        gElGameOverMessage.innerText = 'Game Over, You loose!'
        gElPlaySmiley.innerText = '🤯'
        gGame.isOn = false;
        isWon = false;
        stopWatch();
        return;
    }

    var countMarkedMines = 0;
    var countShownMines = 0;
    for (var i = 0; i < gBoard.length; i++) {//counting marked mines and shown mines
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine && currCell.isMarked) {
                countMarkedMines++;
                countShownMines--;//because a marked mine is also shown(so we can see the flag)
            }
            if (currCell.isMine && currCell.isShown) countShownMines++;
        }
    }
    console.log('countMarkedMines', countMarkedMines);
    console.log('countShownMines', countShownMines);
    console.log('gGame.shownCount', gGame.shownCount);
    if (countMarkedMines === gLevel.mines &&
        gGame.shownCount === (gLevel.size ** 2 - gLevel.mines)) victory();//takes care of cases of victory without loosing hearts
    if (gLivesCount && gGame.shownCount === (gLevel.size ** 2 - gLevel.mines + countShownMines)) {//adding countShownMines because in this case they are counted in gGame.shownCount as well
        victory();//takes care of cases of victory with loosing hearts but not all of them
    }
}

function victory() {
    gElGameOverMessage.style.display = 'block';
    gElGameOverMessage.innerText = 'victory!';
    gElPlaySmiley.innerText = '😎';
    gGame.isOn = false;
    stopWatch();
    isWon = true;
    return;
}