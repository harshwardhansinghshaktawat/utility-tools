/**
 * Advanced Rich Content Editor - Wix Custom Element
 * File: advanced-rich-editor.js
 * Tag: <advanced-rich-editor>
 * 
 * IMPORTANT: Add these script tags to your page head BEFORE using this custom element:
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/header@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/list@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/checklist@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/quote@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/code@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/delimiter@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/table@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/simple-image@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/embed@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/link@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/marker@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/inline-code@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/warning@latest"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@editorjs/raw@latest"></script>
 */

class AdvancedRichEditor extends HTMLElement {
    constructor() {
        super();
        this.editor = null;
        this.editorData = null;
        this.currentTheme = 'light';
        this.isInitialized = false;
        this.scriptsLoaded = false;
        this.retryCount = 0;
        this.maxRetries = 20;
    }

    connectedCallback() {
        this.render();
        this.loadDependencies();
    }

    render() {
        this.innerHTML = `
            <div class="advanced-editor-container">
                <div class="editor-toolbar">
                    <div class="toolbar-section">
                        <button class="toolbar-btn" id="save-btn" title="Save Content">
                            💾 Save
                        </button>
                        <button class="toolbar-btn" id="load-btn" title="Load Content">
                            📁 Load
                        </button>
                        <button class="toolbar-btn" id="clear-btn" title="Clear Editor">
                            🗑️ Clear
                        </button>
                    </div>
                    
                    <div class="toolbar-section">
                        <label for="export-format">Export as:</label>
                        <select id="export-format">
                            <option value="json">JSON</option>
                            <option value="html">HTML</option>
                            <option value="markdown">Markdown</option>
                            <option value="plain">Plain Text</option>
                        </select>
                        <button class="toolbar-btn" id="export-btn">📤 Export</button>
                    </div>
                    
                    <div class="toolbar-section">
                        <button class="toolbar-btn" id="theme-btn" title="Toggle Theme">
                            🌓 Theme
                        </button>
                        <button class="toolbar-btn" id="fullscreen-btn" title="Fullscreen">
                            ⛶ Full
                        </button>
                    </div>
                    
                    <div class="toolbar-section">
                        <input type="file" id="import-file" accept=".json,.html,.md,.txt" style="display: none">
                        <button class="toolbar-btn" id="import-btn" title="Import File">
                            📥 Import
                        </button>
                    </div>
                </div>
                
                <div class="editor-wrapper">
                    <div id="advanced-editor" class="editor-area">
                        <div class="loading-message">
                            <div class="spinner"></div>
                            <p>Loading Editor...</p>
                        </div>
                    </div>
                </div>
                
                <div class="editor-status">
                    <span id="word-count">Words: 0</span>
                    <span id="char-count">Characters: 0</span>
                    <span id="block-count">Blocks: 0</span>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .advanced-editor-container {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 100%;
                margin: 0 auto;
                border: 1px solid #e1e5e9;
                border-radius: 8px;
                background: #fff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }

            .advanced-editor-container.dark {
                background: #1a1a1a;
                border-color: #333;
                color: #fff;
            }

            .editor-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 12px 16px;
                background: #f8f9fa;
                border-bottom: 1px solid #e1e5e9;
                border-radius: 8px 8px 0 0;
                align-items: center;
            }

            .advanced-editor-container.dark .editor-toolbar {
                background: #2d2d2d;
                border-color: #444;
            }

            .toolbar-section {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .toolbar-btn {
                padding: 6px 12px;
                border: 1px solid #ddd;
                background: #fff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .toolbar-btn:hover {
                background: #f0f0f0;
                border-color: #999;
            }

            .toolbar-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .advanced-editor-container.dark .toolbar-btn {
                background: #444;
                border-color: #666;
                color: #fff;
            }

            .advanced-editor-container.dark .toolbar-btn:hover {
                background: #555;
            }

            #export-format {
                padding: 4px 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: #fff;
            }

            .advanced-editor-container.dark #export-format {
                background: #444;
                border-color: #666;
                color: #fff;
            }

            .editor-wrapper {
                position: relative;
                min-height: 400px;
                padding: 20px;
            }

            .editor-area {
                min-height: 350px;
                outline: none;
            }

            .loading-message {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 300px;
                color: #666;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007acc;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .error-message {
                color: #dc3545;
                text-align: center;
                padding: 20px;
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 4px;
                margin: 20px;
            }

            .editor-status {
                display: flex;
                justify-content: space-between;
                padding: 8px 16px;
                background: #f8f9fa;
                border-top: 1px solid #e1e5e9;
                font-size: 12px;
                color: #666;
                border-radius: 0 0 8px 8px;
            }

            .advanced-editor-container.dark .editor-status {
                background: #2d2d2d;
                border-color: #444;
                color: #ccc;
            }

            .fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9999;
                border-radius: 0;
            }

            .fullscreen .editor-wrapper {
                height: calc(100vh - 120px);
                overflow-y: auto;
            }

            /* Editor.js custom styling */
            .ce-block__content {
                max-width: none;
            }

            .ce-toolbar__actions {
                right: -5px;
            }

            .cdx-quote {
                border-left: 4px solid #007acc;
                padding-left: 16px;
                margin: 16px 0;
            }

            .advanced-editor-container.dark .cdx-quote {
                border-color: #4a9eff;
            }

            .ce-code__textarea {
                background: #f4f4f4 !important;
                border: 1px solid #e1e5e9 !important;
                border-radius: 4px !important;
                font-family: 'Monaco', 'Consolas', monospace !important;
            }

            .advanced-editor-container.dark .ce-code__textarea {
                background: #2d2d2d !important;
                border-color: #444 !important;
                color: #fff !important;
            }

            .cdx-table {
                border-collapse: collapse;
                width: 100%;
            }

            .cdx-table td {
                border: 1px solid #ddd;
                padding: 8px;
            }

            .advanced-editor-container.dark .cdx-table td {
                border-color: #444;
            }

            .fallback-editor {
                width: 100%;
                min-height: 300px;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-family: inherit;
                font-size: 14px;
                resize: vertical;
                outline: none;
            }

            .advanced-editor-container.dark .fallback-editor {
                background: #2d2d2d;
                border-color: #444;
                color: #fff;
            }
        `;
        this.appendChild(style);
    }

    loadDependencies() {
        // Define all required scripts in order
        const requiredScripts = [
            'https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/header@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/list@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/checklist@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/quote@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/code@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/delimiter@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/table@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/simple-image@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/embed@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/link@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/marker@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/inline-code@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/warning@latest',
            'https://cdn.jsdelivr.net/npm/@editorjs/raw@latest'
        ];

        // Check if scripts are already loaded (in page head)
        this.checkExistingScripts(requiredScripts);
    }

    checkExistingScripts(requiredScripts) {
        // Check if EditorJS is already available
        if (typeof window.EditorJS !== 'undefined') {
            console.log('EditorJS found in global scope');
            this.waitForPlugins();
            return;
        }

        // Check if scripts are already in document
        const existingScripts = Array.from(document.getElementsByTagName('script'))
            .map(script => script.src);

        const missingScripts = requiredScripts.filter(scriptUrl => 
            !existingScripts.some(existing => existing.includes(scriptUrl.split('/').pop()))
        );

        if (missingScripts.length === 0) {
            console.log('All scripts found in document');
            this.waitForPlugins();
        } else {
            console.log('Loading missing scripts:', missingScripts);
            this.loadScriptsSequentially(missingScripts, 0);
        }
    }

    loadScriptsSequentially(scripts, index) {
        if (index >= scripts.length) {
            console.log('All scripts loaded');
            this.waitForPlugins();
            return;
        }

        const script = document.createElement('script');
        script.src = scripts[index];
        script.onload = () => {
            console.log(`Loaded: ${scripts[index]}`);
            this.loadScriptsSequentially(scripts, index + 1);
        };
        script.onerror = () => {
            console.error(`Failed to load: ${scripts[index]}`);
            this.handleLoadError();
        };

        document.head.appendChild(script);
    }

    waitForPlugins() {
        this.retryCount++;
        
        if (this.retryCount > this.maxRetries) {
            console.error('Max retries reached, falling back to simple editor');
            this.showFallbackEditor();
            return;
        }

        // Check if all required classes are available
        const requiredClasses = [
            'EditorJS', 'Header', 'List', 'Checklist', 'Quote', 
            'CodeTool', 'Delimiter', 'Table', 'SimpleImage', 
            'Embed', 'LinkTool', 'Marker', 'InlineCode', 'Warning', 'RawTool'
        ];

        const missingClasses = requiredClasses.filter(className => 
            typeof window[className] === 'undefined'
        );

        if (missingClasses.length === 0) {
            console.log('All Editor.js classes are available');
            this.initializeEditor();
        } else {
            console.log('Waiting for classes:', missingClasses);
            setTimeout(() => this.waitForPlugins(), 200);
        }
    }

    initializeEditor() {
        if (this.isInitialized) return;

        try {
            const tools = this.getEditorTools();
            
            this.editor = new window.EditorJS({
                holder: 'advanced-editor',
                placeholder: 'Start writing your amazing content here...',
                autofocus: true,
                tools: tools,
                onChange: () => {
                    this.updateStatus();
                },
                onReady: () => {
                    console.log('Advanced Rich Editor is ready!');
                    this.isInitialized = true;
                    this.setupEventListeners();
                    this.updateStatus();
                }
            });

        } catch (error) {
            console.error('Error initializing editor:', error);
            this.handleLoadError();
        }
    }

    getEditorTools() {
        const tools = {
            paragraph: {
                class: window.Paragraph || class {
                    render() {
                        return document.createElement('p');
                    }
                },
                inlineToolbar: true
            }
        };

        // Add tools only if classes are available
        if (window.Header) {
            tools.header = {
                class: window.Header,
                config: {
                    placeholder: 'Enter a header',
                    levels: [1, 2, 3, 4, 5, 6],
                    defaultLevel: 2
                }
            };
        }

        if (window.List) {
            tools.list = {
                class: window.List,
                inlineToolbar: true,
                config: {
                    defaultStyle: 'unordered'
                }
            };
        }

        if (window.Checklist) {
            tools.checklist = {
                class: window.Checklist,
                inlineToolbar: true
            };
        }

        if (window.Quote) {
            tools.quote = {
                class: window.Quote,
                inlineToolbar: true,
                config: {
                    quotePlaceholder: 'Enter a quote',
                    captionPlaceholder: 'Quote author'
                }
            };
        }

        if (window.CodeTool) {
            tools.code = {
                class: window.CodeTool,
                config: {
                    placeholder: 'Enter your code here...'
                }
            };
        }

        if (window.Delimiter) {
            tools.delimiter = window.Delimiter;
        }

        if (window.Table) {
            tools.table = {
                class: window.Table,
                inlineToolbar: true,
                config: {
                    rows: 2,
                    cols: 3
                }
            };
        }

        if (window.SimpleImage) {
            tools.image = {
                class: window.SimpleImage,
                config: {
                    placeholder: 'Paste image URL here...'
                }
            };
        }

        if (window.Embed) {
            tools.embed = {
                class: window.Embed,
                config: {
                    services: {
                        youtube: true,
                        vimeo: true,
                        instagram: true,
                        twitter: true,
                        codepen: true,
                        facebook: true,
                        pinterest: true
                    }
                }
            };
        }

        if (window.LinkTool) {
            tools.linkTool = {
                class: window.LinkTool,
                config: {
                    endpoint: 'https://jsonplaceholder.typicode.com/posts/1'
                }
            };
        }

        if (window.Marker) {
            tools.marker = {
                class: window.Marker,
                shortcut: 'CMD+SHIFT+M'
            };
        }

        if (window.InlineCode) {
            tools.inlineCode = {
                class: window.InlineCode,
                shortcut: 'CMD+SHIFT+C'
            };
        }

        if (window.Warning) {
            tools.warning = {
                class: window.Warning,
                inlineToolbar: true,
                config: {
                    titlePlaceholder: 'Warning title',
                    messagePlaceholder: 'Warning message'
                }
            };
        }

        if (window.RawTool) {
            tools.raw = {
                class: window.RawTool,
                config: {
                    placeholder: 'Enter raw HTML'
                }
            };
        }

        return tools;
    }

    handleLoadError() {
        console.error('Failed to load Editor.js dependencies');
        this.showFallbackEditor();
    }

    showFallbackEditor() {
        const editorArea = this.querySelector('#advanced-editor');
        editorArea.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Editor.js Loading Issue</h3>
                <p>The advanced editor couldn't load. Using fallback text editor.</p>
                <p><strong>To fix this:</strong> Add the required script tags to your page head before using this element.</p>
            </div>
            <textarea 
                class="fallback-editor"
                placeholder="Start writing your content here...">
            </textarea>
        `;

        // Setup basic functionality for fallback editor
        const textarea = editorArea.querySelector('.fallback-editor');
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.updateStatusFallback(textarea.value);
            });
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Save button
        const saveBtn = this.querySelector('#save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveContent();
            });
        }

        // Load button
        const loadBtn = this.querySelector('#load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadContent();
            });
        }

        // Clear button
        const clearBtn = this.querySelector('#clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearContent();
            });
        }

        // Export button
        const exportBtn = this.querySelector('#export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportContent();
            });
        }

        // Import button
        const importBtn = this.querySelector('#import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                const fileInput = this.querySelector('#import-file');
                if (fileInput) fileInput.click();
            });
        }

        // Import file handler
        const importFile = this.querySelector('#import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.importFile(e.target.files[0]);
                }
            });
        }

        // Theme toggle
        const themeBtn = this.querySelector('#theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Fullscreen toggle
        const fullscreenBtn = this.querySelector('#fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveContent();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportContent();
                        break;
                    case 'f':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.toggleFullscreen();
                        }
                        break;
                }
            }
        });
    }

    async saveContent() {
        try {
            if (this.editor && this.isInitialized) {
                const outputData = await this.editor.save();
                this.editorData = outputData;
                try {
                    localStorage.setItem('advanced-editor-content', JSON.stringify(outputData));
                    this.showNotification('Content saved successfully!', 'success');
                } catch (storageError) {
                    // Fallback if localStorage is not available (due to sandboxing)
                    this.editorData = outputData;
                    this.showNotification('Content saved to memory (storage not available)', 'warning');
                }
            } else {
                // Fallback editor
                const textarea = this.querySelector('.fallback-editor');
                if (textarea) {
                    const content = textarea.value;
                    try {
                        localStorage.setItem('advanced-editor-content-fallback', content);
                        this.showNotification('Content saved successfully!', 'success');
                    } catch (storageError) {
                        this.showNotification('Content saved to memory (storage not available)', 'warning');
                    }
                }
            }
        } catch (error) {
            console.error('Save failed:', error);
            this.showNotification('Failed to save content', 'error');
        }
    }

    async loadContent() {
        try {
            if (this.editor && this.isInitialized) {
                try {
                    const savedData = localStorage.getItem('advanced-editor-content');
                    if (savedData) {
                        const data = JSON.parse(savedData);
                        await this.editor.render(data);
                        this.showNotification('Content loaded successfully!', 'success');
                        this.updateStatus();
                    } else if (this.editorData) {
                        await this.editor.render(this.editorData);
                        this.showNotification('Content loaded from memory!', 'success');
                        this.updateStatus();
                    } else {
                        this.showNotification('No saved content found', 'warning');
                    }
                } catch (storageError) {
                    if (this.editorData) {
                        await this.editor.render(this.editorData);
                        this.showNotification('Content loaded from memory!', 'success');
                        this.updateStatus();
                    } else {
                        this.showNotification('No saved content found', 'warning');
                    }
                }
            } else {
                // Fallback editor
                const textarea = this.querySelector('.fallback-editor');
                if (textarea) {
                    try {
                        const savedContent = localStorage.getItem('advanced-editor-content-fallback');
                        if (savedContent) {
                            textarea.value = savedContent;
                            this.showNotification('Content loaded successfully!', 'success');
                            this.updateStatusFallback(savedContent);
                        } else {
                            this.showNotification('No saved content found', 'warning');
                        }
                    } catch (storageError) {
                        this.showNotification('Storage not available', 'warning');
                    }
                }
            }
        } catch (error) {
            console.error('Load failed:', error);
            this.showNotification('Failed to load content', 'error');
        }
    }

    async clearContent() {
        if (confirm('Are you sure you want to clear all content?')) {
            try {
                if (this.editor && this.isInitialized) {
                    await this.editor.clear();
                    this.showNotification('Content cleared', 'success');
                    this.updateStatus();
                } else {
                    const textarea = this.querySelector('.fallback-editor');
                    if (textarea) {
                        textarea.value = '';
                        this.updateStatusFallback('');
                        this.showNotification('Content cleared', 'success');
                    }
                }
            } catch (error) {
                console.error('Clear failed:', error);
                this.showNotification('Failed to clear content', 'error');
            }
        }
    }

    async exportContent() {
        try {
            const format = this.querySelector('#export-format').value;
            let content, filename, mimeType;

            if (this.editor && this.isInitialized) {
                const outputData = await this.editor.save();
                
                switch (format) {
                    case 'json':
                        content = JSON.stringify(outputData, null, 2);
                        filename = 'content.json';
                        mimeType = 'application/json';
                        break;
                    case 'html':
                        content = this.convertToHTML(outputData);
                        filename = 'content.html';
                        mimeType = 'text/html';
                        break;
                    case 'markdown':
                        content = this.convertToMarkdown(outputData);
                        filename = 'content.md';
                        mimeType = 'text/markdown';
                        break;
                    case 'plain':
                        content = this.convertToPlainText(outputData);
                        filename = 'content.txt';
                        mimeType = 'text/plain';
                        break;
                }
            } else {
                // Fallback editor
                const textarea = this.querySelector('.fallback-editor');
                content = textarea ? textarea.value : '';
                filename = 'content.txt';
                mimeType = 'text/plain';
            }

            this.downloadFile(content, filename, mimeType);
            this.showNotification(`Content exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export content', 'error');
        }
    }

    async importFile(file) {
        if (!file) return;

        try {
            const text = await file.text();
            
            if (this.editor && this.isInitialized) {
                let data;

                if (file.name.endsWith('.json')) {
                    data = JSON.parse(text);
                    await this.editor.render(data);
                } else if (file.name.endsWith('.md')) {
                    data = this.convertFromMarkdown(text);
                    await this.editor.render(data);
                } else {
                    // Plain text or HTML
                    data = {
                        blocks: [{
                            type: 'paragraph',
                            data: { text: text }
                        }]
                    };
                    await this.editor.render(data);
                }
                this.updateStatus();
            } else {
                // Fallback editor
                const textarea = this.querySelector('.fallback-editor');
                if (textarea) {
                    textarea.value = text;
                    this.updateStatusFallback(text);
                }
            }

            this.showNotification('File imported successfully!', 'success');
        } catch (error) {
            console.error('Import failed:', error);
            this.showNotification('Failed to import file', 'error');
        }
    }

    toggleTheme() {
        const container = this.querySelector('.advanced-editor-container');
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        container.classList.toggle('dark', this.currentTheme === 'dark');
        this.showNotification(`Switched to ${this.currentTheme} theme`, 'info');
    }

    toggleFullscreen() {
        const container = this.querySelector('.advanced-editor-container');
        container.classList.toggle('fullscreen');
        
        const fullscreenBtn = this.querySelector('#fullscreen-btn');
        if (container.classList.contains('fullscreen')) {
            fullscreenBtn.innerHTML = '🗗 Exit';
            this.showNotification('Entered fullscreen mode', 'info');
        } else {
            fullscreenBtn.innerHTML = '⛶ Full';
            this.showNotification('Exited fullscreen mode', 'info');
        }
    }

    async updateStatus() {
        if (!this.editor || !this.isInitialized) return;
        
        try {
            const data = await this.editor.save();
            const blocks = data.blocks || [];
            
            let wordCount = 0;
            let charCount = 0;
            
            blocks.forEach(block => {
                if (block.data && block.data.text) {
                    const text = this.stripHTML(block.data.text);
                    wordCount += text.split(/\s+/).filter(word => word.length > 0).length;
                    charCount += text.length;
                }
            });

            const wordCountEl = this.querySelector('#word-count');
            const charCountEl = this.querySelector('#char-count');
            const blockCountEl = this.querySelector('#block-count');

            if (wordCountEl) wordCountEl.textContent = `Words: ${wordCount}`;
            if (charCountEl) charCountEl.textContent = `Characters: ${charCount}`;
            if (blockCountEl) blockCountEl.textContent = `Blocks: ${blocks.length}`;
        } catch (error) {
            console.error('Status update failed:', error);
        }
    }

    updateStatusFallback(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;

        const wordCountEl = this.querySelector('#word-count');
        const charCountEl = this.querySelector('#char-count');
        const blockCountEl = this.querySelector('#block-count');

        if (wordCountEl) wordCountEl.textContent = `Words: ${words}`;
        if (charCountEl) charCountEl.textContent = `Characters: ${chars}`;
        if (blockCountEl) blockCountEl.textContent = `Blocks: 1`;
    }

    // Conversion methods remain the same as in original code
    convertToHTML(data) {
        let html = '<div class="editor-content">\n';
        
        data.blocks.forEach(block => {
            switch (block.type) {
                case 'header':
                    html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>\n`;
                    break;
                case 'paragraph':
                    html += `<p>${block.data.text}</p>\n`;
                    break;
                case 'list':
                    const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                    html += `<${tag}>\n`;
                    block.data.items.forEach(item => {
                        html += `<li>${item}</li>\n`;
                    });
                    html += `</${tag}>\n`;
                    break;
                case 'quote':
                    html += `<blockquote>\n<p>${block.data.text}</p>\n`;
                    if (block.data.caption) {
                        html += `<cite>${block.data.caption}</cite>\n`;
                    }
                    html += `</blockquote>\n`;
                    break;
                case 'code':
                    html += `<pre><code>${this.escapeHTML(block.data.code)}</code></pre>\n`;
                    break;
                case 'delimiter':
                    html += `<hr>\n`;
                    break;
                case 'table':
                    html += `<table>\n`;
                    block.data.content.forEach((row, index) => {
                        html += `<tr>\n`;
                        row.forEach(cell => {
                            const tag = index === 0 ? 'th' : 'td';
                            html += `<${tag}>${cell}</${tag}>\n`;
                        });
                        html += `</tr>\n`;
                    });
                    html += `</table>\n`;
                    break;
                case 'image':
                    const imageUrl = block.data.url || block.data.file?.url || '';
                    html += `<img src="${imageUrl}" alt="${block.data.caption || ''}">\n`;
                    if (block.data.caption) {
                        html += `<figcaption>${block.data.caption}</figcaption>\n`;
                    }
                    break;
                default:
                    html += `<!-- Unsupported block type: ${block.type} -->\n`;
            }
        });
        
        html += '</div>';
        return html;
    }

    convertToMarkdown(data) {
        let markdown = '';
        
        data.blocks.forEach(block => {
            switch (block.type) {
                case 'header':
                    markdown += `${'#'.repeat(block.data.level)} ${this.stripHTML(block.data.text)}\n\n`;
                    break;
                case 'paragraph':
                    markdown += `${this.stripHTML(block.data.text)}\n\n`;
                    break;
                case 'list':
                    block.data.items.forEach((item, index) => {
                        const prefix = block.data.style === 'ordered' ? `${index + 1}. ` : '- ';
                        markdown += `${prefix}${this.stripHTML(item)}\n`;
                    });
                    markdown += '\n';
                    break;
                case 'quote':
                    markdown += `> ${this.stripHTML(block.data.text)}\n`;
                    if (block.data.caption) {
                        markdown += `> \n> — ${this.stripHTML(block.data.caption)}\n`;
                    }
                    markdown += '\n';
                    break;
                case 'code':
                    markdown += `\`\`\`\n${block.data.code}\n\`\`\`\n\n`;
                    break;
                case 'delimiter':
                    markdown += `---\n\n`;
                    break;
                case 'image':
                    const imageUrl = block.data.url || block.data.file?.url || '';
                    markdown += `![${block.data.caption || ''}](${imageUrl})\n\n`;
                    break;
                default:
                    markdown += `<!-- Unsupported block type: ${block.type} -->\n\n`;
            }
        });
        
        return markdown;
    }

    convertToPlainText(data) {
        let text = '';
        
        data.blocks.forEach(block => {
            switch (block.type) {
                case 'header':
                    text += `${this.stripHTML(block.data.text)}\n${'='.repeat(this.stripHTML(block.data.text).length)}\n\n`;
                    break;
                case 'paragraph':
                    text += `${this.stripHTML(block.data.text)}\n\n`;
                    break;
                case 'list':
                    block.data.items.forEach((item, index) => {
                        const prefix = block.data.style === 'ordered' ? `${index + 1}. ` : '• ';
                        text += `${prefix}${this.stripHTML(item)}\n`;
                    });
                    text += '\n';
                    break;
                case 'quote':
                    text += `"${this.stripHTML(block.data.text)}"\n`;
                    if (block.data.caption) {
                        text += `— ${this.stripHTML(block.data.caption)}\n`;
                    }
                    text += '\n';
                    break;
                case 'code':
                    text += `${block.data.code}\n\n`;
                    break;
                case 'delimiter':
                    text += `${'─'.repeat(50)}\n\n`;
                    break;
                default:
                    // Skip unsupported blocks in plain text
                    break;
            }
        });
        
        return text;
    }

    convertFromMarkdown(markdown) {
        // Basic markdown to Editor.js conversion
        const lines = markdown.split('\n');
        const blocks = [];
        let currentBlock = null;

        lines.forEach(line => {
            line = line.trim();
            
            if (line.startsWith('#')) {
                const level = line.match(/^#+/)[0].length;
                blocks.push({
                    type: 'header',
                    data: {
                        text: line.replace(/^#+\s*/, ''),
                        level: Math.min(level, 6)
                    }
                });
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                if (!currentBlock || currentBlock.type !== 'list') {
                    currentBlock = {
                        type: 'list',
                        data: {
                            style: 'unordered',
                            items: []
                        }
                    };
                    blocks.push(currentBlock);
                }
                currentBlock.data.items.push(line.replace(/^[-*]\s*/, ''));
            } else if (line.match(/^\d+\.\s/)) {
                if (!currentBlock || currentBlock.type !== 'list') {
                    currentBlock = {
                        type: 'list',
                        data: {
                            style: 'ordered',
                            items: []
                        }
                    };
                    blocks.push(currentBlock);
                }
                currentBlock.data.items.push(line.replace(/^\d+\.\s*/, ''));
            } else if (line.startsWith('> ')) {
                blocks.push({
                    type: 'quote',
                    data: {
                        text: line.replace(/^>\s*/, ''),
                        caption: ''
                    }
                });
                currentBlock = null;
            } else if (line === '---') {
                blocks.push({
                    type: 'delimiter',
                    data: {}
                });
                currentBlock = null;
            } else if (line && line !== '') {
                blocks.push({
                    type: 'paragraph',
                    data: {
                        text: line
                    }
                });
                currentBlock = null;
            } else {
                currentBlock = null;
            }
        });

        return { blocks };
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#007bff'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API methods
    async getContent() {
        if (this.editor && this.isInitialized) {
            return await this.editor.save();
        } else {
            const textarea = this.querySelector('.fallback-editor');
            return textarea ? textarea.value : '';
        }
    }

    async setContent(data) {
        if (this.editor && this.isInitialized) {
            return await this.editor.render(data);
        } else {
            const textarea = this.querySelector('.fallback-editor');
            if (textarea) {
                textarea.value = typeof data === 'string' ? data : JSON.stringify(data);
                this.updateStatusFallback(textarea.value);
            }
        }
    }

    async clearEditor() {
        if (this.editor && this.isInitialized) {
            return await this.editor.clear();
        } else {
            const textarea = this.querySelector('.fallback-editor');
            if (textarea) {
                textarea.value = '';
                this.updateStatusFallback('');
            }
        }
    }
}

// Define the custom element
customElements.define('advanced-rich-editor', AdvancedRichEditor);

// Export for use in Wix
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedRichEditor;
}
