const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #1e1e1e;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      touch-action: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    #board {
      display: grid;
      grid-template-columns: repeat(3, 100px);
      grid-template-rows: repeat(3, 100px);
      gap: 8px;
    }
    .cell {
      background: #2e2e2e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .cell.disabled {
      cursor: default;
      opacity: 0.6;
    }
    .cell:hover:not(.disabled) {
      background: #3e3e3e;
    }
    #status {
      margin-top: 24px;
      font-size: 1.2rem;
    }
    #reset {
      margin-top: 12px;
      padding: 10px 24px;
      font-size: 1rem;
      background: #007aff;
      border: none;
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
      transition: background 0.2s;
    }
    #reset:hover {
      background: #005bb5;
    }
  </style>
</head>
<body>
  <div id="board"></div>
  <div id="status">Your move</div>
  <button id="reset">Restart</button>

  <script>
    const PLAYER = "❌";
    const AI = "⭕";
    let board = Array(9).fill(null);
    const boardEl = document.getElementById("board");
    const statusEl = document.getElementById("status");
    const resetBtn = document.getElementById("reset");

    function render() {
      boardEl.innerHTML = "";
      board.forEach((cell, i) => {
        const div = document.createElement("div");
        div.className = "cell" + (cell ? " disabled" : "");
        div.innerText = cell || "";
        if (!cell && !checkWinner(board)) {
          div.onclick = () => {
            playerMove(i);
          };
        }
        boardEl.appendChild(div);
      });
    }

    function playerMove(index) {
      if (board[index] || checkWinner(board)) return;
      board[index] = PLAYER;
      render();
      if (!checkWinner(board) && board.includes(null)) {
        setTimeout(() => {
          aiMove();
          render();
        }, 200);
      }
      updateStatus();
    }

    function aiMove() {
      const best = minimax(board, AI);
      if (best.index !== undefined) board[best.index] = AI;
      updateStatus();
    }

    function updateStatus() {
      const winner = checkWinner(board);
      if (winner) {
        statusEl.innerText = winner === PLAYER ? "You win! (somehow...)" : "You lose!";
      } else if (!board.includes(null)) {
        statusEl.innerText = "It's a draw.";
      } else {
        statusEl.innerText = "Your move";
      }
    }

    function checkWinner(b) {
      const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];
      for (let [a,b1,c] of winPatterns) {
        if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
      }
      return null;
    }

    function minimax(newBoard, player) {
      const availSpots = newBoard.map((v,i) => v ? null : i).filter(v => v !== null);
      const winner = checkWinner(newBoard);
      if (winner === PLAYER) return {score: -10};
      if (winner === AI) return {score: 10};
      if (availSpots.length === 0) return {score: 0};

      const moves = [];

      for (let i of availSpots) {
        const move = {};
        move.index = i;
        newBoard[i] = player;

        const result = minimax(newBoard, player === AI ? PLAYER : AI);
        move.score = result.score;

        newBoard[i] = null;
        moves.push(move);
      }

      let best;
      if (player === AI) {
        let max = -Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score > max) {
            max = moves[i].score;
            best = i;
          }
        }
      } else {
        let min = Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score < min) {
            min = moves[i].score;
            best = i;
          }
        }
      }

      return moves[best];
    }

    resetBtn.onclick = () => {
      board = Array(9).fill(null);
      statusEl.innerText = "Your move";
      render();
    };

    render();
  </script>
</body>
</html>
`;

const wv = new WebView();
await wv.loadHTML(html);
await wv.present();
