class FakeTextCreator extends HTMLElement {
    constructor() {
        super();
        this.currentModel = 'iphone';
        this.showBattery = true;
        this.showSignal = true;
        this.showWifi = true;
        this.messages = [
            { text: "Hey! How are you?", type: "received" },
            { text: "I'm good! Thanks for asking 😊", type: "sent" }
        ];
        
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
        this.setupEventListeners();
        this.updatePreview();
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
                    min-height: 800px;
                }

                .controls {
                    padding: 30px;
                    background: #f8fafc;
                    border-right: 1px solid #e2e8f0;
                    overflow-y: auto;
                    max-height: 800px;
                }

                .preview {
                    padding: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

                .control-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .phone-container {
                    position: relative;
                    width: 320px;
                    height: 640px;
                    margin: 0 auto;
                }

                .phone-frame {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(145deg, #2c3e50, #34495e);
                    border-radius: 30px;
                    padding: 15px 10px 25px 10px;
                    position: relative;
                    box-shadow: 0 0 40px rgba(0,0,0,0.4);
                    border: 2px solid #34495e;
                }

                .phone-frame.android {
                    border-radius: 20px;
                    background: linear-gradient(145deg, #424242, #616161);
                    border-color: #616161;
                }

                .screen {
                    width: 100%;
                    height: 100%;
                    background: #000;
                    border-radius: 25px;
                    overflow: hidden;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }

                .screen.android {
                    border-radius: 15px;
                }

                .status-bar {
                    height: 44px;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 20px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    flex-shrink: 0;
                    backdrop-filter: blur(20px);
                }

                .status-bar.android {
                    background: #2196F3;
                    height: 28px;
                    padding: 0 15px;
                    font-size: 13px;
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
                }

                .contact-info h3 {
                    font-size: 17px;
                    margin-bottom: 2px;
                    color: #000;
                    font-weight: 600;
                }

                .contact-info.android h3 {
                    color: white;
                }

                .contact-info p {
                    font-size: 13px;
                    color: #666;
                    font-weight: 400;
                }

                .contact-info.android p {
                    color: rgba(255,255,255,0.9);
                }

                .messages-area {
                    flex: 1;
                    padding: 20px 15px;
                    overflow-y: auto;
                    background: #ffffff;
                    background-image: 
                        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(0,0,0,0.02) 0%, transparent 50%);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    min-height: 400px;
                    position: relative;
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

                .btn:active {
                    transform: translateY(0);
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

                .messages-input {
                    margin-bottom: 20px;
                }

                .message-item {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                    align-items: flex-start;
                }

                .message-input {
                    flex: 1;
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

                .add-message-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    padding: 10px 20px;
                    font-size: 13px;
                    border-radius: 8px;
                    margin-bottom: 15px;
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

                @media (max-width: 768px) {
                    .main-content {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto 1fr;
                    }
                    
                    .phone-container {
                        width: 280px;
                        height: 560px;
                    }
                    
                    .header h1 {
                        font-size: 2rem;
                    }
                    
                    .preview {
                        padding: 20px;
                    }
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

                .signal-bar.android {
                    background: white;
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

                .wifi-icon {
                    font-size: 14px;
                }

                .export-section {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 20px;
                    margin-top: 20px;
                }

                .empty-messages {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                    color: #9ca3af;
                    font-size: 14px;
                    text-align: center;
                }

                .range-display {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }
            </style>

            <div class="container">
                <div class="header">
                    <h1>📱 Fake Text Creator</h1>
                    <p>Create realistic text message screenshots for memes, quotes, and more!</p>
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

                        <div class="control-group">
                            <label>Contact Name</label>
                            <input type="text" id="contactName" value="John Doe" placeholder="Enter contact name">
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

                        <div class="control-group messages-input">
                            <label>Messages</label>
                            <div id="messagesContainer">
                                <!-- Messages will be populated here -->
                            </div>
                            <button class="btn add-message-btn" onclick="this.getRootNode().host.addMessage()">+ Add Message</button>
                        </div>

                        <div class="export-section">
                            <button class="btn" onclick="this.getRootNode().host.exportImage()">📸 Export as Image</button>
                        </div>
                    </div>

                    <div class="preview">
                        <div class="phone-container">
                            <div class="phone-frame" id="phoneFrame">
                                <div class="screen" id="screen">
                                    <div class="status-bar" id="statusBar">
                                        <div class="status-left">
                                            <span id="timeDisplay">2:30 PM</span>
                                        </div>
                                        <div class="status-right">
                                            <div class="signal-bars" id="signalBars" style="display: flex;">
                                                <div class="signal-bar" style="height: 4px;"></div>
                                                <div class="signal-bar" style="height: 6px;"></div>
                                                <div class="signal-bar" style="height: 8px;"></div>
                                                <div class="signal-bar" style="height: 10px;"></div>
                                            </div>
                                            <div class="wifi-icon" id="wifiIcon" style="display: block;">📶</div>
                                            <span id="carrierDisplay">Verizon</span>
                                            <div class="battery-icon" id="batteryIcon" style="display: flex;">
                                                <div class="battery-fill" style="width: 85%;"></div>
                                                <div class="battery-tip"></div>
                                            </div>
                                            <span id="batteryText">85%</span>
                                        </div>
                                    </div>
                                    
                                    <div class="messages-header" id="messagesHeader">
                                        <div class="avatar" id="avatar">JD</div>
                                        <div class="contact-info" id="contactInfo">
                                            <h3 id="contactNameDisplay">John Doe</h3>
                                            <p id="statusTextDisplay">Active now</p>
                                        </div>
                                    </div>
                                    
                                    <div class="messages-area" id="messagesArea">
                                        <!-- Messages will be populated here -->
                                    </div>
                                </div>
                            </div>
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
        ['contactName', 'statusText', 'carrier', 'currentTime', 'batteryLevel', 'signalStrength', 'bgColor', 'language'].forEach(id => {
            const element = this.querySelector(`#${id}`);
            element.addEventListener('input', () => this.updatePreview());
        });

        // Battery level display
        this.querySelector('#batteryLevel').addEventListener('input', (e) => {
            this.querySelector('#batteryDisplay').textContent = e.target.value + '%';
        });

        // Signal strength display
        this.querySelector('#signalStrength').addEventListener('input', (e) => {
            const strength = parseInt(e.target.value);
            const labels = ['No Signal', 'Poor', 'Fair', 'Good', 'Excellent'];
            this.querySelector('#signalDisplay').textContent = labels[strength];
        });

        // Message inputs
        this.addEventListener('input', (e) => {
            if (e.target.classList.contains('message-input')) {
                this.updateMessagesFromInputs();
                this.updatePreview();
            }
        });

        this.renderMessageInputs();
    }

    renderMessageInputs() {
        const container = this.querySelector('#messagesContainer');
        container.innerHTML = '';
        
        this.messages.forEach((message, index) => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';
            messageItem.innerHTML = `
                <input type="text" class="message-input" placeholder="Enter message..." value="${message.text}">
                <div class="message-type-toggle ${message.type}" onclick="this.getRootNode().host.toggleMessageType(this, ${index})">${message.type === 'sent' ? 'Sent' : 'Received'}</div>
                <button class="remove-message" onclick="this.getRootNode().host.removeMessage(${index})">×</button>
            `;
            container.appendChild(messageItem);
        });
    }

    updateMessagesFromInputs() {
        const inputs = this.querySelectorAll('.message-input');
        inputs.forEach((input, index) => {
            if (this.messages[index]) {
                this.messages[index].text = input.value;
            }
        });
    }

    addMessage() {
        this.messages.push({ text: '', type: 'received' });
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

    updatePreview() {
        const phoneFrame = this.querySelector('#phoneFrame');
        const screen = this.querySelector('#screen');
        const statusBar = this.querySelector('#statusBar');
        const messagesHeader = this.querySelector('#messagesHeader');
        const contactInfo = this.querySelector('#contactInfo');
        const messagesArea = this.querySelector('#messagesArea');

        // Update phone model styling
        phoneFrame.className = `phone-frame ${this.currentModel}`;
        screen.className = `screen ${this.currentModel}`;
        statusBar.className = `status-bar ${this.currentModel}`;
        messagesHeader.className = `messages-header ${this.currentModel}`;
        contactInfo.className = `contact-info ${this.currentModel}`;

        // Update contact info
        const contactName = this.querySelector('#contactName').value;
        this.querySelector('#contactNameDisplay').textContent = contactName;
        this.querySelector('#statusTextDisplay').textContent = this.querySelector('#statusText').value;
        
        // Update avatar
        const initials = contactName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        this.querySelector('#avatar').textContent = initials;

        // Update time
        const time = this.querySelector('#currentTime').value;
        const timeFormatted = this.formatTime(time);
        this.querySelector('#timeDisplay').textContent = timeFormatted;

        // Update carrier
        this.querySelector('#carrierDisplay').textContent = this.querySelector('#carrier').value;

        // Update battery
        const batteryLevel = this.querySelector('#batteryLevel').value;
        this.querySelector('#batteryText').textContent = batteryLevel + '%';
        this.querySelector('.battery-fill').style.width = batteryLevel + '%';
        this.querySelector('#batteryIcon').style.display = this.showBattery ? 'flex' : 'none';
        this.querySelector('#batteryText').style.display = this.showBattery ? 'inline' : 'none';

        // Update signal
        const signalStrength = this.querySelector('#signalStrength').value;
        const signalBars = this.querySelectorAll('.signal-bar');
        signalBars.forEach((bar, index) => {
            bar.style.opacity = index < signalStrength ? '1' : '0.3';
            if (this.currentModel === 'android') {
                bar.classList.add('android');
            }
        });
        this.querySelector('#signalBars').style.display = this.showSignal ? 'flex' : 'none';

        // Update WiFi
        this.querySelector('#wifiIcon').style.display = this.showWifi ? 'block' : 'none';

        // Update background
        const bgColor = this.querySelector('#bgColor').value;
        if (bgColor !== '#ffffff') {
            messagesArea.style.backgroundColor = bgColor;
            messagesArea.classList.add('custom-bg');
        } else {
            messagesArea.style.backgroundColor = '';
            messagesArea.classList.remove('custom-bg');
        }

        // Update messages
        this.updateMessages();
    }

    updateMessages() {
        const messagesArea = this.querySelector('#messagesArea');
        messagesArea.innerHTML = '';

        if (this.messages.length === 0 || this.messages.every(msg => !msg.text.trim())) {
            messagesArea.innerHTML = '<div class="empty-messages">No messages yet. Add some messages above!</div>';
            return;
        }

        this.messages.forEach((message) => {
            if (message.text.trim()) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${message.type} ${this.currentModel}`;
                
                messageDiv.innerHTML = `
                    ${message.text}
                    <div class="message-time">${this.formatTime(this.querySelector('#currentTime').value)}</div>
                `;
                
                messagesArea.appendChild(messageDiv);
            }
        });
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 % 12 || 12;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    exportImage() {
        const phoneContainer = this.querySelector('.phone-container');
        
        // Create a temporary canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set high resolution
        const scale = 2;
        canvas.width = 320 * scale;
        canvas.height = 640 * scale;
        ctx.scale(scale, scale);
        
        // For now, show a simple alert as html2canvas would need to be loaded externally
        alert('To export as image, you would need to integrate html2canvas library. For now, please take a screenshot of the phone preview.');
        
        // In a real implementation, you would use:
        // html2canvas(phoneContainer).then(canvas => {
        //     const link = document.createElement('a');
        //     link.download = 'fake-text-message.png';
        //     link.href = canvas.toDataURL();
        //     link.click();
        // });
    }
}

// Register the custom element
customElements.define('fake-text-creator', FakeTextCreator);
