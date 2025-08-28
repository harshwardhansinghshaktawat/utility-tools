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
      drawings: [],
      canvasWidth: 600,
      canvasHeight: 600,
      undoStack: [],
      redoStack: [],
      isDragging: false,
      selectedElement: null,
      dragOffsetX: 0,
      dragOffsetY: 0,
      imageCache: {},
      collapsedSections: {
        text: true,
        images: false,
        shapes: true,
        speech: false,
        drawing: false,
        canvas: true
      },
      canvasPadding: {
        top: 0,
        bottom: 0
      },
      originalCanvasHeight: 600,
      isDrawing: false,
      drawingMode: false,
      brushSize: 5,
      brushColor: '#000000',
      lastDrawPoint: null,
      currentPath: [],
      fonts: [
        'Impact', 'Anton', 'Bebas Neue', 'Oswald', 'Russo One',
        'Fredoka One', 'Bungee', 'Permanent Marker', 'Creepster',
        'Press Start 2P', 'Monoton', 'Black Ops One', 'Orbitron',
        'Arial', 'Comic Sans MS', 'Helvetica', 'Times New Roman',
        'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond',
        'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS Gothic', 
        'Noto Sans JP', 'Kosugi Maru', 'M PLUS 1p',
        'Noto Sans Devanagari', 'Mangal', 'Kokila', 'Utsaah',
        'Aparajita', 'Sanskrit Text',
        'Malgun Gothic', 'Dotum', 'Gulim', 'Batang', 'Gungsuh',
        'Noto Sans KR', 'Jua',
        'SimSun', 'Microsoft YaHei', 'SimHei', 'Noto Sans SC',
        'Tahoma', 'Arial Unicode MS', 'Noto Sans Arabic',
        'Noto Sans', 'Roboto', 'Open Sans'
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

  // Initialize the UI components
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
          --warning-color: #f39c12;
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

        .editor-container {
          display: grid;
          grid-template-columns: minmax(280px, 350px) 1fr minmax(280px, 350px);
          gap: 15px;
          width: 100%;
          min-height: 500px;
        }

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
          cursor: default;
        }

        #meme-canvas.drawing-mode {
          cursor: crosshair;
        }

        #buffer-canvas {
          display: none;
        }

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

        .text-presets {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
          margin-bottom: 12px;
        }

        .text-presets button {
          font-size: 11px;
          padding: 4px 8px;
          min-height: 26px;
        }

        .drawing-mode-toggle {
          background-color: var(--warning-color);
          margin-bottom: 8px;
        }

        .drawing-mode-toggle:hover {
          background-color: #e67e22;
        }

        .drawing-mode-toggle.active {
          background-color: var(--success-color);
        }

        .drawing-mode-toggle.active:hover {
          background-color: #27ae60;
        }

        .drawing-brush-controls {
          display: grid;
          grid-template-columns: 1fr 80px;
          gap: 8px;
          align-items: end;
        }

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

        button.warning {
          background-color: var(--warning-color);
        }

        button.warning:hover {
          background-color: #e67e22;
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

        .empty-state {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 16px;
          font-style: italic;
        }

        @media (max-width: 992px) {
          .editor-container {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .sidebar {
            max-height: none;
          }
        }
      </style>

      <div class="meme-generator-container">
        <div class="templates-row" id="templates-container"></div>

        <div class="editor-container">
          <div class="sidebar">
            <div class="control-group">
              <div class="control-group-header collapsed" data-section="canvas">
                <h3>Canvas Settings</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content collapsed" data-content="canvas">
                <label>Add empty space for text/images:</label>
                
                <div class="compact-row">
                  <div>
                    <label>Top Padding: <span class="value-display" id="top-padding-display">0px</span></label>
                    <input type="range" id="top-padding-input" min="0" max="300" value="0">
                  </div>
                  <div>
                    <label>Bottom Padding: <span class="value-display" id="bottom-padding-display">0px</span></label>
                    <input type="range" id="bottom-padding-input" min="0" max="300" value="0">
                  </div>
                </div>
                
                <div class="btn-group">
                  <button id="reset-canvas-size-btn" class="warning">Reset Size</button>
                  <button id="fit-content-btn">Auto Fit</button>
                </div>
                
                <div style="font-size: 11px; color: #666; margin-top: 8px;">
                  Current size: <span id="canvas-size-display">600×600</span>
                </div>
              </div>
            </div>

            <div class="control-group">
              <div class="control-group-header collapsed" data-section="text">
                <h3>Text Layers</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content collapsed" data-content="text">
                <div class="text-presets">
                  <button class="preset-btn" data-preset="2">+ 2 Text</button>
                  <button class="preset-btn" data-preset="3">+ 3 Text</button>
                  <button class="preset-btn" data-preset="4">+ 4 Text</button>
                  <button class="preset-btn" data-preset="5">+ 5 Text</button>
                </div>
                <button id="add-text-btn">+ Add Text</button>
                <div id="text-layers-container">
                  <div class="empty-state">No text layers added</div>
                </div>
              </div>
            </div>

            <div class="control-group">
              <div class="control-group-header" data-section="drawing">
                <h3>Drawing Tool</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content" data-content="drawing">
                <button id="drawing-mode-toggle" class="drawing-mode-toggle">Enable Drawing Mode</button>
                
                <div class="drawing-brush-controls">
                  <div>
                    <label>Brush Size: <span class="value-display" id="brush-size-display">5px</span></label>
                    <input type="range" id="brush-size-input" min="1" max="50" value="5">
                  </div>
                  <div>
                    <label><span class="color-preview" id="brush-color-preview" style="background-color: #000000"></span>Color</label>
                    <input type="color" id="brush-color-input" value="#000000">
                  </div>
                </div>
                
                <div class="btn-group">
                  <button id="clear-drawing-btn" class="danger">Clear Drawing</button>
                </div>
              </div>
            </div>

            <div class="control-group">
              <div class="control-group-header" data-section="images">
                <h3>Images</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content" data-content="images">
                <label class="custom-file-upload">
                  <input type="file" id="file-upload" accept="image/*">
                  Upload Image
                </label>
                <div id="image-layers-container">
                  <div class="empty-state">No images uploaded</div>
                </div>
              </div>
            </div>

            <div class="control-group">
              <div class="control-group-header collapsed" data-section="shapes">
                <h3>Shapes</h3>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="control-group-content collapsed" data-content="shapes">
                <div class="btn-group">
                  <button id="add-square-btn">Square</button>
                  <button id="add-circle-btn">Circle</button>
                </div>
                <div id="shape-layers-container">
                  <div class="empty-state">No shapes added</div>
                </div>
              </div>
            </div>
          </div>

          <div class="canvas-container">
            <div class="history-controls">
              <button id="undo-btn" class="icon-btn" title="Undo" disabled>↶ Undo</button>
              <button id="redo-btn" class="icon-btn" title="Redo" disabled>↷ Redo</button>
            </div>

            <canvas id="meme-canvas" width="600" height="600"></canvas>
            <canvas id="buffer-canvas" width="600" height="600"></canvas>

            <div class="canvas-controls">
              <button id="reset-btn" class="danger">Reset</button>
            </div>

            <div class="export-options">
              <button class="export-btn success" data-format="png">Download PNG</button>
              <button class="export-btn success" data-format="jpg">Download JPG</button>
            </div>
          </div>

          <div class="sidebar">
            <div class="control-group">
              <div class="control-group-header" data-section="speech">
                <h3>Speech Bubbles</h3>
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

  setupEventListeners() {
    // Get DOM elements
    this.canvas = this.shadowRoot.getElementById('meme-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.bufferCanvas = this.shadowRoot.getElementById('buffer-canvas');
    this.bufferCtx = this.bufferCanvas.getContext('2d');
    
    this.undoBtn = this.shadowRoot.getElementById('undo-btn');
    this.redoBtn = this.shadowRoot.getElementById('redo-btn');
    this.templatesContainer = this.shadowRoot.getElementById('templates-container');
    this.textLayersContainer = this.shadowRoot.getElementById('text-layers-container');
    this.imageLayersContainer = this.shadowRoot.getElementById('image-layers-container');
    this.shapeLayersContainer = this.shadowRoot.getElementById('shape-layers-container');
    this.speechBubblesGrid = this.shadowRoot.getElementById('speech-bubbles-grid');
    this.speechBubbleLayersContainer = this.shadowRoot.getElementById('speech-bubble-layers-container');

    // Canvas padding controls
    this.topPaddingInput = this.shadowRoot.getElementById('top-padding-input');
    this.bottomPaddingInput = this.shadowRoot.getElementById('bottom-padding-input');
    this.topPaddingDisplay = this.shadowRoot.getElementById('top-padding-display');
    this.bottomPaddingDisplay = this.shadowRoot.getElementById('bottom-padding-display');
    this.canvasSizeDisplay = this.shadowRoot.getElementById('canvas-size-display');

    // Drawing controls
    this.drawingModeToggle = this.shadowRoot.getElementById('drawing-mode-toggle');
    this.brushSizeInput = this.shadowRoot.getElementById('brush-size-input');
    this.brushColorInput = this.shadowRoot.getElementById('brush-color-input');
    this.brushSizeDisplay = this.shadowRoot.getElementById('brush-size-display');
    this.brushColorPreview = this.shadowRoot.getElementById('brush-color-preview');

    this.setupCollapsibleSections();
    this.setupMainEventListeners();
    this.setupCanvasEventListeners();
    this.setupDrawingEventListeners();
    this.setupCanvasPaddingEventListeners();
    
    this.loadTemplates();
    this.loadSpeechBubbles();
    this.renderCanvas();
  }

  setupCollapsibleSections() {
    this.shadowRoot.querySelectorAll('.control-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.getAttribute('data-section');
        const content = this.shadowRoot.querySelector(`[data-content="${section}"]`);
        const isCollapsed = content.classList.contains('collapsed');
        
        if (isCollapsed) {
          content.classList.remove('collapsed');
          header.classList.remove('collapsed');
        } else {
          content.classList.add('collapsed');
          header.classList.add('collapsed');
        }
      });
    });
  }

  setupMainEventListeners() {
    this.shadowRoot.getElementById('add-text-btn').addEventListener('click', () => this.addTextLayer());
    this.shadowRoot.getElementById('add-square-btn').addEventListener('click', () => this.addShape('square'));
    this.shadowRoot.getElementById('add-circle-btn').addEventListener('click', () => this.addShape('circle'));
    this.shadowRoot.getElementById('reset-btn').addEventListener('click', () => this.resetCanvas());
    this.shadowRoot.getElementById('file-upload').addEventListener('change', (e) => this.handleImageUpload(e));
    this.undoBtn.addEventListener('click', () => this.undo());
    this.redoBtn.addEventListener('click', () => this.redo());

    // Text presets
    this.shadowRoot.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetCount = parseInt(e.target.getAttribute('data-preset'));
        this.addTextPreset(presetCount);
      });
    });

    // Export buttons
    this.shadowRoot.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.target.getAttribute('data-format');
        this.downloadMeme(format);
      });
    });
  }

  setupCanvasEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleCanvasMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseUp());
  }

  setupDrawingEventListeners() {
    this.drawingModeToggle.addEventListener('click', () => this.toggleDrawingMode());
    
    this.brushSizeInput.addEventListener('input', (e) => {
      this.state.brushSize = parseInt(e.target.value);
      this.brushSizeDisplay.textContent = `${this.state.brushSize}px`;
    });
    
    this.brushColorInput.addEventListener('input', (e) => {
      this.state.brushColor = e.target.value;
      this.brushColorPreview.style.backgroundColor = e.target.value;
    });
    
    this.shadowRoot.getElementById('clear-drawing-btn').addEventListener('click', () => this.clearDrawing());
  }

  setupCanvasPaddingEventListeners() {
    this.topPaddingInput.addEventListener('input', (e) => {
      this.state.canvasPadding.top = parseInt(e.target.value);
      this.topPaddingDisplay.textContent = `${this.state.canvasPadding.top}px`;
      this.updateCanvasSize();
    });

    this.bottomPaddingInput.addEventListener('input', (e) => {
      this.state.canvasPadding.bottom = parseInt(e.target.value);
      this.bottomPaddingDisplay.textContent = `${this.state.canvasPadding.bottom}px`;
      this.updateCanvasSize();
    });

    this.shadowRoot.getElementById('reset-canvas-size-btn').addEventListener('click', () => this.resetCanvasSize());
    this.shadowRoot.getElementById('fit-content-btn').addEventListener('click', () => this.autoFitContent());
  }

  toggleDrawingMode() {
    this.state.drawingMode = !this.state.drawingMode;
    
    if (this.state.drawingMode) {
      this.drawingModeToggle.textContent = 'Exit Drawing Mode';
      this.drawingModeToggle.classList.add('active');
      this.canvas.classList.add('drawing-mode');
    } else {
      this.drawingModeToggle.textContent = 'Enable Drawing Mode';
      this.drawingModeToggle.classList.remove('active');
      this.canvas.classList.remove('drawing-mode');
    }
  }

  clearDrawing() {
    if (this.state.drawings.length > 0) {
      this.saveState();
      this.state.drawings = [];
      this.renderCanvas();
      this.updateUndoRedoButtons();
    }
  }

  updateCanvasSize() {
    const newHeight = this.state.originalCanvasHeight + this.state.canvasPadding.top + this.state.canvasPadding.bottom;
    
    this.canvas.height = newHeight;
    this.bufferCanvas.height = newHeight;
    this.state.canvasHeight = newHeight;
    
    this.canvasSizeDisplay.textContent = `${this.canvas.width}×${newHeight}`;
    this.renderCanvas();
  }

  resetCanvasSize() {
    this.state.canvasPadding.top = 0;
    this.state.canvasPadding.bottom = 0;
    
    this.topPaddingInput.value = 0;
    this.bottomPaddingInput.value = 0;
    this.topPaddingDisplay.textContent = '0px';
    this.bottomPaddingDisplay.textContent = '0px';
    
    this.canvas.height = this.state.originalCanvasHeight;
    this.bufferCanvas.height = this.state.originalCanvasHeight;
    this.state.canvasHeight = this.state.originalCanvasHeight;
    
    this.canvasSizeDisplay.textContent = `${this.canvas.width}×${this.state.originalCanvasHeight}`;
    this.renderCanvas();
  }

  autoFitContent() {
    // Simple auto fit - just add some padding
    this.state.canvasPadding.top = 50;
    this.state.canvasPadding.bottom = 50;
    
    this.topPaddingInput.value = 50;
    this.bottomPaddingInput.value = 50;
    this.topPaddingDisplay.textContent = '50px';
    this.bottomPaddingDisplay.textContent = '50px';
    
    this.updateCanvasSize();
  }

  addTextPreset(count) {
    this.saveState();
    this.state.textLayers = [];
    
    const presetPositions = {
      2: [
        { text: 'TOP TEXT', x: 300, y: 120 },
        { text: 'BOTTOM TEXT', x: 300, y: 480 }
      ],
      3: [
        { text: 'TOP TEXT', x: 300, y: 100 },
        { text: 'MIDDLE TEXT', x: 300, y: 300 },
        { text: 'BOTTOM TEXT', x: 300, y: 500 }
      ],
      4: [
        { text: 'FIRST TEXT', x: 300, y: 80 },
        { text: 'SECOND TEXT', x: 300, y: 220 },
        { text: 'THIRD TEXT', x: 300, y: 380 },
        { text: 'FOURTH TEXT', x: 300, y: 520 }
      ],
      5: [
        { text: 'FIRST TEXT', x: 300, y: 70 },
        { text: 'SECOND TEXT', x: 300, y: 180 },
        { text: 'THIRD TEXT', x: 300, y: 300 },
        { text: 'FOURTH TEXT', x: 300, y: 420 },
        { text: 'FIFTH TEXT', x: 300, y: 530 }
      ]
    };
    
    const positions = presetPositions[count] || [];
    positions.forEach(pos => {
      this.addTextLayer(pos.text, pos.x, pos.y);
    });
    
    this.updateUndoRedoButtons();
  }

  loadTemplates() {
    this.templatesContainer.innerHTML = '';

    this.state.templates.forEach(template => {
      const templateElement = document.createElement('div');
      templateElement.className = 'template-option';
      templateElement.dataset.id = template.id;

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

  loadSpeechBubbles() {
    this.speechBubblesGrid.innerHTML = '';

    this.state.speechBubbleTypes.forEach(bubble => {
      const bubbleElement = document.createElement('div');
      bubbleElement.className = 'speech-bubble-option';

      bubbleElement.innerHTML = `<img src="${bubble.url}" alt="${bubble.name}">`;
      bubbleElement.addEventListener('click', () => this.addSpeechBubble(bubble.id));

      this.speechBubblesGrid.appendChild(bubbleElement);
    });
  }

  selectTemplate(templateId) {
    this.state.selectedTemplate = templateId;
    
    this.templatesContainer.querySelectorAll('.template-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === templateId);
    });
    
    this.renderCanvas();
  }

  addTextLayer(text = 'Text', x = 300, y = 300) {
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
  }

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
          <h4>Text ${index + 1}</h4>
          <div class="layer-actions">
            <button class="icon-btn danger" data-action="delete" data-id="${layer.id}">×</button>
          </div>
        </div>
        <input type="text" class="text-input" data-id="${layer.id}" value="${layer.text}" placeholder="Enter text">
        <select class="font-family-select" data-id="${layer.id}">
          ${this.state.fonts.map(font => `
            <option value="${font}" ${font === layer.fontFamily ? 'selected' : ''}>${font}</option>
          `).join('')}
        </select>
        <input type="range" class="font-size-input" data-id="${layer.id}" min="10" max="100" value="${layer.fontSize}">
        <input type="color" class="text-color-input" data-id="${layer.id}" value="${layer.color}">
      `;

      this.textLayersContainer.appendChild(layerElement);
    });

    this.setupTextLayerEventListeners();
  }

  renderImageLayersUI() {
    this.imageLayersContainer.innerHTML = '';
    if (this.state.uploadedImages.length === 0) {
      this.imageLayersContainer.innerHTML = '<div class="empty-state">No images uploaded</div>';
    }
  }

  renderShapeLayersUI() {
    this.shapeLayersContainer.innerHTML = '';
    if (this.state.shapes.length === 0) {
      this.shapeLayersContainer.innerHTML = '<div class="empty-state">No shapes added</div>';
    }
  }

  renderSpeechBubblesUI() {
    this.speechBubbleLayersContainer.innerHTML = '';
    if (this.state.speechBubbles.length === 0) {
      this.speechBubbleLayersContainer.innerHTML = '<div class="empty-state">No speech bubbles added</div>';
    }
  }

  setupTextLayerEventListeners() {
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

    this.textLayersContainer.querySelectorAll('.font-size-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.fontSize = parseInt(e.target.value);
          this.renderCanvas();
        }
      });
    });

    this.textLayersContainer.querySelectorAll('.text-color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.color = e.target.value;
          this.renderCanvas();
        }
      });
    });

    this.textLayersContainer.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.saveState();
        this.state.textLayers = this.state.textLayers.filter(l => l.id !== id);
        this.renderTextLayersUI();
        this.renderCanvas();
        this.updateUndoRedoButtons();
      });
    });
  }

  handleCanvasMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (this.state.drawingMode) {
      this.startDrawing(x, y);
      return;
    }

    // Handle dragging logic here
  }

  handleCanvasMouseMove(e) {
    if (this.state.drawingMode && this.state.isDrawing) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      this.continueDrawing(x, y);
    }
  }

  handleCanvasMouseUp() {
    if (this.state.drawingMode && this.state.isDrawing) {
      this.endDrawing();
    }
  }

  startDrawing(x, y) {
    this.state.isDrawing = true;
    this.state.lastDrawPoint = { x, y };
    this.state.currentPath = [{ x, y, size: this.state.brushSize, color: this.state.brushColor }];
  }

  continueDrawing(x, y) {
    if (!this.state.lastDrawPoint) return;
    
    this.state.currentPath.push({ x, y, size: this.state.brushSize, color: this.state.brushColor });
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.state.lastDrawPoint.x, this.state.lastDrawPoint.y);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.state.brushColor;
    this.ctx.lineWidth = this.state.brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    
    this.state.lastDrawPoint = { x, y };
  }

  endDrawing() {
    if (this.state.isDrawing && this.state.currentPath.length > 0) {
      this.saveState();
      this.state.drawings.push({
        id: Date.now(),
        type: 'drawing',
        points: [...this.state.currentPath]
      });
      this.updateUndoRedoButtons();
    }
    
    this.state.isDrawing = false;
    this.state.lastDrawPoint = null;
    this.state.currentPath = [];
  }

  renderCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

    // Fill with white background
    this.bufferCtx.fillStyle = '#FFFFFF';
    this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

    // Draw template if selected
    if (this.state.selectedTemplate && this.state.selectedTemplate !== 'custom') {
      const template = this.state.templates.find(t => t.id === this.state.selectedTemplate);
      if (template && template.url && this.state.imageCache[template.url]) {
        const img = this.state.imageCache[template.url];
        const templateY = this.state.canvasPadding.top;
        const templateHeight = this.state.originalCanvasHeight;
        this.bufferCtx.drawImage(img, 0, templateY, this.canvas.width, templateHeight);
      }
    }

    this.drawCanvasLayers();
    this.ctx.drawImage(this.bufferCanvas, 0, 0);
  }

  drawCanvasLayers() {
    // Draw shapes
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
    this.state.uploadedImages.forEach(image => {
      if (this.state.imageCache[image.src]) {
        this.bufferCtx.drawImage(
          this.state.imageCache[image.src],
          image.x, image.y, image.width, image.height
        );
      }
    });

    // Draw speech bubbles
    this.state.speechBubbles.forEach(bubble => {
      if (this.state.imageCache[bubble.src]) {
        this.bufferCtx.drawImage(
          this.state.imageCache[bubble.src],
          bubble.x, bubble.y, bubble.width, bubble.height
        );
      }
    });

    // Draw drawings
    this.state.drawings.forEach(drawing => {
      if (drawing.points && drawing.points.length > 1) {
        this.bufferCtx.beginPath();
        this.bufferCtx.moveTo(drawing.points[0].x, drawing.points[0].y);
        
        for (let i = 1; i < drawing.points.length; i++) {
          const point = drawing.points[i];
          const prevPoint = drawing.points[i - 1];
          
          this.bufferCtx.strokeStyle = point.color || prevPoint.color;
          this.bufferCtx.lineWidth = point.size || prevPoint.size;
          this.bufferCtx.lineCap = 'round';
          this.bufferCtx.lineJoin = 'round';
          
          this.bufferCtx.lineTo(point.x, point.y);
          this.bufferCtx.stroke();
          this.bufferCtx.beginPath();
          this.bufferCtx.moveTo(point.x, point.y);
        }
      }
    });

    // Draw text layers
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

  saveState() {
    this.state.undoStack.push(JSON.stringify({
      textLayers: this.state.textLayers,
      shapes: this.state.shapes,
      uploadedImages: this.state.uploadedImages,
      speechBubbles: this.state.speechBubbles,
      drawings: this.state.drawings,
      canvasPadding: this.state.canvasPadding
    }));

    if (this.state.undoStack.length > 20) {
      this.state.undoStack.shift();
    }

    this.state.redoStack = [];
  }

  undo() {
    if (this.state.undoStack.length > 0) {
      const currentState = JSON.stringify({
        textLayers: this.state.textLayers,
        shapes: this.state.shapes,
        uploadedImages: this.state.uploadedImages,
        speechBubbles: this.state.speechBubbles,
        drawings: this.state.drawings,
        canvasPadding: this.state.canvasPadding
      });
      
      this.state.redoStack.push(currentState);
      
      const prevState = JSON.parse(this.state.undoStack.pop());
      this.state.textLayers = prevState.textLayers;
      this.state.shapes = prevState.shapes;
      this.state.uploadedImages = prevState.uploadedImages;
      this.state.speechBubbles = prevState.speechBubbles || [];
      this.state.drawings = prevState.drawings || [];
      
      if (prevState.canvasPadding) {
        this.state.canvasPadding = prevState.canvasPadding;
        this.updateCanvasSize();
      }

      this.renderCanvas();
      this.renderTextLayersUI();
      this.updateUndoRedoButtons();
    }
  }

  redo() {
    if (this.state.redoStack.length > 0) {
      const currentState = JSON.stringify({
        textLayers: this.state.textLayers,
        shapes: this.state.shapes,
        uploadedImages: this.state.uploadedImages,
        speechBubbles: this.state.speechBubbles,
        drawings: this.state.drawings,
        canvasPadding: this.state.canvasPadding
      });
      
      this.state.undoStack.push(currentState);
      
      const redoneState = JSON.parse(this.state.redoStack.pop());
      this.state.textLayers = redoneState.textLayers;
      this.state.shapes = redoneState.shapes;
      this.state.uploadedImages = redoneState.uploadedImages;
      this.state.speechBubbles = redoneState.speechBubbles || [];
      this.state.drawings = redoneState.drawings || [];
      
      if (redoneState.canvasPadding) {
        this.state.canvasPadding = redoneState.canvasPadding;
        this.updateCanvasSize();
      }

      this.renderCanvas();
      this.renderTextLayersUI();
      this.updateUndoRedoButtons();
    }
  }

  updateUndoRedoButtons() {
    this.undoBtn.disabled = this.state.undoStack.length === 0;
    this.redoBtn.disabled = this.state.redoStack.length === 0;
  }

  downloadMeme(format = 'png') {
    if (this.isDownloading) return;
    this.isDownloading = true;

    try {
      const downloadCanvas = document.createElement('canvas');
      downloadCanvas.width = this.canvas.width;
      downloadCanvas.height = this.canvas.height;
      const downloadCtx = downloadCanvas.getContext('2d');

      // Copy current canvas content
      downloadCtx.drawImage(this.bufferCanvas, 0, 0);

      downloadCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meme-${Date.now()}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        this.isDownloading = false;
      }, format === 'jpg' ? 'image/jpeg' : 'image/png');

    } catch (error) {
      console.error('Error downloading meme:', error);
      this.isDownloading = false;
    }
  }

  resetCanvas() {
    if (confirm('Are you sure you want to reset the canvas?')) {
      this.saveState();
      this.state.textLayers = [];
      this.state.shapes = [];
      this.state.uploadedImages = [];
      this.state.speechBubbles = [];
      this.state.drawings = [];
      this.state.selectedTemplate = null;
      this.state.drawingMode = false;

      this.resetCanvasSize();

      this.drawingModeToggle.textContent = 'Enable Drawing Mode';
      this.drawingModeToggle.classList.remove('active');
      this.canvas.classList.remove('drawing-mode');

      this.renderTextLayersUI();
      this.renderImageLayersUI();
      this.renderShapeLayersUI();
      this.renderSpeechBubblesUI();
      this.renderCanvas();
      this.updateUndoRedoButtons();

      this.templatesContainer.querySelectorAll('.template-option').forEach(el => {
        el.classList.remove('selected');
      });
    }
  }

  connectedCallback() {
    this.preloadFonts();
  }

  preloadFonts() {
    const fontPreloader = document.createElement('div');
    fontPreloader.style.opacity = '0';
    fontPreloader.style.position = 'absolute';
    fontPreloader.style.left = '-9999px';

    this.state.fonts.forEach(font => {
      const span = document.createElement('span');
      span.style.fontFamily = font;
      span.textContent = 'Test';
      fontPreloader.appendChild(span);
    });

    document.body.appendChild(fontPreloader);
    setTimeout(() => {
      document.body.removeChild(fontPreloader);
    }, 1000);
  }
}

// Register the custom element
customElements.define('meme-generator', MemeGenerator);

// Export for Wix
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemeGenerator;
}

if (typeof window !== 'undefined' && window.customElements) {
  window.MemeGenerator = MemeGenerator;
}
