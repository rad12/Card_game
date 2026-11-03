// @ts-nocheck
/* eslint-disable */

// ==========================================
// ========= متغيرات الاتصال ==============
// ==========================================

var currentMethod = '';
var roomCode = '';
var myPlayerNumber = 0;
var roomRef = null;
var isFirebaseReady = false;
var peerHost = null;
var peerConnection = null;
var peerDataChannel = null;
var html5QrScanner = null;

// ==========================================
// ========= التحقق من Firebase ============
// ==========================================

function checkFirebase() {
    try {
        firebase.app();
        isFirebaseReady = true;
        return true;
    } catch(e) {
        isFirebaseReady = false;
        showToast('⚠️ Firebase غير مهيأ!');
        return false;
    }
}

// ==========================================
// ========= اختيار الطريقة ===============
// ==========================================

function selectMethod(method) {
    currentMethod = method;

    if (method === 'firebase') {
        checkFirebase();
        showScreen('screen-firebase');
    }

    if (method === 'wifi') {
        showScreen('screen-wifi');
        getLocalIP(function(ip) {
            var el = document.getElementById('wifi-my-ip');
            if (el) {
                el.textContent = 'IP جهازك: ' + ip;
            }
        });
    }

    if (method === 'qr') {
        showScreen('screen-qr');
    }
}

// ==========================================
// ======= الطريقة 1: Firebase =============
// ==========================================

function createRoomFirebase() {
    if (!checkFirebase()) {
        showToast('❌ Firebase غير متاح!');
        return;
    }

    roomCode = generateCode();
    myPlayerNumber = 1;
    Game.isOnline = true;

    // إعداد شاشة الانتظار
    var methodIcon = document.getElementById(
        'waiting-method-icon'
    );
    var codeEl = document.getElementById('display-room-code');
    var codeArea = document.getElementById('waiting-code-area');
    var qrArea = document.getElementById('qr-container');
    var wifiArea = document.getElementById('wifi-info-display');
    var msgEl = document.getElementById('waiting-msg');

    if (methodIcon) methodIcon.textContent = '☁️';
    if (codeEl) codeEl.textContent = roomCode;
    if (codeArea) codeArea.style.display = 'block';
    if (qrArea) qrArea.style.display = 'none';
    if (wifiArea) wifiArea.style.display = 'none';
    if (msgEl) {
        msgEl.textContent = 'في انتظار اللاعب الثاني...';
    }

    showScreen('screen-waiting');

    // إنشاء الغرفة في Firebase
    roomRef = firebase.database().ref('rooms/' + roomCode);
    roomRef.set({
        status: 'waiting',
        method: 'firebase',
        createdAt: Date.now(),
        player1: {
            connected: true,
            name: PlayerNames.p1,
            hand: [],
            tokens: 10,
            ready: false,
            offered: -1
        },
        player2: {
            connected: false,
            name: PlayerNames.p2,
            hand: [],
            tokens: 10,
            ready: false,
            offered: -1
        },
        round: 1,
        offers: { p1: -1, p2: -1 },
        gameStarted: false
    });

    roomRef.onDisconnect().update({
        'player1/connected': false
    });

    // الاستماع لانضمام اللاعب 2
    roomRef.child('player2/connected').on(
        'value',
        function(snap) {
            if (snap.val() === true) {
                if (msgEl) {
                    msgEl.textContent =
                        '✅ انضم اللاعب 2! جاري البدء...';
                }
                setTimeout(function() {
                    startOnlineSetup();
                }, 1500);
            }
        }
    );
}

function joinRoomFirebase() {
    if (!checkFirebase()) {
        showToast('❌ Firebase غير متاح!');
        return;
    }

    var inputEl = document.getElementById('firebase-code-input');
    if (!inputEl) return;

    var code = inputEl.value.trim().toUpperCase();

    if (code.length !== 6) {
        showToast('أدخل كود مكون من 6 أحرف!');
        return;
    }

    roomCode = code;
    myPlayerNumber = 2;
    Game.isOnline = true;

    showToast('جاري البحث عن الغرفة...');

    roomRef = firebase.database().ref('rooms/' + roomCode);

    roomRef.once('value', function(snap) {
        if (!snap.exists()) {
            showToast('❌ الغرفة غير موجودة!');
            Game.isOnline = false;
            return;
        }

        var data = snap.val();

        if (data.status !== 'waiting') {
            showToast('❌ الغرفة ممتلئة أو اللعبة بدأت!');
            Game.isOnline = false;
            return;
        }

        // الانضمام للغرفة
        roomRef.child('player2').update({
            connected: true,
            name: PlayerNames.p2,
            tokens: 10,
            ready: false,
            offered: -1
        });

        roomRef.onDisconnect().update({
            'player2/connected': false
        });

        // استقبال اسم اللاعب 1
        var p1Name = data.player1 && data.player1.name ?
            data.player1.name : 'اللاعب 1';
        PlayerNames.p1 = p1Name;

        showToast('✅ انضممت للغرفة!');
        setTimeout(function() {
            startOnlineSetup();
        }, 1000);
    });
}

// ==========================================
// ======= الطريقة 2: WiFi محلي ============
// ==========================================

function createRoomWifi() {
    myPlayerNumber = 1;
    roomCode = generateCode();
    Game.isOnline = true;
    currentMethod = 'wifi';

    getLocalIP(function(ip) {
        var methodIcon = document.getElementById(
            'waiting-method-icon'
        );
        var codeEl = document.getElementById(
            'display-room-code'
        );
        var codeArea = document.getElementById(
            'waiting-code-area'
        );
        var qrArea = document.getElementById('qr-container');
        var wifiArea = document.getElementById(
            'wifi-info-display'
        );
        var hostIpEl = document.getElementById(
            'host-ip-display'
        );
        var msgEl = document.getElementById('waiting-msg');

        if (methodIcon) methodIcon.textContent = '📶';
        if (codeEl) codeEl.textContent = roomCode;
        if (codeArea) codeArea.style.display = 'block';
        if (qrArea) qrArea.style.display = 'none';
        if (hostIpEl) hostIpEl.textContent = ip;
        if (wifiArea) wifiArea.style.display = 'block';
        if (msgEl) {
            msgEl.textContent =
                'أعطِ الكود للاعب الثاني';
        }

        showScreen('screen-waiting');
        startPeerHost(roomCode);
    });
}

function joinRoomWifi() {
    var inputEl = document.getElementById('wifi-code-input');
    if (!inputEl) return;

    var code = inputEl.value.trim().toUpperCase();

    if (code.length !== 6) {
        showToast('أدخل الكود المكون من 6 أحرف!');
        return;
    }

    myPlayerNumber = 2;
    roomCode = code;
    Game.isOnline = true;
    currentMethod = 'wifi';

    showToast('جاري الاتصال...');
    connectToPeerHost(code);
}

// ===== PeerJS - المضيف =====
function startPeerHost(peerId) {
    try {
        peerHost = new Peer(peerId, { debug: 0 });

        peerHost.on('open', function(id) {
            console.log('Peer Host ID: ' + id);
        });

        peerHost.on('connection', function(conn) {
            peerDataChannel = conn;
            setupPeerEvents(conn);

            var msgEl = document.getElementById('waiting-msg');
            if (msgEl) {
                msgEl.textContent =
                    '✅ اتصل اللاعب 2! جاري البدء...';
            }

            setTimeout(function() {
                startOnlineSetup();
            }, 1500);
        });

        peerHost.on('error', function(err) {
            showToast('خطأ في الاتصال: ' + err.type);
            console.log('Peer error:', err);
        });

    } catch(e) {
        showToast('❌ PeerJS غير متاح! جرب Firebase');
        console.log('PeerJS error:', e);
    }
}

// ===== PeerJS - الضيف =====
function connectToPeerHost(hostId) {
    try {
        peerConnection = new Peer({ debug: 0 });

        peerConnection.on('open', function() {
            var conn = peerConnection.connect(hostId);
            peerDataChannel = conn;
            setupPeerEvents(conn);
        });

        peerConnection.on('error', function(err) {
            showToast('❌ فشل الاتصال! تحقق من الكود');
            console.log('Peer error:', err);
        });

    } catch(e) {
        showToast('❌ PeerJS غير متاح! جرب Firebase');
        console.log('PeerJS error:', e);
    }
}

// ===== إعداد أحداث PeerJS =====
function setupPeerEvents(conn) {
    conn.on('open', function() {
        showToast('✅ تم الاتصال!');
        if (myPlayerNumber === 2) {
            setTimeout(function() {
                startOnlineSetup();
            }, 1000);
        }
    });

    conn.on('data', function(data) {
        handlePeerMessage(data);
    });

    conn.on('close', function() {
        showToast('⚠️ انقطع اتصال المنافس!');
    });

    conn.on('error', function(err) {
        showToast('خطأ في الاتصال!');
        console.log('Connection error:', err);
    });
}

// ===== إرسال رسالة عبر PeerJS =====
function sendPeerMessage(type, data) {
    if (peerDataChannel && peerDataChannel.open) {
        peerDataChannel.send({
            type: type,
            data: data,
            from: myPlayerNumber
        });
    } else {
        console.log('PeerJS channel not open');
    }
}

// ===== معالجة رسائل PeerJS =====
function handlePeerMessage(msg) {
    if (!msg || !msg.type) return;

    var opponentIndex = myPlayerNumber === 1 ? 1 : 0;

    switch(msg.type) {

        case 'hand':
            Game.players[opponentIndex].hand = msg.data;
            checkBothHandsReady();
            break;

        case 'offer':
            Game.players[opponentIndex].offerAmount =
                msg.data;
            Game.players[opponentIndex].tokens -= msg.data;
            Game.players[opponentIndex].offered = true;
            checkBothOfferedPeer();
            break;

        case 'name':
            if (myPlayerNumber === 2) {
                PlayerNames.p1 = msg.data;
            } else {
                PlayerNames.p2 = msg.data;
            }
            break;

        case 'guess':
            handleOpponentGuess(msg.data);
            break;

        case 'question':
            handleOpponentQuestion(msg.data);
            break;

        case 'answer':
            handleOpponentAnswer(msg.data);
            break;

        default:
            console.log('Unknown message:', msg.type);
    }
}

// ===== التحقق من جهوزية الأيدي =====
function checkBothHandsReady() {
    var p1Ready = Game.players[0].hand.length === 8;
    var p2Ready = Game.players[1].hand.length === 8;

    if (p1Ready && p2Ready) {
        setTimeout(function() {
            startMainGame();
        }, 500);
    }
}

// ===== التحقق من تقديم الاثنين PeerJS =====
function checkBothOfferedPeer() {
    var p1 = Game.players[0];
    var p2 = Game.players[1];

    if (p1.offered && p2.offered) {
        resolveOffering();
    }
}

// ==========================================
// ======= الطريقة 3: QR Code ==============
// ==========================================

function createRoomQR() {
    if (!checkFirebase()) {
        showToast('❌ QR يحتاج Firebase!');
        return;
    }

    roomCode = generateCode();
    myPlayerNumber = 1;
    Game.isOnline = true;
    currentMethod = 'qr';

    var methodIcon = document.getElementById(
        'waiting-method-icon'
    );
    var codeEl = document.getElementById('display-room-code');
    var codeArea = document.getElementById('waiting-code-area');
    var wifiArea = document.getElementById('wifi-info-display');
    var qrArea = document.getElementById('qr-container');
    var qrDisplay = document.getElementById('qr-code-display');
    var msgEl = document.getElementById('waiting-msg');

    if (methodIcon) methodIcon.textContent = '📷';
    if (codeEl) codeEl.textContent = roomCode;
    if (codeArea) codeArea.style.display = 'block';
    if (wifiArea) wifiArea.style.display = 'none';

    // إنشاء QR Code
    if (qrDisplay) {
        qrDisplay.innerHTML = '';
        try {
            new QRCode(qrDisplay, {
                text: 'CARDGAME:' + roomCode,
                width: 180,
                height: 180,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            if (qrArea) qrArea.style.display = 'block';
        } catch(e) {
            if (qrArea) qrArea.style.display = 'none';
            showToast('استخدم الكود: ' + roomCode);
        }
    }

    if (msgEl) {
        msgEl.textContent =
            'اطلب من المنافس مسح الكود أو إدخاله';
    }

    showScreen('screen-waiting');

    // إنشاء الغرفة في Firebase
    roomRef = firebase.database().ref('rooms/' + roomCode);
    roomRef.set({
        status: 'waiting',
        method: 'qr',
        createdAt: Date.now(),
        player1: {
            connected: true,
            name: PlayerNames.p1,
            hand: [],
            tokens: 10,
            ready: false,
            offered: -1
        },
        player2: {
            connected: false,
            name: '',
            hand: [],
            tokens: 10,
            ready: false,
            offered: -1
        },
        round: 1,
        offers: { p1: -1, p2: -1 },
        gameStarted: false
    });

    roomRef.onDisconnect().update({
        'player1/connected': false
    });

    roomRef.child('player2/connected').on(
        'value',
        function(snap) {
            if (snap.val() === true) {
                if (msgEl) {
                    msgEl.textContent =
                        '✅ انضم اللاعب 2! جاري البدء...';
                }
                setTimeout(function() {
                    startOnlineSetup();
                }, 1500);
            }
        }
    );
}

function scanQR() {
    var scanModal = document.createElement('div');
    scanModal.className = 'modal active';
    scanModal.id = 'modal-qr-scan';
    scanModal.innerHTML =
        '<div class="modal-content" style="padding:15px">' +
        '<h2 style="color:#FFD700;margin-bottom:10px">' +
        '📷 امسح QR Code' +
        '</h2>' +
        '<div id="qr-reader"' +
        ' style="width:100%;max-width:300px;' +
        'margin:0 auto"></div>' +
        '<p style="color:#aaa;font-size:0.8em;' +
        'margin:10px 0">' +
        'وجّه الكاميرا نحو QR Code' +
        '</p>' +
        '<button class="btn-cancel"' +
        ' onclick="cancelQRScan()">' +
        'إلغاء' +
        '</button>' +
        '</div>';
    document.body.appendChild(scanModal);

    try {
        html5QrScanner = new Html5QrcodeScanner(
            'qr-reader',
            {
                fps: 10,
                qrbox: { width: 200, height: 200 },
                rememberLastUsedCamera: true
            }
        );

        html5QrScanner.render(
            function(decodedText) {
                try {
                    html5QrScanner.clear();
                } catch(e) {}
                cancelQRScan();

                if (decodedText.startsWith('CARDGAME:')) {
                    var code = decodedText.replace(
                        'CARDGAME:', ''
                    );
                    joinWithCode(code);
                } else {
                    showToast('❌ كود QR غير صحيح!');
                }
            },
            function(error) {
                // تجاهل أخطاء المسح
            }
        );
    } catch(e) {
        cancelQRScan();
        showToast('❌ الكاميرا غير متاحة!');
        showManualCodeInput();
    }
}

function cancelQRScan() {
    if (html5QrScanner) {
        try { html5QrScanner.clear(); } catch(e) {}
        html5QrScanner = null;
    }
    var modal = document.getElementById('modal-qr-scan');
    if (modal) modal.remove();
}

// ===== إدخال الكود يدوياً =====
function showManualCodeInput() {
    var modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'modal-manual-code';
    modal.innerHTML =
        '<div class="modal-content">' +
        '<h2 style="color:#FFD700">أدخل الكود يدوياً</h2>' +
        '<input type="text"' +
        ' id="manual-code-input"' +
        ' placeholder="ABC123"' +
        ' maxlength="6"' +
        ' class="room-input"' +
        ' style="margin:15px 0">' +
        '<button class="btn-modal"' +
        ' onclick="joinWithManualCode()">' +
        'انضم' +
        '</button>' +
        '<button class="btn-cancel"' +
        ' onclick="closeManualInput()">' +
        'إلغاء' +
        '</button>' +
        '</div>';
    document.body.appendChild(modal);
}

function joinWithManualCode() {
    var inputEl = document.getElementById('manual-code-input');
    if (!inputEl) return;
    var code = inputEl.value.trim().toUpperCase();
    closeManualInput();
    joinWithCode(code);
}

function closeManualInput() {
    var modal = document.getElementById('modal-manual-code');
    if (modal) modal.remove();
}

// ===== الانضمام بكود =====
function joinWithCode(code) {
    if (!code || code.length !== 6) {
        showToast('❌ كود غير صحيح!');
        return;
    }

    if (!checkFirebase()) {
        showToast('❌ Firebase غير متاح!');
        return;
    }

    roomCode = code;
    myPlayerNumber = 2;
    Game.isOnline = true;
    currentMethod = 'qr';

    roomRef = firebase.database().ref('rooms/' + roomCode);

    showToast('جاري الانضمام...');

    roomRef.once('value', function(snap) {
        if (!snap.exists()) {
            showToast('❌ الغرفة غير موجودة!');
            Game.isOnline = false;
            return;
        }

        var data = snap.val();
        if (data.status !== 'waiting') {
            showToast('❌ الغرفة ممتلئة!');
            Game.isOnline = false;
            return;
        }

        // استقبال اسم اللاعب 1
        if (data.player1 && data.player1.name) {
            PlayerNames.p1 = data.player1.name;
        }

        roomRef.child('player2').update({
            connected: true,
            name: PlayerNames.p2,
            tokens: 10,
            ready: false,
            offered: -1
        });

        roomRef.onDisconnect().update({
            'player2/connected': false
        });

        showToast('✅ تم الانضمام!');
        setTimeout(function() {
            startOnlineSetup();
        }, 1000);
    });
}

// ==========================================
// ======= دوال مشتركة للأونلاين ===========
// ==========================================

function startOnlineSetup() {
    if (roomRef) {
        roomRef.update({ status: 'playing' });
    }

    Game.isOnline = true;
    resetGame();

    // إظهار شاشة إدخال الأسماء إذا لم تُدخل
    if (PlayerNames.p1 === 'اللاعب 1' ||
        PlayerNames.p2 === 'اللاعب 2') {
        showScreen('screen-names');
    } else {
        showHandover(
            myPlayerNumber,
            'اختر 8 أوراق ورتّبها - ' +
            'لا تُري أوراقك لأحد!',
            function() {
                setupPlayerCards(0);
                listenToGameChanges();
            }
        );
    }
}

// ===== الاستماع للتغييرات في Firebase =====
function listenToGameChanges() {
    if (!roomRef) return;

    // الاستماع للتقديم
    roomRef.child('offers').on('value', function(snap) {
        var offers = snap.val();
        if (!offers) return;

        if (offers.p1 >= 0 && offers.p2 >= 0) {
            handleFirebaseOffers(offers.p1, offers.p2);
        }
    });

    // الاستماع لأوراق المنافس
    var oppNum = myPlayerNumber === 1 ? 2 : 1;
    roomRef.child('player' + oppNum + '/hand').on(
        'value',
        function(snap) {
            var handData = snap.val();
            if (handData && handData.length === 8) {
                Game.players[oppNum - 1].hand = handData;
                checkBothHandsReady();
            }
        }
    );

    // الاستماع لانقطاع المنافس
    var oppKey = myPlayerNumber === 1 ?
        'player2' : 'player1';
    roomRef.child(oppKey + '/connected').on(
        'value',
        function(snap) {
            if (snap.val() === false) {
                showToast('⚠️ انقطع اتصال المنافس!');
            }
        }
    );

    // الاستماع لرموز المنافس
    roomRef.child('player' + oppNum + '/tokens').on(
        'value',
        function(snap) {
            if (snap.val() !== null) {
                Game.players[oppNum - 1].tokens = snap.val();
                updateTokensDisplay();
            }
        }
    );
}

// ===== معالجة التقديم عبر Firebase =====
function handleFirebaseOffers(p1Offer, p2Offer) {
    // إعادة ضبط التقديم
    if (roomRef) {
        roomRef.child('offers').set({ p1: -1, p2: -1 });
    }

    Game.players[0].offerAmount = p1Offer;
    Game.players[0].tokens -= p1Offer;
    Game.players[1].offerAmount = p2Offer;
    Game.players[1].tokens -= p2Offer;

    // تحديث الرموز في Firebase
    if (roomRef) {
        roomRef.child('player1/tokens').set(
            Game.players[0].tokens
        );
        roomRef.child('player2/tokens').set(
            Game.players[1].tokens
        );
    }

    updateTokensDisplay();
    resolveOffering();
}

// ===== إرسال التقديم أونلاين =====
function sendOfferOnline(amount) {
    var myIndex = myPlayerNumber - 1;
    Game.players[myIndex].offerAmount = amount;
    Game.players[myIndex].offered = true;

    if (currentMethod === 'firebase' ||
        currentMethod === 'qr') {
        var key = myPlayerNumber === 1 ? 'p1' : 'p2';
        if (roomRef) {
            roomRef.child('offers/' + key).set(amount);
        }

    } else if (currentMethod === 'wifi') {
        Game.players[myIndex].tokens -= amount;
        updateTokensDisplay();
        sendPeerMessage('offer', amount);
    }
}

// ===== إرسال الأوراق أونلاين =====
function sendHandOnline(hand) {
    var handData = [];
    for (var i = 0; i < hand.length; i++) {
        handData.push({
            suit: hand[i].suit,
            value: hand[i].value,
            id: hand[i].id
        });
    }

    if (currentMethod === 'firebase' ||
        currentMethod === 'qr') {
        if (roomRef) {
            roomRef.child(
                'player' + myPlayerNumber + '/hand'
            ).set(handData);
            roomRef.child(
                'player' + myPlayerNumber + '/ready'
            ).set(true);
        }

    } else if (currentMethod === 'wifi') {
        sendPeerMessage('hand', handData);
    }

    // انتظار المنافس
    waitForOpponentOnline();
}

// ===== معالجة تخمين المنافس =====
function handleOpponentGuess(guessValues) {
    var myHand = Game.players[myPlayerNumber - 1].hand;
    var actualValues = [];
    for (var i = 0; i < myHand.length; i++) {
        actualValues.push(myHand[i].value);
    }

    var isCorrect =
        JSON.stringify(guessValues) ===
        JSON.stringify(actualValues);

    if (isCorrect) {
        var opponentNum = myPlayerNumber === 1 ? 2 : 1;
        showWinScreen(opponentNum);
    } else {
        showToast('المنافس خمّن خطأ! جولة جديدة');
        setTimeout(function() {
            endRound();
        }, 1500);
    }
}

// ===== معالجة سؤال المنافس =====
function handleOpponentQuestion(questionId) {
    var question = getQuestionById(questionId);
    if (!question) return;

    var el = document.getElementById('question-text');
    if (el) el.textContent = question.text;
    Game.currentQuestion = question;
    openModal('modal-answer');
}

// ===== معالجة إجابة المنافس =====
function handleOpponentAnswer(answer) {
    var answerText = answer ? '✅ نعم' : '❌ لا';
    showToast('أجاب المنافس: ' + answerText);
    setTimeout(function() {
        endRound();
    }, 1500);
}

// ===== إلغاء الانتظار =====
function cancelWaiting() {
    if (roomRef) {
        roomRef.remove();
        roomRef = null;
    }

    if (peerHost) {
        try { peerHost.destroy(); } catch(e) {}
        peerHost = null;
    }

    if (peerConnection) {
        try { peerConnection.destroy(); } catch(e) {}
        peerConnection = null;
    }

    if (html5QrScanner) {
        try { html5QrScanner.clear(); } catch(e) {}
        html5QrScanner = null;
    }

    Game.isOnline = false;
    roomCode = '';
    myPlayerNumber = 0;
    currentMethod = '';

    showScreen('screen-room');
}

// ==========================================
// ========= دوال مساعدة ==================
// ==========================================

// ===== توليد كود عشوائي =====
function generateCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 6; i++) {
        code += chars[
            Math.floor(Math.random() * chars.length)
        ];
    }
    return code;
}

// ===== الحصول على IP المحلي =====
function getLocalIP(callback) {
    var ip = '192.168.x.x';

    try {
        var pc = new RTCPeerConnection({
            iceServers: []
        });

        pc.createDataChannel('');

        pc.createOffer().then(function(offer) {
            return pc.setLocalDescription(offer);
        }).catch(function(e) {
            callback(ip);
        });

        pc.onicecandidate = function(ice) {
            if (!ice ||
                !ice.candidate ||
                !ice.candidate.candidate) {
                callback(ip);
                return;
            }

            var match = /(\d+\.\d+\.\d+\.\d+)/.exec(
                ice.candidate.candidate
            );

            if (match && match[1] !== '0.0.0.0') {
                ip = match[1];
                callback(ip);
                pc.onicecandidate = null;
                try { pc.close(); } catch(e) {}
            }
        };

        setTimeout(function() {
            callback(ip);
        }, 3000);

    } catch(e) {
        callback(ip);
    }
}

// ===== تنظيف عند إغلاق الصفحة =====
window.addEventListener('beforeunload', function() {
    if (roomRef && myPlayerNumber > 0) {
        var myKey = myPlayerNumber === 1 ?
            'player1' : 'player2';
        try {
            roomRef.child(myKey + '/connected').set(false);
        } catch(e) {}
    }

    if (peerHost) {
        try { peerHost.destroy(); } catch(e) {}
    }

    if (peerConnection) {
        try { peerConnection.destroy(); } catch(e) {}
    }
});