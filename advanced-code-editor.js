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
  }

  static get observedAttributes() {
    return ['language', 'theme', 'value', 'read-only', 'height', 'width'];
  }

  connectedCallback() {
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
        this.updateLanguageSelect();
        break;
      case 'theme':
        window.monaco.editor.setTheme(newValue);
        this.currentTheme = newValue;
        this.updateThemeSelect();
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
        this.updateDimensions();
        break;
    }
  }

  render() {
    const height = this.getAttribute('height') || '500px';
    const width = this.getAttribute('width') || '100%';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${width};
          height: ${height};
          min-height: 400px;
          font-family: 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
          border: 1px solid #ccc;
          border-radius: 4px;
          overflow: hidden;
          background: #fff;
        }

        .editor-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
          flex-shrink: 0;
          height: 40px;
          box-sizing: border-box;
        }

        .toolbar select {
          padding: 4px 8px;
          font-size: 13px;
          border: 1px solid #ccc;
          border-radius: 3px;
          background: #fff;
          min-width: 100px;
        }

        .toolbar button {
          padding: 4px 12px;
          font-size: 13px;
          border: 1px solid #007acc;
          border-radius: 3px;
          background: #007acc;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }

        .toolbar button:hover {
          background: #005a9e;
        }

        .toolbar button.secondary {
          background: #6c757d;
          border-color: #6c757d;
        }

        .toolbar button.secondary:hover {
          background: #545b62;
        }

        .toolbar button.success {
          background: #28a745;
          border-color: #28a745;
        }

        .toolbar button.success:hover {
          background: #218838;
        }

        .toolbar button.danger {
          background: #dc3545;
          border-color: #dc3545;
        }

        .toolbar button.danger:hover {
          background: #c82333;
        }

        .editor-container {
          flex: 1;
          width: 100%;
          height: calc(100% - 40px);
          position: relative;
          /* IMPORTANT: No additional styling that could interfere with Monaco */
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #1e1e1e;
          color: #fff;
          gap: 15px;
        }

        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #ffffff33;
          border-top: 3px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f8d7da;
          color: #721c24;
          padding: 20px;
          text-align: center;
        }

        .error button {
          margin-top: 10px;
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 12px;
          background: #f8f9fa;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          flex-shrink: 0;
          height: 24px;
          box-sizing: border-box;
        }

        .hidden {
          display: none !important;
        }

        /* Fullscreen mode */
        :host(.fullscreen) {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          border-radius: 0 !important;
        }
      </style>
      
      <div class="editor-wrapper">
        <div class="toolbar">
          <select id="language-select">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="xml">XML</option>
            <option value="markdown">Markdown</option>
            <option value="sql">SQL</option>
            <option value="php">PHP</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="plaintext">Plain Text</option>
          </select>
          
          <select id="theme-select">
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            <option value="hc-black">High Contrast</option>
          </select>
          
          <button id="format-btn">Format</button>
          <button id="copy-btn" class="success">Copy</button>
          <button id="clear-btn" class="danger">Clear</button>
          <button id="fullscreen-btn" class="secondary">Fullscreen</button>
        </div>
        
        <div class="editor-container">
          <div id="loading" class="loading">
            <div class="loading-spinner"></div>
            <div>Loading Monaco Editor...</div>
          </div>
          
          <div id="error" class="error hidden">
            <div>Failed to load Monaco Editor</div>
            <div>Please check your internet connection.</div>
            <button id="retry-btn">Retry</button>
          </div>
          
          <div id="monaco-editor" class="hidden"></div>
        </div>

        <div class="status-bar">
          <div>
            <span id="language-info">JavaScript</span> • 
            <span id="line-count">1 lines</span>
          </div>
          <div>
            <span id="cursor-position">Ln 1, Col 1</span>
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
      }, 10000);

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

    const container = this.shadowRoot.querySelector('#monaco-editor');
    const loading = this.shadowRoot.querySelector('#loading');

    try {
      // Create Monaco editor with minimal, safe configuration
      this.editor = window.monaco.editor.create(container, {
        value: this.getAttribute('value') || '// Welcome to Monaco Editor!\nconsole.log("Hello, World!");',
        language: this.getAttribute('language') || this.currentLanguage,
        theme: this.getAttribute('theme') || this.currentTheme,
        automaticLayout: true,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: "'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        readOnly: this.getAttribute('read-only') === 'true',
        tabSize: 4,
        insertSpaces: true,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        suggest: {
          showWords: true,
          showSnippets: true,
        },
        quickSuggestions: true,
        contextmenu: true,
        mouseWheelZoom: false, // Disable to prevent browser hanging
        smoothScrolling: false, // Disable to prevent performance issues
      });

      this.currentValue = this.editor.getValue();
      this.currentLanguage = this.getAttribute('language') || this.currentLanguage;
      this.currentTheme = this.getAttribute('theme') || this.currentTheme;

      // Set up essential event listeners only
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

      // Show editor and hide loading
      loading.classList.add('hidden');
      container.classList.remove('hidden');
      
      // Force layout after a short delay
      setTimeout(() => {
        this.editor.layout();
        this.updateToolbarSelects();
        this.updateStatusBar();
      }, 100);

    } catch (error) {
      console.error('Failed to initialize Monaco Editor:', error);
      this.showError();
    }
  }

  setupEventListeners() {
    const languageSelect = this.shadowRoot.querySelector('#language-select');
    const themeSelect = this.shadowRoot.querySelector('#theme-select');
    const formatBtn = this.shadowRoot.querySelector('#format-btn');
    const copyBtn = this.shadowRoot.querySelector('#copy-btn');
    const clearBtn = this.shadowRoot.querySelector('#clear-btn');
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
        try {
          await this.editor.getAction('editor.action.formatDocument').run();
        } catch (e) {
          console.warn('Format failed:', e);
        }
      }
    });

    copyBtn?.addEventListener('click', () => {
      this.copyToClipboard();
    });

    clearBtn?.addEventListener('click', () => {
      if (confirm('Clear all code?')) {
        this.setValue('');
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

  updateDimensions() {
    const height = this.getAttribute('height') || '500px';
    const width = this.getAttribute('width') || '100%';
    
    this.style.height = height;
    this.style.width = width;
    
    if (this.editor) {
      // Simple layout call without excessive retries
      setTimeout(() => this.editor.layout(), 100);
    }
  }

  updateToolbarSelects() {
    const languageSelect = this.shadowRoot.querySelector('#language-select');
    const themeSelect = this.shadowRoot.querySelector('#theme-select');
    
    if (languageSelect) languageSelect.value = this.currentLanguage;
    if (themeSelect) themeSelect.value = this.currentTheme;
  }

  updateLanguageSelect() {
    const languageSelect = this.shadowRoot.querySelector('#language-select');
    if (languageSelect) languageSelect.value = this.currentLanguage;
    this.updateStatusBar();
  }

  updateThemeSelect() {
    const themeSelect = this.shadowRoot.querySelector('#theme-select');
    if (themeSelect) themeSelect.value = this.currentTheme;
  }

  updateStatusBar() {
    if (!this.editor) return;

    const languageInfo = this.shadowRoot.querySelector('#language-info');
    const cursorPosition = this.shadowRoot.querySelector('#cursor-position');
    const lineCount = this.shadowRoot.querySelector('#line-count');

    const position = this.editor.getPosition();
    const model = this.editor.getModel();

    if (languageInfo) {
      languageInfo.textContent = this.currentLanguage.toUpperCase();
    }

    if (cursorPosition && position) {
      cursorPosition.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
    }

    if (lineCount && model) {
      const lines = model.getLineCount();
      lineCount.textContent = `${lines} lines`;
    }
  }

  showLoading() {
    const loading = this.shadowRoot.querySelector('#loading');
    const error = this.shadowRoot.querySelector('#error');
    const editor = this.shadowRoot.querySelector('#monaco-editor');
    
    if (loading) loading.classList.remove('hidden');
    if (error) error.classList.add('hidden');
    if (editor) editor.classList.add('hidden');
  }

  showError() {
    const loading = this.shadowRoot.querySelector('#loading');
    const error = this.shadowRoot.querySelector('#error');
    const editor = this.shadowRoot.querySelector('#monaco-editor');
    
    if (loading) loading.classList.add('hidden');
    if (error) error.classList.remove('hidden');
    if (editor) editor.classList.add('hidden');
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
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 1500);
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  toggleFullscreen() {
    if (this.classList.contains('fullscreen')) {
      this.classList.remove('fullscreen');
      this.updateDimensions();
    } else {
      this.classList.add('fullscreen');
      setTimeout(() => {
        if (this.editor) {
          this.editor.layout();
        }
      }, 100);
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
