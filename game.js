// @ts-nocheck
/* eslint-disable */

// ==========================================
// ========= حالة اللعبة ==================
// ==========================================

var Game = {
    players: [
        {
            id: 1,
            tokens: 10,
            hand: [],
            offered: false,
            offerAmount: 0
        },
        {
            id: 2,
            tokens: 10,
            hand: [],
            offered: false,
            offerAmount: 0
        }
    ],
    round: 1,
    currentWinner: null,
    timerInterval: null,
    timerCount: 30,
    setupPhase: 0,
    deck: [],
    selectedCards: [],
    arrangePhase: 0,
    arrangeSlots: [],
    selectedForPlace: null,
    arrangeCards: [],
    isOnline: false,
    isLocalGame: false,
    readyTimerInterval: null
};

// ==========================================
// ========= أسماء اللاعبين ===============
// ==========================================

var PlayerNames = {
    p1: 'اللاعب 1',
    p2: 'اللاعب 2'
};

var currentActivePlayer = 1;
var warningShownP1 = false;
var warningShownP2 = false;

// ==========================================
// ========= إدخال الأسماء ================
// ==========================================

function confirmNames() {
    var name1 = document.getElementById('name-p1')
                        .value.trim();
    var name2 = document.getElementById('name-p2')
                        .value.trim();

    if (!name1) {
        showToast('أدخل اسم اللاعب الأول!');
        document.getElementById('name-p1').focus();
        return;
    }

    if (!name2) {
        showToast('أدخل اسم اللاعب الثاني!');
        document.getElementById('name-p2').focus();
        return;
    }

    if (name1 === name2) {
        showToast('يجب أن يكون الاسمان مختلفين!');
        return;
    }

    PlayerNames.p1 = name1;
    PlayerNames.p2 = name2;

    startLocalGame();
}

// ==========================================
// ========= تسليم الهاتف =================
// ==========================================

function showHandover(playerNum, message, callback) {
    var name  = playerNum === 1 ?
        PlayerNames.p1 : PlayerNames.p2;

    var nameEl = document.getElementById('handover-name');
    var msgEl  = document.getElementById('handover-msg');
    var btnEl  = document.getElementById('btn-handover-ready');

    if (nameEl) nameEl.textContent = name;
    if (msgEl)  msgEl.textContent  = message || 'جاهز للعب؟';
    if (btnEl)  btnEl.textContent  = '✓ أنا جاهز';

    window._handoverCallback = callback;
    showScreen('screen-handover');
}

function handoverReady() {
    if (window._handoverCallback) {
        var cb = window._handoverCallback;
        window._handoverCallback = null;
        cb();
    }
}

// ==========================================
// ========= تغطية الشاشة =================
// ==========================================

function showCover(playerNum, message, callback) {
    var name       = playerNum === 1 ?
        PlayerNames.p1 : PlayerNames.p2;
    var nextPlayer = playerNum === 1 ? 2 : 1;
    var nextName   = nextPlayer === 1 ?
        PlayerNames.p1 : PlayerNames.p2;

    var titleEl = document.getElementById('cover-title');
    var msgEl   = document.getElementById('cover-msg');
    var btnEl   = document.getElementById('btn-pass-phone');

    if (titleEl) {
        titleEl.textContent = 'انتهى دور ' + name + '!';
    }
    if (msgEl) {
        msgEl.textContent = message ||
            'سلّم الهاتف للاعب التالي';
    }
    if (btnEl) {
        btnEl.textContent =
            '📱 سلّم الهاتف لـ ' + nextName;
    }

    window._coverCallback = callback;
    showScreen('screen-cover');
}

function passPhoneToNext() {
    if (window._coverCallback) {
        var cb = window._coverCallback;
        window._coverCallback = null;
        cb();
    }
}

// ==========================================
// ========= تحذير الرموز =================
// ==========================================

function showWarningIfNeeded(playerNum) {
    var tokens = Game.players[playerNum - 1].tokens;
    var name   = playerNum === 1 ?
        PlayerNames.p1 : PlayerNames.p2;

    if (tokens <= 5 && tokens > 0) {
        if (playerNum === 1 && !warningShownP1) {
            warningShownP1 = true;
            showWarningPopup(name, tokens);
        } else if (playerNum === 2 && !warningShownP2) {
            warningShownP2 = true;
            showWarningPopup(name, tokens);
        }
    }

    if (tokens > 5) {
        if (playerNum === 1) warningShownP1 = false;
        if (playerNum === 2) warningShownP2 = false;
    }
}

function showWarningPopup(name, tokens) {
    var existing = document.getElementById('warning-popup');
    if (existing) existing.remove();

    var popup = document.createElement('div');
    popup.className = 'warning-popup';
    popup.id = 'warning-popup';
    popup.innerHTML =
        '<h3>⚠️ تحذير!</h3>' +
        '<p style="color:#FFD700;font-weight:bold">' +
        name +
        '</p>' +
        '<p style="color:#FF9800;font-size:1.3em;' +
        'font-weight:bold;margin:8px 0">' +
        'لديك ' + tokens + ' رموز فقط!' +
        '</p>' +
        '<p style="color:#aaa;font-size:0.85em">' +
        'استخدمها بحكمة' +
        '</p>';

    document.body.appendChild(popup);

    setTimeout(function() {
        if (popup && popup.parentNode) {
            popup.remove();
        }
    }, 3000);
}

// ==========================================
// ========= بدء اللعبة ===================
// ==========================================

function startLocalGame() {
    Game.isOnline       = false;
    Game.isLocalGame    = true;
    currentActivePlayer = 1;
    warningShownP1      = false;
    warningShownP2      = false;
    resetGame();

    showHandover(
        1,
        'اختر 8 أوراق ورتّبها - لا تُري أوراقك لأحد!',
        function() {
            setupPlayerCards(0);
        }
    );
}

function resetGame() {
    Game.players[0].tokens      = 10;
    Game.players[1].tokens      = 10;
    Game.players[0].hand        = [];
    Game.players[1].hand        = [];
    Game.players[0].offered     = false;
    Game.players[1].offered     = false;
    Game.players[0].offerAmount = 0;
    Game.players[1].offerAmount = 0;
    Game.round                  = 1;
    Game.currentWinner          = null;
    Game.selectedCards          = [];
    Game.arrangeSlots           = [];
    Game.selectedForPlace       = null;
    Game.arrangeCards           = [];
    warningShownP1 = false;
    warningShownP2 = false;
}

// ==========================================
// ========= شاشة الإعداد =================
// ==========================================

function setupPlayerCards(playerIndex) {
    Game.setupPhase    = playerIndex;
    Game.selectedCards = [];

    var playerName = playerIndex === 0 ?
        PlayerNames.p1 : PlayerNames.p2;

    var titleEl    = document.getElementById('setup-title');
    var subtitleEl = document.getElementById('setup-subtitle');
    var countEl    = document.getElementById('selected-count');
    var selectedEl = document.getElementById('selected-cards');
    var btn        = document.getElementById('btn-confirm-setup');

    if (titleEl) {
        titleEl.textContent =
            playerName + ' - اختر 8 أوراق';
    }
    if (subtitleEl) {
        subtitleEl.textContent =
            'اختر 8 أوراق بالترتيب الذي تريده';
    }
    if (countEl)    countEl.textContent  = '0';
    if (selectedEl) selectedEl.innerHTML = '';
    if (btn) {
        btn.disabled    = true;
        btn.textContent = 'اختر 8 أوراق أولاً';
    }

    var deckContainer = document.getElementById('deck-cards');
    if (deckContainer) deckContainer.innerHTML = '';

    var suitKeys = ['hearts', 'diamonds', 'clubs', 'spades'];

    for (var s = 0; s < suitKeys.length; s++) {
        var suit     = suitKeys[s];
        var suitInfo = SUITS[suit];

        var groupTitle = document.createElement('div');
        groupTitle.className = 'suit-group-title';
        groupTitle.innerHTML =
            '<span class="suit-title-symbol ' + suit + '">' +
            suitInfo.symbol + '</span>' +
            '<span class="suit-title-name">' +
            suitInfo.name + '</span>';
        deckContainer.appendChild(groupTitle);

        var row = document.createElement('div');
        row.className = 'suit-row';

        for (var v = 1; v <= 13; v++) {
            var card = {
                suit:  suit,
                value: v,
                id:    suit + '_' + v
            };

            var cardEl = createCardElement(card, true, false);

            (function(c, el) {
                el.addEventListener('click', function() {
                    toggleCardSelection(c, el);
                });
            })(card, cardEl);

            row.appendChild(cardEl);
        }

        deckContainer.appendChild(row);
    }

    showScreen('screen-setup');
}

// ===== تبديل اختيار الورقة =====
function toggleCardSelection(card, element) {
    var index = -1;
    for (var i = 0; i < Game.selectedCards.length; i++) {
        if (Game.selectedCards[i].id === card.id) {
            index = i;
            break;
        }
    }

    if (index === -1) {
        if (Game.selectedCards.length >= 8) {
            showToast('لقد اخترت 8 أوراق بالفعل!');
            return;
        }
        Game.selectedCards.push(card);
        element.classList.add('selected');
    } else {
        Game.selectedCards.splice(index, 1);
        element.classList.remove('selected');
    }

    updateSelectedDisplay();
}

// ===== تحديث عرض الأوراق المختارة =====
function updateSelectedDisplay() {
    var count   = Game.selectedCards.length;
    var countEl = document.getElementById('selected-count');
    if (countEl) countEl.textContent = count;

    var container = document.getElementById('selected-cards');
    if (!container) return;
    container.innerHTML = '';

    for (var i = 0; i < Game.selectedCards.length; i++) {
        (function(card, index) {
            var cardEl = createCardElement(card, true, false);
            cardEl.style.position = 'relative';

            var numBadge = document.createElement('div');
            numBadge.style.cssText =
                'position:absolute;top:-8px;right:-8px;' +
                'background:#FFD700;color:#000;' +
                'border-radius:50%;width:18px;height:18px;' +
                'font-size:0.7em;display:flex;' +
                'align-items:center;justify-content:center;' +
                'font-weight:bold;z-index:2;';
            numBadge.textContent = index + 1;
            cardEl.appendChild(numBadge);
            container.appendChild(cardEl);
        })(Game.selectedCards[i], i);
    }

    var btn = document.getElementById('btn-confirm-setup');
    if (btn) {
        if (count === 8) {
            btn.disabled    = false;
            btn.textContent = 'تأكيد الاختيار ✓';
        } else {
            btn.disabled    = true;
            btn.textContent =
                'اختر ' + (8 - count) + ' أوراق أخرى';
        }
    }
}

// ===== تأكيد الاختيار =====
function confirmSetup() {
    if (Game.selectedCards.length !== 8) {
        showToast('اختر 8 أوراق أولاً!');
        return;
    }
    showToast('✓ الآن رتّب أوراقك');
    setTimeout(function() {
        goToArrange(Game.setupPhase);
    }, 600);
}

// ==========================================
// ========= شاشة الترتيب =================
// ==========================================

function goToArrange(playerIndex) {
    Game.arrangePhase     = playerIndex;
    Game.arrangeSlots     = new Array(8).fill(null);
    Game.selectedForPlace = null;
    Game.arrangeCards     = Game.selectedCards.slice();

    var playerName = playerIndex === 0 ?
        PlayerNames.p1 : PlayerNames.p2;

    var titleEl = document.getElementById('arrange-title');
    var msgEl   = document.getElementById('arrange-msg');
    var btn     = document.getElementById('btn-confirm-arrange');

    if (titleEl) {
        titleEl.textContent =
            playerName + ' - رتّب أوراقك';
    }
    if (msgEl) {
        msgEl.textContent = '';
        msgEl.className   = 'arrange-msg';
    }
    if (btn) btn.disabled = true;

    buildSlots();
    buildArrangeCards();
    showScreen('screen-arrange');
}

// ===== بناء المواضع الفارغة =====
function buildSlots() {
    var container = document.getElementById('arrange-slots');
    if (!container) return;
    container.innerHTML = '';

    for (var i = 0; i < 8; i++) {
        var slot = document.createElement('div');
        slot.className         = 'slot';
        slot.dataset.slotIndex = i;

        var num = document.createElement('div');
        num.className   = 'slot-number';
        num.textContent = i + 1;
        slot.appendChild(num);

        (function(slotEl, index) {
            slotEl.addEventListener('click', function() {
                placeCardInSlot(index);
            });
        })(slot, i);

        container.appendChild(slot);
    }
}

// ===== بناء الأوراق للترتيب =====
function buildArrangeCards() {
    var container = document.getElementById('arrange-cards');
    if (!container) return;
    container.innerHTML = '';

    for (var i = 0; i < Game.arrangeCards.length; i++) {
        (function(card, idx) {
            var cardEl = createCardElement(card, true, false);
            cardEl.dataset.arrangeIndex = idx;

            cardEl.addEventListener('click', function() {
                selectCardForPlace(card, cardEl, idx);
            });

            container.appendChild(cardEl);
        })(Game.arrangeCards[i], i);
    }
}

// ===== تحديد ورقة للوضع =====
function selectCardForPlace(card, element, index) {
    if (element.classList.contains('placed')) return;

    var allCards = document.querySelectorAll(
        '#arrange-cards .card'
    );
    for (var i = 0; i < allCards.length; i++) {
        allCards[i].classList.remove('picking');
    }

    if (Game.selectedForPlace &&
        Game.selectedForPlace.card.id === card.id) {
        Game.selectedForPlace = null;
        clearSlotsReady();
        var msgEl = document.getElementById('arrange-msg');
        if (msgEl) msgEl.textContent = '';
        return;
    }

    element.classList.add('picking');
    Game.selectedForPlace = {
        card: card, element: element, index: index
    };

    highlightEmptySlots();

    var valueDisplay = VALUES[card.value].display;
    var suitSymbol   = SUITS[card.suit].symbol;
    var msg = document.getElementById('arrange-msg');
    if (msg) {
        msg.textContent =
            'محدد: ' + valueDisplay + ' ' +
            suitSymbol + ' ← اختر موضعه';
        msg.className = 'arrange-msg';
    }
}

// ===== إضاءة المواضع الفارغة =====
function highlightEmptySlots() {
    var slots = document.querySelectorAll('.slot');
    for (var i = 0; i < slots.length; i++) {
        if (!Game.arrangeSlots[i]) {
            slots[i].classList.add('ready');
        }
    }
}

// ===== إطفاء إضاءة المواضع =====
function clearSlotsReady() {
    var slots = document.querySelectorAll('.slot');
    for (var i = 0; i < slots.length; i++) {
        slots[i].classList.remove('ready');
    }
}

// ===== وضع الورقة في موضع =====
function placeCardInSlot(slotIndex) {
    if (!Game.selectedForPlace) {
        showToast('اختر ورقة أولاً!');
        return;
    }

    if (Game.arrangeSlots[slotIndex] !== null) {
        showToast('هذا الموضع ممتلئ!');
        return;
    }

    var card   = Game.selectedForPlace.card;
    var cardEl = Game.selectedForPlace.element;

    Game.arrangeSlots[slotIndex] = card;

    var slotEl = document.querySelector(
        '.slot[data-slot-index="' + slotIndex + '"]'
    );
    if (!slotEl) return;

    slotEl.innerHTML = '';
    slotEl.classList.add('filled');
    slotEl.classList.remove('ready');

    var num = document.createElement('div');
    num.className   = 'slot-number';
    num.textContent = slotIndex + 1;
    slotEl.appendChild(num);

    var miniCard = createCardElement(card, false, false);
    miniCard.style.cssText =
        'width:100%;height:100%;border-radius:5px;' +
        'border:none;box-shadow:none;' +
        'cursor:pointer;flex-shrink:0;';

    (function(sIdx, c, cEl) {
        miniCard.addEventListener('click', function(e) {
            e.stopPropagation();
            removeCardFromSlot(sIdx, c, cEl);
        });
    })(slotIndex, card, cardEl);

    slotEl.appendChild(miniCard);

    cardEl.classList.add('placed');
    cardEl.classList.remove('picking');

    Game.selectedForPlace = null;
    clearSlotsReady();

    var filled = 0;
    for (var i = 0; i < Game.arrangeSlots.length; i++) {
        if (Game.arrangeSlots[i] !== null) filled++;
    }

    var msgEl = document.getElementById('arrange-msg');
    if (msgEl) {
        msgEl.textContent =
            '✓ تم وضع ' + filled + ' من 8 أوراق';
        msgEl.className = 'arrange-msg';
    }

    if (filled === 8) {
        checkArrangeValidity();
    }
}

// ===== إزالة ورقة من موضع =====
function removeCardFromSlot(slotIndex, card, originalCardEl) {
    Game.arrangeSlots[slotIndex] = null;

    var slotEl = document.querySelector(
        '.slot[data-slot-index="' + slotIndex + '"]'
    );

    if (slotEl) {
        slotEl.innerHTML = '';
        slotEl.classList.remove('filled');

        var num = document.createElement('div');
        num.className   = 'slot-number';
        num.textContent = slotIndex + 1;
        slotEl.appendChild(num);
    }

    if (originalCardEl) {
        originalCardEl.classList.remove('placed');
    }

    var filled = 0;
    for (var i = 0; i < Game.arrangeSlots.length; i++) {
        if (Game.arrangeSlots[i] !== null) filled++;
    }

    var msgEl = document.getElementById('arrange-msg');
    if (msgEl) {
        msgEl.textContent = filled > 0 ?
            '✓ تم وضع ' + filled + ' من 8 أوراق' : '';
        msgEl.className = 'arrange-msg';
    }

    var btn = document.getElementById('btn-confirm-arrange');
    if (btn) btn.disabled = true;
}

// ===== التحقق من صحة الترتيب =====
function checkArrangeValidity() {
    var hand = [];
    for (var i = 0; i < Game.arrangeSlots.length; i++) {
        if (Game.arrangeSlots[i] !== null) {
            hand.push(Game.arrangeSlots[i]);
        }
    }

    var result = validateHandOrder(hand);
    var msgEl  = document.getElementById('arrange-msg');
    var btn    = document.getElementById('btn-confirm-arrange');

    if (result.valid) {
        if (msgEl) {
            msgEl.textContent = '✅ الترتيب صحيح! اضغط تأكيد';
            msgEl.className   = 'arrange-msg';
        }
        if (btn) btn.disabled = false;
    } else {
        if (msgEl) {
            msgEl.textContent = '❌ ' + result.message;
            msgEl.className   = 'arrange-msg error';
        }
        if (btn) btn.disabled = true;
    }
}

// ===== إعادة الترتيب =====
function resetArrange() {
    Game.arrangeSlots     = new Array(8).fill(null);
    Game.selectedForPlace = null;
    buildSlots();
    buildArrangeCards();

    var msgEl = document.getElementById('arrange-msg');
    if (msgEl) {
        msgEl.textContent = '';
        msgEl.className   = 'arrange-msg';
    }

    var btn = document.getElementById('btn-confirm-arrange');
    if (btn) btn.disabled = true;
}

// ===== تأكيد الترتيب =====
function confirmArrange() {
    var hand = [];
    for (var i = 0; i < Game.arrangeSlots.length; i++) {
        hand.push(Game.arrangeSlots[i]);
    }
    Game.players[Game.arrangePhase].hand = hand;

    if (Game.isOnline) {
        if (typeof sendHandOnline === 'function') {
            sendHandOnline(hand);
        }
        return;
    }

    if (Game.arrangePhase === 0) {
        showCover(
            1,
            'لا تُري أوراقك لـ ' + PlayerNames.p2 + '!',
            function() {
                showHandover(
                    2,
                    'اختر 8 أوراق ورتّبها - ' +
                    'لا تُري أوراقك لأحد!',
                    function() {
                        setupPlayerCards(1);
                    }
                );
            }
        );
    } else {
        showCover(
            2,
            'انتهى الإعداد - تبدأ اللعبة الآن!',
            function() {
                showHandover(
                    1,
                    'دورك الأول - قدّم رموزك!',
                    function() {
                        startMainGame();
                    }
                );
            }
        );
    }
}

// ===== انتظار المنافس أونلاين =====
function waitForOpponentOnline() {
    showToast('في انتظار المنافس لترتيب أوراقه...');
    var btn = document.getElementById('btn-confirm-arrange');
    if (btn) {
        btn.disabled    = true;
        btn.textContent = 'في انتظار المنافس...';
    }
}

// ==========================================
// ========= اللعبة الرئيسية ==============
// ==========================================

function startMainGame() {
    showScreen('screen-game');
    renderGameBoard();
    resetOffering();
}

// ===== رسم لوحة اللعبة =====
function renderGameBoard() {
    var nameEl1 = document.getElementById('name-display-1');
    var nameEl2 = document.getElementById('name-display-2');
    if (nameEl1) nameEl1.textContent = PlayerNames.p1;
    if (nameEl2) nameEl2.textContent = PlayerNames.p2;

    var cards1 = document.getElementById('cards1');
    if (cards1) {
        cards1.innerHTML = '';
        for (var i = 0; i < Game.players[0].hand.length; i++) {
            cards1.appendChild(
                createCardElement(
                    Game.players[0].hand[i], false, false
                )
            );
        }
    }

    var cards2 = document.getElementById('cards2');
    if (cards2) {
        cards2.innerHTML = '';
        for (var j = 0; j < Game.players[1].hand.length; j++) {
            cards2.appendChild(
                createCardElement(null, false, true)
            );
        }
    }

    updateTokensDisplay();
    updateRoundDisplay();
}

// ===== تحديث عرض الرموز =====
function updateTokensDisplay() {
    // اللاعب 1 - رموزه ظاهرة
    var tokenEl1 = document.getElementById('tokens1');
    if (tokenEl1) {
        tokenEl1.textContent =
            '🪙 ' + Game.players[0].tokens;
    }

    var light1 = document.getElementById('warning1');
    if (light1) {
        if (Game.players[0].tokens <= 5) {
            light1.classList.add('active');
        } else {
            light1.classList.remove('active');
        }
    }

    // اللاعب 2 - رموزه مخفية
    var tokenEl2 = document.getElementById('tokens2');
    if (tokenEl2) {
        tokenEl2.textContent = '🪙 ••••';
    }

    var light2 = document.getElementById('warning2');
    if (light2) {
        if (Game.players[1].tokens <= 5) {
            light2.classList.add('active');
        } else {
            light2.classList.remove('active');
        }
    }

    // شاشة اللاعب 2
    var tokenEl2p2 = document.getElementById('tokens2-p2');
    if (tokenEl2p2) {
        tokenEl2p2.textContent =
            '🪙 ' + Game.players[1].tokens;
    }

    var light2p2 = document.getElementById('warning2-p2');
    if (light2p2) {
        if (Game.players[1].tokens <= 5) {
            light2p2.classList.add('active');
        } else {
            light2p2.classList.remove('active');
        }
    }

    var light1p2 = document.getElementById('warning1-p2');
    if (light1p2) {
        if (Game.players[0].tokens <= 5) {
            light1p2.classList.add('active');
        } else {
            light1p2.classList.remove('active');
        }
    }

    // تحديث الشريط
    var slider = document.getElementById('token-slider');
    if (!slider) return;

    var myTokens;
    try {
        if (Game.isOnline &&
            typeof myPlayerNumber !== 'undefined' &&
            myPlayerNumber >= 1 &&
            myPlayerNumber <= 2) {
            myTokens =
                Game.players[myPlayerNumber - 1].tokens;
        } else {
            myTokens = Game.players[0].tokens;
        }
    } catch(e) {
        myTokens = Game.players[0].tokens;
    }

    slider.max = myTokens;
    if (parseInt(slider.value) > myTokens) {
        slider.value = myTokens;
        updateSlider(slider.value);
    }
}

// ===== تحديث عرض الجولة =====
function updateRoundDisplay() {
    var el = document.getElementById('round-num');
    if (el) el.textContent = 'الجولة: ' + Game.round;

    var elP2 = document.getElementById('round-num-p2');
    if (elP2) elP2.textContent = 'الجولة: ' + Game.round;
}

// ===== تحديث قيمة الشريط =====
function updateSlider(value) {
    var el = document.getElementById('offer-value');
    if (el) el.textContent = value;
}

function updateSliderP2(value) {
    var el = document.getElementById('offer-value-p2');
    if (el) el.textContent = value;
}

// ===== إعادة ضبط التقديم =====
function resetOffering() {
    for (var i = 0; i < Game.players.length; i++) {
        Game.players[i].offered     = false;
        Game.players[i].offerAmount = 0;
    }

    var btn = document.getElementById('btn-offer');
    if (btn) {
        btn.disabled    = false;
        btn.textContent = 'تقديم الرموز';
    }

    var slider = document.getElementById('token-slider');
    if (slider) {
        slider.value = 0;
        updateSlider(0);
    }

    var statusEl = document.getElementById('status-msg');
    if (statusEl) statusEl.textContent = 'قدّم رموزك';

    startTimer();
}

// ===== المؤقت للاعب 1 =====
function startTimer() {
    clearInterval(Game.timerInterval);
    Game.timerCount = 30;

    var timerEl = document.getElementById('timer');
    if (!timerEl) return;

    timerEl.textContent = '30';
    timerEl.classList.remove('warning');

    Game.timerInterval = setInterval(function() {
        Game.timerCount--;

        if (timerEl) {
            timerEl.textContent = Game.timerCount;
        }

        if (Game.timerCount <= 10) {
            if (timerEl) timerEl.classList.add('warning');
        }

        if (Game.timerCount <= 0) {
            clearInterval(Game.timerInterval);
            if (!Game.players[0].offered) {
                autoSubmitOffer();
            }
        }
    }, 1000);
}

// ===== المؤقت للاعب 2 =====
function startTimerP2() {
    clearInterval(Game.timerInterval);
    Game.timerCount = 30;

    var timerEl = document.getElementById('timer-p2');
    if (!timerEl) return;

    timerEl.textContent = '30';
    timerEl.classList.remove('warning');

    Game.timerInterval = setInterval(function() {
        Game.timerCount--;

        if (timerEl) {
            timerEl.textContent = Game.timerCount;
        }

        if (Game.timerCount <= 10) {
            if (timerEl) timerEl.classList.add('warning');
        }

        if (Game.timerCount <= 0) {
            clearInterval(Game.timerInterval);
            autoSubmitOfferP2();
        }
    }, 1000);
}

// ===== تقديم تلقائي للاعب 1 =====
function autoSubmitOffer() {
    showToast('⏰ انتهى الوقت! تم التقديم بـ 0');
    if (Game.isOnline) {
        if (typeof sendOfferOnline === 'function') {
            sendOfferOnline(0);
        }
    } else {
        Game.players[0].offerAmount = 0;
        Game.players[0].offered     = true;
        showWarningIfNeeded(1);

        showCover(
            1,
            'انتهى الوقت! قدّمت 0 رموز',
            function() {
                showHandover(
                    2,
                    'قدّم رموزك الآن',
                    function() {
                        showP2LocalOffer();
                    }
                );
            }
        );
    }
}

// ===== تقديم تلقائي للاعب 2 =====
function autoSubmitOfferP2() {
    showToast('⏰ انتهى الوقت! تم التقديم بـ 0');
    Game.players[1].offerAmount = 0;
    Game.players[1].offered     = true;
    showWarningIfNeeded(2);

    setTimeout(function() {
        showScreen('screen-game');
        updateTokensDisplay();
        resolveOffering();
    }, 800);
}

// ==========================================
// ===== شاشة دور اللاعب 2 الكاملة ========
// ==========================================

function showP2LocalOffer() {
    var p2Tokens = Game.players[1].tokens;
    var p1Name   = PlayerNames.p1;
    var p2Name   = PlayerNames.p2;

    var nameP1El = document.getElementById('name-display-1-p2');
    var nameP2El = document.getElementById('name-display-2-p2');
    if (nameP1El) nameP1El.textContent = p1Name;
    if (nameP2El) nameP2El.textContent = p2Name;

    var cards2El = document.getElementById('cards2-visible');
    if (cards2El) {
        cards2El.innerHTML = '';
        for (var i = 0; i < Game.players[1].hand.length; i++) {
            cards2El.appendChild(
                createCardElement(
                    Game.players[1].hand[i], false, false
                )
            );
        }
    }

    var cards1El = document.getElementById('cards1-hidden');
    if (cards1El) {
        cards1El.innerHTML = '';
        for (var j = 0; j < Game.players[0].hand.length; j++) {
            cards1El.appendChild(
                createCardElement(null, false, true)
            );
        }
    }

    var tokensEl = document.getElementById('tokens2-p2');
    if (tokensEl) {
        tokensEl.textContent = '🪙 ' + p2Tokens;
    }

    var light2 = document.getElementById('warning2-p2');
    if (light2) {
        if (p2Tokens <= 5) {
            light2.classList.add('active');
        } else {
            light2.classList.remove('active');
        }
    }

    var light1 = document.getElementById('warning1-p2');
    if (light1) {
        if (Game.players[0].tokens <= 5) {
            light1.classList.add('active');
        } else {
            light1.classList.remove('active');
        }
    }

    var roundEl = document.getElementById('round-num-p2');
    if (roundEl) {
        roundEl.textContent = 'الجولة: ' + Game.round;
    }

    var slider = document.getElementById('token-slider-p2');
    if (slider) {
        slider.max   = p2Tokens;
        slider.value = 0;
    }

    var valEl = document.getElementById('offer-value-p2');
    if (valEl) valEl.textContent = '0';

    var btn = document.getElementById('btn-offer-p2');
    if (btn) {
        btn.disabled    = false;
        btn.textContent = 'تقديم الرموز';
    }

    var statusEl = document.getElementById('status-msg-p2');
    if (statusEl) statusEl.textContent = 'قدّم رموزك';

    startTimerP2();
    showScreen('screen-game-p2');
}

// ===== تقديم اللاعب 2 =====
function submitOfferP2() {
    var slider = document.getElementById('token-slider-p2');
    if (!slider) return;

    var amount = parseInt(slider.value);

    if (amount > Game.players[1].tokens) {
        showToast('ليس لديك رموز كافية!');
        return;
    }

    clearInterval(Game.timerInterval);

    var btn = document.getElementById('btn-offer-p2');
    if (btn) {
        btn.disabled    = true;
        btn.textContent = '✓ قدّمت ' + amount + ' رموز';
    }

    var statusEl = document.getElementById('status-msg-p2');
    if (statusEl) statusEl.textContent = '✓ تم التقديم';

    Game.players[1].offerAmount = amount;
    Game.players[1].tokens     -= amount;
    Game.players[1].offered     = true;

    showWarningIfNeeded(2);

    setTimeout(function() {
        showScreen('screen-game');
        updateTokensDisplay();
        resolveOffering();
    }, 800);
}

// ===== تقديم اللاعب 1 =====
function submitOffer() {
    var slider = document.getElementById('token-slider');
    if (!slider) return;

    var amount  = parseInt(slider.value);
    var myIndex = 0;

    try {
        if (Game.isOnline &&
            typeof myPlayerNumber !== 'undefined' &&
            myPlayerNumber >= 1) {
            myIndex = myPlayerNumber - 1;
        }
    } catch(e) {
        myIndex = 0;
    }

    if (amount > Game.players[myIndex].tokens) {
        showToast('ليس لديك رموز كافية!');
        return;
    }

    clearInterval(Game.timerInterval);

    if (Game.isOnline) {
        var btn = document.getElementById('btn-offer');
        if (btn) {
            btn.disabled    = true;
            btn.textContent = '✓ قدّمت ' + amount + ' رموز';
        }
        var statusEl = document.getElementById('status-msg');
        if (statusEl) {
            statusEl.textContent = 'في انتظار المنافس...';
        }
        if (typeof sendOfferOnline === 'function') {
            sendOfferOnline(amount);
        }
        return;
    }

    Game.players[0].offerAmount = amount;
    Game.players[0].tokens     -= amount;
    Game.players[0].offered     = true;

    updateTokensDisplay();
    showWarningIfNeeded(1);

    showCover(
        1,
        'قدّمت ' + amount + ' رموز - ' +
        'لا تُخبر ' + PlayerNames.p2 + '!',
        function() {
            showHandover(
                2,
                'قدّم رموزك الآن',
                function() {
                    showP2LocalOffer();
                }
            );
        }
    );
}

// ===== معالجة نتيجة التقديم =====
function resolveOffering() {
    var p1 = Game.players[0];
    var p2 = Game.players[1];

    if (p1.offerAmount === p2.offerAmount) {
        p1.tokens += p1.offerAmount + 2;
        p2.tokens += p2.offerAmount + 2;

        updateTokensDisplay();

        var tieInfo = document.getElementById('tie-info');
        if (tieInfo) {
            tieInfo.textContent =
                'أُعيدت الرموز + 2 إضافي لكل لاعب';
        }

        openModal('modal-tie');

    } else {
        var winner = p1.offerAmount > p2.offerAmount ? 1 : 2;
        var loser  = winner === 1 ? 2 : 1;

        Game.players[loser - 1].tokens += 2;
        Game.currentWinner = winner;

        updateTokensDisplay();

        var winnerName = winner === 1 ?
            PlayerNames.p1 : PlayerNames.p2;

        var titleEl = document.getElementById(
            'modal-winner-title'
        );
        if (titleEl) {
            titleEl.textContent =
                '🏆 ' + winnerName + ' فاز بالجولة!';
        }

        openModal('modal-winner');
    }
}

// ==========================================
// ========= الأسئلة والتخمين ==============
// ==========================================

function chooseQuestion() {
    closeModal('modal-winner');
    openModal('modal-questions');
}

// ===== اختيار سؤال بالـ ID =====
function selectQuestionById(id) {
    var question = getQuestionById(id);
    if (!question) {
        showToast('السؤال غير موجود!');
        return;
    }
    closeModal('modal-questions');
    askQuestion(question);
}

// ===== طرح السؤال =====
function askQuestion(question) {
    Game.currentQuestion = question;

    var opponentIndex = Game.currentWinner === 1 ? 1 : 0;
    var opponentHand  = Game.players[opponentIndex].hand;

    closeModal('modal-answer');
    closeModal('modal-questions');

    showInteractiveQuestion(question, opponentHand);

    setTimeout(function() {
        addDoneButton();
    }, 500);
}

// ===== إضافة زر الانتهاء =====
function addDoneButton() {
    var modal = document.getElementById('interactive-modal');
    if (!modal) return;

    var content = modal.querySelector('.modal-content');
    if (!content) return;

    var oldBtn = document.getElementById('btn-question-done');
    if (oldBtn) oldBtn.remove();

    var doneBtn = document.createElement('button');
    doneBtn.id = 'btn-question-done';
    doneBtn.style.cssText =
        'background:linear-gradient(135deg,#FF9800,#e65100);' +
        'color:white;border:none;' +
        'padding:12px 20px;border-radius:20px;' +
        'font-size:1em;cursor:pointer;' +
        'width:100%;margin-top:10px;';
    doneBtn.textContent = '✓ انتهيت - استعد للجولة التالية';

    doneBtn.addEventListener('click', function() {
        closeInteractiveModal();
        showReadyTimer(function() {
            endRound();
        });
    });

    content.appendChild(doneBtn);
}

// ===== الإجابة على السؤال =====
function answerQuestion(answer) {
    closeModal('modal-answer');

    var answerText = answer ? '✅ نعم' : '❌ لا';
    showToast('الإجابة: ' + answerText);

    setTimeout(function() {
        showReadyTimer(function() {
            endRound();
        });
    }, 1000);
}

function chooseTruth() {
    closeModal('modal-winner');
    openModal('modal-guess');
    var input = document.getElementById('guess-input');
    if (input) input.value = '';
}

function submitGuess() {
    var inputEl = document.getElementById('guess-input');
    if (!inputEl) return;

    var input = inputEl.value.trim();
    if (!input) {
        showToast('أدخل تخمينك!');
        return;
    }

    var parts = input.toUpperCase().split(/\s+/);
    if (parts.length !== 8) {
        showToast('يجب إدخال 8 قيم، أدخلت ' + parts.length);
        return;
    }

    var guessValues = [];
    for (var i = 0; i < parts.length; i++) {
        var val = displayToValue(parts[i]);
        if (val === null) {
            showToast('قيم غير صحيحة! استخدم: A 2-10 J Q K');
            return;
        }
        guessValues.push(val);
    }

    var opponentIndex = Game.currentWinner === 1 ? 1 : 0;
    var opponentHand  = Game.players[opponentIndex].hand;
    var actualValues  = [];
    for (var j = 0; j < opponentHand.length; j++) {
        actualValues.push(opponentHand[j].value);
    }

    closeModal('modal-guess');

    var isCorrect =
        JSON.stringify(guessValues) ===
        JSON.stringify(actualValues);

    if (isCorrect) {
        showWinScreen(Game.currentWinner);
    } else {
        showToast('❌ تخمين خاطئ! جولة جديدة');
        setTimeout(function() {
            showReadyTimer(function() {
                endRound();
            });
        }, 1000);
    }
}

// ==========================================
// ========= مؤقت الاستعداد 45 ثانية ======
// ==========================================

function showReadyTimer(callback) {
    closeInteractiveModal();

    var overlay = document.createElement('div');
    overlay.id = 'ready-timer-overlay';
    overlay.style.cssText =
        'position:fixed;top:0;left:0;' +
        'width:100%;height:100%;' +
        'background:#0a0a1a;' +
        'z-index:3000;display:flex;' +
        'flex-direction:column;' +
        'align-items:center;' +
        'justify-content:center;' +
        'gap:20px;';

    overlay.innerHTML =
        '<div style="font-size:3em">⏳</div>' +
        '<h2 style="color:#FFD700;font-size:1.4em;' +
        'text-align:center;padding:0 20px">' +
        'استعد للجولة التالية!' +
        '</h2>' +
        '<div id="ready-timer-circle" style="' +
        'width:110px;height:110px;' +
        'border-radius:50%;' +
        'border:5px solid #4CAF50;' +
        'background:#1a1a3e;' +
        'display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;' +
        'box-shadow:0 0 20px rgba(76,175,80,0.4);' +
        'transition:border-color 0.3s,box-shadow 0.3s;">' +
        '<span id="ready-timer-count" style="' +
        'color:#4CAF50;font-size:2.8em;' +
        'font-weight:bold;line-height:1;' +
        'transition:color 0.3s;">45</span>' +
        '<span style="color:#aaa;font-size:0.55em;">' +
        'ثانية</span>' +
        '</div>' +
        '<div style="width:80%;max-width:300px;' +
        'height:8px;background:#222;' +
        'border-radius:4px;overflow:hidden;">' +
        '<div id="ready-progress-fill" style="' +
        'height:100%;width:100%;' +
        'background:#4CAF50;' +
        'border-radius:4px;' +
        'transition:width 1s linear,background 0.3s;">' +
        '</div>' +
        '</div>' +
        '<p id="ready-timer-msg" style="' +
        'color:#aaa;font-size:0.9em;' +
        'text-align:center;padding:0 30px;' +
        'transition:color 0.3s;">' +
        'سلّم الهاتف للاعب التالي وانتظر' +
        '</p>' +
        '<button id="btn-skip-ready" style="' +
        'background:transparent;' +
        'color:#555;border:1px solid #333;' +
        'padding:8px 25px;border-radius:20px;' +
        'font-size:0.85em;cursor:pointer;"' +
        ' onclick="skipReadyTimer()">' +
        'تخطي ←' +
        '</button>';

    document.body.appendChild(overlay);

    var count    = 45;
    var fillEl   = document.getElementById('ready-progress-fill');
    var countEl  = document.getElementById('ready-timer-count');
    var circleEl = document.getElementById('ready-timer-circle');
    var msgEl    = document.getElementById('ready-timer-msg');

    window._readyTimerCallback = callback;

    Game.readyTimerInterval = setInterval(function() {
        count--;

        if (countEl) countEl.textContent = count;

        if (fillEl) {
            fillEl.style.width =
                (count / 45 * 100) + '%';
        }

        if (count <= 15 && count > 5) {
            if (circleEl) {
                circleEl.style.borderColor = '#FF9800';
                circleEl.style.boxShadow =
                    '0 0 20px rgba(255,152,0,0.5)';
            }
            if (countEl) countEl.style.color = '#FF9800';
            if (fillEl)  fillEl.style.background = '#FF9800';
        }

        if (count <= 5) {
            if (circleEl) {
                circleEl.style.borderColor = '#f44336';
                circleEl.style.boxShadow =
                    '0 0 25px rgba(244,67,54,0.7)';
            }
            if (countEl) countEl.style.color = '#f44336';
            if (fillEl)  fillEl.style.background = '#f44336';
            if (msgEl) {
                msgEl.textContent = '🚀 تبدأ الجولة قريباً!';
                msgEl.style.color = '#FFD700';
            }
        }

        if (count <= 0) {
            clearInterval(Game.readyTimerInterval);
            finishReadyTimer();
        }
    }, 1000);
}

function finishReadyTimer() {
    var overlay = document.getElementById(
        'ready-timer-overlay'
    );
    if (overlay) overlay.remove();

    if (window._readyTimerCallback) {
        var cb = window._readyTimerCallback;
        window._readyTimerCallback = null;
        cb();
    }
}

function skipReadyTimer() {
    clearInterval(Game.readyTimerInterval);
    finishReadyTimer();
}

// ==========================================
// ========= إنهاء الجولة =================
// ==========================================

function endRound() {
    Game.round++;
    Game.players[0].tokens += 2;
    Game.players[1].tokens += 2;

    updateTokensDisplay();
    updateRoundDisplay();

    showHandover(
        1,
        'جولة جديدة رقم ' + Game.round +
        ' - قدّم رموزك!',
        function() {
            showScreen('screen-game');
            resetOffering();
        }
    );
}

// ===== شاشة الفوز =====
function showWinScreen(winner) {
    clearInterval(Game.timerInterval);
    clearInterval(Game.readyTimerInterval);

    var winnerName = winner === 1 ?
        PlayerNames.p1 : PlayerNames.p2;

    var content = document.getElementById('gameover-content');
    if (content) {
        content.innerHTML =
            '<div style="font-size:3em">🏆</div>' +
            '<div style="color:#FFD700;font-size:1.5em;' +
            'margin:10px 0;font-weight:bold">' +
            winnerName + ' فاز!' +
            '</div>' +
            '<div style="font-size:0.8em;color:#aaa">' +
            'الجولة ' + Game.round +
            '</div>';
    }

    openModal('modal-gameover');
}

// ==========================================
// ========= دوال مساعدة ==================
// ==========================================

function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    var target = document.getElementById(id);
    if (target) target.classList.add('active');
}

function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

function showToast(msg) {
    var existing = document.querySelector('.toast-msg');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className   = 'toast-msg';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(function() {
        if (toast && toast.parentNode) {
            toast.remove();
        }
    }, 2500);
}