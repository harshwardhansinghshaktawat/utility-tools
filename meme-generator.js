class MemeGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // State management
    this.state = {
      selectedTemplate: 'cms-template', // Use a single CMS-based template
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
      imageCache: {}, // Cache for loaded images
      fonts: [
        'Impact', 'Arial', 'Comic Sans MS', 'Helvetica', 'Times New Roman',
        'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond'
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
        },
        {
          id: 'bubble9',
          name: 'Speech Bubble 9',
          url: 'https://static.wixstatic.com/shapes/8874a0_67a98c428cbd44c1a07b38bedf20e403.svg'
        },
        {
          id: 'bubble10',
          name: 'Speech Bubble 10',
          url: 'https://static.wixstatic.com/shapes/8874a0_0b59203739e6485ca65bfdd06b6c4c61.svg'
        },
        {
          id: 'bubble11',
          name: 'Speech Bubble 11',
          url: 'https://static.wixstatic.com/shapes/8874a0_ce61b19b3a9448f4be19ab89b234d9eb.svg'
        },
        {
          id: 'bubble12',
          name: 'Speech Bubble 12',
          url: 'https://static.wixstatic.com/shapes/8874a0_700005366c824935acbbe2112062d112.svg'
        },
        {
          id: 'bubble13',
          name: 'Speech Bubble 13',
          url: 'https://static.wixstatic.com/shapes/8874a0_9571d8aded6f453292827dab0f5805dc.svg'
        },
        {
          id: 'bubble14',
          name: 'Speech Bubble 14',
          url: 'https://static.wixstatic.com/shapes/8874a0_400dd1a152034d309617f1a3d829131d.svg'
        }
      ]
    };

    // CMS image URL
    this.cmsImageUrl = '';

    // Flag to prevent multiple simultaneous downloads
    this.isDownloading = false;

    // Initialize the UI
    this.initializeUI();
    this.setupEventListeners();
  }

  // Observe attributes for changes
  static get observedAttributes() {
    return ['image-src'];
  }

  // Handle attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'image-src' && oldValue !== newValue) {
      this.cmsImageUrl = newValue;
      this.selectTemplate('cms-template');
    }
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
          --border-radius: 4px;
          --shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .meme-generator-container {
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .editor-container {
          display: grid;
          grid-template-columns: minmax(250px, 1fr) minmax(300px, 2fr) minmax(200px, 1fr);
          gap: 20px;
          width: 100%;
        }

        .sidebar {
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 15px;
          max-height: 700px;
          overflow-y: auto;
          width: 100%;
        }

        .canvas-container {
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 20px;
          text-align: center;
          position: relative;
        }

        #meme-canvas {
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          max-width: 100%;
          height: auto;
          margin-bottom: 15px;
        }

        #buffer-canvas {
          display: none;
        }

        .control-group {
          margin-bottom: 20px;
        }

        .control-group h3 {
          margin-top: 0;
          margin-bottom: 10px;
          color: var(--dark-color);
          font-size: 16px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }

        .speech-bubbles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 15px;
          width: 100%;
        }

        .speech-bubble-option {
          width: 100%;
          aspect-ratio: 1/1;
          margin: 0;
          border: 1px solid #ddd;
          border-radius: var(--border-radius);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }

        .speech-bubble-option:hover {
          border-color: var(--primary-color);
          transform: scale(1.05);
        }

        .speech-bubble-option img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 5px;
        }

        button {
          padding: 8px 14px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
          margin-right: 5px;
          margin-bottom: 5px;
        }

        button:hover {
          background-color: #3a76d8;
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

        button.secondary {
          background-color: var(--secondary-color);
        }

        button.secondary:hover {
          background-color: #e67e22;
        }

        button.neutral {
          background-color: #95a5a6;
        }

        button.neutral:hover {
          background-color: #7f8c8d;
        }

        button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          color: var(--dark-color);
        }

        input, select {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: var(--border-radius);
          font-size: 14px;
        }

        input[type="color"] {
          height: 40px;
          padding: 2px;
        }

        .canvas-controls {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }

        .text-layer-item, .image-layer-item, .shape-layer-item, .speech-bubble-layer-item {
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: var(--border-radius);
          margin-bottom: 10px;
          border: 1px solid #eee;
          position: relative;
        }

        .layer-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .layer-item-header h4 {
          margin: 0;
          font-size: 14px;
        }

        .layer-actions {
          display: flex;
          gap: 5px;
        }

        .layer-actions button {
          padding: 3px 6px;
          font-size: 12px;
        }

        .history-controls {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .draggable {
          cursor: move;
        }

        .color-preview {
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          margin-right: 5px;
          border: 1px solid #ddd;
        }

        .export-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 10px;
        }

        .tooltip {
          position: relative;
          display: inline-block;
        }

        .tooltip .tooltiptext {
          visibility: hidden;
          width: 120px;
          background-color: black;
          color: white;
          text-align: center;
          border-radius: 6px;
          padding: 5px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          margin-left: -60px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 12px;
        }

        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }

        .custom-file-upload {
          border: 1px solid #ddd;
          display: inline-block;
          padding: 6px 12px;
          cursor: pointer;
          background-color: #f9f9f9;
          border-radius: var(--border-radius);
          width: 100%;
          text-align: center;
          margin-bottom: 10px;
        }

        #file-upload {
          display: none;
        }

        @media (max-width: 1200px) {
          .editor-container {
            grid-template-columns: minmax(220px, 1fr) minmax(300px, 2fr) minmax(180px, 1fr);
          }
        }

        @media (max-width: 992px) {
          .editor-container {
            grid-template-columns: minmax(200px, 1fr) minmax(300px, 2fr);
          }

          .speech-bubbles-sidebar {
            grid-column: 1 / -1;
            grid-row: 2;
          }

          .speech-bubbles-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @media (max-width: 768px) {
          .editor-container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            max-height: none;
          }

          .speech-bubbles-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 480px) {
          .speech-bubbles-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .meme-generator-container {
            padding: 10px;
          }
        }
      </style>

      <div class="meme-generator-container">
        <div class="editor-container">
          <div class="sidebar left-sidebar">
            <div class="control-group">
              <h3>Text Layers</h3>
              <button id="add-text-btn">Add Text</button>
              <div id="text-layers-container"></div>
            </div>

            <div class="control-group">
              <h3>Images</h3>
              <label class="custom-file-upload">
                <input type="file" id="file-upload" accept="image/*">
                Upload Image
              </label>
              <div id="image-layers-container"></div>
            </div>

            <div class="control-group">
              <h3>Shapes</h3>
              <button id="add-square-btn">Add Square</button>
              <button id="add-circle-btn">Add Circle</button>
              <div id="shape-layers-container"></div>
            </div>
          </div>

          <div class="canvas-container">
            <div class="history-controls">
              <button id="undo-btn" title="Undo" disabled>Undo</button>
              <button id="redo-btn" title="Redo" disabled>Redo</button>
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

          <div class="sidebar speech-bubbles-sidebar">
            <div class="control-group">
              <h3>Speech Bubbles</h3>
              <div class="speech-bubbles-grid" id="speech-bubbles-grid"></div>
            </div>
            <div id="speech-bubble-layers-container"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Set up event listeners for all interactive elements
  setupEventListeners() {
    this.canvas = this.shadowRoot.getElementById('meme-canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.bufferCanvas = this.shadowRoot.getElementById('buffer-canvas');
    this.bufferCtx = this.bufferCanvas.getContext('2d', { willReadFrequently: true });

    this.bufferCanvas.width = this.canvas.width;
    this.bufferCanvas.height = this.canvas.height;

    this.undoBtn = this.shadowRoot.getElementById('undo-btn');
    this.redoBtn = this.shadowRoot.getElementById('redo-btn');
    this.textLayersContainer = this.shadowRoot.getElementById('text-layers-container');
    this.imageLayersContainer = this.shadowRoot.getElementById('image-layers-container');
    this.shapeLayersContainer = this.shadowRoot.getElementById('shape-layers-container');
    this.speechBubblesGrid = this.shadowRoot.getElementById('speech-bubbles-grid');
    this.speechBubbleLayersContainer = this.shadowRoot.getElementById('speech-bubble-layers-container');

    this.shadowRoot.getElementById('add-text-btn').addEventListener('click', () => this.addTextLayer());
    this.shadowRoot.getElementById('add-square-btn').addEventListener('click', () => this.addShape('square'));
    this.shadowRoot.getElementById('add-circle-btn').addEventListener('click', () => this.addShape('circle'));
    this.shadowRoot.getElementById('reset-btn').addEventListener('click', () => this.resetCanvas());
    this.shadowRoot.getElementById('file-upload').addEventListener('change', (e) => this.handleImageUpload(e));
    this.undoBtn.addEventListener('click', () => this.undo());
    this.redoBtn.addEventListener('click', () => this.redo());

    this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleCanvasMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseUp());

    this.shadowRoot.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.target.getAttribute('data-format');
        this.downloadMeme(format);
      });
    });

    this.loadSpeechBubbles();
    this.renderCanvas();
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

  // Render all speech bubble UI controls
  renderSpeechBubblesUI() {
    this.speechBubbleLayersContainer.innerHTML = '';

    this.state.speechBubbles.forEach((bubble, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'speech-bubble-layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>Speech Bubble ${index + 1}</h4>
          <div class="layer-actions">
            <button class="bubble-up-btn" data-id="${bubble.id}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="bubble-down-btn" data-id="${bubble.id}" ${index === this.state.speechBubbles.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="bubble-delete-btn danger" data-id="${bubble.id}">×</button>
          </div>
        </div>

        <label>Width:</label>
        <input type="range" class="bubble-width-input" data-id="${bubble.id}" min="50" max="400" value="${bubble.width}">
        <span class="bubble-width-value">${Math.round(bubble.width)}px</span>

        <label>Height:</label>
        <input type="range" class="bubble-height-input" data-id="${bubble.id}" min="50" max="400" value="${bubble.height}">
        <span class="bubble-height-value">${Math.round(bubble.height)}px</span>
      `;

      this.speechBubbleLayersContainer.appendChild(layerElement);
    });

    this.speechBubbleLayersContainer.querySelectorAll('.bubble-width-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const bubble = this.state.speechBubbles.find(b => b.id === id);
        if (bubble) {
          bubble.width = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = `${Math.round(bubble.width)}px`;
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
          e.target.nextElementSibling.textContent = `${Math.round(bubble.height)}px`;
          this.renderCanvas();
        }
      });
    });

    this.speechBubbleLayersContainer.querySelectorAll('.bubble-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.saveState();
        this.state.speechBubbles = this.state.speechBubbles.filter(b => b.id !== id);
        this.renderSpeechBubblesUI();
        this.renderCanvas();
        this.updateUndoRedoButtons();
      });
    });

    this.speechBubbleLayersContainer.querySelectorAll('.bubble-up-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const index = this.state.speechBubbles.findIndex(b => b.id === id);
        if (index > 0) {
          this.saveState();
          [this.state.speechBubbles[index], this.state.speechBubbles[index - 1]] =
            [this.state.speechBubbles[index - 1], this.state.speechBubbles[index]];
          this.renderSpeechBubblesUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        }
      });
    });

    this.speechBubbleLayersContainer.querySelectorAll('.bubble-down-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const index = this.state.speechBubbles.findIndex(b => b.id === id);
        if (index < this.state.speechBubbles.length - 1) {
          this.saveState();
          [this.state.speechBubbles[index], this.state.speechBubbles[index + 1]] =
            [this.state.speechBubbles[index + 1], this.state.speechBubbles[index]];
          this.renderSpeechBubblesUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        }
      });
    });
  }

  // Select the CMS template
  selectTemplate(templateId) {
    this.state.selectedTemplate = templateId;

    this.state.textLayers = [];
    this.state.shapes = [];

    if (this.cmsImageUrl) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        this.state.imageCache[this.cmsImageUrl] = img;
        this.addTextLayer('TOP TEXT', 300, 120);
        this.addTextLayer('BOTTOM TEXT', 300, 480);
        this.renderCanvas();
      };
      img.onerror = () => {
        console.error(`Failed to load CMS image: ${this.cmsImageUrl}`);
        alert('Failed to load CMS meme template image. Please try again or check the CMS configuration.');
        this.renderCanvas();
      };
      img.src = this.cmsImageUrl;
    }

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

  // Render all text layer UI controls
  renderTextLayersUI() {
    this.textLayersContainer.innerHTML = '';

    this.state.textLayers.forEach((layer, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'text-layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>Text Layer ${index + 1}</h4>
          <div class="layer-actions">
            <button class="text-up-btn" data-id="${layer.id}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="text-down-btn" data-id="${layer.id}" ${index === this.state.textLayers.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="text-delete-btn danger" data-id="${layer.id}">×</button>
          </div>
        </div>

        <input type="text" class="text-input" data-id="${layer.id}" value="${layer.text}" placeholder="Enter text">

        <label>Font:</label>
        <select class="font-family-select" data-id="${layer.id}">
          ${this.state.fonts.map(font => `
            <option value="${font}" ${font === layer.fontFamily ? 'selected' : ''}>${font}</option>
          `).join('')}
        </select>

        <label>Font Size:</label>
        <input type="range" class="font-size-input" data-id="${layer.id}" min="10" max="100" value="${layer.fontSize}">
        <span class="font-size-value">${layer.fontSize}px</span>

        <label>
          <span class="color-preview" style="background-color: ${layer.color}"></span>
          Text Color:
        </label>
        <input type="color" class="text-color-input" data-id="${layer.id}" value="${layer.color}">

        <label>
          <span class="color-preview" style="background-color: ${layer.strokeColor}"></span>
          Outline Color:
        </label>
        <input type="color" class="stroke-color-input" data-id="${layer.id}" value="${layer.strokeColor}">

        <label>Outline Width:</label>
        <input type="range" class="stroke-width-input" data-id="${layer.id}" min="0" max="10" value="${layer.strokeWidth}">
        <span class="stroke-width-value">${layer.strokeWidth}px</span>

        <label>Alignment:</label>
        <select class="text-align-select" data-id="${layer.id}">
          <option value="left" ${layer.align === 'left' ? 'selected' : ''}>Left</option>
          <option value="center" ${layer.align === 'center' ? 'selected' : ''}>Center</option>
          <option value="right" ${layer.align === 'right' ? 'selected' : ''}>Right</option>
        </select>
      `;

      this.textLayersContainer.appendChild(layerElement);
    });

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
          e.target.nextElementSibling.textContent = `${layer.fontSize}px`;
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

    this.textLayersContainer.querySelectorAll('.stroke-width-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const layer = this.state.textLayers.find(l => l.id === id);
        if (layer) {
          layer.strokeWidth = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = `${layer.strokeWidth}px`;
          this.renderCanvas();
        }
      });
    });

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

    this.textLayersContainer.querySelectorAll('.text-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.saveState();
        this.state.textLayers = this.state.textLayers.filter(l => l.id !== id);
        this.renderTextLayersUI();
        this.renderCanvas();
        this.updateUndoRedoButtons();
      });
    });

    this.textLayersContainer.querySelectorAll('.text-up-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const index = this.state.textLayers.findIndex(l => l.id === id);
        if (index > 0) {
          this.saveState();
          [this.state.textLayers[index], this.state.textLayers[index - 1]] =
            [this.state.textLayers[index - 1], this.state.textLayers[index]];
          this.renderTextLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        }
      });
    });

    this.textLayersContainer.querySelectorAll('.text-down-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const index = this.state.textLayers.findIndex(l => l.id === id);
        if (index < this.state.textLayers.length - 1) {
          this.saveState();
          [this.state.textLayers[index], this.state.textLayers[index + 1]] =
            [this.state.textLayers[index + 1], this.state.textLayers[index]];
          this.renderTextLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        }
      });
    });
  }

  // Render all image layer UI controls
  renderImageLayersUI() {
    this.imageLayersContainer.innerHTML = '';

    this.state.uploadedImages.forEach((image, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'image-layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>Image ${index + 1}</h4>
          <div class="layer-actions">
            <button class="image-up-btn" data-id="${image.id}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="image-down-btn" data-id="${image.id}" ${index === this.state.uploadedImages.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="image-delete-btn danger" data-id="${image.id}">×</button>
          </div>
        </div>

        <label>Width:</label>
        <input type="range" class="image-width-input" data-id="${image.id}" min="10" max="600" value="${image.width}">
        <span class="image-width-value">${Math.round(image.width)}px</span>

        <label>Height:</label>
        <input type="range" class="image-height-input" data-id="${image.id}" min="10" max="600" value="${image.height}">
        <span class="image-height-value">${Math.round(image.height)}px</span>
      `;

      this.imageLayersContainer.appendChild(layerElement);
    });

    this.imageLayersContainer.querySelectorAll('.image-width-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const image = this.state.uploadedImages.find(img => img.id === id);
        if (image) {
          image.width = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = `${Math.round(image.width)}px`;
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
          e.target.nextElementSibling.textContent = `${Math.round(image.height)}px`;
          this.renderCanvas();
        }
      });
    });

    this.imageLayersContainer.querySelectorAll('.image-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.saveState();
        this.state.uploadedImages = this.state.uploadedImages.filter(img => img.id !== id);
        this.renderImageLayersUI();
        this.renderCanvas();
        this.updateUndoRedoButtons();
      });
    });

    this.imageLayersContainer.querySelectorAll('.image-up-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const index = this.state.uploadedImages.findIndex(img => img.id === id);
        if (index > 0) {
          this.saveState();
          [this.state.uploadedImages[index], this.state.uploadedImages[index - 1]] =
            [this.state.uploadedImages[index - 1], this.state.uploadedImages[index]];
          this.renderImageLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        }
      });
    });

    this.imageLayersContainer.querySelectorAll('.image-down-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const index = this.state.uploadedImages.findIndex(img => img.id === id);
        if (index < this.state.uploadedImages.length - 1) {
          this.saveState();
          [this.state.uploadedImages[index], this.state.uploadedImages[index + 1]] =
            [this.state.uploadedImages[index + 1], this.state.uploadedImages[index]];
          this.renderImageLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        }
      });
    });
  }

  // Render all shape layer UI controls
  renderShapeLayersUI() {
    this.shapeLayersContainer.innerHTML = '';

    this.state.shapes.forEach((shape, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'shape-layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>${shape.shapeType === 'square' ? 'Square' : 'Circle'} ${index + 1}</h4>
          <div class="layer-actions">
            <button class="shape-up-btn" data-id="${shape.id}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="shape-down-btn" data-id="${shape.id}" ${index === this.state.shapes.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="shape-delete-btn danger" data-id="${shape.id}">×</button>
          </div>
        </div>

        <label>
          <span class="color-preview" style="background-color: ${shape.color}"></span>
          Color:
        </label>
        <input type="color" class="shape-color-input" data-id="${shape.id}" value="${shape.color}">

        <label>Opacity:</label>
        <input type="range" class="shape-opacity-input" data-id="${shape.id}" min="0" max="1" step="0.1" value="${shape.opacity}">
        <span class="shape-opacity-value">${shape.opacity * 100}%</span>

        <label>${shape.shapeType === 'square' ? 'Width' : 'Size'}:</label>
        <input type="range" class="shape-width-input" data-id="${shape.id}" min="10" max="400" value="${shape.width}">
        <span class="shape-width-value">${Math.round(shape.width)}px</span>

        ${shape.shapeType === 'square' ? `
          <label>Height:</label>
          <input type="range" class="shape-height-input" data-id="${shape.id}" min="10" max="400" value="${shape.height}">
          <span class="shape-height-value">${Math.round(shape.height)}px</span>
        ` : ''}
      `;

      this.shapeLayersContainer.appendChild(layerElement);
    });

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
          e.target.nextElementSibling.textContent = `${Math.round(shape.opacity * 100)}%`;
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
          e.target.nextElementSibling.textContent = `${Math.round(shape.width)}px`;
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
          e.target.nextElementSibling.textContent = `${Math.round(shape.height)}px`;
          this.renderCanvas();
        }
      });
    });

    this.shapeLayersContainer.querySelectorAll('.shape-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.saveState();
        this.state.shapes = this.state.shapes.filter(s => s.id !== id);
        this.renderShapeLayersUI();
        this.renderCanvas();
        this.updateUndoRedoButtons();
      });
    });

    this.shapeLayersContainer.querySelectorAll('.shape-up-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const index = this.state.shapes.findIndex(s => s.id === id);
        if (index > 0) {
          this.saveState();
          [this.state.shapes[index], this.state.shapes[index - 1]] =
            [this.state.shapes[index - 1], this.state.shapes[index]];
          this.renderShapeLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        }
      });
    });

    this.shapeLayersContainer.querySelectorAll('.shape-down-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const index = this.state.shapes.findIndex(s => s.id === id);
        if (index < this.state.shapes.length - 1) {
          this.saveState();
          [this.state.shapes[index], this.state.shapes[index + 1]] =
            [this.state.shapes[index + 1], this.state.shapes[index]];
          this.renderShapeLayersUI();
          this.renderCanvas();
          this.updateUndoRedoButtons();
        }
      });
    });
  }

  // Render the canvas with all elements
  renderCanvas() {
    this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state.selectedTemplate === 'cms-template' && this.cmsImageUrl) {
      if (this.state.imageCache[this.cmsImageUrl]) {
        this.bufferCtx.drawImage(this.state.imageCache[this.cmsImageUrl], 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        this.drawCanvasLayers();
        this.ctx.drawImage(this.bufferCanvas, 0, 0);
      } else {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          this.state.imageCache[this.cmsImageUrl] = img;
          this.bufferCtx.drawImage(img, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
          this.drawCanvasLayers();
          this.ctx.drawImage(this.bufferCanvas, 0, 0);
        };
        img.onerror = () => {
          console.error('Failed to load CMS image');
          this.bufferCtx.fillStyle = '#FFFFFF';
          this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
          this.drawCanvasLayers();
          this.ctx.drawImage(this.bufferCanvas, 0, 0);
        };
        img.src = this.cmsImageUrl;
        return;
      }
    } else {
      this.bufferCtx.fillStyle = '#FFFFFF';
      this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
      this.drawCanvasLayers();
      this.ctx.drawImage(this.bufferCanvas, 0, 0);
    }
  }

  // Draw all layers on canvas
  drawCanvasLayers() {
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
        this.bufferCtx.arc(
          shape.x,
          shape.y,
          shape.width / 2,
          0,
          Math.PI * 2
        );
        this.bufferCtx.fill();
      }
    });

    this.bufferCtx.globalAlpha = 1;

    let pendingImages = 0;

    this.state.uploadedImages.forEach(image => {
      if (this.state.imageCache[image.src]) {
        this.bufferCtx.drawImage(
          this.state.imageCache[image.src],
          image.x,
          image.y,
          image.width,
          image.height
        );
      } else {
        pendingImages++;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          this.state.imageCache[image.src] = img;
          this.bufferCtx.drawImage(
            img,
            image.x,
            image.y,
            image.width,
            image.height
          );

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
          bubble.x,
          bubble.y,
          bubble.width,
          bubble.height
        );
      } else {
        pendingBubbles++;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          this.state.imageCache[bubble.src] = img;
          this.bufferCtx.drawImage(
            img,
            bubble.x,
            bubble.y,
            bubble.width,
            bubble.height
          );

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

  // Handle canvas mouse down event for dragging elements
  handleCanvasMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

        if (
          x >= textX - 10 &&
          x <= textX + textWidth + 10 &&
          y >= layer.y - (textHeight / 2) - 10 &&
          y <= layer.y + (textHeight / 2) + 10
        ) {
          this.state.isDragging = true;
          this.state.selectedElement = { type: 'text', index: i };
          this.state.dragOffsetX = x - layer.x;
          this.state.dragOffsetY = y - layer.y;
          return;
        }
      }
    }

    for (let i = this.state.speechBubbles.length - 1; i >= 0; i--) {
      const bubble = this.state.speechBubbles[i];

      if (bubble.draggable) {
        if (
          x >= bubble.x &&
          x <= bubble.x + bubble.width &&
          y >= bubble.y &&
          y <= bubble.y + bubble.height
        ) {
          this.state.isDragging = true;
          this.state.selectedElement = { type: 'speechBubble', index: i };
          this.state.dragOffsetX = x - bubble.x;
          this.state.dragOffsetY = y - bubble.y;
          return;
        }
      }
    }

    for (let i = this.state.uploadedImages.length - 1; i >= 0; i--) {
      const image = this.state.uploadedImages[i];

      if (image.draggable) {
        if (
          x >= image.x &&
          x <= image.x + image.width &&
          y >= image.y &&
          y <= image.y + image.height
        ) {
          this.state.isDragging = true;
          this.state.selectedElement = { type: 'image', index: i };
          this.state.dragOffsetX = x - image.x;
          this.state.dragOffsetY = y - image.y;
          return;
        }
      }
    }

    for (let i = this.state.shapes.length - 1; i >= 0; i--) {
      const shape = this.state.shapes[i];

      if (shape.draggable) {
        if (shape.shapeType === 'square') {
          if (
            x >= shape.x - (shape.width / 2) &&
            x <= shape.x + (shape.width / 2) &&
            y >= shape.y - (shape.height / 2) &&
            y <= shape.y + (shape.height / 2)
          ) {
            this.state.isDragging = true;
            this.state.selectedElement = { type: 'shape', index: i };
            this.state.dragOffsetX = x - shape.x;
            this.state.dragOffsetY = y - shape.y;
            return;
          }
        } else if (shape.shapeType === 'circle') {
          const distance = Math.sqrt(
            Math.pow(x - shape.x, 2) +
            Math.pow(y - shape.y, 2)
          );

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

  // Handle canvas mouse move event for dragging elements
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

  // Handle canvas mouse up event for dragging elements
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

  // Download the meme as an image
  downloadMeme(format = 'png') {
    if (this.isDownloading) return;
    this.isDownloading = true;

    try {
      if (this.isCanvasTainted()) {
        alert('Cannot download due to cross-origin images. Try using a different template or upload a custom image.');
        this.isDownloading = false;
        return;
      }

      const loadAllImages = () => {
        return new Promise((resolve, reject) => {
          let pendingImages = 0;

          if (this.cmsImageUrl && !this.state.imageCache[this.cmsImageUrl]) {
            pendingImages++;
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
              this.state.imageCache[this.cmsImageUrl] = img;
              pendingImages--;
              if (pendingImages === 0) resolve();
            };
            img.onerror = () => {
              console.error(`Failed to load CMS image: ${this.cmsImageUrl}`);
              pendingImages--;
              if (pendingImages === 0) resolve();
            };
            img.src = this.cmsImageUrl;
          }

          this.state.uploadedImages.forEach(image => {
            if (!this.state.imageCache[image.src]) {
              pendingImages++;
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              img.onload = () => {
                this.state.imageCache[image.src] = img;
                pendingImages--;
                if (pendingImages === 0) resolve();
              };
              img.onerror = () => {
                console.error(`Failed to load uploaded image: ${image.src}`);
                pendingImages--;
                if (pendingImages === 0) resolve();
              };
              img.src = image.src;
            }
          });

          this.state.speechBubbles.forEach(bubble => {
            if (!this.state.imageCache[bubble.src]) {
              pendingImages++;
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              img.onload = () => {
                this.state.imageCache[bubble.src] = img;
                pendingImages--;
                if (pendingImages === 0) resolve();
              };
              img.onerror = () => {
                console.error(`Failed to load speech bubble: ${bubble.src}`);
                pendingImages--;
                if (pendingImages === 0) resolve();
              };
              img.src = bubble.src;
            }
          });

          if (pendingImages === 0) resolve();
        });
      };

      loadAllImages()
        .then(() => {
          this.renderCanvas();
          this.ctx.drawImage(this.bufferCanvas, 0, 0);

          const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const extension = format === 'jpg' ? 'jpg' : 'png';

          let dataURL;
          try {
            dataURL = this.canvas.toDataURL(mimeType, format === 'jpg' ? 0.9 : 1.0);
          } catch (error) {
            console.error('Error generating data URL:', error);
            alert('Failed to generate meme image. This may be due to cross-origin images.');
            this.isDownloading = false;
            return;
          }

          const link = document.createElement('a');
          link.href = dataURL;
          link.download = `meme-${Date.now()}.${extension}`;
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.isDownloading = false;
        })
        .catch(error => {
          console.error('Error preparing meme for download:', error);
          alert('An error occurred while preparing the meme for download.');
          this.isDownloading = false;
        });
    } catch (error) {
      console.error('Error in downloadMeme:', error);
      alert('An unexpected error occurred while downloading the meme.');
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
      this.state.selectedTemplate = 'cms-template';

      this.renderTextLayersUI();
      this.renderShapeLayersUI();
      this.renderImageLayersUI();
      this.renderSpeechBubblesUI();
      this.renderCanvas();
      this.updateUndoRedoButtons();

      if (this.cmsImageUrl) {
        this.selectTemplate('cms-template');
      }
    }
  }

  // Detect when element is connected to DOM
  connectedCallback() {
    if (this.state.textLayers.length === 0) {
      this.addTextLayer();
    }

    this.preloadFonts();
  }

  // Preload fonts to avoid FOUT
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

customElements.define('meme-generator', MemeGenerator);
