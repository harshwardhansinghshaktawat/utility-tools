class WordleGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Game state
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
    
    // Stats
    this.stats = this.loadStats();
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  getRandomWord() {
    return this.wordList[Math.floor(Math.random() * this.wordList.length)];
  }

  loadStats() {
    const saved = localStorage.getItem('wordle-stats');
    return saved ? JSON.parse(saved) : {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0]
    };
  }

  saveStats() {
    localStorage.setItem('wordle-stats', JSON.stringify(this.stats));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :host {
          display: block;
          font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
          --bg-primary: #ffffff;
          --bg-secondary: #f8f9fa;
          --text-primary: #1a1a1b;
          --text-secondary: #6c757d;
          --border-color: #d3d6da;
          --tile-bg: #ffffff;
          --correct: #6aaa64;
          --present: #c9b458;
          --absent: #787c7e;
          --key-bg: #d3d6da;
          --key-hover: #c3c6ca;
          --shadow: rgba(0, 0, 0, 0.1);
        }

        :host(.dark-mode) {
          --bg-primary: #121213;
          --bg-secondary: #1a1a1b;
          --text-primary: #ffffff;
          --text-secondary: #a8a8a8;
          --border-color: #3a3a3c;
          --tile-bg: #121213;
          --key-bg: #818384;
          --key-hover: #6e6e6f;
          --shadow: rgba(255, 255, 255, 0.1);
        }

        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          background: var(--bg-primary);
          color: var(--text-primary);
          min-height: 100vh;
          transition: all 0.3s ease;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .controls {
          display: flex;
          gap: 10px;
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s;
          font-size: 20px;
        }

        .icon-btn:hover {
          background: var(--bg-secondary);
        }

        .hint-info {
          text-align: center;
          margin-bottom: 15px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .game-board {
          display: grid;
          gap: 5px;
          margin-bottom: 30px;
          justify-content: center;
        }

        .row {
          display: grid;
          grid-template-columns: repeat(5, 62px);
          gap: 5px;
        }

        .tile {
          width: 62px;
          height: 62px;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          text-transform: uppercase;
          background: var(--tile-bg);
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .tile.filled {
          border-color: var(--text-secondary);
          animation: pop 0.1s ease;
        }

        .tile.correct {
          background: var(--correct);
          border-color: var(--correct);
          color: white;
          animation: flip 0.5s ease;
        }

        .tile.present {
          background: var(--present);
          border-color: var(--present);
          color: white;
          animation: flip 0.5s ease;
        }

        .tile.absent {
          background: var(--absent);
          border-color: var(--absent);
          color: white;
          animation: flip 0.5s ease;
        }

        .tile.hint {
          animation: bounce 0.6s ease;
        }

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

        .keyboard {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 20px;
        }

        .keyboard-row {
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        .key {
          min-width: 43px;
          height: 58px;
          background: var(--key-bg);
          border: none;
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.1s ease;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .key:hover {
          background: var(--key-hover);
          transform: scale(1.05);
        }

        .key:active {
          transform: scale(0.95);
        }

        .key.wide {
          min-width: 65px;
          font-size: 12px;
        }

        .key.correct {
          background: var(--correct);
          color: white;
        }

        .key.present {
          background: var(--present);
          color: white;
        }

        .key.absent {
          background: var(--absent);
          color: rgba(255, 255, 255, 0.5);
        }

        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .modal.active {
          display: flex;
        }

        .modal-content {
          background: var(--bg-primary);
          padding: 30px;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 20px var(--shadow);
          animation: slideUp 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }

        .modal-body {
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 5px;
        }

        .btn {
          background: var(--correct);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: scale(1.05);
        }

        .btn-secondary {
          background: var(--key-bg);
          color: var(--text-primary);
        }

        .message {
          text-align: center;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
          font-weight: 600;
          animation: slideUp 0.3s ease;
        }

        .message.win {
          background: var(--correct);
          color: white;
        }

        .message.lose {
          background: var(--absent);
          color: white;
        }

        .hint-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .hint-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hint-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .hint-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .word-reveal {
          font-size: 20px;
          font-weight: 700;
          margin: 15px 0;
          letter-spacing: 2px;
        }
      </style>

      <div class="container">
        <div class="header">
          <div class="title">WORDLE</div>
          <div class="controls">
            <button class="icon-btn" id="hint-btn" title="Help">💡</button>
            <button class="icon-btn" id="stats-btn" title="Statistics">📊</button>
            <button class="icon-btn" id="theme-btn" title="Toggle Theme">🌓</button>
            <button class="icon-btn" id="help-btn" title="How to Play">❓</button>
          </div>
        </div>

        <div class="hint-info">Hints remaining: <span id="hints-left">${this.maxHints - this.hintsUsed}</span></div>

        <div class="hint-buttons">
          <button class="hint-btn" id="reveal-letter">Reveal Letter</button>
          <button class="hint-btn" id="eliminate-letters">Eliminate Wrong Letters</button>
        </div>

        <div class="game-board" id="board"></div>
        
        <div id="message"></div>

        <div class="keyboard">
          <div class="keyboard-row">
            ${['Q','W','E','R','T','Y','U','I','O','P'].map(k => `<button class="key" data-key="${k}">${k}</button>`).join('')}
          </div>
          <div class="keyboard-row">
            ${['A','S','D','F','G','H','J','K','L'].map(k => `<button class="key" data-key="${k}">${k}</button>`).join('')}
          </div>
          <div class="keyboard-row">
            <button class="key wide" data-key="ENTER">ENTER</button>
            ${['Z','X','C','V','B','N','M'].map(k => `<button class="key" data-key="${k}">${k}</button>`).join('')}
            <button class="key wide" data-key="BACKSPACE">⌫</button>
          </div>
        </div>

        <div class="modal" id="stats-modal">
          <div class="modal-content">
            <div class="modal-header">Statistics</div>
            <div class="modal-body">
              <div class="stats-grid">
                <div class="stat">
                  <div class="stat-value">${this.stats.played}</div>
                  <div class="stat-label">Played</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${Math.round((this.stats.won / (this.stats.played || 1)) * 100)}</div>
                  <div class="stat-label">Win %</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${this.stats.currentStreak}</div>
                  <div class="stat-label">Current Streak</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${this.stats.maxStreak}</div>
                  <div class="stat-label">Max Streak</div>
                </div>
              </div>
              <button class="btn" onclick="this.getRootNode().host.closeModal('stats-modal')">Close</button>
            </div>
          </div>
        </div>

        <div class="modal" id="help-modal">
          <div class="modal-content">
            <div class="modal-header">How to Play</div>
            <div class="modal-body" style="text-align: left;">
              <p style="margin-bottom: 15px;">Guess the WORDLE in 6 tries.</p>
              <p style="margin-bottom: 15px;">Each guess must be a valid 5-letter word. Hit the enter button to submit.</p>
              <p style="margin-bottom: 15px;">After each guess, the color of the tiles will change to show how close your guess was to the word.</p>
              <div style="margin: 20px 0;">
                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                  <div style="width: 40px; height: 40px; background: var(--correct); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">W</div>
                  <span style="padding: 10px;">= Correct letter in correct position</span>
                </div>
                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                  <div style="width: 40px; height: 40px; background: var(--present); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">O</div>
                  <span style="padding: 10px;">= Correct letter in wrong position</span>
                </div>
                <div style="display: flex; gap: 5px;">
                  <div style="width: 40px; height: 40px; background: var(--absent); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">R</div>
                  <span style="padding: 10px;">= Letter not in word</span>
                </div>
              </div>
              <p style="margin-top: 15px; font-weight: 600;">Use hints wisely - you only get 2 per game!</p>
              <button class="btn" onclick="this.getRootNode().host.closeModal('help-modal')">Got it!</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.createBoard();
  }

  createBoard() {
    const board = this.shadowRoot.getElementById('board');
    board.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('div');
      row.className = 'row';
      row.dataset.row = i;
      
      for (let j = 0; j < 5; j++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.row = i;
        tile.dataset.col = j;
        row.appendChild(tile);
      }
      
      board.appendChild(row);
    }
  }

  attachEventListeners() {
    // Keyboard clicks
    this.shadowRoot.querySelectorAll('.key').forEach(key => {
      key.addEventListener('click', () => {
        this.handleKey(key.dataset.key);
      });
    });

    // Physical keyboard
    document.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      
      if (e.key === 'Enter') {
        this.handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        this.handleKey('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        this.handleKey(e.key.toUpperCase());
      }
    });

    // Hint buttons
    this.shadowRoot.getElementById('reveal-letter').addEventListener('click', () => {
      this.revealLetter();
    });

    this.shadowRoot.getElementById('eliminate-letters').addEventListener('click', () => {
      this.eliminateLetters();
    });

    // Control buttons
    this.shadowRoot.getElementById('stats-btn').addEventListener('click', () => {
      this.openModal('stats-modal');
    });

    this.shadowRoot.getElementById('help-btn').addEventListener('click', () => {
      this.openModal('help-modal');
    });

    this.shadowRoot.getElementById('theme-btn').addEventListener('click', () => {
      this.toggleTheme();
    });
  }

  handleKey(key) {
    if (this.gameOver) return;

    if (key === 'ENTER') {
      this.submitGuess();
    } else if (key === 'BACKSPACE') {
      this.deleteLetter();
    } else if (this.currentCol < 5) {
      this.addLetter(key);
    }
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
      
      setTimeout(() => {
        this.showMessage(`Excellent! You got it in ${this.currentRow + 1} ${this.currentRow === 0 ? 'try' : 'tries'}!`, true);
      }, 1500);
    } else if (this.currentRow === 5) {
      this.gameOver = true;
      this.stats.played++;
      this.stats.currentStreak = 0;
      this.saveStats();
      
      setTimeout(() => {
        this.showMessage(`Game Over! The word was: <div class="word-reveal">${this.word}</div>`, false);
      }, 1500);
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

    // Check for correct positions first
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === wordLetters[i]) {
        result[i] = 'correct';
        used[i] = true;
      }
    }

    // Check for present letters
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

    // Animate tiles
    for (let i = 0; i < 5; i++) {
      const tile = this.getTile(this.currentRow, i);
      setTimeout(() => {
        tile.classList.add(result[i]);
        this.updateKeyboard(guessLetters[i], result[i]);
      }, i * 200);
    }
  }

  updateKeyboard(letter, state) {
    const key = this.shadowRoot.querySelector(`[data-key="${letter}"]`);
    if (!key) return;

    const currentState = key.classList.contains('correct') ? 'correct' :
                        key.classList.contains('present') ? 'present' : 'absent';

    if (state === 'correct' || (state === 'present' && currentState !== 'correct')) {
      key.classList.remove('correct', 'present', 'absent');
      key.classList.add(state);
    } else if (state === 'absent' && currentState === 'absent') {
      key.classList.add('absent');
    }
  }

  revealLetter() {
    if (this.hintsUsed >= this.maxHints || this.gameOver) return;
    
    this.hintsUsed++;
    this.updateHintCounter();

    // Find a letter that hasn't been guessed in the correct position yet
    for (let i = 0; i < 5; i++) {
      const tile = this.getTile(this.currentRow, i);
      if (!tile.textContent || !tile.classList.contains('correct')) {
        const letter = this.word[i];
        tile.textContent = letter;
        tile.classList.add('filled', 'hint', 'correct');
        this.guesses[this.currentRow] = this.guesses[this.currentRow].substring(0, i) + letter + this.guesses[this.currentRow].substring(i + 1);
        this.currentCol = Math.max(this.currentCol, i + 1);
        break;
      }
    }
  }

  eliminateLetters() {
    if (this.hintsUsed >= this.maxHints || this.gameOver) return;
    
    this.hintsUsed++;
    this.updateHintCounter();

    // Mark 3 random letters that aren't in the word as absent on keyboard
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wrongLetters = alphabet.filter(l => !this.word.includes(l));
    const toMark = wrongLetters.sort(() => Math.random() - 0.5).slice(0, 3);

    toMark.forEach(letter => {
      const key = this.shadowRoot.querySelector(`[data-key="${letter}"]`);
      if (key && !key.classList.contains('correct') && !key.classList.contains('present')) {
        key.classList.add('absent');
      }
    });

    this.showMessage(`Eliminated ${toMark.length} wrong letters!`, true);
  }

  updateHintCounter() {
    const counter = this.shadowRoot.getElementById('hints-left');
    const remaining = this.maxHints - this.hintsUsed;
    counter.textContent = remaining;

    if (remaining === 0) {
      this.shadowRoot.querySelectorAll('.hint-btn').forEach(btn => {
        btn.disabled = true;
      });
    }
  }

  getTile(row, col) {
    return this.shadowRoot.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  shakeRow(row) {
    const rowEl = this.shadowRoot.querySelector(`[data-row="${row}"]`);
    rowEl.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
      rowEl.style.animation = '';
    }, 500);
  }

  showMessage(text, isWin) {
    const messageEl = this.shadowRoot.getElementById('message');
    messageEl.innerHTML = text;
    messageEl.className = `message ${isWin ? 'win' : 'lose'}`;
    
    setTimeout(() => {
      messageEl.className = 'message';
      messageEl.innerHTML = '';
    }, 3000);
  }

  openModal(id) {
    this.shadowRoot.getElementById(id).classList.add('active');
  }

  closeModal(id) {
    this.shadowRoot.getElementById(id).classList.remove('active');
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      this.classList.add('dark-mode');
    } else {
      this.classList.remove('dark-mode');
    }
  }
}

// Register the custom element
customElements.define('wordle-game', WordleGame);
