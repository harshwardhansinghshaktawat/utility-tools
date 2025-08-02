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
        this.content = '';
        this.isFullscreen = false;
        this.currentTheme = 'light';
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoStack = 50;
    }

    connectedCallback() {
        this.innerHTML = this.getHTML();
        this.addStyles();
        this.initializeEditor();
        this.setupEventListeners();
        this.updateStats();
    }

    getHTML() {
        return `
            <div class="are-container" id="are-main">
                <div class="are-header">
                    <div class="are-title">🎨 Advanced Rich Editor</div>
                    <div class="are-header-controls">
                        <button class="are-btn" id="theme-toggle" title="Toggle Theme">🌗</button>
                        <button class="are-btn" id="fullscreen-toggle" title="Fullscreen">⛶</button>
                        <button class="are-btn" id="export-menu" title="Export">📤</button>
                    </div>
                </div>

                <div class="are-toolbar">
                    <!-- Text Formatting -->
                    <div class="are-group">
                        <button class="are-tool-btn" data-command="bold" title="Bold">𝐁</button>
                        <button class="are-tool-btn" data-command="italic" title="Italic">𝐼</button>
                        <button class="are-tool-btn" data-command="underline" title="Underline">U̲</button>
                        <button class="are-tool-btn" data-command="strikeThrough" title="Strike">S̶</button>
                    </div>

                    <!-- Headers -->
                    <div class="are-group">
                        <select class="are-select" id="format-select">
                            <option value="">Normal</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                            <option value="h4">Heading 4</option>
                            <option value="h5">Heading 5</option>
                            <option value="h6">Heading 6</option>
                        </select>
                    </div>

                    <!-- Colors -->
                    <div class="are-group">
                        <input type="color" class="are-color" id="text-color" value="#000000" title="Text Color">
                        <input type="color" class="are-color" id="bg-color" value="#ffffff" title="Background">
                    </div>

                    <!-- Lists & Alignment -->
                    <div class="are-group">
                        <button class="are-tool-btn" data-command="insertOrderedList" title="Numbered List">1.</button>
                        <button class="are-tool-btn" data-command="insertUnorderedList" title="Bullet List">•</button>
                        <button class="are-tool-btn" data-command="justifyLeft" title="Left">⬅</button>
                        <button class="are-tool-btn" data-command="justifyCenter" title="Center">↔</button>
                        <button class="are-tool-btn" data-command="justifyRight" title="Right">➡</button>
                    </div>

                    <!-- Media & Special -->
                    <div class="are-group">
                        <button class="are-tool-btn" id="insert-link" title="Link">🔗</button>
                        <button class="are-tool-btn" id="insert-image" title="Image">🖼️</button>
                        <button class="are-tool-btn" id="insert-video" title="Video">🎥</button>
                        <button class="are-tool-btn" id="insert-table" title="Table">⊞</button>
                    </div>

                    <!-- Undo/Redo -->
                    <div class="are-group">
                        <button class="are-tool-btn" data-command="undo" title="Undo">↶</button>
                        <button class="are-tool-btn" data-command="redo" title="Redo">↷</button>
                    </div>
                </div>

                <div class="are-content">
                    <div class="are-sidebar">
                        <div class="are-tab active" data-panel="templates" title="Templates">📄</div>
                        <div class="are-tab" data-panel="embeds" title="Embeds">📎</div>
                        <div class="are-tab" data-panel="media" title="Media">🖼️</div>
                        <div class="are-tab" data-panel="export" title="Export">📤</div>
                    </div>

                    <div class="are-editor-area">
                        <div class="are-editor" id="editor" contenteditable="true" spellcheck="true">
                            <h1>Welcome to Advanced Rich Editor!</h1>
                            <p>Start creating your amazing content here. This editor supports:</p>
                            <ul>
                                <li><strong>Rich text formatting</strong> with bold, italic, underline</li>
                                <li><em>Multiple heading styles</em> and text alignment</li>
                                <li>Color customization for text and backgrounds</li>
                                <li>Lists, links, images, and tables</li>
                                <li>Multiple export formats (HTML, Markdown, PDF)</li>
                                <li>Embed support for videos and social media</li>
                            </ul>
                            <p>Try the formatting tools above and explore the sidebar panels!</p>
                        </div>
                    </div>

                    <div class="are-panel">
                        <!-- Templates Panel -->
                        <div class="are-panel-content active" id="templates-panel">
                            <h3>📄 Templates</h3>
                            <div class="are-template-grid">
                                <div class="are-template" data-template="blog">📝 Blog Post</div>
                                <div class="are-template" data-template="article">📰 News Article</div>
                                <div class="are-template" data-template="newsletter">📧 Newsletter</div>
                                <div class="are-template" data-template="report">📊 Report</div>
                                <div class="are-template" data-template="letter">💌 Letter</div>
                                <div class="are-template" data-template="resume">📋 Resume</div>
                            </div>
                        </div>

                        <!-- Embeds Panel -->
                        <div class="are-panel-content" id="embeds-panel">
                            <h3>📎 Embed Content</h3>
                            <div class="are-embed-buttons">
                                <button class="are-embed-btn" data-type="youtube">▶️ YouTube</button>
                                <button class="are-embed-btn" data-type="instagram">📷 Instagram</button>
                                <button class="are-embed-btn" data-type="twitter">🐦 Twitter</button>
                                <button class="are-embed-btn" data-type="spotify">🎵 Spotify</button>
                            </div>
                            <div class="are-input-group">
                                <input type="text" id="embed-url" placeholder="Paste URL here..." class="are-input">
                                <button class="are-btn-primary" id="embed-insert">Insert</button>
                            </div>
                        </div>

                        <!-- Media Panel -->
                        <div class="are-panel-content" id="media-panel">
                            <h3>🖼️ Media Library</h3>
                            <div class="are-media-upload">
                                <input type="file" id="media-input" accept="image/*" style="display: none;">
                                <button class="are-btn-primary" id="media-upload">📁 Upload Image</button>
                            </div>
                            <div class="are-media-grid" id="media-gallery"></div>
                        </div>

                        <!-- Export Panel -->
                        <div class="are-panel-content" id="export-panel">
                            <h3>📤 Export Options</h3>
                            <div class="are-export-grid">
                                <button class="are-export-btn" data-format="html">📄 HTML</button>
                                <button class="are-export-btn" data-format="markdown">📝 Markdown</button>
                                <button class="are-export-btn" data-format="text">📋 Plain Text</button>
                                <button class="are-export-btn" data-format="json">🔧 JSON</button>
                                <button class="are-export-btn" data-format="print">🖨️ Print</button>
                                <button class="are-export-btn" data-format="copy">📋 Copy HTML</button>
                            </div>
                            <div class="are-export-options">
                                <label><input type="checkbox" id="include-styles" checked> Include Styles</label>
                                <label><input type="checkbox" id="include-meta" checked> Include Metadata</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="are-status-bar">
                    <span id="word-count">Words: 0</span>
                    <span id="char-count">Characters: 0</span>
                    <span id="reading-time">Reading: 0 min</span>
                    <span id="last-saved">Ready</span>
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

            .are-select, .are-input {
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
                color: #333;
                min-width: 120px;
            }

            .are-container.dark .are-select,
            .are-container.dark .are-input {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
                color: #e0e0e0;
            }

            .are-color {
                width: 40px;
                height: 30px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
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
                min-height: 350px;
                background: transparent;
                border: none;
                outline: none;
                line-height: 1.6;
                font-size: 16px;
                color: inherit;
                padding: 0;
            }

            .are-editor h1, .are-editor h2, .are-editor h3,
            .are-editor h4, .are-editor h5, .are-editor h6 {
                margin: 1em 0 0.5em 0;
                color: inherit;
            }

            .are-editor p {
                margin: 0.5em 0;
            }

            .are-editor ul, .are-editor ol {
                margin: 0.5em 0;
                padding-left: 2em;
            }

            .are-panel {
                width: 300px;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 3px 3px 8px #d1d1d4, inset -3px -3px 8px #ffffff;
                padding: 20px;
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

            .are-template-grid, .are-embed-buttons, .are-export-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin: 15px 0;
            }

            .are-template, .are-embed-btn, .are-export-btn {
                padding: 15px 10px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
                transition: all 0.2s ease;
                color: #333;
                text-align: center;
                font-size: 12px;
            }

            .are-container.dark .are-template,
            .are-container.dark .are-embed-btn,
            .are-container.dark .are-export-btn {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: 2px 2px 5px #0f0f0f, -2px -2px 5px #3a3a3a;
                color: #e0e0e0;
            }

            .are-template:hover, .are-embed-btn:hover, .are-export-btn:hover {
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
            }

            .are-container.dark .are-template:hover,
            .are-container.dark .are-embed-btn:hover,
            .are-container.dark .are-export-btn:hover {
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
            }

            .are-input-group {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }

            .are-input-group .are-input {
                flex: 1;
            }

            .are-export-options {
                margin-top: 15px;
            }

            .are-export-options label {
                display: block;
                margin: 8px 0;
                font-size: 14px;
                cursor: pointer;
            }

            .are-export-options input[type="checkbox"] {
                margin-right: 8px;
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
            }

            .are-container.dark .are-status-bar {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
                color: #999;
            }

            .are-media-upload {
                margin-bottom: 15px;
            }

            .are-media-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .are-media-item {
                aspect-ratio: 1;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
            }

            .are-media-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .are-embed-container {
                margin: 20px 0;
                padding: 15px;
                border-radius: 12px;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                box-shadow: inset 3px 3px 8px #d1d1d4, inset -3px -3px 8px #ffffff;
                text-align: center;
            }

            .are-container.dark .are-embed-container {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: inset 3px 3px 8px #0f0f0f, inset -3px -3px 8px #3a3a3a;
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

    initializeEditor() {
        this.editor = this.querySelector('#editor');
        this.saveState();
    }

    setupEventListeners() {
        // Toolbar commands
        this.addEventListener('click', (e) => {
            const command = e.target.dataset.command;
            if (command) {
                this.execCommand(command);
            }

            // Special buttons
            if (e.target.id === 'theme-toggle') this.toggleTheme();
            if (e.target.id === 'fullscreen-toggle') this.toggleFullscreen();
            if (e.target.id === 'insert-link') this.insertLink();
            if (e.target.id === 'insert-image') this.insertImage();
            if (e.target.id === 'insert-video') this.insertVideo();
            if (e.target.id === 'insert-table') this.insertTable();
            if (e.target.id === 'media-upload') this.querySelector('#media-input').click();
            if (e.target.id === 'embed-insert') this.insertEmbed();

            // Panel tabs
            if (e.target.classList.contains('are-tab')) {
                this.switchPanel(e.target.dataset.panel);
            }

            // Templates
            if (e.target.classList.contains('are-template')) {
                this.loadTemplate(e.target.dataset.template);
            }

            // Export
            if (e.target.classList.contains('are-export-btn')) {
                this.exportContent(e.target.dataset.format);
            }

            // Embed types
            if (e.target.classList.contains('are-embed-btn')) {
                this.setEmbedType(e.target.dataset.type);
            }
        });

        // Format select
        this.querySelector('#format-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.execCommand('formatBlock', '<' + e.target.value + '>');
            } else {
                this.execCommand('formatBlock', '<div>');
            }
        });

        // Color pickers
        this.querySelector('#text-color').addEventListener('change', (e) => {
            this.execCommand('foreColor', e.target.value);
        });

        this.querySelector('#bg-color').addEventListener('change', (e) => {
            this.execCommand('backColor', e.target.value);
        });

        // Editor events
        this.editor.addEventListener('input', () => {
            this.updateStats();
            this.saveState();
        });

        this.editor.addEventListener('keydown', (e) => {
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

        // File upload
        this.querySelector('#media-input').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    execCommand(command, value = null) {
        document.execCommand(command, false, value);
        this.editor.focus();
    }

    insertLink() {
        const url = prompt('Enter URL:');
        if (url) {
            this.execCommand('createLink', url);
        }
    }

    insertImage() {
        const url = prompt('Enter image URL:');
        if (url) {
            this.execCommand('insertImage', url);
        }
    }

    insertVideo() {
        const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
        if (url) {
            let embedCode = '';
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = this.extractYouTubeId(url);
                embedCode = `<div class="are-embed-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                </div>`;
            } else if (url.includes('vimeo.com')) {
                const videoId = this.extractVimeoId(url);
                embedCode = `<div class="are-embed-container">
                    <iframe width="100%" height="315" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>
                </div>`;
            } else {
                embedCode = `<div class="are-embed-container">
                    <video controls width="100%"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>
                </div>`;
            }
            this.execCommand('insertHTML', embedCode);
        }
    }

    insertTable() {
        const rows = parseInt(prompt('Number of rows:')) || 3;
        const cols = parseInt(prompt('Number of columns:')) || 3;
        
        let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0;">';
        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += '<td style="padding: 8px; border: 1px solid #ccc; min-width: 100px;">&nbsp;</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</table>';
        
        this.execCommand('insertHTML', tableHTML);
    }

    setEmbedType(type) {
        const input = this.querySelector('#embed-url');
        const placeholders = {
            youtube: 'https://www.youtube.com/watch?v=...',
            instagram: 'https://www.instagram.com/p/...',
            twitter: 'https://twitter.com/.../status/...',
            spotify: 'https://open.spotify.com/track/...'
        };
        input.placeholder = placeholders[type] || 'Paste URL here...';
        input.focus();
    }

    insertEmbed() {
        const url = this.querySelector('#embed-url').value.trim();
        if (!url) return;

        let embedCode = '';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = this.extractYouTubeId(url);
            embedCode = `<div class="are-embed-container">
                <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
            </div>`;
        } else if (url.includes('instagram.com')) {
            embedCode = `<div class="are-embed-container">
                <blockquote>📷 Instagram Post: <a href="${url}" target="_blank">${url}</a></blockquote>
            </div>`;
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
            embedCode = `<div class="are-embed-container">
                <blockquote>🐦 Tweet: <a href="${url}" target="_blank">${url}</a></blockquote>
            </div>`;
        } else if (url.includes('spotify.com')) {
            const trackId = this.extractSpotifyId(url);
            embedCode = `<div class="are-embed-container">
                <iframe src="https://open.spotify.com/embed/track/${trackId}" width="100%" height="152" frameborder="0"></iframe>
            </div>`;
        } else {
            embedCode = `<div class="are-embed-container">
                <p>🔗 Link: <a href="${url}" target="_blank">${url}</a></p>
            </div>`;
        }

        this.execCommand('insertHTML', embedCode);
        this.querySelector('#embed-url').value = '';
    }

    extractYouTubeId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return match ? match[1] : '';
    }

    extractVimeoId(url) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : '';
    }

    extractSpotifyId(url) {
        const match = url.match(/spotify\.com\/track\/([^?]+)/);
        return match ? match[1] : '';
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Add to media gallery
                    const gallery = this.querySelector('#media-gallery');
                    const mediaItem = document.createElement('div');
                    mediaItem.className = 'are-media-item';
                    mediaItem.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
                    mediaItem.addEventListener('click', () => {
                        this.execCommand('insertImage', e.target.result);
                    });
                    gallery.appendChild(mediaItem);
                };
                reader.readAsDataURL(file);
            }
        });
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
                <p>Start your blog post with an engaging opening that hooks your readers...</p>
                <h2>Main Content</h2>
                <p>Develop your main ideas here with compelling stories and insights...</p>
                <h2>Conclusion</h2>
                <p>Wrap up with a strong conclusion and call to action...</p>`,
            
            article: `<h1>News Article Headline</h1>
                <p><strong>Reporter Name</strong> - ${new Date().toLocaleDateString()}</p>
                <p><strong>Lead:</strong> A compelling opening paragraph that summarizes the key points...</p>
                <p>The body of your article continues here with detailed information...</p>`,
            
            newsletter: `<h1>📧 Newsletter Title</h1>
                <p><strong>Issue #1 - ${new Date().toLocaleDateString()}</strong></p>
                <h2>📰 Top Stories</h2>
                <p>Highlight the most important news and updates...</p>
                <h2>🔥 Featured Content</h2>
                <p>Showcase your best content and resources...</p>
                <h2>📅 Upcoming Events</h2>
                <p>List important dates and events...</p>`,
            
            report: `<h1>Report Title</h1>
                <h2>Executive Summary</h2>
                <p>Brief overview of key findings and recommendations...</p>
                <h2>Introduction</h2>
                <p>Background and purpose of the report...</p>
                <h2>Methodology</h2>
                <p>How the research was conducted...</p>
                <h2>Findings</h2>
                <p>Present your main findings and data...</p>
                <h2>Conclusions</h2>
                <p>Summarize conclusions and next steps...</p>`,
            
            letter: `<p>${new Date().toLocaleDateString()}</p>
                <p>Dear [Recipient],</p>
                <p>I hope this letter finds you well. I am writing to...</p>
                <p>Please let me know if you have any questions or need additional information.</p>
                <p>Best regards,<br>[Your Name]</p>`,
            
            resume: `<h1>[Your Name]</h1>
                <p><strong>Email:</strong> your.email@example.com | <strong>Phone:</strong> (555) 123-4567</p>
                <h2>Professional Summary</h2>
                <p>Brief summary of your experience and skills...</p>
                <h2>Experience</h2>
                <h3>Job Title - Company Name (Year - Year)</h3>
                <ul><li>Key achievement or responsibility</li><li>Another important accomplishment</li></ul>
                <h2>Education</h2>
                <p><strong>Degree</strong> - University Name (Year)</p>
                <h2>Skills</h2>
                <ul><li>Skill 1</li><li>Skill 2</li><li>Skill 3</li></ul>`
        };

        if (templates[templateName]) {
            this.editor.innerHTML = templates[templateName];
            this.updateStats();
        }
    }

    exportContent(format) {
        const content = this.editor.innerHTML;
        const text = this.editor.textContent;
        const includeStyles = this.querySelector('#include-styles').checked;
        const includeMeta = this.querySelector('#include-meta').checked;

        switch (format) {
            case 'html':
                this.downloadFile(this.generateHTML(content, includeStyles, includeMeta), 'content.html', 'text/html');
                break;
            case 'markdown':
                this.downloadFile(this.htmlToMarkdown(content), 'content.md', 'text/markdown');
                break;
            case 'text':
                this.downloadFile(text, 'content.txt', 'text/plain');
                break;
            case 'json':
                const data = {
                    content: content,
                    text: text,
                    stats: this.getStats(),
                    exported: new Date().toISOString()
                };
                this.downloadFile(JSON.stringify(data, null, 2), 'content.json', 'application/json');
                break;
            case 'print':
                this.printContent();
                break;
            case 'copy':
                this.copyToClipboard(content);
                break;
        }
    }

    generateHTML(content, includeStyles, includeMeta) {
        let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
        html += '<meta charset="UTF-8">\n';
        html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
        html += '<title>Exported Content</title>\n';
        
        if (includeStyles) {
            html += '<style>\n';
            html += 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }\n';
            html += 'h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 2em; }\n';
            html += 'table { border-collapse: collapse; width: 100%; margin: 20px 0; }\n';
            html += 'td, th { border: 1px solid #ddd; padding: 8px; }\n';
            html += '.are-embed-container { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }\n';
            html += '</style>\n';
        }
        
        if (includeMeta) {
            html += `<meta name="generator" content="Advanced Rich Editor">\n`;
            html += `<meta name="exported" content="${new Date().toISOString()}">\n`;
        }
        
        html += '</head>\n<body>\n';
        html += content;
        html += '\n</body>\n</html>';
        
        return html;
    }

    htmlToMarkdown(html) {
        // Simple HTML to Markdown conversion
        let markdown = html;
        
        // Headers
        markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
        markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
        markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
        markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
        markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
        markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
        
        // Bold and italic
        markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
        markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
        markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
        markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
        
        // Links
        markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
        
        // Images
        markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
        markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');
        
        // Lists
        markdown = markdown.replace(/<ul[^>]*>/gi, '');
        markdown = markdown.replace(/<\/ul>/gi, '\n');
        markdown = markdown.replace(/<ol[^>]*>/gi, '');
        markdown = markdown.replace(/<\/ol>/gi, '\n');
        markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
        
        // Paragraphs
        markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
        
        // Line breaks
        markdown = markdown.replace(/<br[^>]*>/gi, '\n');
        
        // Remove remaining HTML tags
        markdown = markdown.replace(/<[^>]*>/g, '');
        
        // Clean up
        markdown = markdown.replace(/\n\n\n+/g, '\n\n');
        markdown = markdown.trim();
        
        return markdown;
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

    printContent() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generateHTML(this.editor.innerHTML, true, false));
        printWindow.document.close();
        printWindow.print();
    }

    copyToClipboard(content) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content).then(() => {
                this.showStatus('Content copied to clipboard!');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showStatus('Content copied to clipboard!');
        }
    }

    getStats() {
        const text = this.editor.textContent;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const readingTime = Math.ceil(words / 200);
        
        return { words, chars, charsNoSpaces, readingTime };
    }

    updateStats() {
        const stats = this.getStats();
        this.querySelector('#word-count').textContent = `Words: ${stats.words}`;
        this.querySelector('#char-count').textContent = `Characters: ${stats.chars}`;
        this.querySelector('#reading-time').textContent = `Reading: ${stats.readingTime} min`;
    }

    saveState() {
        this.undoStack.push(this.editor.innerHTML);
        if (this.undoStack.length > this.maxUndoStack) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length > 1) {
            const current = this.undoStack.pop();
            this.redoStack.push(current);
            this.editor.innerHTML = this.undoStack[this.undoStack.length - 1];
            this.updateStats();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const state = this.redoStack.pop();
            this.undoStack.push(state);
            this.editor.innerHTML = state;
            this.updateStats();
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.querySelector('.are-container').classList.toggle('dark', this.currentTheme === 'dark');
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

    showStatus(message, duration = 3000) {
        this.querySelector('#last-saved').textContent = message;
        setTimeout(() => {
            this.querySelector('#last-saved').textContent = 'Ready';
        }, duration);
    }
}

// Register the custom element
customElements.define('advanced-rich-editor', AdvancedRichEditor);
