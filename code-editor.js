class CodeEditor extends HTMLElement {
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
    return ['language', 'theme', 'value', 'read-only', 'height'];
  }

  connectedCallback() {
    this.render();
    this.loadMonacoEditor().then(() => {
      this.initializeEditor();
      this.setupEventListeners();
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.editor || !this.monacoLoaded) return;

    switch (name) {
      case 'language':
        window.monaco.editor.setModelLanguage(this.editor.getModel(), newValue);
        this.currentLanguage = newValue;
        break;
      case 'theme':
        window.monaco.editor.setTheme(newValue);
        this.currentTheme = newValue;
        break;
      case 'value':
        this.editor.setValue(newValue);
        this.currentValue = newValue;
        break;
      case 'read-only':
        this.editor.updateOptions({ readOnly: newValue === 'true' });
        break;
      case 'height':
        const container = this.shadowRoot.querySelector('#editor-container');
        container.style.height = newValue || '400px';
        if (this.editor) {
          this.editor.layout();
        }
        break;
    }
  }

  render() {
    const height = this.getAttribute('height') || '400px';
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 400px;
        }
        .editor-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: ${height};
        }
        .toolbar {
          display: flex;
          gap: 10px;
          padding: 5px;
          background: #f5f5f5;
          border-bottom: 1px solid #ccc;
        }
        #editor-container {
          flex: 1;
          width: 100%;
          height: ${height};
          min-height: 300px;
          border: 1px solid #ccc;
        }
        select, button {
          padding: 5px;
          font-size: 14px;
        }
      </style>
      <div class="editor-wrapper">
        <div class="toolbar">
          <select id="language-select">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
          </select>
          <select id="theme-select">
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            <option value="hc-black">High Contrast</option>
          </select>
          <button id="format-btn">Format Code</button>
          <button id="copy-btn">Copy Code</button>
        </div>
        <div id="editor-container"></div>
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
          this.monacoLoaded = true;
          resolve();
        }, (err) => {
          console.error('Failed to load Monaco Editor:', err);
          reject(err);
        });
      };

      script.onerror = (err) => {
        console.error('Failed to load Monaco loader:', err);
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  initializeEditor() {
    if (!this.monacoLoaded || !window.monaco) return;

    const container = this.shadowRoot.querySelector('#editor-container');

    this.editor = window.monaco.editor.create(container, {
      value: this.getAttribute('value') || '// Start coding here...',
      language: this.getAttribute('language') || this.currentLanguage,
      theme: this.getAttribute('theme') || this.currentTheme,
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      readOnly: this.getAttribute('read-only') === 'true',
      tabSize: 2,
      insertSpaces: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      suggest: {
        showWords: true,
        showSnippets: true,
      },
    });

    this.currentValue = this.editor.getValue();
    this.currentLanguage = this.getAttribute('language') || this.currentLanguage;
    this.currentTheme = this.getAttribute('theme') || this.currentTheme;

    this.editor.onDidChangeModelContent(() => {
      const newValue = this.editor.getValue();
      this.currentValue = newValue;
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: newValue },
        bubbles: true,
        composed: true
      }));
    });

    // Force layout after initialization
    this.editor.layout();
  }

  setupEventListeners() {
    const languageSelect = this.shadowRoot.querySelector('#language-select');
    const themeSelect = this.shadowRoot.querySelector('#theme-select');
    const formatBtn = this.shadowRoot.querySelector('#format-btn');
    const copyBtn = this.shadowRoot.querySelector('#copy-btn');

    languageSelect.addEventListener('change', (e) => {
      this.setAttribute('language', e.target.value);
    });

    themeSelect.addEventListener('change', (e) => {
      this.setAttribute('theme', e.target.value);
    });

    formatBtn.addEventListener('click', async () => {
      if (this.monacoLoaded) {
        await this.editor.getAction('editor.action.formatDocument').run();
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.editor.getValue());
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy Code'), 1000);
    });
  }

  getValue() {
    return this.editor ? this.editor.getValue() : this.currentValue;
  }

  setValue(value) {
    if (this.editor) {
      this.editor.setValue(value);
    }
    this.currentValue = value;
  }

  disconnectedCallback() {
    if (this.editor) {
      this.editor.dispose();
    }
  }
}

customElements.define('code-editor', CodeEditor);
