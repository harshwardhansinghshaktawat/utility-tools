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
        this.isLibrariesLoaded = false;
    }

    connectedCallback() {
        this.innerHTML = this.getHTML();
        this.addStyles();
        this.loadLibraries().then(() => {
            this.initializeEditor();
            this.setupEventListeners();
        });
    }

    async loadLibraries() {
        if (this.isLibrariesLoaded) return;

        // Load Editor.js core
        await this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest');
        
        // Load Editor.js plugins
        await Promise.all([
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/header@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/list@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/image@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/link@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/quote@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/code@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/delimiter@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/table@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/embed@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/marker@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/inline-code@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/checklist@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/warning@latest'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@editorjs/raw@latest')
        ]);

        this.isLibrariesLoaded = true;
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

                <div class="are-content">
                    <div class="are-sidebar">
                        <div class="are-tab active" data-panel="templates" title="Templates">📄</div>
                        <div class="are-tab" data-panel="blocks" title="Blocks">🧩</div>
                        <div class="are-tab" data-panel="export" title="Export">📤</div>
                        <div class="are-tab" data-panel="settings" title="Settings">⚙️</div>
                    </div>

                    <div class="are-editor-area">
                        <div class="are-editor-toolbar">
                            <button class="are-tool-btn" id="add-header" title="Add Header">📰</button>
                            <button class="are-tool-btn" id="add-list" title="Add List">📝</button>
                            <button class="are-tool-btn" id="add-quote" title="Add Quote">💬</button>
                            <button class="are-tool-btn" id="add-code" title="Add Code">💻</button>
                            <button class="are-tool-btn" id="add-image" title="Add Image">🖼️</button>
                            <button class="are-tool-btn" id="add-link" title="Add Link">🔗</button>
                            <button class="are-tool-btn" id="add-table" title="Add Table">📊</button>
                            <button class="are-tool-btn" id="add-embed" title="Add Embed">📺</button>
                        </div>
                        <div class="are-editor-container">
                            <div id="editorjs" class="are-editor"></div>
                        </div>
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
                                    <div class="template-name">News Article</div>
                                </div>
                                <div class="are-template" data-template="newsletter">
                                    <div class="template-icon">📧</div>
                                    <div class="template-name">Newsletter</div>
                                </div>
                                <div class="are-template" data-template="documentation">
                                    <div class="template-icon">📋</div>
                                    <div class="template-name">Documentation</div>
                                </div>
                                <div class="are-template" data-template="tutorial">
                                    <div class="template-icon">🎓</div>
                                    <div class="template-name">Tutorial</div>
                                </div>
                                <div class="are-template" data-template="report">
                                    <div class="template-icon">📊</div>
                                    <div class="template-name">Report</div>
                                </div>
                            </div>
                        </div>

                        <!-- Blocks Panel -->
                        <div class="are-panel-content" id="blocks-panel">
                            <h3>🧩 Content Blocks</h3>
                            <div class="are-blocks-grid">
                                <div class="are-block" data-block="paragraph">
                                    <div class="block-icon">📝</div>
                                    <div class="block-name">Paragraph</div>
                                </div>
                                <div class="are-block" data-block="header">
                                    <div class="block-icon">📰</div>
                                    <div class="block-name">Header</div>
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
                                <div class="are-block" data-block="table">
                                    <div class="block-icon">📊</div>
                                    <div class="block-name">Table</div>
                                </div>
                                <div class="are-block" data-block="embed">
                                    <div class="block-icon">📺</div>
                                    <div class="block-name">Embed</div>
                                </div>
                                <div class="are-block" data-block="image">
                                    <div class="block-icon">🖼️</div>
                                    <div class="block-name">Image</div>
                                </div>
                                <div class="are-block" data-block="delimiter">
                                    <div class="block-icon">➖</div>
                                    <div class="block-name">Divider</div>
                                </div>
                                <div class="are-block" data-block="warning">
                                    <div class="block-icon">⚠️</div>
                                    <div class="block-name">Warning</div>
                                </div>
                                <div class="are-block" data-block="checklist">
                                    <div class="block-icon">✅</div>
                                    <div class="block-name">Checklist</div>
                                </div>
                                <div class="are-block" data-block="raw">
                                    <div class="block-icon">🔧</div>
                                    <div class="block-name">Raw HTML</div>
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
                                <button class="are-export-btn" data-format="json">
                                    <div class="export-icon">🔧</div>
                                    <div class="export-name">JSON</div>
                                </button>
                                <button class="are-export-btn" data-format="text">
                                    <div class="export-icon">📋</div>
                                    <div class="export-name">Plain Text</div>
                                </button>
                                <button class="are-export-btn" data-format="pdf">
                                    <div class="export-icon">📕</div>
                                    <div class="export-name">PDF</div>
                                </button>
                                <button class="are-export-btn" data-format="copy">
                                    <div class="export-icon">📋</div>
                                    <div class="export-name">Copy</div>
                                </button>
                            </div>
                            <div class="are-export-options">
                                <label class="are-checkbox">
                                    <input type="checkbox" id="include-styles" checked>
                                    <span class="checkmark"></span>
                                    Include Styles
                                </label>
                                <label class="are-checkbox">
                                    <input type="checkbox" id="include-metadata" checked>
                                    <span class="checkmark"></span>
                                    Include Metadata
                                </label>
                                <label class="are-checkbox">
                                    <input type="checkbox" id="minify-output">
                                    <span class="checkmark"></span>
                                    Minify Output
                                </label>
                            </div>
                        </div>

                        <!-- Settings Panel -->
                        <div class="are-panel-content" id="settings-panel">
                            <h3>⚙️ Editor Settings</h3>
                            <div class="are-settings">
                                <div class="setting-group">
                                    <label>Editor Theme</label>
                                    <select id="editor-theme" class="are-select">
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                                <div class="setting-group">
                                    <label>Auto-save</label>
                                    <label class="are-checkbox">
                                        <input type="checkbox" id="auto-save" checked>
                                        <span class="checkmark"></span>
                                        Enable auto-save
                                    </label>
                                </div>
                                <div class="setting-group">
                                    <label>Save Interval</label>
                                    <select id="save-interval" class="are-select">
                                        <option value="30">30 seconds</option>
                                        <option value="60">1 minute</option>
                                        <option value="300">5 minutes</option>
                                        <option value="600">10 minutes</option>
                                    </select>
                                </div>
                                <div class="setting-group">
                                    <button class="are-btn-primary" id="reset-settings">Reset to Default</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="are-status-bar">
                    <span id="block-count">Blocks: 0</span>
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
                max-width: 1400px;
                margin: 0 auto;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 20px;
                box-shadow: 20px 20px 60px #d1d1d4, -20px -20px 60px #ffffff;
                padding: 20px;
                min-height: 700px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
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

            .are-loading.hidden {
                display: none;
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
                display: flex;
                align-items: center;
                justify-content: center;
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

            .are-content {
                display: flex;
                gap: 20px;
                min-height: 500px;
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
                display: flex;
                flex-direction: column;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 5px 5px 15px #d1d1d4, inset -5px -5px 15px #ffffff;
                overflow: hidden;
            }

            .are-container.dark .are-editor-area {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 5px 5px 15px #0f0f0f, inset -5px -5px 15px #3a3a3a;
            }

            .are-editor-toolbar {
                display: flex;
                gap: 8px;
                padding: 15px 20px;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                flex-wrap: wrap;
            }

            .are-container.dark .are-editor-toolbar {
                border-bottom: 1px solid rgba(255,255,255,0.1);
                background: rgba(0,0,0,0.1);
            }

            .are-editor-container {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }

            .are-editor {
                min-height: 400px;
                background: transparent;
                border-radius: 10px;
            }

            /* Editor.js Customization */
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

            .ce-toolbar__plus,
            .ce-toolbar__settings-btn {
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9) !important;
                box-shadow: 3px 3px 8px #d1d1d4, -3px -3px 8px #ffffff !important;
                border: none !important;
                color: #333 !important;
            }

            .are-container.dark .ce-toolbar__plus,
            .are-container.dark .ce-toolbar__settings-btn {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a) !important;
                box-shadow: 3px 3px 8px #0f0f0f, -3px -3px 8px #3a3a3a !important;
                color: #e0e0e0 !important;
            }

            .ce-popover {
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9) !important;
                box-shadow: 10px 10px 30px #d1d1d4, -10px -10px 30px #ffffff !important;
                border: none !important;
                border-radius: 12px !important;
            }

            .are-container.dark .ce-popover {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a) !important;
                box-shadow: 10px 10px 30px #0f0f0f, -10px -10px 30px #3a3a3a !important;
            }

            .ce-popover-item {
                background: transparent !important;
                color: inherit !important;
                border-radius: 8px !important;
                margin: 2px !important;
            }

            .ce-popover-item:hover {
                background: rgba(102, 126, 234, 0.1) !important;
            }

            .are-panel {
                width: 320px;
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
                margin: 0 0 20px 0;
                color: inherit;
                font-size: 18px;
                font-weight: 600;
            }

            .are-template-grid, .are-blocks-grid, .are-export-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin: 20px 0;
            }

            .are-template, .are-block, .are-export-btn {
                padding: 20px 15px;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                box-shadow: 5px 5px 15px #d1d1d4, -5px -5px 15px #ffffff;
                transition: all 0.2s ease;
                color: #333;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .are-container.dark .are-template,
            .are-container.dark .are-block,
            .are-container.dark .are-export-btn {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: 5px 5px 15px #0f0f0f, -5px -5px 15px #3a3a3a;
                color: #e0e0e0;
            }

            .are-template:hover, .are-block:hover, .are-export-btn:hover {
                box-shadow: inset 3px 3px 8px #d1d1d4, inset -3px -3px 8px #ffffff;
                transform: translateY(2px);
            }

            .are-container.dark .are-template:hover,
            .are-container.dark .are-block:hover,
            .are-container.dark .are-export-btn:hover {
                box-shadow: inset 3px 3px 8px #0f0f0f, inset -3px -3px 8px #3a3a3a;
            }

            .template-icon, .block-icon, .export-icon {
                font-size: 24px;
                margin-bottom: 5px;
            }

            .template-name, .block-name, .export-name {
                font-size: 12px;
                font-weight: 500;
            }

            .are-export-options {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(0,0,0,0.1);
            }

            .are-container.dark .are-export-options {
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .are-checkbox {
                display: flex;
                align-items: center;
                margin: 12px 0;
                font-size: 14px;
                cursor: pointer;
                position: relative;
                padding-left: 30px;
            }

            .are-checkbox input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
            }

            .checkmark {
                position: absolute;
                left: 0;
                height: 20px;
                width: 20px;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 5px;
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
            }

            .are-container.dark .checkmark {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
            }

            .are-checkbox input:checked ~ .checkmark {
                background: linear-gradient(145deg, #667eea, #764ba2);
                box-shadow: 2px 2px 5px rgba(102, 126, 234, 0.3);
            }

            .checkmark:after {
                content: "";
                position: absolute;
                display: none;
                left: 7px;
                top: 3px;
                width: 5px;
                height: 10px;
                border: solid white;
                border-width: 0 3px 3px 0;
                transform: rotate(45deg);
            }

            .are-checkbox input:checked ~ .checkmark:after {
                display: block;
            }

            .are-settings {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .setting-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .setting-group label {
                font-size: 14px;
                font-weight: 500;
                color: inherit;
            }

            .are-select {
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border: none;
                border-radius: 8px;
                padding: 10px 12px;
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
                color: #333;
                font-size: 14px;
                cursor: pointer;
            }

            .are-container.dark .are-select {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
                color: #e0e0e0;
            }

            .are-status-bar {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                padding: 12px 20px;
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

            @media (max-width: 1024px) {
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
                    max-height: 300px;
                }

                .are-template-grid, .are-blocks-grid, .are-export-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            @media (max-width: 768px) {
                .are-container {
                    padding: 15px;
                }

                .are-header-controls {
                    flex-wrap: wrap;
                }

                .are-editor-toolbar {
                    padding: 10px 15px;
                }

                .are-template-grid, .are-blocks-grid, .are-export-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .are-status-bar {
                    font-size: 11px;
                    padding: 8px 15px;
                }
            }
        `;
        this.appendChild(style);
    }

    async initializeEditor() {
        try {
            // Hide loading screen after a brief moment to show it loaded
            setTimeout(() => {
                this.querySelector('#loading').classList.add('hidden');
            }, 1000);

            // Initialize Editor.js
            this.editor = new EditorJS({
                holder: 'editorjs',
                placeholder: 'Start writing your amazing content...',
                autofocus: true,
                tools: {
                    header: {
                        class: Header,
                        config: {
                            placeholder: 'Enter a header',
                            levels: [1, 2, 3, 4, 5, 6],
                            defaultLevel: 2
                        }
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                        config: {
                            defaultStyle: 'unordered'
                        }
                    },
                    checklist: {
                        class: Checklist,
                        inlineToolbar: true,
                    },
                    quote: {
                        class: Quote,
                        inlineToolbar: true,
                        shortcut: 'CMD+SHIFT+O',
                        config: {
                            quotePlaceholder: 'Enter a quote',
                            captionPlaceholder: 'Quote author',
                        },
                    },
                    warning: Warning,
                    marker: {
                        class: Marker,
                        shortcut: 'CMD+SHIFT+M',
                    },
                    code: {
                        class: CodeTool,
                        shortcut: 'CMD+SHIFT+C',
                    },
                    delimiter: Delimiter,
                    inlineCode: {
                        class: InlineCode,
                        shortcut: 'CMD+SHIFT+M',
                    },
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: 'https://link-preview-api.herokuapp.com/v1/extract'
                        }
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            endpoints: {
                                byFile: 'https://httpbin.org/post',
                                byUrl: 'https://httpbin.org/post',
                            }
                        }
                    },
                    embed: {
                        class: Embed,
                        config: {
                            services: {
                                youtube: true,
                                coub: true,
                                codepen: true,
                                instagram: true,
                                twitter: true,
                                vimeo: true
                            }
                        }
                    },
                    table: {
                        class: Table,
                        inlineToolbar: true,
                        config: {
                            rows: 2,
                            cols: 3,
                        },
                    },
                    raw: RawTool,
                },
                data: {
                    blocks: [
                        {
                            type: "header",
                            data: {
                                text: "Welcome to Advanced Rich Editor!",
                                level: 1
                            }
                        },
                        {
                            type: "paragraph",
                            data: {
                                text: "This is a powerful block-styled editor built with Editor.js. Create amazing content with:"
                            }
                        },
                        {
                            type: "list",
                            data: {
                                style: "unordered",
                                items: [
                                    "Rich text blocks (headers, paragraphs, quotes)",
                                    "Media embeds (YouTube, Instagram, Twitter)",
                                    "Code blocks with syntax highlighting",
                                    "Tables, checklists, and warnings",
                                    "Multiple export formats (HTML, Markdown, JSON)",
                                    "Beautiful neumorphic design"
                                ]
                            }
                        },
                        {
                            type: "quote",
                            data: {
                                text: "Start creating your content by clicking the + button or use the sidebar tools!",
                                caption: "Advanced Rich Editor",
                                alignment: "left"
                            }
                        }
                    ]
                },
                onChange: () => {
                    this.updateStats();
                    this.autoSave();
                },
                onReady: () => {
                    this.updateStats();
                }
            });

        } catch (error) {
            console.error('Error initializing editor:', error);
            this.showStatus('Error loading editor', 'error');
        }
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
            }

            // Toolbar quick-add buttons
            if (e.target.classList.contains('are-tool-btn')) {
                this.addBlock(e.target.id.replace('add-', ''));
            }

            // Panel tabs
            if (e.target.classList.contains('are-tab')) {
                this.switchPanel(e.target.dataset.panel);
            }

            // Templates
            if (e.target.classList.contains('are-template')) {
                this.loadTemplate(e.target.dataset.template);
            }

            // Blocks
            if (e.target.classList.contains('are-block')) {
                this.addBlock(e.target.dataset.block);
            }

            // Export
            if (e.target.classList.contains('are-export-btn')) {
                this.exportContent(e.target.dataset.format);
            }

            // Settings
            if (e.target.id === 'reset-settings') {
                this.resetSettings();
            }
        });

        // Settings changes
        this.querySelector('#editor-theme').addEventListener('change', (e) => {
            if (e.target.value === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.setTheme(prefersDark ? 'dark' : 'light');
            } else {
                this.setTheme(e.target.value);
            }
        });

        // Auto-save toggle
        this.querySelector('#auto-save').addEventListener('change', (e) => {
            this.autoSaveEnabled = e.target.checked;
        });
    }

    async addBlock(type) {
        if (!this.editor) return;

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

    async loadTemplate(templateName) {
        if (!this.editor) return;

        const templates = {
            blog: {
                blocks: [
                    {
                        type: "header",
                        data: { text: "Blog Post Title", level: 1 }
                    },
                    {
                        type: "paragraph",
                        data: { text: `<i>Published on ${new Date().toLocaleDateString()}</i>` }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Start your blog post with an engaging opening that hooks your readers and makes them want to continue reading..." }
                    },
                    {
                        type: "header",
                        data: { text: "Main Content", level: 2 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Develop your main ideas here with compelling stories, insights, and valuable information for your audience..." }
                    },
                    {
                        type: "quote",
                        data: { text: "Remember to include engaging quotes or key takeaways that readers can share.", caption: "Pro Tip" }
                    },
                    {
                        type: "header",
                        data: { text: "Conclusion", level: 2 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Wrap up with a strong conclusion and clear call to action..." }
                    }
                ]
            },
            article: {
                blocks: [
                    {
                        type: "header",
                        data: { text: "Breaking News: Article Headline", level: 1 }
                    },
                    {
                        type: "paragraph",
                        data: { text: `<b>By Reporter Name</b> - ${new Date().toLocaleDateString()}` }
                    },
                    {
                        type: "paragraph",
                        data: { text: "<b>Lead:</b> A compelling opening paragraph that summarizes the key points of your news story and answers the basic who, what, when, where, and why questions..." }
                    },
                    {
                        type: "delimiter"
                    },
                    {
                        type: "paragraph",
                        data: { text: "The body of your article continues here with detailed information, quotes from sources, and additional context..." }
                    },
                    {
                        type: "quote",
                        data: { text: "Include relevant quotes from key sources or stakeholders.", caption: "Source Name" }
                    }
                ]
            },
            newsletter: {
                blocks: [
                    {
                        type: "header",
                        data: { text: "📧 Newsletter Title", level: 1 }
                    },
                    {
                        type: "paragraph",
                        data: { text: `<b>Issue #1 - ${new Date().toLocaleDateString()}</b>` }
                    },
                    {
                        type: "header",
                        data: { text: "📰 Top Stories", level: 2 }
                    },
                    {
                        type: "list",
                        data: {
                            style: "unordered",
                            items: [
                                "Important news item #1",
                                "Key update #2",
                                "Featured announcement #3"
                            ]
                        }
                    },
                    {
                        type: "header",
                        data: { text: "🔥 Featured Content", level: 2 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Showcase your best content, resources, or products here..." }
                    },
                    {
                        type: "header",
                        data: { text: "📅 Upcoming Events", level: 2 }
                    },
                    {
                        type: "table",
                        data: {
                            content: [
                                ["Event", "Date", "Location"],
                                ["Conference 2024", "March 15", "Virtual"],
                                ["Workshop", "March 22", "New York"]
                            ]
                        }
                    }
                ]
            },
            documentation: {
                blocks: [
                    {
                        type: "header",
                        data: { text: "Documentation Title", level: 1 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Brief overview of what this documentation covers..." }
                    },
                    {
                        type: "header",
                        data: { text: "Table of Contents", level: 2 }
                    },
                    {
                        type: "list",
                        data: {
                            style: "ordered",
                            items: [
                                "Getting Started",
                                "Installation",
                                "Configuration",
                                "Usage Examples",
                                "Troubleshooting"
                            ]
                        }
                    },
                    {
                        type: "header",
                        data: { text: "Getting Started", level: 2 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Step-by-step instructions to get started..." }
                    },
                    {
                        type: "code",
                        data: { code: "// Example code snippet\nconsole.log('Hello, World!');" }
                    },
                    {
                        type: "warning",
                        data: { title: "Important Note", message: "Always backup your data before making changes." }
                    }
                ]
            },
            tutorial: {
                blocks: [
                    {
                        type: "header",
                        data: { text: "🎓 How to: Tutorial Title", level: 1 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "In this tutorial, you'll learn how to..." }
                    },
                    {
                        type: "header",
                        data: { text: "What You'll Need", level: 2 }
                    },
                    {
                        type: "checklist",
                        data: {
                            items: [
                                { text: "Prerequisite #1", checked: false },
                                { text: "Prerequisite #2", checked: false },
                                { text: "Prerequisite #3", checked: false }
                            ]
                        }
                    },
                    {
                        type: "header",
                        data: { text: "Step 1: Getting Started", level: 2 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Detailed instructions for the first step..." }
                    },
                    {
                        type: "header",
                        data: { text: "Step 2: Next Action", level: 2 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Continue with the next step..." }
                    },
                    {
                        type: "quote",
                        data: { text: "Pro tip: Include helpful hints and best practices throughout your tutorial.", caption: "Tutorial Tip" }
                    }
                ]
            },
            report: {
                blocks: [
                    {
                        type: "header",
                        data: { text: "Executive Report", level: 1 }
                    },
                    {
                        type: "paragraph",
                        data: { text: `<b>Report Date:</b> ${new Date().toLocaleDateString()}<br><b>Prepared by:</b> [Your Name]` }
                    },
                    {
                        type: "header",
                        data: { text: "Executive Summary", level: 2 }
                    },
                    {
                        type: "paragraph",
                        data: { text: "Brief overview of key findings, conclusions, and recommendations..." }
                    },
                    {
                        type: "header",
                        data: { text: "Key Findings", level: 2 }
                    },
                    {
                        type: "list",
                        data: {
                            style: "ordered",
                            items: [
                                "Finding #1 with supporting data",
                                "Finding #2 with analysis",
                                "Finding #3 with implications"
                            ]
                        }
                    },
                    {
                        type: "header",
                        data: { text: "Recommendations", level: 2 }
                    },
                    {
                        type: "table",
                        data: {
                            content: [
                                ["Recommendation", "Priority", "Timeline"],
                                ["Action Item 1", "High", "Q1 2024"],
                                ["Action Item 2", "Medium", "Q2 2024"]
                            ]
                        }
                    }
                ]
            }
        };

        if (templates[templateName]) {
            await this.editor.clear();
            await this.editor.render(templates[templateName]);
            this.updateStats();
        }
    }

    async exportContent(format) {
        if (!this.editor) return;

        try {
            const data = await this.editor.save();
            const includeStyles = this.querySelector('#include-styles').checked;
            const includeMeta = this.querySelector('#include-metadata').checked;
            const minify = this.querySelector('#minify-output').checked;

            switch (format) {
                case 'json':
                    const jsonOutput = minify ? JSON.stringify(data) : JSON.stringify(data, null, 2);
                    this.downloadFile(jsonOutput, 'content.json', 'application/json');
                    break;
                case 'html':
                    const htmlOutput = await this.convertToHTML(data, includeStyles, includeMeta);
                    this.downloadFile(htmlOutput, 'content.html', 'text/html');
                    break;
                case 'markdown':
                    const markdownOutput = await this.convertToMarkdown(data);
                    this.downloadFile(markdownOutput, 'content.md', 'text/markdown');
                    break;
                case 'text':
                    const textOutput = await this.convertToText(data);
                    this.downloadFile(textOutput, 'content.txt', 'text/plain');
                    break;
                case 'pdf':
                    await this.exportToPDF(data);
                    break;
                case 'copy':
                    const htmlForCopy = await this.convertToHTML(data, includeStyles, false);
                    this.copyToClipboard(htmlForCopy);
                    break;
            }

            this.showStatus(`Exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showStatus('Export failed', 'error');
        }
    }

    async convertToHTML(data, includeStyles = true, includeMeta = true) {
        let html = '';
        
        if (includeMeta) {
            html += '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
            html += '<meta charset="UTF-8">\n';
            html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
            html += '<title>Exported Content</title>\n';
            
            if (includeStyles) {
                html += '<style>\n';
                html += 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }\n';
                html += 'h1, h2, h3, h4, h5, h6 { color: #2c3e50; margin-top: 2em; margin-bottom: 0.5em; }\n';
                html += 'h1 { font-size: 2.5em; }\n';
                html += 'h2 { font-size: 2em; }\n';
                html += 'h3 { font-size: 1.5em; }\n';
                html += 'p { margin: 1em 0; }\n';
                html += 'blockquote { margin: 1em 0; padding: 1em; background: #f8f9fa; border-left: 4px solid #667eea; font-style: italic; }\n';
                html += 'code { background: #f1f3f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: "Monaco", "Courier New", monospace; }\n';
                html += 'pre { background: #f1f3f4; padding: 1em; border-radius: 5px; overflow-x: auto; }\n';
                html += 'table { border-collapse: collapse; width: 100%; margin: 1em 0; }\n';
                html += 'th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }\n';
                html += 'th { background-color: #f8f9fa; font-weight: 600; }\n';
                html += 'ul, ol { margin: 1em 0; padding-left: 2em; }\n';
                html += 'li { margin: 0.5em 0; }\n';
                html += '.warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 1em; margin: 1em 0; }\n';
                html += '.warning-title { font-weight: bold; color: #856404; }\n';
                html += 'img { max-width: 100%; height: auto; border-radius: 5px; }\n';
                html += '</style>\n';
            }
            
            html += `<meta name="generator" content="Advanced Rich Editor">\n`;
            html += `<meta name="exported" content="${new Date().toISOString()}">\n`;
            html += '</head>\n<body>\n';
        }

        for (const block of data.blocks) {
            html += this.blockToHTML(block) + '\n';
        }

        if (includeMeta) {
            html += '\n</body>\n</html>';
        }

        return html;
    }

    blockToHTML(block) {
        switch (block.type) {
            case 'header':
                return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
            case 'paragraph':
                return `<p>${block.data.text}</p>`;
            case 'list':
                const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                const items = block.data.items.map(item => `<li>${item}</li>`).join('');
                return `<${tag}>${items}</${tag}>`;
            case 'checklist':
                const checkItems = block.data.items.map(item => 
                    `<li><input type="checkbox" ${item.checked ? 'checked' : ''}> ${item.text}</li>`
                ).join('');
                return `<ul style="list-style: none;">${checkItems}</ul>`;
            case 'quote':
                return `<blockquote><p>${block.data.text}</p>${block.data.caption ? `<footer>— ${block.data.caption}</footer>` : ''}</blockquote>`;
            case 'code':
                return `<pre><code>${this.escapeHtml(block.data.code)}</code></pre>`;
            case 'warning':
                return `<div class="warning"><div class="warning-title">${block.data.title}</div><p>${block.data.message}</p></div>`;
            case 'delimiter':
                return '<hr>';
            case 'table':
                if (!block.data.content || !block.data.content.length) return '';
                const rows = block.data.content.map((row, index) => {
                    const cells = row.map(cell => index === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`).join('');
                    return `<tr>${cells}</tr>`;
                }).join('');
                return `<table>${rows}</table>`;
            case 'image':
                return `<img src="${block.data.file.url}" alt="${block.data.caption || ''}" title="${block.data.caption || ''}">`;
            case 'linkTool':
                return `<p><a href="${block.data.link}" target="_blank">${block.data.meta.title || block.data.link}</a></p>`;
            case 'embed':
                return `<div class="embed">${block.data.embed || ''}</div>`;
            case 'raw':
                return block.data.html;
            default:
                return `<p>${block.data.text || ''}</p>`;
        }
    }

    async convertToMarkdown(data) {
        let markdown = '';

        for (const block of data.blocks) {
            markdown += this.blockToMarkdown(block) + '\n\n';
        }

        return markdown.trim();
    }

    blockToMarkdown(block) {
        switch (block.type) {
            case 'header':
                return '#'.repeat(block.data.level) + ' ' + this.stripHTML(block.data.text);
            case 'paragraph':
                return this.stripHTML(block.data.text);
            case 'list':
                const prefix = block.data.style === 'ordered' ? '1. ' : '- ';
                return block.data.items.map(item => prefix + this.stripHTML(item)).join('\n');
            case 'checklist':
                return block.data.items.map(item => 
                    `- [${item.checked ? 'x' : ' '}] ${this.stripHTML(item.text)}`
                ).join('\n');
            case 'quote':
                const quote = `> ${this.stripHTML(block.data.text)}`;
                return block.data.caption ? quote + `\n> \n> — ${block.data.caption}` : quote;
            case 'code':
                return '```\n' + block.data.code + '\n```';
            case 'warning':
                return `> ⚠️ **${block.data.title}**\n> \n> ${block.data.message}`;
            case 'delimiter':
                return '---';
            case 'table':
                if (!block.data.content || !block.data.content.length) return '';
                const header = '| ' + block.data.content[0].join(' | ') + ' |';
                const separator = '| ' + block.data.content[0].map(() => '---').join(' | ') + ' |';
                const rows = block.data.content.slice(1).map(row => 
                    '| ' + row.join(' | ') + ' |'
                ).join('\n');
                return header + '\n' + separator + '\n' + rows;
            case 'image':
                return `![${block.data.caption || ''}](${block.data.file.url})`;
            case 'linkTool':
                return `[${block.data.meta.title || block.data.link}](${block.data.link})`;
            case 'embed':
                return `[Embedded Content](${block.data.source})`;
            case 'raw':
                return block.data.html;
            default:
                return block.data.text || '';
        }
    }

    async convertToText(data) {
        let text = '';

        for (const block of data.blocks) {
            text += this.blockToText(block) + '\n\n';
        }

        return text.trim();
    }

    blockToText(block) {
        switch (block.type) {
            case 'header':
                return this.stripHTML(block.data.text).toUpperCase();
            case 'paragraph':
                return this.stripHTML(block.data.text);
            case 'list':
                return block.data.items.map((item, index) => {
                    const prefix = block.data.style === 'ordered' ? `${index + 1}. ` : '• ';
                    return prefix + this.stripHTML(item);
                }).join('\n');
            case 'checklist':
                return block.data.items.map(item => 
                    `[${item.checked ? 'X' : ' '}] ${this.stripHTML(item.text)}`
                ).join('\n');
            case 'quote':
                const quote = `"${this.stripHTML(block.data.text)}"`;
                return block.data.caption ? quote + ` — ${block.data.caption}` : quote;
            case 'code':
                return block.data.code;
            case 'warning':
                return `⚠️ ${block.data.title}: ${block.data.message}`;
            case 'delimiter':
                return '─'.repeat(50);
            case 'table':
                if (!block.data.content || !block.data.content.length) return '';
                return block.data.content.map(row => row.join('\t')).join('\n');
            case 'image':
                return `[Image: ${block.data.caption || 'Untitled'}]`;
            case 'linkTool':
                return `${block.data.meta.title || 'Link'}: ${block.data.link}`;
            case 'embed':
                return `[Embedded Content: ${block.data.service || 'Unknown'}]`;
            case 'raw':
                return this.stripHTML(block.data.html);
            default:
                return this.stripHTML(block.data.text || '');
        }
    }

    async exportToPDF(data) {
        // Simple PDF export using browser's print functionality
        const htmlContent = await this.convertToHTML(data, true, true);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    }

    async updateStats() {
        if (!this.editor) return;

        try {
            const data = await this.editor.save();
            const blocks = data.blocks.length;
            
            let wordCount = 0;
            let charCount = 0;

            data.blocks.forEach(block => {
                const text = this.blockToText(block);
                const words = text.trim().split(/\s+/).filter(word => word.length > 0);
                wordCount += words.length;
                charCount += text.length;
            });

            this.querySelector('#block-count').textContent = `Blocks: ${blocks}`;
            this.querySelector('#word-count').textContent = `Words: ${wordCount}`;
            this.querySelector('#char-count').textContent = `Characters: ${charCount}`;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    async saveContent() {
        if (!this.editor) return;

        try {
            const data = await this.editor.save();
            // In a real implementation, you would send this to your server
            console.log('Content saved:', data);
            this.showStatus('Content saved successfully', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Failed to save content', 'error');
        }
    }

    async autoSave() {
        if (!this.autoSaveEnabled) return;
        
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveContent();
        }, parseInt(this.querySelector('#save-interval').value) * 1000);
    }

    async clearContent() {
        if (confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
            await this.editor.clear();
            this.updateStats();
            this.showStatus('Content cleared', 'info');
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(this.currentTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        this.querySelector('.are-container').classList.toggle('dark', theme === 'dark');
        this.querySelector('#editor-theme').value = theme;
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

    resetSettings() {
        this.querySelector('#editor-theme').value = 'light';
        this.querySelector('#auto-save').checked = true;
        this.querySelector('#save-interval').value = '60';
        this.setTheme('light');
        this.autoSaveEnabled = true;
        this.showStatus('Settings reset to default', 'info');
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
                this.showStatus('Content copied to clipboard!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showStatus('Content copied to clipboard!', 'success');
        }
    }

    showStatus(message, type = 'info', duration = 3000) {
        const statusElement = this.querySelector('#last-saved');
        statusElement.textContent = message;
        statusElement.className = type;
        
        setTimeout(() => {
            statusElement.textContent = 'Ready';
            statusElement.className = '';
        }, duration);
    }

    stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Register the custom element
customElements.define('advanced-rich-editor', AdvancedRichEditor);
