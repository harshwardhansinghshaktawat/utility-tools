// code-editor.js
class CodeEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Get attributes or set defaults
    const language = this.getAttribute('language') || 'javascript';
    const initialCode = this.getAttribute('code') || '// Start coding here...';

    // Inject styles and HTML structure
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 400px;
          background-color: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          font-family: 'Fira Code', 'Consolas', monospace;
        }

        .editor-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .toolbar {
          display: flex;
          align-items: center;
          background-color: #252526;
          padding: 8px;
          border-bottom: 1px solid #3c3c3c;
        }

        .toolbar select,
        .toolbar button {
          background-color: #3c3c3c;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          margin-right: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .toolbar select:hover,
        .toolbar button:hover {
          background-color: #4e4e4e;
        }

        .codemirror-wrapper {
          height: calc(100% - 40px);
          overflow: auto;
        }

        .cm-editor {
          height: 100%;
          font-size: 14px;
        }

        .cm-gutters {
          background-color: #1e1e1e;
          color: #858585;
          border-right: 1px solid #3c3c3c;
        }

        .cm-activeLine {
          background-color: #2a2a2a;
        }

        .cm-selectionBackground {
          background-color: #264f78 !important;
        }

        .cm-cursor {
          border-left: 1px solid #ffffff;
        }

        .status-bar {
          background-color: #007acc;
          color: #ffffff;
          padding: 4px 8px;
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      </style>
      <div class="editor-container">
        <div class="toolbar">
          <select id="language-select">
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
          </select>
          <button id="run-button">Run</button>
          <button id="clear-button">Clear</button>
        </div>
        <div class="codemirror-wrapper"></div>
        <div class="status-bar">
          <span id="language-status">Language: ${language}</span>
          <span id="line-col">Ln 1, Col 1</span>
        </div>
      </div>
    `;

    // Load CodeMirror and dependencies dynamically
    this.loadCodeMirror().then(() => {
      this.initializeEditor(language, initialCode);
    }).catch((err) => {
      console.error('Failed to load CodeMirror:', err);
    });
  }

  // Load CodeMirror scripts dynamically
  loadCodeMirror() {
    return new Promise((resolve) => {
      // Check if CodeMirror is already loaded
      if (window.CodeMirror) {
        resolve();
        return;
      }

      // Array of CodeMirror CDN scripts
      const scripts = [
        'https://unpkg.com/codemirror@6/dist/codemirror.min.js',
        'https://unpkg.com/@codemirror/lang-javascript@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/lang-html@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/lang-css@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/lang-python@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/theme-one-dark@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/autocomplete@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/gutter@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/highlight@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/state@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/view@6/dist/index.min.js',
        'https://unpkg.com/@codemirror/commands@6/dist/index.min.js',
      ];

      // Load each script sequentially
      const loadScript = (src) => {
        return new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = res;
          script.onerror = rej;
          document.head.appendChild(script);
        });
      };

      scripts.reduce((promise, src) => {
        return promise.then(() => loadScript(src));
      }, Promise.resolve()).then(resolve);
    });
  }

  // Initialize the CodeMirror editor
  initializeEditor(language, initialCode) {
    const { EditorView, basicSetup } = window.CodeMirror;
    const { javascript } = window.CodeMirrorLangJavaScript;
    const { html } = window.CodeMirrorLangHtml;
    const { css } = window.CodeMirrorLangCss;
    const { python } = window.CodeMirrorLangPython;
    const { oneDark } = window.CodeMirrorThemeOneDark;
    const { EditorState } = window.CodeMirrorState;
    const { lineNumbers, gutter } = window.CodeMirrorGutter;
    const { autocompletion, completionKeymap } = window.CodeMirrorAutocomplete;
    const { keymap } = window.CodeMirrorView;
    const { indentWithTab } = window.CodeMirrorCommands;
    const { tags, HighlightStyle } = window.CodeMirrorHighlight;

    // Define custom highlight style
    const customHighlightStyle = HighlightStyle.define([
      { tag: tags.keyword, color: '#c792ea', fontWeight: 'bold' },
      { tag: tags.comment, color: '#6272a4', fontStyle: 'italic' },
      { tag: tags.string, color: '#f1fa8c' },
      { tag: tags.number, color: '#bd93f9' },
      { tag: tags.variableName, color: '#50fa7b' },
      { tag: tags.function, color: '#ffb86c' },
      { tag: tags.className, color: '#8be9fd' },
      { tag: tags.tagName, color: '#ff79c6' },
      { tag: tags.attributeName, color: '#f8f8f2' },
    ]);

    // Map language to CodeMirror language extension
    const languageMap = {
      javascript: javascript({ jsx: true }),
      html: html(),
      css: css(),
      python: python(),
    };

    // Initialize CodeMirror
    const editorWrapper = this.shadowRoot.querySelector('.codemirror-wrapper');
    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        languageMap[language] || javascript(),
        oneDark,
        customHighlightStyle,
        lineNumbers(),
        gutter(),
        autocompletion(),
        keymap.of([...completionKeymap, indentWithTab]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.selectionSet) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            const col = pos - line.from + 1;
            this.shadowRoot.querySelector('#line-col').textContent = `Ln ${line.number}, Col ${col}`;
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorWrapper,
    });

    // Handle language selection
    const languageSelect = this.shadowRoot.querySelector('#language-select');
    languageSelect.value = language;
    languageSelect.addEventListener('change', () => {
      const newLanguage = languageSelect.value;
      view.dispatch({
        effects: EditorState.language.of(languageMap[newLanguage] || javascript()),
      });
      this.shadowRoot.querySelector('#language-status').textContent = `Language: ${newLanguage}`;
    });

    // Handle run button (placeholder for execution logic)
    this.shadowRoot.querySelector('#run-button').addEventListener('click', () => {
      const code = view.state.doc.toString();
      console.log('Running code:', code);
      // Add custom execution logic here
    });

    // Handle clear button
    this.shadowRoot.querySelector('#clear-button').addEventListener('click', () => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: '' },
      });
    });

    // Store view for later access
    this.editorView = view;
  }

  // Expose method to get current code
  getCode() {
    return this.editorView ? this.editorView.state.doc.toString() : '';
  }
}

// Register the custom element
customElements.define('code-editor', CodeEditor);
