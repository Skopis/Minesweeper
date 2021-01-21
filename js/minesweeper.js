'use strict'

const MINE = '💣';
const FLAG = '🚩';
const LIFE = '❤️';
const HINT = '💡';

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
var gelHint = document.querySelector('.hint');
var gElStopWatch = document.querySelector('.time');//timer element
var gElScore = document.querySelector('.score-num');//score element
var gScores = [0, 0, 0];//array of scores for all 3 levels
var gLevelIdx = 0;//so we can pull the needed score from the array. begginer=0, medium=1, expert=2
var gSafeClickRemaining;//remaining safe clicks
var gElSafeClick = document.querySelector('.safe-click');//safe click element
var gHintRemaining;//remaining hints
var gElHint = document.querySelector('.hint');//Hint element
var gHintActive;//is the hint button was clicked it'll be true


//initiate Game
function initGame(elButton) {
    gElPlaySmiley.innerText = '😀'
    stopWatch();
    gFirstCellClicked = false;
    gElGameOverMessage.style.display = 'none';
    gElStopWatch.innerText = '0';

    dificultyCheck(elButton);

    if (gLevel.mines > 2) {//dificulty check for the initial safe clicks count. Begginer will receive two clicks instead of 3
        gSafeClickRemaining = 3;
    } else gSafeClickRemaining = 2;
    gElSafeClick.innerText = 'SafeClicks: ' + gSafeClickRemaining;

    if (gLevel.mines > 2) {//dificulty check for the initial hints count. Begginer will receive two hints instead of 3
        gHintRemaining = 3;
    } else gHintRemaining = 2;
    gelHint.innerText = HINT.repeat(gHintRemaining);

    if (gLevel.mines > 2) {//dificulty check for the initial life count. Begginer will receive two hearts instead of 3
        gLivesCount = 3;
    } else gLivesCount = 2;
    gElLivesCount.innerText = LIFE.repeat(gLivesCount);

    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard, '.board-container');
    gGame.isOn = true;
}


//hint button click
function hint(elButton) {
    if (!gFirstCellClicked) return;
    if (!gHintRemaining) return;
    gHintActive = true;
    if (!gHintRemaining) return;
    gHintRemaining--;
    elButton.innerText = HINT.repeat(gHintRemaining);
}
//hint actication after a cell is clicked
function activateHint(elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            var currCell = gBoard[i][j]
            if (!currCell.isShown) {
                gBoard[i][j].isShown = true;
                renderBoard(gBoard, '.board-container');
                setTimeout(hideCell, 1000, i, j);
            }
        }
    }
    gHintActive = false;
}
//hida back the cell that was revealed
function hideCell(i, j) {
    gBoard[i][j].isShown = false;
    renderBoard(gBoard, '.board-container');
}


//safe click
function safeClick(elButton) {
    if (!gSafeClickRemaining) return;
    gSafeClickRemaining--;
    elButton.innerText = 'SafeClicks: ' + gSafeClickRemaining;
    var emptyCells = getEmptyNotShownCell(gBoard);
    var emptyCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    var className = getClassName(emptyCell.i, emptyCell.j);
    var elEmptyCell = document.querySelector(className);
    elEmptyCell.classList.add('safe');
    setTimeout(function () {
        elEmptyCell.classList.remove('safe');
    }, 3000);
}


//dificulty check
function dificultyCheck(elButton) {
    if (elButton.innerText === 'Beginner') {
        gLevel.size = 4;
        gLevel.mines = 2;
        gLevelIdx = 0;
        gElScore.innerText = score(gLevelIdx);
    }
    else if (elButton.innerText === 'Medium') {
        gLevel.size = 8;
        gLevel.mines = 12;
        gLevelIdx = 1;
        gElScore.innerText = score(gLevelIdx);
    }
    else if (elButton.innerText === 'Expert') {
        gLevel.size = 12;
        gLevel.mines = 30;
        gLevelIdx = 2;
        gElScore.innerText = score(gLevelIdx);
    }
    else if (elButton.innerText === '😀' ||
        elButton.innerText === '🤯' ||
        elButton.innerText === '😎') gElScore.innerText = score(gLevelIdx);//if the user clickes on the smiley, it should use the last level choice
    else if (!gLevel.size) {
        gLevel.size = 4;
        gLevel.mines = 2;
        gElScore.innerText = 0;
    }
}


//score count per lever
function score(idx) {
    if (gIsWon && gElStopWatch.innerText > 0 && gScores[idx] === 0) {//for the first round on a particular level
        gElScore.innerText = gElStopWatch.innerText;
        gScores[idx] = gElStopWatch.innerText;
    }
    if (gIsWon && gElStopWatch.innerText > 0 && +(gElStopWatch.innerText) < +(gScores[idx])) {//for all of the rest(but the first)
        gElScore.innerText = gElStopWatch.innerText;
        gScores[idx] = gElStopWatch.innerText;
    }
    gElStopWatch.innerText = '0';
    gIsWon = false;
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
                elCell.classList.add('hidden');
            }
        }
    }
}


//cell Clicked
function cellClicked(elCell, i, j) {
    if (gGame.isOn === false) return;//if the game is over, don't let it click
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return;//don't let a marked or shown cell be clicked
    if (gHintActive) {//activate hint if it was clicked before this cell
        activateHint(elCell, i, j);
        return;
    }

    if (!gFirstCellClicked) {//if this is the first click, start the watch, add random mines and NeighborMineCount
        addStopWatch();
        insertRandomMines(i, j);
        insertNeighborMineCount();
        gFirstCellClicked = true;
        renderBoard(gBoard, '.board-container');
    }

    if (!gBoard[i][j].isShown) {//if the cell isn't shown - show it
        elCell.classList.remove('hidden');
        gBoard[i][j].isShown = true;
    }

    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, i, j);//call for the expand function

    if (gBoard[i][j].isMine && gLivesCount > 1) {//if you hit a mine but still have more than 1 life left
        gLivesCount--;
        gElLivesCount.innerText = LIFE.repeat(gLivesCount);
    }
    else if (gBoard[i][j].isMine) {//if you hit a mine but don't have only 1 life left
        gLivesCount--;
        gElLivesCount.innerText = LIFE.repeat(gLivesCount);
        checkGameOver('lose');
    }

    renderBoard(gBoard, '.board-container');
    checkGameOver();
}


//cell Marked
function cellMarked(elCell, i, j) {
    if (gGame.isOn === false) return;//if the game is over, don't let it click
    if (gBoard[i][j].isShown && !gBoard[i][j].isMarked) return;//if the cell shown but not marked, dnot let it be marked

    if (!gFirstCellClicked) return;//right click can't be the first click

    if (gBoard[i][j].isMarked === true) {//toggle mark-unmark, show-unshow
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


//expand cells that are neighbors of the given cell, that are not mines - recursive
function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var currCell = board[i][j];
            if (!currCell.isMine && !currCell.isShown) {
                gBoard[i][j].isShown = true;
                if (!currCell.minesAroundCount) expandShown(board, i, j);//if the cell doesn't have mines around it, run it in the function as well
            }
        }
    }
    renderBoard(gBoard, '.board-container');
}


//Game Over process
function checkGameOver(winOrLose) {
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

    if (areAllCellsShown() && areAllMarkedCellsMines() && gLivesCount) victory();//if all the cells are shown, all of the marked cells are mines and you still have lives remaining, you win
}

//victory process
function victory() {
    gElGameOverMessage.style.display = 'block';
    gElGameOverMessage.innerText = 'Victory!';
    gElPlaySmiley.innerText = '😎';
    gGame.isOn = false;
    stopWatch();
    gIsWon = true;
    gElScore.innerText = score(gLevelIdx);
    return;
}

//checking if all of the cells on the bored are shown(marked are shown as well)
function areAllCellsShown() {
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isShown) count++;
        }
    }
    if (count === gLevel.size ** 2) return true;
}

//checking if all of the marked cells on the bored are mines
function areAllMarkedCellsMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMarked && !currCell.isMine) return false;
        }
    }
    return true;
}

//show all mines if the player lost the game
function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine === true) {
                gBoard[i][j].isShown = true;
            }
        }
    }
}