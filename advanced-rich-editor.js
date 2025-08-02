// Custom Element: <advanced-rich-editor>
// File: advanced-rich-editor.js
// 
// USAGE IN WIX:
// 1. Upload this file to your server (HTTPS required for live sites)
// 2. In Wix Editor: Add Elements > Embed & Social > Custom Element
// 3. Choose Source: Server URL (paste your file URL)
// 4. Tag Name: advanced-rich-editor (must match exactly)
// 5. Save and publish

class AdvancedRichEditor extends HTMLElement {
    constructor() {
        super();
        this.editor = null;
        this.isFullscreen = false;
        this.currentTheme = 'light';
        this.useSimpleEditor = false;
        this.content = '';
        this.undoStack = [];
        this.redoStack = [];
    }

    connectedCallback() {
        console.log('Advanced Rich Editor: Initializing...');
        this.innerHTML = this.getHTML();
        this.addStyles();
        this.hideLoading();
        this.initializeEditor();
        this.setupEventListeners();
    }

    hideLoading() {
        setTimeout(() => {
            const loading = this.querySelector('#loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }, 500);
    }

    async initializeEditor() {
        console.log('Advanced Rich Editor: Starting initialization...');
        
        // Try to load Editor.js with timeout
        try {
            await Promise.race([
                this.loadEditorJS(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ]);
            console.log('Advanced Rich Editor: Editor.js loaded successfully');
        } catch (error) {
            console.warn('Advanced Rich Editor: Editor.js failed to load, using simple editor:', error);
            this.useSimpleEditor = true;
            this.initializeSimpleEditor();
        }
    }

    async loadEditorJS() {
        // Load Editor.js core only
        if (typeof EditorJS === 'undefined') {
            await this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest');
        }

        // Wait a bit for the library to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (typeof EditorJS === 'undefined') {
            throw new Error('EditorJS not available');
        }

        console.log('Advanced Rich Editor: Initializing Editor.js...');
        
        // Initialize with minimal configuration
        this.editor = new EditorJS({
            holder: 'editorjs',
            placeholder: 'Start writing your content here...',
            autofocus: true,
            data: {
                blocks: [
                    {
                        type: "paragraph",
                        data: {
                            text: "Welcome to Advanced Rich Editor! 🎉"
                        }
                    },
                    {
                        type: "paragraph",
                        data: {
                            text: "Start creating your content here. Use the toolbar above to add different types of content blocks."
                        }
                    },
                    {
                        type: "paragraph",
                        data: {
                            text: "Click the <b>+</b> button on the left to add new blocks, or use the tools in the sidebar!"
                        }
                    }
                ]
            },
            onChange: () => {
                this.updateStats();
            },
            onReady: () => {
                console.log('Advanced Rich Editor: Editor.js ready');
                this.updateStats();
                this.showStatus('Editor ready!');
            }
        });
    }

    initializeSimpleEditor() {
        console.log('Advanced Rich Editor: Initializing simple editor...');
        const editorContainer = this.querySelector('#editorjs');
        
        editorContainer.innerHTML = `
            <div class="simple-editor" contenteditable="true" spellcheck="true">
                <h1>Welcome to Advanced Rich Editor! 🎉</h1>
                <p>This is the simple editor mode. You can still create great content!</p>
                <p>Features available:</p>
                <ul>
                    <li><strong>Bold text</strong> and <em>italic text</em></li>
                    <li>Lists and headings</li>
                    <li>Links and basic formatting</li>
                    <li>Export to HTML, Markdown, and more</li>
                </ul>
                <p>Use the toolbar above to format your text!</p>
            </div>
        `;

        this.simpleEditor = editorContainer.querySelector('.simple-editor');
        this.simpleEditor.addEventListener('input', () => {
            this.updateStats();
            this.saveState();
        });

        this.simpleEditor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }
        });

        this.updateStats();
        this.saveState();
        this.showStatus('Simple editor ready!');
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
            script.onload = () => {
                console.log('Script loaded:', src);
                resolve();
            };
            script.onerror = (error) => {
                console.error('Script failed to load:', src, error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    getHTML() {
        return `
            <div class="are-container" id="are-main">
                <div class="are-header">
                    <div class="are-title">🎨 Advanced Rich Editor</div>
                    <div class="are-header-controls">
                        <button class="are-btn" id="theme-toggle" title="Toggle Theme">🌗</button>
                        <button class="are-btn" id="fullscreen-toggle" title="Fullscreen">⛶</button>
                        <button class="are-btn" id="save-btn" title="Save">💾</button>
                        <button class="are-btn" id="clear-btn" title="Clear All">🗑️</button>
                    </div>
                </div>

                <div class="are-toolbar">
                    <div class="are-group">
                        <button class="are-tool-btn" data-command="bold" title="Bold">𝐁</button>
                        <button class="are-tool-btn" data-command="italic" title="Italic">𝐼</button>
                        <button class="are-tool-btn" data-command="underline" title="Underline">U̲</button>
                        <button class="are-tool-btn" data-command="strikethrough" title="Strike">S̶</button>
                    </div>
                    <div class="are-group">
                        <select class="are-select" id="format-select">
                            <option value="">Normal</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                            <option value="h4">Heading 4</option>
                        </select>
                    </div>
                    <div class="are-group">
                        <button class="are-tool-btn" data-command="insertUnorderedList" title="Bullet List">•</button>
                        <button class="are-tool-btn" data-command="insertOrderedList" title="Numbered List">1.</button>
                        <button class="are-tool-btn" data-command="justifyLeft" title="Left">⬅</button>
                        <button class="are-tool-btn" data-command="justifyCenter" title="Center">↔</button>
                        <button class="are-tool-btn" data-command="justifyRight" title="Right">➡</button>
                    </div>
                    <div class="are-group">
                        <button class="are-tool-btn" id="insert-link" title="Link">🔗</button>
                        <button class="are-tool-btn" id="insert-image" title="Image">🖼️</button>
                        <button class="are-tool-btn" id="insert-table" title="Table">📊</button>
                        <button class="are-tool-btn" id="insert-hr" title="Divider">➖</button>
                    </div>
                    <div class="are-group">
                        <button class="are-tool-btn" data-command="undo" title="Undo">↶</button>
                        <button class="are-tool-btn" data-command="redo" title="Redo">↷</button>
                    </div>
                </div>

                <div class="are-content">
                    <div class="are-sidebar">
                        <div class="are-tab active" data-panel="templates" title="Templates">📄</div>
                        <div class="are-tab" data-panel="blocks" title="Blocks">🧩</div>
                        <div class="are-tab" data-panel="export" title="Export">📤</div>
                        <div class="are-tab" data-panel="settings" title="Settings">⚙️</div>
                    </div>

                    <div class="are-editor-area">
                        <div id="editorjs" class="are-editor"></div>
                    </div>

                    <div class="are-panel">
                        <!-- Templates Panel -->
                        <div class="are-panel-content active" id="templates-panel">
                            <h3>📄 Templates</h3>
                            <div class="are-template-grid">
                                <div class="are-template" data-template="blog">
                                    <div class="template-icon">📝</div>
                                    <div class="template-name">Blog Post</div>
                                </div>
                                <div class="are-template" data-template="article">
                                    <div class="template-icon">📰</div>
                                    <div class="template-name">Article</div>
                                </div>
                                <div class="are-template" data-template="newsletter">
                                    <div class="template-icon">📧</div>
                                    <div class="template-name">Newsletter</div>
                                </div>
                                <div class="are-template" data-template="docs">
                                    <div class="template-icon">📋</div>
                                    <div class="template-name">Documentation</div>
                                </div>
                            </div>
                        </div>

                        <!-- Blocks Panel -->
                        <div class="are-panel-content" id="blocks-panel">
                            <h3>🧩 Content Blocks</h3>
                            <div class="are-blocks-grid">
                                <div class="are-block" data-block="header">
                                    <div class="block-icon">📰</div>
                                    <div class="block-name">Header</div>
                                </div>
                                <div class="are-block" data-block="paragraph">
                                    <div class="block-icon">📝</div>
                                    <div class="block-name">Paragraph</div>
                                </div>
                                <div class="are-block" data-block="list">
                                    <div class="block-icon">📋</div>
                                    <div class="block-name">List</div>
                                </div>
                                <div class="are-block" data-block="quote">
                                    <div class="block-icon">💬</div>
                                    <div class="block-name">Quote</div>
                                </div>
                                <div class="are-block" data-block="code">
                                    <div class="block-icon">💻</div>
                                    <div class="block-name">Code</div>
                                </div>
                                <div class="are-block" data-block="image">
                                    <div class="block-icon">🖼️</div>
                                    <div class="block-name">Image</div>
                                </div>
                            </div>
                        </div>

                        <!-- Export Panel -->
                        <div class="are-panel-content" id="export-panel">
                            <h3>📤 Export Content</h3>
                            <div class="are-export-grid">
                                <button class="are-export-btn" data-format="html">
                                    <div class="export-icon">📄</div>
                                    <div class="export-name">HTML</div>
                                </button>
                                <button class="are-export-btn" data-format="markdown">
                                    <div class="export-icon">📝</div>
                                    <div class="export-name">Markdown</div>
                                </button>
                                <button class="are-export-btn" data-format="text">
                                    <div class="export-icon">📋</div>
                                    <div class="export-name">Plain Text</div>
                                </button>
                                <button class="are-export-btn" data-format="json">
                                    <div class="export-icon">🔧</div>
                                    <div class="export-name">JSON</div>
                                </button>
                                <button class="are-export-btn" data-format="copy">
                                    <div class="export-icon">📋</div>
                                    <div class="export-name">Copy</div>
                                </button>
                                <button class="are-export-btn" data-format="print">
                                    <div class="export-icon">🖨️</div>
                                    <div class="export-name">Print</div>
                                </button>
                            </div>
                        </div>

                        <!-- Settings Panel -->
                        <div class="are-panel-content" id="settings-panel">
                            <h3>⚙️ Settings</h3>
                            <div class="are-settings">
                                <div class="setting-group">
                                    <label>Editor Mode</label>
                                    <select id="editor-mode" class="are-select">
                                        <option value="auto">Auto (Try Editor.js)</option>
                                        <option value="simple">Simple Editor</option>
                                    </select>
                                </div>
                                <div class="setting-group">
                                    <label>Theme</label>
                                    <select id="editor-theme" class="are-select">
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                                <div class="setting-group">
                                    <button class="are-btn-primary" id="reset-editor">Reset Editor</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="are-status-bar">
                    <span id="editor-mode-status">Mode: Loading...</span>
                    <span id="word-count">Words: 0</span>
                    <span id="char-count">Characters: 0</span>
                    <span id="last-saved">Ready</span>
                </div>

                <div class="are-loading" id="loading">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading Editor...</div>
                </div>
            </div>
        `;
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .are-container {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 20px;
                box-shadow: 20px 20px 60px #d1d1d4, -20px -20px 60px #ffffff;
                padding: 20px;
                min-height: 600px;
                transition: all 0.3s ease;
                position: relative;
            }

            .are-container.dark {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: 20px 20px 60px #0f0f0f, -20px -20px 60px #3a3a3a;
                color: #e0e0e0;
            }

            .are-container.fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                max-width: none;
                border-radius: 0;
                z-index: 9999;
            }

            .are-loading {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: inherit;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 20px;
                z-index: 1000;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #e0e0e0;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-text {
                font-size: 16px;
                color: #667eea;
                font-weight: 500;
            }

            .are-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 15px 20px;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 5px 5px 10px #d1d1d4, inset -5px -5px 10px #ffffff;
            }

            .are-container.dark .are-header {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 5px 5px 10px #0f0f0f, inset -5px -5px 10px #3a3a3a;
            }

            .are-title {
                font-size: 24px;
                font-weight: 600;
                background: linear-gradient(45deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .are-header-controls {
                display: flex;
                gap: 10px;
            }

            .are-btn, .are-tool-btn, .are-btn-primary {
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border: none;
                border-radius: 12px;
                padding: 10px 15px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 5px 5px 10px #d1d1d4, -5px -5px 10px #ffffff;
                font-size: 14px;
                color: #333;
                min-width: 40px;
            }

            .are-container.dark .are-btn,
            .are-container.dark .are-tool-btn,
            .are-container.dark .are-btn-primary {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: 5px 5px 10px #0f0f0f, -5px -5px 10px #3a3a3a;
                color: #e0e0e0;
            }

            .are-btn:hover, .are-tool-btn:hover {
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
                transform: translateY(1px);
            }

            .are-container.dark .are-btn:hover,
            .are-container.dark .are-tool-btn:hover {
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
            }

            .are-btn-primary {
                background: linear-gradient(145deg, #667eea, #764ba2);
                color: white;
                box-shadow: 5px 5px 15px rgba(102, 126, 234, 0.3);
            }

            .are-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 20px;
                padding: 15px;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 3px 3px 8px #d1d1d4, inset -3px -3px 8px #ffffff;
            }

            .are-container.dark .are-toolbar {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 3px 3px 8px #0f0f0f, inset -3px -3px 8px #3a3a3a;
            }

            .are-group {
                display: flex;
                gap: 5px;
                align-items: center;
                padding: 5px;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                border-radius: 10px;
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
            }

            .are-container.dark .are-group {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: 2px 2px 5px #0f0f0f, -2px -2px 5px #3a3a3a;
            }

            .are-select {
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
                color: #333;
                min-width: 120px;
            }

            .are-container.dark .are-select {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
                color: #e0e0e0;
            }

            .are-content {
                display: flex;
                gap: 20px;
                min-height: 400px;
            }

            .are-sidebar {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 10px;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 3px 3px 8px #d1d1d4, inset -3px -3px 8px #ffffff;
                width: 60px;
            }

            .are-container.dark .are-sidebar {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 3px 3px 8px #0f0f0f, inset -3px -3px 8px #3a3a3a;
            }

            .are-tab {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
                font-size: 16px;
            }

            .are-container.dark .are-tab {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: 2px 2px 5px #0f0f0f, -2px -2px 5px #3a3a3a;
            }

            .are-tab.active {
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
                background: linear-gradient(145deg, #667eea, #764ba2);
            }

            .are-container.dark .are-tab.active {
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
            }

            .are-editor-area {
                flex: 1;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 5px 5px 15px #d1d1d4, inset -5px -5px 15px #ffffff;
                padding: 20px;
            }

            .are-container.dark .are-editor-area {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 5px 5px 15px #0f0f0f, inset -5px -5px 15px #3a3a3a;
            }

            .are-editor {
                min-height: 400px;
                background: transparent;
                border: none;
                outline: none;
                line-height: 1.6;
                font-size: 16px;
                color: inherit;
            }

            .simple-editor {
                min-height: 400px;
                background: transparent;
                border: none;
                outline: none;
                line-height: 1.6;
                font-size: 16px;
                color: inherit;
                padding: 0;
            }

            .simple-editor h1, .simple-editor h2, .simple-editor h3,
            .simple-editor h4, .simple-editor h5, .simple-editor h6 {
                margin: 1em 0 0.5em 0;
                color: inherit;
            }

            .simple-editor p {
                margin: 0.5em 0;
            }

            .simple-editor ul, .simple-editor ol {
                margin: 0.5em 0;
                padding-left: 2em;
            }

            .are-panel {
                width: 300px;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 3px 3px 8px #d1d1d4, inset -3px -3px 8px #ffffff;
                padding: 20px;
                overflow-y: auto;
            }

            .are-container.dark .are-panel {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 3px 3px 8px #0f0f0f, inset -3px -3px 8px #3a3a3a;
            }

            .are-panel-content {
                display: none;
            }

            .are-panel-content.active {
                display: block;
            }

            .are-panel-content h3 {
                margin: 0 0 15px 0;
                color: inherit;
            }

            .are-template-grid, .are-blocks-grid, .are-export-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin: 15px 0;
            }

            .are-template, .are-block, .are-export-btn {
                padding: 15px 10px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
                transition: all 0.2s ease;
                color: #333;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }

            .are-container.dark .are-template,
            .are-container.dark .are-block,
            .are-container.dark .are-export-btn {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: 2px 2px 5px #0f0f0f, -2px -2px 5px #3a3a3a;
                color: #e0e0e0;
            }

            .are-template:hover, .are-block:hover, .are-export-btn:hover {
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
            }

            .are-container.dark .are-template:hover,
            .are-container.dark .are-block:hover,
            .are-container.dark .are-export-btn:hover {
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
            }

            .template-icon, .block-icon, .export-icon {
                font-size: 20px;
            }

            .template-name, .block-name, .export-name {
                font-size: 11px;
                font-weight: 500;
            }

            .are-settings {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .setting-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .setting-group label {
                font-size: 14px;
                font-weight: 500;
                color: inherit;
            }

            .are-status-bar {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                padding: 10px 20px;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
                font-size: 12px;
                color: #666;
                flex-wrap: wrap;
                gap: 10px;
            }

            .are-container.dark .are-status-bar {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
                color: #999;
            }

            /* Editor.js overrides */
            .codex-editor {
                background: transparent !important;
            }

            .codex-editor__redactor {
                background: transparent !important;
                padding: 0 !important;
            }

            .ce-block__content {
                background: transparent !important;
            }

            @media (max-width: 768px) {
                .are-content {
                    flex-direction: column;
                }
                
                .are-sidebar {
                    flex-direction: row;
                    width: auto;
                    height: 60px;
                }
                
                .are-panel {
                    width: auto;
                }
                
                .are-toolbar {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .are-group {
                    justify-content: center;
                }
            }
        `;
        this.appendChild(style);
    }

    setupEventListeners() {
        // Header controls
        this.addEventListener('click', (e) => {
            switch (e.target.id) {
                case 'theme-toggle':
                    this.toggleTheme();
                    break;
                case 'fullscreen-toggle':
                    this.toggleFullscreen();
                    break;
                case 'save-btn':
                    this.saveContent();
                    break;
                case 'clear-btn':
                    this.clearContent();
                    break;
                case 'reset-editor':
                    this.resetEditor();
                    break;
            }

            // Toolbar commands (for simple editor)
            const command = e.target.dataset.command;
            if (command && this.useSimpleEditor) {
                this.execCommand(command);
            }

            // Special buttons
            if (e.target.id === 'insert-link') this.insertLink();
            if (e.target.id === 'insert-image') this.insertImage();
            if (e.target.id === 'insert-table') this.insertTable();
            if (e.target.id === 'insert-hr') this.insertHR();

            // Panel tabs
            if (e.target.classList.contains('are-tab')) {
                this.switchPanel(e.target.dataset.panel);
            }

            // Templates
            if (e.target.classList.contains('are-template')) {
                this.loadTemplate(e.target.dataset.template);
            }

            // Blocks (for Editor.js)
            if (e.target.classList.contains('are-block') && !this.useSimpleEditor) {
                this.addBlock(e.target.dataset.block);
            }

            // Export
            if (e.target.classList.contains('are-export-btn')) {
                this.exportContent(e.target.dataset.format);
            }
        });

        // Format select
        this.querySelector('#format-select').addEventListener('change', (e) => {
            if (this.useSimpleEditor && e.target.value) {
                this.execCommand('formatBlock', '<' + e.target.value + '>');
            }
        });

        // Settings
        this.querySelector('#editor-theme').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        this.querySelector('#editor-mode').addEventListener('change', (e) => {
            if (e.target.value === 'simple') {
                this.useSimpleEditor = true;
                this.initializeSimpleEditor();
            }
        });
    }

    // Simple editor commands
    execCommand(command, value = null) {
        if (!this.useSimpleEditor) return;
        document.execCommand(command, false, value);
        this.simpleEditor.focus();
    }

    insertLink() {
        const url = prompt('Enter URL:');
        if (url) {
            if (this.useSimpleEditor) {
                this.execCommand('createLink', url);
            }
        }
    }

    insertImage() {
        const url = prompt('Enter image URL:');
        if (url) {
            if (this.useSimpleEditor) {
                this.execCommand('insertImage', url);
            }
        }
    }

    insertTable() {
        if (this.useSimpleEditor) {
            const html = `
                <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
                    <tr>
                        <th style="padding: 8px; background: #f0f0f0;">Header 1</th>
                        <th style="padding: 8px; background: #f0f0f0;">Header 2</th>
                        <th style="padding: 8px; background: #f0f0f0;">Header 3</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px;">Cell 1</td>
                        <td style="padding: 8px;">Cell 2</td>
                        <td style="padding: 8px;">Cell 3</td>
                    </tr>
                </table>
            `;
            this.execCommand('insertHTML', html);
        }
    }

    insertHR() {
        if (this.useSimpleEditor) {
            this.execCommand('insertHTML', '<hr style="margin: 20px 0;">');
        }
    }

    async addBlock(type) {
        if (this.useSimpleEditor || !this.editor) return;

        try {
            const index = await this.editor.blocks.getCurrentBlockIndex();
            await this.editor.blocks.insert(type, {}, {}, index + 1);
        } catch (error) {
            console.error('Error adding block:', error);
        }
    }

    switchPanel(panelName) {
        // Update tabs
        this.querySelectorAll('.are-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        this.querySelector(`[data-panel="${panelName}"]`).classList.add('active');
        
        // Update panels
        this.querySelectorAll('.are-panel-content').forEach(panel => {
            panel.classList.remove('active');
        });
        this.querySelector(`#${panelName}-panel`).classList.add('active');
    }

    loadTemplate(templateName) {
        const templates = {
            blog: `<h1>Blog Post Title</h1>
                <p><em>Published on ${new Date().toLocaleDateString()}</em></p>
                <p>Start your blog post with an engaging opening...</p>
                <h2>Main Content</h2>
                <p>Develop your ideas here...</p>
                <h2>Conclusion</h2>
                <p>Wrap up with a strong conclusion...</p>`,
            
            article: `<h1>Article Headline</h1>
                <p><strong>By Author Name</strong> - ${new Date().toLocaleDateString()}</p>
                <p><strong>Lead:</strong> A compelling opening paragraph...</p>
                <p>The body of your article continues here...</p>`,
            
            newsletter: `<h1>📧 Newsletter Title</h1>
                <p><strong>Issue #1 - ${new Date().toLocaleDateString()}</strong></p>
                <h2>📰 Top Stories</h2>
                <ul><li>Important news item #1</li><li>Key update #2</li></ul>
                <h2>🔥 Featured Content</h2>
                <p>Showcase your best content here...</p>`,
            
            docs: `<h1>Documentation Title</h1>
                <h2>Overview</h2>
                <p>Brief overview of what this covers...</p>
                <h2>Getting Started</h2>
                <ol><li>Step one</li><li>Step two</li><li>Step three</li></ol>`
        };

        if (templates[templateName]) {
            if (this.useSimpleEditor && this.simpleEditor) {
                this.simpleEditor.innerHTML = templates[templateName];
                this.updateStats();
            } else if (this.editor) {
                // For Editor.js, we'd need to convert HTML to blocks
                // For now, just show a message
                this.showStatus('Template loaded in simple mode');
            }
        }
    }

    async exportContent(format) {
        let content = '';

        if (this.useSimpleEditor && this.simpleEditor) {
            content = this.simpleEditor.innerHTML;
        } else if (this.editor) {
            try {
                const data = await this.editor.save();
                content = JSON.stringify(data, null, 2);
            } catch (error) {
                console.error('Export error:', error);
                this.showStatus('Export failed', 'error');
                return;
            }
        }

        switch (format) {
            case 'html':
                this.downloadFile(this.generateHTML(content), 'content.html', 'text/html');
                break;
            case 'markdown':
                this.downloadFile(this.htmlToMarkdown(content), 'content.md', 'text/markdown');
                break;
            case 'text':
                this.downloadFile(this.stripHTML(content), 'content.txt', 'text/plain');
                break;
            case 'json':
                this.downloadFile(content, 'content.json', 'application/json');
                break;
            case 'copy':
                this.copyToClipboard(content);
                break;
            case 'print':
                this.printContent(content);
                break;
        }

        this.showStatus(`Exported as ${format.toUpperCase()}`, 'success');
    }

    generateHTML(content) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Content</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 2em; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    }

    htmlToMarkdown(html) {
        let markdown = html;
        markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => '#'.repeat(parseInt(level)) + ' ' + text + '\n\n');
        markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
        markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
        markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
        markdown = markdown.replace(/<br[^>]*>/gi, '\n');
        markdown = markdown.replace(/<[^>]*>/g, '');
        return markdown.trim();
    }

    updateStats() {
        let text = '';
        
        if (this.useSimpleEditor && this.simpleEditor) {
            text = this.simpleEditor.textContent || '';
            this.querySelector('#editor-mode-status').textContent = 'Mode: Simple Editor';
        } else if (this.editor) {
            // For Editor.js, we'd need to get text from blocks
            this.querySelector('#editor-mode-status').textContent = 'Mode: Editor.js';
        } else {
            this.querySelector('#editor-mode-status').textContent = 'Mode: Loading...';
            return;
        }

        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;

        this.querySelector('#word-count').textContent = `Words: ${words}`;
        this.querySelector('#char-count').textContent = `Characters: ${chars}`;
    }

    saveState() {
        if (this.useSimpleEditor && this.simpleEditor) {
            this.undoStack.push(this.simpleEditor.innerHTML);
            if (this.undoStack.length > 50) {
                this.undoStack.shift();
            }
            this.redoStack = [];
        }
    }

    undo() {
        if (this.useSimpleEditor && this.undoStack.length > 1) {
            const current = this.undoStack.pop();
            this.redoStack.push(current);
            this.simpleEditor.innerHTML = this.undoStack[this.undoStack.length - 1];
            this.updateStats();
        }
    }

    redo() {
        if (this.useSimpleEditor && this.redoStack.length > 0) {
            const state = this.redoStack.pop();
            this.undoStack.push(state);
            this.simpleEditor.innerHTML = state;
            this.updateStats();
        }
    }

    async saveContent() {
        this.showStatus('Content saved', 'success');
    }

    async clearContent() {
        if (confirm('Clear all content?')) {
            if (this.useSimpleEditor && this.simpleEditor) {
                this.simpleEditor.innerHTML = '<p>Start writing...</p>';
            } else if (this.editor) {
                await this.editor.clear();
            }
            this.updateStats();
        }
    }

    resetEditor() {
        location.reload();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(this.currentTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        this.querySelector('.are-container').classList.toggle('dark', theme === 'dark');
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        this.querySelector('.are-container').classList.toggle('fullscreen', this.isFullscreen);
        
        if (this.isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    copyToClipboard(content) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content).then(() => {
                this.showStatus('Copied to clipboard!');
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showStatus('Copied to clipboard!');
        }
    }

    printContent(content) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generateHTML(content));
        printWindow.document.close();
        printWindow.print();
    }

    showStatus(message, type = 'info', duration = 3000) {
        this.querySelector('#last-saved').textContent = message;
        setTimeout(() => {
            this.querySelector('#last-saved').textContent = 'Ready';
        }, duration);
    }

    stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
}

// Register the custom element
customElements.define('advanced-rich-editor', AdvancedRichEditor);
