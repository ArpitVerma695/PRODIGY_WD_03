let boardSize = 3;
    let board = [];
    let currentPlayer = 'X';
    let history = [];
    let future = [];
    let scores = { X: 0, O: 0 };

    function initBoard() {
      const boardDiv = document.getElementById('board');
      boardDiv.innerHTML = '';
      boardDiv.style.gridTemplateColumns = `repeat(${boardSize}, 80px)`;
      board = Array(boardSize * boardSize).fill('');
      board.forEach((_, i) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.onclick = () => makeMove(i);
        boardDiv.appendChild(cell);
      });
      updateScoreboard();
    }

    function makeMove(i) {
      if (board[i] !== '') return;
      board[i] = currentPlayer;
      history.push(i);
      future = [];
      renderBoard();
      if (checkWin(currentPlayer)) {
        alert(currentPlayer + ' wins!');
        scores[currentPlayer]++;
        newGame();
        return;
      }
      if (board.every(cell => cell !== '')) {
        alert('Draw!');
        newGame();
        return;
      }

      if (document.getElementById('mode').value === 'ai') {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (currentPlayer === 'O') {
          aiMove();
        }
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }
    }

    function aiMove() {
      let move;
      const difficulty = document.getElementById('difficulty').value;
      if (difficulty === 'easy') {
        const available = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
        move = available[Math.floor(Math.random() * available.length)];
      } else if (difficulty === 'medium') {
        move = findWinningMove('O') || findWinningMove('X') || randomMove();
      } else {
        move = minimax(board, 'O').index;
      }
      if (move !== undefined) makeMove(move);
    }

    function findWinningMove(player) {
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          board[i] = player;
          if (checkWin(player)) {
            board[i] = '';
            return i;
          }
          board[i] = '';
        }
      }
      return null;
    }

    function randomMove() {
      const available = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
      return available[Math.floor(Math.random() * available.length)];
    }

    function minimax(newBoard, player) {
      const availSpots = newBoard.map((v, i) => v === '' ? i : null).filter(v => v !== null);
      if (checkWin('X')) return { score: -10 };
      if (checkWin('O')) return { score: 10 };
      if (availSpots.length === 0) return { score: 0 };

      let moves = [];
      for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
          let result = minimax(newBoard, 'X');
          move.score = result.score;
        } else {
          let result = minimax(newBoard, 'O');
          move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
      }

      let bestMove;
      if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      }

      return moves[bestMove];
    }

    function renderBoard() {
      document.querySelectorAll('.cell').forEach((cell, i) => {
        cell.textContent = board[i];
        cell.style.color = board[i] === 'X' ? '#2a5298' : '#e63946';
      });
      updateScoreboard();
    }

    function checkWin(player) {
      const lines = [];
      for (let i = 0; i < boardSize; i++) {
        lines.push([...Array(boardSize).keys()].map(x => i * boardSize + x));
        lines.push([...Array(boardSize).keys()].map(x => x * boardSize + i));
      }
      lines.push([...Array(boardSize).keys()].map(x => x * (boardSize + 1)));
      lines.push([...Array(boardSize).keys()].map(x => (x + 1) * (boardSize - 1)));
      return lines.some(line => line.every(index => board[index] === player));
    }

    function newGame() {
      boardSize = parseInt(document.getElementById('size').value);
      currentPlayer = 'X';
      history = [];
      future = [];
      initBoard();
    }

    function resetScore() {
      scores = { X: 0, O: 0 };
      updateScoreboard();
    }

    function undoMove() {
      if (!history.length) return;
      const last = history.pop();
      future.push(last);
      board[last] = '';
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      renderBoard();
    }

    function redoMove() {
      if (!future.length) return;
      const next = future.pop();
      history.push(next);
      board[next] = currentPlayer;
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      renderBoard();
    }

    function updateScoreboard() {
      document.getElementById('scoreboard').textContent = `X: ${scores.X} | O: ${scores.O}`;
    }

    newGame();