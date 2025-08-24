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
        }
      ]
    };

    this.isDownloading = false;
    this.initializeUI();
    this.setupEventListeners();
  }

  // Watch for CMS template attributes
  static get observedAttributes() {
    return ['cms-template-url', 'cms-template-name', 'cms-template-layout'];
  }

  // Handle CMS template data
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

  // Set CMS template
  setCMSTemplate(imageUrl, templateName = 'CMS Template', layout = '2-vertical') {
    if (!imageUrl) return;

    // Remove existing CMS template
    this.state.templates = this.state.templates.filter(t => t.id !== 'cms-template');

    // Add CMS template
    const cmsTemplate = {
      id: 'cms-template',
      name: templateName,
      url: imageUrl,
      layout: layout
    };

    this.state.templates.unshift(cmsTemplate);
    this.loadTemplates();
    this.selectTemplate('cms-template');
  }

  // Initialize UI
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

        .templates-row {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding: 10px;
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          margin-bottom: 10px;
          width: 100%;
          scrollbar-width: thin;
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

        .template-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          margin-right: 8px;
          border-radius: var(--border-radius);
          border: 1px solid #eee;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 120px;
          height: 120px;
        }

        .template-option:hover {
          background-color: #f5f5f5;
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
          width: 80px;
          height: 80px;
          object-fit: cover;
          margin-bottom: 8px;
          border-radius: 4px;
        }

        .template-option .template-name {
          font-size: 12px;
          text-align: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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

        .text-layer-item {
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: var(--border-radius);
          margin-bottom: 10px;
          border: 1px solid #eee;
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

        .export-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 10px;
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

        @media (max-width: 768px) {
          .editor-container {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="meme-generator-container">
        <!-- Templates row -->
        <div class="templates-row" id="templates-container"></div>

        <div class="editor-container">
          <!-- Left sidebar -->
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
            </div>

            <div class="control-group">
              <h3>Shapes</h3>
              <button id="add-square-btn">Add Square</button>
              <button id="add-circle-btn">Add Circle</button>
            </div>
          </div>

          <!-- Canvas area -->
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

          <!-- Right sidebar -->
          <div class="sidebar speech-bubbles-sidebar">
            <div class="control-group">
              <h3>Speech Bubbles</h3>
              <div id="speech-bubbles-container">
                ${this.state.speechBubbleTypes.map(bubble => `
                  <button onclick="this.getRootNode().host.addSpeechBubble('${bubble.id}')">${bubble.name}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
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

    // Event listeners
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

    // Export buttons
    this.shadowRoot.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.target.getAttribute('data-format');
        this.downloadMeme(format);
      });
    });

    this.loadTemplates();
    this.renderCanvas();
  }

  // Load templates
  loadTemplates() {
    this.templatesContainer.innerHTML = '';

    this.state.templates.forEach(template => {
      const templateElement = document.createElement('div');
      templateElement.className = 'template-option';
      
      if (template.id === 'cms-template') {
        templateElement.classList.add('cms-template');
      }
      
      templateElement.dataset.id = template.id;

      if (this.state.selectedTemplate === template.id) {
        templateElement.classList.add('selected');
      }

      templateElement.innerHTML = `
        <img src="${template.url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23ddd"/></svg>'}" alt="${template.name}">
        <span class="template-name">${template.name}</span>
      `;

      templateElement.addEventListener('click', () => {
        this.selectTemplate(template.id);
      });

      this.templatesContainer.appendChild(templateElement);
    });
  }

  // Select template
  selectTemplate(templateId) {
    this.state.selectedTemplate = templateId;

    if (templateId !== 'custom') {
      this.saveState();
      this.state.textLayers = [];

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

  // Add text layer
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

  // Add shape
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
    this.renderCanvas();
    this.updateUndoRedoButtons();
  }

  // Add speech bubble
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
        this.renderCanvas();
        this.updateUndoRedoButtons();
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }

  // Render text layers UI
  renderTextLayersUI() {
    this.textLayersContainer.innerHTML = '';

    this.state.textLayers.forEach((layer, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'text-layer-item';
      layerElement.innerHTML = `
        <div class="layer-item-header">
          <h4>Text Layer ${index + 1}</h4>
          <div class="layer-actions">
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

        <label>Text Color:</label>
        <input type="color" class="text-color-input" data-id="${layer.id}" value="${layer.color}">

        <label>Outline Color:</label>
        <input type="color" class="stroke-color-input" data-id="${layer.id}" value="${layer.strokeColor}">

        <label>Outline Width:</label>
        <input type="range" class="stroke-width-input" data-id="${layer.id}" min="0" max="10" value="${layer.strokeWidth}">
        <span class="stroke-width-value">${layer.strokeWidth}px</span>
      `;

      this.textLayersContainer.appendChild(layerElement);
    });

    // Add event listeners
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
  }

  // Render canvas
  renderCanvas() {
    this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    if (this.state.selectedTemplate && this.state.selectedTemplate !== 'custom') {
      const template = this.state.templates.find(t => t.id === this.state.selectedTemplate);
      if (template && template.url) {
        if (this.state.imageCache[template.url]) {
          this.bufferCtx.drawImage(this.state.imageCache[template.url], 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        }
      }
    } else {
      this.bufferCtx.fillStyle = '#FFFFFF';
      this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    }

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
          image.x,
          image.y,
          image.width,
          image.height
        );
      }
    });

    // Draw speech bubbles
    this.state.speechBubbles.forEach(bubble => {
      if (this.state.imageCache[bubble.src]) {
        this.bufferCtx.drawImage(
          this.state.imageCache[bubble.src],
          bubble.x,
          bubble.y,
          bubble.width,
          bubble.height
        );
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

    // Copy to main canvas
    this.ctx.drawImage(this.bufferCanvas, 0, 0);
  }

  // Canvas mouse events
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
        this.renderCanvas();
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

  // Undo
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
      this.updateUndoRedoButtons();
    }
  }

  // Redo
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
      this.updateUndoRedoButtons();
    }
  }

  // Update undo/redo buttons
  updateUndoRedoButtons() {
    this.undoBtn.disabled = this.state.undoStack.length === 0;
    this.redoBtn.disabled = this.state.redoStack.length === 0;
  }

  // Download meme
  downloadMeme(format = 'png') {
    if (this.isDownloading) return;
    this.isDownloading = true;

    try {
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const extension = format === 'jpg' ? 'jpg' : 'png';
      const dataURL = this.canvas.toDataURL(mimeType, format === 'jpg' ? 0.9 : 1.0);

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `meme-${Date.now()}.${extension}`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.isDownloading = false;
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download meme. Please try again.');
      this.isDownloading = false;
    }
  }

  // Reset canvas
  resetCanvas() {
    if (confirm('Reset the canvas? This will clear all your work.')) {
      this.saveState();
      this.state.textLayers = [];
      this.state.shapes = [];
      this.state.uploadedImages = [];
      this.state.speechBubbles = [];
      this.state.selectedTemplate = null;

      this.renderTextLayersUI();
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
  }
}

// Register custom element
customElements.define('meme-generator', MemeGenerator);
