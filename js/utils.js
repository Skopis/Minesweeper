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
function getEmptyCells(board) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      if (!currCell.isMine) {
        emptyCells.push({ i: i, j: j })
      }
    }
  }
  return emptyCells;
}


//addStopWatch
function addStopWatch() {
  var startTime = new Date();
  var elStopWatch = document.querySelector('.stop-watch');
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

//////////////////////////////////////////////////////////////////////////
// function printMat(mat, selector) {
//   var strHTML = '<table border="0"><tbody>';
//   for (var i = 0; i < mat.length; i++) {
//     strHTML += '<tr>';
//     for (var j = 0; j < mat[0].length; j++) {
//       var cell = mat[i][j];
//       var className = 'cell cell' + i + '-' + j;
//       strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
//     }
//     strHTML += '</tr>'
//   }
//   strHTML += '</tbody></table>';
//   var elContainer = document.querySelector(selector);
//   elContainer.innerHTML = strHTML;
// }


// // location such as: {i: 2, j: 7}
// function renderCell(location, value) {
//   // Select the elCell and set the value
//   var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
//   elCell.innerHTML = value;
// }


// function getRandomColor() {
//   var letters = '0123456789ABCDEF';
//   var color = '#';
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }