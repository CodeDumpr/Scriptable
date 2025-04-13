const STATE_EMPTY = null
const STATE_PLAYER_ONE = 1
const STATE_PLAYER_TWO = 2

let CURRENT_PLAYER = STATE_PLAYER_ONE
let WINNER = null
let HAS_EMPTY_SQUARES = true

let board = [
  [STATE_EMPTY, STATE_EMPTY, STATE_EMPTY],
  [STATE_EMPTY, STATE_EMPTY, STATE_EMPTY],
  [STATE_EMPTY, STATE_EMPTY, STATE_EMPTY]
]

let table = new UITable()
updateTable()
table.present()

function updateTable() {
  table.removeAllRows()

  let topSpacer = new UITableRow()
  topSpacer.height = 40
  table.addRow(topSpacer)

  for (let rn = 0; rn < board.length; rn++) {
    let cols = board[rn]
    let row = new UITableRow()
    row.height = 80

    let leftSpacer = row.addText(" ")
    leftSpacer.widthWeight = 1

    for (let cn = 0; cn < cols.length; cn++) {
      let state = cols[cn]
      let emoji = emojiForSquareState(state)
      let cell
      if (state == STATE_EMPTY && WINNER == null && HAS_EMPTY_SQUARES && CURRENT_PLAYER === STATE_PLAYER_ONE) {
        cell = row.addButton(emoji)
        cell.onTap = () => {
          move(rn, cn)
          checkForWinner()
          checkIfHasEmptySquares()
          changeCurrentPlayer()
          updateTable()
          table.reload()
          maybeMakeAIMove()
        }
      } else {
        cell = row.addText(emoji)
      }
      cell.centerAligned()
      cell.widthWeight = 2
    }

    let rightSpacer = row.addText(" ")
    rightSpacer.widthWeight = 1

    table.addRow(row)
  }

  let middleSpacer = new UITableRow()
  middleSpacer.height = 30
  table.addRow(middleSpacer)

  if (WINNER != null) {
    let row = new UITableRow()
    row.isHeader = true
    let emoji = emojiForSquareState(WINNER)
    let message = ""
    if (emoji === "🌿") {
      message = "🌿 Wins! Get smoked!"
    } else if (emoji === "🔥") {
      message = "🔥 Wins! You got burnt!"
    } else {
      message = emoji + " won!"
    }
    let cell = row.addText(message)
    cell.titleColor = new Color("54d132")
    cell.centerAligned()
    table.addRow(row)
  } else if (!HAS_EMPTY_SQUARES) {
    let row = new UITableRow()
    row.isHeader = true
    let cell = row.addText("It's a tie 🤝")
    cell.titleColor = Color.orange()
    cell.centerAligned()
    table.addRow(row)
  } else {
    let currentPlayerRow = new UITableRow()
    let currentPlayerEmoji = emojiForSquareState(CURRENT_PLAYER)
    let currentPlayerCell = currentPlayerRow.addText("Turn: " + currentPlayerEmoji)
    currentPlayerCell.centerAligned()
    table.addRow(currentPlayerRow)
  }

  let bottomSpacer = new UITableRow()
  bottomSpacer.height = 40
  table.addRow(bottomSpacer)
}

function move(rn, cn) {
  board[rn][cn] = CURRENT_PLAYER
}

function changeCurrentPlayer() {
  CURRENT_PLAYER = (CURRENT_PLAYER === STATE_PLAYER_ONE) ? STATE_PLAYER_TWO : STATE_PLAYER_ONE
}

function checkForWinner() {
  for (let i = 0; i < board.length; i++) {
    if (board[i][0] !== STATE_EMPTY && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      WINNER = board[i][0]
      return
    }
    if (board[0][i] !== STATE_EMPTY && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
      WINNER = board[0][i]
      return
    }
  }

  if (board[0][0] !== STATE_EMPTY && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    WINNER = board[0][0]
    return
  }

  if (board[2][0] !== STATE_EMPTY && board[2][0] === board[1][1] && board[1][1] === board[0][2]) {
    WINNER = board[2][0]
    return
  }
}

function checkIfHasEmptySquares() {
  for (let rn = 0; rn < board.length; rn++) {
    for (let cn = 0; cn < board[rn].length; cn++) {
      if (board[rn][cn] === STATE_EMPTY) {
        HAS_EMPTY_SQUARES = true
        return
      }
    }
  }
  HAS_EMPTY_SQUARES = false
}

function emojiForSquareState(state) {
  if (state == STATE_PLAYER_TWO) {
    return "🌿"
  } else if (state == STATE_PLAYER_ONE) {
    return "🔥"
  } else {
    return "⚪️"
  }
}

function minimax(board, depth, isMaximizing) {
  let scores = {
    [STATE_PLAYER_ONE]: -10,
    [STATE_PLAYER_TWO]: 10,
    tie: 0
  }

  let winner = checkWinnerForAI(board)
  if (winner !== null) {
    return scores[winner]
  }

  let possibleMoves = getPossibleMoves(board)
  if (possibleMoves.length === 0) return scores.tie

  if (isMaximizing) {
    let bestScore = -Infinity
    for (let move of possibleMoves) {
      let row = move[0]
      let col = move[1]

      board[row][col] = STATE_PLAYER_TWO
      let score = minimax(board, depth + 1, false)
      board[row][col] = STATE_EMPTY
      bestScore = Math.max(score, bestScore)
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (let move of possibleMoves) {
      let row = move[0]
      let col = move[1]

      board[row][col] = STATE_PLAYER_ONE
      let score = minimax(board, depth + 1, true)
      board[row][col] = STATE_EMPTY
      bestScore = Math.min(score, bestScore)
    }
    return bestScore
  }
}

function getPossibleMoves(board) {
  let moves = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === STATE_EMPTY) {
        moves.push([i, j])
      }
    }
  }
  return moves
}

function checkWinnerForAI(board) {
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== STATE_EMPTY) return board[i][0]
    if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== STATE_EMPTY) return board[0][i]
  }
  if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== STATE_EMPTY) return board[0][0]
  if (board[2][0] === board[1][1] && board[1][1] === board[0][2] && board[2][0] !== STATE_EMPTY) return board[2][0]
  return null
}

function maybeMakeAIMove() {
  if (CURRENT_PLAYER !== STATE_PLAYER_TWO || WINNER !== null || !HAS_EMPTY_SQUARES) return

  let bestScore = -Infinity
  let bestMove = null
  let possibleMoves = getPossibleMoves(board)

  for (let moveOption of possibleMoves) {
    let row = moveOption[0]
    let col = moveOption[1]

    board[row][col] = STATE_PLAYER_TWO
    let score = minimax(board, 0, false)
    board[row][col] = STATE_EMPTY

    if (score > bestScore) {
      bestScore = score
      bestMove = moveOption
    }
  }

  if (bestMove) {
    let row = bestMove[0]
    let col = bestMove[1]
    move(row, col)
    checkForWinner()
    checkIfHasEmptySquares()
    changeCurrentPlayer()
    updateTable()
    table.reload()
  }
}
