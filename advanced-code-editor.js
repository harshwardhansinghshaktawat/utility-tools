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
    this.resizeObserver = null;
  }

  static get observedAttributes() {
    return ['language', 'theme', 'value', 'read-only', 'height', 'width'];
  }

  connectedCallback() {
    this.render();
    this.loadMonacoEditor().then(() => {
      this.initializeEditor();
      this.setupEventListeners();
      this.setupResizeObserver();
    }).catch(err => {
      console.error('Failed to load Monaco Editor:', err);
      this.showError();
    });
  }

  disconnectedCallback() {
    if (this.editor) {
      this.editor.dispose();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
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
          min-height: 300px;
          font-family: 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          overflow: hidden;
          background: #ffffff;
        }

        .editor-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: linear-gradient(to bottom, #fafbfc, #eff3f6);
          border-bottom: 1px solid #e1e4e8;
          font-size: 12px;
          flex-shrink: 0;
          min-height: 40px;
          box-sizing: border-box;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toolbar-separator {
          width: 1px;
          height: 20px;
          background: #e1e4e8;
        }

        select {
          padding: 4px 8px;
          font-size: 11px;
          border: 1px solid #d1d5da;
          border-radius: 3px;
          background: #ffffff;
          color: #24292e;
          outline: none;
          cursor: pointer;
          min-width: 80px;
        }

        select:focus {
          border-color: #0366d6;
          box-shadow: 0 0 0 2px rgba(3, 102, 214, 0.3);
        }

        button {
          padding: 4px 12px;
          font-size: 11px;
          border: 1px solid transparent;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          font-weight: 500;
        }

        .btn-primary {
          background: #0366d6;
          color: #ffffff;
          border-color: #0366d6;
        }

        .btn-primary:hover {
          background: #0256cc;
          border-color: #0256cc;
        }

        .btn-secondary {
          background: #f6f8fa;
          color: #24292e;
          border-color: #d1d5da;
        }

        .btn-secondary:hover {
          background: #e1e4e8;
          border-color: #c6cbd1;
        }

        .btn-success {
          background: #28a745;
          color: #ffffff;
          border-color: #28a745;
        }

        .btn-success:hover {
          background: #218838;
          border-color: #1e7e34;
        }

        .btn-danger {
          background: #d73a49;
          color: #ffffff;
          border-color: #d73a49;
        }

        .btn-danger:hover {
          background: #cb2431;
          border-color: #b52d3a;
        }

        .toolbar-right {
          margin-left: auto;
        }

        #editor-container {
          flex: 1;
          width: 100%;
          min-height: 250px;
          position: relative;
          background: #ffffff;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #1e1e1e;
          color: #ffffff;
          gap: 12px;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #ffffff33;
          border-top: 2px solid #ffffff;
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
          background: #ffeaea;
          color: #d73a49;
          padding: 20px;
          text-align: center;
          gap: 12px;
        }

        .error button {
          background: #d73a49;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 12px;
          background: #f6f8fa;
          border-top: 1px solid #e1e4e8;
          font-size: 11px;
          color: #586069;
          min-height: 24px;
          flex-shrink: 0;
        }

        .status-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hidden {
          display: none !important;
        }

        /* Dark theme adjustments */
        :host([theme="vs-dark"]) .toolbar {
          background: linear-gradient(to bottom, #2d2d30, #252526);
          border-bottom-color: #3e3e42;
        }

        :host([theme="vs-dark"]) select {
          background: #3c3c3c;
          color: #cccccc;
          border-color: #5a5a5a;
        }

        :host([theme="vs-dark"]) .status-bar {
          background: #252526;
          border-top-color: #3e3e42;
          color: #cccccc;
        }

        :host([theme="vs-dark"]) {
          background: #1e1e1e;
          border-color: #3e3e42;
        }
      </style>
      
      <div class="editor-wrapper">
        <div class="toolbar">
          <div class="toolbar-group">
            <select id="language-select" title="Select Language">
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
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
              <option value="kotlin">Kotlin</option>
              <option value="swift">Swift</option>
              <option value="ruby">Ruby</option>
              <option value="shell">Shell</option>
              <option value="dockerfile">Dockerfile</option>
              <option value="plaintext">Plain Text</option>
            </select>
            
            <select id="theme-select" title="Select Theme">
              <option value="vs">Light</option>
              <option value="vs-dark">Dark</option>
              <option value="hc-black">High Contrast Dark</option>
              <option value="hc-light">High Contrast Light</option>
            </select>
          </div>

          <div class="toolbar-separator"></div>

          <div class="toolbar-group">
            <button id="format-btn" class="btn-primary" title="Format Code (Shift+Alt+F)">
              Format
            </button>
            <button id="copy-btn" class="btn-success" title="Copy to Clipboard">
              Copy
            </button>
            <button id="clear-btn" class="btn-danger" title="Clear All">
              Clear
            </button>
          </div>

          <div class="toolbar-separator"></div>

          <div class="toolbar-group">
            <button id="undo-btn" class="btn-secondary" title="Undo (Ctrl+Z)">
              ↶ Undo
            </button>
            <button id="redo-btn" class="btn-secondary" title="Redo (Ctrl+Y)">
              ↷ Redo
            </button>
          </div>

          <div class="toolbar-right">
            <button id="fullscreen-btn" class="btn-secondary" title="Toggle Fullscreen">
              ⛶ Fullscreen
            </button>
          </div>
        </div>
        
        <div id="editor-container">
          <div id="loading" class="loading">
            <div class="loading-spinner"></div>
            <div>Loading Monaco Editor...</div>
          </div>
          <div id="error" class="error hidden">
            <div>❌ Failed to load Monaco Editor</div>
            <div>Please check your internet connection and try again.</div>
            <button id="retry-btn">Retry</button>
          </div>
        </div>

        <div class="status-bar">
          <div class="status-left">
            <span id="language-info">JavaScript</span>
            <span id="encoding-info">UTF-8</span>
          </div>
          <div class="status-right">
            <span id="cursor-position">Ln 1, Col 1</span>
            <span id="selection-info"></span>
            <span id="line-count">1 lines</span>
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

      // Set a timeout for loading
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
          console.error('Failed to load Monaco Editor:', err);
          reject(err);
        });
      };

      script.onerror = (err) => {
        clearTimeout(timeout);
        console.error('Failed to load Monaco loader:', err);
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  initializeEditor() {
    if (!this.monacoLoaded || !window.monaco) return;

    const container = this.shadowRoot.querySelector('#editor-container');
    const loading = this.shadowRoot.querySelector('#loading');

    try {
      this.editor = window.monaco.editor.create(container, {
        value: this.getAttribute('value') || '// Welcome to Advanced Code Editor!\n// Start coding here...\n\nfunction helloWorld() {\n    console.log("Hello, World!");\n    return "Monaco Editor is ready!";\n}\n\nhelloWorld();',
        language: this.getAttribute('language') || this.currentLanguage,
        theme: this.getAttribute('theme') || this.currentTheme,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
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
        renderWhitespace: 'selection',
        showUnused: true,
        folding: true,
        foldingHighlight: true,
        unfoldOnClickAfterEndOfLine: true,
        colorDecorators: true,
        codeLens: true,
        lightbulb: {
          enabled: true
        },
        suggest: {
          showWords: true,
          showSnippets: true,
          showFunctions: true,
          showVariables: true,
          showModules: true,
          showClasses: true,
          showKeywords: true
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
        acceptSuggestionOnEnter: 'on',
        accessibilitySupport: 'auto'
      });

      this.currentValue = this.editor.getValue();
      this.currentLanguage = this.getAttribute('language') || this.currentLanguage;
      this.currentTheme = this.getAttribute('theme') || this.currentTheme;

      // Set up event listeners for editor
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

      this.editor.onDidFocusEditorText(() => {
        this.dispatchEvent(new CustomEvent('focus', {
          bubbles: true,
          composed: true
        }));
      });

      this.editor.onDidBlurEditorText(() => {
        this.dispatchEvent(new CustomEvent('blur', {
          bubbles: true,
          composed: true
        }));
      });

      // Hide loading and show editor
      loading.classList.add('hidden');
      
      // Force layout and update UI
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
      if (confirm('Are you sure you want to clear all code?')) {
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
      }).catch(() => {
        this.showError();
      });
    });
  }

  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.editor) {
          this.editor.layout();
        }
      });
      this.resizeObserver.observe(this);
    }
  }

  updateDimensions() {
    const height = this.getAttribute('height') || '500px';
    const width = this.getAttribute('width') || '100%';
    
    this.style.height = height;
    this.style.width = width;
    
    if (this.editor) {
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
    this.setAttribute('theme', this.currentTheme);
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
        selectionInfo.textContent = `(${chars} chars, ${lines} lines selected)`;
      } else {
        selectionInfo.textContent = '';
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
    if (this.classList.contains('fullscreen-mode')) {
      this.classList.remove('fullscreen-mode');
      this.style.position = '';
      this.style.top = '';
      this.style.left = '';
      this.style.width = this.getAttribute('width') || '100%';
      this.style.height = this.getAttribute('height') || '500px';
      this.style.zIndex = '';
      this.style.background = '';
    } else {
      this.classList.add('fullscreen-mode');
      this.style.position = 'fixed';
      this.style.top = '0';
      this.style.left = '0';
      this.style.width = '100vw';
      this.style.height = '100vh';
      this.style.zIndex = '9999';
      this.style.background = this.currentTheme === 'vs-dark' ? '#1e1e1e' : '#ffffff';
    }
    
    setTimeout(() => {
      if (this.editor) {
        this.editor.layout();
      }
    }, 100);
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

  insertText(text, position) {
    if (this.editor) {
      const pos = position || this.editor.getPosition();
      this.editor.executeEdits('insertText', [{
        range: new window.monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
        text: text
      }]);
    }
  }

  getSelectedText() {
    if (this.editor) {
      const selection = this.editor.getSelection();
      return this.editor.getModel().getValueInRange(selection);
    }
    return '';
  }

  replaceSelection(text) {
    if (this.editor) {
      const selection = this.editor.getSelection();
      this.editor.executeEdits('replaceSelection', [{
        range: selection,
        text: text
      }]);
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
