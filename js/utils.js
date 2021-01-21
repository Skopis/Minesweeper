'use strict'

//setMinesNegsCount
function setMinesNegsCount(board, rowIdx, colIdx) {
  var count = 0;
  // console.log('board length', board.length)
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > board.length - 1) continue
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > board[0].length - 1) continue
      if (i === rowIdx && j === colIdx) continue
      var currCell = board[i][j]
      if (currCell.isMine === true) count++
    }
  }
  // console.log('Count:', count);
  return count;
}


//getClassName
function getClassName(i, j) {
  var cellClass = '.cell-' + i + '-' + j;
  return cellClass;
}


//getEmptyCells
function getEmptyCells(board, iIdx, jIdx) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      if (!currCell.isMine && i !== iIdx && j !== jIdx) {//avoid first clicked location
        emptyCells.push({ i: i, j: j })
      }
    }
  }
  return emptyCells;
}


//addStopWatch
function addStopWatch() {
  var startTime = new Date();
  var elStopWatch = document.querySelector('.time');
  gShowTimeInterval = setInterval(function () {
    var timeElapsed = (new Date() - startTime);
    elStopWatch.innerText = parseInt(timeElapsed / 1000);
  }, 1);
}
function stopWatch() {
  clearInterval(gShowTimeInterval);
  gShowTimeInterval = null;
}


//getRandomInt
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}