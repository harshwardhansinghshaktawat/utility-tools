// File name: advanced-code-editor.js
// Custom element tag: <advanced-code-editor></advanced-code-editor>

class AdvancedCodeEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.editor = null;
    this.currentLanguage = 'javascript';
    this.currentTheme = 'vs-dark';
    this.currentValue = '';
    this.monacoLoaded = false;
    this.totalHeight = 500; // Default height in pixels
  }

  static get observedAttributes() {
    return ['language', 'theme', 'value', 'read-only', 'height', 'width'];
  }

  connectedCallback() {
    this.calculateDimensions();
    this.render();
    this.loadMonacoEditor().then(() => {
      this.initializeEditor();
      this.setupEventListeners();
    }).catch(err => {
      console.error('Failed to load Monaco Editor:', err);
      this.showError();
    });
  }

  disconnectedCallback() {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.editor || !this.monacoLoaded || oldValue === newValue) return;

    switch (name) {
      case 'language':
        window.monaco.editor.setModelLanguage(this.editor.getModel(), newValue);
        this.currentLanguage = newValue;
        this.updateLanguageInfo();
        break;
      case 'theme':
        window.monaco.editor.setTheme(newValue);
        this.currentTheme = newValue;
        this.updateThemeSelect();
        this.updateUITheme();
        break;
      case 'value':
        if (this.editor.getValue() !== newValue) {
          this.editor.setValue(newValue || '');
        }
        this.currentValue = newValue;
        break;
      case 'read-only':
        this.editor.updateOptions({ readOnly: newValue === 'true' });
        break;
      case 'height':
      case 'width':
        this.calculateDimensions();
        this.updateContainerSize();
        break;
    }
  }

  calculateDimensions() {
    // Parse height attribute (supports px, vh, or just numbers)
    const heightAttr = this.getAttribute('height') || '500px';
    if (heightAttr.includes('px')) {
      this.totalHeight = parseInt(heightAttr);
    } else if (heightAttr.includes('vh')) {
      this.totalHeight = (parseInt(heightAttr) / 100) * window.innerHeight;
    } else {
      this.totalHeight = parseInt(heightAttr) || 500;
    }
    
    // Ensure minimum height
    this.totalHeight = Math.max(this.totalHeight, 300);
    
    console.log('Calculated total height:', this.totalHeight);
  }

  render() {
    const width = this.getAttribute('width') || '100%';
    const isDark = this.getAttribute('theme') === 'vs-dark';
    
    // Calculate exact pixel heights
    const toolbarHeight = 56;
    const statusHeight = 32;
    const editorHeight = this.totalHeight - toolbarHeight - statusHeight;
    
    console.log('Render heights - Toolbar:', toolbarHeight, 'Editor:', editorHeight, 'Status:', statusHeight);
    
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :host {
          display: block;
          width: ${width};
          height: ${this.totalHeight}px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace;
          --primary-color: #007acc;
          --success-color: #28a745;
          --danger-color: #dc3545;
          --warning-color: #ffc107;
          --dark-bg: #1e1e1e;
          --dark-surface: #252526;
          --dark-border: #3e3e42;
          --light-bg: #ffffff;
          --light-surface: #f8f9fa;
          --light-border: #e1e5e9;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          background: ${isDark ? 'var(--dark-bg)' : 'var(--light-bg)'};
          border: 1px solid ${isDark ? 'var(--dark-border)' : 'var(--light-border)'};
        }

        .editor-container {
          width: 100%;
          height: ${this.totalHeight}px;
          display: flex;
          flex-direction: column;
          background: ${isDark ? 'var(--dark-bg)' : 'var(--light-bg)'};
        }

        .toolbar {
          width: 100%;
          height: ${toolbarHeight}px;
          background: ${isDark ? 
            'linear-gradient(135deg, #2d2d30 0%, #252526 100%)' : 
            'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'};
          border-bottom: 1px solid ${isDark ? 'var(--dark-border)' : 'var(--light-border)'};
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 16px;
          backdrop-filter: blur(10px);
        }

        .toolbar-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: ${isDark ? 'var(--dark-border)' : 'var(--light-border)'};
          opacity: 0.5;
        }

        .toolbar-right {
          margin-left: auto;
        }

        select {
          height: 36px;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 500;
          border: 1.5px solid ${isDark ? 'var(--dark-border)' : 'var(--light-border)'};
          border-radius: 8px;
          background: ${isDark ? 'var(--dark-surface)' : 'var(--light-surface)'};
          color: ${isDark ? '#cccccc' : '#333333'};
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
        }

        select:hover {
          border-color: var(--primary-color);
          transform: translateY(-1px);
        }

        select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.2);
        }

        .btn {
          height: 36px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary-color) 0%, #005a9e 100%);
          color: #ffffff;
        }

        .btn-success {
          background: linear-gradient(135deg, var(--success-color) 0%, #1e7e34 100%);
          color: #ffffff;
        }

        .btn-danger {
          background: linear-gradient(135deg, var(--danger-color) 0%, #bd2130 100%);
          color: #ffffff;
        }

        .btn-secondary {
          background: ${isDark ? 'var(--dark-surface)' : 'var(--light-surface)'};
          color: ${isDark ? '#cccccc' : '#333333'};
          border: 1.5px solid ${isDark ? 'var(--dark-border)' : 'var(--light-border)'};
        }

        .btn-icon {
          font-size: 16px;
        }

        #monaco-container {
          width: 100%;
          height: ${editorHeight}px;
          position: relative;
          background: ${isDark ? 'var(--dark-bg)' : 'var(--light-bg)'};
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${isDark ? 
            'linear-gradient(135deg, #1e1e1e 0%, #252526 100%)' : 
            'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          z-index: 1000;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid transparent;
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          font-size: 16px;
          font-weight: 500;
          color: ${isDark ? '#cccccc' : '#666666'};
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          color: white;
          text-align: center;
          padding: 40px;
        }

        .error-icon {
          font-size: 48px;
          opacity: 0.8;
        }

        .error-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .error-message {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.5;
        }

        .status-bar {
          width: 100%;
          height: ${statusHeight}px;
          background: ${isDark ? 
            'linear-gradient(135deg, #252526 0%, #2d2d30 100%)' : 
            'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'};
          border-top: 1px solid ${isDark ? 'var(--dark-border)' : 'var(--light-border)'};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          font-size: 12px;
          color: ${isDark ? '#cccccc' : '#666666'};
          font-weight: 500;
        }

        .status-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-icon {
          font-size: 14px;
          opacity: 0.7;
        }

        .hidden {
          display: none !important;
        }

        /* Fullscreen styles */
        :host(.fullscreen) {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          border-radius: 0 !important;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .toolbar {
            padding: 0 12px;
            gap: 8px;
          }
          
          .toolbar-section {
            gap: 6px;
          }
          
          .btn {
            padding: 0 12px;
            font-size: 12px;
          }
          
          select {
            min-width: 100px;
            font-size: 12px;
          }
        }
      </style>
      
      <div class="editor-container">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-section">
            <select id="language-select" title="Programming Language">
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="scss">SCSS</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="yaml">YAML</option>
              <option value="markdown">Markdown</option>
              <option value="sql">SQL</option>
              <option value="php">PHP</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="ruby">Ruby</option>
              <option value="shell">Shell</option>
              <option value="dockerfile">Dockerfile</option>
              <option value="plaintext">Plain Text</option>
            </select>
            
            <select id="theme-select" title="Editor Theme">
              <option value="vs">☀️ Light</option>
              <option value="vs-dark">🌙 Dark</option>
              <option value="hc-black">⚫ High Contrast Dark</option>
              <option value="hc-light">⚪ High Contrast Light</option>
            </select>
          </div>

          <div class="toolbar-divider"></div>

          <div class="toolbar-section">
            <button id="format-btn" class="btn btn-primary" title="Format Code">
              <span class="btn-icon">✨</span>
              Format
            </button>
            <button id="copy-btn" class="btn btn-success" title="Copy to Clipboard">
              <span class="btn-icon">📋</span>
              Copy
            </button>
            <button id="clear-btn" class="btn btn-danger" title="Clear All Code">
              <span class="btn-icon">🗑️</span>
              Clear
            </button>
          </div>

          <div class="toolbar-divider"></div>

          <div class="toolbar-section">
            <button id="undo-btn" class="btn btn-secondary" title="Undo">
              <span class="btn-icon">↶</span>
            </button>
            <button id="redo-btn" class="btn btn-secondary" title="Redo">
              <span class="btn-icon">↷</span>
            </button>
          </div>

          <div class="toolbar-right">
            <button id="fullscreen-btn" class="btn btn-secondary" title="Toggle Fullscreen">
              <span class="btn-icon">⛶</span>
            </button>
          </div>
        </div>
        
        <!-- Monaco Editor Container -->
        <div id="monaco-container">
          <div id="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading Advanced Code Editor...</div>
          </div>
          
          <div id="error" class="error-overlay hidden">
            <div class="error-icon">❌</div>
            <div class="error-title">Failed to Load Editor</div>
            <div class="error-message">
              Unable to load Monaco Editor. Please check your internet connection and try again.
            </div>
            <button id="retry-btn" class="btn btn-secondary">🔄 Retry</button>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
          <div class="status-section">
            <div class="status-item">
              <span class="status-icon">🚀</span>
              <span id="language-info">JavaScript</span>
            </div>
            <div class="status-item">
              <span class="status-icon">📊</span>
              <span id="line-count">1 lines</span>
            </div>
          </div>
          <div class="status-section">
            <div class="status-item">
              <span class="status-icon">📍</span>
              <span id="cursor-position">Ln 1, Col 1</span>
            </div>
            <div class="status-item" id="selection-info"></div>
          </div>
        </div>
      </div>
    `;
  }

  loadMonacoEditor() {
    return new Promise((resolve, reject) => {
      if (window.monaco) {
        this.monacoLoaded = true;
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Monaco Editor loading timeout'));
      }, 15000);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
      script.async = true;

      script.onload = () => {
        window.require.config({
          paths: {
            vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
          }
        });

        window.require(['vs/editor/editor.main'], () => {
          clearTimeout(timeout);
          this.monacoLoaded = true;
          resolve();
        }, (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      };

      script.onerror = (err) => {
        clearTimeout(timeout);
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  initializeEditor() {
    if (!this.monacoLoaded || !window.monaco) return;

    const container = this.shadowRoot.querySelector('#monaco-container');
    const loading = this.shadowRoot.querySelector('#loading');

    console.log('Monaco container dimensions:', container.offsetWidth, 'x', container.offsetHeight);

    try {
      this.editor = window.monaco.editor.create(container, {
        value: this.getAttribute('value') || `// 🚀 Welcome to Advanced Code Editor!
// This is a professional VS Code-quality editor

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);
console.log(\`The 10th Fibonacci number is: \${result}\`);

// Try editing this code and see the magic! ✨
const greeting = "Hello, World!";
console.log(greeting);`,
        language: this.getAttribute('language') || this.currentLanguage,
        theme: this.getAttribute('theme') || this.currentTheme,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 15,
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace",
        lineHeight: 24,
        letterSpacing: 0.5,
        lineNumbers: 'on',
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        readOnly: this.getAttribute('read-only') === 'true',
        tabSize: 4,
        insertSpaces: true,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoIndent: 'full',
        contextmenu: true,
        mouseWheelZoom: true,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        renderWhitespace: 'selection',
        showUnused: true,
        folding: true,
        foldingHighlight: true,
        unfoldOnClickAfterEndOfLine: true,
        colorDecorators: true,
        codeLens: true,
        roundedSelection: true,
        padding: { top: 16, bottom: 16 },
        suggest: {
          showWords: true,
          showSnippets: true,
          showFunctions: true,
          showVariables: true,
          showModules: true,
          showClasses: true,
          showKeywords: true,
          insertMode: 'replace'
        },
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true
        },
        parameterHints: {
          enabled: true
        },
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: 'on'
      });

      this.currentValue = this.editor.getValue();
      this.currentLanguage = this.getAttribute('language') || this.currentLanguage;
      this.currentTheme = this.getAttribute('theme') || this.currentTheme;

      // Set up event listeners
      this.editor.onDidChangeModelContent(() => {
        const newValue = this.editor.getValue();
        this.currentValue = newValue;
        this.updateStatusBar();
        this.dispatchEvent(new CustomEvent('change', {
          detail: { value: newValue, language: this.currentLanguage },
          bubbles: true,
          composed: true
        }));
      });

      this.editor.onDidChangeCursorPosition(() => {
        this.updateStatusBar();
      });

      this.editor.onDidChangeCursorSelection(() => {
        this.updateStatusBar();
      });

      // Hide loading
      loading.classList.add('hidden');
      
      // Force layout
      this.editor.layout();
      this.updateToolbarSelects();
      this.updateStatusBar();
      
      console.log('Monaco editor initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Monaco Editor:', error);
      this.showError();
    }
  }

  updateContainerSize() {
    this.calculateDimensions();
    
    const toolbarHeight = 56;
    const statusHeight = 32;
    const editorHeight = this.totalHeight - toolbarHeight - statusHeight;
    
    // Update container styles
    const container = this.shadowRoot.querySelector('.editor-container');
    const monacoContainer = this.shadowRoot.querySelector('#monaco-container');
    
    if (container) {
      container.style.height = `${this.totalHeight}px`;
    }
    
    if (monacoContainer) {
      monacoContainer.style.height = `${editorHeight}px`;
    }
    
    this.style.height = `${this.totalHeight}px`;
    
    // Force Monaco layout
    if (this.editor) {
      setTimeout(() => this.editor.layout(), 0);
      setTimeout(() => this.editor.layout(), 100);
    }
  }

  setupEventListeners() {
    const languageSelect = this.shadowRoot.querySelector('#language-select');
    const themeSelect = this.shadowRoot.querySelector('#theme-select');
    const formatBtn = this.shadowRoot.querySelector('#format-btn');
    const copyBtn = this.shadowRoot.querySelector('#copy-btn');
    const clearBtn = this.shadowRoot.querySelector('#clear-btn');
    const undoBtn = this.shadowRoot.querySelector('#undo-btn');
    const redoBtn = this.shadowRoot.querySelector('#redo-btn');
    const fullscreenBtn = this.shadowRoot.querySelector('#fullscreen-btn');
    const retryBtn = this.shadowRoot.querySelector('#retry-btn');

    languageSelect?.addEventListener('change', (e) => {
      this.setAttribute('language', e.target.value);
    });

    themeSelect?.addEventListener('change', (e) => {
      this.setAttribute('theme', e.target.value);
    });

    formatBtn?.addEventListener('click', async () => {
      if (this.monacoLoaded && this.editor) {
        await this.editor.getAction('editor.action.formatDocument').run();
      }
    });

    copyBtn?.addEventListener('click', () => {
      this.copyToClipboard();
    });

    clearBtn?.addEventListener('click', () => {
      if (confirm('🗑️ Are you sure you want to clear all code?')) {
        this.setValue('');
      }
    });

    undoBtn?.addEventListener('click', () => {
      if (this.editor) {
        this.editor.trigger('keyboard', 'undo', null);
      }
    });

    redoBtn?.addEventListener('click', () => {
      if (this.editor) {
        this.editor.trigger('keyboard', 'redo', null);
      }
    });

    fullscreenBtn?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    retryBtn?.addEventListener('click', () => {
      this.hideError();
      this.showLoading();
      this.loadMonacoEditor().then(() => {
        this.initializeEditor();
        this.setupEventListeners();
      }).catch(() => {
        this.showError();
      });
    });
  }

  updateToolbarSelects() {
    const languageSelect = this.shadowRoot.querySelector('#language-select');
    const themeSelect = this.shadowRoot.querySelector('#theme-select');
    
    if (languageSelect) languageSelect.value = this.currentLanguage;
    if (themeSelect) themeSelect.value = this.currentTheme;
  }

  updateLanguageInfo() {
    const languageInfo = this.shadowRoot.querySelector('#language-info');
    if (languageInfo) {
      languageInfo.textContent = this.currentLanguage.toUpperCase();
    }
  }

  updateThemeSelect() {
    const themeSelect = this.shadowRoot.querySelector('#theme-select');
    if (themeSelect) themeSelect.value = this.currentTheme;
  }

  updateUITheme() {
    // Re-render to apply theme changes to UI
    this.render();
    if (this.monacoLoaded && this.editor) {
      // Re-initialize editor in new container
      this.initializeEditor();
      this.setupEventListeners();
    }
  }

  updateStatusBar() {
    if (!this.editor) return;

    const languageInfo = this.shadowRoot.querySelector('#language-info');
    const cursorPosition = this.shadowRoot.querySelector('#cursor-position');
    const selectionInfo = this.shadowRoot.querySelector('#selection-info');
    const lineCount = this.shadowRoot.querySelector('#line-count');

    const position = this.editor.getPosition();
    const selection = this.editor.getSelection();
    const model = this.editor.getModel();

    if (languageInfo) {
      languageInfo.textContent = this.currentLanguage.toUpperCase();
    }

    if (cursorPosition && position) {
      cursorPosition.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
    }

    if (selectionInfo && selection) {
      const selectedText = model.getValueInRange(selection);
      if (selectedText) {
        const lines = selectedText.split('\n').length;
        const chars = selectedText.length;
        selectionInfo.innerHTML = `<span class="status-icon">📝</span>${chars} chars, ${lines} lines selected`;
      } else {
        selectionInfo.innerHTML = '';
      }
    }

    if (lineCount && model) {
      const lines = model.getLineCount();
      lineCount.textContent = `${lines} lines`;
    }
  }

  showLoading() {
    const loading = this.shadowRoot.querySelector('#loading');
    const error = this.shadowRoot.querySelector('#error');
    
    if (loading) loading.classList.remove('hidden');
    if (error) error.classList.add('hidden');
  }

  showError() {
    const loading = this.shadowRoot.querySelector('#loading');
    const error = this.shadowRoot.querySelector('#error');
    
    if (loading) loading.classList.add('hidden');
    if (error) error.classList.remove('hidden');
  }

  hideError() {
    const error = this.shadowRoot.querySelector('#error');
    if (error) error.classList.add('hidden');
  }

  copyToClipboard() {
    const value = this.getValue();
    navigator.clipboard.writeText(value).then(() => {
      const copyBtn = this.shadowRoot.querySelector('#copy-btn');
      if (copyBtn) {
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="btn-icon">✅</span>Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = originalContent;
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  toggleFullscreen() {
    if (this.classList.contains('fullscreen')) {
      this.classList.remove('fullscreen');
      this.updateContainerSize();
    } else {
      this.classList.add('fullscreen');
      this.calculateDimensions();
      this.totalHeight = window.innerHeight;
      this.updateContainerSize();
    }
  }

  // Public API Methods
  getValue() {
    return this.editor ? this.editor.getValue() : this.currentValue;
  }

  setValue(value) {
    if (this.editor) {
      this.editor.setValue(value || '');
    }
    this.currentValue = value || '';
    this.setAttribute('value', value || '');
  }

  getLanguage() {
    return this.currentLanguage;
  }

  setLanguage(language) {
    this.setAttribute('language', language);
  }

  getTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    this.setAttribute('theme', theme);
  }

  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  layout() {
    if (this.editor) {
      this.editor.layout();
    }
  }
}

// Register the custom element
customElements.define('advanced-code-editor', AdvancedCodeEditor);

// Export for use in Wix
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedCodeEditor;
}

// Make it globally available
window.AdvancedCodeEditor = AdvancedCodeEditor;
