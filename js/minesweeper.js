
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


function initGame(elButton) {
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
        gLevel.size = 8;
        gLevel.mines = 12;
    }

    gBoard = buildBoard(gLevel.size, gLevel.mines);
    renderBoard(gBoard, '.board-container');
    gGame.isOn = true;
    // console.log(gBoard);
}

function buildBoard(size, minesNumber) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = { minesAroundCount: null, isShown: true, isMine: false, isMarked: false };
            board[i][j] = cell;
        }
    }

    //insert mines in random coords - make a seperate function!
    var emptyCells = getEmptyCells(board);
    for (var i = 0; i < minesNumber; i++) {
        var randomLocation = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomLocation.i][randomLocation.j] = { minesAroundCount: null, isShown: true, isMine: true, isMarked: false };
        emptyCells.splice(emptyCells.indexOf(randomLocation), 1);
        console.log(emptyCells)
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
                // console.log('className', className)
                var elCell = document.querySelector(className);
                elCell.classList.add('.hidden');
            }
        }
    }
    console.log('gBoard after render:');
    console.table(gBoard);
}


function cellClicked(elCell, i, j) {
    if(gGame.isOn === false) return;
    
    elCell.classList.remove('hidden');
    gBoard[i][j].isShown = true;

    if(gBoard[i][j].isMine){
        checkGameOver('loose');
    }
    checkGameOver();
}


function cellMarked(elCell, i, j) {
    if(gGame.isOn === false) return;

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

function expandShown(board, elCell, i, j) {

}

function checkGameOver(winOrLoose) {

    if(winOrLoose==='loose'){
        alert('you lost!');
        gGame.isOn = false;
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
    if (count === gLevel.mines) {
        alert('victory!');
        gGame.isOn = false;
        return;
    }
}