class AdvancedCodeEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default properties
    this.theme = this.getAttribute('theme') || 'dark';
    this.language = this.getAttribute('language') || 'javascript';
    this.value = this.getAttribute('value') || '// Welcome to Advanced Code Editor\n// Start coding here...\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();';
    this.readOnly = this.hasAttribute('readonly');
    this.showLineNumbers = this.getAttribute('show-line-numbers') !== 'false';
    this.fontSize = parseInt(this.getAttribute('font-size')) || 14;
    this.tabSize = parseInt(this.getAttribute('tab-size')) || 2;
    
    this.editorView = null;
    this.currentFile = 'main.js';
    this.files = {
      'main.js': { content: this.value, language: 'javascript' },
      'styles.css': { content: '/* CSS Styles */\nbody {\n  margin: 0;\n  padding: 0;\n  font-family: Arial, sans-serif;\n}', language: 'css' },
      'index.html': { content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src="main.js"></script>\n</body>\n</html>', language: 'html' },
      'data.json': { content: '{\n  "name": "My Project",\n  "version": "1.0.0",\n  "description": "A sample project"\n}', language: 'json' },
      'script.py': { content: '# Python Script\ndef greet(name):\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))', language: 'python' }
    };
    this.openTabs = ['main.js'];
    this.commandPaletteVisible = false;
    this.commandPaletteSelected = 0;
    this.librariesLoaded = false;
  }

  async loadLibraries() {
    if (this.librariesLoaded) return;

    // Load CodeMirror 6 and dependencies
    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/codemirror.min.js');
    
    // Load language support files
    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/lang-javascript.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/lang-python.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/lang-html.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/lang-css.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/lang-json.min.js'
    ];

    for (const script of scripts) {
      try {
        await this.loadScript(script);
      } catch (e) {
        console.warn('Failed to load script:', script);
      }
    }

    this.librariesLoaded = true;
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async connectedCallback() {
    // Load libraries first
    await this.loadLibraries();
    
    this.render();
    await this.initializeEditor();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 600px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background: #1e1e1e;
          border: 1px solid #3c3c3c;
          border-radius: 8px;
          overflow: hidden;
        }

        .editor-container {
          display: flex;
          height: 100%;
          background: #1e1e1e;
        }

        .sidebar {
          width: 250px;
          background: #252526;
          border-right: 1px solid #3c3c3c;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 12px;
          background: #2d2d30;
          color: #cccccc;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #3c3c3c;
        }

        .file-explorer {
          flex: 1;
          overflow-y: auto;
        }

        .file-item {
          padding: 6px 12px;
          color: #cccccc;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid transparent;
        }

        .file-item:hover {
          background: #2a2d2e;
        }

        .file-item.active {
          background: #37373d;
          color: #ffffff;
        }

        .file-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          background-size: contain;
        }

        .js-icon { 
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f7df1e"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>') no-repeat; 
        }
        .html-icon { 
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e34f26"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>') no-repeat; 
        }
        .css-icon { 
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231572b6"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"/></svg>') no-repeat; 
        }
        .py-icon { 
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233776ab"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22zM21.1 6.11l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08-.33.23z"/></svg>') no-repeat; 
        }

        .main-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
        }

        .tab-bar {
          display: flex;
          background: #2d2d30;
          border-bottom: 1px solid #3c3c3c;
          overflow-x: auto;
        }

        .tab {
          padding: 8px 16px;
          background: #2d2d30;
          color: #969696;
          border: none;
          border-right: 1px solid #3c3c3c;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          white-space: nowrap;
          min-width: 120px;
        }

        .tab.active {
          background: #1e1e1e;
          color: #ffffff;
        }

        .tab:hover:not(.active) {
          background: #37373d;
          color: #cccccc;
        }

        .tab-close {
          margin-left: 8px;
          width: 16px;
          height: 16px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
        }

        .tab-close:hover {
          background: #464647;
          opacity: 1;
        }

        .editor-content {
          flex: 1;
          overflow: hidden;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: ${this.fontSize}px;
        }

        .status-bar {
          height: 22px;
          background: #007acc;
          color: white;
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-size: 12px;
          justify-content: space-between;
        }

        .status-left, .status-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toolbar {
          background: #3c3c3c;
          padding: 8px;
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #464647;
        }

        .toolbar-btn {
          background: #464647;
          border: none;
          color: #cccccc;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .toolbar-btn:hover {
          background: #525252;
        }

        .toolbar-btn.active {
          background: #007acc;
          color: white;
        }

        .language-selector {
          background: #464647;
          border: none;
          color: #cccccc;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
        }

        .command-palette {
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          background: #252526;
          border: 1px solid #464647;
          border-radius: 6px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: none;
        }

        .command-input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 12px 16px;
          color: #cccccc;
          font-size: 14px;
          outline: none;
        }

        .command-results {
          max-height: 300px;
          overflow-y: auto;
        }

        .command-item {
          padding: 8px 16px;
          color: #cccccc;
          cursor: pointer;
          font-size: 13px;
        }

        .command-item:hover {
          background: #2a2d2e;
        }

        .command-item.selected {
          background: #094771;
        }

        /* Fallback editor styles */
        .fallback-editor {
          width: 100%;
          height: 100%;
          background: #1e1e1e;
          color: #d4d4d4;
          border: none;
          outline: none;
          padding: 16px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: ${this.fontSize}px;
          line-height: 1.5;
          resize: none;
          tab-size: ${this.tabSize};
        }

        .fallback-editor:focus {
          outline: none;
        }
      </style>

      <div class="editor-container">
        <div class="sidebar">
          <div class="sidebar-header">Explorer</div>
          <div class="file-explorer" id="fileExplorer">
            ${this.renderFileExplorer()}
          </div>
        </div>

        <div class="main-editor">
          <div class="toolbar">
            <button class="toolbar-btn" id="themeBtn">
              ${this.theme === 'dark' ? '☀️' : '🌙'} Theme
            </button>
            <select class="language-selector" id="languageSelect">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
            <button class="toolbar-btn" id="commandBtn">
              ⌘ Command Palette
            </button>
            <button class="toolbar-btn" id="formatBtn">
              📝 Format
            </button>
            <button class="toolbar-btn" id="saveBtn">
              💾 Save All
            </button>
          </div>

          <div class="tab-bar" id="tabBar">
            ${this.renderTabs()}
          </div>

          <div class="editor-content" id="editorContent">
            <textarea class="fallback-editor" id="fallbackEditor">${this.files[this.currentFile].content}</textarea>
          </div>

          <div class="status-bar">
            <div class="status-left">
              <span id="positionInfo">Line 1, Column 1</span>
              <span id="languageInfo">${this.files[this.currentFile].language.toUpperCase()}</span>
            </div>
            <div class="status-right">
              <span>UTF-8</span>
              <span>LF</span>
              <span>Spaces: ${this.tabSize}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="command-palette" id="commandPalette">
        <input class="command-input" id="commandInput" placeholder="Type a command..." />
        <div class="command-results" id="commandResults">
          ${this.renderCommands()}
        </div>
      </div>
    `;
  }

  renderFileExplorer() {
    return Object.keys(this.files).map(filename => `
      <div class="file-item ${filename === this.currentFile ? 'active' : ''}" data-filename="${filename}">
        <div class="file-icon ${this.getFileIcon(filename)}"></div>
        ${filename}
      </div>
    `).join('');
  }

  renderTabs() {
    return this.openTabs.map(filename => `
      <div class="tab ${filename === this.currentFile ? 'active' : ''}" data-filename="${filename}">
        <div class="file-icon ${this.getFileIcon(filename)}"></div>
        ${filename}
        ${this.openTabs.length > 1 ? `<div class="tab-close" data-close="${filename}">×</div>` : ''}
      </div>
    `).join('');
  }

  renderCommands() {
    const commands = this.getCommands();
    return commands.map((cmd, index) => `
      <div class="command-item ${index === this.commandPaletteSelected ? 'selected' : ''}" data-command="${index}">
        ${cmd.name}
      </div>
    `).join('');
  }

  getFileIcon(filename) {
    const ext = filename.split('.').pop();
    const iconMap = {
      js: 'js-icon',
      html: 'html-icon',
      css: 'css-icon',
      py: 'py-icon',
      json: 'js-icon'
    };
    return iconMap[ext] || 'js-icon';
  }

  async initializeEditor() {
    const editorContent = this.shadowRoot.getElementById('editorContent');
    const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
    
    // Try to initialize CodeMirror if available
    if (window.CodeMirror && window.CodeMirror.EditorView) {
      try {
        await this.initializeCodeMirror();
      } catch (error) {
        console.warn('CodeMirror initialization failed, using fallback editor:', error);
        this.setupFallbackEditor();
      }
    } else {
      console.log('CodeMirror not available, using fallback editor');
      this.setupFallbackEditor();
    }
  }

  async initializeCodeMirror() {
    const { EditorView, EditorState, basicSetup } = window.CodeMirror;
    const editorContent = this.shadowRoot.getElementById('editorContent');
    
    // Clear fallback editor
    editorContent.innerHTML = '';
    
    const file = this.files[this.currentFile];
    const extensions = [basicSetup];
    
    // Add language support if available
    if (this.getLanguageExtension) {
      extensions.push(this.getLanguageExtension(file.language));
    }
    
    const state = EditorState.create({
      doc: file.content,
      extensions
    });

    this.editorView = new EditorView({
      state,
      parent: editorContent
    });
  }

  setupFallbackEditor() {
    const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
    
    fallbackEditor.addEventListener('input', (e) => {
      this.files[this.currentFile].content = e.target.value;
      this.dispatchEvent(new CustomEvent('change', {
        detail: { file: this.currentFile, content: this.files[this.currentFile].content }
      }));
    });

    fallbackEditor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const spaces = ' '.repeat(this.tabSize);
        e.target.value = e.target.value.substring(0, start) + spaces + e.target.value.substring(end);
        e.target.selectionStart = e.target.selectionEnd = start + this.tabSize;
      }
    });
  }

  getLanguageExtension(lang) {
    if (!window.CodeMirror) return null;
    
    const extensions = {
      javascript: window.CodeMirror.javascript?.(),
      python: window.CodeMirror.python?.(),
      html: window.CodeMirror.html?.(),
      css: window.CodeMirror.css?.(),
      json: window.CodeMirror.json?.()
    };
    return extensions[lang] || null;
  }

  setupEventListeners() {
    const shadow = this.shadowRoot;
    
    // File explorer clicks
    shadow.getElementById('fileExplorer').addEventListener('click', (e) => {
      const fileItem = e.target.closest('.file-item');
      if (fileItem) {
        const filename = fileItem.dataset.filename;
        this.openFile(filename);
      }
    });

    // Tab clicks
    shadow.getElementById('tabBar').addEventListener('click', (e) => {
      if (e.target.dataset.close) {
        e.stopPropagation();
        this.closeTab(e.target.dataset.close);
      } else {
        const tab = e.target.closest('.tab');
        if (tab) {
          this.switchFile(tab.dataset.filename);
        }
      }
    });

    // Toolbar buttons
    shadow.getElementById('themeBtn').addEventListener('click', () => this.toggleTheme());
    shadow.getElementById('commandBtn').addEventListener('click', () => this.toggleCommandPalette());
    shadow.getElementById('formatBtn').addEventListener('click', () => this.formatDocument());
    shadow.getElementById('saveBtn').addEventListener('click', () => this.saveAll());
    
    shadow.getElementById('languageSelect').addEventListener('change', (e) => {
      this.files[this.currentFile].language = e.target.value;
      this.updateLanguageInfo();
      if (this.editorView) {
        this.switchFile(this.currentFile);
      }
    });

    // Command palette
    shadow.getElementById('commandResults').addEventListener('click', (e) => {
      const commandItem = e.target.closest('.command-item');
      if (commandItem) {
        const commandIndex = parseInt(commandItem.dataset.command);
        this.getCommands()[commandIndex].action();
        this.hideCommandPalette();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.toggleCommandPalette();
      }
      if (e.key === 'Escape' && this.commandPaletteVisible) {
        this.hideCommandPalette();
      }
    });
  }

  switchFile(filename) {
    if (this.currentFile === filename) return;

    this.currentFile = filename;
    
    if (this.editorView) {
      this.editorView.destroy();
      this.editorView = null;
    }
    
    this.updateUI();
    this.initializeEditor();
  }

  openFile(filename) {
    if (!this.openTabs.includes(filename)) {
      this.openTabs.push(filename);
    }
    this.switchFile(filename);
  }

  closeTab(filename) {
    const index = this.openTabs.indexOf(filename);
    if (index > -1) {
      this.openTabs.splice(index, 1);
      if (this.currentFile === filename && this.openTabs.length > 0) {
        this.switchFile(this.openTabs[Math.max(0, index - 1)]);
      } else if (this.openTabs.length === 0) {
        this.openFile('main.js');
      } else {
        this.updateUI();
      }
    }
  }

  updateUI() {
    const shadow = this.shadowRoot;
    shadow.getElementById('fileExplorer').innerHTML = this.renderFileExplorer();
    shadow.getElementById('tabBar').innerHTML = this.renderTabs();
    this.updateLanguageInfo();
    
    // Update fallback editor content
    const fallbackEditor = shadow.getElementById('fallbackEditor');
    if (fallbackEditor) {
      fallbackEditor.value = this.files[this.currentFile].content;
    }
  }

  updateLanguageInfo() {
    const languageInfo = this.shadowRoot.getElementById('languageInfo');
    const languageSelect = this.shadowRoot.getElementById('languageSelect');
    
    if (languageInfo) {
      languageInfo.textContent = this.files[this.currentFile].language.toUpperCase();
    }
    if (languageSelect) {
      languageSelect.value = this.files[this.currentFile].language;
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.setAttribute('theme', this.theme);
    
    const themeBtn = this.shadowRoot.getElementById('themeBtn');
    themeBtn.textContent = `${this.theme === 'dark' ? '☀️' : '🌙'} Theme`;
    
    if (this.editorView) {
      this.switchFile(this.currentFile);
    }
  }

  toggleCommandPalette() {
    this.commandPaletteVisible = !this.commandPaletteVisible;
    const palette = this.shadowRoot.getElementById('commandPalette');
    palette.style.display = this.commandPaletteVisible ? 'block' : 'none';
    
    if (this.commandPaletteVisible) {
      setTimeout(() => {
        const input = this.shadowRoot.getElementById('commandInput');
        if (input) input.focus();
      }, 100);
    }
  }

  hideCommandPalette() {
    this.commandPaletteVisible = false;
    const palette = this.shadowRoot.getElementById('commandPalette');
    palette.style.display = 'none';
  }

  getCommands() {
    return [
      { name: 'Toggle Theme', action: () => this.toggleTheme() },
      { name: 'New File', action: () => this.createNewFile() },
      { name: 'Save All', action: () => this.saveAll() },
      { name: 'Format Document', action: () => this.formatDocument() },
      { name: 'Toggle Word Wrap', action: () => this.toggleWordWrap() },
      { name: 'Find and Replace', action: () => this.openFindReplace() }
    ];
  }

  createNewFile() {
    const filename = prompt('Enter filename:');
    if (filename && !this.files[filename]) {
      this.files[filename] = { content: '', language: 'javascript' };
      this.openFile(filename);
    }
  }

  saveAll() {
    alert('All files saved!');
    this.dispatchEvent(new CustomEvent('save', { detail: this.files }));
  }

  formatDocument() {
    const currentContent = this.files[this.currentFile].content;
    // Basic formatting
    let formatted = currentContent;
    
    if (this.files[this.currentFile].language === 'javascript') {
      formatted = this.formatJavaScript(currentContent);
    } else if (this.files[this.currentFile].language === 'html') {
      formatted = this.formatHTML(currentContent);
    }
    
    this.files[this.currentFile].content = formatted;
    this.updateUI();
  }

  formatJavaScript(code) {
    // Basic JavaScript formatting
    return code
      .replace(/;(?!\s*\n)/g, ';\n')
      .replace(/{(?!\s*\n)/g, '{\n')
      .replace(/}(?!\s*\n)/g, '\n}')
      .replace(/,(?!\s*\n)/g, ',\n');
  }

  formatHTML(code) {
    // Basic HTML formatting
    return code
      .replace(/></g, '>\n<')
      .replace(/^\s+|\s+$/gm, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');
  }

  toggleWordWrap() {
    // Toggle word wrap functionality
    alert('Word wrap toggled!');
  }

  openFindReplace() {
    // Open find and replace
    alert('Find and replace opened!');
  }

  // Public API methods
  getValue() {
    return this.files[this.currentFile].content;
  }

  setValue(value) {
    this.files[this.currentFile].content = value;
    this.updateUI();
  }

  getCurrentLanguage() {
    return this.files[this.currentFile].language;
  }

  setLanguage(language) {
    this.files[this.currentFile].language = language;
    this.updateLanguageInfo();
  }

  getAllFiles() {
    return this.files;
  }

  addFile(filename, content = '', language = 'javascript') {
    this.files[filename] = { content, language };
    this.updateUI();
  }

  removeFile(filename) {
    if (this.files[filename]) {
      delete this.files[filename];
      this.closeTab(filename);
    }
  }
}

// Register the custom element
customElements.define('advanced-code-editor', AdvancedCodeEditor);
