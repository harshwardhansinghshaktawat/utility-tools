// rich-content-editor.js
class RichContentEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.editorInstance = null;
    this.exportedData = null;
  }

  connectedCallback() {
    // Ensure HTTPS as per Wix guidelines
    if (window.location.protocol !== 'https:') {
      console.error('Custom element requires HTTPS to function on Wix live site.');
      return;
    }

    // Create editor container
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          min-height: 400px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          background: #fff;
          font-family: Arial, sans-serif;
        }
        #editorjs {
          min-height: 300px;
        }
        .controls {
          margin-bottom: 16px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .controls button {
          padding: 8px 16px;
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .controls button:hover {
          background: #1557b0;
        }
        .export-output {
          margin-top: 16px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 4px;
          display: none;
        }
        .export-output.active {
          display: block;
        }
        .export-output textarea {
          width: 100%;
          height: 150px;
          resize: vertical;
          font-family: monospace;
        }
      </style>
      <div class="controls">
        <button onclick="window.richContentEditor.saveJSON()">Save as JSON</button>
        <button onclick="window.richContentEditor.saveHTML()">Save as HTML</button>
        <button onclick="window.richContentEditor.saveMarkdown()">Save as Markdown</button>
        <button onclick="window.richContentEditor.clear()">Clear Editor</button>
        <button onclick="window.richContentEditor.loadSample()">Load Sample</button>
      </div>
      <div id="editorjs"></div>
      <div class="export-output">
        <h3>Exported Content</h3>
        <textarea readonly></textarea>
      </div>
    `;

    // Load Editor.js and plugins dynamically
    this.loadScripts().then(() => {
      this.initializeEditor();
      // Expose methods to global scope for button actions
      window.richContentEditor = {
        saveJSON: () => this.saveJSON(),
        saveHTML: () => this.saveHTML(),
        saveMarkdown: () => this.saveMarkdown(),
        clear: () => this.clearEditor(),
        loadSample: () => this.loadSampleContent(),
      };
    }).catch(err => console.error('Failed to load scripts:', err));
  }

  async loadScripts() {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/paragraph@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/header@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/list@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/quote@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/image@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/embed@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/table@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/code@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/inline-code@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/marker@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/delimiter@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/warning@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/checklist@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/alignment-tune@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/underline@latest',
      'https://cdn.jsdelivr.net/npm/editorjs-text-color-plugin@latest',
      'https://cdn.jsdelivr.net/npm/editorjs-social-post-plugin@latest',
      'https://cdn.jsdelivr.net/npm/@editorjs/video@latest',
      'https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js', // For Markdown conversion
      'https://cdn.jsdelivr.net/npm/dompurify@2.3.10/dist/purify.min.js', // For HTML sanitization
    ];

    for (const src of scripts) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  initializeEditor() {
    this.editorInstance = new EditorJS({
      holder: this.shadowRoot.querySelector('#editorjs'),
      tools: {
        paragraph: {
          class: window.Paragraph,
          inlineToolbar: true,
          tunes: ['alignment'],
        },
        header: {
          class: window.Header,
          config: {
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2,
          },
          inlineToolbar: true,
        },
        list: {
          class: window.List,
          inlineToolbar: true,
        },
        quote: {
          class: window.Quote,
          inlineToolbar: true,
        },
        image: {
          class: window.ImageTool,
          config: {
            endpoints: {
              byFile: '/uploadFile', // Replace with your upload endpoint
              byUrl: '/fetchUrl', // Replace with your URL fetch endpoint
            },
            uploader: {
              async uploadByFile(file) {
                // Placeholder for file upload logic
                return { success: 1, file: { url: URL.createObjectURL(file) } };
              },
              async uploadByUrl(url) {
                return { success: 1, file: { url } };
              },
            },
          },
        },
        embed: {
          class: window.Embed,
          config: {
            services: {
              youtube: true,
              vimeo: true,
              instagram: true,
              twitter: true,
              facebook: true,
            },
          },
        },
        table: {
          class: window.Table,
          inlineToolbar: true,
        },
        code: window.CodeTool,
        inlineCode: window.InlineCode,
        marker: window.Marker,
        delimiter: window.Delimiter,
        warning: window.Warning,
        checklist: window.Checklist,
        alignment: {
          class: window.AlignmentTuneTool,
          config: {
            default: 'left',
            blocks: {
              paragraph: true,
              header: true,
              list: true,
            },
          },
        },
        underline: window.Underline,
        color: {
          class: window.ColorPlugin,
          config: {
            colorCollections: ['#FF1300', '#00F0FF', '#00FF00', '#0000FF', '#FF00FF'],
            defaultColor: '#000000',
            type: 'text',
          },
        },
        socialPost: {
          class: window.SocialPostPlugin,
          config: {
            services: ['instagram', 'twitter', 'facebook'],
          },
        },
        video: {
          class: window.VideoTool,
          config: {
            uploader: {
              async uploadByFile(file) {
                // Placeholder for video upload logic
                return { success: 1, file: { url: URL.createObjectURL(file) } };
              },
              async uploadByUrl(url) {
                return { success: 1, file: { url } };
              },
            },
          },
        },
      },
      inlineToolbar: ['link', 'bold', 'italic', 'underline', 'inlineCode', 'marker', 'color'],
      onReady: () => {
        console.log('Editor.js is ready!');
      },
      onChange: async () => {
        this.exportedData = await this.editorInstance.save();
      },
    });
  }

  async saveJSON() {
    if (!this.editorInstance) return;
    this.exportedData = await this.editorInstance.save();
    const output = this.shadowRoot.querySelector('.export-output');
    output.classList.add('active');
    output.querySelector('textarea').value = JSON.stringify(this.exportedData, null, 2);
  }

  async saveHTML() {
    if (!this.exportedData) return;
    const html = this.convertToHTML(this.exportedData);
    const sanitizedHTML = window.DOMPurify.sanitize(html);
    const output = this.shadowRoot.querySelector('.export-output');
    output.classList.add('active');
    output.querySelector('textarea').value = sanitizedHTML;
  }

  async saveMarkdown() {
    if (!this.exportedData) return;
    const markdown = this.convertToMarkdown(this.exportedData);
    const output = this.shadowRoot.querySelector('.export-output');
    output.classList.add('active');
    output.querySelector('textarea').value = markdown;
  }

  clearEditor() {
    if (this.editorInstance) {
      this.editorInstance.clear();
      this.shadowRoot.querySelector('.export-output').classList.remove('active');
    }
  }

  loadSampleContent() {
    if (this.editorInstance) {
      this.editorInstance.render({
        blocks: [
          { type: 'header', data: { text: 'Sample Header', level: 2 } },
          { type: 'paragraph', data: { text: 'This is a sample paragraph with <b>bold</b> and <i>italic</i> text.' } },
          { type: 'image', data: { url: 'https://via.placeholder.com/150', caption: 'Sample Image' } },
          { type: 'embed', data: { service: 'youtube', source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ' } },
        ],
      });
    }
  }

  convertToHTML(data) {
    let html = '';
    data.blocks.forEach(block => {
      switch (block.type) {
        case 'header':
          html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          break;
        case 'paragraph':
          html += `<p>${block.data.text}</p>`;
          break;
        case 'list':
          const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
          html += `<${tag}>${block.data.items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;
          break;
        case 'quote':
          html += `<blockquote>${block.data.text}<cite>${block.data.caption}</cite></blockquote>`;
          break;
        case 'image':
          html += `<img src="${block.data.url}" alt="${block.data.caption || ''}" />`;
          break;
        case 'embed':
          html += `<iframe src="${block.data.embed}" frameborder="0" allowfullscreen></iframe>`;
          break;
        case 'table':
          html += `<table>${block.data.content.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</table>`;
          break;
        case 'code':
          html += `<pre><code>${block.data.code}</code></pre>`;
          break;
        case 'warning':
          html += `<div class="warning"><strong>${block.data.title}</strong><p>${block.data.message}</p></div>`;
          break;
        case 'checklist':
          html += `<ul>${block.data.items.map(item => `<li><input type="checkbox" ${item.checked ? 'checked' : ''}>${item.text}</li>`).join('')}</ul>`;
          break;
        default:
          break;
      }
    });
    return html;
  }

  convertToMarkdown(data) {
    let markdown = '';
    data.blocks.forEach(block => {
      switch (block.type) {
        case 'header':
          markdown += `${'#'.repeat(block.data.level)} ${block.data.text}\n\n`;
          break;
        case 'paragraph':
          markdown += `${block.data.text}\n\n`;
          break;
        case 'list':
          const prefix = block.data.style === 'ordered' ? '1. ' : '- ';
          markdown += block.data.items.map(item => `${prefix}${item}\n`).join('') + '\n';
          break;
        case 'quote':
          markdown += `> ${block.data.text}\n> — ${block.data.caption}\n\n`;
          break;
        case 'image':
          markdown += `![${block.data.caption || ''}](${block.data.url})\n\n`;
          break;
        case 'embed':
          markdown += `[Embedded ${block.data.service} content](${block.data.source})\n\n`;
          break;
        case 'table':
          const headers = block.data.content[0].map(cell => `| ${cell} `).join('') + '|\n';
          const separators = block.data.content[0].map(() => '| --- ').join('') + '|\n';
          const rows = block.data.content.slice(1).map(row => row.map(cell => `| ${cell} `).join('') + '|\n').join('');
          markdown += headers + separators + rows + '\n';
          break;
        case 'code':
          markdown += '```' + block.data.language + '\n' + block.data.code + '\n```\n\n';
          break;
        case 'warning':
          markdown += `**${block.data.title}**\n${block.data.message}\n\n`;
          break;
        case 'checklist':
          markdown += block.data.items.map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}\n`).join('') + '\n';
          break;
        default:
          break;
      }
    });
    return markdown;
  }
}

// Register the custom element
customElements.define('rich-content-editor', RichContentEditor);
