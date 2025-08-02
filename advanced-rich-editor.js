// Custom Element: <advanced-rich-editor>
// File: advanced-rich-editor.js

import { OverlayEngine } from '@wix/native-components-infra/overlay-engine';

export default class AdvancedRichEditor extends HTMLElement {
    constructor() {
        super();
        this.quill = null;
        this.isFullscreen = false;
        this.currentTheme = 'light';
    }

    connectedCallback() {
        this.innerHTML = this.getHTML();
        this.loadExternalLibraries().then(() => {
            this.initializeEditor();
            this.setupEventListeners();
            this.applyNeumorphicStyles();
        });
    }

    async loadExternalLibraries() {
        // Load Quill.js
        if (!window.Quill) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js');
            await this.loadCSS('https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css');
        }
        
        // Load jsPDF for PDF export
        if (!window.jsPDF) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        
        // Load html2canvas for screenshot functionality
        if (!window.html2canvas) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        
        // Load Turndown for HTML to Markdown conversion
        if (!window.TurndownService) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/turndown/7.1.2/turndown.min.js');
        }
        
        // Load Prism.js for syntax highlighting
        if (!window.Prism) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js');
            await this.loadCSS('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css');
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    loadCSS(href) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            document.head.appendChild(link);
        });
    }

    getHTML() {
        return `
            <div class="are-container">
                <div class="are-header">
                    <div class="are-title">Advanced Rich Editor</div>
                    <div class="are-header-controls">
                        <button class="are-btn are-theme-toggle" title="Toggle Theme">🌓</button>
                        <button class="are-btn are-fullscreen" title="Toggle Fullscreen">⛶</button>
                        <button class="are-btn are-settings" title="Settings">⚙️</button>
                    </div>
                </div>
                
                <div class="are-toolbar-container">
                    <div class="are-main-toolbar">
                        <!-- Basic formatting -->
                        <div class="are-toolbar-group">
                            <button class="are-tool-btn" data-action="bold" title="Bold">𝐁</button>
                            <button class="are-tool-btn" data-action="italic" title="Italic">𝐼</button>
                            <button class="are-tool-btn" data-action="underline" title="Underline">𝐔</button>
                            <button class="are-tool-btn" data-action="strike" title="Strikethrough">𝐒</button>
                        </div>
                        
                        <!-- Headers -->
                        <div class="are-toolbar-group">
                            <select class="are-select" data-action="header">
                                <option value="">Normal</option>
                                <option value="1">Heading 1</option>
                                <option value="2">Heading 2</option>
                                <option value="3">Heading 3</option>
                                <option value="4">Heading 4</option>
                                <option value="5">Heading 5</option>
                                <option value="6">Heading 6</option>
                            </select>
                        </div>
                        
                        <!-- Colors -->
                        <div class="are-toolbar-group">
                            <input type="color" class="are-color-picker" data-action="color" value="#000000" title="Text Color">
                            <input type="color" class="are-color-picker" data-action="background" value="#ffffff" title="Background Color">
                        </div>
                        
                        <!-- Lists -->
                        <div class="are-toolbar-group">
                            <button class="are-tool-btn" data-action="list-ordered" title="Numbered List">📝</button>
                            <button class="are-tool-btn" data-action="list-bullet" title="Bullet List">•</button>
                            <button class="are-tool-btn" data-action="indent-decrease" title="Decrease Indent">⬅</button>
                            <button class="are-tool-btn" data-action="indent-increase" title="Increase Indent">➡</button>
                        </div>
                        
                        <!-- Alignment -->
                        <div class="are-toolbar-group">
                            <button class="are-tool-btn" data-action="align-left" title="Left Align">⬅</button>
                            <button class="are-tool-btn" data-action="align-center" title="Center Align">↔</button>
                            <button class="are-tool-btn" data-action="align-right" title="Right Align">➡</button>
                            <button class="are-tool-btn" data-action="align-justify" title="Justify">⟷</button>
                        </div>
                        
                        <!-- Media & Embeds -->
                        <div class="are-toolbar-group">
                            <button class="are-tool-btn" data-action="image" title="Insert Image">🖼️</button>
                            <button class="are-tool-btn" data-action="video" title="Insert Video">🎥</button>
                            <button class="are-tool-btn" data-action="link" title="Insert Link">🔗</button>
                            <button class="are-tool-btn" data-action="embed" title="Embed Content">📎</button>
                        </div>
                        
                        <!-- Advanced -->
                        <div class="are-toolbar-group">
                            <button class="are-tool-btn" data-action="code-block" title="Code Block">💻</button>
                            <button class="are-tool-btn" data-action="formula" title="Formula">∑</button>
                            <button class="are-tool-btn" data-action="table" title="Insert Table">⊞</button>
                            <button class="are-tool-btn" data-action="hr" title="Horizontal Rule">—</button>
                        </div>
                        
                        <!-- Undo/Redo -->
                        <div class="are-toolbar-group">
                            <button class="are-tool-btn" data-action="undo" title="Undo">↶</button>
                            <button class="are-tool-btn" data-action="redo" title="Redo">↷</button>
                        </div>
                    </div>
                </div>
                
                <div class="are-content-area">
                    <div class="are-sidebar">
                        <div class="are-sidebar-tab active" data-tab="embeds">📎</div>
                        <div class="are-sidebar-tab" data-tab="media">🖼️</div>
                        <div class="are-sidebar-tab" data-tab="templates">📋</div>
                        <div class="are-sidebar-tab" data-tab="export">📤</div>
                    </div>
                    
                    <div class="are-editor-wrapper">
                        <div id="are-editor" class="are-editor"></div>
                    </div>
                    
                    <div class="are-panel">
                        <!-- Embeds Panel -->
                        <div class="are-panel-content" data-panel="embeds">
                            <h3>Embed Content</h3>
                            <div class="are-embed-options">
                                <button class="are-embed-btn" data-embed="youtube">YouTube</button>
                                <button class="are-embed-btn" data-embed="instagram">Instagram</button>
                                <button class="are-embed-btn" data-embed="twitter">Twitter</button>
                                <button class="are-embed-btn" data-embed="tiktok">TikTok</button>
                                <button class="are-embed-btn" data-embed="spotify">Spotify</button>
                                <button class="are-embed-btn" data-embed="soundcloud">SoundCloud</button>
                                <button class="are-embed-btn" data-embed="vimeo">Vimeo</button>
                                <button class="are-embed-btn" data-embed="custom">Custom HTML</button>
                            </div>
                            <div class="are-embed-input">
                                <input type="text" placeholder="Paste URL or embed code..." class="are-input">
                                <button class="are-btn-primary">Insert</button>
                            </div>
                        </div>
                        
                        <!-- Media Panel -->
                        <div class="are-panel-content" data-panel="media" style="display: none;">
                            <h3>Media Library</h3>
                            <div class="are-media-upload">
                                <input type="file" id="are-file-input" accept="image/*,video/*,audio/*" multiple style="display: none;">
                                <button class="are-btn-primary" onclick="document.getElementById('are-file-input').click()">Upload Files</button>
                            </div>
                            <div class="are-media-gallery"></div>
                        </div>
                        
                        <!-- Templates Panel -->
                        <div class="are-panel-content" data-panel="templates" style="display: none;">
                            <h3>Templates</h3>
                            <div class="are-templates">
                                <div class="are-template" data-template="article">📄 Article</div>
                                <div class="are-template" data-template="blog">📝 Blog Post</div>
                                <div class="are-template" data-template="newsletter">📧 Newsletter</div>
                                <div class="are-template" data-template="report">📊 Report</div>
                            </div>
                        </div>
                        
                        <!-- Export Panel -->
                        <div class="are-panel-content" data-panel="export" style="display: none;">
                            <h3>Export Content</h3>
                            <div class="are-export-options">
                                <button class="are-export-btn" data-export="html">HTML</button>
                                <button class="are-export-btn" data-export="markdown">Markdown</button>
                                <button class="are-export-btn" data-export="pdf">PDF</button>
                                <button class="are-export-btn" data-export="json">JSON</button>
                                <button class="are-export-btn" data-export="docx">Word</button>
                                <button class="are-export-btn" data-export="image">Image</button>
                            </div>
                            <div class="are-export-settings">
                                <label><input type="checkbox" checked> Include Styles</label>
                                <label><input type="checkbox" checked> Include Media</label>
                                <label><input type="checkbox"> Compress Output</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="are-status-bar">
                    <span class="are-word-count">Words: 0</span>
                    <span class="are-char-count">Characters: 0</span>
                    <span class="are-reading-time">Reading time: 0 min</span>
                </div>
            </div>
        `;
    }

    applyNeumorphicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .are-container {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 20px;
                box-shadow: 20px 20px 60px #d1d1d4, -20px -20px 60px #ffffff;
                padding: 20px;
                max-width: 100%;
                min-height: 600px;
                transition: all 0.3s ease;
            }
            
            .are-container.dark {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: 20px 20px 60px #0f0f0f, -20px -20px 60px #3a3a3a;
                color: #e0e0e0;
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
                box-shadow: 5px 5px 15px rgba(102, 126, 234, 0.3), -5px -5px 15px rgba(118, 75, 162, 0.3);
            }
            
            .are-toolbar-container {
                margin-bottom: 20px;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                padding: 15px;
                box-shadow: inset 3px 3px 8px #d1d1d4, inset -3px -3px 8px #ffffff;
            }
            
            .are-container.dark .are-toolbar-container {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 3px 3px 8px #0f0f0f, inset -3px -3px 8px #3a3a3a;
            }
            
            .are-main-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                align-items: center;
            }
            
            .are-toolbar-group {
                display: flex;
                gap: 5px;
                align-items: center;
                padding: 5px;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                border-radius: 10px;
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
            }
            
            .are-container.dark .are-toolbar-group {
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
            }
            
            .are-container.dark .are-select,
            .are-container.dark .are-input {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
                color: #e0e0e0;
            }
            
            .are-color-picker {
                width: 40px;
                height: 30px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
            }
            
            .are-content-area {
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
            
            .are-sidebar-tab {
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
            }
            
            .are-container.dark .are-sidebar-tab {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: 2px 2px 5px #0f0f0f, -2px -2px 5px #3a3a3a;
            }
            
            .are-sidebar-tab.active {
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
                background: linear-gradient(145deg, #667eea, #764ba2);
            }
            
            .are-container.dark .are-sidebar-tab.active {
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
            }
            
            .are-editor-wrapper {
                flex: 1;
                background: linear-gradient(145deg, #f0f0f3, #e6e6e9);
                border-radius: 15px;
                box-shadow: inset 5px 5px 15px #d1d1d4, inset -5px -5px 15px #ffffff;
                padding: 20px;
            }
            
            .are-container.dark .are-editor-wrapper {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                box-shadow: inset 5px 5px 15px #0f0f0f, inset -5px -5px 15px #3a3a3a;
            }
            
            .are-editor {
                min-height: 350px;
                background: transparent;
                border: none;
                outline: none;
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
            
            .are-embed-options, .are-export-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin: 15px 0;
            }
            
            .are-embed-btn, .are-export-btn {
                padding: 10px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
                transition: all 0.2s ease;
                color: #333;
            }
            
            .are-container.dark .are-embed-btn,
            .are-container.dark .are-export-btn {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: 2px 2px 5px #0f0f0f, -2px -2px 5px #3a3a3a;
                color: #e0e0e0;
            }
            
            .are-embed-input {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            
            .are-embed-input .are-input {
                flex: 1;
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
            
            .are-templates {
                display: grid;
                gap: 10px;
            }
            
            .are-template {
                padding: 15px;
                border-radius: 10px;
                cursor: pointer;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                box-shadow: 2px 2px 5px #d1d1d4, -2px -2px 5px #ffffff;
                transition: all 0.2s ease;
            }
            
            .are-container.dark .are-template {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: 2px 2px 5px #0f0f0f, -2px -2px 5px #3a3a3a;
            }
            
            .are-template:hover {
                box-shadow: inset 2px 2px 5px #d1d1d4, inset -2px -2px 5px #ffffff;
            }
            
            .are-container.dark .are-template:hover {
                box-shadow: inset 2px 2px 5px #0f0f0f, inset -2px -2px 5px #3a3a3a;
            }
            
            .are-export-settings {
                margin-top: 15px;
            }
            
            .are-export-settings label {
                display: block;
                margin: 8px 0;
                font-size: 14px;
            }
            
            .are-export-settings input[type="checkbox"] {
                margin-right: 8px;
            }
            
            .are-container.fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9999;
                border-radius: 0;
                max-width: none;
            }
            
            /* Quill Editor Customization */
            .ql-editor {
                background: transparent !important;
                color: inherit !important;
                font-size: 16px;
                line-height: 1.6;
                padding: 0 !important;
            }
            
            .ql-toolbar {
                display: none !important;
            }
            
            /* Custom embed styles */
            .are-embed-container {
                margin: 20px 0;
                padding: 15px;
                border-radius: 12px;
                background: linear-gradient(145deg, #e6e6e9, #f0f0f3);
                box-shadow: inset 3px 3px 8px #d1d1d4, inset -3px -3px 8px #ffffff;
            }
            
            .are-container.dark .are-embed-container {
                background: linear-gradient(145deg, #1a1a1a, #2c2c2c);
                box-shadow: inset 3px 3px 8px #0f0f0f, inset -3px -3px 8px #3a3a3a;
            }
            
            @media (max-width: 768px) {
                .are-content-area {
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
                
                .are-main-toolbar {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .are-toolbar-group {
                    justify-content: center;
                }
            }
        `;
        this.appendChild(style);
    }

    initializeEditor() {
        // Custom Quill modules
        const BlockEmbed = window.Quill.import('blots/block/embed');
        
        // Custom YouTube embed
        class YouTubeBlot extends BlockEmbed {
            static create(value) {
                const node = super.create();
                node.setAttribute('src', `https://www.youtube.com/embed/${this.extractVideoId(value)}`);
                node.setAttribute('frameborder', '0');
                node.setAttribute('allowfullscreen', true);
                node.setAttribute('width', '100%');
                node.setAttribute('height', '315');
                return node;
            }
            
            static extractVideoId(url) {
                const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
                return match ? match[1] : '';
            }
            
            static value(node) {
                return node.getAttribute('src');
            }
        }
        YouTubeBlot.blotName = 'youtube';
        YouTubeBlot.tagName = 'iframe';
        
        // Register custom blots
        window.Quill.register(YouTubeBlot);
        
        // Initialize Quill with extensive configuration
        this.quill = new window.Quill(this.querySelector('#are-editor'), {
            theme: 'snow',
            modules: {
                toolbar: false,
                history: {
                    delay: 2000,
                    maxStack: 500,
                    userOnly: true
                },
                keyboard: {
                    bindings: {
                        bold: {
                            key: 'B',
                            ctrlKey: true,
                            handler: () => this.format('bold')
                        },
                        italic: {
                            key: 'I',
                            ctrlKey: true,
                            handler: () => this.format('italic')
                        },
                        underline: {
                            key: 'U',
                            ctrlKey: true,
                            handler: () => this.format('underline')
                        }
                    }
                }
            },
            formats: [
                'header', 'bold', 'italic', 'underline', 'strike',
                'blockquote', 'list', 'bullet', 'indent', 'align',
                'link', 'image', 'video', 'code-block', 'formula',
                'color', 'background', 'size', 'font', 'script',
                'youtube'
            ],
            placeholder: 'Start writing your amazing content...'
        });
        
        // Update status bar on text change
        this.quill.on('text-change', () => {
            this.updateStatusBar();
        });
    }

    setupEventListeners() {
        // Toolbar actions
        this.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleToolbarAction(action, e.target);
            }
            
            // Sidebar tabs
            if (e.target.classList.contains('are-sidebar-tab')) {
                this.switchPanel(e.target.dataset.tab);
            }
            
            // Embed buttons
            if (e.target.classList.contains('are-embed-btn')) {
                this.handleEmbed(e.target.dataset.embed);
            }
            
            // Export buttons
            if (e.target.classList.contains('are-export-btn')) {
                this.handleExport(e.target.dataset.export);
            }
            
            // Template selection
            if (e.target.classList.contains('are-template')) {
                this.loadTemplate(e.target.dataset.template);
            }
            
            // Theme toggle
            if (e.target.classList.contains('are-theme-toggle')) {
                this.toggleTheme();
            }
            
            // Fullscreen toggle
            if (e.target.classList.contains('are-fullscreen')) {
                this.toggleFullscreen();
            }
        });
        
        // Color picker changes
        this.addEventListener('change', (e) => {
            if (e.target.classList.contains('are-color-picker')) {
                const action = e.target.dataset.action;
                this.quill.format(action, e.target.value);
            }
            
            if (e.target.classList.contains('are-select')) {
                const action = e.target.dataset.action;
                const value = e.target.value || false;
                this.quill.format(action, value);
            }
        });
        
        // File upload
        const fileInput = this.querySelector('#are-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }
        
        // Embed input
        const embedInput = this.querySelector('.are-embed-input .are-input');
        const embedButton = this.querySelector('.are-embed-input .are-btn-primary');
        if (embedButton) {
            embedButton.addEventListener('click', () => {
                this.insertEmbed(embedInput.value);
                embedInput.value = '';
            });
        }
    }

    handleToolbarAction(action, element) {
        switch (action) {
            case 'bold':
            case 'italic':
            case 'underline':
            case 'strike':
                this.quill.format(action, !this.quill.getFormat()[action]);
                break;
                
            case 'list-ordered':
                this.quill.format('list', 'ordered');
                break;
                
            case 'list-bullet':
                this.quill.format('list', 'bullet');
                break;
                
            case 'indent-increase':
                this.quill.format('indent', '+1');
                break;
                
            case 'indent-decrease':
                this.quill.format('indent', '-1');
                break;
                
            case 'align-left':
                this.quill.format('align', false);
                break;
                
            case 'align-center':
                this.quill.format('align', 'center');
                break;
                
            case 'align-right':
                this.quill.format('align', 'right');
                break;
                
            case 'align-justify':
                this.quill.format('align', 'justify');
                break;
                
            case 'image':
                this.insertImage();
                break;
                
            case 'video':
                this.insertVideo();
                break;
                
            case 'link':
                this.insertLink();
                break;
                
            case 'code-block':
                this.quill.format('code-block', !this.quill.getFormat()['code-block']);
                break;
                
            case 'formula':
                this.insertFormula();
                break;
                
            case 'table':
                this.insertTable();
                break;
                
            case 'hr':
                this.insertHorizontalRule();
                break;
                
            case 'undo':
                this.quill.history.undo();
                break;
                
            case 'redo':
                this.quill.history.redo();
                break;
        }
    }

    insertImage() {
        const url = prompt('Enter image URL:');
        if (url) {
            const range = this.quill.getSelection();
            this.quill.insertEmbed(range.index, 'image', url);
        }
    }

    insertVideo() {
        const url = prompt('Enter video URL:');
        if (url) {
            const range = this.quill.getSelection();
            this.quill.insertEmbed(range.index, 'video', url);
        }
    }

    insertLink() {
        const url = prompt('Enter URL:');
        if (url) {
            const range = this.quill.getSelection();
            if (range.length > 0) {
                this.quill.format('link', url);
            } else {
                this.quill.insertText(range.index, url, 'link', url);
            }
        }
    }

    insertFormula() {
        const formula = prompt('Enter LaTeX formula:');
        if (formula) {
            const range = this.quill.getSelection();
            this.quill.insertEmbed(range.index, 'formula', formula);
        }
    }

    insertTable() {
        const rows = parseInt(prompt('Number of rows:')) || 3;
        const cols = parseInt(prompt('Number of columns:')) || 3;
        
        let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</table>';
        
        const range = this.quill.getSelection();
        this.quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
    }

    insertHorizontalRule() {
        const range = this.quill.getSelection();
        this.quill.insertText(range.index, '\n', 'user');
        this.quill.insertEmbed(range.index + 1, 'divider', true);
        this.quill.insertText(range.index + 2, '\n', 'user');
    }

    handleEmbed(type) {
        this.currentEmbedType = type;
        const input = this.querySelector('.are-embed-input .are-input');
        input.placeholder = `Enter ${type} URL...`;
        input.focus();
    }

    insertEmbed(url) {
        if (!url) return;
        
        const range = this.quill.getSelection();
        let embedHTML = '';
        
        // Parse different embed types
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = this.extractYouTubeId(url);
            embedHTML = `<div class="are-embed-container">
                <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
            </div>`;
        } else if (url.includes('instagram.com')) {
            const postId = this.extractInstagramId(url);
            embedHTML = `<div class="are-embed-container">
                <blockquote class="instagram-media" data-instgrm-permalink="${url}">
                    <p>Instagram post</p>
                </blockquote>
            </div>`;
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
            embedHTML = `<div class="are-embed-container">
                <blockquote class="twitter-tweet">
                    <a href="${url}">Tweet</a>
                </blockquote>
            </div>`;
        } else if (url.includes('tiktok.com')) {
            embedHTML = `<div class="are-embed-container">
                <blockquote class="tiktok-embed" cite="${url}">
                    <section>TikTok video</section>
                </blockquote>
            </div>`;
        } else if (url.includes('spotify.com')) {
            const trackId = this.extractSpotifyId(url);
            embedHTML = `<div class="are-embed-container">
                <iframe src="https://open.spotify.com/embed/track/${trackId}" width="100%" height="152" frameborder="0"></iframe>
            </div>`;
        } else if (url.includes('soundcloud.com')) {
            embedHTML = `<div class="are-embed-container">
                <iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}"></iframe>
            </div>`;
        } else if (url.includes('vimeo.com')) {
            const videoId = this.extractVimeoId(url);
            embedHTML = `<div class="are-embed-container">
                <iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="315" frameborder="0"></iframe>
            </div>`;
        } else {
            // Custom HTML embed
            embedHTML = `<div class="are-embed-container">${url}</div>`;
        }
        
        this.quill.clipboard.dangerouslyPasteHTML(range.index, embedHTML);
    }

    extractYouTubeId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return match ? match[1] : '';
    }

    extractInstagramId(url) {
        const match = url.match(/instagram\.com\/p\/([^\/]+)/);
        return match ? match[1] : '';
    }

    extractSpotifyId(url) {
        const match = url.match(/spotify\.com\/track\/([^?]+)/);
        return match ? match[1] : '';
    }

    extractVimeoId(url) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : '';
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const range = this.quill.getSelection();
                if (file.type.startsWith('image/')) {
                    this.quill.insertEmbed(range.index, 'image', e.target.result);
                } else if (file.type.startsWith('video/')) {
                    this.quill.insertEmbed(range.index, 'video', e.target.result);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    switchPanel(panelName) {
        // Update active tab
        this.querySelectorAll('.are-sidebar-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        this.querySelector(`[data-tab="${panelName}"]`).classList.add('active');
        
        // Show corresponding panel
        this.querySelectorAll('.are-panel-content').forEach(panel => {
            panel.style.display = 'none';
        });
        this.querySelector(`[data-panel="${panelName}"]`).style.display = 'block';
    }

    loadTemplate(templateName) {
        const templates = {
            article: `
                <h1>Article Title</h1>
                <p class="lead">This is the lead paragraph that summarizes the main points of your article.</p>
                <h2>Introduction</h2>
                <p>Start your article with an engaging introduction...</p>
                <h2>Main Content</h2>
                <p>Develop your main ideas here...</p>
                <h2>Conclusion</h2>
                <p>Wrap up your article with a strong conclusion...</p>
            `,
            blog: `
                <h1>Blog Post Title</h1>
                <p><em>Published on ${new Date().toLocaleDateString()}</em></p>
                <p>Hook your readers with an compelling opening...</p>
                <h3>Key Points</h3>
                <ul>
                    <li>First important point</li>
                    <li>Second important point</li>
                    <li>Third important point</li>
                </ul>
                <p>Expand on these points in detail...</p>
            `,
            newsletter: `
                <h1>Newsletter Title</h1>
                <p><strong>Issue #1 - ${new Date().toLocaleDateString()}</strong></p>
                <h2>📰 Top Stories</h2>
                <p>Highlight the most important news...</p>
                <h2>🔥 Featured Content</h2>
                <p>Showcase your best content...</p>
                <h2>📅 Upcoming Events</h2>
                <p>List upcoming events and dates...</p>
            `,
            report: `
                <h1>Report Title</h1>
                <h2>Executive Summary</h2>
                <p>Provide a brief overview of key findings...</p>
                <h2>Methodology</h2>
                <p>Describe how the research was conducted...</p>
                <h2>Findings</h2>
                <p>Present your main findings...</p>
                <h2>Recommendations</h2>
                <p>List actionable recommendations...</p>
                <h2>Conclusion</h2>
                <p>Summarize the report's conclusions...</p>
            `
        };
        
        if (templates[templateName]) {
            this.quill.clipboard.dangerouslyPasteHTML(0, templates[templateName]);
        }
    }

    handleExport(format) {
        const content = this.quill.root.innerHTML;
        const text = this.quill.getText();
        
        switch (format) {
            case 'html':
                this.exportHTML(content);
                break;
            case 'markdown':
                this.exportMarkdown(content);
                break;
            case 'pdf':
                this.exportPDF(content);
                break;
            case 'json':
                this.exportJSON();
                break;
            case 'docx':
                this.exportDOCX(content);
                break;
            case 'image':
                this.exportImage();
                break;
        }
    }

    exportHTML(content) {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Content</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        .are-embed-container { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
        
        this.downloadFile(htmlContent, 'content.html', 'text/html');
    }

    exportMarkdown(content) {
        if (window.TurndownService) {
            const turndownService = new window.TurndownService();
            const markdown = turndownService.turndown(content);
            this.downloadFile(markdown, 'content.md', 'text/markdown');
        }
    }

    exportPDF(content) {
        if (window.jsPDF) {
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            // Convert HTML to text for PDF (simplified)
            const text = this.quill.getText();
            const lines = doc.splitTextToSize(text, 180);
            
            doc.text(lines, 10, 10);
            doc.save('content.pdf');
        }
    }

    exportJSON() {
        const delta = this.quill.getContents();
        const jsonContent = JSON.stringify(delta, null, 2);
        this.downloadFile(jsonContent, 'content.json', 'application/json');
    }

    exportDOCX(content) {
        // Simplified DOCX export (would need a proper library for full implementation)
        const docxContent = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>${this.quill.getText()}</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>`;
        
        this.downloadFile(docxContent, 'content.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }

    exportImage() {
        if (window.html2canvas) {
            html2canvas(this.quill.root).then(canvas => {
                const link = document.createElement('a');
                link.download = 'content.png';
                link.href = canvas.toDataURL();
                link.click();
            });
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

    updateStatusBar() {
        const text = this.quill.getText();
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;
        const readingTime = Math.ceil(words / 200); // Average reading speed
        
        this.querySelector('.are-word-count').textContent = `Words: ${words}`;
        this.querySelector('.are-char-count').textContent = `Characters: ${chars}`;
        this.querySelector('.are-reading-time').textContent = `Reading time: ${readingTime} min`;
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
}

// Register the custom element
customElements.define('advanced-rich-editor', AdvancedRichEditor);
