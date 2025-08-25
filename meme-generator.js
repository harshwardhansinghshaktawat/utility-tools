class MemeGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // State management
    this.state = {
      selectedTemplate: null,
      textLayers: [],
      shapes: [],
      speechBubbles: [],
      uploadedImages: [],
      canvasWidth: 600,
      canvasHeight: 600,
      undoStack: [],
      redoStack: [],
      isDragging: false,
      selectedElement: null,
      dragOffsetX: 0,
      dragOffsetY: 0,
      imageCache: {},
      collapsedSections: {}, // Track collapsed sections
      fonts: [
        'Impact', 'Arial', 'Comic Sans MS', 'Helvetica', 'Times New Roman',
        'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond'
      ],
      templates: [
        {
          id: 'drake',
          name: 'Drake Hotline Bling',
          url: 'https://i.imgflip.com/30b1gx.jpg',
          layout: '2-vertical'
        },
        {
          id: 'distracted-boyfriend',
          name: 'Distracted Boyfriend',
          url: 'https://i.imgflip.com/1ur9b0.jpg',
          layout: '3-horizontal'
        },
        {
          id: 'expanding-brain',
          name: 'Expanding Brain',
          url: 'https://i.imgflip.com/1jwhww.jpg',
          layout: '4-vertical'
        },
        {
          id: 'two-buttons',
          name: 'Two Buttons',
          url: 'https://i.imgflip.com/1g8my4.jpg',
          layout: '2-button'
        },
        {
          id: 'custom',
          name: 'Custom Template',
          url: '',
          layout: 'custom'
        }
      ],
      speechBubbleTypes: [
        {
          id: 'bubble1',
          name: 'Speech Bubble 1',
          url: 'https://static.wixstatic.com/shapes/8874a0_0009c311e9464dcaa803227b7f9be8e2.svg'
        },
        {
          id: 'bubble2',
          name: 'Speech Bubble 2',
          url: 'https://static.wixstatic.com/shapes/8874a0_7ae0265961564773bfed4c362edb5cb1.svg'
        },
        {
          id: 'bubble3',
          name: 'Speech Bubble 3',
          url: 'https://static.wixstatic.com/shapes/8874a0_cb1f6b704c1545608e93c4a398aa2cb8.svg'
        },
        {
          id: 'bubble4',
          name: 'Speech Bubble 4',
          url: 'https://static.wixstatic.com/shapes/8874a0_d3a4875eba074478be379cb28197afc2.svg'
        },
        {
          id: 'bubble5',
          name: 'Speech Bubble 5',
          url: 'https://static.wixstatic.com/shapes/8874a0_acbab0781b2c456492e200c7c8e89549.svg'
        },
        {
          id: 'bubble6',
          name: 'Speech Bubble 6',
          url: 'https://static.wixstatic.com/shapes/8874a0_e9c0d5c515454932909e055b095bf29c.svg'
        },
        {
          id: 'bubble7',
          name: 'Speech Bubble 7',
          url: 'https://static.wixstatic.com/shapes/8874a0_62c7fb23072646e4a051ffcd16267f35.svg'
        },
        {
          id: 'bubble8',
          name: 'Speech Bubble 8',
          url: 'https://static.wixstatic.com/shapes/8874a0_71b37a33ab814d3da68e7ae62f068aa1.svg'
        }
      ]
    };

    this.isDownloading = false;
    this.initializeUI();
    this.setupEventListeners();
  }

  // CMS Integration
  static get observedAttributes() {
    return ['cms-template-url', 'cms-template-name', 'cms-template-layout'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!newValue || oldValue === newValue) return;

    if (name === 'cms-template-url') {
      this.setCMSTemplate(
        newValue,
        this.getAttribute('cms-template-name') || 'CMS Template',
        this.getAttribute('cms-template-layout') || '2-vertical'
      );
    }
  }

  setCMSTemplate(imageUrl, templateName = 'CMS Template', layout = '2-vertical') {
    if (!imageUrl) return;

    this.state.templates = this.state.templates.filter(t => t.id !== 'cms-template');

    const cmsTemplate = {
      id: 'cms-template',
      name: templateName,
      url: imageUrl,
      layout: layout
    };

    this.state.templates.unshift(cmsTemplate);
    
    if (this.templatesContainer) {
      this.loadTemplates();
      this.selectTemplate('cms-template');
    }
  }

  // Initialize the UI components with improved, compact design
  initializeUI() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          --primary-color: #4a86e8;
          --secondary-color: #f39c12;
          --dark-color: #2c3e50;
          --light-color: #ecf0f1;
          --success-color: #2ecc71;
          --danger-color: #e74c3c;
          --border-radius: 6px;
          --shadow: 0 1px 3px rgba(0,0,0,0.1);
          --border: 1px solid #e1e5e9;
          font-size: 14px;
        }

        .meme-generator-container {
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Compact Templates Row */
        .templates-row {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding: 8px;
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          border: var(--border);
          scrollbar-width: thin;
        }
        
        .templates-row::-webkit-scrollbar {
          height: 4px;
        }
        
        .templates-row::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 2px;
        }

        .template-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px;
          margin-right: 6px;
          border-radius: var(--border-radius);
          border: var(--border);
          cursor: pointer;
          transition: all 0.2s;
          min-width: 80px;
          flex-shrink: 0;
        }

        .template-option:hover {
          background-color: #f5f5f5;
          transform: translateY(-1px);
        }

        .template-option.selected {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .template-option.cms-template {
          border: 2px solid var(--success-color);
        }

        .template-option.cms-template.selected {
          background-color: var(--success-color);
          border-color: var(--success-color);
        }

        .template-option img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          margin-bottom: 4px;
          border-radius: 3px;
        }

        .template-option .template-name {
          font-size: 10px;
          text-align: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Improved Grid Layout */
        .editor-container {
          display: grid;
          grid-template-columns: minmax(280px, 350px) 1fr minmax(280px, 350px);
          gap: 15px;
          width: 100%;
          min-height: 500px;
        }

        /* Compact Sidebar Design */
        .sidebar {
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          border: var(--border);
          padding: 12px;
          max-height: 600px;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 2px;
        }

        /* Canvas Container */
        .canvas-container {
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          border: var(--border);
          padding: 15px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        #meme-canvas {
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: var(--border-radius);
          max-width: 100%;
          height: auto;
          margin: 10px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        #buffer-canvas {
          display: none;
        }

        /* Collapsible Control Groups */
        .control-group {
          margin-bottom: 12px;
          border: var(--border);
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .control-group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: #f8f9fa;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
          border-bottom: var(--border);
        }

        .control-group-header:hover {
          background-color: #e9ecef;
        }

        .control-group-header h3 {
          margin: 0;
          color: var(--dark-color);
          font-size: 13px;
          font-weight: 600;
        }

        .control-group-header .toggle-icon {
          font-size: 12px;
          transition: transform 0.2s;
        }

        .control-group-header.collapsed .toggle-icon {
          transform: rotate(-90deg);
        }

        .control-group-content {
          padding: 12px;
          background-color: white;
        }

        .control-group-content.collapsed {
          display: none;
        }

        /* Compact Speech Bubbles Grid */
        .speech-bubbles-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }

        .speech-bubble-option {
          aspect-ratio: 1/1;
          border: var(--border);
          border-radius: var(--border-radius);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #f8f9fa;
        }

        .speech-bubble-option:hover {
          border-color: var(--primary-color);
          transform: scale(1.05);
          box-shadow: var(--shadow);
        }

        .speech-bubble-option img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 3px;
        }

        /* Compact Form Elements */
        button {
          padding: 6px 12px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
          margin: 2px;
          min-height: 28px;
        }

        button:hover {
          background-color: #3a76d8;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        button.danger {
          background-color: var(--danger-color);
        }

        button.danger:hover {
          background-color: #c0392b;
        }

        button.success {
          background-color: var(--success-color);
        }

        button.success:hover {
          background-color: #27ae60;
        }

        button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        button.icon-btn {
          padding: 4px 6px;
          font-size: 10px;
          min-height: 24px;
        }

        .btn-group {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }

        label {
          display: block;
          margin-bottom: 3px;
          margin-top: 6px;
          font-size: 11px;
          font-weight: 500;
          color: var(--dark-color);
        }

        input, select {
          width: 100%;
          padding: 6px 8px;
          margin-bottom: 6px;
          border: var(--border);
          border-radius: var(--border-radius);
          font-size: 12px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        input:focus, select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(74, 134, 232, 0.2);
        }

        input[type="color"] {
          height: 32px;
          padding: 2px;
          cursor: pointer;
        }

        input[type="range"] {
          padding: 0;
          margin-bottom: 4px;
        }

        /* Compact Layer Items */
        .layer-item {
          padding: 8px;
          background-color: #f8f9fa;
          border-radius: var(--border-radius);
          margin-bottom: 8px;
          border: var(--border);
        }

        .layer-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .layer-item-header h4 {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: var(--dark-color);
        }

        .layer-actions {
          display: flex;
          gap: 3px;
        }

        /* Compact Controls */
        .compact-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          align-items: end;
        }

        .compact-row.three-col {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .value-display {
          font-size: 10px;
          color: #666;
          font-weight: 500;
        }

        .color-preview {
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin-right: 6px;
          border: 1px solid #ddd;
          vertical-align: middle;
        }

        /* History and Export Controls */
        .history-controls {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .canvas-controls {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
        }

        .export-options {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 10px;
        }

        .custom-file-upload {
          border: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          cursor: pointer;
          background-color: #f8f9fa;
          border-radius: var(--border-radius);
          margin-bottom: 8px;
          transition: all 0.2s;
          font-size: 12px;
          min-height: 32px;
        }

        .custom-file-upload:hover {
          background-color: #e9ecef;
          border-color: var(--primary-color);
        }

        #file-upload {
          display: none;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .editor-container {
            grid-template-columns: minmax(250px, 300px) 1fr minmax(250px, 300px);
          }
          
          .speech-bubbles-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 992px) {
          .editor-container {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .sidebar {
            max-height: none;
          }

          .speech-bubbles-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @media (max-width: 768px) {
          .meme-generator-container {
            padding: 12px;
            gap: 12px;
          }

          .speech-bubbles-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .templates-row {
            padding: 6px;
          }

          .template-option {
            min-width: 70px;
          }

          .template-option img {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 480px) {
          .speech-bubbles-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .compact-row.three-col {
            grid-template-columns: 1fr;
          }

          .history-controls, .canvas-controls, .export-options {
            flex-wrap: wrap;
          }
        }

        /* Loading and Empty States */
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 16px;
          font-style: italic;
        }
      </style>

      <div class="meme-generator-container">
        <!-- Compact Templates Row -->
        <div class="templates-row" id="templates-container"></div>

        <div class="editor-container">
          <!-- Left Sidebar -->
          <div class="sidebar">
            <!-- Text Layers Section -->
            <div class="control-group">
              <div class="control-group-header" data-section="text">
                <h3>✏️ Text Layers</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content" data-content="text">
                <button id="add-text-btn" class="w-full">+ Add Text</button>
                <div id="text-layers-container"></div>
              </div>
            </div>

            <!-- Images Section -->
            <div class="control-group">
              <div class="control-group-header" data-section="images">
                <h3>🖼️ Images</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content" data-content="images">
                <label class="custom-file-upload">
                  <input type="file" id="file-upload" accept="image/*">
                  📁 Upload Image
                </label>
                <div id="image-layers-container">
                  <div class="empty-state">No images uploaded</div>
                </div>
              </div>
            </div>

            <!-- Shapes Section -->
            <div class="control-group">
              <div class="control-group-header" data-section="shapes">
                <h3>🔷 Shapes</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content" data-content="shapes">
                <div class="btn-group">
                  <button id="add-square-btn">⬜ Square</button>
                  <button id="add-circle-btn">🔵 Circle</button>
                </div>
                <div id="shape-layers-container">
                  <div class="empty-state">No shapes added</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Center Canvas -->
          <div class="canvas-container">
            <div class="history-controls">
              <button id="undo-btn" class="icon-btn" title="Undo" disabled>↶ Undo</button>
              <button id="redo-btn" class="icon-btn" title="Redo" disabled>↷ Redo</button>
            </div>

            <canvas id="meme-canvas" width="600" height="600"></canvas>
            <canvas id="buffer-canvas" width="600" height="600"></canvas>

            <div class="canvas-controls">
              <button id="reset-btn" class="danger">🗑️ Reset</button>
            </div>

            <div class="export-options">
              <button class="export-btn success" data-format="png">💾 PNG</button>
              <button class="export-btn success" data-format="jpg">💾 JPG</button>
            </div>
          </div>

          <!-- Right Sidebar - Speech Bubbles -->
          <div class="sidebar">
            <div class="control-group">
              <div class="control-group-header" data-section="speech">
                <h3>💬 Speech Bubbles</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content" data-content="speech">
                <div class="speech-bubbles-grid" id="speech-bubbles-grid"></div>
                <div id="speech-bubble-layers-container">
                  <div class="empty-state">No speech bubbles added</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    // Get DOM elements
    this.canvas = this.shadowRoot.getElementById('meme-canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.bufferCanvas = this.shadowRoot.getElementById('buffer-canvas');
    this.bufferCtx = this.bufferCanvas.getContext('2d', { willReadFrequently: true });
    this.bufferCanvas.width = this.canvas.width;
    this.bufferCanvas.height = this.canvas.height;

    this.undoBtn = this.shadowRoot.getElementById('undo-btn');
    this.redoBtn = this.shadowRoot.getElementById('redo-btn');
    this.templatesContainer = this.shadowRoot.getElementById('templates-container');
    this.textLayersContainer = this.shadowRoot.getElementById('text-layers-container');
    this.imageLayersContainer = this.shadowRoot.getElementById('image-layers-container');
    this.shapeLayersContainer = this.shadowRoot.getElementById('shape-layers-container');
    this.speechBubblesGrid = this.shadowRoot.getElementById('speech-bubbles-grid');
    this.speechBubbleLayersContainer = this.shadowRoot.getElementById('speech-bubble-layers-container');

    // Setup collapsible sections
    this.setupCollapsibleSections();

    // Main action buttons
    this.shadowRoot.getElementById('add-text-btn').addEventListener('click', () => this.addTextLayer());
    this.shadowRoot.getElementById('add-square-btn').addEventListener('click', () => this.addShape('square'));
    this.shadowRoot.getElementById('add-circle-btn').addEventListener('click', () => this.addShape('circle'));
    this.shadowRoot.getElementById('reset-btn').addEventListener('click', () => this.resetCanvas());
    this.shadowRoot.getElementById('file-upload').addEventListener('change', (e) => this.handleImageUpload(e));
    this.undoBtn.addEventListener('click', () => this.undo());
    this.redoBtn.addEventListener('click', () => this.redo());

    // Canvas events
    this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleCanvasMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseUp());

    // Export buttons
    this.shadowRoot.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.target.getAttribute('data-format');
        this.downloadMeme(format);
      });
    });

    this.loadTemplates();
    this.loadSpeechBubbles();
    this.renderCanvas();
  }

  // Setup collapsible sections
  setupCollapsibleSections() {
    this.shadowRoot.querySelectorAll('.control-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.getAttribute('data-section');
        const content = this.shadowRoot.querySelector(`[data-content="${section}"]`);
        const icon = header.querySelector('.toggle-icon');
        
        const isCollapsed = content.classList.contains('collapsed');
        
        if (isCollapsed) {
          content.classList.remove('collapsed');
          header.classList.remove('collapsed');
          this.state.collapsedSections[section] = false;
        } else {
          content.classList.add('collapsed');
          header.classList.add('collapsed');
          this.state.collapsedSections[section] = true;
        }
      });
    });
  }

  // Load available templates
  loadTemplates() {
    this.templatesContainer.innerHTML = '';

    this.state.templates.forEach(template => {
      const templateElement = document.createElement('div');
      templateElement.className = 'template-option';
      templateElement.dataset.id = template.id;

      if (template.id === 'cms-template') {
        templateElement.classList.add('cms-template');
      }

      if (this.state.selectedTemplate === template.id) {
        templateElement.classList.add('selected');
      }

      templateElement.innerHTML = `
        <img src="${template.url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="%23ddd"/></svg>'}" alt="${template.name}">
        <span class="template-name">${template.name}</span>
      `;

      templateElement.addEventListener('click', () => {
        this.selectTemplate(template.id);
      });

      this.templatesContainer.appendChild(templateElement);
    });
  }

  // Load available speech bubbles
  loadSpeechBubbles() {
    this.speechBubblesGrid.innerHTML = '';

    this.state.speechBubbleTypes.forEach(bubble => {
      const bubbleElement = document.createElement('div');
      bubbleElement.className = 'speech-bubble-option';
      bubbleElement.dataset.id = bubble.id;
      bubbleElement.title = bubble.name;

      bubbleElement.innerHTML = `
        <img src="${bubble.url}" alt="${bubble.name}">
      `;

      bubbleElement.addEventListener('click', () => {
        this.addSpeechBubble(bubble.id);
      });

      this.speechBubblesGrid.appendChild(bubbleElement);
    });
  }

  // Add a speech bubble to the canvas
  addSpeechBubble(bubbleId) {
    this.saveState();
    
    const bubbleType = this.state.speechBubbleTypes.find(b => b.id === bubbleId);
    if (!bubbleType) return;
    
    const newBubble = {
      id: Date.now(),
      type: 'speechBubble',
      bubbleId: bubbleId,
      src: bubbleType.url,
      x: 300,
      y: 300,
      width: 200,
      height: 150,
      draggable: true
    };
    
    this.state.speechBubbles.push(newBubble);
    this.renderSpeechBubblesUI();
    this.renderCanvas();
    this.updateUndoRedoButtons();
  }

  // Select a template
  selectTemplate(templateId) {
    this.state.selectedTemplate = templateId;

    if (templateId !== 'custom') {
      this.saveState();
      this.state.textLayers = [];
      this.state.shapes = [];

      const template = this.state.templates.find(t => t.id === templateId);

      if (template && template.url) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          this.state.imageCache[template.url] = img;

          if (template.layout === '2-vertical') {
            this.addTextLayer('TOP TEXT', 300, 120);
            this.addTextLayer('BOTTOM TEXT', 300, 480);
          } else if (template.layout === '3-horizontal') {
            this.addTextLayer('LEFT TEXT', 150, 300);
            this.addTextLayer('CENTER TEXT', 300, 300);
            this.addTextLayer('RIGHT TEXT', 450, 300);
          } else if (template.layout === '4-vertical') {
            this.addTextLayer('FIRST LEVEL', 300, 100);
            this.addTextLayer('SECOND LEVEL', 300, 230);
            this.addTextLayer('THIRD LEVEL', 300, 370);
            this.addTextLayer('FOURTH LEVEL', 300, 500);
          } else if (template.layout === '2-button') {
            this.addTextLayer('BUTTON 1', 300, 180);
            this.addTextLayer('BUTTON 2', 300, 300);
          }

          this.renderCanvas();
        };
        img.onerror = () => {
          console.error(`Failed to load template image: ${template.url}`);
          alert('Failed to load template image. Please try another template or upload a custom image.');
        };
        img.src = template.url;
      }
    }

    this.templatesContainer.querySelectorAll('.template-option').forEach(el => {
      if (el.dataset.id === templateId) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

    this.renderCanvas();
  }

  // Add a new text layer to the meme
  addTextLayer(text = 'Text', x = 300, y = 300) {
    this.saveState();

    const newTextLayer = {
      id: Date.now(),
      type: 'text',
      text: text,
      x: x,
      y: y,
      fontSize: 40,
      fontFamily: 'Impact',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 2,
      align: 'center',
      draggable: true
    };

    this.state.textLayers.push(newTextLayer);
    this.renderTextLayersUI();
    this.renderCanvas();
    this.updateUndoRedoButtons();
  }

  // Add a new shape to the meme
  addShape(shapeType) {
    this.saveState();

    const newShape = {
      id: Date.now(),
      type: 'shape',
      shapeType: shapeType,
      x: 300,
      y: 300,
      width: 100,
      height: shapeType === 'circle' ? 100 : 150,
      color: '#FF0000',
      opacity: 0.7,
      draggable: true
    };

    this.state.shapes.push(newShape);
    this.renderShapeLayersUI();
    this.renderCanvas();
    this.updateUndoRedoButtons();
  }

  // Handle image upload
  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.saveState();

      const img = new Image();
      img.onload = () => {
        this.state.imageCache[e.target.result] = img;

        let width = img.width;
        let height = img.height;
        const maxDimension = 300;

        if (width > height && width > maxDimension) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else if (height > width && height > maxDimension) {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }

        const newImage = {
          id: Date.now(),
          type: 'image',
          src: e.target.result,
          x: 300 - (width / 2),
          y: 300 - (height / 2),
          width: width,
          height: height,
          draggable: true
        };

        this.state.uploadedImages.push(newImage);
        this.renderImageLayersUI();
        this.renderCanvas();
        this.updateUndoRedoButtons();
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }

  // Render compact text layer UI controls
  renderTextLayersUI() {
    this.textLayersContainer.innerHTML = '';

    if (this.state.textLayers.length === 0) {
      this.textLayersContainer.innerHTML = '<div class="empty-state">No text layers added</div>';
      return;
    }

    this.state.textLayers.forEach((layer, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>📝 Text ${index + 1}</h4>
          <div class="layer-actions">
            <button class="icon-btn" data-action="up" data-id="${layer.id}" ${index === 0 ? 'disabled' : ''} title="Move Up">↑</button>
            <button class="icon-btn" data-action="down" data-id="${layer.id}" ${index === this.state.textLayers.length - 1 ? 'disabled' : ''} title="Move Down">↓</button>
            <button class="icon-btn danger" data-action="delete" data-id="${layer.id}" title="Delete">×</button>
          </div>
        </div>

        <input type="text" class="text-input" data-id="${layer.id}" value="${layer.text}" placeholder="Enter text">

        <div class="compact-row">
          <div>
            <label>Font</label>
            <select class="font-family-select" data-id="${layer.id}">
              ${this.state.fonts.map(font => `
                <option value="${font}" ${font === layer.fontFamily ? 'selected' : ''}>${font}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label>Size: <span class="value-display">${layer.fontSize}px</span></label>
            <input type="range" class="font-size-input" data-id="${layer.id}" min="10" max="100" value="${layer.fontSize}">
          </div>
        </div>

        <div class="compact-row three-col">
          <div>
            <label><span class="color-preview" style="background-color: ${layer.color}"></span>Text</label>
            <input type="color" class="text-color-input" data-id="${layer.id}" value="${layer.color}">
          </div>
          <div>
            <label><span class="color-preview" style="background-color: ${layer.strokeColor}"></span>Outline</label>
            <input type="color" class="stroke-color-input" data-id="${layer.id}" value="${layer.strokeColor}">
          </div>
          <div>
            <label>Width: <span class="value-display">${layer.strokeWidth}px</span></label>
            <input type="range" class="stroke-width-input" data-id="${layer.id}" min="0" max="10" value="${layer.strokeWidth}">
          </div>
        </div>

        <div>
          <label>Alignment</label>
          <select class="text-align-select" data-id="${layer.id}">
            <option value="left" ${layer.align === 'left' ? 'selected' : ''}>← Left</option>
            <option value="center" ${layer.align === 'center' ? 'selected' : ''}>↔ Center</option>
            <option value="right" ${layer.align === 'right' ? 'selected' : ''}>→ Right</option>
          </select>
        </div>
      `;

      this.textLayersContainer.appendChild(layerElement);
    });

    this.setupTextLayerEventListeners();
  }

  // Setup compact event listeners for text layer controls
  setupTextLayerEventListeners() {
    // Text input
    this.textLayersContainer.querySelectorAll('.text-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.text = e.target.value;
          this.renderCanvas();
        }
      });
    });

    // Font family
    this.textLayersContainer.querySelectorAll('.font-family-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.fontFamily = e.target.value;
          this.renderCanvas();
        }
      });
    });

    // Font size
    this.textLayersContainer.querySelectorAll('.font-size-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.fontSize = parseInt(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${layer.fontSize}px`;
          this.renderCanvas();
        }
      });
    });

    // Colors
    this.textLayersContainer.querySelectorAll('.text-color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.color = e.target.value;
          e.target.previousElementSibling.querySelector('.color-preview').style.backgroundColor = e.target.value;
          this.renderCanvas();
        }
      });
    });

    this.textLayersContainer.querySelectorAll('.stroke-color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.strokeColor = e.target.value;
          e.target.previousElementSibling.querySelector('.color-preview').style.backgroundColor = e.target.value;
          this.renderCanvas();
        }
      });
    });

    // Stroke width
    this.textLayersContainer.querySelectorAll('.stroke-width-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.strokeWidth = parseInt(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${layer.strokeWidth}px`;
          this.renderCanvas();
        }
      });
    });

    // Alignment
    this.textLayersContainer.querySelectorAll('.text-align-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.align = e.target.value;
          this.renderCanvas();
        }
      });
    });

    // Action buttons
    this.textLayersContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const action = e.target.dataset.action;
        
        if (action === 'delete') {
          this.saveState();
          this.state.textLayers = this.state.textLayers.filter(l => l.id !== id);
          this.renderTextLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        } else if (action === 'up') {
          const index = this.state.textLayers.findIndex(l => l.id === id);
          if (index > 0) {
            this.saveState();
            [this.state.textLayers[index], this.state.textLayers[index - 1]] =
              [this.state.textLayers[index - 1], this.state.textLayers[index]];
            this.renderTextLayersUI();
            this.renderCanvas();
            this.updateUndoRedoButtons();
          }
        } else if (action === 'down') {
          const index = this.state.textLayers.findIndex(l => l.id === id);
          if (index < this.state.textLayers.length - 1) {
            this.saveState();
            [this.state.textLayers[index], this.state.textLayers[index + 1]] =
              [this.state.textLayers[index + 1], this.state.textLayers[index]];
            this.renderTextLayersUI();
            this.renderCanvas();
            this.updateUndoRedoButtons();
          }
        }
      });
    });
  }

  // Render compact image layer UI controls
  renderImageLayersUI() {
    this.imageLayersContainer.innerHTML = '';

    if (this.state.uploadedImages.length === 0) {
      this.imageLayersContainer.innerHTML = '<div class="empty-state">No images uploaded</div>';
      return;
    }

    this.state.uploadedImages.forEach((image, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>🖼️ Image ${index + 1}</h4>
          <div class="layer-actions">
            <button class="icon-btn" data-action="up" data-id="${image.id}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="icon-btn" data-action="down" data-id="${image.id}" ${index === this.state.uploadedImages.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="icon-btn danger" data-action="delete" data-id="${image.id}">×</button>
          </div>
        </div>

        <div class="compact-row">
          <div>
            <label>Width: <span class="value-display">${Math.round(image.width)}px</span></label>
            <input type="range" class="image-width-input" data-id="${image.id}" min="10" max="600" value="${image.width}">
          </div>
          <div>
            <label>Height: <span class="value-display">${Math.round(image.height)}px</span></label>
            <input type="range" class="image-height-input" data-id="${image.id}" min="10" max="600" value="${image.height}">
          </div>
        </div>
      `;

      this.imageLayersContainer.appendChild(layerElement);
    });

    this.setupImageLayerEventListeners();
  }

  // Setup event listeners for image layer controls
  setupImageLayerEventListeners() {
    this.imageLayersContainer.querySelectorAll('.image-width-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const image = this.state.uploadedImages.find(img => img.id === id);
        if (image) {
          image.width = parseInt(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${Math.round(image.width)}px`;
          this.renderCanvas();
        }
      });
    });

    this.imageLayersContainer.querySelectorAll('.image-height-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const image = this.state.uploadedImages.find(img => img.id === id);
        if (image) {
          image.height = parseInt(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${Math.round(image.height)}px`;
          this.renderCanvas();
        }
      });
    });

    this.imageLayersContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const action = e.target.dataset.action;
        
        if (action === 'delete') {
          this.saveState();
          this.state.uploadedImages = this.state.uploadedImages.filter(img => img.id !== id);
          this.renderImageLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        } else if (action === 'up') {
          const index = this.state.uploadedImages.findIndex(img => img.id === id);
          if (index > 0) {
            this.saveState();
            [this.state.uploadedImages[index], this.state.uploadedImages[index - 1]] =
              [this.state.uploadedImages[index - 1], this.state.uploadedImages[index]];
            this.renderImageLayersUI();
            this.renderCanvas();
            this.updateUndoRedoButtons();
          }
        } else if (action === 'down') {
          const index = this.state.uploadedImages.findIndex(img => img.id === id);
          if (index < this.state.uploadedImages.length - 1) {
            this.saveState();
            [this.state.uploadedImages[index], this.state.uploadedImages[index + 1]] =
              [this.state.uploadedImages[index + 1], this.state.uploadedImages[index]];
            this.renderImageLayersUI();
            this.renderCanvas();
            this.updateUndoRedoButtons();
          }
        }
      });
    });
  }

  // Render compact shape layer UI controls
  renderShapeLayersUI() {
    this.shapeLayersContainer.innerHTML = '';

    if (this.state.shapes.length === 0) {
      this.shapeLayersContainer.innerHTML = '<div class="empty-state">No shapes added</div>';
      return;
    }

    this.state.shapes.forEach((shape, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>${shape.shapeType === 'square' ? '⬜' : '🔵'} ${shape.shapeType === 'square' ? 'Square' : 'Circle'} ${index + 1}</h4>
          <div class="layer-actions">
            <button class="icon-btn" data-action="up" data-id="${shape.id}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="icon-btn" data-action="down" data-id="${shape.id}" ${index === this.state.shapes.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="icon-btn danger" data-action="delete" data-id="${shape.id}">×</button>
          </div>
        </div>

        <div class="compact-row">
          <div>
            <label><span class="color-preview" style="background-color: ${shape.color}"></span>Color</label>
            <input type="color" class="shape-color-input" data-id="${shape.id}" value="${shape.color}">
          </div>
          <div>
            <label>Opacity: <span class="value-display">${Math.round(shape.opacity * 100)}%</span></label>
            <input type="range" class="shape-opacity-input" data-id="${shape.id}" min="0" max="1" step="0.1" value="${shape.opacity}">
          </div>
        </div>

        <div class="compact-row${shape.shapeType === 'circle' ? '' : ' three-col'}">
          <div>
            <label>${shape.shapeType === 'square' ? 'Width' : 'Size'}: <span class="value-display">${Math.round(shape.width)}px</span></label>
            <input type="range" class="shape-width-input" data-id="${shape.id}" min="10" max="400" value="${shape.width}">
          </div>
          ${shape.shapeType === 'square' ? `
            <div>
              <label>Height: <span class="value-display">${Math.round(shape.height)}px</span></label>
              <input type="range" class="shape-height-input" data-id="${shape.id}" min="10" max="400" value="${shape.height}">
            </div>
          ` : ''}
        </div>
      `;

      this.shapeLayersContainer.appendChild(layerElement);
    });

    this.setupShapeLayerEventListeners();
  }

  // Setup event listeners for shape layer controls
  setupShapeLayerEventListeners() {
    this.shapeLayersContainer.querySelectorAll('.shape-color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const shape = this.state.shapes.find(s => s.id === id);
        if (shape) {
          shape.color = e.target.value;
          e.target.previousElementSibling.querySelector('.color-preview').style.backgroundColor = e.target.value;
          this.renderCanvas();
        }
      });
    });

    this.shapeLayersContainer.querySelectorAll('.shape-opacity-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const shape = this.state.shapes.find(s => s.id === id);
        if (shape) {
          shape.opacity = parseFloat(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${Math.round(shape.opacity * 100)}%`;
          this.renderCanvas();
        }
      });
    });

    this.shapeLayersContainer.querySelectorAll('.shape-width-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const shape = this.state.shapes.find(s => s.id === id);
        if (shape) {
          shape.width = parseInt(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${Math.round(shape.width)}px`;
          if (shape.shapeType === 'circle') {
            shape.height = shape.width;
          }
          this.renderCanvas();
        }
      });
    });

    this.shapeLayersContainer.querySelectorAll('.shape-height-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const shape = this.state.shapes.find(s => s.id === id);
        if (shape && shape.shapeType === 'square') {
          shape.height = parseInt(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${Math.round(shape.height)}px`;
          this.renderCanvas();
        }
      });
    });

    this.shapeLayersContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const action = e.target.dataset.action;
        
        if (action === 'delete') {
          this.saveState();
          this.state.shapes = this.state.shapes.filter(s => s.id !== id);
          this.renderShapeLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        } else if (action === 'up') {
          const index = this.state.shapes.findIndex(s => s.id === id);
          if (index > 0) {
            this.saveState();
            [this.state.shapes[index], this.state.shapes[index - 1]] =
              [this.state.shapes[index - 1], this.state.shapes[index]];
            this.renderShapeLayersUI();
            this.renderCanvas();
            this.updateUndoRedoButtons();
          }
        } else if (action === 'down') {
          const index = this.state.shapes.findIndex(s => s.id === id);
          if (index < this.state.shapes.length - 1) {
            this.saveState();
            [this.state.shapes[index], this.state.shapes[index + 1]] =
              [this.state.shapes[index + 1], this.state.shapes[index]];
            this.renderShapeLayersUI();
            this.renderCanvas();
            this.updateUndoRedoButtons();
          }
        }
      });
    });
  }

  // Render compact speech bubble UI controls
  renderSpeechBubblesUI() {
    this.speechBubbleLayersContainer.innerHTML = '';

    if (this.state.speechBubbles.length === 0) {
      this.speechBubbleLayersContainer.innerHTML = '<div class="empty-state">No speech bubbles added</div>';
      return;
    }

    this.state.speechBubbles.forEach((bubble, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>💬 Bubble ${index + 1}</h4>
          <div class="layer-actions">
            <button class="icon-btn" data-action="up" data-id="${bubble.id}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="icon-btn" data-action="down" data-id="${bubble.id}" ${index === this.state.speechBubbles.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="icon-btn danger" data-action="delete" data-id="${bubble.id}">×</button>
          </div>
        </div>

        <div class="compact-row">
          <div>
            <label>Width: <span class="value-display">${Math.round(bubble.width)}px</span></label>
            <input type="range" class="bubble-width-input" data-id="${bubble.id}" min="50" max="400" value="${bubble.width}">
          </div>
          <div>
            <label>Height: <span class="value-display">${Math.round(bubble.height)}px</span></label>
            <input type="range" class="bubble-height-input" data-id="${bubble.id}" min="50" max="400" value="${bubble.height}">
          </div>
        </div>
      `;

      this.speechBubbleLayersContainer.appendChild(layerElement);
    });

    this.setupSpeechBubbleEventListeners();
  }

  // Setup event listeners for speech bubble controls
  setupSpeechBubbleEventListeners() {
    this.speechBubbleLayersContainer.querySelectorAll('.bubble-width-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const bubble = this.state.speechBubbles.find(b => b.id === id);
        if (bubble) {
          bubble.width = parseInt(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${Math.round(bubble.width)}px`;
          this.renderCanvas();
        }
      });
    });

    this.speechBubbleLayersContainer.querySelectorAll('.bubble-height-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const bubble = this.state.speechBubbles.find(b => b.id === id);
        if (bubble) {
          bubble.height = parseInt(e.target.value);
          e.target.previousElementSibling.querySelector('.value-display').textContent = `${Math.round(bubble.height)}px`;
          this.renderCanvas();
        }
      });
    });

    this.speechBubbleLayersContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const action = e.target.dataset.action;
        
        if (action === 'delete') {
          this.saveState();
          this.state.speechBubbles = this.state.speechBubbles.filter(b => b.id !== id);
          this.renderSpeechBubblesUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        } else if (action === 'up') {
          const index = this.state.speechBubbles.findIndex(b => b.id === id);
          if (index > 0) {
            this.saveState();
            [this.state.speechBubbles[index], this.state.speechBubbles[index - 1]] =
              [this.state.speechBubbles[index - 1], this.state.speechBubbles[index]];
            this.renderSpeechBubblesUI();
            this.renderCanvas();
            this.updateUndoRedoButtons();
          }
        } else if (action === 'down') {
          const index = this.state.speechBubbles.findIndex(b => b.id === id);
          if (index < this.state.speechBubbles.length - 1) {
            this.saveState();
            [this.state.speechBubbles[index], this.state.speechBubbles[index + 1]] =
              [this.state.speechBubbles[index + 1], this.state.speechBubbles[index]];
            this.renderSpeechBubblesUI();
            this.renderCanvas();
            this.updateUndoRedoButtons();
          }
        }
      });
    });
  }

  // Save state for undo
  saveState() {
    this.state.undoStack.push(JSON.stringify({
      textLayers: this.state.textLayers,
      shapes: this.state.shapes,
      uploadedImages: this.state.uploadedImages,
      speechBubbles: this.state.speechBubbles
    }));

    if (this.state.undoStack.length > 20) {
      this.state.undoStack.shift();
    }

    this.state.redoStack = [];
  }

  // Undo last change
  undo() {
    if (this.state.undoStack.length > 0) {
      this.state.redoStack.push(JSON.stringify({
        textLayers: this.state.textLayers,
        shapes: this.state.shapes,
        uploadedImages: this.state.uploadedImages,
        speechBubbles: this.state.speechBubbles
      }));

      const prevState = JSON.parse(this.state.undoStack.pop());
      this.state.textLayers = prevState.textLayers;
      this.state.shapes = prevState.shapes;
      this.state.uploadedImages = prevState.uploadedImages;
      this.state.speechBubbles = prevState.speechBubbles || [];

      this.renderCanvas();
      this.renderTextLayersUI();
      this.renderImageLayersUI();
      this.renderShapeLayersUI();
      this.renderSpeechBubblesUI();
      this.updateUndoRedoButtons();
    }
  }

  // Redo last undone change
  redo() {
    if (this.state.redoStack.length > 0) {
      this.state.undoStack.push(JSON.stringify({
        textLayers: this.state.textLayers,
        shapes: this.state.shapes,
        uploadedImages: this.state.uploadedImages,
        speechBubbles: this.state.speechBubbles
      }));

      const redoneState = JSON.parse(this.state.redoStack.pop());
      this.state.textLayers = redoneState.textLayers;
      this.state.shapes = redoneState.shapes;
      this.state.uploadedImages = redoneState.uploadedImages;
      this.state.speechBubbles = redoneState.speechBubbles || [];

      this.renderCanvas();
      this.renderTextLayersUI();
      this.renderImageLayersUI();
      this.renderShapeLayersUI();
      this.renderSpeechBubblesUI();
      this.updateUndoRedoButtons();
    }
  }

  // Check if canvas is tainted
  isCanvasTainted() {
    try {
      this.canvas.toDataURL('image/png');
      return false;
    } catch (error) {
      return error.name === 'SecurityError';
    }
  }

  // Render canvas with aspect ratio preserved
  renderCanvas() {
    this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state.selectedTemplate && this.state.selectedTemplate !== 'custom') {
      const template = this.state.templates.find(t => t.id === this.state.selectedTemplate);
      if (template && template.url) {
        if (this.state.imageCache[template.url]) {
          const img = this.state.imageCache[template.url];
          
          const canvasAspect = this.bufferCanvas.width / this.bufferCanvas.height;
          const imageAspect = img.width / img.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imageAspect > canvasAspect) {
            drawWidth = this.bufferCanvas.width;
            drawHeight = this.bufferCanvas.width / imageAspect;
            drawX = 0;
            drawY = (this.bufferCanvas.height - drawHeight) / 2;
          } else {
            drawHeight = this.bufferCanvas.height;
            drawWidth = this.bufferCanvas.height * imageAspect;
            drawY = 0;
            drawX = (this.bufferCanvas.width - drawWidth) / 2;
          }
          
          this.bufferCtx.fillStyle = '#FFFFFF';
          this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
          this.bufferCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          
          this.drawCanvasLayers();
          this.ctx.drawImage(this.bufferCanvas, 0, 0);
        } else {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            this.state.imageCache[template.url] = img;
            this.renderCanvas();
          };
          img.onerror = () => {
            console.error('Failed to load template image');
            this.bufferCtx.fillStyle = '#FFFFFF';
            this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
            this.drawCanvasLayers();
            this.ctx.drawImage(this.bufferCanvas, 0, 0);
          };
          img.src = template.url;
        }
        return;
      }
    }

    this.bufferCtx.fillStyle = '#FFFFFF';
    this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    this.drawCanvasLayers();
    this.ctx.drawImage(this.bufferCanvas, 0, 0);
  }

  // Draw all layers on canvas
  drawCanvasLayers() {
    // Draw shapes first
    this.state.shapes.forEach(shape => {
      this.bufferCtx.globalAlpha = shape.opacity;
      this.bufferCtx.fillStyle = shape.color;

      if (shape.shapeType === 'square') {
        this.bufferCtx.fillRect(
          shape.x - (shape.width / 2),
          shape.y - (shape.height / 2),
          shape.width,
          shape.height
        );
      } else if (shape.shapeType === 'circle') {
        this.bufferCtx.beginPath();
        this.bufferCtx.arc(shape.x, shape.y, shape.width / 2, 0, Math.PI * 2);
        this.bufferCtx.fill();
      }
    });

    this.bufferCtx.globalAlpha = 1;

    // Draw uploaded images
    let pendingImages = 0;

    this.state.uploadedImages.forEach(image => {
      if (this.state.imageCache[image.src]) {
        this.bufferCtx.drawImage(
          this.state.imageCache[image.src],
          image.x, image.y, image.width, image.height
        );
      } else {
        pendingImages++;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          this.state.imageCache[image.src] = img;
          this.bufferCtx.drawImage(img, image.x, image.y, image.width, image.height);
          pendingImages--;
          if (pendingImages === 0) {
            this.drawSpeechBubbles();
            this.drawTextLayers();
            this.ctx.drawImage(this.bufferCanvas, 0, 0);
          }
        };
        img.onerror = () => {
          console.error(`Failed to load uploaded image: ${image.src}`);
          pendingImages--;
          if (pendingImages === 0) {
            this.drawSpeechBubbles();
            this.drawTextLayers();
            this.ctx.drawImage(this.bufferCanvas, 0, 0);
          }
        };
        img.src = image.src;
      }
    });
    
    this.drawSpeechBubbles();

    if (pendingImages === 0) {
      this.drawTextLayers();
      this.ctx.drawImage(this.bufferCanvas, 0, 0);
    }
  }
  
  // Draw speech bubbles
  drawSpeechBubbles() {
    let pendingBubbles = 0;
    
    this.state.speechBubbles.forEach(bubble => {
      if (this.state.imageCache[bubble.src]) {
        this.bufferCtx.drawImage(
          this.state.imageCache[bubble.src],
          bubble.x, bubble.y, bubble.width, bubble.height
        );
      } else {
        pendingBubbles++;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          this.state.imageCache[bubble.src] = img;
          this.bufferCtx.drawImage(img, bubble.x, bubble.y, bubble.width, bubble.height);
          pendingBubbles--;
          if (pendingBubbles === 0) {
            this.drawTextLayers();
            this.ctx.drawImage(this.bufferCanvas, 0, 0);
          }
        };
        img.onerror = () => {
          console.error(`Failed to load speech bubble: ${bubble.src}`);
          pendingBubbles--;
          if (pendingBubbles === 0) {
            this.drawTextLayers();
            this.ctx.drawImage(this.bufferCanvas, 0, 0);
          }
        };
        img.src = bubble.src;
      }
    });
  }

  // Draw text layers
  drawTextLayers() {
    this.state.textLayers.forEach(layer => {
      this.bufferCtx.font = `${layer.fontSize}px ${layer.fontFamily}`;
      this.bufferCtx.textAlign = layer.align;
      this.bufferCtx.textBaseline = 'middle';

      if (layer.strokeWidth > 0) {
        this.bufferCtx.lineWidth = layer.strokeWidth;
        this.bufferCtx.strokeStyle = layer.strokeColor;
        this.bufferCtx.strokeText(layer.text, layer.x, layer.y);
      }

      this.bufferCtx.fillStyle = layer.color;
      this.bufferCtx.fillText(layer.text, layer.x, layer.y);
    });
  }

  // Handle canvas mouse events
  handleCanvasMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check text layers
    for (let i = this.state.textLayers.length - 1; i >= 0; i--) {
      const layer = this.state.textLayers[i];
      if (layer.draggable) {
        this.ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
        const textWidth = this.ctx.measureText(layer.text).width;
        const textHeight = layer.fontSize;

        let textX = layer.x;
        if (layer.align === 'center') {
          textX = layer.x - (textWidth / 2);
        } else if (layer.align === 'right') {
          textX = layer.x - textWidth;
        }

        if (x >= textX - 10 && x <= textX + textWidth + 10 &&
            y >= layer.y - (textHeight / 2) - 10 && y <= layer.y + (textHeight / 2) + 10) {
          this.state.isDragging = true;
          this.state.selectedElement = { type: 'text', index: i };
          this.state.dragOffsetX = x - layer.x;
          this.state.dragOffsetY = y - layer.y;
          return;
        }
      }
    }
    
    // Check speech bubbles
    for (let i = this.state.speechBubbles.length - 1; i >= 0; i--) {
      const bubble = this.state.speechBubbles[i];
      if (bubble.draggable) {
        if (x >= bubble.x && x <= bubble.x + bubble.width &&
            y >= bubble.y && y <= bubble.y + bubble.height) {
          this.state.isDragging = true;
          this.state.selectedElement = { type: 'speechBubble', index: i };
          this.state.dragOffsetX = x - bubble.x;
          this.state.dragOffsetY = y - bubble.y;
          return;
        }
      }
    }

    // Check uploaded images
    for (let i = this.state.uploadedImages.length - 1; i >= 0; i--) {
      const image = this.state.uploadedImages[i];
      if (image.draggable) {
        if (x >= image.x && x <= image.x + image.width &&
            y >= image.y && y <= image.y + image.height) {
          this.state.isDragging = true;
          this.state.selectedElement = { type: 'image', index: i };
          this.state.dragOffsetX = x - image.x;
          this.state.dragOffsetY = y - image.y;
          return;
        }
      }
    }

    // Check shapes
    for (let i = this.state.shapes.length - 1; i >= 0; i--) {
      const shape = this.state.shapes[i];
      if (shape.draggable) {
        if (shape.shapeType === 'square') {
          if (x >= shape.x - (shape.width / 2) && x <= shape.x + (shape.width / 2) &&
              y >= shape.y - (shape.height / 2) && y <= shape.y + (shape.height / 2)) {
            this.state.isDragging = true;
            this.state.selectedElement = { type: 'shape', index: i };
            this.state.dragOffsetX = x - shape.x;
            this.state.dragOffsetY = y - shape.y;
            return;
          }
        } else if (shape.shapeType === 'circle') {
          const distance = Math.sqrt(Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2));
          if (distance <= shape.width / 2) {
            this.state.isDragging = true;
            this.state.selectedElement = { type: 'shape', index: i };
            this.state.dragOffsetX = x - shape.x;
            this.state.dragOffsetY = y - shape.y;
            return;
          }
        }
      }
    }
  }

  handleCanvasMouseMove(e) {
    if (this.state.isDragging && this.state.selectedElement) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.state.selectedElement.type === 'text') {
        const layer = this.state.textLayers[this.state.selectedElement.index];
        layer.x = x - this.state.dragOffsetX;
        layer.y = y - this.state.dragOffsetY;
      } else if (this.state.selectedElement.type === 'image') {
        const image = this.state.uploadedImages[this.state.selectedElement.index];
        image.x = x - this.state.dragOffsetX;
        image.y = y - this.state.dragOffsetY;
      } else if (this.state.selectedElement.type === 'shape') {
        const shape = this.state.shapes[this.state.selectedElement.index];
        shape.x = x - this.state.dragOffsetX;
        shape.y = y - this.state.dragOffsetY;
      } else if (this.state.selectedElement.type === 'speechBubble') {
        const bubble = this.state.speechBubbles[this.state.selectedElement.index];
        bubble.x = x - this.state.dragOffsetX;
        bubble.y = y - this.state.dragOffsetY;
      }

      if (!this.renderPending) {
        this.renderPending = true;
        requestAnimationFrame(() => {
          this.renderCanvas();
          this.renderPending = false;
        });
      }
    }
  }

  handleCanvasMouseUp() {
    if (this.state.isDragging) {
      this.saveState();
      this.state.isDragging = false;
      this.state.selectedElement = null;
      this.updateUndoRedoButtons();
    }
  }

  // Update undo/redo buttons state
  updateUndoRedoButtons() {
    this.undoBtn.disabled = this.state.undoStack.length === 0;
    this.redoBtn.disabled = this.state.redoStack.length === 0;
  }

  // FIXED Download the meme as an image - No background, only content
  downloadMeme(format = 'png') {
    if (this.isDownloading) return;
    this.isDownloading = true;

    try {
      const loadAllImages = () => {
        return new Promise((resolve, reject) => {
          let pendingImages = 0;
          const imagesToLoad = [];

          // Collect all images that need to be loaded
          const template = this.state.selectedTemplate
            ? this.state.templates.find(t => t.id === this.state.selectedTemplate)
            : null;

          if (template && template.url) {
            imagesToLoad.push({ url: template.url, type: 'template' });
          }

          this.state.uploadedImages.forEach(image => {
            imagesToLoad.push({ url: image.src, type: 'uploaded' });
          });

          this.state.speechBubbles.forEach(bubble => {
            imagesToLoad.push({ url: bubble.src, type: 'speechBubble' });
          });

          if (imagesToLoad.length === 0) {
            resolve();
            return;
          }

          pendingImages = imagesToLoad.length;

          imagesToLoad.forEach(imageData => {
            if (this.state.imageCache[imageData.url]) {
              pendingImages--;
              if (pendingImages === 0) resolve();
            } else {
              const img = new Image();
              
              // Handle CORS for external images
              if (imageData.url.startsWith('http') && !imageData.url.startsWith(window.location.origin)) {
                img.crossOrigin = 'anonymous';
              }
              
              img.onload = () => {
                this.state.imageCache[imageData.url] = img;
                pendingImages--;
                if (pendingImages === 0) resolve();
              };
              
              img.onerror = (error) => {
                console.warn(`Failed to load image for download: ${imageData.url}`, error);
                // Continue without this image
                pendingImages--;
                if (pendingImages === 0) resolve();
              };
              
              img.src = imageData.url;
            }
          });
        });
      };

      const calculateContentBounds = () => {
        const template = this.state.selectedTemplate
          ? this.state.templates.find(t => t.id === this.state.selectedTemplate)
          : null;

        // If we have a template image, use its original dimensions
        if (template && template.url && this.state.imageCache[template.url] && this.state.selectedTemplate !== 'custom') {
          const img = this.state.imageCache[template.url];
          return {
            width: img.width,
            height: img.height,
            offsetX: 0,
            offsetY: 0,
            scaleX: img.width / this.canvas.width,
            scaleY: img.height / this.canvas.height
          };
        }

        // If no template, calculate bounding box of all content
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let hasContent = false;

        // Check text layers
        this.state.textLayers.forEach(layer => {
          const tempCtx = document.createElement('canvas').getContext('2d');
          tempCtx.font = `${layer.fontSize}px ${layer.fontFamily}`;
          const textWidth = tempCtx.measureText(layer.text).width;
          const textHeight = layer.fontSize;

          let textX = layer.x;
          if (layer.align === 'center') {
            textX = layer.x - (textWidth / 2);
          } else if (layer.align === 'right') {
            textX = layer.x - textWidth;
          }

          minX = Math.min(minX, textX);
          minY = Math.min(minY, layer.y - textHeight / 2);
          maxX = Math.max(maxX, textX + textWidth);
          maxY = Math.max(maxY, layer.y + textHeight / 2);
          hasContent = true;
        });

        // Check uploaded images
        this.state.uploadedImages.forEach(image => {
          minX = Math.min(minX, image.x);
          minY = Math.min(minY, image.y);
          maxX = Math.max(maxX, image.x + image.width);
          maxY = Math.max(maxY, image.y + image.height);
          hasContent = true;
        });

        // Check shapes
        this.state.shapes.forEach(shape => {
          if (shape.shapeType === 'square') {
            minX = Math.min(minX, shape.x - shape.width / 2);
            minY = Math.min(minY, shape.y - shape.height / 2);
            maxX = Math.max(maxX, shape.x + shape.width / 2);
            maxY = Math.max(maxY, shape.y + shape.height / 2);
          } else if (shape.shapeType === 'circle') {
            minX = Math.min(minX, shape.x - shape.width / 2);
            minY = Math.min(minY, shape.y - shape.width / 2);
            maxX = Math.max(maxX, shape.x + shape.width / 2);
            maxY = Math.max(maxY, shape.y + shape.width / 2);
          }
          hasContent = true;
        });

        // Check speech bubbles
        this.state.speechBubbles.forEach(bubble => {
          minX = Math.min(minX, bubble.x);
          minY = Math.min(minY, bubble.y);
          maxX = Math.max(maxX, bubble.x + bubble.width);
          maxY = Math.max(maxY, bubble.y + bubble.height);
          hasContent = true;
        });

        // If no content, return default canvas size
        if (!hasContent) {
          return {
            width: this.canvas.width,
            height: this.canvas.height,
            offsetX: 0,
            offsetY: 0,
            scaleX: 1,
            scaleY: 1
          };
        }

        // Add some padding around content
        const padding = 20;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        // Ensure bounds are within canvas
        minX = Math.max(0, minX);
        minY = Math.max(0, minY);
        maxX = Math.min(this.canvas.width, maxX);
        maxY = Math.min(this.canvas.height, maxY);

        return {
          width: Math.ceil(maxX - minX),
          height: Math.ceil(maxY - minY),
          offsetX: minX,
          offsetY: minY,
          scaleX: 1,
          scaleY: 1
        };
      };

      const renderToDownloadCanvas = () => {
        const bounds = calculateContentBounds();
        
        // Create canvas with content-specific dimensions
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = bounds.width;
        downloadCanvas.height = bounds.height;
        const downloadCtx = downloadCanvas.getContext('2d');

        // Calculate scaling and positioning
        const canvasScaleX = bounds.scaleX;
        const canvasScaleY = bounds.scaleY;

        // Clear the download canvas (transparent for PNG, white for JPG)
        downloadCtx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);
        
        if (format === 'jpg') {
          // JPG doesn't support transparency, so fill with white
          downloadCtx.fillStyle = '#FFFFFF';
          downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
        }

        // Draw background template if exists
        if (this.state.selectedTemplate && this.state.selectedTemplate !== 'custom') {
          const template = this.state.templates.find(t => t.id === this.state.selectedTemplate);
          if (template && template.url && this.state.imageCache[template.url]) {
            const img = this.state.imageCache[template.url];
            // Draw template at its original size
            downloadCtx.drawImage(img, 0, 0, bounds.width, bounds.height);
          }
        }

        // Helper function to transform coordinates
        const transformX = (x) => (x - bounds.offsetX) * canvasScaleX;
        const transformY = (y) => (y - bounds.offsetY) * canvasScaleY;
        const transformSize = (size, axis) => size * (axis === 'x' ? canvasScaleX : canvasScaleY);

        // Draw shapes
        this.state.shapes.forEach(shape => {
          downloadCtx.globalAlpha = shape.opacity;
          downloadCtx.fillStyle = shape.color;

          const shapeX = transformX(shape.x);
          const shapeY = transformY(shape.y);
          const shapeWidth = transformSize(shape.width, 'x');
          const shapeHeight = transformSize(shape.height, 'y');

          if (shape.shapeType === 'square') {
            downloadCtx.fillRect(
              shapeX - (shapeWidth / 2),
              shapeY - (shapeHeight / 2),
              shapeWidth,
              shapeHeight
            );
          } else if (shape.shapeType === 'circle') {
            downloadCtx.beginPath();
            downloadCtx.arc(shapeX, shapeY, shapeWidth / 2, 0, Math.PI * 2);
            downloadCtx.fill();
          }
        });

        downloadCtx.globalAlpha = 1;

        // Draw uploaded images
        this.state.uploadedImages.forEach(image => {
          if (this.state.imageCache[image.src]) {
            const imgX = transformX(image.x);
            const imgY = transformY(image.y);
            const imgWidth = transformSize(image.width, 'x');
            const imgHeight = transformSize(image.height, 'y');
            
            downloadCtx.drawImage(
              this.state.imageCache[image.src],
              imgX, imgY, imgWidth, imgHeight
            );
          }
        });

        // Draw speech bubbles
        this.state.speechBubbles.forEach(bubble => {
          if (this.state.imageCache[bubble.src]) {
            const bubbleX = transformX(bubble.x);
            const bubbleY = transformY(bubble.y);
            const bubbleWidth = transformSize(bubble.width, 'x');
            const bubbleHeight = transformSize(bubble.height, 'y');
            
            downloadCtx.drawImage(
              this.state.imageCache[bubble.src],
              bubbleX, bubbleY, bubbleWidth, bubbleHeight
            );
          }
        });

        // Draw text layers
        this.state.textLayers.forEach(layer => {
          const fontSize = transformSize(layer.fontSize, 'y');
          const strokeWidth = transformSize(layer.strokeWidth, 'y');
          const textX = transformX(layer.x);
          const textY = transformY(layer.y);

          downloadCtx.font = `${fontSize}px ${layer.fontFamily}`;
          downloadCtx.textAlign = layer.align;
          downloadCtx.textBaseline = 'middle';

          if (strokeWidth > 0) {
            downloadCtx.lineWidth = strokeWidth;
            downloadCtx.strokeStyle = layer.strokeColor;
            downloadCtx.strokeText(layer.text, textX, textY);
          }

          downloadCtx.fillStyle = layer.color;
          downloadCtx.fillText(layer.text, textX, textY);
        });

        return downloadCanvas;
      };

      // Load all images and then render and download
      loadAllImages().then(() => {
        try {
          const downloadCanvas = renderToDownloadCanvas();

          // Convert to blob for better browser support
          downloadCanvas.toBlob((blob) => {
            if (!blob) {
              console.error('Failed to create blob from canvas');
              alert('Failed to generate meme image. Please try again.');
              this.isDownloading = false;
              return;
            }

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const extension = format === 'jpg' ? 'jpg' : 'png';
            
            link.href = url;
            link.download = `meme-${Date.now()}.${extension}`;
            link.style.display = 'none';

            // Trigger download
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }, 100);

            this.isDownloading = false;
          }, format === 'jpg' ? 'image/jpeg' : 'image/png', format === 'jpg' ? 0.9 : 1.0);

        } catch (error) {
          console.error('Error rendering canvas for download:', error);
          alert('Failed to generate meme image. Please try again.');
          this.isDownloading = false;
        }
      }).catch(error => {
        console.error('Error loading images for download:', error);
        alert('Failed to load all images for download. Please try again.');
        this.isDownloading = false;
      });

    } catch (error) {
      console.error('Error in downloadMeme:', error);
      alert('An unexpected error occurred while downloading the meme. Please try again.');
      this.isDownloading = false;
    }
  }

  // Reset the canvas
  resetCanvas() {
    if (confirm('Are you sure you want to reset the canvas? This will clear all your work.')) {
      this.saveState();
      this.state.textLayers = [];
      this.state.shapes = [];
      this.state.uploadedImages = [];
      this.state.speechBubbles = [];
      this.state.selectedTemplate = null;

      this.renderTextLayersUI();
      this.renderShapeLayersUI();
      this.renderImageLayersUI();
      this.renderSpeechBubblesUI();
      this.renderCanvas();
      this.updateUndoRedoButtons();

      this.templatesContainer.querySelectorAll('.template-option').forEach(el => {
        el.classList.remove('selected');
      });
    }
  }

  // Connected callback
  connectedCallback() {
    if (this.state.textLayers.length === 0) {
      this.addTextLayer();
    }

    this.preloadFonts();
  }

  // Preload fonts
  preloadFonts() {
    const fontPreloader = document.createElement('div');
    fontPreloader.style.opacity = '0';
    fontPreloader.style.position = 'absolute';
    fontPreloader.style.left = '-9999px';

    this.state.fonts.forEach(font => {
      const span = document.createElement('span');
      span.style.fontFamily = font;
      span.textContent = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      fontPreloader.appendChild(span);
    });

    document.body.appendChild(fontPreloader);
    setTimeout(() => {
      document.body.removeChild(fontPreloader);
    }, 1000);
  }
}

// Register the custom element for Wix
customElements.define('meme-generator', MemeGenerator);

// Wix Custom Element Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemeGenerator;
}

// Global registration for Wix environment
if (typeof window !== 'undefined' && window.customElements) {
  window.MemeGenerator = MemeGenerator;
}
