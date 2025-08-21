/**
 * Wix Custom Element: Theme Color Generator
 * File name: theme-color-generator.js
 * Custom element tag: <theme-color-generator></theme-color-generator>
 */

class ThemeColorGenerator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentTheme = 'modern';
        this.generatedColors = {};
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.generateColors(); // Generate initial colors
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .generator-container {
                    width: 100%;
                    margin: 0;
                    padding: 30px 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    color: white;
                    min-height: 100vh;
                }

                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 10px;
                    background: linear-gradient(45deg, #fff, #f0f0f0);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .subtitle {
                    font-size: 1.1rem;
                    opacity: 0.9;
                    font-weight: 300;
                }

                .controls {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-bottom: 30px;
                    justify-content: center;
                    align-items: center;
                }

                .theme-selector {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .theme-btn {
                    padding: 12px 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-radius: 25px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 500;
                    backdrop-filter: blur(10px);
                }

                .theme-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    background: rgba(255,255,255,0.2);
                }

                .theme-btn.active {
                    background: rgba(255,255,255,0.3);
                    border-color: white;
                    transform: scale(1.05);
                }

                .generate-btn {
                    padding: 15px 30px;
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    border: none;
                    border-radius: 30px;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(238, 90, 36, 0.4);
                }

                .generate-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(238, 90, 36, 0.6);
                }

                .colors-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .color-card {
                    background: rgba(255,255,255,0.95);
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease;
                    color: #333;
                }

                .color-card:hover {
                    transform: translateY(-5px);
                }

                .color-preview {
                    width: 100%;
                    height: 80px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .color-preview::after {
                    content: 'Click to copy';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .color-preview:hover::after {
                    opacity: 1;
                }

                .color-info {
                    text-align: center;
                }

                .color-title {
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 3px;
                    color: #333;
                }

                .color-number {
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: #666;
                    margin-bottom: 3px;
                }

                .color-hex {
                    font-family: 'Courier New', monospace;
                    font-size: 0.9rem;
                    color: #666;
                    margin-bottom: 5px;
                }

                .color-usage {
                    font-size: 0.8rem;
                    color: #888;
                    line-height: 1.4;
                }

                .demo-section {
                    margin: 30px 0;
                }

                .demo-title {
                    font-size: 1.8rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                    text-align: center;
                    color: white;
                }

                .demo-website {
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.2);
                    margin: 0 auto;
                    max-width: 1000px;
                }

                .demo-header {
                    padding: 20px 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid;
                }

                .demo-logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .demo-nav {
                    display: flex;
                    gap: 25px;
                }

                .demo-nav-link {
                    text-decoration: none;
                    font-weight: 500;
                    transition: opacity 0.3s ease;
                }

                .demo-nav-link:hover {
                    opacity: 0.7;
                }

                .demo-hero {
                    padding: 60px 30px;
                    text-align: center;
                    background: linear-gradient(135deg, var(--color1) 0%, var(--color2) 100%);
                }

                .demo-hero h1 {
                    font-size: 3rem;
                    font-weight: 700;
                    margin-bottom: 20px;
                    line-height: 1.2;
                }

                .demo-hero p {
                    font-size: 1.2rem;
                    margin-bottom: 30px;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                    line-height: 1.6;
                }

                .demo-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .demo-btn {
                    padding: 12px 25px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .demo-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                .demo-btn.primary {
                    color: white;
                }

                .demo-btn.secondary {
                    background: transparent;
                    border: 2px solid;
                }

                .demo-btn.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .demo-content {
                    padding: 50px 30px;
                    background: white;
                }

                .demo-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 25px;
                    margin-bottom: 40px;
                }

                .demo-card {
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease;
                }

                .demo-card:hover {
                    transform: translateY(-5px);
                }

                .demo-card h3 {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 15px;
                }

                .demo-card p {
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                .demo-card .demo-link {
                    text-decoration: none;
                    font-weight: 600;
                    transition: opacity 0.3s ease;
                }

                .demo-card .demo-link:hover {
                    opacity: 0.7;
                }

                .demo-footer {
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid;
                }

                @media (max-width: 768px) {
                    .demo-header {
                        padding: 15px 20px;
                        flex-direction: column;
                        gap: 15px;
                    }
                    
                    .demo-nav {
                        gap: 15px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    
                    .demo-hero {
                        padding: 40px 20px;
                    }
                    
                    .demo-hero h1 {
                        font-size: 2rem;
                    }
                    
                    .demo-content {
                        padding: 30px 20px;
                    }
                    
                    .demo-cards {
                        grid-template-columns: 1fr;
                    }
                    
                    .demo-footer {
                        padding: 20px;
                    }
                }

                .accessibility-info {
                    background: rgba(255,255,255,0.95);
                    border-radius: 15px;
                    padding: 20px;
                    margin-top: 20px;
                    color: #333;
                }

                .accessibility-title {
                    font-weight: 600;
                    margin-bottom: 15px;
                    color: #2ecc71;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .contrast-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                }

                .contrast-item {
                    padding: 10px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .contrast-pass {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .contrast-fail {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .copy-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2ecc71;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    transform: translateX(300px);
                    transition: transform 0.3s ease;
                    z-index: 1000;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                .copy-notification.show {
                    transform: translateX(0);
                }

                @media (max-width: 768px) {
                    .generator-container {
                        padding: 15px 10px;
                    }
                    
                    .title {
                        font-size: 2rem;
                    }
                    
                    .controls {
                        flex-direction: column;
                    }
                    
                    .colors-grid {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }
                    
                    .theme-selector {
                        justify-content: center;
                    }
                }
            </style>

            <div class="generator-container">
                <div class="header">
                    <h1 class="title">🎨 Theme Color Generator</h1>
                    <p class="subtitle">Generate gorgeous, accessible website themes with perfect color harmony</p>
                </div>

                <div class="controls">
                    <div class="theme-selector">
                        <button class="theme-btn active" data-theme="modern">Modern</button>
                        <button class="theme-btn" data-theme="dark">Dark</button>
                        <button class="theme-btn" data-theme="light">Light</button>
                        <button class="theme-btn" data-theme="summer">Summer</button>
                        <button class="theme-btn" data-theme="autumn">Autumn</button>
                        <button class="theme-btn" data-theme="ocean">Ocean</button>
                        <button class="theme-btn" data-theme="forest">Forest</button>
                        <button class="theme-btn" data-theme="sunset">Sunset</button>
                        <button class="theme-btn" data-theme="professional">Professional</button>
                        <button class="theme-btn" data-theme="vibrant">Vibrant</button>
                    </div>
                    <button class="generate-btn">✨ Generate New Colors</button>
                </div>

                <div class="colors-grid" id="colorsGrid"></div>

                <div class="demo-section">
                    <h3 class="demo-title">🖥️ Website Preview</h3>
                    <div class="demo-website" id="demoWebsite"></div>
                </div>

                <div class="accessibility-info">
                    <h3 class="accessibility-title">
                        ♿ Accessibility Report
                    </h3>
                    <div class="contrast-grid" id="contrastGrid"></div>
                </div>
            </div>

            <div class="copy-notification" id="copyNotification">
                Color copied to clipboard! 🎉
            </div>
        `;
    }

    attachEventListeners() {
        // Theme selection
        this.shadowRoot.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.shadowRoot.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTheme = e.target.dataset.theme;
                this.generateColors();
            });
        });

        // Generate button
        this.shadowRoot.querySelector('.generate-btn').addEventListener('click', () => {
            this.generateColors();
        });
    }

    generateColors() {
        const themes = {
            modern: this.generateModernTheme(),
            dark: this.generateDarkTheme(),
            light: this.generateLightTheme(),
            summer: this.generateSummerTheme(),
            autumn: this.generateAutumnTheme(),
            ocean: this.generateOceanTheme(),
            forest: this.generateForestTheme(),
            sunset: this.generateSunsetTheme(),
            professional: this.generateProfessionalTheme(),
            vibrant: this.generateVibrantTheme()
        };

        this.generatedColors = themes[this.currentTheme];
        this.renderColors();
        this.checkAccessibility();
    }

    generateModernTheme() {
        const baseHue = Math.floor(Math.random() * 360);
        const satVariation = 10 + Math.floor(Math.random() * 20);
        const lightVariation = 5 + Math.floor(Math.random() * 15);
        const accentHue = (baseHue + 120 + Math.floor(Math.random() * 120)) % 360;
        
        return {
            color1: this.hslToHex(baseHue, 15 + Math.floor(Math.random() * 10), 93 + Math.floor(Math.random() * 5)),
            color2: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 12 + Math.floor(Math.random() * 10), 88 + Math.floor(Math.random() * 5)),
            color3: this.hslToHex(baseHue + Math.floor(Math.random() * 30), 8 + Math.floor(Math.random() * 15), 70 + Math.floor(Math.random() * 10)),
            color4: this.hslToHex(baseHue + Math.floor(Math.random() * 25), 25 + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 35 + Math.floor(Math.random() * 15), 15 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 60 + Math.floor(Math.random() * 25), 45 + Math.floor(Math.random() * 15))
        };
    }

    generateDarkTheme() {
        const baseHue = Math.floor(Math.random() * 360);
        const accentHue = (baseHue + 90 + Math.floor(Math.random() * 180)) % 360;
        
        return {
            color1: this.hslToHex(baseHue, 20 + Math.floor(Math.random() * 15), 12 + Math.floor(Math.random() * 8)),
            color2: this.hslToHex(baseHue + Math.floor(Math.random() * 25), 18 + Math.floor(Math.random() * 12), 18 + Math.floor(Math.random() * 8)),
            color3: this.hslToHex(baseHue + Math.floor(Math.random() * 30), 12 + Math.floor(Math.random() * 10), 30 + Math.floor(Math.random() * 10)),
            color4: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 8 + Math.floor(Math.random() * 8), 60 + Math.floor(Math.random() * 10)),
            color5: this.hslToHex(baseHue + Math.floor(Math.random() * 15), 5 + Math.floor(Math.random() * 5), 85 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 70 + Math.floor(Math.random() * 20), 65 + Math.floor(Math.random() * 15))
        };
    }

    generateLightTheme() {
        const baseHue = Math.floor(Math.random() * 360);
        const accentHue = (baseHue + 60 + Math.floor(Math.random() * 240)) % 360;
        
        return {
            color1: this.hslToHex(baseHue, 8 + Math.floor(Math.random() * 7), 96 + Math.floor(Math.random() * 3)),
            color2: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 12 + Math.floor(Math.random() * 8), 92 + Math.floor(Math.random() * 4)),
            color3: this.hslToHex(baseHue + Math.floor(Math.random() * 25), 18 + Math.floor(Math.random() * 10), 75 + Math.floor(Math.random() * 10)),
            color4: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 22 + Math.floor(Math.random() * 15), 50 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(baseHue + Math.floor(Math.random() * 15), 28 + Math.floor(Math.random() * 12), 20 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 65 + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 15))
        };
    }

    generateSummerTheme() {
        const summerHues = [30, 45, 60, 180, 200, 50, 170, 190]; // Extended yellows, blues
        const baseHue = summerHues[Math.floor(Math.random() * summerHues.length)] + Math.floor(Math.random() * 30);
        const accentHue = (baseHue + 90 + Math.floor(Math.random() * 180)) % 360;
        
        return {
            color1: this.hslToHex(baseHue, 25 + Math.floor(Math.random() * 15), 90 + Math.floor(Math.random() * 5)),
            color2: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 30 + Math.floor(Math.random() * 15), 85 + Math.floor(Math.random() * 6)),
            color3: this.hslToHex(baseHue + Math.floor(Math.random() * 25), 20 + Math.floor(Math.random() * 15), 65 + Math.floor(Math.random() * 12)),
            color4: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 35 + Math.floor(Math.random() * 20), 45 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(baseHue + Math.floor(Math.random() * 15), 40 + Math.floor(Math.random() * 15), 20 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 75 + Math.floor(Math.random() * 15), 50 + Math.floor(Math.random() * 15))
        };
    }

    generateAutumnTheme() {
        const autumnHues = [10, 20, 35, 350, 25, 15, 340, 330]; // Extended oranges, reds, browns
        const baseHue = autumnHues[Math.floor(Math.random() * autumnHues.length)] + Math.floor(Math.random() * 25);
        const accentHue = (baseHue + 120 + Math.floor(Math.random() * 120)) % 360;
        
        return {
            color1: this.hslToHex(baseHue, 20 + Math.floor(Math.random() * 15), 88 + Math.floor(Math.random() * 5)),
            color2: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 25 + Math.floor(Math.random() * 15), 82 + Math.floor(Math.random() * 6)),
            color3: this.hslToHex(baseHue + Math.floor(Math.random() * 25), 30 + Math.floor(Math.random() * 15), 60 + Math.floor(Math.random() * 12)),
            color4: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 35 + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(baseHue + Math.floor(Math.random() * 15), 40 + Math.floor(Math.random() * 15), 15 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 55 + Math.floor(Math.random() * 20), 45 + Math.floor(Math.random() * 15))
        };
    }

    generateOceanTheme() {
        const oceanHue = 180 + Math.floor(Math.random() * 80); // Extended blues and teals
        const accentHue = (oceanHue + 150 + Math.floor(Math.random() * 120)) % 360;
        
        return {
            color1: this.hslToHex(oceanHue, 25 + Math.floor(Math.random() * 15), 92 + Math.floor(Math.random() * 5)),
            color2: this.hslToHex(oceanHue + Math.floor(Math.random() * 20), 30 + Math.floor(Math.random() * 15), 86 + Math.floor(Math.random() * 6)),
            color3: this.hslToHex(oceanHue + Math.floor(Math.random() * 25), 20 + Math.floor(Math.random() * 15), 65 + Math.floor(Math.random() * 12)),
            color4: this.hslToHex(oceanHue + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(oceanHue + Math.floor(Math.random() * 15), 45 + Math.floor(Math.random() * 15), 15 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 65 + Math.floor(Math.random() * 20), 50 + Math.floor(Math.random() * 15))
        };
    }

    generateForestTheme() {
        const forestHue = 80 + Math.floor(Math.random() * 80); // Extended greens
        const accentHue = (forestHue + 200 + Math.floor(Math.random() * 120)) % 360;
        
        return {
            color1: this.hslToHex(forestHue, 20 + Math.floor(Math.random() * 15), 90 + Math.floor(Math.random() * 5)),
            color2: this.hslToHex(forestHue + Math.floor(Math.random() * 20), 25 + Math.floor(Math.random() * 15), 84 + Math.floor(Math.random() * 6)),
            color3: this.hslToHex(forestHue + Math.floor(Math.random() * 25), 15 + Math.floor(Math.random() * 15), 65 + Math.floor(Math.random() * 12)),
            color4: this.hslToHex(forestHue + Math.floor(Math.random() * 20), 30 + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(forestHue + Math.floor(Math.random() * 15), 35 + Math.floor(Math.random() * 15), 17 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 60 + Math.floor(Math.random() * 20), 45 + Math.floor(Math.random() * 15))
        };
    }

    generateSunsetTheme() {
        const sunsetHues = [5, 15, 25, 310, 320, 340, 350, 30]; // Extended oranges, pinks
        const baseHue = sunsetHues[Math.floor(Math.random() * sunsetHues.length)] + Math.floor(Math.random() * 20);
        const accentHue = (baseHue + 100 + Math.floor(Math.random() * 160)) % 360;
        
        return {
            color1: this.hslToHex(baseHue, 30 + Math.floor(Math.random() * 15), 88 + Math.floor(Math.random() * 5)),
            color2: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 35 + Math.floor(Math.random() * 15), 82 + Math.floor(Math.random() * 6)),
            color3: this.hslToHex(baseHue + Math.floor(Math.random() * 25), 25 + Math.floor(Math.random() * 15), 63 + Math.floor(Math.random() * 12)),
            color4: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 20), 43 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(baseHue + Math.floor(Math.random() * 15), 45 + Math.floor(Math.random() * 15), 20 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 65 + Math.floor(Math.random() * 20), 47 + Math.floor(Math.random() * 15))
        };
    }

    generateProfessionalTheme() {
        const professionalHues = [210, 220, 230, 240, 250, 260, 200, 270]; // Extended blues and purples
        const baseHue = professionalHues[Math.floor(Math.random() * professionalHues.length)] + Math.floor(Math.random() * 20);
        const accentHue = (baseHue + 30 + Math.floor(Math.random() * 60)) % 360;
        
        return {
            color1: this.hslToHex(baseHue, 12 + Math.floor(Math.random() * 8), 94 + Math.floor(Math.random() * 4)),
            color2: this.hslToHex(baseHue + Math.floor(Math.random() * 15), 15 + Math.floor(Math.random() * 8), 89 + Math.floor(Math.random() * 4)),
            color3: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 10 + Math.floor(Math.random() * 8), 70 + Math.floor(Math.random() * 10)),
            color4: this.hslToHex(baseHue + Math.floor(Math.random() * 15), 22 + Math.floor(Math.random() * 12), 45 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(baseHue + Math.floor(Math.random() * 10), 27 + Math.floor(Math.random() * 8), 20 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 55 + Math.floor(Math.random() * 15), 43 + Math.floor(Math.random() * 12))
        };
    }

    generateVibrantTheme() {
        const baseHue = Math.floor(Math.random() * 360);
        const accentHue = (baseHue + 60 + Math.floor(Math.random() * 240)) % 360;
        
        return {
            color1: this.hslToHex(baseHue, 35 + Math.floor(Math.random() * 20), 85 + Math.floor(Math.random() * 8)),
            color2: this.hslToHex(baseHue + Math.floor(Math.random() * 25), 40 + Math.floor(Math.random() * 20), 79 + Math.floor(Math.random() * 8)),
            color3: this.hslToHex(baseHue + Math.floor(Math.random() * 30), 30 + Math.floor(Math.random() * 15), 60 + Math.floor(Math.random() * 12)),
            color4: this.hslToHex(baseHue + Math.floor(Math.random() * 20), 50 + Math.floor(Math.random() * 20), 37 + Math.floor(Math.random() * 15)),
            color5: this.hslToHex(baseHue + Math.floor(Math.random() * 15), 55 + Math.floor(Math.random() * 15), 17 + Math.floor(Math.random() * 10)),
            color6: this.hslToHex(accentHue, 80 + Math.floor(Math.random() * 15), 50 + Math.floor(Math.random() * 15))
        };
    }

    renderColors() {
        const colorDescriptions = {
            color1: "Primary Background",
            color2: "Secondary Background", 
            color3: "Disabled State",
            color4: "Secondary Text",
            color5: "Primary Text",
            color6: "Links & Actions"
        };

        const colorNumbers = {
            color1: "Color 1",
            color2: "Color 2", 
            color3: "Color 3",
            color4: "Color 4",
            color5: "Color 5",
            color6: "Color 6"
        };

        const colorUsage = {
            color1: "Main backgrounds, app containers",
            color2: "Cards, sidebars, secondary areas",
            color3: "Disabled buttons, unavailable dates",
            color4: "Captions, metadata, helper text",
            color5: "Headlines, body text, main content",
            color6: "Buttons, links, interactive elements"
        };

        const grid = this.shadowRoot.getElementById('colorsGrid');
        grid.innerHTML = '';

        Object.entries(this.generatedColors).forEach(([key, value]) => {
            const colorCard = document.createElement('div');
            colorCard.className = 'color-card';
            colorCard.innerHTML = `
                <div class="color-preview" style="background-color: ${value}" data-color="${value}"></div>
                <div class="color-info">
                    <div class="color-number">${colorNumbers[key]}</div>
                    <div class="color-title">${colorDescriptions[key]}</div>
                    <div class="color-hex">${value.toUpperCase()}</div>
                    <div class="color-usage">${colorUsage[key]}</div>
                </div>
            `;

            // Add click to copy functionality
            const preview = colorCard.querySelector('.color-preview');
            preview.addEventListener('click', () => {
                this.copyToClipboard(value);
            });

            grid.appendChild(colorCard);
        });

        // Render demo website
        this.renderDemoWebsite();
    }

    renderDemoWebsite() {
        const demoContainer = this.shadowRoot.getElementById('demoWebsite');
        const colors = this.generatedColors;
        
        demoContainer.innerHTML = `
            <style>
                .demo-website {
                    --color1: ${colors.color1};
                    --color2: ${colors.color2};
                    --color3: ${colors.color3};
                    --color4: ${colors.color4};
                    --color5: ${colors.color5};
                    --color6: ${colors.color6};
                }
            </style>
            
            <!-- Header -->
            <div class="demo-header" style="background-color: ${colors.color1}; border-color: ${colors.color3};">
                <div class="demo-logo" style="color: ${colors.color5};">
                    YourBrand
                </div>
                <nav class="demo-nav">
                    <a href="#" class="demo-nav-link" style="color: ${colors.color4};">Home</a>
                    <a href="#" class="demo-nav-link" style="color: ${colors.color4};">About</a>
                    <a href="#" class="demo-nav-link" style="color: ${colors.color4};">Services</a>
                    <a href="#" class="demo-nav-link" style="color: ${colors.color6};">Contact</a>
                </nav>
            </div>

            <!-- Hero Section -->
            <div class="demo-hero">
                <h1 style="color: ${colors.color5};">
                    Welcome to Our Amazing Website
                </h1>
                <p style="color: ${colors.color4};">
                    Discover incredible solutions that will transform your business and help you achieve your goals with our innovative approach.
                </p>
                <div class="demo-buttons">
                    <button class="demo-btn primary" style="background-color: ${colors.color6};">
                        Get Started
                    </button>
                    <button class="demo-btn secondary" style="color: ${colors.color6}; border-color: ${colors.color6};">
                        Learn More
                    </button>
                    <button class="demo-btn disabled" style="background-color: ${colors.color3}; color: ${colors.color4};">
                        Coming Soon
                    </button>
                </div>
            </div>

            <!-- Content Section -->
            <div class="demo-content">
                <div class="demo-cards">
                    <div class="demo-card" style="background-color: ${colors.color1};">
                        <h3 style="color: ${colors.color5};">Innovation</h3>
                        <p style="color: ${colors.color4};">
                            We bring cutting-edge technology and creative solutions to help your business thrive in today's competitive market.
                        </p>
                        <a href="#" class="demo-link" style="color: ${colors.color6};">
                            Learn more →
                        </a>
                    </div>
                    
                    <div class="demo-card" style="background-color: ${colors.color2};">
                        <h3 style="color: ${colors.color5};">Excellence</h3>
                        <p style="color: ${colors.color4};">
                            Our commitment to quality and attention to detail ensures that every project exceeds expectations.
                        </p>
                        <a href="#" class="demo-link" style="color: ${colors.color6};">
                            View portfolio →
                        </a>
                    </div>
                    
                    <div class="demo-card" style="background-color: ${colors.color1};">
                        <h3 style="color: ${colors.color5};">Support</h3>
                        <p style="color: ${colors.color4};">
                            24/7 customer support and dedicated account management to ensure your success every step of the way.
                        </p>
                        <a href="#" class="demo-link" style="color: ${colors.color6};">
                            Contact us →
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 40px;">
                    <h2 style="color: ${colors.color5}; margin-bottom: 20px;">Ready to Get Started?</h2>
                    <p style="color: ${colors.color4}; margin-bottom: 25px;">
                        Join thousands of satisfied customers who have transformed their business with our solutions.
                    </p>
                    <button class="demo-btn primary" style="background-color: ${colors.color6}; font-size: 1.1rem; padding: 15px 30px;">
                        Start Your Journey
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="demo-footer" style="background-color: ${colors.color2}; border-color: ${colors.color3};">
                <p style="color: ${colors.color4};">
                    © 2024 YourBrand. All rights reserved. | 
                    <a href="#" style="color: ${colors.color6}; text-decoration: none;">Privacy Policy</a> | 
                    <a href="#" style="color: ${colors.color6}; text-decoration: none;">Terms of Service</a>
                </p>
            </div>
        `;
    }

    checkAccessibility() {
        const contrastGrid = this.shadowRoot.getElementById('contrastGrid');
        contrastGrid.innerHTML = '';

        const combinations = [
            { text: this.generatedColors.color5, bg: this.generatedColors.color1, label: 'Primary Text on Primary BG' },
            { text: this.generatedColors.color4, bg: this.generatedColors.color1, label: 'Secondary Text on Primary BG' },
            { text: this.generatedColors.color5, bg: this.generatedColors.color2, label: 'Primary Text on Secondary BG' },
            { text: this.generatedColors.color6, bg: this.generatedColors.color1, label: 'Links on Primary BG' },
            { text: '#FFFFFF', bg: this.generatedColors.color6, label: 'White Text on Links' }
        ];

        combinations.forEach(combo => {
            const ratio = this.getContrastRatio(combo.text, combo.bg);
            const passes = ratio >= 4.5;
            
            const item = document.createElement('div');
            item.className = `contrast-item ${passes ? 'contrast-pass' : 'contrast-fail'}`;
            item.innerHTML = `
                <strong>${combo.label}</strong><br>
                Ratio: ${ratio.toFixed(2)} ${passes ? '✅ WCAG AA' : '❌ Fails WCAG'}
            `;
            contrastGrid.appendChild(item);
        });
    }

    getContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(color1);
        const lum2 = this.getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    getLuminance(hex) {
        const rgb = this.hexToRgb(hex);
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;

        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const notification = this.shadowRoot.getElementById('copyNotification');
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        });
    }
}

// Register the custom element
customElements.define('theme-color-generator', ThemeColorGenerator);
