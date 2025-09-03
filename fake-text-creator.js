class FakeTextCreator extends HTMLElement {
    constructor() {
        super();
        this.currentModel = 'iphone';
        this.currentApp = 'imessage';
        this.darkMode = false;
        this.showBattery = true;
        this.showSignal = true;
        this.showWifi = true;
        this.iphoneColor = 'purple';
        this.senderAvatar = null;
        this.messages = [
            { text: "Hey! How are you?", type: "received", time: "14:25" },
            { text: "I'm good! Thanks for asking 😊", type: "sent", time: "14:30" }
        ];
        
        this.iphoneColors = {
            purple: { name: 'Purple', gradient: 'linear-gradient(60deg, #7371ee 1%, #a1d9d6 100%)' },
            blue: { name: 'Blue', gradient: 'linear-gradient(60deg, #4facfe 0%, #00f2fe 100%)' },
            black: { name: 'Space Gray', gradient: 'linear-gradient(60deg, #29323c 0%, #485563 100%)' },
            white: { name: 'Silver', gradient: 'linear-gradient(60deg, #ffecd2 0%, #fcb69f 100%)' },
            red: { name: 'Red', gradient: 'linear-gradient(60deg, #ff9a9e 0%, #fecfef 100%)' },
            green: { name: 'Green', gradient: 'linear-gradient(60deg, #a8edea 0%, #fed6e3 100%)' }
        };
        
        this.messageApps = {
            iphone: [
                { value: 'imessage', name: 'Messages (iMessage)', color: '#007AFF' },
                { value: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
                { value: 'telegram', name: 'Telegram', color: '#0088cc' },
                { value: 'signal', name: 'Signal', color: '#2592E9' }
            ],
            android: [
                { value: 'messages', name: 'Google Messages', color: '#1976D2' },
                { value: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
                { value: 'telegram', name: 'Telegram', color: '#0088cc' },
                { value: 'signal', name: 'Signal', color: '#2592E9' }
            ]
        };
        
        this.translations = {
            en: { active: 'Active now', typing: 'typing...', online: 'Online' },
            es: { active: 'Activo ahora', typing: 'escribiendo...', online: 'En línea' },
            fr: { active: 'Actif maintenant', typing: 'en train d\'écrire...', online: 'En ligne' },
            de: { active: 'Jetzt aktiv', typing: 'tippt...', online: 'Online' },
            it: { active: 'Attivo ora', typing: 'sta scrivendo...', online: 'Online' },
            pt: { active: 'Ativo agora', typing: 'digitando...', online: 'Online' },
            ru: { active: 'Активен сейчас', typing: 'печатает...', online: 'В сети' },
            zh: { active: '刚刚在线', typing: '正在输入...', online: '在线' },
            ja: { active: '今アクティブ', typing: '入力中...', online: 'オンライン' },
            ko: { active: '지금 활동 중', typing: '입력 중...', online: '온라인' },
            ar: { active: 'نشط الآن', typing: 'يكتب...', online: 'متصل' },
            hi: { active: 'अभी सक्रिय', typing: 'टाइप कर रहे हैं...', online: 'ऑनलाइन' }
        };
    }

    connectedCallback() {
        this.innerHTML = this.getTemplate();
        this.loadHtml2Canvas();
        this.setupEventListeners();
        this.updatePreview();
    }

    loadHtml2Canvas() {
        if (!window.html2canvas) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            document.head.appendChild(script);
        }
    }

    getTemplate() {
        return `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }

                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                    overflow: hidden;
                }

                .header {
                    background: linear-gradient(135deg, #1e3c72, #2a5298);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }

                .header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    font-weight: 700;
                }

                .header p {
                    opacity: 0.9;
                    font-size: 1.1rem;
                }

                .main-content {
                    display: grid;
                    grid-template-columns: 1fr 420px;
                    gap: 0;
                    min-height: 900px;
                }

                .controls {
                    padding: 30px;
                    background: #f8fafc;
                    border-right: 1px solid #e2e8f0;
                    overflow-y: auto;
                    max-height: 900px;
                }

                .preview {
                    padding: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f4f6fc;
                    position: relative;
                }

                .control-group {
                    margin-bottom: 25px;
                }

                .control-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.9rem;
                }

                .control-group input, .control-group select, .control-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }

                .control-group input:focus, .control-group select:focus, .control-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .avatar-upload {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                    margin-top: 10px;
                }

                .avatar-preview {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 18px;
                    overflow: hidden;
                }

                .avatar-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .file-input {
                    flex: 1;
                    cursor: pointer;
                }

                /* iPhone X Mockup Styles */
                .iphone-x {
                    position: relative;
                    margin: 40px auto;
                    width: 360px;
                    height: 780px;
                    background-color: #7371ee;
                    background-image: linear-gradient(60deg, #7371ee 1%, #a1d9d6 100%);
                    border-radius: 40px;
                    box-shadow: 0px 0px 0px 11px #1f1f1f, 0px 0px 0px 13px #191919, 0px 0px 0px 20px #111;
                }

                .iphone-x:before,
                .iphone-x:after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .iphone-x:after {
                    bottom: 7px;
                    width: 140px;
                    height: 4px;
                    background-color: #f2f2f2;
                    border-radius: 10px;
                }

                .iphone-x:before {
                    top: 0px;
                    width: 56%;
                    height: 30px;
                    background-color: #1f1f1f;
                    border-radius: 0px 0px 40px 40px;
                    z-index: 10;
                }

                .iphone-speaker {
                    position: absolute;
                    top: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    height: 8px;
                    width: 15%;
                    background-color: #101010;
                    border-radius: 8px;
                    box-shadow: inset 0px -3px 3px 0px rgba(255, 255, 255, 0.2);
                    z-index: 15;
                }

                .iphone-camera {
                    position: absolute;
                    left: 50%;
                    top: 4px;
                    transform: translateX(50px);
                    width: 12px;
                    height: 12px;
                    background-color: #101010;
                    border-radius: 12px;
                    box-shadow: inset 0px -3px 2px 0px rgba(255, 255, 255, 0.2);
                    z-index: 15;
                }

                .iphone-camera:after {
                    content: '';
                    position: absolute;
                    background-color: #2d4d76;
                    width: 6px;
                    height: 6px;
                    top: 3px;
                    left: 3px;
                    border-radius: 4px;
                    box-shadow: inset 0px -2px 2px rgba(0, 0, 0, 0.5);
                }

                /* Android Mockup Styles */
                .android-phone {
                    position: relative;
                    margin: 40px auto;
                    width: 328px;
                    height: 658px;
                    background: linear-gradient(145deg, #2c2c2c, #404040);
                    border-radius: 25px;
                    box-shadow: 0px 0px 0px 8px #1a1a1a, 0px 0px 0px 10px #111, 0px 0px 20px rgba(0,0,0,0.5);
                }

                .android-frame {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    width: calc(100% - 30px);
                    height: calc(100% - 30px);
                    background: #000;
                    border-radius: 15px;
                    overflow: hidden;
                }

                /* Screen Content */
                .phone-screen {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .status-bar {
                    height: 44px;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 25px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    flex-shrink: 0;
                    backdrop-filter: blur(20px);
                    position: relative;
                    z-index: 15;
                }

                .status-bar.android {
                    background: #2196F3;
                    height: 28px;
                    padding: 0 15px;
                    font-size: 13px;
                    backdrop-filter: none;
                }

                .status-bar.dark {
                    background: rgba(28, 28, 30, 0.95);
                    color: white;
                }

                .status-bar.dark.android {
                    background: #1f1f1f;
                    color: white;
                }

                .status-bar.whatsapp {
                    background: #075e54;
                }

                .status-bar.whatsapp.android {
                    background: #128C7E;
                }

                .status-bar.telegram {
                    background: #0088cc;
                }

                .status-bar.signal {
                    background: #2592E9;
                }

                .status-left {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .status-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .messages-header {
                    background: linear-gradient(180deg, #f8f8f8 0%, #f0f0f0 100%);
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 1px solid #e0e0e0;
                    flex-shrink: 0;
                }

                .messages-header.android {
                    background: linear-gradient(180deg, #2196F3 0%, #1976D2 100%);
                    color: white;
                }

                .messages-header.dark {
                    background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
                    color: white;
                    border-bottom-color: #38383a;
                }

                .messages-header.dark.android {
                    background: linear-gradient(180deg, #212121 0%, #121212 100%);
                    color: white;
                    border-bottom-color: #333;
                }

                .messages-header.whatsapp {
                    background: linear-gradient(180deg, #128C7E 0%, #075E54 100%);
                    color: white;
                }

                .messages-header.whatsapp.dark {
                    background: linear-gradient(180deg, #0d7269 0%, #054e46 100%);
                    color: white;
                }

                .messages-header.telegram {
                    background: linear-gradient(180deg, #54a9eb 0%, #0088cc 100%);
                    color: white;
                }

                .messages-header.telegram.dark {
                    background: linear-gradient(180deg, #2b5278 0%, #17212b 100%);
                    color: white;
                }

                .messages-header.signal {
                    background: linear-gradient(180deg, #2592E9 0%, #1976D2 100%);
                    color: white;
                }

                .messages-header.signal.dark {
                    background: linear-gradient(180deg, #1976D2 0%, #0d47a1 100%);
                    color: white;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                    flex-shrink: 0;
                    overflow: hidden;
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .contact-info h3 {
                    font-size: 17px;
                    margin-bottom: 2px;
                    color: #000;
                    font-weight: 600;
                }

                .contact-info.android h3,
                .contact-info.dark h3,
                .contact-info.whatsapp h3,
                .contact-info.telegram h3,
                .contact-info.signal h3 {
                    color: white;
                }

                .contact-info p {
                    font-size: 13px;
                    color: #666;
                    font-weight: 400;
                }

                .contact-info.android p,
                .contact-info.dark p {
                    color: rgba(255,255,255,0.9);
                }

                .contact-info.whatsapp p,
                .contact-info.telegram p,
                .contact-info.signal p {
                    color: rgba(255,255,255,0.8);
                }

                .messages-area {
                    flex: 1;
                    padding: 20px 15px;
                    overflow-y: auto;
                    background: #ffffff;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    min-height: 400px;
                    position: relative;
                }

                .messages-area.dark {
                    background: #1c1c1e;
                }

                .messages-area.dark.android {
                    background: #121212;
                }

                .messages-area.whatsapp {
                    background: #ece5dd;
                    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="whatsapp-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.5" fill="%23d9d9d9" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23whatsapp-pattern)"/></svg>');
                    background-size: 20px 20px;
                }

                .messages-area.whatsapp.dark {
                    background: #0b141a;
                }

                .messages-area.telegram {
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                }

                .messages-area.telegram.dark {
                    background: #17212b;
                }

                .messages-area.signal {
                    background: #f8fafc;
                }

                .messages-area.signal.dark {
                    background: #1a1a1a;
                }

                .messages-area.custom-bg {
                    background-image: none;
                }

                .message {
                    max-width: 75%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 16px;
                    line-height: 1.4;
                    position: relative;
                    word-wrap: break-word;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    margin-bottom: 4px;
                }

                .message.sent {
                    align-self: flex-end;
                    background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.sent.android {
                    background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
                }

                .message.sent.whatsapp {
                    background: linear-gradient(135deg, #dcf8c6 0%, #b6d481 100%);
                    color: #000;
                }

                .message.sent.whatsapp.dark {
                    background: linear-gradient(135deg, #005c4b 0%, #004037 100%);
                    color: white;
                }

                .message.sent.telegram {
                    background: linear-gradient(135deg, #54a9eb 0%, #0088cc 100%);
                    color: white;
                }

                .message.sent.signal {
                    background: linear-gradient(135deg, #2592E9 0%, #1976D2 100%);
                    color: white;
                }

                .message.received {
                    align-self: flex-start;
                    background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
                    color: #000;
                    border-bottom-left-radius: 4px;
                }

                .message.received.android {
                    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
                    border: 1px solid #e0e0e0;
                }

                .message.received.dark {
                    background: linear-gradient(135deg, #3a3a3c 0%, #2c2c2e 100%);
                    color: #ffffff;
                    border: 1px solid #48484a;
                }

                .message.received.whatsapp {
                    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
                    color: #000;
                }

                .message.received.whatsapp.dark {
                    background: linear-gradient(135deg, #262d31 0%, #1f2428 100%);
                    color: white;
                }

                .message.received.telegram {
                    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
                    color: #000;
                }

                .message.received.telegram.dark {
                    background: linear-gradient(135deg, #2b2e33 0%, #212427 100%);
                    color: white;
                }

                .message.received.signal {
                    background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
                    color: #000;
                }

                .message.received.signal.dark {
                    background: linear-gradient(135deg, #3a3a3c 0%, #2c2c2e 100%);
                    color: white;
                }

                .message-time {
                    font-size: 11px;
                    opacity: 0.7;
                    margin-top: 6px;
                    text-align: right;
                    font-weight: 500;
                }

                .message.received .message-time {
                    text-align: left;
                }

                .btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: transform 0.2s ease;
                    width: 100%;
                    margin-top: 10px;
                    font-size: 14px;
                }

                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .btn.export-png {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .btn.export-jpg {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }

                .toggle-group {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }

                .toggle {
                    flex: 1;
                    padding: 10px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.3s ease;
                    font-size: 13px;
                    font-weight: 600;
                }

                .toggle.active {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                }

                .color-input {
                    width: 60px;
                    height: 40px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .message-item {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                    align-items: flex-start;
                    flex-wrap: wrap;
                }

                .message-input {
                    flex: 2;
                    min-width: 200px;
                }

                .message-time-input {
                    flex: 1;
                    min-width: 100px;
                }

                .message-type-toggle {
                    padding: 10px 14px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    min-width: 80px;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .message-type-toggle.sent {
                    background: #007AFF;
                    color: white;
                    border-color: #007AFF;
                }

                .message-type-toggle.received {
                    background: #e5e5ea;
                    color: #000;
                    border-color: #e5e5ea;
                }

                .remove-message {
                    background: #ef4444;
                    color: white;
                    border: none;
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .remove-message:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }

                .signal-bars {
                    display: flex;
                    gap: 2px;
                    align-items: flex-end;
                }

                .signal-bar {
                    width: 3px;
                    background: white;
                    border-radius: 2px;
                    transition: opacity 0.3s ease;
                }

                .battery-icon {
                    width: 24px;
                    height: 12px;
                    border: 1.5px solid white;
                    border-radius: 2px;
                    position: relative;
                    margin-left: 3px;
                }

                .battery-fill {
                    height: 100%;
                    background: white;
                    border-radius: 1px;
                    transition: width 0.3s ease;
                }

                .battery-tip {
                    position: absolute;
                    right: -3px;
                    top: 3px;
                    width: 2px;
                    height: 4px;
                    background: white;
                    border-radius: 0 2px 2px 0;
                }

                .export-section {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 20px;
                    margin-top: 20px;
                }

                .export-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .range-display {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                @media (max-width: 768px) {
                    .main-content {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto 1fr;
                    }
                    
                    .iphone-x, .android-phone {
                        width: 300px;
                        height: 650px;
                    }
                    
                    .header h1 {
                        font-size: 2rem;
                    }
                    
                    .preview {
                        padding: 20px;
                    }
                }
            </style>

            <div class="container">
                <div class="header">
                    <h1>📱 Fake Text Creator Pro</h1>
                    <p>Create ultra-realistic text message screenshots with customizable phones and message apps!</p>
                </div>
                
                <div class="main-content">
                    <div class="controls">
                        <div class="control-group">
                            <label>Phone Model</label>
                            <div class="toggle-group">
                                <div class="toggle active" data-model="iphone">iPhone</div>
                                <div class="toggle" data-model="android">Android</div>
                            </div>
                        </div>

                        <div class="control-group" id="iphoneColorGroup">
                            <label>iPhone Color</label>
                            <select id="iphoneColor">
                                <!-- Options populated dynamically -->
                            </select>
                        </div>

                        <div class="control-group">
                            <label>Theme Mode</label>
                            <div class="toggle-group">
                                <div class="toggle active" data-theme="light">🌞 Light</div>
                                <div class="toggle" data-theme="dark">🌙 Dark</div>
                            </div>
                        </div>

                        <div class="control-group">
                            <label>Message App</label>
                            <select id="messageApp">
                                <!-- Options populated dynamically -->
                            </select>
                        </div>

                        <div class="control-group">
                            <label>Contact Name</label>
                            <input type="text" id="contactName" value="John Doe" placeholder="Enter contact name">
                        </div>

                        <div class="control-group">
                            <label>Sender Avatar</label>
                            <div class="avatar-upload">
                                <div class="avatar-preview" id="avatarPreview">JD</div>
                                <input type="file" id="avatarUpload" accept="image/*" class="file-input">
                            </div>
                        </div>

                        <div class="control-group">
                            <label>Status Text</label>
                            <input type="text" id="statusText" value="Active now" placeholder="e.g., Active now, Online">
                        </div>

                        <div class="control-group">
                            <label>Carrier</label>
                            <input type="text" id="carrier" value="Verizon" placeholder="Carrier name">
                        </div>

                        <div class="control-group">
                            <label>Time</label>
                            <input type="time" id="currentTime" value="14:30">
                        </div>

                        <div class="control-group">
                            <label>Battery Level</label>
                            <input type="range" id="batteryLevel" min="1" max="100" value="85">
                            <div class="range-display" id="batteryDisplay">85%</div>
                        </div>

                        <div class="control-group">
                            <label>Signal Strength</label>
                            <input type="range" id="signalStrength" min="0" max="4" value="4">
                            <div class="range-display" id="signalDisplay">Full Signal</div>
                        </div>

                        <div class="control-group">
                            <label>Display Options</label>
                            <div class="toggle-group">
                                <div class="toggle active" data-option="battery">Battery</div>
                                <div class="toggle active" data-option="signal">Signal</div>
                                <div class="toggle active" data-option="wifi">WiFi</div>
                            </div>
                        </div>

                        <div class="control-group">
                            <label>Message Background</label>
                            <input type="color" id="bgColor" value="#ffffff" class="color-input">
                        </div>

                        <div class="control-group">
                            <label>Language</label>
                            <select id="language">
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="it">Italiano</option>
                                <option value="pt">Português</option>
                                <option value="ru">Русский</option>
                                <option value="zh">中文</option>
                                <option value="ja">日本語</option>
                                <option value="ko">한국어</option>
                                <option value="ar">العربية</option>
                                <option value="hi">हिन्दी</option>
                            </select>
                        </div>

                        <div class="control-group">
                            <label>Messages</label>
                            <div id="messagesContainer">
                                <!-- Messages populated dynamically -->
                            </div>
                            <button class="btn" onclick="this.getRootNode().host.addMessage()">+ Add Message</button>
                        </div>

                        <div class="export-section">
                            <div class="export-buttons">
                                <button class="btn export-png" onclick="this.getRootNode().host.exportImage('png')">📸 Export PNG</button>
                                <button class="btn export-jpg" onclick="this.getRootNode().host.exportImage('jpg')">🖼️ Export JPG</button>
                            </div>
                        </div>
                    </div>

                    <div class="preview">
                        <div id="phoneContainer">
                            <!-- Phone will be rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Model toggles
        this.querySelectorAll('[data-model]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                this.querySelectorAll('[data-model]').forEach(t => t.classList.remove('active'));
                toggle.classList.add('active');
                this.currentModel = toggle.dataset.model;
                this.populateMessageApps();
                this.updateIphoneColorVisibility();
                this.updatePreview();
            });
        });

        // Theme toggles
        this.querySelectorAll('[data-theme]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                this.querySelectorAll('[data-theme]').forEach(t => t.classList.remove('active'));
                toggle.classList.add('active');
                this.darkMode = toggle.dataset.theme === 'dark';
                this.updatePreview();
            });
        });

        // Option toggles
        this.querySelectorAll('[data-option]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const option = toggle.dataset.option;
                if (option === 'battery') this.showBattery = toggle.classList.contains('active');
                if (option === 'signal') this.showSignal = toggle.classList.contains('active');
                if (option === 'wifi') this.showWifi = toggle.classList.contains('active');
                this.updatePreview();
            });
        });

        // Input listeners
        ['contactName', 'statusText', 'carrier', 'currentTime', 'batteryLevel', 'signalStrength', 'bgColor', 'language', 'messageApp', 'iphoneColor'].forEach(id => {
            const element = this.querySelector(`#${id}`);
            if (element) {
                element.addEventListener('input', () => this.updatePreview());
            }
        });

        // Avatar upload
        this.querySelector('#avatarUpload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.senderAvatar = e.target.result;
                    this.updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });

        // Battery and signal displays
        this.querySelector('#batteryLevel').addEventListener('input', (e) => {
            this.querySelector('#batteryDisplay').textContent = e.target.value + '%';
        });

        this.querySelector('#signalStrength').addEventListener('input', (e) => {
            const strength = parseInt(e.target.value);
            const labels = ['No Signal', 'Poor', 'Fair', 'Good', 'Excellent'];
            this.querySelector('#signalDisplay').textContent = labels[strength];
        });

        // Message inputs
        this.addEventListener('input', (e) => {
            if (e.target.classList.contains('message-input') || e.target.classList.contains('message-time-input')) {
                this.updateMessagesFromInputs();
                this.updatePreview();
            }
        });

        this.populateIphoneColors();
        this.populateMessageApps();
        this.updateIphoneColorVisibility();
        this.renderMessageInputs();
    }

    populateIphoneColors() {
        const select = this.querySelector('#iphoneColor');
        select.innerHTML = '';
        Object.entries(this.iphoneColors).forEach(([key, color]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = color.name;
            if (key === this.iphoneColor) option.selected = true;
            select.appendChild(option);
        });
    }

    updateIphoneColorVisibility() {
        const colorGroup = this.querySelector('#iphoneColorGroup');
        colorGroup.style.display = this.currentModel === 'iphone' ? 'block' : 'none';
    }

    populateMessageApps() {
        const messageAppSelect = this.querySelector('#messageApp');
        const apps = this.messageApps[this.currentModel];
        
        messageAppSelect.innerHTML = '';
        apps.forEach(app => {
            const option = document.createElement('option');
            option.value = app.value;
            option.textContent = app.name;
            if (app.value === this.currentApp) {
                option.selected = true;
            }
            messageAppSelect.appendChild(option);
        });
        
        const currentAppExists = apps.some(app => app.value === this.currentApp);
        if (!currentAppExists) {
            this.currentApp = apps[0].value;
            messageAppSelect.value = this.currentApp;
        }
    }

    renderMessageInputs() {
        const container = this.querySelector('#messagesContainer');
        container.innerHTML = '';
        
        this.messages.forEach((message, index) => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';
            messageItem.innerHTML = `
                <input type="text" class="message-input" placeholder="Enter message..." value="${message.text}">
                <input type="time" class="message-time-input" value="${message.time}">
                <div class="message-type-toggle ${message.type}" onclick="this.getRootNode().host.toggleMessageType(this, ${index})">${message.type === 'sent' ? 'Sent' : 'Received'}</div>
                <button class="remove-message" onclick="this.getRootNode().host.removeMessage(${index})">×</button>
            `;
            container.appendChild(messageItem);
        });
    }

    updateMessagesFromInputs() {
        const messageInputs = this.querySelectorAll('.message-input');
        const timeInputs = this.querySelectorAll('.message-time-input');
        
        messageInputs.forEach((input, index) => {
            if (this.messages[index]) {
                this.messages[index].text = input.value;
                this.messages[index].time = timeInputs[index].value;
            }
        });
    }

    addMessage() {
        this.messages.push({ text: '', type: 'received', time: '14:30' });
        this.renderMessageInputs();
        this.updatePreview();
    }

    removeMessage(index) {
        if (this.messages.length > 1) {
            this.messages.splice(index, 1);
            this.renderMessageInputs();
            this.updatePreview();
        }
    }

    toggleMessageType(element, index) {
        if (element.classList.contains('sent')) {
            element.classList.remove('sent');
            element.classList.add('received');
            element.textContent = 'Received';
            this.messages[index].type = 'received';
        } else {
            element.classList.remove('received');
            element.classList.add('sent');
            element.textContent = 'Sent';
            this.messages[index].type = 'sent';
        }
        this.updatePreview();
    }

    renderPhone() {
        const container = this.querySelector('#phoneContainer');
        this.iphoneColor = this.querySelector('#iphoneColor')?.value || 'purple';
        
        if (this.currentModel === 'iphone') {
            container.innerHTML = `
                <div class="iphone-x" style="background-image: ${this.iphoneColors[this.iphoneColor].gradient}">
                    <div class="iphone-speaker"></div>
                    <div class="iphone-camera"></div>
                    <div class="phone-screen">
                        ${this.renderScreenContent()}
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="android-phone">
                    <div class="android-frame">
                        <div class="phone-screen">
                            ${this.renderScreenContent()}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderScreenContent() {
        const contactName = this.querySelector('#contactName')?.value || 'John Doe';
        const statusText = this.querySelector('#statusText')?.value || 'Active now';
        const carrier = this.querySelector('#carrier')?.value || 'Verizon';
        const currentTime = this.querySelector('#currentTime')?.value || '14:30';
        const batteryLevel = this.querySelector('#batteryLevel')?.value || 85;
        const signalStrength = this.querySelector('#signalStrength')?.value || 4;
        
        const timeFormatted = this.formatTime(currentTime);
        const initials = contactName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        const avatarContent = this.senderAvatar ? 
            `<img src="${this.senderAvatar}" alt="Avatar">` : 
            initials;

        const appClasses = `${this.currentModel} ${this.currentApp} ${this.darkMode ? 'dark' : ''}`;

        return `
            <div class="status-bar ${appClasses}">
                <div class="status-left">
                    <span>${timeFormatted}</span>
                </div>
                <div class="status-right">
                    ${this.showSignal ? `<div class="signal-bars">
                        ${Array.from({length: 4}, (_, i) => 
                            `<div class="signal-bar" style="height: ${(i + 1) * 2 + 2}px; opacity: ${i < signalStrength ? 1 : 0.3}"></div>`
                        ).join('')}
                    </div>` : ''}
                    ${this.showWifi ? '<div style="font-size: 14px;">📶</div>' : ''}
                    <span>${carrier}</span>
                    ${this.showBattery ? `
                        <div class="battery-icon">
                            <div class="battery-fill" style="width: ${batteryLevel}%;"></div>
                            <div class="battery-tip"></div>
                        </div>
                        <span>${batteryLevel}%</span>
                    ` : ''}
                </div>
            </div>
            
            <div class="messages-header ${appClasses}">
                <div class="avatar">${avatarContent}</div>
                <div class="contact-info ${appClasses}">
                    <h3>${contactName}</h3>
                    <p>${statusText}</p>
                </div>
            </div>
            
            <div class="messages-area ${appClasses}" id="messagesArea">
                ${this.renderMessages()}
            </div>
        `;
    }

    renderMessages() {
        const bgColor = this.querySelector('#bgColor')?.value || '#ffffff';
        
        if (this.messages.length === 0 || this.messages.every(msg => !msg.text.trim())) {
            return '<div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #9ca3af; font-size: 14px;">No messages yet. Add some messages above!</div>';
        }

        return this.messages.map(message => {
            if (!message.text.trim()) return '';
            
            const appClasses = `${this.currentModel} ${this.currentApp} ${this.darkMode ? 'dark' : ''}`;
            const timeFormatted = this.formatTime(message.time);
            
            return `
                <div class="message ${message.type} ${appClasses}">
                    ${message.text}
                    <div class="message-time">${timeFormatted}</div>
                </div>
            `;
        }).join('');
    }

    updatePreview() {
        this.currentApp = this.querySelector('#messageApp')?.value || 'imessage';
        this.renderPhone();
        
        // Update custom background if set
        const bgColor = this.querySelector('#bgColor')?.value || '#ffffff';
        const messagesArea = this.querySelector('#messagesArea');
        if (messagesArea && bgColor !== '#ffffff') {
            messagesArea.style.backgroundColor = bgColor;
            messagesArea.classList.add('custom-bg');
        }
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 % 12 || 12;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    async exportImage(format = 'png') {
        const phoneContainer = this.querySelector('#phoneContainer');
        
        if (!window.html2canvas) {
            alert('Image export library is loading. Please wait a moment and try again.');
            return;
        }

        try {
            const canvas = await html2canvas(phoneContainer, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                width: phoneContainer.offsetWidth,
                height: phoneContainer.offsetHeight
            });

            const link = document.createElement('a');
            link.download = `fake-text-message.${format}`;
            link.href = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.95 : 1.0);
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again or use a different browser.');
        }
    }
}

// Register the custom element
customElements.define('fake-text-creator', FakeTextCreator);
