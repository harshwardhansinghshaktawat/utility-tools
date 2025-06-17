// File name: advanced-code-editor.js
// Custom element tag: <advanced-code-editor></advanced-code-editor>

class AdvancedCodeEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.editor = null;
        this.monacoLoaded = false;
        this.initialized = false;
        this.loadingAttempts = 0;
        this.maxAttempts = 3;
    }

    static get observedAttributes() {
        return ['language', 'theme', 'value', 'readonly', 'height'];
    }

    connectedCallback() {
        this.render();
        this.loadEditor();
    }

    disconnectedCallback() {
        if (this.editor) {
            this.editor.dispose();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.editor || oldValue === newValue) return;

        switch (name) {
            case 'language':
                this.setLanguage(newValue);
                break;
            case 'theme':
                this.setTheme(newValue);
                break;
            case 'value':
                this.setValue(newValue);
                break;
            case 'readonly':
                this.setReadonly(newValue === 'true');
                break;
            case 'height':
                this.updateHeight(newValue);
                break;
        }
    }

    render() {
        const height = this.getAttribute('height') || '400px';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: ${height};
                    border: 1px solid #e1e4e8;
                    border-radius: 6px;
                    overflow: hidden;
                    font-family: 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
                    background: #f6f8fa;
                }

                .editor-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }

                .loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: #1e1e1e;
                    color: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    gap: 10px;
                }

                .loading-spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid #ffffff33;
                    border-top: 2px solid #ffffff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .toolbar {
                    background: #24292e;
                    border-bottom: 1px solid #444d56;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .toolbar select {
                    background: #444d56;
                    color: #fff;
                    border: 1px solid #6a737d;
                    border-radius: 3px;
                    padding: 4px 8px;
                    font-size: 11px;
                    outline: none;
                }

                .toolbar select:focus {
                    border-color: #0366d6;
                }

                .toolbar button {
                    background: #0366d6;
                    color: #fff;
                    border: none;
                    border-radius: 3px;
                    padding: 4px 12px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.2s;
                    outline: none;
                }

                .toolbar button:hover {
                    background: #0256cc;
                }

                .toolbar button:active {
                    background: #024ea4;
                }

                .editor-area {
                    flex: 1;
                    position: relative;
                    background: #fff;
                }

                .simple-editor {
                    width: 100%;
                    height: 100%;
                    border: none;
                    outline: none;
                    resize: none;
                    font-family: 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    padding: 12px;
                    background: #fff;
                    color: #24292e;
                    tab-size: 4;
                }

                .simple-editor.dark {
                    background: #1e1e1e;
                    color: #d4d4d4;
                }

                .error-message {
                    padding: 20px;
                    text-align: center;
                    color: #d73a49;
                    background: #ffeaea;
                    border: 1px solid #f97583;
                    margin: 10px;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .hidden {
                    display: none !important;
                }

                .retry-button {
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                }

                .retry-button:hover {
                    background: #218838;
                }
            </style>
            
            <div class="editor-container">
                <div class="toolbar">
                    <select id="languageSelect">
                        <option value="javascript">JavaScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="json">JSON</option>
                        <option value="markdown">Markdown</option>
                        <option value="sql">SQL</option>
                        <option value="xml">XML</option>
                        <option value="plaintext">Plain Text</option>
                    </select>
                    
                    <select id="themeSelect">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                    
                    <button id="formatBtn">Format Code</button>
                    <button id="copyBtn">Copy</button>
                    <button id="clearBtn">Clear</button>
                </div>
                
                <div class="editor-area">
                    <div class="loading" id="loading">
                        <div class="loading-spinner"></div>
                        <div>Loading Code Editor...</div>
                    </div>
                    
                    <div id="error" class="error-message hidden">
                        <div>Failed to load advanced editor</div>
                        <button class="retry-button" id="retryBtn">Retry</button>
                        <div style="margin-top: 10px; font-size: 12px;">Fallback mode available below</div>
                    </div>
                    
                    <div id="monacoEditor" class="hidden"></div>
                    <textarea id="fallbackEditor" class="simple-editor hidden" placeholder="Enter your code here..."></textarea>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const languageSelect = this.shadowRoot.getElementById('languageSelect');
        const themeSelect = this.shadowRoot.getElementById('themeSelect');
        const formatBtn = this.shadowRoot.getElementById('formatBtn');
        const copyBtn = this.shadowRoot.getElementById('copyBtn');
        const clearBtn = this.shadowRoot.getElementById('clearBtn');
        const retryBtn = this.shadowRoot.getElementById('retryBtn');
        const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');

        languageSelect.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });

        themeSelect.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        formatBtn.addEventListener('click', () => {
            this.formatCode();
        });

        copyBtn.addEventListener('click', () => {
            this.copyToClipboard();
        });

        clearBtn.addEventListener('click', () => {
            this.setValue('');
        });

        retryBtn.addEventListener('click', () => {
            this.loadEditor();
        });

        // Fallback editor events
        fallbackEditor.addEventListener('input', () => {
            this.dispatchChangeEvent();
        });

        fallbackEditor.addEventListener('focus', () => {
            this.dispatchEvent(new CustomEvent('focus'));
        });

        fallbackEditor.addEventListener('blur', () => {
            this.dispatchEvent(new CustomEvent('blur'));
        });
    }

    async loadEditor() {
        this.loadingAttempts++;
        this.showLoading();

        try {
            // Try to load Monaco Editor
            await this.loadMonacoEditor();
        } catch (error) {
            console.warn('Monaco Editor failed to load, using fallback:', error);
            this.useFallbackEditor();
        }
    }

    async loadMonacoEditor() {
        return new Promise((resolve, reject) => {
            // Check if Monaco is already loaded
            if (window.monaco) {
                this.initializeMonacoEditor();
                resolve();
                return;
            }

            // Create a timeout for loading
            const timeout = setTimeout(() => {
                reject(new Error('Monaco loading timeout'));
            }, 10000);

            try {
                // Load Monaco Editor using a more reliable method
                const loaderScript = document.createElement('script');
                loaderScript.src = 'https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js';
                
                loaderScript.onload = () => {
                    // Configure Monaco loader
                    window.require.config({ 
                        paths: { 
                            'vs': 'https://unpkg.com/monaco-editor@0.45.0/min/vs' 
                        }
                    });

                    window.require(['vs/editor/editor.main'], () => {
                        clearTimeout(timeout);
                        this.monacoLoaded = true;
                        this.initializeMonacoEditor();
                        resolve();
                    }, (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                };

                loaderScript.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to load Monaco loader script'));
                };

                document.head.appendChild(loaderScript);

            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    initializeMonacoEditor() {
        const editorContainer = this.shadowRoot.getElementById('monacoEditor');
        
        const language = this.getAttribute('language') || 'javascript';
        const theme = this.getAttribute('theme') === 'dark' ? 'vs-dark' : 'vs';
        const value = this.getAttribute('value') || '// Welcome to the code editor!\nconsole.log("Hello, World!");';
        const readonly = this.getAttribute('readonly') === 'true';

        this.editor = monaco.editor.create(editorContainer, {
            value: value,
            language: language,
            theme: theme,
            readOnly: readonly,
            automaticLayout: true,
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: "'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            formatOnPaste: true,
            formatOnType: true
        });

        // Set up event listeners
        this.editor.onDidChangeModelContent(() => {
            this.dispatchChangeEvent();
        });

        this.editor.onDidFocusEditorText(() => {
            this.dispatchEvent(new CustomEvent('focus'));
        });

        this.editor.onDidBlurEditorText(() => {
            this.dispatchEvent(new CustomEvent('blur'));
        });

        this.hideLoading();
        this.showMonacoEditor();
        this.updateToolbar();
        this.initialized = true;
    }

    useFallbackEditor() {
        const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
        const value = this.getAttribute('value') || '// Welcome to the code editor!\nconsole.log("Hello, World!");';
        const readonly = this.getAttribute('readonly') === 'true';
        const theme = this.getAttribute('theme') || 'light';

        fallbackEditor.value = value;
        fallbackEditor.readOnly = readonly;
        
        if (theme === 'dark') {
            fallbackEditor.classList.add('dark');
        }

        this.hideLoading();
        this.showFallbackEditor();
        this.updateToolbar();
        this.initialized = true;

        if (this.loadingAttempts < this.maxAttempts) {
            this.showError();
        }
    }

    // UI Control Methods
    showLoading() {
        this.shadowRoot.getElementById('loading').classList.remove('hidden');
        this.shadowRoot.getElementById('error').classList.add('hidden');
        this.shadowRoot.getElementById('monacoEditor').classList.add('hidden');
        this.shadowRoot.getElementById('fallbackEditor').classList.add('hidden');
    }

    hideLoading() {
        this.shadowRoot.getElementById('loading').classList.add('hidden');
    }

    showError() {
        this.shadowRoot.getElementById('error').classList.remove('hidden');
    }

    showMonacoEditor() {
        this.shadowRoot.getElementById('monacoEditor').classList.remove('hidden');
        this.shadowRoot.getElementById('fallbackEditor').classList.add('hidden');
    }

    showFallbackEditor() {
        this.shadowRoot.getElementById('fallbackEditor').classList.remove('hidden');
        this.shadowRoot.getElementById('monacoEditor').classList.add('hidden');
    }

    updateToolbar() {
        const language = this.getAttribute('language') || 'javascript';
        const theme = this.getAttribute('theme') || 'light';
        
        this.shadowRoot.getElementById('languageSelect').value = language;
        this.shadowRoot.getElementById('themeSelect').value = theme;
    }

    // Public API Methods
    getValue() {
        if (this.editor && this.monacoLoaded) {
            return this.editor.getValue();
        } else {
            const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
            return fallbackEditor.value;
        }
    }

    setValue(value) {
        if (this.editor && this.monacoLoaded) {
            this.editor.setValue(value || '');
        } else {
            const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
            fallbackEditor.value = value || '';
        }
        this.setAttribute('value', value || '');
    }

    setLanguage(language) {
        if (this.editor && this.monacoLoaded) {
            monaco.editor.setModelLanguage(this.editor.getModel(), language);
        }
        this.setAttribute('language', language);
        this.shadowRoot.getElementById('languageSelect').value = language;
    }

    setTheme(theme) {
        if (this.editor && this.monacoLoaded) {
            const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';
            monaco.editor.setTheme(monacoTheme);
        } else {
            const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
            if (theme === 'dark') {
                fallbackEditor.classList.add('dark');
            } else {
                fallbackEditor.classList.remove('dark');
            }
        }
        this.setAttribute('theme', theme);
        this.shadowRoot.getElementById('themeSelect').value = theme;
    }

    setReadonly(readonly) {
        if (this.editor && this.monacoLoaded) {
            this.editor.updateOptions({ readOnly: readonly });
        } else {
            const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
            fallbackEditor.readOnly = readonly;
        }
        this.setAttribute('readonly', readonly.toString());
    }

    updateHeight(height) {
        this.style.height = height;
        if (this.editor && this.monacoLoaded) {
            setTimeout(() => this.editor.layout(), 100);
        }
    }

    formatCode() {
        if (this.editor && this.monacoLoaded) {
            this.editor.getAction('editor.action.formatDocument').run();
        } else {
            // Simple formatting for fallback editor
            const value = this.getValue();
            try {
                const formatted = this.simpleFormat(value);
                this.setValue(formatted);
            } catch (e) {
                console.warn('Formatting failed:', e);
            }
        }
    }

    simpleFormat(code) {
        // Basic JavaScript formatting
        return code
            .replace(/\{\s*\n/g, '{\n')
            .replace(/\n\s*\}/g, '\n}')
            .replace(/;\s*\n/g, ';\n')
            .split('\n')
            .map(line => line.trim())
            .join('\n');
    }

    copyToClipboard() {
        const value = this.getValue();
        navigator.clipboard.writeText(value).then(() => {
            // Visual feedback
            const copyBtn = this.shadowRoot.getElementById('copyBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    focus() {
        if (this.editor && this.monacoLoaded) {
            this.editor.focus();
        } else {
            const fallbackEditor = this.shadowRoot.getElementById('fallbackEditor');
            fallbackEditor.focus();
        }
    }

    dispatchChangeEvent() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                value: this.getValue(),
                language: this.getAttribute('language') || 'javascript'
            }
        }));
    }
}

// Register the custom element
customElements.define('advanced-code-editor', AdvancedCodeEditor);

// Export for use in Wix
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedCodeEditor;
}
