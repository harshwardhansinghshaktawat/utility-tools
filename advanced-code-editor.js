// advanced-code-editor.js - Wix Custom Element
class AdvancedCodeEditor extends HTMLElement {
    constructor() {
        super();
        this.monaco = null;
        this.editor = null;
        this.currentTheme = 'vs-dark';
        this.files = {
            'main.js': `// Welcome to Advanced Code Editor!\n// Click the ▶️ Run button to execute this code!\n\nconsole.log('🚀 Hello from the Advanced Code Editor!');\n\nfunction greetUser(name) {\n    const greeting = \`Hello, \${name}! Welcome to our advanced editor.\`;\n    console.log(greeting);\n    return greeting;\n}\n\n// Test the function\nconst result = greetUser('Developer');\nconsole.log('Function returned:', result);\n\n// Try some math\nconst numbers = [1, 2, 3, 4, 5];\nconst sum = numbers.reduce((a, b) => a + b, 0);\nconsole.log('Sum of', numbers, 'is', sum);\n\n// Show current time\nconst now = new Date();\nconsole.log('Current time:', now.toLocaleTimeString());\n\n// Features included:\n// ✅ Real JavaScript execution\n// ✅ Console output capture\n// ✅ Error handling\n// ✅ HTML/CSS preview\n// ✅ Multiple file support\n// ✅ And much more!\n\n'Ready to code! 🎉'`,
            'style.css': `/* Beautiful CSS for your projects */\n/* Click the 👁️ Preview button to see these styles! */\n\nbody {\n    margin: 0;\n    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.container {\n    max-width: 600px;\n    margin: 0 auto;\n    padding: 20px;\n}\n\n.card {\n    background: rgba(255, 255, 255, 0.95);\n    padding: 40px;\n    border-radius: 20px;\n    box-shadow: \n        0 20px 40px rgba(0, 0, 0, 0.1),\n        0 0 0 1px rgba(255, 255, 255, 0.2);\n    backdrop-filter: blur(10px);\n    transition: transform 0.3s ease;\n    text-align: center;\n}\n\n.card:hover {\n    transform: translateY(-10px);\n}\n\n.card h1 {\n    color: #333;\n    margin-bottom: 20px;\n    font-size: 2.5em;\n    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n\n.card p {\n    color: #666;\n    line-height: 1.6;\n    margin-bottom: 15px;\n}\n\n.demo-btn {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    border: none;\n    padding: 15px 30px;\n    border-radius: 50px;\n    font-size: 16px;\n    font-weight: 600;\n    cursor: pointer;\n    transition: all 0.3s ease;\n    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);\n    margin: 20px 0;\n}\n\n.demo-btn:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);\n}\n\n.demo-btn:active {\n    transform: translateY(0);\n}`,
            'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Interactive Project</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="container">\n        <div class="card">\n            <h1>🚀 Welcome to My Project</h1>\n            <p>This is a sample HTML file in our advanced code editor.</p>\n            <p>Click the 👁️ Preview button to see this rendered!</p>\n            <button onclick="greetUser('World')" class="demo-btn">Click Me! 🎉</button>\n            <div id="output"></div>\n        </div>\n    </div>\n    <script>\n        function greetUser(name) {\n            const output = document.getElementById('output');\n            output.innerHTML = \`<p style="color: #00d4aa; margin-top: 10px;">Hello, \${name}! 👋</p>\`;\n            console.log('Button clicked! Greeting:', name);\n        }\n    </script>\n</body>\n</html>`,
            'README.md': `# Advanced Code Editor\n\nA powerful, VS Code-like editor built for the web.\n\n## Features\n\n- 🚀 **Fast Performance** - Powered by Monaco Editor\n- 🎨 **Beautiful UI** - Modern, responsive design\n- 🌓 **Multiple Themes** - Dark and light themes\n- 📁 **File Management** - Organize your code files\n- 🔧 **Customizable** - Adjust settings to your preference\n- 💡 **IntelliSense** - Smart code completion\n- 🐛 **Error Detection** - Real-time error highlighting\n\n## Supported Languages\n\n- JavaScript/TypeScript\n- HTML/CSS\n- Python\n- Java\n- C++\n- JSON/XML\n- Markdown\n- And many more!\n\n## Getting Started\n\n1. Select a file from the explorer\n2. Start coding with full IntelliSense support\n3. Use Ctrl+Space for auto-completion\n4. Customize settings using the settings panel\n\nHappy coding! 🎉`
        };
        this.currentFile = 'main.js';
        this.isMonacoLoaded = false;
    }

    static get observedAttributes() {
        return ['width', 'height', 'theme', 'language', 'font-size'];
    }

    connectedCallback() {
        // Set default dimensions if not specified
        if (!this.style.width) this.style.width = this.getAttribute('width') || '100%';
        if (!this.style.height) this.style.height = this.getAttribute('height') || '600px';
        
        this.render();
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            this.loadMonacoEditor();
        }, 50);
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
                    position: relative;
                    overflow: hidden;
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
                    z-index: 1;
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
                    position: relative;
                }

                .monaco-container {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    background: #1e1e1e;
                    min-height: 200px;
                }

                .monaco-container > div {
                    position: relative !important;
                    width: 100% !important;
                    height: 100% !important;
                }

                .output-panel {
                    height: 200px;
                    background: rgba(20, 20, 20, 0.95);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    transition: height 0.3s ease;
                    position: relative;
                    z-index: 2;
                }

                .output-panel.collapsed {
                    height: 40px;
                }

                .output-header {
                    height: 40px;
                    background: rgba(30, 30, 30, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .output-title {
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                }

                .output-controls {
                    display: flex;
                    gap: 8px;
                }

                .output-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: #ffffff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: background 0.3s ease;
                }

                .output-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .output-content {
                    flex: 1;
                    padding: 10px 15px;
                    overflow-y: auto;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .output-line {
                    margin-bottom: 4px;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .output-line.welcome {
                    color: #00d4aa;
                }

                .output-line.log {
                    color: #ffffff;
                }

                .output-line.error {
                    color: #ff6b6b;
                }

                .output-line.warn {
                    color: #ffd93d;
                }

                .output-line.info {
                    color: #74b9ff;
                }

                .preview-panel {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 50%;
                    height: 100%;
                    background: rgba(30, 30, 30, 0.98);
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 100;
                    display: flex;
                    flex-direction: column;
                }

                .preview-header {
                    height: 40px;
                    background: rgba(45, 45, 48, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .preview-title {
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                }

                .preview-controls {
                    display: flex;
                    gap: 8px;
                }

                .preview-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: background 0.3s ease;
                }

                .preview-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .preview-iframe {
                    flex: 1;
                    border: none;
                    background: white;
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
                    background: rgba(30, 30, 30, 0.9);
                    padding: 20px;
                    border-radius: 8px;
                    backdrop-filter: blur(10px);
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
                        <button class="control-btn" id="previewBtn">👁️ Preview</button>
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
                        
                        <!-- Output Console -->
                        <div class="output-panel" id="outputPanel">
                            <div class="output-header">
                                <span class="output-title">📟 Console Output</span>
                                <div class="output-controls">
                                    <button class="output-btn" id="clearConsole">🗑️ Clear</button>
                                    <button class="output-btn" id="toggleOutput">➖</button>
                                </div>
                            </div>
                            <div class="output-content" id="outputContent">
                                <div class="output-line welcome">✨ Ready to run your code! Click the Run button to see output.</div>
                            </div>
                        </div>

                        <!-- Preview Panel -->
                        <div class="preview-panel" id="previewPanel" style="display: none;">
                            <div class="preview-header">
                                <span class="preview-title">👁️ Live Preview</span>
                                <div class="preview-controls">
                                    <button class="preview-btn" id="refreshPreview">🔄 Refresh</button>
                                    <button class="preview-btn" id="closePreview">✕ Close</button>
                                </div>
                            </div>
                            <iframe class="preview-iframe" id="previewIframe" sandbox="allow-scripts allow-same-origin"></iframe>
                        </div>
                        
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

        // Listen for iframe console messages
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'console') {
                const { method, args } = event.data;
                const message = args.map(arg => this.formatValue(arg)).join(' ');
                this.addOutputLine(`🖼️ Preview: ${message}`, method);
            }
        });
    }

    async loadMonacoEditor() {
        if (this.isMonacoLoaded) return;

        const loading = this.querySelector('#loading');
        
        try {
            // Show loading state
            if (loading) {
                loading.style.display = 'flex';
                loading.innerHTML = `
                    <div class="spinner"></div>
                    <div>Loading Monaco Editor...</div>
                `;
            }

            // Load Monaco Editor script if not already loaded
            if (!window.require) {
                console.log('Loading Monaco loader...');
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
                    script.onload = () => {
                        console.log('Monaco loader loaded successfully');
                        resolve();
                    };
                    script.onerror = () => reject(new Error('Failed to load Monaco loader'));
                    document.head.appendChild(script);
                    
                    // Timeout after 10 seconds
                    setTimeout(() => reject(new Error('Monaco loader timeout')), 10000);
                });
            }

            // Configure Monaco loader
            require.config({ 
                paths: { 
                    'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' 
                } 
            });

            // Load Monaco Editor
            console.log('Loading Monaco Editor...');
            await new Promise((resolve, reject) => {
                require(['vs/editor/editor.main'], () => {
                    try {
                        console.log('Monaco Editor loaded successfully');
                        this.monaco = window.monaco;
                        
                        // Create editor after a small delay to ensure DOM is ready
                        setTimeout(() => {
                            this.createEditor();
                            this.isMonacoLoaded = true;
                            
                            // Hide loading
                            if (loading) {
                                loading.style.display = 'none';
                            }

                            // Dispatch ready event
                            this.dispatchEvent(new CustomEvent('editor-ready', {
                                detail: { editor: this.editor, monaco: this.monaco }
                            }));
                            
                            resolve();
                        }, 200);
                        
                    } catch (error) {
                        console.error('Error initializing Monaco:', error);
                        reject(error);
                    }
                }, (error) => {
                    console.error('Error loading Monaco modules:', error);
                    reject(new Error('Failed to load Monaco modules'));
                });
                
                // Timeout after 15 seconds
                setTimeout(() => reject(new Error('Monaco editor timeout')), 15000);
            });
            
        } catch (error) {
            console.error('Failed to load Monaco Editor:', error);
            this.showError(error.message);
        }
    }

    showError(message) {
        const loading = this.querySelector('#loading');
        if (loading) {
            loading.innerHTML = `
                <div style="color: #ff6b6b; text-align: center; max-width: 300px;">
                    <div style="font-size: 18px; margin-bottom: 10px;">❌ Editor Error</div>
                    <div style="font-size: 14px; margin-bottom: 15px;">${message}</div>
                    <div style="font-size: 12px; margin-bottom: 15px; opacity: 0.8;">
                        Please check your internet connection and try again.
                    </div>
                    <button 
                        style="
                            padding: 8px 16px; 
                            background: #007acc; 
                            color: white; 
                            border: none; 
                            border-radius: 6px; 
                            cursor: pointer;
                            margin-right: 10px;
                        " 
                        onclick="location.reload()"
                    >
                        🔄 Reload Page
                    </button>
                    <button 
                        style="
                            padding: 8px 16px; 
                            background: #666; 
                            color: white; 
                            border: none; 
                            border-radius: 6px; 
                            cursor: pointer;
                        " 
                        onclick="this.closest('advanced-code-editor').troubleshoot()"
                    >
                        🔧 Troubleshoot
                    </button>
                </div>
            `;
        }
    }

    createEditor() {
        const container = this.querySelector('#monacoContainer');
        
        // Ensure container exists and has dimensions
        if (!container) {
            console.error('Monaco container not found');
            return;
        }
        
        // Wait for container to have proper dimensions
        const checkDimensions = () => {
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                setTimeout(checkDimensions, 50);
                return;
            }
            
            // Clear any existing content
            container.innerHTML = '';
            
            try {
                // Create the editor
                this.editor = this.monaco.editor.create(container, {
                    value: this.files[this.currentFile] || '',
                    language: this.getLanguageFromFilename(this.currentFile),
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
                    selectOnLineNumbers: true,
                    readOnly: false,
                    cursorBlinking: 'blink',
                    cursorSmoothCaretAnimation: true,
                    smoothScrolling: true,
                    renderWhitespace: 'selection',
                    roundedSelection: false,
                    scrollbar: {
                        useShadows: false,
                        verticalHasArrows: true,
                        horizontalHasArrows: true,
                        horizontal: 'auto',
                        vertical: 'auto'
                    },
                    // Force proper positioning
                    dimension: {
                        width: rect.width,
                        height: rect.height
                    }
                });

                // Set up event listeners
                this.setupEditorEvents();
                
                // Force initial layout
                setTimeout(() => {
                    this.editor.layout();
                    this.editor.focus();
                    this.updateStatusBar({ lineNumber: 1, column: 1 });
                    this.updateFileSize();
                }, 100);
                
            } catch (error) {
                console.error('Error creating Monaco editor:', error);
                container.innerHTML = `
                    <div style="color: #ff6b6b; padding: 20px; text-align: center;">
                        <div>❌ Failed to create editor</div>
                        <div style="font-size: 12px; margin-top: 5px;">${error.message}</div>
                    </div>
                `;
            }
        };
        
        checkDimensions();
    }

    setupEditorEvents() {
        if (!this.editor) return;

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

        // Add keyboard shortcuts
        this.editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.Enter, () => {
            this.runCode();
        });

        this.editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyMod.Shift | this.monaco.KeyCode.KeyP, () => {
            this.showPreview();
        });
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
                this.runCode();
            }
        });

        // Preview button
        this.querySelector('#previewBtn').addEventListener('click', () => {
            if (this.editor) {
                this.showPreview();
            }
        });

        // Output panel controls
        this.querySelector('#clearConsole').addEventListener('click', () => {
            this.clearConsole();
        });

        this.querySelector('#toggleOutput').addEventListener('click', () => {
            this.toggleOutputPanel();
        });

        // Preview panel controls
        this.querySelector('#refreshPreview').addEventListener('click', () => {
            this.refreshPreview();
        });

        this.querySelector('#closePreview').addEventListener('click', () => {
            this.closePreview();
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
        if (!this.editor || !this.monaco) {
            console.warn('Editor not ready for file switch');
            return;
        }

        // Save current file content before switching
        if (this.currentFile && this.editor) {
            this.files[this.currentFile] = this.editor.getValue();
        }
        
        // Update current file
        const oldFile = this.currentFile;
        this.currentFile = filename;
        
        // Update UI
        this.querySelectorAll('.file-item').forEach(item => {
            item.classList.toggle('active', item.dataset.file === filename);
        });

        // Update tab bar
        this.updateTabBar(filename);
        
        try {
            // Get file content and language
            const fileContent = this.files[filename] || '';
            const language = this.getLanguageFromFilename(filename);
            
            // Simply set the value and language - don't create new models
            this.editor.setValue(fileContent);
            this.monaco.editor.setModelLanguage(this.editor.getModel(), language);
            
            // Update UI elements
            this.querySelector('#languageSelect').value = language;
            this.querySelector('#currentLanguage').textContent = language.charAt(0).toUpperCase() + language.slice(1);
            
            // Focus and position cursor
            setTimeout(() => {
                this.editor.focus();
                this.editor.setPosition({ lineNumber: 1, column: 1 });
                this.updateFileSize();
            }, 50);

            // Dispatch file change event
            this.dispatchEvent(new CustomEvent('file-changed', {
                detail: { file: filename, content: fileContent, oldFile: oldFile }
            }));
            
        } catch (error) {
            console.error('Error switching file:', error);
            // Revert to old file if switch failed
            this.currentFile = oldFile;
        }
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

    // Code execution methods
    runCode() {
        const code = this.editor.getValue();
        const language = this.editor.getModel().getLanguageId();
        
        this.clearConsole();
        this.addOutputLine('🚀 Running code...', 'info');
        
        try {
            switch (language) {
                case 'javascript':
                    this.executeJavaScript(code);
                    break;
                case 'html':
                    this.executeHTML(code);
                    break;
                case 'css':
                    this.addOutputLine('💡 CSS detected. Use Preview button to see visual output.', 'info');
                    break;
                case 'python':
                    this.addOutputLine('🐍 Python execution requires a backend server. Showing code structure analysis...', 'warn');
                    this.analyzePythonCode(code);
                    break;
                default:
                    this.addOutputLine(`⚠️ Code execution not supported for ${language}. Showing code analysis...`, 'warn');
                    this.analyzeCode(code, language);
            }
        } catch (error) {
            this.addOutputLine(`❌ Execution Error: ${error.message}`, 'error');
        }
    }

    executeJavaScript(code) {
        // Capture console output
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        // Override console methods
        console.log = (...args) => {
            this.addOutputLine(`📋 ${args.map(arg => this.formatValue(arg)).join(' ')}`, 'log');
            originalConsole.log(...args);
        };

        console.error = (...args) => {
            this.addOutputLine(`❌ ${args.map(arg => this.formatValue(arg)).join(' ')}`, 'error');
            originalConsole.error(...args);
        };

        console.warn = (...args) => {
            this.addOutputLine(`⚠️ ${args.map(arg => this.formatValue(arg)).join(' ')}`, 'warn');
            originalConsole.warn(...args);
        };

        console.info = (...args) => {
            this.addOutputLine(`ℹ️ ${args.map(arg => this.formatValue(arg)).join(' ')}`, 'info');
            originalConsole.info(...args);
        };

        try {
            // Create a safe execution context
            const result = new Function(code)();
            
            if (result !== undefined) {
                this.addOutputLine(`✅ Result: ${this.formatValue(result)}`, 'log');
            } else {
                this.addOutputLine('✅ Code executed successfully!', 'log');
            }
        } catch (error) {
            this.addOutputLine(`❌ Runtime Error: ${error.message}`, 'error');
        } finally {
            // Restore original console methods
            Object.assign(console, originalConsole);
        }
    }

    executeHTML(code) {
        this.addOutputLine('🌐 HTML detected. Use Preview button to see rendered output.', 'info');
        
        // Analyze HTML structure
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'text/html');
        const elements = doc.querySelectorAll('*');
        
        this.addOutputLine(`📊 HTML Analysis:`, 'info');
        this.addOutputLine(`   • ${elements.length} total elements`, 'log');
        this.addOutputLine(`   • ${doc.querySelectorAll('script').length} script tags`, 'log');
        this.addOutputLine(`   • ${doc.querySelectorAll('link, style').length} style elements`, 'log');
    }

    analyzePythonCode(code) {
        // Simple Python code analysis
        const lines = code.split('\n').filter(line => line.trim());
        const functions = code.match(/def\s+\w+\s*\(/g) || [];
        const classes = code.match(/class\s+\w+/g) || [];
        const imports = code.match(/(?:from\s+\w+\s+)?import\s+[\w,\s]+/g) || [];
        
        this.addOutputLine(`🐍 Python Code Analysis:`, 'info');
        this.addOutputLine(`   • ${lines.length} lines of code`, 'log');
        this.addOutputLine(`   • ${functions.length} functions defined`, 'log');
        this.addOutputLine(`   • ${classes.length} classes defined`, 'log');
        this.addOutputLine(`   • ${imports.length} import statements`, 'log');
        
        if (functions.length > 0) {
            this.addOutputLine(`   Functions: ${functions.map(f => f.match(/def\s+(\w+)/)[1]).join(', ')}`, 'log');
        }
    }

    analyzeCode(code, language) {
        const lines = code.split('\n').filter(line => line.trim());
        const chars = code.length;
        const words = code.split(/\s+/).filter(word => word.trim()).length;
        
        this.addOutputLine(`📊 ${language.toUpperCase()} Code Analysis:`, 'info');
        this.addOutputLine(`   • ${lines.length} lines`, 'log');
        this.addOutputLine(`   • ${words} words`, 'log');
        this.addOutputLine(`   • ${chars} characters`, 'log');
    }

    formatValue(value) {
        if (typeof value === 'object' && value !== null) {
            try {
                return JSON.stringify(value, null, 2);
            } catch {
                return String(value);
            }
        }
        return String(value);
    }

    showPreview() {
        const language = this.editor.getModel().getLanguageId();
        const code = this.editor.getValue();
        
        if (language === 'html' || this.currentFile.endsWith('.html')) {
            this.createHTMLPreview(code);
        } else if (language === 'css' || this.currentFile.endsWith('.css')) {
            this.createCSSPreview(code);
        } else {
            this.addOutputLine('👁️ Preview is available for HTML and CSS files only.', 'warn');
            return;
        }
        
        this.querySelector('#previewPanel').style.display = 'flex';
    }

    createHTMLPreview(htmlCode) {
        const iframe = this.querySelector('#previewIframe');
        const cssFile = this.files['style.css'] || '';
        const jsFile = this.files['main.js'] || '';
        
        // Create complete HTML document
        const fullHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preview</title>
                <style>${cssFile}</style>
            </head>
            <body>
                ${htmlCode.includes('<html') ? htmlCode.replace(/.*<body[^>]*>|<\/body>.*<\/html>.*/gs, '') : htmlCode}
                <script>
                    // Override console to prevent errors in iframe
                    console.log = function(...args) {
                        window.parent.postMessage({type: 'console', method: 'log', args: args}, '*');
                    };
                    console.error = function(...args) {
                        window.parent.postMessage({type: 'console', method: 'error', args: args}, '*');
                    };
                    try {
                        ${jsFile}
                    } catch(error) {
                        console.error('Script error:', error.message);
                    }
                </script>
            </body>
            </html>
        `;
        
        iframe.srcdoc = fullHTML;
        iframe.onload = () => {
            this.addOutputLine('🎨 CSS preview loaded successfully!', 'info');
        };
        iframe.onload = () => {
            this.addOutputLine('🖼️ HTML preview loaded successfully!', 'info');
        };
    }

    createCSSPreview(cssCode) {
        const iframe = this.querySelector('#previewIframe');
        const htmlFile = this.files['index.html'] || '<div class="demo">CSS Preview</div>';
        
        const fullHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CSS Preview</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .demo { padding: 20px; border: 2px dashed #ccc; margin: 20px 0; }
                    ${cssCode}
                </style>
            </head>
            <body>
                <h2>CSS Preview</h2>
                ${htmlFile.includes('<html') ? htmlFile.replace(/.*<body[^>]*>|<\/body>.*<\/html>.*/gs, '') : htmlFile}
            </body>
            </html>
        `;
        
        iframe.srcdoc = fullHTML;
    }

    refreshPreview() {
        if (this.querySelector('#previewPanel').style.display !== 'none') {
            this.showPreview();
        }
    }

    closePreview() {
        this.querySelector('#previewPanel').style.display = 'none';
    }

    addOutputLine(text, type = 'log') {
        const outputContent = this.querySelector('#outputContent');
        const line = document.createElement('div');
        line.className = `output-line ${type}`;
        line.textContent = text;
        outputContent.appendChild(line);
        outputContent.scrollTop = outputContent.scrollHeight;
    }

    clearConsole() {
        const outputContent = this.querySelector('#outputContent');
        outputContent.innerHTML = '';
    }

    toggleOutputPanel() {
        const panel = this.querySelector('#outputPanel');
        const toggleBtn = this.querySelector('#toggleOutput');
        
        panel.classList.toggle('collapsed');
        toggleBtn.textContent = panel.classList.contains('collapsed') ? '➕' : '➖';
    }

    // Public API methods
    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }

    setValue(value) {
        if (this.editor) {
            const safeValue = value || '';
            try {
                // Save cursor position
                const position = this.editor.getPosition();
                
                // Set value
                this.editor.setValue(safeValue);
                
                // Update current file content
                this.files[this.currentFile] = safeValue;
                
                // Restore cursor position if valid
                setTimeout(() => {
                    try {
                        this.editor.setPosition(position || { lineNumber: 1, column: 1 });
                        this.editor.focus();
                    } catch (e) {
                        // Position might be invalid for new content
                        this.editor.setPosition({ lineNumber: 1, column: 1 });
                        this.editor.focus();
                    }
                }, 50);
                
            } catch (error) {
                console.error('Error setting editor value:', error);
            }
        }
    }

    getLanguage() {
        return this.editor ? this.editor.getModel().getLanguageId() : '';
    }

    setLanguage(language) {
        if (this.editor && this.monaco) {
            this.monaco.editor.setModelLanguage(this.editor.getModel(), language);
            this.querySelector('#languageSelect').value = language;
            this.querySelector('#currentLanguage').textContent = language.charAt(0).toUpperCase() + language.slice(1);
        }
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    resize() {
        if (this.editor) {
            setTimeout(() => {
                this.editor.layout();
            }, 100);
        }
    }

    // Force editor refresh - useful for fixing display issues
    refresh() {
        if (this.editor) {
            const currentContent = this.editor.getValue();
            const currentPosition = this.editor.getPosition();
            
            setTimeout(() => {
                this.editor.layout();
                this.editor.setValue(currentContent);
                this.editor.setPosition(currentPosition);
                this.editor.focus();
            }, 100);
        }
    }

    addFile(filename, content = '') {
        this.files[filename] = content;
        this.updateFileList();
        
        // If this is the first file or editor isn't ready, switch to it
        if (Object.keys(this.files).length === 1 || !this.currentFile) {
            this.currentFile = filename;
        }
    }

    removeFile(filename) {
        if (Object.keys(this.files).length > 1) {
            delete this.files[filename];
            
            // If we're removing the current file, switch to another
            if (this.currentFile === filename) {
                this.currentFile = Object.keys(this.files)[0];
                if (this.editor) {
                    this.switchFile(this.currentFile);
                }
            }
            
            this.updateFileList();
        }
    }

    updateFileList() {
        const fileList = this.querySelector('#fileList');
        if (!fileList) return;
        
        fileList.innerHTML = '';
        
        Object.keys(this.files).forEach(filename => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            if (filename === this.currentFile) {
                fileItem.classList.add('active');
            }
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

    // Debug method to check editor status
    getDebugInfo() {
        return {
            isMonacoLoaded: this.isMonacoLoaded,
            hasEditor: !!this.editor,
            hasMongo: !!this.monaco,
            currentFile: this.currentFile,
            filesCount: Object.keys(this.files).length,
            editorValue: this.editor ? this.editor.getValue().substring(0, 50) + '...' : 'No editor',
            containerSize: {
                width: this.querySelector('#monacoContainer')?.offsetWidth || 0,
                height: this.querySelector('#monacoContainer')?.offsetHeight || 0
            }
        };
    }

    // Method to fix common editor issues
    troubleshoot() {
        console.log('🔧 Editor Troubleshooting...');
        const debugInfo = this.getDebugInfo();
        console.log('Debug Info:', debugInfo);
        
        const container = this.querySelector('#monacoContainer');
        const loading = this.querySelector('#loading');
        
        // Check for white screen (container issues)
        if (container && (container.offsetWidth === 0 || container.offsetHeight === 0)) {
            console.log('❌ Container has no dimensions, fixing...');
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.minHeight = '200px';
        }
        
        // Check for overlay issues
        const editorElements = container?.querySelectorAll('[class*="monaco"]');
        if (editorElements) {
            editorElements.forEach(el => {
                if (el.style.position === 'fixed') {
                    console.log('❌ Found fixed positioned element, fixing...');
                    el.style.position = 'relative';
                }
            });
        }
        
        if (!this.isMonacoLoaded) {
            console.log('❌ Monaco not loaded, attempting reload...');
            if (loading) loading.style.display = 'flex';
            this.loadMonacoEditor();
            return;
        }
        
        if (!this.editor) {
            console.log('❌ Editor not created, attempting creation...');
            this.createEditor();
            return;
        }
        
        // Force layout and refresh
        console.log('✅ Refreshing editor layout...');
        try {
            this.editor.layout();
            this.refresh();
            
            // Ensure proper focus
            setTimeout(() => {
                this.editor.focus();
                console.log('✅ Troubleshooting complete');
            }, 100);
        } catch (error) {
            console.error('Error during troubleshooting:', error);
            this.dispose();
            this.createEditor();
        }
    }

    // Properly dispose of the editor
    dispose() {
        try {
            if (this.editor) {
                this.editor.dispose();
                this.editor = null;
            }
            
            // Clear container
            const container = this.querySelector('#monacoContainer');
            if (container) {
                container.innerHTML = '';
            }
            
            this.isMonacoLoaded = false;
            console.log('✅ Editor disposed successfully');
        } catch (error) {
            console.error('Error disposing editor:', error);
        }
    }

    // Handle disconnection
    disconnectedCallback() {
        this.dispose();
    }
}

// Register the custom element
customElements.define('advanced-code-editor', AdvancedCodeEditor);
