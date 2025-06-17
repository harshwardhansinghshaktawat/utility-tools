// File name: advanced-code-editor.js
// Custom element tag: <advanced-code-editor></advanced-code-editor>

class AdvancedCodeEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.editor = null;
        this.monacoLoaded = false;
        this.pendingValue = '';
        this.pendingLanguage = 'javascript';
        this.pendingTheme = 'vs-dark';
    }

    static get observedAttributes() {
        return ['language', 'theme', 'value', 'readonly', 'minimap', 'line-numbers', 'word-wrap'];
    }

    connectedCallback() {
        this.render();
        this.loadMonaco();
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
            case 'minimap':
                this.updateOptions({ minimap: { enabled: newValue === 'true' } });
                break;
            case 'line-numbers':
                this.updateOptions({ lineNumbers: newValue || 'on' });
                break;
            case 'word-wrap':
                this.updateOptions({ wordWrap: newValue || 'off' });
                break;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 400px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    overflow: hidden;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                }

                .editor-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: #1e1e1e;
                    color: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .toolbar {
                    background: #2d2d30;
                    border-bottom: 1px solid #3e3e42;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 12px;
                }

                .toolbar select {
                    background: #3c3c3c;
                    color: #fff;
                    border: 1px solid #5a5a5a;
                    border-radius: 3px;
                    padding: 4px 8px;
                    font-size: 11px;
                }

                .toolbar button {
                    background: #0e639c;
                    color: #fff;
                    border: none;
                    border-radius: 3px;
                    padding: 4px 12px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .toolbar button:hover {
                    background: #1177bb;
                }

                .editor-area {
                    height: calc(100% - 40px);
                }

                .hidden {
                    display: none;
                }
            </style>
            
            <div class="editor-container">
                <div class="toolbar">
                    <select id="languageSelect">
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                        <option value="cpp">C++</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="json">JSON</option>
                        <option value="markdown">Markdown</option>
                        <option value="sql">SQL</option>
                        <option value="php">PHP</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="yaml">YAML</option>
                        <option value="xml">XML</option>
                    </select>
                    
                    <select id="themeSelect">
                        <option value="vs-dark">Dark</option>
                        <option value="vs">Light</option>
                        <option value="hc-black">High Contrast Dark</option>
                        <option value="hc-light">High Contrast Light</option>
                    </select>
                    
                    <button id="formatBtn">Format Code</button>
                    <button id="fullscreenBtn">Fullscreen</button>
                </div>
                
                <div class="editor-area">
                    <div class="loading" id="loading">
                        <div>Loading Monaco Editor...</div>
                    </div>
                    <div id="editor" class="hidden"></div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const languageSelect = this.shadowRoot.getElementById('languageSelect');
        const themeSelect = this.shadowRoot.getElementById('themeSelect');
        const formatBtn = this.shadowRoot.getElementById('formatBtn');
        const fullscreenBtn = this.shadowRoot.getElementById('fullscreenBtn');

        languageSelect.addEventListener('change', (e) => {
            this.setAttribute('language', e.target.value);
        });

        themeSelect.addEventListener('change', (e) => {
            this.setAttribute('theme', e.target.value);
        });

        formatBtn.addEventListener('click', () => {
            this.formatCode();
        });

        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    async loadMonaco() {
        if (window.monaco) {
            this.initializeEditor();
            return;
        }

        try {
            // Load Monaco Editor from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
            script.onload = () => {
                require.config({ 
                    paths: { 
                        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
                    }
                });
                
                require(['vs/editor/editor.main'], () => {
                    this.monacoLoaded = true;
                    this.initializeEditor();
                });
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('Failed to load Monaco Editor:', error);
            this.shadowRoot.getElementById('loading').textContent = 'Failed to load editor';
        }
    }

    initializeEditor() {
        const editorContainer = this.shadowRoot.getElementById('editor');
        const loading = this.shadowRoot.getElementById('loading');

        const language = this.getAttribute('language') || this.pendingLanguage;
        const theme = this.getAttribute('theme') || this.pendingTheme;
        const value = this.getAttribute('value') || this.pendingValue;
        const readonly = this.getAttribute('readonly') === 'true';
        const minimap = this.getAttribute('minimap') !== 'false';
        const lineNumbers = this.getAttribute('line-numbers') || 'on';
        const wordWrap = this.getAttribute('word-wrap') || 'off';

        this.editor = monaco.editor.create(editorContainer, {
            value: value,
            language: language,
            theme: theme,
            readOnly: readonly,
            automaticLayout: true,
            minimap: { enabled: minimap },
            lineNumbers: lineNumbers,
            wordWrap: wordWrap,
            fontSize: 14,
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            contextmenu: true,
            mouseWheelZoom: true,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            suggest: {
                showKeywords: true,
                showSnippets: true,
                showFunctions: true,
                showVariables: true,
                showModules: true,
                showClasses: true
            },
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            },
            parameterHints: {
                enabled: true
            },
            formatOnPaste: true,
            formatOnType: true,
            tabCompletion: 'on',
            wordBasedSuggestions: true,
            codeLens: true,
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'always',
            matchBrackets: 'always',
            autoIndent: 'full',
            colorDecorators: true,
            lightbulb: {
                enabled: true
            }
        });

        // Set up event listeners
        this.editor.onDidChangeModelContent(() => {
            this.dispatchEvent(new CustomEvent('change', {
                detail: {
                    value: this.editor.getValue(),
                    language: this.editor.getModel().getLanguageId()
                }
            }));
        });

        this.editor.onDidFocusEditorText(() => {
            this.dispatchEvent(new CustomEvent('focus'));
        });

        this.editor.onDidBlurEditorText(() => {
            this.dispatchEvent(new CustomEvent('blur'));
        });

        // Update UI
        loading.classList.add('hidden');
        editorContainer.classList.remove('hidden');

        // Update toolbar selects
        this.shadowRoot.getElementById('languageSelect').value = language;
        this.shadowRoot.getElementById('themeSelect').value = theme;
    }

    // Public API methods
    getValue() {
        return this.editor ? this.editor.getValue() : this.pendingValue;
    }

    setValue(value) {
        if (this.editor) {
            this.editor.setValue(value || '');
        } else {
            this.pendingValue = value || '';
        }
    }

    getLanguage() {
        return this.editor ? this.editor.getModel().getLanguageId() : this.pendingLanguage;
    }

    setLanguage(language) {
        if (this.editor) {
            monaco.editor.setModelLanguage(this.editor.getModel(), language);
        } else {
            this.pendingLanguage = language;
        }
    }

    setTheme(theme) {
        if (this.editor) {
            monaco.editor.setTheme(theme);
        } else {
            this.pendingTheme = theme;
        }
    }

    setReadonly(readonly) {
        if (this.editor) {
            this.editor.updateOptions({ readOnly: readonly });
        }
    }

    updateOptions(options) {
        if (this.editor) {
            this.editor.updateOptions(options);
        }
    }

    formatCode() {
        if (this.editor) {
            this.editor.getAction('editor.action.formatDocument').run();
        }
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    toggleFullscreen() {
        if (this.classList.contains('fullscreen')) {
            this.classList.remove('fullscreen');
            this.style.position = '';
            this.style.top = '';
            this.style.left = '';
            this.style.width = '';
            this.style.height = '';
            this.style.zIndex = '';
            this.style.background = '';
        } else {
            this.classList.add('fullscreen');
            this.style.position = 'fixed';
            this.style.top = '0';
            this.style.left = '0';
            this.style.width = '100vw';
            this.style.height = '100vh';
            this.style.zIndex = '9999';
            this.style.background = '#1e1e1e';
        }
        
        // Trigger layout update
        setTimeout(() => {
            if (this.editor) {
                this.editor.layout();
            }
        }, 100);
    }

    insertText(text, position) {
        if (this.editor) {
            const pos = position || this.editor.getPosition();
            this.editor.executeEdits('insertText', [{
                range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
                text: text
            }]);
        }
    }

    getSelectedText() {
        if (this.editor) {
            const selection = this.editor.getSelection();
            return this.editor.getModel().getValueInRange(selection);
        }
        return '';
    }

    replaceSelectedText(text) {
        if (this.editor) {
            const selection = this.editor.getSelection();
            this.editor.executeEdits('replaceText', [{
                range: selection,
                text: text
            }]);
        }
    }
}

// Register the custom element
customElements.define('advanced-code-editor', AdvancedCodeEditor);

// Export for use in Wix
export default AdvancedCodeEditor;
