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
    
    this.aceEditor = null;
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
    this.editorInitialized = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.loadAceEditor();
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
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }

        .js-icon { background: #f7df1e; color: #000; }
        .html-icon { background: #e34f26; color: #fff; }
        .css-icon { background: #1572b6; color: #fff; }
        .py-icon { background: #3776ab; color: #fff; }
        .json-icon { background: #f7df1e; color: #000; }

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
          font-size: 14px;
          line-height: 1;
        }

        .tab-close:hover {
          background: #464647;
          opacity: 1;
        }

        .editor-content {
          flex: 1;
          position: relative;
          overflow: hidden;
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
          flex-wrap: wrap;
        }

        .toolbar-btn {
          background: #464647;
          border: none;
          color: #cccccc;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
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
          cursor: pointer;
        }

        .command-palette {
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          max-width: 90%;
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
          box-sizing: border-box;
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

        /* Fallback editor styles - always visible initially */
        .fallback-editor {
          width: 100%;
          height: 100%;
          background: #1e1e1e;
          color: #d4d4d4;
          border: none;
          outline: none;
          padding: 16px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
          font-size: ${this.fontSize}px;
          line-height: 1.5;
          resize: none;
          tab-size: ${this.tabSize};
          box-sizing: border-box;
        }

        .fallback-editor:focus {
          outline: 1px solid #007acc;
        }

        /* ACE Editor container */
        .ace-editor {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
        }

        .editor-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #cccccc;
          font-size: 14px;
        }

        .hide-fallback {
          display: none;
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
              <option value="xml">XML</option>
              <option value="sql">SQL</option>
            </select>
            <button class="toolbar-btn" id="commandBtn">
              ⌘ Command
            </button>
            <button class="toolbar-btn" id="formatBtn">
              📝 Format
            </button>
            <button class="toolbar-btn" id="saveBtn">
              💾 Save
            </button>
            <button class="toolbar-btn" id="newFileBtn">
              📄 New File
            </button>
          </div>

          <div class="tab-bar" id="tabBar">
            ${this.renderTabs()}
          </div>

          <div class="editor-content" id="editorContent">
            <textarea class="fallback-editor" id="fallbackEditor" placeholder="Loading editor...">${this.files[this.currentFile].content}</textarea>
            <div class="ace-editor" id="aceEditor" style="display: none;"></div>
          </div>

          <div class="status-bar">
            <div class="status-left">
              <span id="positionInfo">Line 1, Column 1</span>
              <span id="languageInfo">${this.files[this.currentFile].language.toUpperCase()}</span>
            </div>
            <div class="status-right">
              <span>UTF-8</span>
              <span>Spaces: ${this.tabSize}</span>
              <span id="editorType">Fallback</span>
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
        <div class="file-icon ${this.getFileIcon(filename)}">${this.getFileIconText(filename)}</div>
        ${filename}
      </div>
    `).join('');
  }

  renderTabs() {
    return this.openTabs.map(filename => `
      <div class="tab ${filename === this.currentFile ? 'active' : ''}" data-filename="${filename}">
        <div class="file-icon ${this.getFileIcon(filename)}">${this.getFileIconText(filename)}</div>
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
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      js: 'js-icon',
      html: 'html-icon',
      css: 'css-icon',
      py: 'py-icon',
      json: 'json-icon',
      xml: 'html-icon',
      sql: 'json-icon'
    };
    return iconMap[ext] || 'js-icon';
  }

  getFileIconText(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const textMap = {
      js: 'JS',
      html: 'H',
      css: 'C',
      py: 'Py',
      json: 'J',
      xml: 'X',
      sql: 'S'
    };
    return textMap[ext] || 'F';
  }

  async loadAceEditor() {
    try {
      // Load ACE Editor
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.4/ace.js');
      
      // Load additional modes and themes
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.4/mode-javascript.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.4/mode-python.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.4/mode-html.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.4/mode-css.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.4/mode-json.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.4/theme-monokai.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.4/theme-github.min.js');

      if (window.ace) {
        this.initializeAceEditor();
      }
    } catch (error) {
      console.log('ACE Editor not available, using fallback editor');
      this.updateStatusBar('Fallback');
    }
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
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        console.warn('Failed to load:', src);
        resolve(); // Don't reject, just continue
      };
      document.head.appendChild(script);
    });
  }

  initializeAceEditor() {
    const aceContainer = this.shadowRoot.getElementById('aceEditor');
    const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
    
    try {
      this.aceEditor = window.ace.edit(aceContainer);
      
      // Configure ACE Editor
      this.aceEditor.setTheme(this.theme === 'dark' ? 'ace/theme/monokai' : 'ace/theme/github');
      this.aceEditor.session.setMode(this.getAceMode(this.files[this.currentFile].language));
      this.aceEditor.setValue(this.files[this.currentFile].content, -1);
      this.aceEditor.setFontSize(this.fontSize);
      this.aceEditor.setShowPrintMargin(false);
      this.aceEditor.setDisplayIndentGuides(true);
      this.aceEditor.session.setTabSize(this.tabSize);
      this.aceEditor.session.setUseSoftTabs(true);
      
      // Set up change listener
      this.aceEditor.session.on('change', () => {
        this.files[this.currentFile].content = this.aceEditor.getValue();
        this.dispatchEvent(new CustomEvent('change', {
          detail: { file: this.currentFile, content: this.files[this.currentFile].content }
        }));
      });

      // Set up cursor position tracking
      this.aceEditor.session.selection.on('changeCursor', () => {
        const pos = this.aceEditor.getCursorPosition();
        this.updatePositionInfo(pos.row + 1, pos.column + 1);
      });

      // Hide fallback editor and show ACE
      fallbackEditor.style.display = 'none';
      aceContainer.style.display = 'block';
      
      this.editorInitialized = true;
      this.updateStatusBar('ACE Editor');
      
    } catch (error) {
      console.error('Failed to initialize ACE Editor:', error);
      this.updateStatusBar('Fallback');
    }
  }

  getAceMode(language) {
    const modes = {
      javascript: 'ace/mode/javascript',
      python: 'ace/mode/python',
      html: 'ace/mode/html',
      css: 'ace/mode/css',
      json: 'ace/mode/json',
      xml: 'ace/mode/xml',
      sql: 'ace/mode/sql'
    };
    return modes[language] || 'ace/mode/text';
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
    shadow.getElementById('newFileBtn').addEventListener('click', () => this.createNewFile());
    
    shadow.getElementById('languageSelect').addEventListener('change', (e) => {
      this.files[this.currentFile].language = e.target.value;
      this.updateLanguageInfo();
      this.switchFile(this.currentFile);
    });

    // Fallback editor setup
    const fallbackEditor = shadow.getElementById('fallbackEditor');
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
    this.updateUI();
    
    if (this.aceEditor) {
      this.aceEditor.session.setMode(this.getAceMode(this.files[this.currentFile].language));
      this.aceEditor.setValue(this.files[this.currentFile].content, -1);
    } else {
      const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
      fallbackEditor.value = this.files[this.currentFile].content;
    }
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

  updatePositionInfo(line, column) {
    const positionInfo = this.shadowRoot.getElementById('positionInfo');
    if (positionInfo) {
      positionInfo.textContent = `Line ${line}, Column ${column}`;
    }
  }

  updateStatusBar(editorType) {
    const statusElement = this.shadowRoot.getElementById('editorType');
    if (statusElement) {
      statusElement.textContent = editorType;
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.setAttribute('theme', this.theme);
    
    const themeBtn = this.shadowRoot.getElementById('themeBtn');
    themeBtn.textContent = `${this.theme === 'dark' ? '☀️' : '🌙'} Theme`;
    
    if (this.aceEditor) {
      this.aceEditor.setTheme(this.theme === 'dark' ? 'ace/theme/monokai' : 'ace/theme/github');
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
      { name: 'Delete Current File', action: () => this.deleteCurrentFile() },
      { name: 'Duplicate File', action: () => this.duplicateFile() }
    ];
  }

  createNewFile() {
    const filename = prompt('Enter filename (e.g., script.js, style.css):');
    if (filename && filename.trim() && !this.files[filename]) {
      const ext = filename.split('.').pop().toLowerCase();
      const language = this.guessLanguage(ext);
      this.files[filename] = { content: `// ${filename}\n`, language };
      this.openFile(filename);
    } else if (this.files[filename]) {
      alert('File already exists!');
    }
  }

  guessLanguage(ext) {
    const langMap = {
      js: 'javascript',
      html: 'html',
      css: 'css',
      py: 'python',
      json: 'json',
      xml: 'xml',
      sql: 'sql'
    };
    return langMap[ext] || 'javascript';
  }

  deleteCurrentFile() {
    if (Object.keys(this.files).length <= 1) {
      alert('Cannot delete the last file!');
      return;
    }
    
    if (confirm(`Delete ${this.currentFile}?`)) {
      delete this.files[this.currentFile];
      this.closeTab(this.currentFile);
    }
  }

  duplicateFile() {
    const newName = prompt(`Duplicate ${this.currentFile} as:`, this.currentFile.replace('.', '_copy.'));
    if (newName && !this.files[newName]) {
      this.files[newName] = { 
        content: this.files[this.currentFile].content, 
        language: this.files[this.currentFile].language 
      };
      this.openFile(newName);
    }
  }

  saveAll() {
    this.dispatchEvent(new CustomEvent('save', { detail: this.files }));
    alert('All files saved!');
  }

  formatDocument() {
    const currentContent = this.files[this.currentFile].content;
    let formatted = currentContent;
    
    if (this.files[this.currentFile].language === 'javascript') {
      formatted = this.formatJavaScript(currentContent);
    } else if (this.files[this.currentFile].language === 'html') {
      formatted = this.formatHTML(currentContent);
    } else if (this.files[this.currentFile].language === 'css') {
      formatted = this.formatCSS(currentContent);
    }
    
    this.files[this.currentFile].content = formatted;
    
    if (this.aceEditor) {
      this.aceEditor.setValue(formatted, -1);
    } else {
      const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
      fallbackEditor.value = formatted;
    }
  }

  formatJavaScript(code) {
    return code
      .replace(/;(?!\s*[\n\r])/g, ';\n')
      .replace(/{(?!\s*[\n\r])/g, '{\n')
      .replace(/}(?!\s*[\n\r])/g, '\n}')
      .replace(/,(?!\s*[\n\r])/g, ',\n');
  }

  formatHTML(code) {
    return code
      .replace(/></g, '>\n<')
      .replace(/^\s+|\s+$/gm, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');
  }

  formatCSS(code) {
    return code
      .replace(/{/g, ' {\n')
      .replace(/}/g, '\n}\n')
      .replace(/;(?!\s*[\n\r])/g, ';\n')
      .replace(/,(?!\s*[\n\r])/g, ',\n');
  }

  // Public API methods
  getValue() {
    return this.files[this.currentFile].content;
  }

  setValue(value) {
    this.files[this.currentFile].content = value;
    if (this.aceEditor) {
      this.aceEditor.setValue(value, -1);
    } else {
      const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
      fallbackEditor.value = value;
    }
  }

  getCurrentLanguage() {
    return this.files[this.currentFile].language;
  }

  setLanguage(language) {
    this.files[this.currentFile].language = language;
    this.updateLanguageInfo();
    if (this.aceEditor) {
      this.aceEditor.session.setMode(this.getAceMode(language));
    }
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
