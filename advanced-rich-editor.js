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
        this.initAttempts = 0;
        this.maxAttempts = 50; // Increased attempts
    }

    connectedCallback() {
        this.render();
        this.initializeWhenReady();
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
                            <p>Initializing Editor...</p>
                            <p class="status-text">Checking for EditorJS...</p>
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

            .status-text {
                font-size: 12px;
                color: #999;
                margin-top: 8px;
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

    updateStatus(message) {
        const statusEl = this.querySelector('.status-text');
        if (statusEl) {
            statusEl.textContent = message;
        }
        console.log('Editor Status:', message);
    }

    initializeWhenReady() {
        this.initAttempts++;
        
        if (this.initAttempts > this.maxAttempts) {
            this.updateStatus('Timeout - Loading fallback editor');
            this.showFallbackEditor();
            return;
        }

        // Check if EditorJS is available
        if (typeof EditorJS === 'undefined') {
            this.updateStatus(`Waiting for EditorJS... (${this.initAttempts}/${this.maxAttempts})`);
            setTimeout(() => this.initializeWhenReady(), 200);
            return;
        }

        this.updateStatus('EditorJS found! Checking plugins...');
        
        // Check for available plugins
        const availablePlugins = this.checkAvailablePlugins();
        this.updateStatus(`Found ${availablePlugins.length} plugins. Initializing...`);
        
        setTimeout(() => this.initializeEditor(availablePlugins), 100);
    }

    checkAvailablePlugins() {
        const plugins = [];
        
        // Check each plugin availability
        if (typeof Header !== 'undefined') plugins.push('Header');
        if (typeof List !== 'undefined') plugins.push('List');
        if (typeof Checklist !== 'undefined') plugins.push('Checklist');
        if (typeof Quote !== 'undefined') plugins.push('Quote');
        if (typeof CodeTool !== 'undefined') plugins.push('CodeTool');
        if (typeof Delimiter !== 'undefined') plugins.push('Delimiter');
        if (typeof Table !== 'undefined') plugins.push('Table');
        if (typeof SimpleImage !== 'undefined') plugins.push('SimpleImage');
        if (typeof Embed !== 'undefined') plugins.push('Embed');
        if (typeof LinkTool !== 'undefined') plugins.push('LinkTool');
        if (typeof Marker !== 'undefined') plugins.push('Marker');
        if (typeof InlineCode !== 'undefined') plugins.push('InlineCode');
        if (typeof Warning !== 'undefined') plugins.push('Warning');
        if (typeof RawTool !== 'undefined') plugins.push('RawTool');
        
        console.log('Available plugins:', plugins);
        return plugins;
    }

    initializeEditor(availablePlugins) {
        if (this.isInitialized) return;

        try {
            // Clear the loading message
            const editorContainer = this.querySelector('#advanced-editor');
            editorContainer.innerHTML = '';

            // Build tools configuration based on available plugins
            const tools = this.buildToolsConfig(availablePlugins);
            
            console.log('Initializing EditorJS with tools:', Object.keys(tools));

            this.editor = new EditorJS({
                holder: 'advanced-editor',
                placeholder: 'Start writing your amazing content here...',
                autofocus: true,
                tools: tools,
                onChange: () => {
                    this.updateWordCount();
                },
                onReady: () => {
                    console.log('Advanced Rich Editor is ready!');
                    this.isInitialized = true;
                    this.setupEventListeners();
                    this.updateWordCount();
                    this.showNotification('Editor loaded successfully!', 'success');
                }
            });

        } catch (error) {
            console.error('Error initializing editor:', error);
            this.showFallbackEditor();
        }
    }

    buildToolsConfig(availablePlugins) {
        const tools = {};

        // Header tool
        if (availablePlugins.includes('Header')) {
            tools.header = {
                class: Header,
                config: {
                    placeholder: 'Enter a header',
                    levels: [1, 2, 3, 4, 5, 6],
                    defaultLevel: 2
                },
                shortcut: 'CMD+SHIFT+H'
            };
        }

        // List tool
        if (availablePlugins.includes('List')) {
            tools.list = {
                class: List,
                inlineToolbar: true,
                config: {
                    defaultStyle: 'unordered'
                }
            };
        }

        // Checklist tool
        if (availablePlugins.includes('Checklist')) {
            tools.checklist = {
                class: Checklist,
                inlineToolbar: true
            };
        }

        // Quote tool
        if (availablePlugins.includes('Quote')) {
            tools.quote = {
                class: Quote,
                inlineToolbar: true,
                config: {
                    quotePlaceholder: 'Enter a quote',
                    captionPlaceholder: 'Quote author'
                }
            };
        }

        // Code tool
        if (availablePlugins.includes('CodeTool')) {
            tools.code = {
                class: CodeTool,
                config: {
                    placeholder: 'Enter your code here...'
                }
            };
        }

        // Delimiter tool
        if (availablePlugins.includes('Delimiter')) {
            tools.delimiter = Delimiter;
        }

        // Table tool
        if (availablePlugins.includes('Table')) {
            tools.table = {
                class: Table,
                inlineToolbar: true,
                config: {
                    rows: 2,
                    cols: 3
                }
            };
        }

        // Simple Image tool
        if (availablePlugins.includes('SimpleImage')) {
            tools.image = {
                class: SimpleImage,
                config: {
                    placeholder: 'Paste image URL here...'
                }
            };
        }

        // Embed tool
        if (availablePlugins.includes('Embed')) {
            tools.embed = {
                class: Embed,
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

        // Link tool
        if (availablePlugins.includes('LinkTool')) {
            tools.linkTool = {
                class: LinkTool,
                config: {
                    endpoint: 'https://jsonplaceholder.typicode.com/posts/1'
                }
            };
        }

        // Marker tool (inline)
        if (availablePlugins.includes('Marker')) {
            tools.marker = {
                class: Marker,
                shortcut: 'CMD+SHIFT+M'
            };
        }

        // Inline Code tool
        if (availablePlugins.includes('InlineCode')) {
            tools.inlineCode = {
                class: InlineCode,
                shortcut: 'CMD+SHIFT+C'
            };
        }

        // Warning tool
        if (availablePlugins.includes('Warning')) {
            tools.warning = {
                class: Warning,
                inlineToolbar: true,
                config: {
                    titlePlaceholder: 'Warning title',
                    messagePlaceholder: 'Warning message'
                }
            };
        }

        // Raw HTML tool
        if (availablePlugins.includes('RawTool')) {
            tools.raw = {
                class: RawTool,
                config: {
                    placeholder: 'Enter raw HTML'
                }
            };
        }

        console.log('Built tools config:', tools);
        return tools;
    }

    showFallbackEditor() {
        const editorArea = this.querySelector('#advanced-editor');
        editorArea.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Editor.js Loading Issue</h3>
                <p>The advanced editor couldn't load. Using fallback text editor.</p>
                <p><strong>To fix this:</strong> Add the required script tags to your page head before using this element.</p>
                <details>
                    <summary>Missing dependencies:</summary>
                    <p>EditorJS: ${typeof EditorJS !== 'undefined' ? '✅' : '❌'}</p>
                    <p>Header: ${typeof Header !== 'undefined' ? '✅' : '❌'}</p>
                    <p>List: ${typeof List !== 'undefined' ? '✅' : '❌'}</p>
                    <p>Quote: ${typeof Quote !== 'undefined' ? '✅' : '❌'}</p>
                    <p>And others...</p>
                </details>
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
                this.updateWordCountFallback(textarea.value);
            });
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Save button
        const saveBtn = this.querySelector('#save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveContent());
        }

        // Load button
        const loadBtn = this.querySelector('#load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadContent());
        }

        // Clear button
        const clearBtn = this.querySelector('#clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearContent());
        }

        // Export button
        const exportBtn = this.querySelector('#export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportContent());
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
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Fullscreen toggle
        const fullscreenBtn = this.querySelector('#fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
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
                    this.editorData = outputData;
                    this.showNotification('Content saved to memory', 'warning');
                }
            } else {
                const textarea = this.querySelector('.fallback-editor');
                if (textarea) {
                    const content = textarea.value;
                    try {
                        localStorage.setItem('advanced-editor-content-fallback', content);
                        this.showNotification('Content saved successfully!', 'success');
                    } catch (storageError) {
                        this.showNotification('Content saved to memory', 'warning');
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
                        this.updateWordCount();
                    } else if (this.editorData) {
                        await this.editor.render(this.editorData);
                        this.showNotification('Content loaded from memory!', 'success');
                        this.updateWordCount();
                    } else {
                        this.showNotification('No saved content found', 'warning');
                    }
                } catch (storageError) {
                    if (this.editorData) {
                        await this.editor.render(this.editorData);
                        this.showNotification('Content loaded from memory!', 'success');
                        this.updateWordCount();
                    } else {
                        this.showNotification('No saved content found', 'warning');
                    }
                }
            } else {
                const textarea = this.querySelector('.fallback-editor');
                if (textarea) {
                    try {
                        const savedContent = localStorage.getItem('advanced-editor-content-fallback');
                        if (savedContent) {
                            textarea.value = savedContent;
                            this.showNotification('Content loaded successfully!', 'success');
                            this.updateWordCountFallback(savedContent);
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
                    this.updateWordCount();
                } else {
                    const textarea = this.querySelector('.fallback-editor');
                    if (textarea) {
                        textarea.value = '';
                        this.updateWordCountFallback('');
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
                    data = {
                        blocks: [{
                            type: 'paragraph',
                            data: { text: text }
                        }]
                    };
                    await this.editor.render(data);
                }
                this.updateWordCount();
            } else {
                const textarea = this.querySelector('.fallback-editor');
                if (textarea) {
                    textarea.value = text;
                    this.updateWordCountFallback(text);
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

    async updateWordCount() {
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

    updateWordCountFallback(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;

        const wordCountEl = this.querySelector('#word-count');
        const charCountEl = this.querySelector('#char-count');
        const blockCountEl = this.querySelector('#block-count');

        if (wordCountEl) wordCountEl.textContent = `Words: ${words}`;
        if (charCountEl) charCountEl.textContent = `Characters: ${chars}`;
        if (blockCountEl) blockCountEl.textContent = `Blocks: 1`;
    }

    // Conversion methods (simplified versions to save space)
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
                    html += `<blockquote><p>${block.data.text}</p>`;
                    if (block.data.caption) html += `<cite>${block.data.caption}</cite>`;
                    html += `</blockquote>\n`;
                    break;
                case 'code':
                    html += `<pre><code>${this.escapeHTML(block.data.code)}</code></pre>\n`;
                    break;
                case 'delimiter':
                    html += `<hr>\n`;
                    break;
                default:
                    html += `<!-- ${block.type} -->\n`;
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
                    markdown += `> ${this.stripHTML(block.data.text)}\n\n`;
                    break;
                case 'code':
                    markdown += `\`\`\`\n${block.data.code}\n\`\`\`\n\n`;
                    break;
                case 'delimiter':
                    markdown += `---\n\n`;
                    break;
            }
        });
        return markdown;
    }

    convertToPlainText(data) {
        let text = '';
        data.blocks.forEach(block => {
            switch (block.type) {
                case 'header':
                    text += `${this.stripHTML(block.data.text)}\n${'='.repeat(20)}\n\n`;
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
                    text += `"${this.stripHTML(block.data.text)}"\n\n`;
                    break;
                case 'code':
                    text += `${block.data.code}\n\n`;
                    break;
                case 'delimiter':
                    text += `${'─'.repeat(50)}\n\n`;
                    break;
            }
        });
        return text;
    }

    convertFromMarkdown(markdown) {
        const lines = markdown.split('\n');
        const blocks = [];
        
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
            } else if (line && line !== '') {
                blocks.push({
                    type: 'paragraph',
                    data: { text: line }
                });
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
                this.updateWordCountFallback(textarea.value);
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
                this.updateWordCountFallback('');
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
