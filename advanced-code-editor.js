// advanced-code-editor.js - Wix Custom Element
class AdvancedCodeEditor extends HTMLElement {
    constructor() {
        super();
        this.monaco = null;
        this.editor = null;
        this.currentTheme = 'vs-dark';
        this.files = {
            'main.js': `// Welcome to Advanced Code Editor!\n// This editor supports multiple languages with VS Code features\n\nfunction greetUser(name) {\n    console.log(\`Hello, \${name}! Welcome to our advanced editor.\`);\n    return \`Welcome, \${name}!\`;\n}\n\n// Try autocomplete by typing 'greet' and pressing Ctrl+Space\ngreetUser('Developer');\n\n// Features included:\n// ✅ Syntax highlighting\n// ✅ Auto-completion\n// ✅ Error detection\n// ✅ Multiple themes\n// ✅ File management\n// ✅ And much more!`,
            'style.css': `/* Beautiful CSS for your projects */\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 20px;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    border-radius: 12px;\n    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\n}\n\n.card {\n    background: white;\n    padding: 30px;\n    border-radius: 8px;\n    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);\n    transition: transform 0.3s ease;\n}\n\n.card:hover {\n    transform: translateY(-5px);\n}`,
            'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Project</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="container">\n        <div class="card">\n            <h1>Welcome to My Project</h1>\n            <p>This is a sample HTML file in our advanced code editor.</p>\n            <button onclick="greetUser('World')">Click Me!</button>\n        </div>\n    </div>\n    <script src="main.js"></script>\n</body>\n</html>`,
            'README.md': `# Advanced Code Editor\n\nA powerful, VS Code-like editor built for the web.\n\n## Features\n\n- 🚀 **Fast Performance** - Powered by Monaco Editor\n- 🎨 **Beautiful UI** - Modern, responsive design\n- 🌓 **Multiple Themes** - Dark and light themes\n- 📁 **File Management** - Organize your code files\n- 🔧 **Customizable** - Adjust settings to your preference\n- 💡 **IntelliSense** - Smart code completion\n- 🐛 **Error Detection** - Real-time error highlighting\n\n## Supported Languages\n\n- JavaScript/TypeScript\n- HTML/CSS\n- Python\n- Java\n- C++\n- JSON/XML\n- Markdown\n- And many more!\n\n## Getting Started\n\n1. Select a file from the explorer\n2. Start coding with full IntelliSense support\n3. Use Ctrl+Space for auto-completion\n4. Customize settings using the settings panel\n\nHappy coding! 🎉`
        };
        this.currentFile = 'main.js';
        this.isMonacoLoaded = false;
    }

    static get observedAttributes() {
        return ['width', 'height', 'theme', 'language', 'font-size'];
    }

    connectedCallback() {
        this.render();
        this.loadMonacoEditor();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.handleAttributeChange(name, newValue);
        }
    }

    handleAttributeChange(name, value) {
        switch (name) {
            case 'theme':
                this.currentTheme = value || 'vs-dark';
                if (this.editor && this.monaco) {
                    this.monaco.editor.setTheme(this.currentTheme);
                }
                break;
            case 'language':
                if (this.editor && this.monaco) {
                    this.monaco.editor.setModelLanguage(this.editor.getModel(), value || 'javascript');
                }
                break;
            case 'font-size':
                if (this.editor) {
                    this.editor.updateOptions({ fontSize: parseInt(value) || 14 });
                }
                break;
            case 'width':
                this.style.width = value || '100%';
                break;
            case 'height':
                this.style.height = value || '600px';
                break;
        }
    }

    render() {
        this.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 600px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .code-editor-container {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #1e1e1e 0%, #2d2d30 100%);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.3),
                        0 0 0 1px rgba(255, 255, 255, 0.1);
                    position: relative;
                }

                .editor-header {
                    background: linear-gradient(90deg, #2d2d30 0%, #3e3e42 100%);
                    height: 50px;
                    display: flex;
                    align-items: center;
                    padding: 0 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    position: relative;
                }

                .editor-title {
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 16px;
                    margin-right: auto;
                    display: flex;
                    align-items: center;
                }

                .editor-title::before {
                    content: '⚡';
                    margin-right: 8px;
                    font-size: 18px;
                }

                .header-controls {
                    display: flex;
                    gap: 10px;
                }

                .control-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: #ffffff;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .control-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                }

                .editor-content {
                    display: flex;
                    height: calc(100% - 50px);
                }

                .sidebar {
                    width: 250px;
                    background: rgba(30, 30, 30, 0.95);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    overflow-y: auto;
                    transition: all 0.3s ease;
                }

                .sidebar.collapsed {
                    width: 50px;
                }

                .sidebar-header {
                    padding: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .sidebar-title {
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                }

                .toggle-sidebar {
                    background: none;
                    border: none;
                    color: #ffffff;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 4px;
                    transition: background 0.3s ease;
                }

                .toggle-sidebar:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .file-list {
                    padding: 10px;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    color: #cccccc;
                    cursor: pointer;
                    border-radius: 6px;
                    margin-bottom: 2px;
                    transition: all 0.3s ease;
                    font-size: 13px;
                }

                .file-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }

                .file-item.active {
                    background: linear-gradient(90deg, #007acc, #005a9e);
                    color: #ffffff;
                }

                .file-icon {
                    margin-right: 8px;
                    width: 16px;
                    text-align: center;
                }

                .tab-bar {
                    background: rgba(45, 45, 48, 0.95);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    overflow-x: auto;
                    scrollbar-width: none;
                }

                .tab-bar::-webkit-scrollbar {
                    display: none;
                }

                .tab {
                    display: flex;
                    align-items: center;
                    padding: 12px 20px;
                    background: transparent;
                    border: none;
                    color: #cccccc;
                    cursor: pointer;
                    font-size: 13px;
                    white-space: nowrap;
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                    min-width: 120px;
                    justify-content: space-between;
                }

                .tab:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }

                .tab.active {
                    background: #1e1e1e;
                    color: #ffffff;
                    border-bottom: 2px solid #007acc;
                }

                .tab-close {
                    margin-left: 8px;
                    opacity: 0.6;
                    transition: opacity 0.3s ease;
                }

                .tab-close:hover {
                    opacity: 1;
                }

                .editor-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .monaco-container {
                    flex: 1;
                    position: relative;
                }

                .status-bar {
                    height: 30px;
                    background: linear-gradient(90deg, #007acc, #005a9e);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 15px;
                    font-size: 12px;
                    color: #ffffff;
                }

                .status-left, .status-right {
                    display: flex;
                    gap: 15px;
                }

                .language-select {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    outline: none;
                }

                .language-select option {
                    background: #2d2d30;
                    color: #ffffff;
                }

                .settings-panel {
                    position: absolute;
                    top: 50px;
                    right: 20px;
                    width: 300px;
                    background: rgba(45, 45, 48, 0.98);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 20px;
                    z-index: 1000;
                    display: none;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
                }

                .settings-panel.show {
                    display: block;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .settings-group {
                    margin-bottom: 20px;
                }

                .settings-label {
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    display: block;
                }

                .settings-control {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    outline: none;
                }

                .loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #ffffff;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 999;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid #007acc;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .sidebar {
                        width: 200px;
                    }
                    
                    .sidebar.collapsed {
                        width: 40px;
                    }
                    
                    .control-btn {
                        padding: 6px 12px;
                        font-size: 11px;
                    }
                }
            </style>

            <div class="code-editor-container">
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    Loading Code Editor...
                </div>
                
                <div class="editor-header">
                    <div class="editor-title">Advanced Code Editor</div>
                    <div class="header-controls">
                        <select class="language-select" id="languageSelect">
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="json">JSON</option>
                            <option value="xml">XML</option>
                            <option value="markdown">Markdown</option>
                        </select>
                        <button class="control-btn" id="themeToggle">🌓 Theme</button>
                        <button class="control-btn" id="settingsBtn">⚙️ Settings</button>
                        <button class="control-btn" id="formatBtn">📐 Format</button>
                        <button class="control-btn" id="runBtn">▶️ Run</button>
                    </div>
                </div>

                <div class="editor-content">
                    <div class="sidebar" id="sidebar">
                        <div class="sidebar-header">
                            <span class="sidebar-title">Explorer</span>
                            <button class="toggle-sidebar" id="toggleSidebar">📁</button>
                        </div>
                        <div class="file-list" id="fileList">
                            <div class="file-item active" data-file="main.js">
                                <span class="file-icon">📄</span>
                                main.js
                            </div>
                            <div class="file-item" data-file="style.css">
                                <span class="file-icon">🎨</span>
                                style.css
                            </div>
                            <div class="file-item" data-file="index.html">
                                <span class="file-icon">🌐</span>
                                index.html
                            </div>
                            <div class="file-item" data-file="README.md">
                                <span class="file-icon">📖</span>
                                README.md
                            </div>
                        </div>
                    </div>

                    <div class="editor-area">
                        <div class="tab-bar" id="tabBar">
                            <button class="tab active" data-file="main.js">
                                main.js
                                <span class="tab-close">×</span>
                            </button>
                        </div>
                        
                        <div class="monaco-container" id="monacoContainer"></div>
                        
                        <div class="status-bar">
                            <div class="status-left">
                                <span>Line <span id="lineNumber">1</span>, Column <span id="columnNumber">1</span></span>
                                <span id="fileSize">0 bytes</span>
                            </div>
                            <div class="status-right">
                                <span id="currentLanguage">JavaScript</span>
                                <span id="encoding">UTF-8</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-panel" id="settingsPanel">
                    <div class="settings-group">
                        <label class="settings-label">Font Size</label>
                        <input type="range" class="settings-control" id="fontSizeSlider" min="10" max="24" value="14">
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">Tab Size</label>
                        <select class="settings-control" id="tabSizeSelect">
                            <option value="2">2 spaces</option>
                            <option value="4" selected>4 spaces</option>
                            <option value="8">8 spaces</option>
                        </select>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">Word Wrap</label>
                        <select class="settings-control" id="wordWrapSelect">
                            <option value="off">Off</option>
                            <option value="on">On</option>
                            <option value="wordWrapColumn">Column</option>
                        </select>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">Minimap</label>
                        <select class="settings-control" id="minimapSelect">
                            <option value="true" selected>Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    async loadMonacoEditor() {
        if (this.isMonacoLoaded) return;

        const loading = this.querySelector('#loading');
        
        try {
            // Load Monaco Editor script
            if (!window.require) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
                document.head.appendChild(script);
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }

            // Configure Monaco loader
            require.config({ 
                paths: { 
                    'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' 
                } 
            });

            // Load Monaco Editor
            require(['vs/editor/editor.main'], () => {
                this.monaco = window.monaco;
                this.createEditor();
                loading.style.display = 'none';
                this.isMonacoLoaded = true;

                // Dispatch ready event
                this.dispatchEvent(new CustomEvent('editor-ready', {
                    detail: { editor: this.editor, monaco: this.monaco }
                }));
            });
        } catch (error) {
            console.error('Failed to load Monaco Editor:', error);
            loading.innerHTML = '<div style="color: #ff6b6b;">Failed to load editor. Please refresh the page.</div>';
        }
    }

    createEditor() {
        const container = this.querySelector('#monacoContainer');
        
        this.editor = this.monaco.editor.create(container, {
            value: this.files[this.currentFile],
            language: this.getAttribute('language') || 'javascript',
            theme: this.getAttribute('theme') || this.currentTheme,
            fontSize: parseInt(this.getAttribute('font-size')) || 14,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'off',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            contextmenu: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'top',
            folding: true,
            lineNumbers: 'on',
            rulers: [],
            renderWhitespace: 'selection',
            roundedSelection: false,
            scrollbar: {
                useShadows: false,
                verticalHasArrows: true,
                horizontalHasArrows: true
            }
        });

        // Update status bar on cursor position change
        this.editor.onDidChangeCursorPosition((e) => {
            this.updateStatusBar(e.position);
        });

        // Save file content on change
        this.editor.onDidChangeModelContent(() => {
            this.files[this.currentFile] = this.editor.getValue();
            this.updateFileSize();
            
            // Dispatch content change event
            this.dispatchEvent(new CustomEvent('content-changed', {
                detail: { 
                    file: this.currentFile, 
                    content: this.editor.getValue() 
                }
            }));
        });

        this.updateStatusBar({ lineNumber: 1, column: 1 });
        this.updateFileSize();
    }

    setupEventListeners() {
        // Language selector
        this.querySelector('#languageSelect').addEventListener('change', (e) => {
            const language = e.target.value;
            if (this.editor && this.monaco) {
                this.monaco.editor.setModelLanguage(this.editor.getModel(), language);
                this.querySelector('#currentLanguage').textContent = language.charAt(0).toUpperCase() + language.slice(1);
            }
        });

        // Theme toggle
        this.querySelector('#themeToggle').addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'vs-dark' ? 'vs-light' : 'vs-dark';
            if (this.editor && this.monaco) {
                this.monaco.editor.setTheme(this.currentTheme);
            }
        });

        // Settings panel toggle
        this.querySelector('#settingsBtn').addEventListener('click', () => {
            const panel = this.querySelector('#settingsPanel');
            panel.classList.toggle('show');
        });

        // Format code
        this.querySelector('#formatBtn').addEventListener('click', () => {
            if (this.editor) {
                this.editor.getAction('editor.action.formatDocument').run();
            }
        });

        // Run code (simulate)
        this.querySelector('#runBtn').addEventListener('click', () => {
            if (this.editor) {
                const code = this.editor.getValue();
                this.dispatchEvent(new CustomEvent('code-run', {
                    detail: { code, file: this.currentFile }
                }));
            }
        });

        // File list
        this.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchFile(item.dataset.file);
            });
        });

        // Sidebar toggle
        this.querySelector('#toggleSidebar').addEventListener('click', () => {
            this.querySelector('#sidebar').classList.toggle('collapsed');
        });

        // Settings controls
        this.setupSettingsControls();

        // Close settings panel when clicking outside
        document.addEventListener('click', (e) => {
            const panel = this.querySelector('#settingsPanel');
            const settingsBtn = this.querySelector('#settingsBtn');
            if (!this.contains(e.target)) {
                panel.classList.remove('show');
            }
        });
    }

    setupSettingsControls() {
        // Font size
        this.querySelector('#fontSizeSlider').addEventListener('input', (e) => {
            if (this.editor) {
                this.editor.updateOptions({ fontSize: parseInt(e.target.value) });
            }
        });

        // Tab size
        this.querySelector('#tabSizeSelect').addEventListener('change', (e) => {
            if (this.editor) {
                this.editor.updateOptions({ tabSize: parseInt(e.target.value) });
            }
        });

        // Word wrap
        this.querySelector('#wordWrapSelect').addEventListener('change', (e) => {
            if (this.editor) {
                this.editor.updateOptions({ wordWrap: e.target.value });
            }
        });

        // Minimap
        this.querySelector('#minimapSelect').addEventListener('change', (e) => {
            if (this.editor) {
                this.editor.updateOptions({ minimap: { enabled: e.target.value === 'true' } });
            }
        });
    }

    switchFile(filename) {
        if (!this.editor) return;

        // Save current file content
        this.files[this.currentFile] = this.editor.getValue();
        
        // Update active file
        this.currentFile = filename;
        
        // Update UI
        this.querySelectorAll('.file-item').forEach(item => {
            item.classList.toggle('active', item.dataset.file === filename);
        });

        // Update tab bar
        this.updateTabBar(filename);
        
        // Load file content
        this.editor.setValue(this.files[filename] || '');
        
        // Set appropriate language
        const language = this.getLanguageFromFilename(filename);
        this.monaco.editor.setModelLanguage(this.editor.getModel(), language);
        this.querySelector('#languageSelect').value = language;
        this.querySelector('#currentLanguage').textContent = language.charAt(0).toUpperCase() + language.slice(1);
        
        this.updateFileSize();

        // Dispatch file change event
        this.dispatchEvent(new CustomEvent('file-changed', {
            detail: { file: filename, content: this.files[filename] }
        }));
    }

    getLanguageFromFilename(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'html': 'html',
            'css': 'css',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'cpp',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown'
        };
        return languageMap[ext] || 'javascript';
    }

    updateTabBar(filename) {
        const tabBar = this.querySelector('#tabBar');
        let tab = tabBar.querySelector(`[data-file="${filename}"]`);
        
        if (!tab) {
            tab = document.createElement('button');
            tab.className = 'tab';
            tab.dataset.file = filename;
            tab.innerHTML = `${filename}<span class="tab-close">×</span>`;
            tabBar.appendChild(tab);
            
            // Add click event for tab
            tab.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-close')) {
                    this.closeTab(filename);
                } else {
                    this.switchFile(filename);
                }
            });
        }
        
        // Update active tab
        tabBar.querySelectorAll('.tab').forEach(t => {
            t.classList.toggle('active', t.dataset.file === filename);
        });
    }

    closeTab(filename) {
        const tabBar = this.querySelector('#tabBar');
        const tab = tabBar.querySelector(`[data-file="${filename}"]`);
        if (tab && tabBar.children.length > 1) {
            tab.remove();
            if (this.currentFile === filename) {
                // Switch to first available tab
                const firstTab = tabBar.querySelector('.tab');
                if (firstTab) {
                    this.switchFile(firstTab.dataset.file);
                }
            }
        }
    }

    updateStatusBar(position) {
        this.querySelector('#lineNumber').textContent = position.lineNumber;
        this.querySelector('#columnNumber').textContent = position.column;
    }

    updateFileSize() {
        if (!this.editor) return;
        
        const content = this.editor.getValue();
        const bytes = new Blob([content]).size;
        const sizes = ['bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = i === 0 ? bytes : (bytes / Math.pow(1024, i)).toFixed(1);
        this.querySelector('#fileSize').textContent = `${size} ${sizes[i]}`;
    }

    // Public API methods
    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }

    setValue(value) {
        if (this.editor) {
            this.editor.setValue(value);
        }
    }

    getLanguage() {
        return this.editor ? this.editor.getModel().getLanguageId() : '';
    }

    setLanguage(language) {
        if (this.editor && this.monaco) {
            this.monaco.editor.setModelLanguage(this.editor.getModel(), language);
        }
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    resize() {
        if (this.editor) {
            this.editor.layout();
        }
    }

    addFile(filename, content = '') {
        this.files[filename] = content;
        this.updateFileList();
    }

    removeFile(filename) {
        if (Object.keys(this.files).length > 1) {
            delete this.files[filename];
            this.updateFileList();
        }
    }

    updateFileList() {
        const fileList = this.querySelector('#fileList');
        fileList.innerHTML = '';
        
        Object.keys(this.files).forEach(filename => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.file = filename;
            fileItem.innerHTML = `
                <span class="file-icon">${this.getFileIcon(filename)}</span>
                ${filename}
            `;
            fileItem.addEventListener('click', () => this.switchFile(filename));
            fileList.appendChild(fileItem);
        });
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'js': '📄',
            'ts': '📄',
            'html': '🌐',
            'css': '🎨',
            'py': '🐍',
            'java': '☕',
            'cpp': '⚙️',
            'json': '📋',
            'xml': '📄',
            'md': '📖'
        };
        return iconMap[ext] || '📄';
    }
}

// Register the custom element
customElements.define('advanced-code-editor', AdvancedCodeEditor);
