// @ts-nocheck
/* eslint-disable */

// ==========================================
// ========= قائمة الأسئلة ================
// ==========================================

var QUESTIONS = [

    // ==========================================
    // ========= SUM - المجموع =================
    // ==========================================

    {
        id: 1,
        text: "إذا اخترت 3 مواقع للبطاقات، فما مجموع قيم جميع البطاقات الموجودة في تلك المواقع؟",
        type: "choose_positions",
        count: 3,
        check: function(hand, extra) {
            if (!extra || !extra.positions) return 0;
            var sum = 0;
            for (var i = 0; i < extra.positions.length; i++) {
                var pos = extra.positions[i] - 1;
                if (hand[pos]) sum += hand[pos].value;
            }
            return sum;
        }
    },
    {
        id: 2,
        text: "إذا اخترت شكلاً واحداً للبطاقات، فما مجموع قيم جميع البطاقات التي تحمل ذلك الشكل؟",
        type: "choose_suit",
        check: function(hand, extra) {
            if (!extra || !extra.suit) return 0;
            var sum = 0;
            for (var i = 0; i < hand.length; i++) {
                if (hand[i] && hand[i].suit === extra.suit) {
                    sum += hand[i].value;
                }
            }
            return sum;
        }
    },
    {
        id: 3,
        text: "ما مجموع قيم جميع البطاقات الأبجدية (الحروف)؟ (A, J, Q, K)",
        type: "direct",
        check: function(hand) {
            var sum = 0;
            for (var i = 0; i < hand.length; i++) {
                if (hand[i]) {
                    var v = hand[i].value;
                    if (v === 1  || v === 11 ||
                        v === 12 || v === 13) {
                        sum += v;
                    }
                }
            }
            return sum;
        }
    },
    {
        id: 4,
        text: "ما مجموع قيم جميع البطاقات الرقمية؟ (2-10)",
        type: "direct",
        check: function(hand) {
            var sum = 0;
            for (var i = 0; i < hand.length; i++) {
                if (hand[i]) {
                    var v = hand[i].value;
                    if (v >= 2 && v <= 10) {
                        sum += v;
                    }
                }
            }
            return sum;
        }
    },

    // ==========================================
    // ========= COUNT - العدد =================
    // ==========================================

    {
        id: 5,
        text: "كم عدد البطاقات الأبجدية (الحروف) الموجودة؟ (A, J, Q, K)",
        type: "direct",
        check: function(hand) {
            var count = 0;
            for (var i = 0; i < hand.length; i++) {
                if (hand[i]) {
                    var v = hand[i].value;
                    if (v === 1  || v === 11 ||
                        v === 12 || v === 13) {
                        count++;
                    }
                }
            }
            return count;
        }
    },
    {
        id: 6,
        text: "كم عدد البطاقات الرقمية الموجودة؟ (2-10)",
        type: "direct",
        check: function(hand) {
            var count = 0;
            for (var i = 0; i < hand.length; i++) {
                if (hand[i]) {
                    var v = hand[i].value;
                    if (v >= 2 && v <= 10) {
                        count++;
                    }
                }
            }
            return count;
        }
    },
    {
        id: 7,
        text: "إذا اخترت رقماً أو حرفاً واحداً، فكم عدد البطاقات التي تحمل ذلك الرقم أو الحرف؟",
        type: "choose_value",
        check: function(hand, extra) {
            if (!extra || !extra.value) return 0;
            var count = 0;
            for (var i = 0; i < hand.length; i++) {
                if (hand[i] &&
                    hand[i].value === extra.value) {
                    count++;
                }
            }
            return count;
        }
    },

    // ==========================================
    // ========= POSITION - الموقع ============
    // ==========================================

    {
        id: 8,
        text: "إذا اخترت شكلاً واحداً للبطاقات، في أي مواقع تقع بطاقات ذلك الشكل؟",
        type: "choose_suit",
        check: function(hand, extra) {
            if (!extra || !extra.suit) return [];
            var positions = [];
            for (var i = 0; i < hand.length; i++) {
                if (hand[i] &&
                    hand[i].suit === extra.suit) {
                    positions.push(i + 1);
                }
            }
            return positions.length > 0 ?
                positions : 'لا توجد';
        }
    },
    {
        id: 9,
        text: "إذا اخترت رقماً أو حرفاً واحداً، في أي موقع تقع البطاقة التي تحمله؟",
        type: "choose_value",
        check: function(hand, extra) {
            if (!extra || !extra.value) return [];
            var positions = [];
            for (var i = 0; i < hand.length; i++) {
                if (hand[i] &&
                    hand[i].value === extra.value) {
                    positions.push(i + 1);
                }
            }
            return positions.length > 0 ?
                positions : 'لا توجد';
        }
    },
    {
        id: 10,
        text: "في أي مواقع توجد البطاقات الأبجدية والرقمية المتسلسلة من نفس الشكل؟",
        type: "direct",
        check: function(hand) {
            var positions = [];
            var bySuit = {};

            for (var i = 0; i < hand.length; i++) {
                if (!hand[i]) continue;
                if (!bySuit[hand[i].suit]) {
                    bySuit[hand[i].suit] = [];
                }
                bySuit[hand[i].suit].push({
                    value: hand[i].value,
                    pos: i + 1
                });
            }

            var suits = Object.keys(bySuit);
            for (var s = 0; s < suits.length; s++) {
                var cards = bySuit[suits[s]].sort(
                    function(a, b) {
                        return a.value - b.value;
                    }
                );
                for (var c = 0; c < cards.length - 1; c++) {
                    if (cards[c + 1].value -
                        cards[c].value === 1) {
                        if (positions.indexOf(
                            cards[c].pos) === -1) {
                            positions.push(cards[c].pos);
                        }
                        if (positions.indexOf(
                            cards[c + 1].pos) === -1) {
                            positions.push(cards[c + 1].pos);
                        }
                    }
                }
            }

            return positions.length > 0 ?
                positions.sort(
                    function(a, b) { return a - b; }
                ) : 'لا توجد';
        }
    },
    {
        id: 11,
        text: "في أي موقع توجد البطاقة ذات القيمة الأكبر أو الأصغر؟",
        type: "choose_minmax",
        check: function(hand, extra) {
            if (!extra || !extra.minmax) return [];
            var targetValue;

            if (extra.minmax === 'max') {
                targetValue = 0;
                for (var i = 0; i < hand.length; i++) {
                    if (hand[i] &&
                        hand[i].value > targetValue) {
                        targetValue = hand[i].value;
                    }
                }
            } else {
                targetValue = 999;
                for (var j = 0; j < hand.length; j++) {
                    if (hand[j] &&
                        hand[j].value < targetValue) {
                        targetValue = hand[j].value;
                    }
                }
            }

            var positions = [];
            for (var k = 0; k < hand.length; k++) {
                if (hand[k] &&
                    hand[k].value === targetValue) {
                    positions.push(k + 1);
                }
            }
            return positions.length > 0 ?
                positions : 'لا توجد';
        }
    }
];

// ==========================================
// ========= عرض السؤال التفاعلي ==========
// ==========================================

var currentQuestionData = null;

function showInteractiveQuestion(question, opponentHand) {
    currentQuestionData = {
        question: question,
        hand: opponentHand
    };

    if (question.type === 'direct') {
        showDirectAnswer(question, opponentHand);
        return;
    }
    if (question.type === 'choose_positions') {
        showPositionChooser(question, opponentHand);
        return;
    }
    if (question.type === 'choose_suit') {
        showSuitChooser(question, opponentHand);
        return;
    }
    if (question.type === 'choose_value') {
        showValueChooser(question, opponentHand);
        return;
    }
    if (question.type === 'choose_minmax') {
        showMinMaxChooser(question, opponentHand);
        return;
    }
}

// ==========================================
// ========= إجابة مباشرة =================
// ==========================================

function showDirectAnswer(question, hand) {
    var result = question.check(hand);
    var resultText = '';

    if (Array.isArray(result)) {
        resultText = result.length > 0 ?
            'المواقع: ' + result.join(', ') : 'لا توجد';
    } else {
        resultText = result.toString();
    }

    showAnswerModal(question.text, resultText);
}

// ==========================================
// ========= اختيار المواقع ===============
// ==========================================

function showPositionChooser(question, hand) {
    var modal = createInteractiveModal();
    var selectedPositions = [];

    modal.innerHTML =
        '<div class="modal-content" style="' +
        'max-height:85vh;overflow-y:auto;">' +
        '<h2 style="color:#FFD700;margin-bottom:8px;' +
        'font-size:1em;line-height:1.4">' +
        question.text +
        '</h2>' +
        '<p style="color:#aaa;font-size:0.85em;' +
        'margin-bottom:12px">' +
        'اختر ' + question.count + ' مواقع:' +
        '</p>' +
        '<div id="position-btns" style="' +
        'display:flex;flex-wrap:wrap;gap:8px;' +
        'justify-content:center;margin-bottom:12px">' +
        '</div>' +
        '<div id="position-result" style="' +
        'background:#0f0f23;border-radius:10px;' +
        'padding:12px;min-height:55px;' +
        'text-align:center;margin-bottom:12px;' +
        'border:2px solid #333;">' +
        '<p style="color:#555;font-size:0.85em">' +
        'اختر ' + question.count +
        ' مواقع لرؤية النتيجة' +
        '</p>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);

    var btnsContainer = document.getElementById('position-btns');

    for (var i = 1; i <= 8; i++) {
        (function(pos) {
            var btn = document.createElement('button');
            btn.style.cssText =
                'width:48px;height:48px;' +
                'border-radius:50%;' +
                'border:2px solid #555;' +
                'background:#1a1a3e;' +
                'color:#fff;font-size:1.1em;' +
                'cursor:pointer;font-weight:bold;' +
                'transition:all 0.2s;';
            btn.textContent = pos;

            btn.addEventListener('click', function() {
                var idx = selectedPositions.indexOf(pos);

                if (idx === -1) {
                    if (selectedPositions.length >=
                        question.count) {
                        showToast(
                            'اختر ' + question.count +
                            ' مواقع فقط!'
                        );
                        return;
                    }
                    selectedPositions.push(pos);
                    btn.style.background  = '#4CAF50';
                    btn.style.borderColor = '#4CAF50';
                    btn.style.boxShadow   =
                        '0 0 10px rgba(76,175,80,0.6)';
                } else {
                    selectedPositions.splice(idx, 1);
                    btn.style.background  = '#1a1a3e';
                    btn.style.borderColor = '#555';
                    btn.style.boxShadow   = 'none';
                }

                var resultEl = document.getElementById(
                    'position-result'
                );

                if (selectedPositions.length ===
                    question.count) {
                    var result = question.check(hand, {
                        positions: selectedPositions
                    });
                    if (resultEl) {
                        resultEl.style.borderColor = '#FFD700';
                        resultEl.innerHTML =
                            '<p style="color:#aaa;' +
                            'font-size:0.8em;margin-bottom:4px">' +
                            'المواقع: ' +
                            selectedPositions.join(', ') +
                            '</p>' +
                            '<p style="color:#FFD700;' +
                            'font-size:1.8em;font-weight:bold">' +
                            result +
                            '</p>' +
                            '<p style="color:#aaa;' +
                            'font-size:0.75em">' +
                            'المجموع' +
                            '</p>';
                    }
                } else {
                    if (resultEl) {
                        resultEl.style.borderColor = '#333';
                        resultEl.innerHTML =
                            '<p style="color:#555;' +
                            'font-size:0.85em">' +
                            'اختر ' + question.count +
                            ' مواقع لرؤية النتيجة' +
                            '</p>';
                    }
                }
            });

            btnsContainer.appendChild(btn);
        })(i);
    }
}

// ==========================================
// ========= اختيار الشكل =================
// ==========================================

function showSuitChooser(question, hand) {
    var modal = createInteractiveModal();

    var suits = [
        {
            key: 'hearts',
            symbol: '♥',
            name: 'قلوب',
            color: '#e74c3c'
        },
        {
            key: 'diamonds',
            symbol: '♦',
            name: 'ألماس',
            color: '#e74c3c'
        },
        {
            key: 'clubs',
            symbol: '♣',
            name: 'سباتي',
            color: '#ffffff'
        },
        {
            key: 'spades',
            symbol: '♠',
            name: 'بستوني',
            color: '#ffffff'
        }
    ];

    modal.innerHTML =
        '<div class="modal-content" style="' +
        'max-height:85vh;overflow-y:auto;">' +
        '<h2 style="color:#FFD700;margin-bottom:8px;' +
        'font-size:1em;line-height:1.4">' +
        question.text +
        '</h2>' +
        '<p style="color:#aaa;font-size:0.85em;' +
        'margin-bottom:12px">اختر الشكل:</p>' +
        '<div id="suit-btns" style="' +
        'display:flex;flex-wrap:wrap;gap:10px;' +
        'justify-content:center;margin-bottom:12px">' +
        '</div>' +
        '<div id="suit-result" style="' +
        'background:#0f0f23;border-radius:10px;' +
        'padding:12px;min-height:55px;' +
        'text-align:center;margin-bottom:12px;' +
        'border:2px solid #333;">' +
        '<p style="color:#555;font-size:0.85em">' +
        'اختر شكلاً لرؤية النتيجة' +
        '</p>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);

    var btnsContainer = document.getElementById('suit-btns');

    for (var i = 0; i < suits.length; i++) {
        (function(suit) {
            var btn = document.createElement('button');
            btn.style.cssText =
                'width:75px;height:75px;' +
                'border-radius:12px;' +
                'border:2px solid #555;' +
                'background:#1a1a3e;' +
                'color:' + suit.color + ';' +
                'font-size:2em;cursor:pointer;' +
                'display:flex;flex-direction:column;' +
                'align-items:center;' +
                'justify-content:center;gap:2px;' +
                'transition:all 0.2s;';
            btn.innerHTML =
                suit.symbol +
                '<span style="font-size:0.3em;' +
                'color:#aaa">' + suit.name + '</span>';

            btn.addEventListener('click', function() {
                var allBtns = btnsContainer
                    .querySelectorAll('button');
                for (var j = 0; j < allBtns.length; j++) {
                    allBtns[j].style.borderColor = '#555';
                    allBtns[j].style.background  = '#1a1a3e';
                    allBtns[j].style.boxShadow   = 'none';
                }

                btn.style.borderColor = '#FFD700';
                btn.style.background  = '#2a2a1e';
                btn.style.boxShadow   =
                    '0 0 12px rgba(255,215,0,0.4)';

                var result = question.check(hand, {
                    suit: suit.key
                });

                var resultEl = document.getElementById(
                    'suit-result'
                );

                var resultText = '';
                if (Array.isArray(result)) {
                    resultText = result.length > 0 ?
                        'المواقع: ' + result.join(', ') :
                        'لا توجد بطاقات من هذا الشكل';
                } else {
                    resultText = result.toString();
                }

                if (resultEl) {
                    resultEl.style.borderColor = '#FFD700';
                    resultEl.innerHTML =
                        '<p style="color:' + suit.color + ';' +
                        'font-size:1.3em;margin-bottom:4px">' +
                        suit.symbol + ' ' + suit.name +
                        '</p>' +
                        '<p style="color:#FFD700;' +
                        'font-size:1.6em;font-weight:bold">' +
                        resultText +
                        '</p>';
                }
            });

            btnsContainer.appendChild(btn);
        })(suits[i]);
    }
}

// ==========================================
// ========= اختيار القيمة ================
// ==========================================

function showValueChooser(question, hand) {
    var modal = createInteractiveModal();

    var values = [
        { v: 1,  d: 'A',  color: '#FF9800' },
        { v: 2,  d: '2',  color: '#ffffff' },
        { v: 3,  d: '3',  color: '#ffffff' },
        { v: 4,  d: '4',  color: '#ffffff' },
        { v: 5,  d: '5',  color: '#ffffff' },
        { v: 6,  d: '6',  color: '#ffffff' },
        { v: 7,  d: '7',  color: '#ffffff' },
        { v: 8,  d: '8',  color: '#ffffff' },
        { v: 9,  d: '9',  color: '#ffffff' },
        { v: 10, d: '10', color: '#ffffff' },
        { v: 11, d: 'J',  color: '#FF9800' },
        { v: 12, d: 'Q',  color: '#FF9800' },
        { v: 13, d: 'K',  color: '#FF9800' }
    ];

    modal.innerHTML =
        '<div class="modal-content" style="' +
        'max-height:85vh;overflow-y:auto;">' +
        '<h2 style="color:#FFD700;margin-bottom:8px;' +
        'font-size:1em;line-height:1.4">' +
        question.text +
        '</h2>' +
        '<p style="color:#aaa;font-size:0.85em;' +
        'margin-bottom:12px">' +
        'اختر الرقم أو الحرف:' +
        '</p>' +
        '<div id="value-btns" style="' +
        'display:flex;flex-wrap:wrap;gap:7px;' +
        'justify-content:center;margin-bottom:12px">' +
        '</div>' +
        '<div id="value-result" style="' +
        'background:#0f0f23;border-radius:10px;' +
        'padding:12px;min-height:55px;' +
        'text-align:center;margin-bottom:12px;' +
        'border:2px solid #333;">' +
        '<p style="color:#555;font-size:0.85em">' +
        'اختر قيمة لرؤية النتيجة' +
        '</p>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);

    var btnsContainer = document.getElementById('value-btns');

    for (var i = 0; i < values.length; i++) {
        (function(val) {
            var btn = document.createElement('button');
            btn.style.cssText =
                'width:44px;height:44px;' +
                'border-radius:8px;' +
                'border:2px solid #555;' +
                'background:#1a1a3e;' +
                'color:' + val.color + ';' +
                'font-size:0.95em;cursor:pointer;' +
                'font-weight:bold;' +
                'transition:all 0.2s;';
            btn.textContent = val.d;

            btn.addEventListener('click', function() {
                var allBtns = btnsContainer
                    .querySelectorAll('button');
                for (var j = 0; j < allBtns.length; j++) {
                    allBtns[j].style.borderColor = '#555';
                    allBtns[j].style.background  = '#1a1a3e';
                    allBtns[j].style.boxShadow   = 'none';
                }

                btn.style.borderColor = '#FFD700';
                btn.style.background  = '#2a2a1e';
                btn.style.boxShadow   =
                    '0 0 10px rgba(255,215,0,0.4)';

                var result = question.check(hand, {
                    value: val.v
                });

                var resultEl = document.getElementById(
                    'value-result'
                );

                var resultText = '';
                if (Array.isArray(result)) {
                    resultText = result.length > 0 ?
                        'المواقع: ' + result.join(', ') :
                        'لا توجد بطاقة بهذه القيمة';
                } else {
                    resultText = result.toString();
                }

                if (resultEl) {
                    resultEl.style.borderColor = '#FFD700';
                    resultEl.innerHTML =
                        '<p style="color:#aaa;' +
                        'font-size:0.8em;margin-bottom:4px">' +
                        'القيمة: ' + val.d +
                        '</p>' +
                        '<p style="color:#FFD700;' +
                        'font-size:1.6em;font-weight:bold">' +
                        resultText +
                        '</p>';
                }
            });

            btnsContainer.appendChild(btn);
        })(values[i]);
    }
}

// ==========================================
// ========= اختيار الأكبر أو الأصغر ======
// ==========================================

function showMinMaxChooser(question, hand) {
    var modal = createInteractiveModal();

    modal.innerHTML =
        '<div class="modal-content" style="' +
        'max-height:85vh;overflow-y:auto;">' +
        '<h2 style="color:#FFD700;margin-bottom:15px;' +
        'font-size:1em;line-height:1.4">' +
        question.text +
        '</h2>' +
        '<p style="color:#aaa;font-size:0.85em;' +
        'margin-bottom:15px">اختر:</p>' +
        '<div style="display:flex;gap:15px;' +
        'justify-content:center;margin-bottom:15px">' +
        '<button id="btn-max"' +
        ' onclick="selectMinMax(\'max\')" style="' +
        'padding:18px 25px;border-radius:12px;' +
        'border:2px solid #FFD700;background:#1a1a3e;' +
        'color:#FFD700;font-size:1.1em;cursor:pointer;' +
        'font-weight:bold;transition:all 0.2s;">' +
        '⬆️ الأكبر' +
        '</button>' +
        '<button id="btn-min"' +
        ' onclick="selectMinMax(\'min\')" style="' +
        'padding:18px 25px;border-radius:12px;' +
        'border:2px solid #2196F3;background:#1a1a3e;' +
        'color:#2196F3;font-size:1.1em;cursor:pointer;' +
        'font-weight:bold;transition:all 0.2s;">' +
        '⬇️ الأصغر' +
        '</button>' +
        '</div>' +
        '<div id="minmax-result" style="' +
        'background:#0f0f23;border-radius:10px;' +
        'padding:12px;min-height:55px;' +
        'text-align:center;margin-bottom:12px;' +
        'border:2px solid #333;">' +
        '<p style="color:#555;font-size:0.85em">' +
        'اختر الأكبر أو الأصغر لرؤية النتيجة' +
        '</p>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);

    window._currentMinMaxQuestion = {
        question: question,
        hand: hand
    };
}

function selectMinMax(type) {
    if (!window._currentMinMaxQuestion) return;

    var question = window._currentMinMaxQuestion.question;
    var hand     = window._currentMinMaxQuestion.hand;
    var result   = question.check(hand, { minmax: type });
    var resultEl = document.getElementById('minmax-result');

    var label = type === 'max' ? '⬆️ الأكبر' : '⬇️ الأصغر';

    var resultText = '';
    if (Array.isArray(result)) {
        resultText = result.length > 0 ?
            'الموقع: ' + result.join(', ') : 'لا توجد';
    } else {
        resultText = result.toString();
    }

    if (resultEl) {
        resultEl.style.borderColor = '#FFD700';
        resultEl.innerHTML =
            '<p style="color:#aaa;font-size:0.8em;' +
            'margin-bottom:4px">' + label + '</p>' +
            '<p style="color:#FFD700;font-size:1.6em;' +
            'font-weight:bold">' + resultText + '</p>';
    }

    var btnMax = document.getElementById('btn-max');
    var btnMin = document.getElementById('btn-min');

    if (type === 'max') {
        if (btnMax) {
            btnMax.style.background = '#2a2a1e';
            btnMax.style.boxShadow  =
                '0 0 12px rgba(255,215,0,0.4)';
        }
        if (btnMin) {
            btnMin.style.background = '#1a1a3e';
            btnMin.style.boxShadow  = 'none';
        }
    } else {
        if (btnMin) {
            btnMin.style.background = '#0d1a2e';
            btnMin.style.boxShadow  =
                '0 0 12px rgba(33,150,243,0.4)';
        }
        if (btnMax) {
            btnMax.style.background = '#1a1a3e';
            btnMax.style.boxShadow  = 'none';
        }
    }
}

// ==========================================
// ========= عرض الإجابة المباشرة =========
// ==========================================

function showAnswerModal(questionText, answer) {
    var modal = createInteractiveModal();

    modal.innerHTML =
        '<div class="modal-content">' +
        '<h2 style="color:#FFD700;margin-bottom:15px;' +
        'font-size:1em;line-height:1.4">' +
        questionText +
        '</h2>' +
        '<div style="background:#0f0f23;' +
        'border-radius:12px;padding:20px;' +
        'margin-bottom:15px;' +
        'border:2px solid #4CAF50;">' +
        '<p style="color:#4CAF50;font-size:0.85em;' +
        'margin-bottom:8px">الإجابة:</p>' +
        '<p style="color:#FFD700;font-size:1.8em;' +
        'font-weight:bold;text-align:center">' +
        answer +
        '</p>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);
}

// ==========================================
// ========= إنشاء النافذة التفاعلية ======
// ==========================================

function createInteractiveModal() {
    closeInteractiveModal();

    var modal = document.createElement('div');
    modal.id = 'interactive-modal';
    modal.style.cssText =
        'position:fixed;top:0;left:0;' +
        'width:100%;height:100%;' +
        'background:rgba(0,0,0,0.92);' +
        'z-index:2000;display:flex;' +
        'align-items:center;' +
        'justify-content:center;' +
        'padding:15px;' +
        'animation:fadeInModal 0.3s ease;';

    return modal;
}

// ==========================================
// ========= إغلاق النافذة التفاعلية ======
// ==========================================

function closeInteractiveModal() {
    var existing = document.getElementById(
        'interactive-modal'
    );
    if (existing) existing.remove();
    window._currentMinMaxQuestion = null;
}

// ==========================================
// ========= دوال مساعدة للأسئلة ==========
// ==========================================

function getQuestionById(id) {
    for (var i = 0; i < QUESTIONS.length; i++) {
        if (QUESTIONS[i].id === id) {
            return QUESTIONS[i];
        }
    }
    return null;
}

function answerQuestionAuto(questionId, hand) {
    var question = getQuestionById(questionId);
    if (!question) return null;
    try {
        return question.check(hand);
    } catch(e) {
        console.log('Error checking question:', e);
        return null;
    }
}

function getAnswerText(answer) {
    if (answer === true)  return '✅ نعم';
    if (answer === false) return '❌ لا';
    return '❓ غير معروف';
}

function getRandomQuestion() {
    var index = Math.floor(
        Math.random() * QUESTIONS.length
    );
    return QUESTIONS[index];
}

function verifyAnswer(questionId, hand, givenAnswer) {
    var correctAnswer = answerQuestionAuto(
        questionId, hand
    );
    if (correctAnswer === null) return null;
    return correctAnswer === givenAnswer;
}