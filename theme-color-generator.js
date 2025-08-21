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
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 30px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    color: white;
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
                    margin-bottom: 5px;
                    color: #333;
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
                        padding: 20px;
                    }
                    
                    .title {
                        font-size: 2rem;
                    }
                    
                    .controls {
                        flex-direction: column;
                    }
                    
                    .colors-grid {
                        grid-template-columns: 1fr;
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
        return {
            color1: this.hslToHex(baseHue, 20, 95), // Primary background
            color2: this.hslToHex(baseHue, 15, 90), // Secondary background
            color3: this.hslToHex(baseHue, 10, 75), // Disabled state
            color4: this.hslToHex(baseHue, 30, 45), // Secondary text
            color5: this.hslToHex(baseHue, 40, 20), // Primary text
            color6: this.hslToHex((baseHue + 180) % 360, 70, 50) // Links/actions
        };
    }

    generateDarkTheme() {
        const baseHue = Math.floor(Math.random() * 360);
        return {
            color1: this.hslToHex(baseHue, 25, 15), // Dark primary background
            color2: this.hslToHex(baseHue, 20, 20), // Dark secondary background
            color3: this.hslToHex(baseHue, 15, 35), // Disabled state
            color4: this.hslToHex(baseHue, 10, 65), // Secondary text
            color5: this.hslToHex(baseHue, 5, 90), // Primary text (light)
            color6: this.hslToHex((baseHue + 120) % 360, 80, 70) // Bright links/actions
        };
    }

    generateLightTheme() {
        const baseHue = Math.floor(Math.random() * 360);
        return {
            color1: this.hslToHex(baseHue, 10, 98), // Very light background
            color2: this.hslToHex(baseHue, 15, 94), // Light secondary background
            color3: this.hslToHex(baseHue, 20, 80), // Disabled state
            color4: this.hslToHex(baseHue, 25, 55), // Secondary text
            color5: this.hslToHex(baseHue, 30, 25), // Dark primary text
            color6: this.hslToHex((baseHue + 60) % 360, 70, 45) // Links/actions
        };
    }

    generateSummerTheme() {
        const summerHues = [45, 60, 180, 200]; // Yellows, blues
        const baseHue = summerHues[Math.floor(Math.random() * summerHues.length)];
        return {
            color1: this.hslToHex(baseHue, 30, 92),
            color2: this.hslToHex(baseHue, 35, 88),
            color3: this.hslToHex(baseHue, 25, 70),
            color4: this.hslToHex(baseHue, 40, 50),
            color5: this.hslToHex(baseHue, 45, 25),
            color6: this.hslToHex((baseHue + 90) % 360, 80, 55)
        };
    }

    generateAutumnTheme() {
        const autumnHues = [20, 35, 10, 350]; // Oranges, reds, browns
        const baseHue = autumnHues[Math.floor(Math.random() * autumnHues.length)];
        return {
            color1: this.hslToHex(baseHue, 25, 90),
            color2: this.hslToHex(baseHue, 30, 85),
            color3: this.hslToHex(baseHue, 35, 65),
            color4: this.hslToHex(baseHue, 40, 45),
            color5: this.hslToHex(baseHue, 45, 20),
            color6: this.hslToHex((baseHue + 150) % 360, 60, 50)
        };
    }

    generateOceanTheme() {
        const oceanHue = 200 + Math.floor(Math.random() * 40); // Blues and teals
        return {
            color1: this.hslToHex(oceanHue, 30, 94),
            color2: this.hslToHex(oceanHue, 35, 88),
            color3: this.hslToHex(oceanHue, 25, 70),
            color4: this.hslToHex(oceanHue, 45, 45),
            color5: this.hslToHex(oceanHue, 50, 20),
            color6: this.hslToHex((oceanHue + 180) % 360, 70, 55)
        };
    }

    generateForestTheme() {
        const forestHue = 90 + Math.floor(Math.random() * 60); // Greens
        return {
            color1: this.hslToHex(forestHue, 25, 92),
            color2: this.hslToHex(forestHue, 30, 87),
            color3: this.hslToHex(forestHue, 20, 70),
            color4: this.hslToHex(forestHue, 35, 45),
            color5: this.hslToHex(forestHue, 40, 22),
            color6: this.hslToHex((forestHue + 240) % 360, 65, 50)
        };
    }

    generateSunsetTheme() {
        const sunsetHues = [15, 25, 320, 340]; // Oranges, pinks
        const baseHue = sunsetHues[Math.floor(Math.random() * sunsetHues.length)];
        return {
            color1: this.hslToHex(baseHue, 35, 90),
            color2: this.hslToHex(baseHue, 40, 85),
            color3: this.hslToHex(baseHue, 30, 68),
            color4: this.hslToHex(baseHue, 45, 48),
            color5: this.hslToHex(baseHue, 50, 25),
            color6: this.hslToHex((baseHue + 120) % 360, 70, 52)
        };
    }

    generateProfessionalTheme() {
        const professionalHues = [220, 230, 240, 250]; // Blues and purples
        const baseHue = professionalHues[Math.floor(Math.random() * professionalHues.length)];
        return {
            color1: this.hslToHex(baseHue, 15, 96),
            color2: this.hslToHex(baseHue, 18, 91),
            color3: this.hslToHex(baseHue, 12, 75),
            color4: this.hslToHex(baseHue, 25, 50),
            color5: this.hslToHex(baseHue, 30, 25),
            color6: this.hslToHex((baseHue + 30) % 360, 60, 48)
        };
    }

    generateVibrantTheme() {
        const baseHue = Math.floor(Math.random() * 360);
        return {
            color1: this.hslToHex(baseHue, 40, 88),
            color2: this.hslToHex(baseHue, 45, 82),
            color3: this.hslToHex(baseHue, 35, 65),
            color4: this.hslToHex(baseHue, 55, 42),
            color5: this.hslToHex(baseHue, 60, 22),
            color6: this.hslToHex((baseHue + 90) % 360, 85, 55)
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
