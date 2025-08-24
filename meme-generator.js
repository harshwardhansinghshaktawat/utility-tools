class MemeGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.memeData = [];
    this.selectedTemplate = null;
  }

  connectedCallback() {
    // Get CMS data from the attribute
    const memeDataAttr = this.getAttribute('meme-data');
    if (memeDataAttr) {
      try {
        this.memeData = JSON.parse(memeDataAttr);
      } catch (e) {
        console.error('Error parsing meme-data:', e);
      }
    }

    // Render the UI
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .meme-container {
          text-align: center;
        }
        select, input, button {
          margin: 10px;
          padding: 8px;
          font-size: 16px;
        }
        canvas {
          border: 1px solid #ccc;
          max-width: 100%;
        }
        button {
          background-color: #4CAF50;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
      </style>
      <div class="meme-container">
        <h2>Meme Generator</h2>
        <select id="templateSelect">
          <option value="">Select a Meme Template</option>
          ${this.memeData.map(
            (item) => `<option value="${item.memeTemplate}">${item.title}</option>`
          ).join('')}
        </select>
        <br>
        <input type="text" id="topText" placeholder="Top Text" maxlength="50">
        <input type="text" id="bottomText" placeholder="Bottom Text" maxlength="50">
        <br>
        <canvas id="memeCanvas" width="500" height="500"></canvas>
        <br>
        <button id="generateBtn">Generate Meme</button>
        <button id="downloadBtn" style="display: none;">Download Meme</button>
      </div>
    `;

    // Add event listeners
    this.shadowRoot.querySelector('#templateSelect').addEventListener('change', (e) => {
      this.selectedTemplate = e.target.value;
      this.drawMeme();
    });

    this.shadowRoot.querySelector('#topText').addEventListener('input', () => this.drawMeme());
    this.shadowRoot.querySelector('#bottomText').addEventListener('input', () => this.drawMeme());
    this.shadowRoot.querySelector('#generateBtn').addEventListener('click', () => this.drawMeme());
    this.shadowRoot.querySelector('#downloadBtn').addEventListener('click', () => this.downloadMeme());
  }

  async drawMeme() {
    if (!this.selectedTemplate) return;

    const canvas = this.shadowRoot.querySelector('#memeCanvas');
    const ctx = canvas.getContext('2d');
    const topText = this.shadowRoot.querySelector('#topText').value.toUpperCase();
    const bottomText = this.shadowRoot.querySelector('#bottomText').value.toUpperCase();

    // Load the image
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS if images are from external sources
    img.src = this.selectedTemplate;

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Text styling
      ctx.font = 'bold 40px Impact';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';

      // Draw top text
      ctx.strokeText(topText, canvas.width / 2, 50);
      ctx.fillText(topText, canvas.width / 2, 50);

      // Draw bottom text
      ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
      ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);

      // Show download button
      this.shadowRoot.querySelector('#downloadBtn').style.display = 'inline-block';
    };
  }

  downloadMeme() {
    const canvas = this.shadowRoot.querySelector('#memeCanvas');
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// Define the custom element
customElements.define('meme-generator', MemeGenerator);
