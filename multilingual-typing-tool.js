class MultilingualTypingTool extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentSuggestions = [];
        this.selectedSuggestionIndex = -1;
        this.debounceTimer = null;
        this.selectedLanguage = 'hi'; // Default to Hindi
        
        // Supported languages with their display names and codes
        this.languages = [
            { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
            { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
            { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
            { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
            { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
            { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
            { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
            { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
            { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
            { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
            { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
            { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृत', flag: '🕉️' },
            { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
            { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
            { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
            { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
            { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷' },
            { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
            { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
            { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' }
        ];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                    font-family: 'Courier New', monospace;
                    width: 100%;
                }

                .typing-tool-container {
                    width: 100%;
                    height: 100vh;
                    background: #f5f5f5;
                    border: 3px solid #333;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #fff;
                    border: 2px solid #333;
                    flex-shrink: 0;
                }

                .language-selector {
                    margin-bottom: 20px;
                    text-align: center;
                }

                .selector-label {
                    color: #333;
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 8px;
                    display: block;
                    text-transform: uppercase;
                }

                .language-dropdown {
                    width: 300px;
                    max-width: 100%;
                    padding: 10px;
                    font-size: 14px;
                    font-family: inherit;
                    border: 2px solid #333;
                    background: #fff;
                    color: #333;
                    cursor: pointer;
                }

                .language-dropdown:focus {
                    outline: none;
                    background: #e0e0e0;
                }

                .main-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    flex: 1;
                    min-height: 0;
                }

                .input-section,
                .output-section {
                    background: #fff;
                    border: 2px solid #333;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ccc;
                    flex-shrink: 0;
                }

                .section-label {
                    font-weight: bold;
                    color: #333;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .char-counter {
                    font-size: 12px;
                    color: #666;
                    font-family: monospace;
                }

                .input-field,
                .output-field {
                    flex: 1;
                    width: 100%;
                    padding: 15px;
                    border: 1px solid #ccc;
                    font-size: 16px;
                    font-family: inherit;
                    resize: none;
                    background: #fafafa;
                    line-height: 1.5;
                    min-height: 0;
                    height: 100%;
                    overflow-y: auto;
                }

                .input-field:focus {
                    outline: none;
                    border-color: #333;
                    background: #fff;
                }

                .output-field {
                    font-family: Arial, sans-serif;
                    background: #f9f9f9;
                    direction: ltr;
                }

                .output-field.rtl {
                    direction: rtl;
                    text-align: right;
                }

                .suggestions-container {
                    position: relative;
                    margin-top: 10px;
                }

                .suggestions-list {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #fff;
                    border: 2px solid #333;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    display: none;
                }

                .suggestion-item {
                    padding: 10px 15px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .suggestion-item:last-child {
                    border-bottom: none;
                }

                .suggestion-item:hover,
                .suggestion-item.selected {
                    background: #333;
                    color: #fff;
                }

                .suggestion-text {
                    font-size: 16px;
                    font-weight: bold;
                }

                .suggestion-english {
                    font-size: 12px;
                    opacity: 0.7;
                    font-style: italic;
                }

                .action-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                    flex-shrink: 0;
                }

                .btn {
                    padding: 8px 16px;
                    border: 2px solid #333;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    font-family: inherit;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.2s ease;
                }

                .btn-primary {
                    background: #333;
                    color: #fff;
                }

                .btn-secondary {
                    background: #fff;
                    color: #333;
                }

                .btn:hover {
                    background: #666;
                    color: #fff;
                }

                .btn:active {
                    transform: translateY(1px);
                }

                .keyboard-shortcuts {
                    margin-top: 20px;
                    padding: 15px;
                    background: #fff;
                    border: 2px solid #333;
                    font-size: 12px;
                    color: #666;
                    text-align: center;
                    flex-shrink: 0;
                }

                .shortcuts-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #333;
                    text-transform: uppercase;
                }

                .shortcut-item {
                    display: inline-block;
                    margin: 0 15px;
                }

                .shortcut-key {
                    background: #eee;
                    padding: 2px 6px;
                    border: 1px solid #ccc;
                    font-family: monospace;
                    font-size: 11px;
                    font-weight: bold;
                }

                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #333;
                    color: #fff;
                    padding: 10px 20px;
                    border: 2px solid #000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    z-index: 10000;
                    font-family: inherit;
                    font-size: 12px;
                    text-transform: uppercase;
                }

                .toast.show {
                    transform: translateX(0);
                }

                .toast.error {
                    background: #cc0000;
                }

                .toast.warning {
                    background: #ff6600;
                }

                .toast.success {
                    background: #006600;
                }

                @media (max-width: 768px) {
                    .main-content {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    
                    .language-dropdown {
                        width: 100%;
                    }
                    
                    .typing-tool-container {
                        padding: 15px;
                    }
                    
                    .input-field,
                    .output-field {
                        min-height: 200px;
                    }
                }

                @media (max-width: 480px) {
                    .section-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 10px;
                    }
                    
                    .action-buttons {
                        justify-content: center;
                    }
                    
                    .shortcut-item {
                        display: block;
                        margin: 5px 0;
                    }
                }
            </style>

            <div class="typing-tool-container">
                <div class="header">
                    <div class="language-selector">
                        <label class="selector-label">Select Language</label>
                        <select id="language-dropdown" class="language-dropdown">
                            ${this.languages.map(lang => 
                                `<option value="${lang.code}" ${lang.code === this.selectedLanguage ? 'selected' : ''}>
                                    ${lang.flag} ${lang.name} (${lang.nativeName})
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                </div>

                <div class="main-content">
                    <div class="input-section">
                        <div class="section-header">
                            <label class="section-label">English Input</label>
                            <div class="char-counter">
                                <span id="char-count">0</span> chars
                            </div>
                        </div>
                        <textarea 
                            id="english-input" 
                            class="input-field" 
                            placeholder="Type in English..."
                            autocomplete="off"
                            spellcheck="false"
                        ></textarea>
                        <div class="suggestions-container">
                            <div id="suggestions-list" class="suggestions-list"></div>
                        </div>
                    </div>

                    <div class="output-section">
                        <div class="section-header">
                            <label class="section-label" id="output-label">Hindi Output</label>
                        </div>
                        <textarea 
                            id="output-field" 
                            class="output-field" 
                            placeholder="Transliterated text will appear here..."
                            readonly
                        ></textarea>
                        <div class="action-buttons">
                            <button id="copy-btn" class="btn btn-primary">
                                Copy
                            </button>
                            <button id="clear-btn" class="btn btn-secondary">
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div class="keyboard-shortcuts">
                    <div class="shortcuts-title">Keyboard Shortcuts</div>
                    <span class="shortcut-item"><span class="shortcut-key">Ctrl+Enter</span> Copy</span>
                    <span class="shortcut-item"><span class="shortcut-key">Ctrl+L</span> Clear</span>
                    <span class="shortcut-item"><span class="shortcut-key">↑↓</span> Navigate</span>
                    <span class="shortcut-item"><span class="shortcut-key">Tab/Enter</span> Select</span>
                </div>
            </div>

            <div id="toast" class="toast"></div>
        `;
    }

    setupEventListeners() {
        const englishInput = this.shadowRoot.getElementById('english-input');
        const outputField = this.shadowRoot.getElementById('output-field');
        const copyBtn = this.shadowRoot.getElementById('copy-btn');
        const clearBtn = this.shadowRoot.getElementById('clear-btn');
        const charCount = this.shadowRoot.getElementById('char-count');
        const suggestionsList = this.shadowRoot.getElementById('suggestions-list');
        const languageDropdown = this.shadowRoot.getElementById('language-dropdown');
        const outputLabel = this.shadowRoot.getElementById('output-label');

        // Language selection
        languageDropdown.addEventListener('change', (e) => {
            this.selectedLanguage = e.target.value;
            const selectedLang = this.languages.find(lang => lang.code === this.selectedLanguage);
            
            // Update output label
            outputLabel.textContent = `${selectedLang.name} Output`;
            
            // Update RTL direction for Arabic, Persian, Urdu
            const rtlLanguages = ['ar', 'fa', 'ur'];
            if (rtlLanguages.includes(this.selectedLanguage)) {
                outputField.classList.add('rtl');
            } else {
                outputField.classList.remove('rtl');
            }
            
            // Re-transliterate current text
            const text = englishInput.value.trim();
            if (text) {
                this.debounceTransliterate(text);
            }
            
            this.showToast(`Switched to ${selectedLang.name}`, 'success');
        });

        // Real-time transliteration
        englishInput.addEventListener('input', (e) => {
            const text = e.target.value;
            charCount.textContent = text.length;
            
            if (text.trim()) {
                this.debounceTransliterate(text);
            } else {
                outputField.value = '';
                this.hideSuggestions();
            }
        });

        // Keyboard shortcuts
        englishInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.copyToClipboard();
            } else if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clearAll();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateSuggestions(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSuggestions(-1);
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                if (this.selectedSuggestionIndex >= 0) {
                    e.preventDefault();
                    this.selectSuggestion(this.selectedSuggestionIndex);
                }
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });

        // Button events
        copyBtn.addEventListener('click', () => this.copyToClipboard());
        clearBtn.addEventListener('click', () => this.clearAll());

        // Suggestion clicks
        suggestionsList.addEventListener('click', (e) => {
            const suggestionItem = e.target.closest('.suggestion-item');
            if (suggestionItem) {
                const index = Array.from(suggestionsList.children).indexOf(suggestionItem);
                this.selectSuggestion(index);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.shadowRoot.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    debounceTransliterate(text) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.transliterate(text);
        }, 300);
    }

    async transliterate(text) {
        try {
            const words = text.split(/\s+/);
            const lastWord = words[words.length - 1];
            
            if (lastWord.length < 1) return;

            // Transliterate the complete text
            const transliteratedText = await this.getTransliteration(text);
            const outputField = this.shadowRoot.getElementById('output-field');
            outputField.value = transliteratedText;

            // Get suggestions for the last word being typed
            if (lastWord.length > 0) {
                const suggestions = await this.getSuggestions(lastWord);
                this.showSuggestions(suggestions, lastWord);
            }

        } catch (error) {
            console.error('Transliteration error:', error);
            this.showToast('Error: Unable to transliterate', 'error');
        }
    }

    async getTransliteration(text) {
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${this.selectedLanguage}-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data[1] && data[1][0] && data[1][0][1]) {
                return data[1][0][1][0];
            }
            return text;
        } catch (error) {
            console.error('API Error:', error);
            return text;
        }
    }

    async getSuggestions(word) {
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=${this.selectedLanguage}-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data[1] && data[1][0] && data[1][0][1]) {
                return data[1][0][1].map((suggestion, index) => ({
                    text: suggestion,
                    english: word,
                    score: data[1][0][2] ? data[1][0][2][index] : 1
                }));
            }
            return [];
        } catch (error) {
            console.error('Suggestions API Error:', error);
            return [];
        }
    }

    showSuggestions(suggestions, englishWord) {
        const suggestionsList = this.shadowRoot.getElementById('suggestions-list');
        this.currentSuggestions = suggestions;
        this.selectedSuggestionIndex = -1;

        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionsList.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-item" data-index="${index}">
                <span class="suggestion-text">${suggestion.text}</span>
                <span class="suggestion-english">${suggestion.english}</span>
            </div>
        `).join('');

        suggestionsList.style.display = 'block';
    }

    hideSuggestions() {
        const suggestionsList = this.shadowRoot.getElementById('suggestions-list');
        suggestionsList.style.display = 'none';
        this.selectedSuggestionIndex = -1;
    }

    navigateSuggestions(direction) {
        if (this.currentSuggestions.length === 0) return;

        const suggestionItems = this.shadowRoot.querySelectorAll('.suggestion-item');
        
        // Remove current selection
        if (this.selectedSuggestionIndex >= 0) {
            suggestionItems[this.selectedSuggestionIndex].classList.remove('selected');
        }

        // Update selection index
        this.selectedSuggestionIndex += direction;
        
        if (this.selectedSuggestionIndex >= this.currentSuggestions.length) {
            this.selectedSuggestionIndex = 0;
        } else if (this.selectedSuggestionIndex < 0) {
            this.selectedSuggestionIndex = this.currentSuggestions.length - 1;
        }

        // Add new selection
        suggestionItems[this.selectedSuggestionIndex].classList.add('selected');
        suggestionItems[this.selectedSuggestionIndex].scrollIntoView({ block: 'nearest' });
    }

    selectSuggestion(index) {
        if (index < 0 || index >= this.currentSuggestions.length) return;

        const englishInput = this.shadowRoot.getElementById('english-input');
        const outputField = this.shadowRoot.getElementById('output-field');
        const selectedSuggestion = this.currentSuggestions[index];

        // Replace the last word in the input with the selected suggestion
        const inputWords = englishInput.value.split(/\s+/);
        const outputWords = outputField.value.split(/\s+/);
        
        if (outputWords.length > 0) {
            outputWords[outputWords.length - 1] = selectedSuggestion.text;
            outputField.value = outputWords.join(' ');
        }

        this.hideSuggestions();
        englishInput.focus();
    }

    async copyToClipboard() {
        const outputField = this.shadowRoot.getElementById('output-field');
        const text = outputField.value.trim();

        if (!text) {
            this.showToast('No text to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard', 'success');
        } catch (error) {
            // Fallback for older browsers
            outputField.select();
            document.execCommand('copy');
            this.showToast('Copied to clipboard', 'success');
        }
    }

    clearAll() {
        const englishInput = this.shadowRoot.getElementById('english-input');
        const outputField = this.shadowRoot.getElementById('output-field');
        const charCount = this.shadowRoot.getElementById('char-count');

        englishInput.value = '';
        outputField.value = '';
        charCount.textContent = '0';
        this.hideSuggestions();
        englishInput.focus();
        
        this.showToast('Text cleared', 'success');
    }

    showToast(message, type = 'success') {
        const toast = this.shadowRoot.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
}

// Define the custom element
customElements.define('multilingual-typing-tool', MultilingualTypingTool);
