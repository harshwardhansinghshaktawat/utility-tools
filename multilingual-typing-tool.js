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
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .typing-tool-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 25px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                    border-radius: 25px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                    position: relative;
                    overflow: hidden;
                }

                .typing-tool-container::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    animation: shimmer 4s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                }

                .language-selector {
                    margin-bottom: 25px;
                    position: relative;
                    z-index: 1;
                }

                .selector-label {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                    display: block;
                }

                .language-dropdown {
                    width: 100%;
                    padding: 15px 20px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    color: #333;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }

                .language-dropdown:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }

                .language-dropdown option {
                    padding: 10px;
                    font-size: 1rem;
                }

                .input-section {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 30px;
                    margin-bottom: 25px;
                    backdrop-filter: blur(15px);
                    box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.05);
                    position: relative;
                    z-index: 1;
                }

                .input-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                }

                .input-label {
                    font-weight: 700;
                    color: #333;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .char-counter {
                    font-size: 0.9rem;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: #f8f9fa;
                    padding: 6px 12px;
                    border-radius: 20px;
                }

                .input-field {
                    width: 100%;
                    min-height: 140px;
                    padding: 20px;
                    border: 3px solid #e8ecf4;
                    border-radius: 15px;
                    font-size: 1.15rem;
                    font-family: inherit;
                    resize: vertical;
                    transition: all 0.3s ease;
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    line-height: 1.5;
                }

                .input-field:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                    transform: translateY(-3px);
                    background: #ffffff;
                }

                .suggestions-container {
                    position: relative;
                    margin-top: 15px;
                }

                .suggestions-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 2px solid #e8ecf4;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    max-height: 250px;
                    overflow-y: auto;
                    z-index: 1000;
                    display: none;
                }

                .suggestion-item {
                    padding: 15px 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid #f0f4f8;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .suggestion-item:last-child {
                    border-bottom: none;
                }

                .suggestion-item:hover,
                .suggestion-item.selected {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    transform: scale(1.02);
                }

                .suggestion-text {
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .suggestion-english {
                    font-size: 0.95rem;
                    opacity: 0.8;
                    font-style: italic;
                }

                .output-section {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 30px;
                    backdrop-filter: blur(15px);
                    box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.05);
                    position: relative;
                    z-index: 1;
                }

                .output-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .output-label {
                    font-weight: 700;
                    color: #333;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .action-buttons {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .btn {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }

                .btn-secondary {
                    background: #f8f9fa;
                    color: #495057;
                    border: 2px solid #e9ecef;
                }

                .btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                }

                .btn:active {
                    transform: translateY(-1px);
                }

                .output-field {
                    width: 100%;
                    min-height: 140px;
                    padding: 20px;
                    border: 3px solid #e8ecf4;
                    border-radius: 15px;
                    font-size: 1.3rem;
                    font-family: 'Noto Sans', serif;
                    resize: vertical;
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    line-height: 1.7;
                    direction: ltr;
                }

                .output-field.rtl {
                    direction: rtl;
                    text-align: right;
                }

                .keyboard-shortcuts {
                    margin-top: 20px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 15px;
                    font-size: 0.9rem;
                    color: #666;
                    position: relative;
                    z-index: 1;
                }

                .shortcuts-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: #333;
                    font-size: 1rem;
                }

                .shortcut-item {
                    display: inline-block;
                    margin: 3px 12px 3px 0;
                }

                .shortcut-key {
                    background: #e9ecef;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .toast {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                    transform: translateX(120%);
                    transition: transform 0.3s ease;
                    z-index: 10000;
                    font-weight: 600;
                }

                .toast.show {
                    transform: translateX(0);
                }

                .toast.error {
                    background: linear-gradient(135deg, #dc3545, #e74c3c);
                }

                .toast.warning {
                    background: linear-gradient(135deg, #fd7e14, #f39c12);
                }

                .loading {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .typing-tool-container {
                        margin: 15px;
                        padding: 20px;
                    }

                    .input-section,
                    .output-section {
                        padding: 25px;
                    }

                    .output-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .action-buttons {
                        justify-content: center;
                    }

                    .btn {
                        flex: 1;
                        justify-content: center;
                    }
                }
            </style>

            <div class="typing-tool-container">
                <div class="language-selector">
                    <label class="selector-label">🌐 Select Language</label>
                    <select id="language-dropdown" class="language-dropdown">
                        ${this.languages.map(lang => 
                            `<option value="${lang.code}" ${lang.code === this.selectedLanguage ? 'selected' : ''}>
                                ${lang.flag} ${lang.name} (${lang.nativeName})
                            </option>`
                        ).join('')}
                    </select>
                </div>

                <div class="input-section">
                    <div class="input-header">
                        <label class="input-label">✍️ English Input</label>
                        <div class="char-counter">
                            <span id="char-count">0</span> characters
                        </div>
                    </div>
                    <textarea 
                        id="english-input" 
                        class="input-field" 
                        placeholder="Type in English... (e.g., 'namaste' becomes 'नमस्ते' in Hindi)"
                        autocomplete="off"
                        spellcheck="false"
                    ></textarea>
                    <div class="suggestions-container">
                        <div id="suggestions-list" class="suggestions-list"></div>
                    </div>
                </div>

                <div class="output-section">
                    <div class="output-header">
                        <label class="output-label" id="output-label">🎯 Hindi Output</label>
                        <div class="action-buttons">
                            <button id="copy-btn" class="btn btn-primary">
                                📋 Copy
                            </button>
                            <button id="clear-btn" class="btn btn-secondary">
                                🗑️ Clear All
                            </button>
                        </div>
                    </div>
                    <textarea 
                        id="output-field" 
                        class="output-field" 
                        placeholder="Transliterated text will appear here..."
                        readonly
                    ></textarea>
                </div>

                <div class="keyboard-shortcuts">
                    <div class="shortcuts-title">⌨️ Keyboard Shortcuts</div>
                    <span class="shortcut-item"><span class="shortcut-key">Ctrl+Enter</span> Copy Output</span>
                    <span class="shortcut-item"><span class="shortcut-key">Ctrl+L</span> Clear All</span>
                    <span class="shortcut-item"><span class="shortcut-key">↑↓</span> Navigate Suggestions</span>
                    <span class="shortcut-item"><span class="shortcut-key">Tab/Enter</span> Select Suggestion</span>
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
            outputLabel.innerHTML = `🎯 ${selectedLang.name} Output`;
            
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
            
            this.showToast(`Switched to ${selectedLang.name} (${selectedLang.nativeName})`, 'success');
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
            this.showToast('Error: Unable to transliterate. Please try again.', 'error');
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
            this.showToast('No text to copy!', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('✅ Copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            outputField.select();
            document.execCommand('copy');
            this.showToast('✅ Copied to clipboard!', 'success');
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
        
        this.showToast('🗑️ All text cleared!', 'success');
    }

    showToast(message, type = 'success') {
        const toast = this.shadowRoot.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Define the custom element
customElements.define('multilingual-typing-tool', MultilingualTypingTool);
