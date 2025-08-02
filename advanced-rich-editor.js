/**
 * Advanced Rich Content Editor - Wix Custom Element
 * File: advanced-rich-editor.js
 * Tag: <advanced-rich-editor>
 */

class AdvancedRichEditor extends HTMLElement {
    constructor() {
        super();
        this.editor = null;
        this.editorData = null;
        this.currentTheme = 'light';
    }

    connectedCallback() {
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
                    <div id="advanced-editor" class="editor-area"></div>
                </div>
                
                <div class="editor-status">
                    <span id="word-count">Words: 0</span>
                    <span id="char-count">Characters: 0</span>
                    <span id="block-count">Blocks: 0</span>
                </div>
            </div>
        `;

        this.addStyles();
        this.loadEditorJS();
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
        `;
        this.appendChild(style);
    }

    async loadEditorJS() {
        // Wait for Editor.js to load
        if (typeof EditorJS === 'undefined') {
            setTimeout(() => this.loadEditorJS(), 100);
            return;
        }

        try {
            // Initialize Editor.js with comprehensive plugins
            this.editor = new EditorJS({
                holder: 'advanced-editor',
                placeholder: 'Start writing your amazing content here...',
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
                    paragraph: {
                        class: Paragraph,
                        inlineToolbar: true,
                        config: {
                            placeholder: 'Tell your story...'
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
                        inlineToolbar: true
                    },
                    quote: {
                        class: Quote,
                        inlineToolbar: true,
                        config: {
                            quotePlaceholder: 'Enter a quote',
                            captionPlaceholder: 'Quote author'
                        }
                    },
                    code: {
                        class: CodeTool,
                        config: {
                            placeholder: 'Enter your code here...'
                        }
                    },
                    delimiter: Delimiter,
                    table: {
                        class: Table,
                        inlineToolbar: true,
                        config: {
                            rows: 2,
                            cols: 3
                        }
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            endpoints: {
                                byFile: '/upload-image',
                                byUrl: '/fetch-image'
                            },
                            field: 'image',
                            types: 'image/*',
                            captionPlaceholder: 'Image caption',
                            buttonContent: 'Select an image',
                            uploader: {
                                uploadByFile: this.uploadImageByFile.bind(this),
                                uploadByUrl: this.uploadImageByUrl.bind(this)
                            }
                        }
                    },
                    embed: {
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
                    },
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: '/fetch-url'
                        }
                    },
                    marker: {
                        class: Marker,
                        shortcut: 'CMD+SHIFT+M'
                    },
                    inlineCode: {
                        class: InlineCode,
                        shortcut: 'CMD+SHIFT+C'
                    },
                    warning: {
                        class: Warning,
                        inlineToolbar: true,
                        config: {
                            titlePlaceholder: 'Warning title',
                            messagePlaceholder: 'Warning message'
                        }
                    },
                    raw: {
                        class: RawTool,
                        config: {
                            placeholder: 'Enter raw HTML'
                        }
                    }
                },
                onChange: () => {
                    this.updateStatus();
                },
                onReady: () => {
                    console.log('Advanced Rich Editor is ready!');
                    this.updateStatus();
                }
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing editor:', error);
            this.showFallbackEditor();
        }
    }

    setupEventListeners() {
        // Save button
        this.querySelector('#save-btn').addEventListener('click', () => {
            this.saveContent();
        });

        // Load button
        this.querySelector('#load-btn').addEventListener('click', () => {
            this.loadContent();
        });

        // Clear button
        this.querySelector('#clear-btn').addEventListener('click', () => {
            this.clearContent();
        });

        // Export button
        this.querySelector('#export-btn').addEventListener('click', () => {
            this.exportContent();
        });

        // Import button
        this.querySelector('#import-btn').addEventListener('click', () => {
            this.querySelector('#import-file').click();
        });

        // Import file handler
        this.querySelector('#import-file').addEventListener('change', (e) => {
            this.importFile(e.target.files[0]);
        });

        // Theme toggle
        this.querySelector('#theme-btn').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Fullscreen toggle
        this.querySelector('#fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

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
            const outputData = await this.editor.save();
            this.editorData = outputData;
            localStorage.setItem('advanced-editor-content', JSON.stringify(outputData));
            this.showNotification('Content saved successfully!', 'success');
        } catch (error) {
            console.error('Save failed:', error);
            this.showNotification('Failed to save content', 'error');
        }
    }

    async loadContent() {
        try {
            const savedData = localStorage.getItem('advanced-editor-content');
            if (savedData) {
                const data = JSON.parse(savedData);
                await this.editor.render(data);
                this.showNotification('Content loaded successfully!', 'success');
                this.updateStatus();
            } else {
                this.showNotification('No saved content found', 'warning');
            }
        } catch (error) {
            console.error('Load failed:', error);
            this.showNotification('Failed to load content', 'error');
        }
    }

    async clearContent() {
        if (confirm('Are you sure you want to clear all content?')) {
            try {
                await this.editor.clear();
                this.showNotification('Content cleared', 'success');
                this.updateStatus();
            } catch (error) {
                console.error('Clear failed:', error);
            }
        }
    }

    async exportContent() {
        try {
            const outputData = await this.editor.save();
            const format = this.querySelector('#export-format').value;
            let content, filename, mimeType;

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

            this.showNotification('File imported successfully!', 'success');
            this.updateStatus();
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
        
        if (container.classList.contains('fullscreen')) {
            this.querySelector('#fullscreen-btn').innerHTML = '🗗 Exit';
            this.showNotification('Entered fullscreen mode', 'info');
        } else {
            this.querySelector('#fullscreen-btn').innerHTML = '⛶ Full';
            this.showNotification('Exited fullscreen mode', 'info');
        }
    }

    async updateStatus() {
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

            this.querySelector('#word-count').textContent = `Words: ${wordCount}`;
            this.querySelector('#char-count').textContent = `Characters: ${charCount}`;
            this.querySelector('#block-count').textContent = `Blocks: ${blocks.length}`;
        } catch (error) {
            console.error('Status update failed:', error);
        }
    }

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
                    html += `<img src="${block.data.file.url}" alt="${block.data.caption || ''}">\n`;
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
                    markdown += `![${block.data.caption || ''}](${block.data.file.url})\n\n`;
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

    async uploadImageByFile(file) {
        // Mock image upload - in real implementation, upload to your server
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    success: 1,
                    file: {
                        url: e.target.result
                    }
                });
            };
            reader.readAsDataURL(file);
        });
    }

    async uploadImageByUrl(url) {
        // Mock URL fetch - in real implementation, validate and process URL
        return {
            success: 1,
            file: {
                url: url
            }
        };
    }

    showFallbackEditor() {
        this.querySelector('#advanced-editor').innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <h3>Editor.js failed to load</h3>
                <p>Falling back to basic text editor...</p>
                <textarea 
                    style="width: 100%; height: 300px; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit;"
                    placeholder="Start writing your content here...">
                </textarea>
            </div>
        `;
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
        return await this.editor.save();
    }

    async setContent(data) {
        return await this.editor.render(data);
    }

    async clearEditor() {
        return await this.editor.clear();
    }
}

// Define the custom element
customElements.define('advanced-rich-editor', AdvancedRichEditor);

// Export for use in Wix
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedRichEditor;
}
