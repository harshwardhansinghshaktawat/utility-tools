class WordleGame extends HTMLElement {
  connectedCallback() {
    // Initialize game state
    this.wordList = [
      'REACT', 'CLASS', 'STYLE', 'MAGIC', 'DREAM', 'BEACH', 'DANCE', 
      'LIGHT', 'MUSIC', 'OCEAN', 'PIANO', 'QUEST', 'RAPID', 'SMILE',
      'TRAIN', 'BRAVE', 'CHARM', 'FLAME', 'GRACE', 'HEART', 'JOINT',
      'KNIFE', 'LEMON', 'MOUNT', 'NOBLE', 'PRIDE', 'QUEEN', 'ROUND',
      'SHARP', 'TOWER', 'UNITY', 'VOICE', 'WHALE', 'YOUTH', 'ZEBRA'
    ];
    
    this.word = this.getRandomWord();
    this.currentRow = 0;
    this.currentCol = 0;
    this.guesses = Array(6).fill('');
    this.gameOver = false;
    this.darkMode = false;
    this.hintsUsed = 0;
    this.maxHints = 2;
    this.stats = this.loadStats();
    
    this.render();
    this.setupEventListeners();
  }

  getRandomWord() {
    return this.wordList[Math.floor(Math.random() * this.wordList.length)];
  }

  loadStats() {
    try {
      const saved = localStorage.getItem('wordle-stats');
      return saved ? JSON.parse(saved) : {
        played: 0, won: 0, currentStreak: 0, maxStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
      };
    } catch(e) {
      return { played: 0, won: 0, currentStreak: 0, maxStreak: 0, guessDistribution: [0, 0, 0, 0, 0, 0] };
    }
  }

  saveStats() {
    try {
      localStorage.setItem('wordle-stats', JSON.stringify(this.stats));
    } catch(e) {}
  }

  render() {
    this.innerHTML = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .wordle-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          background: #ffffff;
          color: #1a1a1b;
          font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
          min-height: 100vh;
        }
        
        .wordle-container.dark { background: #121213; color: #ffffff; }
        
        .wordle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #d3d6da;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .dark .wordle-header { border-color: #3a3a3c; }
        
        .wordle-title {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .wordle-controls { display: flex; gap: 10px; }
        
        .wordle-btn-icon {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          font-size: 20px;
          transition: background 0.2s;
        }
        
        .wordle-btn-icon:hover { background: rgba(0,0,0,0.1); }
        .dark .wordle-btn-icon:hover { background: rgba(255,255,255,0.1); }
        
        .wordle-hint-info {
          text-align: center;
          margin-bottom: 15px;
          color: #6c757d;
          font-size: 14px;
        }
        
        .wordle-hint-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }
        
        .wordle-hint-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .wordle-hint-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .wordle-hint-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .wordle-board {
          display: grid;
          gap: 5px;
          margin-bottom: 30px;
          justify-content: center;
        }
        
        .wordle-row {
          display: grid;
          grid-template-columns: repeat(5, 62px);
          gap: 5px;
        }
        
        .wordle-tile {
          width: 62px;
          height: 62px;
          border: 2px solid #d3d6da;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          text-transform: uppercase;
          background: #ffffff;
          transition: all 0.3s;
        }
        
        .dark .wordle-tile { border-color: #3a3a3c; background: #121213; }
        
        .wordle-tile.filled { border-color: #787c7e; animation: pop 0.1s; }
        
        .wordle-tile.correct {
          background: #6aaa64;
          border-color: #6aaa64;
          color: white;
          animation: flip 0.5s;
        }
        
        .wordle-tile.present {
          background: #c9b458;
          border-color: #c9b458;
          color: white;
          animation: flip 0.5s;
        }
        
        .wordle-tile.absent {
          background: #787c7e;
          border-color: #787c7e;
          color: white;
          animation: flip 0.5s;
        }
        
        .wordle-tile.hint { animation: bounce 0.6s; }
        
        @keyframes pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes flip {
          0% { transform: rotateX(0); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-5px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .wordle-row.shake { animation: shake 0.5s; }
        
        .wordle-keyboard {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .wordle-keyboard-row {
          display: flex;
          justify-content: center;
          gap: 6px;
        }
        
        .wordle-key {
          min-width: 43px;
          height: 58px;
          background: #d3d6da;
          border: none;
          border-radius: 4px;
          color: #1a1a1b;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.1s;
          text-transform: uppercase;
        }
        
        .dark .wordle-key { background: #818384; color: #ffffff; }
        
        .wordle-key:hover { filter: brightness(0.9); transform: scale(1.05); }
        .wordle-key:active { transform: scale(0.95); }
        .wordle-key.wide { min-width: 65px; font-size: 12px; }
        .wordle-key.correct { background: #6aaa64; color: white; }
        .wordle-key.present { background: #c9b458; color: white; }
        .wordle-key.absent { background: #787c7e; color: rgba(255,255,255,0.5); }
        
        .wordle-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        
        .wordle-modal.active { display: flex; }
        
        .wordle-modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        
        .dark .wordle-modal-content { background: #1a1a1b; }
        
        .wordle-modal-header {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .wordle-modal-body { text-align: center; }
        
        .wordle-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        
        .wordle-stat { text-align: center; }
        .wordle-stat-value { font-size: 32px; font-weight: 700; }
        .wordle-stat-label { font-size: 12px; color: #6c757d; margin-top: 5px; }
        
        .wordle-btn {
          background: #6aaa64;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.2s;
        }
        
        .wordle-btn:hover { transform: scale(1.05); }
        
        .wordle-message {
          text-align: center;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
          font-weight: 600;
          display: none;
        }
        
        .wordle-message.show { display: block; }
        .wordle-message.win { background: #6aaa64; color: white; }
        .wordle-message.lose { background: #787c7e; color: white; }
        
        .wordle-word-reveal {
          font-size: 20px;
          font-weight: 700;
          margin: 15px 0;
          letter-spacing: 2px;
        }
      </style>

      <div class="wordle-container" id="container">
        <div class="wordle-header">
          <div class="wordle-title">WORDLE</div>
          <div class="wordle-controls">
            <button class="wordle-btn-icon" id="stats-btn" title="Statistics">📊</button>
            <button class="wordle-btn-icon" id="theme-btn" title="Toggle Theme">🌓</button>
            <button class="wordle-btn-icon" id="help-btn" title="How to Play">❓</button>
            <button class="wordle-btn-icon" id="new-btn" title="New Game">🔄</button>
          </div>
        </div>

        <div class="wordle-hint-info">Hints remaining: <span id="hints-left">${this.maxHints - this.hintsUsed}</span></div>

        <div class="wordle-hint-buttons">
          <button class="wordle-hint-btn" id="reveal-letter">💡 Reveal Letter</button>
          <button class="wordle-hint-btn" id="eliminate-letters">🚫 Eliminate Letters</button>
        </div>

        <div class="wordle-board" id="board"></div>
        
        <div class="wordle-message" id="message"></div>

        <div class="wordle-keyboard" id="keyboard"></div>

        <div class="wordle-modal" id="stats-modal">
          <div class="wordle-modal-content">
            <div class="wordle-modal-header">Statistics</div>
            <div class="wordle-modal-body">
              <div class="wordle-stats-grid">
                <div class="wordle-stat">
                  <div class="wordle-stat-value" id="stat-played">${this.stats.played}</div>
                  <div class="wordle-stat-label">Played</div>
                </div>
                <div class="wordle-stat">
                  <div class="wordle-stat-value" id="stat-win">${Math.round((this.stats.won / (this.stats.played || 1)) * 100)}</div>
                  <div class="wordle-stat-label">Win %</div>
                </div>
                <div class="wordle-stat">
                  <div class="wordle-stat-value" id="stat-streak">${this.stats.currentStreak}</div>
                  <div class="wordle-stat-label">Streak</div>
                </div>
                <div class="wordle-stat">
                  <div class="wordle-stat-value" id="stat-max">${this.stats.maxStreak}</div>
                  <div class="wordle-stat-label">Max</div>
                </div>
              </div>
              <button class="wordle-btn" id="close-stats">Close</button>
            </div>
          </div>
        </div>

        <div class="wordle-modal" id="help-modal">
          <div class="wordle-modal-content">
            <div class="wordle-modal-header">How to Play</div>
            <div class="wordle-modal-body" style="text-align: left;">
              <p style="margin-bottom: 15px;"><strong>Guess the WORDLE in 6 tries.</strong></p>
              <p style="margin-bottom: 15px;">Each guess must be a valid 5-letter word. Hit enter to submit.</p>
              <p style="margin-bottom: 15px;">After each guess, the tiles change color:</p>
              <div style="margin: 20px 0;">
                <div style="display: flex; gap: 5px; margin-bottom: 10px; align-items: center;">
                  <div style="width: 40px; height: 40px; background: #6aaa64; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 4px;">W</div>
                  <span>Correct position</span>
                </div>
                <div style="display: flex; gap: 5px; margin-bottom: 10px; align-items: center;">
                  <div style="width: 40px; height: 40px; background: #c9b458; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 4px;">O</div>
                  <span>Wrong position</span>
                </div>
                <div style="display: flex; gap: 5px; align-items: center;">
                  <div style="width: 40px; height: 40px; background: #787c7e; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 4px;">R</div>
                  <span>Not in word</span>
                </div>
              </div>
              <p style="margin-top: 15px; font-weight: 600;">💡 Tip: Use hints wisely - you only get 2 per game!</p>
              <button class="wordle-btn" id="close-help">Got it!</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.createBoard();
    this.createKeyboard();
  }

  createBoard() {
    const board = this.querySelector('#board');
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('div');
      row.className = 'wordle-row';
      row.dataset.row = i;
      for (let j = 0; j < 5; j++) {
        const tile = document.createElement('div');
        tile.className = 'wordle-tile';
        tile.dataset.row = i;
        tile.dataset.col = j;
        row.appendChild(tile);
      }
      board.appendChild(row);
    }
  }

  createKeyboard() {
    const keyboard = this.querySelector('#keyboard');
    const rows = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['ENTER','Z','X','C','V','B','N','M','BACKSPACE']
    ];

    rows.forEach(rowKeys => {
      const row = document.createElement('div');
      row.className = 'wordle-keyboard-row';
      rowKeys.forEach(key => {
        const button = document.createElement('button');
        button.className = 'wordle-key';
        button.dataset.key = key;
        button.textContent = key === 'BACKSPACE' ? '⌫' : key;
        if (key === 'ENTER' || key === 'BACKSPACE') button.classList.add('wide');
        row.appendChild(button);
      });
      keyboard.appendChild(row);
    });
  }

  setupEventListeners() {
    this.querySelectorAll('.wordle-key').forEach(key => {
      key.addEventListener('click', () => this.handleKey(key.dataset.key));
    });

    document.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      if (e.key === 'Enter') this.handleKey('ENTER');
      else if (e.key === 'Backspace') this.handleKey('BACKSPACE');
      else if (/^[a-zA-Z]$/.test(e.key)) this.handleKey(e.key.toUpperCase());
    });

    this.querySelector('#reveal-letter').addEventListener('click', () => this.revealLetter());
    this.querySelector('#eliminate-letters').addEventListener('click', () => this.eliminateLetters());
    this.querySelector('#stats-btn').addEventListener('click', () => this.openModal('stats-modal'));
    this.querySelector('#help-btn').addEventListener('click', () => this.openModal('help-modal'));
    this.querySelector('#theme-btn').addEventListener('click', () => this.toggleTheme());
    this.querySelector('#new-btn').addEventListener('click', () => this.newGame());
    this.querySelector('#close-stats').addEventListener('click', () => this.closeModal('stats-modal'));
    this.querySelector('#close-help').addEventListener('click', () => this.closeModal('help-modal'));

    this.querySelectorAll('.wordle-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  }

  handleKey(key) {
    if (this.gameOver) return;
    if (key === 'ENTER') this.submitGuess();
    else if (key === 'BACKSPACE') this.deleteLetter();
    else if (this.currentCol < 5 && /^[A-Z]$/.test(key)) this.addLetter(key);
  }

  addLetter(letter) {
    if (this.currentCol < 5) {
      this.guesses[this.currentRow] += letter;
      const tile = this.getTile(this.currentRow, this.currentCol);
      tile.textContent = letter;
      tile.classList.add('filled');
      this.currentCol++;
    }
  }

  deleteLetter() {
    if (this.currentCol > 0) {
      this.currentCol--;
      this.guesses[this.currentRow] = this.guesses[this.currentRow].slice(0, -1);
      const tile = this.getTile(this.currentRow, this.currentCol);
      tile.textContent = '';
      tile.classList.remove('filled');
    }
  }

  submitGuess() {
    if (this.currentCol !== 5) {
      this.showMessage('Not enough letters', false);
      this.shakeRow(this.currentRow);
      return;
    }

    const guess = this.guesses[this.currentRow];
    this.checkGuess(guess);
    
    if (guess === this.word) {
      this.gameOver = true;
      this.stats.played++;
      this.stats.won++;
      this.stats.currentStreak++;
      this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
      this.stats.guessDistribution[this.currentRow]++;
      this.saveStats();
      this.updateStatsDisplay();
      setTimeout(() => this.showMessage(`🎉 Excellent! You got it in ${this.currentRow + 1} ${this.currentRow === 0 ? 'try' : 'tries'}!`, true), 1500);
    } else if (this.currentRow === 5) {
      this.gameOver = true;
      this.stats.played++;
      this.stats.currentStreak = 0;
      this.saveStats();
      this.updateStatsDisplay();
      setTimeout(() => this.showMessage(`Game Over! The word was: <div class="wordle-word-reveal">${this.word}</div>`, false), 1500);
    } else {
      this.currentRow++;
      this.currentCol = 0;
    }
  }

  checkGuess(guess) {
    const wordLetters = this.word.split('');
    const guessLetters = guess.split('');
    const result = Array(5).fill('absent');
    const used = Array(5).fill(false);

    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === wordLetters[i]) {
        result[i] = 'correct';
        used[i] = true;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (result[i] === 'correct') continue;
      for (let j = 0; j < 5; j++) {
        if (!used[j] && guessLetters[i] === wordLetters[j]) {
          result[i] = 'present';
          used[j] = true;
          break;
        }
      }
    }

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const tile = this.getTile(this.currentRow, i);
        tile.classList.add(result[i]);
        this.updateKeyboard(guessLetters[i], result[i]);
      }, i * 200);
    }
  }

  updateKeyboard(letter, state) {
    const key = this.querySelector(`.wordle-key[data-key="${letter}"]`);
    if (!key) return;
    const currentState = key.classList.contains('correct') ? 'correct' :
                        key.classList.contains('present') ? 'present' : 'none';
    if (state === 'correct' || (state === 'present' && currentState !== 'correct')) {
      key.classList.remove('correct', 'present', 'absent');
      key.classList.add(state);
    } else if (state === 'absent' && currentState === 'none') {
      key.classList.add('absent');
    }
  }

  revealLetter() {
    if (this.hintsUsed >= this.maxHints || this.gameOver) return;
    this.hintsUsed++;
    this.updateHintCounter();
    for (let i = 0; i < 5; i++) {
      const tile = this.getTile(this.currentRow, i);
      if (!tile.textContent || !tile.classList.contains('correct')) {
        const letter = this.word[i];
        tile.textContent = letter;
        tile.classList.add('filled', 'hint', 'correct');
        if (this.currentCol <= i) {
          this.guesses[this.currentRow] += letter;
          this.currentCol = i + 1;
        } else {
          const currentGuess = this.guesses[this.currentRow];
          this.guesses[this.currentRow] = currentGuess.substring(0, i) + letter + currentGuess.substring(i + 1);
        }
        break;
      }
    }
  }

  eliminateLetters() {
    if (this.hintsUsed >= this.maxHints || this.gameOver) return;
    this.hintsUsed++;
    this.updateHintCounter();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wrongLetters = alphabet.filter(l => !this.word.includes(l));
    const toMark = wrongLetters.sort(() => Math.random() - 0.5).slice(0, 3);
    toMark.forEach(letter => {
      const key = this.querySelector(`.wordle-key[data-key="${letter}"]`);
      if (key && !key.classList.contains('correct') && !key.classList.contains('present')) {
        key.classList.add('absent');
      }
    });
    this.showMessage(`Eliminated ${toMark.length} wrong letters!`, true);
  }

  updateHintCounter() {
    this.querySelector('#hints-left').textContent = this.maxHints - this.hintsUsed;
    if (this.hintsUsed >= this.maxHints) {
      this.querySelectorAll('.wordle-hint-btn').forEach(btn => btn.disabled = true);
    }
  }

  updateStatsDisplay() {
    this.querySelector('#stat-played').textContent = this.stats.played;
    this.querySelector('#stat-win').textContent = Math.round((this.stats.won / (this.stats.played || 1)) * 100);
    this.querySelector('#stat-streak').textContent = this.stats.currentStreak;
    this.querySelector('#stat-max').textContent = this.stats.maxStreak;
  }

  getTile(row, col) {
    return this.querySelector(`.wordle-tile[data-row="${row}"][data-col="${col}"]`);
  }

  shakeRow(row) {
    const rowEl = this.querySelector(`.wordle-row[data-row="${row}"]`);
    rowEl.classList.add('shake');
    setTimeout(() => rowEl.classList.remove('shake'), 500);
  }

  showMessage(text, isWin) {
    const messageEl = this.querySelector('#message');
    messageEl.innerHTML = text;
    messageEl.className = `wordle-message show ${isWin ? 'win' : 'lose'}`;
    setTimeout(() => messageEl.classList.remove('show'), 3000);
  }

  openModal(id) {
    this.querySelector(`#${id}`).classList.add('active');
  }

  closeModal(id) {
    this.querySelector(`#${id}`).classList.remove('active');
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    const container = this.querySelector('#container');
    container.classList.toggle('dark', this.darkMode);
  }

  newGame() {
    this.word = this.getRandomWord();
    this.currentRow = 0;
    this.currentCol = 0;
    this.guesses = Array(6).fill('');
    this.gameOver = false;
    this.hintsUsed = 0;
    this.querySelector('#hints-left').textContent = this.maxHints;
    this.querySelectorAll('.wordle-hint-btn').forEach(btn => btn.disabled = false);
    this.querySelectorAll('.wordle-tile').forEach(tile => {
      tile.textContent = '';
      tile.className = 'wordle-tile';
    });
    this.querySelectorAll('.wordle-key').forEach(key => {
      key.classList.remove('correct', 'present', 'absent');
    });
    this.querySelector('#message').classList.remove('show');
  }
}

// Register the custom element
customElements.define('wordle-game', WordleGame);
