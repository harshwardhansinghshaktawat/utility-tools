/**
 * ABC to MIDI Converter
 * Custom Element for Wix websites
 * 
 * Converts ABC Notation to MIDI with playback and export functionality (MIDI and PDF).
 * Enhanced with beautiful responsive neumorphic design.
 */

class AbcToMidiConverter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.abcNotation = `X:1
T:Example Tune
M:4/4
L:1/8
K:G
|: GABc dedB | dedB dedB | c2ec B2dB | A2BA G4 :|
|: ABcd efge | fgfe dedc | B2gB A2fA | G2BG D4 :|`;
    this.midiPlayer = null;
    this.audioContext = null;
    this.wixApi = null;
    this.synthControl = null;
    this.visualObj = null;
    this.isPlaying = false;
    this.renderUI();
  }

  connectedCallback() {
    // Better Wix integration with proper sizing
    if (window.Wix) {
      // Set initial size and handle resize
      this.handleWixResize();
      
      // Listen for settings updates
      window.Wix.addEventListener(window.Wix.Events.SETTINGS_UPDATED, (data) => {
        this.handleWixSettings(data);
      });
      
      // Listen for resize events
      window.Wix.addEventListener(window.Wix.Events.COMPONENT_CHANGED, () => {
        this.handleWixResize();
      });
    }
    
    this.initializeAbcJs();
    
    // Initialize audio context on page load with user interaction detection
    this.setupAudioContextOnUserInteraction();
  }

  handleWixResize() {
    if (window.Wix) {
      window.Wix.getBoundingRectAndOffsets((rect) => {
        const container = this.shadowRoot.querySelector('.container');
        if (container && rect && rect.rect) {
          // Ensure minimum width and handle responsive behavior
          const minWidth = 320;
          const width = Math.max(rect.rect.width || minWidth, minWidth);
          const height = Math.max(rect.rect.height || 600, 400);
          
          this.style.width = `${width}px`;
          this.style.height = `${height}px`;
          this.style.minWidth = `${minWidth}px`;
          
          // Update container max-width to be responsive
          container.style.maxWidth = '100%';
          container.style.width = '100%';
          
          this.debugLog(`Wix resize: ${width}x${height}`);
        }
      });
    }
  }

  setupAudioContextOnUserInteraction() {
    const initAudioContext = () => {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.debugLog('Audio context initialized on user interaction');
        } catch (e) {
          this.debugLog(`Failed to initialize audio context: ${e.message}`);
        }
      }
      
      // Remove the listeners once audio context is created
      document.removeEventListener('click', initAudioContext);
      document.removeEventListener('keydown', initAudioContext);
      document.removeEventListener('touchstart', initAudioContext);
    };
    
    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('keydown', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });
  }

  handleWixSettings(data) {
    if (data && data.theme) {
      this.updateTheme(data.theme);
    }
    if (data && data.debug) {
      this.setAttribute('debug', data.debug.toString());
    }
    if (data && data.abcNotation) {
      this.abcNotation = data.abcNotation;
      this.shadowRoot.getElementById('abc-input').value = this.abcNotation;
      this.convertAndRender();
    }
  }

  renderUI() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :host {
          display: block;
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          --bg-primary: #e6e7ee;
          --bg-secondary: #ffffff;
          --shadow-light: #ffffff;
          --shadow-dark: #a3b1c6;
          --text-primary: #2d3748;
          --text-secondary: #4a5568;
          --text-muted: #718096;
          --accent-primary: #667eea;
          --accent-secondary: #764ba2;
          --accent-success: #48bb78;
          --accent-warning: #ed8936;
          --accent-error: #f56565;
          --border-radius: 20px;
          --border-radius-small: 12px;
          --border-radius-large: 28px;
          --spacing-xs: 8px;
          --spacing-sm: 12px;
          --spacing-md: 16px;
          --spacing-lg: 24px;
          --spacing-xl: 32px;
          --shadow-neumorphic: 9px 9px 16px var(--shadow-dark), -9px -9px 16px var(--shadow-light);
          --shadow-neumorphic-inset: inset 6px 6px 10px var(--shadow-dark), inset -6px -6px 10px var(--shadow-light);
          --shadow-neumorphic-small: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
          --shadow-neumorphic-pressed: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          min-width: 320px;
          box-sizing: border-box;
          background: linear-gradient(135deg, #e6e7ee 0%, #f1f2f6 100%);
        }
        
        * {
          box-sizing: border-box;
        }
        
        .container {
          background: var(--bg-primary);
          border-radius: var(--border-radius-large);
          box-shadow: var(--shadow-neumorphic);
          overflow: hidden;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          min-height: 600px;
          position: relative;
        }
        
        .container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: var(--border-radius-large) var(--border-radius-large) 0 0;
        }
        
        .header {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          color: white;
          padding: var(--spacing-xl);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          50% { transform: translate(-30%, -30%) rotate(180deg); }
        }
        
        h2 {
          margin: 0;
          font-weight: 600;
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          letter-spacing: -0.025em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }
        
        .subtitle {
          margin: var(--spacing-sm) 0 0 0;
          font-size: 0.95rem;
          opacity: 0.9;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        
        .content {
          padding: var(--spacing-xl);
          width: 100%;
          background: var(--bg-primary);
        }
        
        .section {
          margin-bottom: var(--spacing-xl);
          width: 100%;
        }
        
        .section-label {
          font-weight: 600;
          margin-bottom: var(--spacing-md);
          display: block;
          color: var(--text-primary);
          font-size: 1.1rem;
          letter-spacing: -0.015em;
        }
        
        .neumorphic-input {
          background: var(--bg-primary);
          border: none;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-neumorphic-inset);
          padding: var(--spacing-md) var(--spacing-lg);
          font-family: 'Inter', monospace;
          font-size: 14px;
          color: var(--text-primary);
          transition: var(--transition);
          width: 100%;
          resize: vertical;
          min-height: 200px;
          line-height: 1.6;
        }
        
        .neumorphic-input:focus {
          outline: none;
          box-shadow: var(--shadow-neumorphic-inset), 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .neumorphic-input::placeholder {
          color: var(--text-muted);
          font-style: italic;
        }
        
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--spacing-lg);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }
        
        @media (max-width: 600px) {
          .controls {
            flex-direction: column;
            align-items: stretch;
          }
        }
        
        .neumorphic-button {
          background: var(--bg-primary);
          border: none;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-neumorphic);
          padding: var(--spacing-md) var(--spacing-lg);
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          min-height: 48px;
          position: relative;
          overflow: hidden;
        }
        
        .neumorphic-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: var(--transition);
        }
        
        .neumorphic-button:hover::before {
          left: 100%;
        }
        
        .neumorphic-button:hover {
          transform: translateY(-1px);
          box-shadow: 12px 12px 20px var(--shadow-dark), -12px -12px 20px var(--shadow-light);
        }
        
        .neumorphic-button:active {
          transform: translateY(1px);
          box-shadow: var(--shadow-neumorphic-pressed);
        }
        
        .neumorphic-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: var(--shadow-neumorphic-small);
        }
        
        .neumorphic-button svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
          flex-shrink: 0;
        }
        
        .button-primary {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          color: white;
          box-shadow: var(--shadow-neumorphic);
        }
        
        .button-primary:hover {
          box-shadow: 12px 12px 20px var(--shadow-dark), -12px -12px 20px var(--shadow-light);
        }
        
        .button-success {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
        }
        
        .button-warning {
          background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
          color: white;
        }
        
        .neumorphic-card {
          background: var(--bg-primary);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-neumorphic);
          padding: var(--spacing-lg);
          margin-top: var(--spacing-lg);
          min-height: 200px;
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        
        .neumorphic-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--shadow-light), transparent);
        }
        
        #score-output {
          width: 100%;
          overflow-x: auto;
          padding: var(--spacing-md);
          border-radius: var(--border-radius-small);
          background: var(--bg-secondary);
          box-shadow: var(--shadow-neumorphic-inset);
          min-height: 150px;
        }
        
        /* Enhanced abcjs audio controls styling */
        #score-output .abcjs-midi-selection,
        #score-output .abcjs-midi-current-tempo,
        #score-output .abcjs-midi-progress,
        #score-output .abcjs-midi-clock {
          font-family: 'Inter', sans-serif !important;
          color: var(--text-primary) !important;
          margin: var(--spacing-sm) 0;
        }
        
        #score-output .abcjs-midi-selection select {
          background: var(--bg-primary);
          border: none;
          border-radius: var(--border-radius-small);
          box-shadow: var(--shadow-neumorphic-inset);
          padding: var(--spacing-sm) var(--spacing-md);
          margin: var(--spacing-xs);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
        }
        
        #score-output .abcjs-midi-selection button {
          background: var(--bg-primary) !important;
          border: none !important;
          border-radius: var(--border-radius-small) !important;
          box-shadow: var(--shadow-neumorphic-small) !important;
          padding: var(--spacing-sm) var(--spacing-md) !important;
          margin: var(--spacing-xs) !important;
          color: var(--text-primary) !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: var(--transition) !important;
        }
        
        #score-output .abcjs-midi-selection button:hover {
          transform: translateY(-1px) !important;
          box-shadow: var(--shadow-neumorphic) !important;
        }
        
        #score-output .abcjs-midi-selection button:active {
          transform: translateY(1px) !important;
          box-shadow: var(--shadow-neumorphic-pressed) !important;
        }
        
        #score-output .abcjs-midi-selection button:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }
        
        #score-output .abcjs-midi-progress {
          margin: var(--spacing-md) 0 !important;
        }
        
        #score-output .abcjs-midi-progress-background {
          background: var(--bg-primary) !important;
          box-shadow: var(--shadow-neumorphic-inset) !important;
          height: 8px !important;
          border-radius: 4px !important;
        }
        
        #score-output .abcjs-midi-progress-indicator {
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)) !important;
          height: 8px !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3) !important;
        }
        
        .player-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
        }
        
        @media (max-width: 600px) {
          .player-controls {
            grid-template-columns: 1fr;
          }
        }
        
        .download-section {
          margin-top: var(--spacing-xl);
          padding: var(--spacing-lg);
          background: var(--bg-primary);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-neumorphic-inset);
        }
        
        .download-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-top: var(--spacing-md);
        }
        
        @media (max-width: 600px) {
          .download-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .download-card {
          background: var(--bg-primary);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-neumorphic);
          padding: var(--spacing-lg);
          text-align: center;
          transition: var(--transition);
          text-decoration: none;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .download-card:hover {
          transform: translateY(-2px);
          box-shadow: 15px 15px 25px var(--shadow-dark), -15px -15px 25px var(--shadow-light);
        }
        
        .download-card svg {
          width: 32px;
          height: 32px;
          fill: var(--accent-primary);
        }
        
        .examples-dropdown {
          flex-grow: 1;
          max-width: 250px;
        }
        
        @media (max-width: 600px) {
          .examples-dropdown {
            max-width: 100%;
          }
        }
        
        .neumorphic-select {
          background: var(--bg-primary);
          border: none;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-neumorphic-inset);
          padding: var(--spacing-md) var(--spacing-lg);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: var(--text-primary);
          width: 100%;
          min-height: 48px;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .neumorphic-select:focus {
          outline: none;
          box-shadow: var(--shadow-neumorphic-inset), 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .progress-container {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--bg-primary);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-neumorphic-inset);
        }
        
        .progress-bar-container {
          height: 8px;
          width: 100%;
          background: var(--bg-primary);
          border-radius: 4px;
          box-shadow: var(--shadow-neumorphic-inset);
          position: relative;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 4px;
          transition: width 0.1s linear;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
          position: relative;
        }
        
        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .loader {
          display: none;
          text-align: center;
          padding: var(--spacing-xl);
        }
        
        .spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary));
          mask: radial-gradient(circle at center, transparent 16px, black 17px);
          animation: spin 1s linear infinite;
          margin: 0 auto var(--spacing-md) auto;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loader p {
          color: var(--text-secondary);
          font-weight: 500;
          margin: 0;
        }
        
        .message {
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--border-radius);
          margin-top: var(--spacing-md);
          font-weight: 500;
          display: none;
          text-align: center;
        }
        
        .error-message {
          background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
          color: var(--accent-error);
          box-shadow: var(--shadow-neumorphic-inset);
          border-left: 4px solid var(--accent-error);
        }
        
        .status-message {
          background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
          color: var(--accent-success);
          box-shadow: var(--shadow-neumorphic-inset);
          border-left: 4px solid var(--accent-success);
        }
        
        .footer {
          padding: var(--spacing-lg);
          text-align: center;
          background: var(--bg-primary);
          font-size: 0.9em;
          color: var(--text-muted);
          border-radius: 0 0 var(--border-radius-large) var(--border-radius-large);
          position: relative;
        }
        
        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: var(--spacing-lg);
          right: var(--spacing-lg);
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--shadow-dark), transparent);
        }
        
        .debug-info {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: var(--spacing-lg);
          display: none;
          max-height: 200px;
          overflow-y: auto;
          background: var(--bg-primary);
          border-radius: var(--border-radius-small);
          box-shadow: var(--shadow-neumorphic-inset);
          padding: var(--spacing-md);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          line-height: 1.4;
        }
        
        #audio-controls-container {
          margin-top: var(--spacing-md);
          width: 100%;
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--border-radius-small);
          box-shadow: var(--shadow-neumorphic-inset);
        }
        
        /* Responsive enhancements */
        @media (max-width: 768px) {
          .content {
            padding: var(--spacing-lg);
          }
          
          .header {
            padding: var(--spacing-lg);
          }
          
          h2 {
            font-size: 1.5rem;
          }
          
          .neumorphic-button {
            padding: var(--spacing-md);
            font-size: 14px;
          }
          
          .neumorphic-input {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
        
        @media (max-width: 480px) {
          :host {
            --spacing-xs: 6px;
            --spacing-sm: 10px;
            --spacing-md: 14px;
            --spacing-lg: 18px;
            --spacing-xl: 24px;
          }
          
          .content {
            padding: var(--spacing-md);
          }
          
          .header {
            padding: var(--spacing-md);
          }
        }
        
        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          :host {
            --bg-primary: #2d3748;
            --bg-secondary: #4a5568;
            --shadow-light: #3a4553;
            --shadow-dark: #1a202c;
            --text-primary: #f7fafc;
            --text-secondary: #e2e8f0;
            --text-muted: #a0aec0;
          }
        }
        
        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Focus styles for accessibility */
        .neumorphic-button:focus-visible,
        .neumorphic-input:focus-visible,
        .neumorphic-select:focus-visible {
          outline: 2px solid var(--accent-primary);
          outline-offset: 2px;
        }
      </style>
      <div class="container">
        <div class="header">
          <h2>ABC to MIDI Converter</h2>
          <p class="subtitle">Transform musical notation into beautiful sound</p>
        </div>
        <div class="content">
          <div class="section">
            <label class="section-label">🎵 ABC Notation</label>
            <textarea id="abc-input" class="neumorphic-input" placeholder="Enter your ABC notation here...">${this.abcNotation}</textarea>
            <div class="controls">
              <div class="examples-dropdown">
                <select id="examples" class="neumorphic-select">
                  <option value="">🎼 Load Example...</option>
                  <option value="simple">🎹 Simple Melody</option>
                  <option value="jig">🍀 Irish Jig</option>
                  <option value="waltz">💃 Waltz</option>
                  <option value="bach">🎭 Bach Minuet</option>
                  <option value="multivoice">🎤 Multi-Voice</option>
                  <option value="complex">🎪 Complex Notation</option>
                  <option value="avicii">🎧 EDM Inspired</option>
                </select>
              </div>
              <button id="convert-button" class="neumorphic-button button-primary">
                <svg viewBox="0 0 24 24">
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                </svg>
                Convert & Play
              </button>
            </div>
            <div class="error-message message" id="error-message"></div>
            <div class="status-message message" id="status-message"></div>
          </div>
          
          <div class="section">
            <label class="section-label">🎼 Score Preview</label>
            <div class="loader" id="loader">
              <div class="spinner"></div>
              <p>Generating beautiful music...</p>
            </div>
            <div class="neumorphic-card">
              <div id="score-output"></div>
              <div id="audio-controls-container"></div>
            </div>
            
            <div class="player-controls">
              <button id="play-button" class="neumorphic-button button-success">
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
                Play
              </button>
              <button id="stop-button" class="neumorphic-button button-warning">
                <svg viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"></path>
                </svg>
                Stop
              </button>
              <button id="restart-button" class="neumorphic-button">
                <svg viewBox="0 0 24 24">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path>
                </svg>
                Restart
              </button>
            </div>
            
            <div class="progress-container">
              <div class="progress-bar-container">
                <div class="progress-bar" id="progress-bar"></div>
              </div>
            </div>
          </div>
          
          <div class="download-section">
            <label class="section-label">💾 Download Options</label>
            <div class="download-grid">
              <a id="midi-download-link" class="download-card" style="display: none;" download="abc_midi.mid">
                <svg viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                </svg>
                <div>
                  <div style="font-weight: 600;">MIDI File</div>
                  <div style="font-size: 0.85em; opacity: 0.8;">Download audio file</div>
                </div>
              </a>
              <button id="pdf-download-button" class="download-card" style="display: none;">
                <svg viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                </svg>
                <div>
                  <div style="font-weight: 600;">Sheet Music PDF</div>
                  <div style="font-size: 0.85em; opacity: 0.8;">Print sheet music</div>
                </div>
              </button>
            </div>
          </div>
          
          <div class="debug-info" id="debug-info"></div>
        </div>
        <div class="footer">
          ✨ Powered by abcjs | Made with ❤️ for music lovers
        </div>
      </div>
    `;
  }

  initializeAbcJs() {
    // Load both JS and CSS files for abcjs
    const scriptUrls = ['https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-basic-min.js'];
    const cssUrls = ['https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-audio.css'];
    
    Promise.all([
      this.loadScripts(scriptUrls),
      this.loadCSS(cssUrls)
    ])
      .then(() => {
        this.debugLog('ABCJS library and CSS loaded successfully');
        this.setupEventListeners();
        setTimeout(() => this.convertAndRender(), 500);
      })
      .catch((error) => {
        this.showError('Failed to load ABCJS library. Please try again later.');
        this.dispatchWixEvent('error', { message: 'Failed to load ABCJS library', error });
      });
  }

  loadScripts(urls) {
    const promises = urls.map((url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    });
    return Promise.all(promises);
  }

  loadCSS(urls) {
    const promises = urls.map((url) => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    });
    return Promise.all(promises);
  }

  setupEventListeners() {
    const abcInput = this.shadowRoot.getElementById('abc-input');
    const convertButton = this.shadowRoot.getElementById('convert-button');
    const playButton = this.shadowRoot.getElementById('play-button');
    const stopButton = this.shadowRoot.getElementById('stop-button');
    const restartButton = this.shadowRoot.getElementById('restart-button');
    const examplesDropdown = this.shadowRoot.getElementById('examples');
    const pdfDownloadButton = this.shadowRoot.getElementById('pdf-download-button');
    
    abcInput.addEventListener('input', () => {
      this.abcNotation = abcInput.value;
      this.dispatchWixEvent('inputChanged', { notation: this.abcNotation });
    });

    convertButton.addEventListener('click', () => {
      this.stopMidi();
      this.abcNotation = abcInput.value;
      this.convertAndRender();
      this.dispatchWixEvent('convert', { notation: this.abcNotation });
    });

    playButton.addEventListener('click', () => {
      this.abcNotation = abcInput.value;
      this.playMidi();
      this.dispatchWixEvent('play', {});
    });

    stopButton.addEventListener('click', () => {
      this.stopMidi();
      this.dispatchWixEvent('stop', {});
    });

    restartButton.addEventListener('click', () => {
      this.restartMidi();
      this.dispatchWixEvent('restart', {});
    });

    examplesDropdown.addEventListener('change', () => {
      const selectedValue = examplesDropdown.value;
      if (selectedValue) {
        this.stopMidi();
        this.cleanupMidiPlayer();
        abcInput.value = this.getExampleAbc(selectedValue);
        this.abcNotation = abcInput.value;
        this.convertAndRender();
        examplesDropdown.value = "";
        this.dispatchWixEvent('exampleLoaded', { example: selectedValue });
      }
    });

    pdfDownloadButton.addEventListener('click', () => {
      this.exportSheetMusicAsPdf();
      this.dispatchWixEvent('pdfExport', {});
    });

    // Initialize cursor control
    this.cursorControl = {
      onStart: () => {
        const progressBar = this.shadowRoot.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = '0%';
      },
      onEvent: (ev) => {
        if (ev && ev.percentage !== undefined) {
          const progressBar = this.shadowRoot.getElementById('progress-bar');
          if (progressBar) progressBar.style.width = `${ev.percentage}%`;
        }
      },
      onFinished: () => {
        const progressBar = this.shadowRoot.getElementById('progress-bar');
        if (progressBar) {
          progressBar.style.width = '100%';
          setTimeout(() => {
            progressBar.style.width = '0%';
          }, 1000);
        }
        this.isPlaying = false;
      }
    };
  }

  getExampleAbc(example) {
    switch (example) {
      case 'simple':
        return `X:1
T:Simple Melody
M:4/4
L:1/8
Q:1/4=120
K:C
C2 D2 E2 F2 | G2 A2 B2 c2 | c2 B2 A2 G2 | F2 E2 D2 C2 |`;
      case 'jig':
        return `X:1
T:Irish Jig Example
M:6/8
L:1/8
Q:1/8=120
K:D
|:DFA AFA | BGB AFA | DFA AFA | BEE EFE :|
|:DFA AFA | BGB AFA | afd bge |1 fed edc :|2 fed ecA ||`;
      case 'waltz':
        return `X:1
T:Waltz Example
M:3/4
L:1/8
Q:1/4=80
K:G
D2 | G3A B2 | A3B c2 | B3A G2 | A4 D2 |
G3A B2 | A3B c2 | B3A G2 | G4 :|`;
      case 'bach':
        return `X:1
T:Minuet in G
C:J.S. Bach
M:3/4
L:1/8
Q:1/4=100
K:G
|:D2 | G3A B2 | A3B c2 | B2 A2 G2 | F4 D2 |
E3F G2 | F3G A2 | B2 A2 G2 | G4 :|
|:B2 | c3d e2 | e2 d2 c2 | B3c d2 | d2 c2 B2 |
c3d e2 | e2 d2 c2 | B2 A2 G2 | G4 :|`;
      case 'multivoice':
        return `X:1
T:Multi-Voice Example
M:4/4
L:1/4
Q:1/4=120
K:C
V:1
C D E F | G2 E2 | C4 |
V:2
E, G, C C | B,2 C2 | E4 |
V:3
C, C, C, C, | G,2 C,2 | C,4 |`;
      case 'complex':
        return `X:1
T:Complex Notation Example
M:4/4
L:1/8
Q:1/4=90
K:G
%%score (T1 T2) (B1 B2)
V:T1 name="Soprano"
!p! G4 A4 | B4 c4 | !f! d2 c2 B2 A2 | G8 |]
V:T2 name="Alto" clef=treble
!p! D4 D4 | D4 E4 | !f! G2 G2 G2 F2 | D8 |]
V:B1 name="Tenor" clef=bass
!p! B,4 A,4 | G,4 G,4 | !f! B,2 E2 D2 D2 | B,8 |]
V:B2 name="Bass" clef=bass
!p! G,,4 F,,4 | E,,4 C,,4 | !f! G,,2 C,2 D,2 D,,2 | G,,8 |]`;
      case 'avicii':
        return `X:1
T:City Lights (EDM-Inspired)
M:4/4
L:1/8
Q:1/4=128
K:D
V:1 clef=treble name="Lead Melody" sname="Lead"
%%MIDI program 1 81
z8|z8|z8|z2 A,/B,/ ^C/D/ E/F/ ^G/A/||: "D" f3e d2A2|"Bm" f3e d2f2|"G" e3d B2A2|"A" ^c4 z2 A,/B,/ ^C/D/ :||: "D" A3B A2F2|"Bm" F3D F2A2|"G" B3A G2B2|"A" A4 z2 A,/B,/ ^C/D/ :|"Em" E3F E2B,2|"G" G3F D2B,2|"A" ^C3D E2^G2|"D" A4 z2 f/e/ d/e/|"Em" f3e d2B2|"G" e3d B2G2|"A" ^c3d e2^g2|"D" a4 z4|
V:2 clef=bass name="Rhythm" sname="Rhyt"
%%MIDI program 2 1
[D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2|[B,,D,^F,]2 [B,,D,^F,]2 [B,,D,^F,]2 [B,,D,^F,]2|[G,,B,,D,]2 [G,,B,,D,]2 [A,,^C,E,]2 [A,,^C,E,]2|[D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2||: [D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2|[B,,D,^F,]2 [B,,D,^F,]2 [B,,D,^F,]2 [B,,D,^F,]2|[G,,B,,D,]2 [G,,B,,D,]2 [G,,B,,D,]2 [G,,B,,D,]2|[A,,^C,E,]2 [A,,^C,E,]2 [A,,^C,E,]2 [A,,^C,E,]2 :||: [D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2|[B,,D,^F,]2 [B,,D,^F,]2 [B,,D,^F,]2 [B,,D,^F,]2|[G,,B,,D,]2 [G,,B,,D,]2 [G,,B,,D,]2 [G,,B,,D,]2|[A,,^C,E,]2 [A,,^C,E,]2 [A,,^C,E,]2 [A,,^C,E,]2 :|[E,G,B,]2 [E,G,B,]2 [E,G,B,]2 [E,G,B,]2|[G,,B,,D,]2 [G,,B,,D,]2 [G,,B,,D,]2 [G,,B,,D,]2|[A,,^C,E,]2 [A,,^C,E,]2 [A,,^C,E,]2 [A,,^C,E,]2|[D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2|[E,G,B,]2 [E,G,B,]2 [E,G,B,]2 [E,G,B,]2|[G,,B,,D,]2 [G,,B,,D,]2 [G,,B,,D,]2 [G,,B,,D,]2|[A,,^C,E,]2 [A,,^C,E,]2 [A,,^C,E,]2 [A,,^C,E,]2|[D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2 [D,^F,A,]2|
V:3 clef=treble name="Bass" sname="Bass"
%%MIDI program 3 38
D,4 D,2 F,2|B,,4 B,,2 D,2|G,,2 B,,2 A,,2 A,,2|D,4 D,2 F,2||: D,2 F,2 A,2 D2|B,,2 D,2 F,2 B,2|G,,2 B,,2 D,2 G,2|A,,2 ^C,2 E,2 A,2 :||: D,2 F,2 A,2 D2|B,,2 D,2 F,2 B,2|G,,2 B,,2 D,2 G,2|A,,2 ^C,2 E,2 A,2 :|E,2 G,2 B,2 E2|G,,2 B,,2 D,2 G,2|A,,2 ^C,2 E,2 A,2|D,2 F,2 A,2 D2|E,2 G,2 B,2 E2|G,,2 B,,2 D,2 G,2|A,,2 ^C,2 E,2 A,2|D,8|`;
      default:
        return this.abcNotation;
    }
  }

  fixAdvancedNotation(notation) {
    try {
      this.debugLog('Fixing advanced ABC notation...');
      let fixed = notation;
      let lines = fixed.split('\n');
      let headerLines = [];
      let voiceDefinitions = {};
      let voiceData = {};
      let currentVoice = null;
      let inHeader = true;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '' || line.startsWith('%%')) {
          if (inHeader) headerLines.push(lines[i]);
          continue;
        }
        if (inHeader && (line.startsWith('X:') || line.startsWith('T:') || 
            line.startsWith('C:') || line.startsWith('M:') || line.startsWith('L:') || 
            line.startsWith('Q:') || line.startsWith('K:'))) {
          headerLines.push(lines[i]);
          if (line.startsWith('K:')) inHeader = false;
          continue;
        }
        const voiceMatch = line.match(/^V:([^ ]+)/);
        if (voiceMatch) {
          const voiceId = voiceMatch[1].trim();
          currentVoice = voiceId;
          if (!voiceDefinitions[voiceId]) {
            voiceDefinitions[voiceId] = lines[i];
          } else {
            voiceDefinitions[voiceId] = lines[i];
          }
          if (!voiceData[voiceId]) {
            voiceData[voiceId] = [];
          }
          continue;
        }
        if (currentVoice && line !== '') {
          voiceData[currentVoice].push(lines[i]);
        } else if (!inHeader && !currentVoice && line !== '') {
          currentVoice = 'default';
          if (!voiceData[currentVoice]) {
            voiceData[currentVoice] = [];
          }
          voiceData[currentVoice].push(lines[i]);
        }
      }

      this.debugLog(`Found ${Object.keys(voiceData).length} voices in the ABC notation`);

      Object.keys(voiceData).forEach(voiceId => {
        for (let i = 0; i < voiceData[voiceId].length; i++) {
          let line = voiceData[voiceId][i];
          line = line.replace(/!crescendo\(!/g, '!<(!');
          line = line.replace(/!crescendo\)!/g, '!<)!');
          line = line.replace(/!diminuendo\(!/g, '!>(!');
          line = line.replace(/!diminuendo\)!/g, '!>)!');
          line = line.replace(/!([^!]+)!/g, (match, content) => {
            const supported = [
              'p', 'pp', 'ppp', 'f', 'ff', 'fff', 'mp', 'mf',
              'sfz', '<(', '<)', '>(', '>)',
              'accent', 'staccato', 'tenuto', 'fermata'
            ];
            if (supported.includes(content) || supported.some(s => content.includes(s))) {
              return match;
            }
            this.debugLog(`Removing unsupported dynamic: ${content}`);
            return '';
          });
          voiceData[voiceId][i] = line;
        }
      });

      let result = [...headerLines];
      const voiceOrder = Object.keys(voiceDefinitions);
      for (const voiceId of voiceOrder) {
        result.push(voiceDefinitions[voiceId]);
        if (voiceData[voiceId] && voiceData[voiceId].length > 0) {
          result = result.concat(voiceData[voiceId]);
        }
      }
      if (voiceData['default'] && !voiceOrder.includes('default')) {
        result = result.concat(voiceData['default']);
      }
      fixed = result.join('\n');
      this.debugLog('Successfully fixed complex ABC notation');
      return fixed;
    } catch (error) {
      this.debugLog(`Error fixing ABC notation: ${error.message}`);
      this.showError('Error fixing complex ABC notation. Please check syntax.');
      this.dispatchWixEvent('error', { message: 'Error fixing ABC notation', error });
      return notation;
    }
  }

  validateAbcNotation(notation) {
    try {
      if (!notation || notation.trim() === '') {
        return { valid: false, error: 'ABC notation is empty' };
      }
      const lines = notation.split('\n');
      const requiredHeaders = ['X:', 'M:', 'L:', 'K:'];
      const foundHeaders = requiredHeaders.filter(header => 
        lines.some(line => line.trim().startsWith(header))
      );
      if (foundHeaders.length < requiredHeaders.length) {
        return {
          valid: false,
          error: `Missing required ABC headers: ${requiredHeaders.filter(h => !foundHeaders.includes(h)).join(', ')}`
        };
      }
      let voices = {};
      let currentVoice = 'default';
      let hasNotes = false;
      let measureCount = 0;
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('%')) continue;
        const voiceMatch = trimmedLine.match(/^V:([^ ]+)/);
        if (voiceMatch) {
          currentVoice = voiceMatch[1].trim();
          if (!voices[currentVoice]) {
            voices[currentVoice] = { measureCount: 0, hasNotes: false };
          }
          continue;
        }
        if (trimmedLine.match(/^[A-Za-z]:/)) continue;
        if (trimmedLine.includes('|')) {
          if (!voices[currentVoice]) {
            voices[currentVoice] = { measureCount: 0, hasNotes: false };
          }
          voices[currentVoice].measureCount += (trimmedLine.match(/\|/g) || []).length;
          measureCount += (trimmedLine.match(/\|/g) || []).length;
        }
        if (trimmedLine.match(/[A-Ga-g][,']*[0-9]*/)) {
          if (!voices[currentVoice]) {
            voices[currentVoice] = { measureCount: 0, hasNotes: false };
          }
          voices[currentVoice].hasNotes = true;
          hasNotes = true;
        }
      }
      if (measureCount === 0) {
        return { valid: false, error: 'No measures found in the ABC notation. Please add bar lines (|).' };
      }
      if (!hasNotes) {
        return { valid: false, error: 'No notes found in the ABC notation.' };
      }
      for (const voiceId in voices) {
        const voice = voices[voiceId];
        if (voice.measureCount === 0) {
          this.debugLog(`Warning: Voice ${voiceId} has no measures`);
        }
        if (!voice.hasNotes) {
          this.debugLog(`Warning: Voice ${voiceId} has no notes`);
        }
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, error: `Invalid ABC notation: ${error.message}` };
    }
  }

  cleanupMidiPlayer() {
    try {
      if (this.isPlaying) {
        this.stopMidi();
      }
      
      if (this.synthControl) {
        if (typeof this.synthControl.destroy === 'function') {
          this.synthControl.destroy();
        }
        this.synthControl = null;
      }
      
      if (this.midiPlayer) {
        if (typeof this.midiPlayer.stop === 'function') {
          this.midiPlayer.stop();
        }
        this.midiPlayer = null;
      }
      
      const audioControlsContainer = this.shadowRoot.getElementById('audio-controls-container');
      if (audioControlsContainer) {
        audioControlsContainer.innerHTML = '';
      }
      
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.suspend().catch(e => this.debugLog(`Error suspending audio context: ${e}`));
      }
      
      this.visualObj = null;
      this.isPlaying = false;
      this.debugLog('MIDI player and audio context cleaned up');
    } catch (error) {
      this.debugLog(`Error cleaning up MIDI player: ${error.message}`);
    }
  }

  convertAndRender() {
    const scoreOutput = this.shadowRoot.getElementById('score-output');
    const errorMessage = this.shadowRoot.getElementById('error-message');
    const loader = this.shadowRoot.getElementById('loader');
    const midiDownloadLink = this.shadowRoot.getElementById('midi-download-link');
    const pdfDownloadButton = this.shadowRoot.getElementById('pdf-download-button');
    const abcInput = this.shadowRoot.getElementById('abc-input');
    const progressBar = this.shadowRoot.getElementById('progress-bar');
    const statusMessage = this.shadowRoot.getElementById('status-message');
    const audioControlsContainer = this.shadowRoot.getElementById('audio-controls-container');

    // Clean up any existing players
    this.cleanupMidiPlayer();

    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    statusMessage.style.display = 'none';
    statusMessage.textContent = '';
    midiDownloadLink.style.display = 'none';
    pdfDownloadButton.style.display = 'none';
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    if (audioControlsContainer) {
      audioControlsContainer.innerHTML = '';
    }
    loader.style.display = 'block';

    this.abcNotation = abcInput.value;

    if (!window.ABCJS) {
      loader.style.display = 'none';
      this.showError('ABCJS library not loaded. Please refresh the page and try again.');
      return;
    }

    try {
      const validation = this.validateAbcNotation(this.abcNotation);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      scoreOutput.innerHTML = '';

      const isLongNotation = this.abcNotation.length > 10000;
      if (isLongNotation) {
        this.debugLog(`Processing long notation (${this.abcNotation.length} chars)`);
      }

      const hasMultipleVoices = this.abcNotation.includes('V:');
      const hasComplexDynamics = this.abcNotation.includes('!crescendo') || 
                               this.abcNotation.includes('!diminuendo') ||
                               this.abcNotation.match(/![^\s!]+!/);
      if (hasMultipleVoices || hasComplexDynamics) {
        this.debugLog('Detected complex notation features, applying fixes...');
        this.abcNotation = this.fixAdvancedNotation(this.abcNotation);
        abcInput.value = this.abcNotation;
      }

      const renderOptions = {
        responsive: 'resize',
        add_classes: true,
        staffwidth: isLongNotation ? 720 : 740,
        scale: isLongNotation ? 0.9 : 1,
        paddingleft: 15,
        paddingright: 15,
        paddingbottom: 15,
        paddingtop: 15
      };

      try {
        this.visualObj = window.ABCJS.renderAbc(scoreOutput, this.abcNotation, renderOptions)[0];
      } catch (renderError) {
        throw new Error(`Failed to render ABC notation: ${renderError.message}`);
      }

      if (!this.visualObj) {
        throw new Error('Failed to render ABC notation. Please check your syntax.');
      }

      this.debugLog(`Rendered visual object successfully`);

      // Check for synth support
      const hasMidiSupport = window.ABCJS.synth && window.ABCJS.synth.SynthController;
      if (hasMidiSupport) {
        // Create audio context if it doesn't exist
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.debugLog('Created new audio context');
        }
        
        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume()
            .then(() => this.debugLog('Audio context resumed'))
            .catch(e => this.debugLog(`Error resuming audio context: ${e}`));
        }
        
        // Initialize the synth controller
        this.initializeSynthControl()
          .then(() => {
            const midiData = this.generateMidiDownload();
            if (midiData) {
              midiDownloadLink.href = midiData;
              midiDownloadLink.style.display = 'flex';
            }
            pdfDownloadButton.style.display = 'flex';
            loader.style.display = 'none';
            this.showStatus('ABC notation converted successfully! 🎵');
          })
          .catch(error => {
            loader.style.display = 'none';
            this.showError(`MIDI playback initialization failed: ${error.message}`);
            // Still provide the MIDI download even if playback fails
            const midiData = this.generateMidiDownload();
            if (midiData) {
              midiDownloadLink.href = midiData;
              midiDownloadLink.style.display = 'flex';
            }
            pdfDownloadButton.style.display = 'flex';
          });
      } else {
        loader.style.display = 'none';
        this.showStatus('Score rendered (MIDI features not available in this browser)');
        pdfDownloadButton.style.display = 'flex';
      }
    } catch (error) {
      loader.style.display = 'none';
      this.showError(error.message || 'Failed to convert ABC notation. Please check your input syntax.');
      this.dispatchWixEvent('error', { message: error.message || 'Conversion failed', error });
    }
  }

  initializeSynthControl() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(e => this.debugLog(`Error resuming audio context: ${e}`));
        }
        
        const audioControlsContainer = this.shadowRoot.getElementById('audio-controls-container');
        if (!audioControlsContainer) {
          reject(new Error('Audio controls container not found'));
          return;
        }
        
        // Clear any existing controls
        audioControlsContainer.innerHTML = '';
        
        // Create a wrapper for the synth controller - NOTE: the ID must NOT have hyphens
        const synthWrapper = document.createElement('div');
        synthWrapper.id = 'synthcontrol'; // Changed to remove hyphen
        audioControlsContainer.appendChild(synthWrapper);
        
        // Create synth controller
        this.synthControl = new window.ABCJS.synth.SynthController();
        
        // Important: When selecting within shadow DOM, we need to use the element directly 
        // instead of a CSS selector to avoid selection issues
        this.debugLog('Setting up synth controller with direct element reference');
        
        // Configure synth using the element reference, not a CSS selector
        this.synthControl.load(synthWrapper, this.cursorControl, {
          displayLoop: true,
          displayRestart: true,
          displayPlay: true,
          displayProgress: true,
          displayWarp: true
        });
        
        // Get tempo and other settings from the ABC notation
        const tempoValue = this.extractTempo(this.abcNotation);
        
        // Load the tune into the synth controller with proper settings
        this.synthControl.setTune(this.visualObj, false, {
          qpm: tempoValue,
          program: 0, // Piano by default
          midiTranspose: 0,
          soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/",
          pan: this.getPanSettings(this.abcNotation)
        }).then(() => {
          this.debugLog('Synth controller initialized successfully');
          resolve();
        }).catch(error => {
          this.debugLog(`Error initializing synth controller: ${error.message}`);
          reject(error);
        });
      } catch (error) {
        this.debugLog(`Error in initializeSynthControl: ${error.message}`);
        reject(error);
      }
    });
  }

  extractTimeSignature(notation) {
    const match = notation.match(/M:\s*(\d+)\/(\d+)/);
    return match ? `${match[1]}/${match[2]}` : '4/4';
  }

  calculateMillisecondsPerMeasure(timeSignature) {
    try {
      const [beatsPerMeasure, beatUnit] = timeSignature.split('/').map(Number);
      const baseTempo = this.extractTempo(this.abcNotation) || 100;
      const msPerBeat = 60000 / baseTempo;
      let beatAdjustment = 1;
      if (beatUnit === 8) beatAdjustment = 0.5;
      if (beatUnit === 2) beatAdjustment = 2;
      return msPerBeat * beatsPerMeasure * beatAdjustment;
    } catch (error) {
      this.debugLog(`Error calculating measure timing: ${error.message}`);
      return 2000;
    }
  }

  extractTempo(notation) {
    const complexMatch = notation.match(/Q:\s*(?:"[^"]*"\s*)?(?:C?\s*)?(\d+)\/(\d+)\s*=\s*(\d+)/);
    if (complexMatch) {
      const noteValue = parseInt(complexMatch[1], 10) / parseInt(complexMatch[2], 10);
      const bpm = parseInt(complexMatch[3], 10);
      return bpm * (noteValue * 4);
    }
    const simpleMatch = notation.match(/Q:\s*(?:"[^"]*"\s*)?(?:C?\s*)?(\d+)/);
    if (simpleMatch) {
      return parseInt(simpleMatch[1], 10);
    }
    const timeSignature = this.extractTimeSignature(notation);
    switch (timeSignature) {
      case '2/4': return 90;
      case '3/4': return 80;
      case '4/4': return 100;
      case '6/8': return 120;
      default: return 100;
    }
  }

  getPanSettings(notation) {
    const voiceMatches = notation.match(/V:[^\r\n]+/g);
    const voiceCount = voiceMatches ? new Set(voiceMatches.map(v => {
      const match = v.match(/V:([^ \r\n]+)/);
      return match ? match[1].trim() : '';
    })).size : 0;
    if (voiceCount <= 1) return [];
    const panArray = [];
    for (let i = 0; i < voiceCount; i++) {
      const pan = -0.7 + (i * 1.4 / (voiceCount - 1));
      panArray.push(pan);
    }
    this.debugLog(`Created pan settings for ${voiceCount} voices: ${JSON.stringify(panArray)}`);
    return panArray;
  }

  generateMidiDownload() {
    try {
      if (!this.abcNotation || this.abcNotation.trim() === '') {
        this.debugLog('No ABC notation to generate MIDI');
        return null;
      }

      const tempoValue = this.extractTempo(this.abcNotation);
      
      // Use the existing visualObj if available
      let visualObj = this.visualObj;
      
      // If no visualObj exists, create a temporary one
      if (!visualObj) {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        try {
          visualObj = window.ABCJS.renderAbc(tempDiv, this.abcNotation, {
            add_classes: false,
            responsive: false
          })[0];
        } catch (parseError) {
          this.debugLog(`Error parsing for MIDI generation: ${parseError.message}`);
          visualObj = this.createMinimalVisualizationObject(this.abcNotation);
          if (!visualObj) {
            throw new Error('Failed to create visualization object for MIDI');
          }
        }
        document.body.removeChild(tempDiv);
      }

      let midiBuffer;
      if (window.ABCJS.synth && window.ABCJS.synth.getMidiFile) {
        const midiOptions = {
          midiOutputType: 'binary',
          generateDownload: true,
          qpm: tempoValue,
          program: 0,
          midiTranspose: 0,
          voicesOff: false,
          chordsOff: false
        };
        midiBuffer = window.ABCJS.synth.getMidiFile(visualObj, midiOptions);
      } else {
        throw new Error('MIDI generation not supported');
      }

      if (!midiBuffer || !midiBuffer.length) {
        this.debugLog('Generated MIDI buffer is empty');
        return null;
      }

      const base64 = 'data:audio/midi;base64,' + btoa(
        Array.from(new Uint8Array(midiBuffer))
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
      this.debugLog(`Generated MIDI file with size: ${midiBuffer.length} bytes`);
      return base64;
    } catch (error) {
      this.debugLog(`Error generating MIDI download: ${error.message}`);
      this.dispatchWixEvent('error', { message: 'MIDI download generation failed', error });
      return null;
    }
  }

  createMinimalVisualizationObject(notation) {
    try {
      const keyMatch = notation.match(/K:([^\n\r]*)/);
      const key = keyMatch ? keyMatch[1].trim() : 'C';
      const timeMatch = notation.match(/M:([^\n\r]*)/);
      const time = timeMatch ? timeMatch[1].trim() : '4/4';
      const tempoMatch = notation.match(/Q:([^\n\r]*)/);
      const tempo = tempoMatch ? tempoMatch[1].trim() : '1/4=120';

      return {
        formatting: {
          bagpipes: false,
          flatbeams: false,
          landscape: false,
          responsive: false
        },
        media: 'screen',
        version: '1.0.1',
        metaText: {
          key: key,
          meter: time,
          tempo: tempo
        },
        lines: [{
          staff: [{
            voices: [[]],
            meter: { type: 'specified', value: time },
            clef: { type: 'treble' },
            key: { root: key.charAt(0), acc: '', mode: key.includes('m') ? 'minor' : 'major' }
          }]
        }],
        staffgroups: [{ staffs: [{}] }]
      };
    } catch (e) {
      this.debugLog(`Error creating minimal visualization object: ${e.message}`);
      return null;
    }
  }

  exportSheetMusicAsPdf() {
    try {
      const scoreOutput = this.shadowRoot.getElementById('score-output');
      if (!scoreOutput || !scoreOutput.innerHTML) {
        this.showError('No sheet music available to export');
        return;
      }

      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.background = 'white';
      printContainer.style.padding = '20px';

      const titleMatch = this.abcNotation.match(/T:\s*([^\r\n]*)/);
      const title = titleMatch ? titleMatch[1].trim() : 'ABC Sheet Music';
      const titleElement = document.createElement('h1');
      titleElement.style.fontFamily = 'Arial, sans-serif';
      titleElement.style.textAlign = 'center';
      titleElement.style.margin = '0 0 10px 0';
      titleElement.textContent = title;
      printContainer.appendChild(titleElement);

      const composerMatch = this.abcNotation.match(/C:\s*([^\r\n]*)/);
      if (composerMatch) {
        const composer = composerMatch[1].trim();
        const composerElement = document.createElement('h3');
        composerElement.style.fontFamily = 'Arial, sans-serif';
        composerElement.style.textAlign = 'center';
        composerElement.style.margin = '0 0 20px 0';
        composerElement.style.fontWeight = 'normal';
        composerElement.textContent = `Composer: ${composer}`;
        printContainer.appendChild(composerElement);
      }

      const scoreClone = scoreOutput.cloneNode(true);
      printContainer.appendChild(scoreClone);

      const svgs = printContainer.querySelectorAll('svg');
      svgs.forEach(svg => {
        svg.style.maxWidth = '100%';
        svg.style.width = '740px';
        svg.style.margin = '10px 0';
        const staffLines = svg.querySelectorAll('.abcjs-staff');
        staffLines.forEach(line => {
          line.style.stroke = '#000000';
          line.style.strokeWidth = '1px';
        });
        const noteHeads = svg.querySelectorAll('.abcjs-note');
        noteHeads.forEach(note => {
          note.style.stroke = '#000000';
          note.style.fill = '#000000';
        });
        const stems = svg.querySelectorAll('.abcjs-stem');
        stems.forEach(stem => {
          stem.style.stroke = '#000000';
          stem.style.strokeWidth = '1px';
        });
      });

      const footer = document.createElement('div');
      footer.style.marginTop = '20px';
      footer.style.borderTop = '1px solid #ccc';
      footer.style.paddingTop = '10px';
      footer.style.fontSize = '10px';
      footer.style.textAlign = 'center';
      footer.style.color = '#666';
      const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      footer.textContent = `Generated on ${new Date().toLocaleDateString(undefined, dateOptions)} using ABC to MIDI Converter`;
      printContainer.appendChild(footer);

      document.body.appendChild(printContainer);
      window.print();
      setTimeout(() => {
        document.body.removeChild(printContainer);
      }, 100);

      this.debugLog('Initiated sheet music PDF export');
    } catch (error) {
      this.showError('Failed to export sheet music as PDF');
      this.dispatchWixEvent('error', { message: 'PDF export failed', error });
    }
  }

  playMidi() {
    try {
      const abcInput = this.shadowRoot.getElementById('abc-input');
      this.abcNotation = abcInput.value;
      const errorMessage = this.shadowRoot.getElementById('error-message');
      errorMessage.style.display = 'none';

      const validation = this.validateAbcNotation(this.abcNotation);
      if (!validation.valid) {
        this.showError(validation.error);
        this.dispatchWixEvent('error', { message: validation.error });
        return;
      }
      
      // If we already have a synth controller, use it
      if (this.synthControl) {
        this.startPlayback();
      } else {
        // Initialize synth and then play
        this.showStatus('Initializing playback... 🎵');
        this.initializeSynthControl()
          .then(() => {
            this.startPlayback();
          })
          .catch(error => {
            this.showError(`Failed to initialize MIDI player: ${error.message}`);
            this.dispatchWixEvent('error', { message: 'Failed to initialize MIDI player', error });
          });
      }
    } catch (error) {
      this.showError(`Error starting playback: ${error.message}`);
      this.dispatchWixEvent('error', { message: 'Playback error', error });
    }
  }

  startPlayback() {
    try {
      if (!this.synthControl) {
        throw new Error('Synth controller not initialized');
      }
      
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(e => this.debugLog(`Error resuming audio context: ${e}`));
      }
      
      this.showStatus('Starting playback... 🎶');
      
      // Start playback
      this.synthControl.play();
      this.isPlaying = true;
      this.debugLog('MIDI playback started successfully');
      this.dispatchWixEvent('play', {});
    } catch (error) {
      this.handlePlaybackError(error);
    }
  }

  handlePlaybackError(error) {
    let errorMessage = 'Failed to play MIDI. Please check your ABC notation.';
    if (error.message) {
      if (error.message.includes('harmony')) {
        errorMessage = 'Failed to play MIDI: Unsupported harmony elements.';
      } else if (error.message.includes('measure')) {
        errorMessage = 'Failed to play MIDI: Measure duration mismatch.';
      } else if (error.message.includes('voice')) {
        errorMessage = 'Failed to play MIDI: Voice conflicts in notation.';
      } else if (error.message.includes('syntax')) {
        errorMessage = 'Failed to play MIDI: Syntax error in notation.';
      } else {
        errorMessage = `Failed to play MIDI: ${error.message}`;
      }
    }
    this.showError(errorMessage);
    this.dispatchWixEvent('error', { message: errorMessage, error });
    this.cleanupMidiPlayer();
  }

  stopMidi() {
    try {
      if (this.synthControl) {
        if (typeof this.synthControl.pause === 'function') {
          this.synthControl.pause();
        }
        this.debugLog('MIDI playback stopped');
        const progressBar = this.shadowRoot.getElementById('progress-bar');
        if (progressBar) {
          progressBar.style.width = '0%';
        }
        this.isPlaying = false;
      }
      // Don't close the audio context, just suspend it to save resources
      if (this.audioContext && this.audioContext.state === 'running') {
        this.audioContext.suspend().catch(e => this.debugLog(`Error suspending audio context: ${e}`));
      }
    } catch (error) {
      this.debugLog(`Error stopping MIDI: ${error.message}`);
      this.dispatchWixEvent('error', { message: 'Error stopping MIDI', error });
    }
  }

  restartMidi() {
    this.stopMidi();
    this.debugLog('Restarting MIDI playback');
    
    // A slight delay to ensure the playback system has time to reset
    setTimeout(() => {
      if (this.synthControl) {
        try {
          this.synthControl.restart();
          this.isPlaying = true;
          this.debugLog('MIDI playback restarted successfully');
          this.dispatchWixEvent('restart', {});
        } catch (error) {
          this.debugLog(`Error restarting MIDI: ${error.message}`);
          // Fall back to the regular play method if restart fails
          this.playMidi();
        }
      } else {
        this.playMidi();
      }
    }, 100);
  }

  showError(message) {
    const errorMessage = this.shadowRoot.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    this.debugLog(`Error: ${message}`);
  }

  showStatus(message) {
    const statusMessage = this.shadowRoot.getElementById('status-message');
    if (statusMessage) {
      statusMessage.textContent = message;
      statusMessage.style.display = 'block';
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 5000);
    }
    this.debugLog(`Status: ${message}`);
  }

  debugLog(message) {
    const debugInfo = this.shadowRoot.getElementById('debug-info');
    if (debugInfo) {
      const timestamp = new Date().toLocaleTimeString();
      const newLine = document.createElement('div');
      newLine.textContent = `[${timestamp}] ${message}`;
      while (debugInfo.childNodes.length >= 20) {
        debugInfo.removeChild(debugInfo.firstChild);
      }
      debugInfo.appendChild(newLine);
      debugInfo.scrollTop = debugInfo.scrollHeight;
      if (this.getAttribute('debug') === 'true') {
        debugInfo.style.display = 'block';
      }
    }
    if (window.Wix) {
      window.Wix.pushEvent('debugLog', { message });
    }
  }

  dispatchWixEvent(eventName, data) {
    if (window.Wix) {
      window.Wix.pushEvent(eventName, data);
    }
  }

  disconnectedCallback() {
    this.cleanupMidiPlayer();
    if (this.audioContext) {
      this.audioContext.close().catch(e => this.debugLog(`Error closing audio context: ${e}`));
      this.audioContext = null;
    }
  }

  static get observedAttributes() {
    return ['theme', 'debug', 'abc-notation'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'theme' && oldValue !== newValue) {
      this.updateTheme(newValue);
    }
    if (name === 'debug' && newValue === 'true') {
      const debugInfo = this.shadowRoot.getElementById('debug-info');
      if (debugInfo) {
        debugInfo.style.display = 'block';
      }
    }
    if (name === 'abc-notation' && oldValue !== newValue) {
      this.abcNotation = newValue;
      const abcInput = this.shadowRoot.getElementById('abc-input');
      if (abcInput) {
        abcInput.value = newValue;
        this.convertAndRender();
      }
    }
  }

  updateTheme(theme) {
    const root = this.shadowRoot.host;
    switch (theme) {
      case 'dark':
        root.style.setProperty('--bg-primary', '#2d3748');
        root.style.setProperty('--bg-secondary', '#4a5568');
        root.style.setProperty('--shadow-light', '#3a4553');
        root.style.setProperty('--shadow-dark', '#1a202c');
        root.style.setProperty('--text-primary', '#f7fafc');
        root.style.setProperty('--text-secondary', '#e2e8f0');
        root.style.setProperty('--text-muted', '#a0aec0');
        root.style.setProperty('--accent-primary', '#7c3aed');
        root.style.setProperty('--accent-secondary', '#a855f7');
        break;
      case 'light':
      default:
        root.style.setProperty('--bg-primary', '#e6e7ee');
        root.style.setProperty('--bg-secondary', '#ffffff');
        root.style.setProperty('--shadow-light', '#ffffff');
        root.style.setProperty('--shadow-dark', '#a3b1c6');
        root.style.setProperty('--text-primary', '#2d3748');
        root.style.setProperty('--text-secondary', '#4a5568');
        root.style.setProperty('--text-muted', '#718096');
        root.style.setProperty('--accent-primary', '#667eea');
        root.style.setProperty('--accent-secondary', '#764ba2');
        break;
    }
    this.dispatchWixEvent('themeChanged', { theme });
  }
}

customElements.define('abc-to-midi-converter', AbcToMidiConverter);
