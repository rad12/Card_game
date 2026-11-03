// @ts-nocheck
/* eslint-disable */

// ==========================================
// ========= تعريف الأشكال ================
// ==========================================

var SUITS = {
    hearts: {
        symbol: '♥',
        name: 'قلوب',
        color: 'hearts'
    },
    diamonds: {
        symbol: '♦',
        name: 'ألماس',
        color: 'diamonds'
    },
    clubs: {
        symbol: '♣',
        name: 'سباتي',
        color: 'clubs'
    },
    spades: {
        symbol: '♠',
        name: 'بستوني',
        color: 'spades'
    }
};

// ==========================================
// ========= تعريف القيم ==================
// ==========================================

var VALUES = {
    1:  { display: 'A',  name: 'آص'   },
    2:  { display: '2',  name: '2'    },
    3:  { display: '3',  name: '3'    },
    4:  { display: '4',  name: '4'    },
    5:  { display: '5',  name: '5'    },
    6:  { display: '6',  name: '6'    },
    7:  { display: '7',  name: '7'    },
    8:  { display: '8',  name: '8'    },
    9:  { display: '9',  name: '9'    },
    10: { display: '10', name: '10'   },
    11: { display: 'J',  name: 'شاب'  },
    12: { display: 'Q',  name: 'ملكة' },
    13: { display: 'K',  name: 'ملك'  }
};

// ==========================================
// ========= إنشاء مجموعة الأوراق =========
// ==========================================

function createDeck() {
    var deck = [];
    var suitKeys = [
        'hearts',
        'diamonds',
        'clubs',
        'spades'
    ];
    var valueKeys = [
        1,2,3,4,5,6,7,8,9,10,11,12,13
    ];

    for (var s = 0; s < suitKeys.length; s++) {
        for (var v = 0; v < valueKeys.length; v++) {
            deck.push({
                suit: suitKeys[s],
                value: valueKeys[v],
                id: suitKeys[s] + '_' + valueKeys[v]
            });
        }
    }

    return deck;
}

// ==========================================
// ========= خلط الأوراق ==================
// ==========================================

function shuffleDeck(deck) {
    var shuffled = deck.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

// ==========================================
// ========= إنشاء عنصر HTML لورقة ========
// ==========================================

function createCardElement(card, clickable, faceDown) {
    var div = document.createElement('div');

    // ورقة مخفية
    if (faceDown || !card) {
        div.className = 'card face-down';
        div.innerHTML =
            '<div style="' +
                'display:flex;' +
                'flex-direction:column;' +
                'align-items:center;' +
                'justify-content:center;' +
                'width:100%;' +
                'height:100%;' +
            '">' +
                '<span style="' +
                    'font-size:1.5em;' +
                    'opacity:0.4;' +
                '">🂠</span>' +
            '</div>';
        return div;
    }

    // التحقق من البيانات
    var suitInfo = SUITS[card.suit];
    var valueInfo = VALUES[card.value];

    if (!suitInfo || !valueInfo) {
        div.className = 'card';
        div.innerHTML =
            '<div style="' +
                'display:flex;' +
                'align-items:center;' +
                'justify-content:center;' +
                'width:100%;height:100%;' +
                'color:#999;font-size:1.2em;' +
            '">?</div>';
        return div;
    }

    div.className = 'card ' + suitInfo.color;
    div.dataset.cardId = card.id;
    div.dataset.suit = card.suit;
    div.dataset.value = card.value;

    var displayVal = valueInfo.display;
    var suitSymbol = suitInfo.symbol;

    div.innerHTML =
        '<div style="' +
            'display:flex;' +
            'flex-direction:column;' +
            'align-items:center;' +
            'justify-content:center;' +
            'width:100%;' +
            'height:100%;' +
            'gap:1px;' +
        '">' +
            '<span style="' +
                'font-size:1em;' +
                'font-weight:bold;' +
                'line-height:1.1;' +
            '">' + displayVal + '</span>' +
            '<span style="' +
                'font-size:1.2em;' +
                'line-height:1.1;' +
            '">' + suitSymbol + '</span>' +
        '</div>';

    return div;
}

// ==========================================
// ========= التحقق من الترتيب ============
// ==========================================

function validateHandOrder(hand) {
    if (!hand || hand.length === 0) {
        return {
            valid: false,
            message: 'لا توجد أوراق!'
        };
    }

    // تجميع الأوراق حسب الشكل مع موضعها
    var bySuit = {};

    for (var i = 0; i < hand.length; i++) {
        var card = hand[i];
        if (!card) continue;

        if (!bySuit[card.suit]) {
            bySuit[card.suit] = [];
        }
        bySuit[card.suit].push({
            card: card,
            index: i
        });
    }

    var suitKeys = Object.keys(bySuit);

    for (var s = 0; s < suitKeys.length; s++) {
        var suit = suitKeys[s];
        var cards = bySuit[suit];

        // ورقة واحدة لا تحتاج تحقق
        if (cards.length < 2) continue;

        // ترتيب حسب الموضع
        cards.sort(function(a, b) {
            return a.index - b.index;
        });

        // التحقق من الترتيب التصاعدي
        for (var c = 0; c < cards.length - 1; c++) {
            if (cards[c].card.value >
                cards[c + 1].card.value) {
                return {
                    valid: false,
                    message: 'أوراق ' +
                        SUITS[suit].name +
                        ' يجب أن تكون' +
                        ' من الأصغر للأكبر!'
                };
            }
        }
    }

    return {
        valid: true,
        message: 'الترتيب صحيح ✓'
    };
}

// ==========================================
// ========= تحويل النصوص للقيم ===========
// ==========================================

function displayToValue(display) {
    var map = {
        'A': 1,  'a': 1,
        'J': 11, 'j': 11,
        'Q': 12, 'q': 12,
        'K': 13, 'k': 13
    };

    if (map[display] !== undefined) {
        return map[display];
    }

    var num = parseInt(display);
    if (!isNaN(num) && num >= 1 && num <= 13) {
        return num;
    }

    return null;
}

function valueToDisplay(value) {
    if (VALUES[value]) {
        return VALUES[value].display;
    }
    return value.toString();
}

// ==========================================
// ========= دوال مساعدة للأوراق ==========
// ==========================================

// الحصول على اسم الورقة كاملاً
function getCardName(card) {
    if (!card) return 'غير معروف';
    var suitInfo = SUITS[card.suit];
    var valueInfo = VALUES[card.value];
    if (!suitInfo || !valueInfo) return 'غير معروف';
    return valueInfo.name + ' ' + suitInfo.name;
}

// مقارنة ورقتين
function compareCards(card1, card2) {
    if (!card1 || !card2) return 0;
    if (card1.value < card2.value) return -1;
    if (card1.value > card2.value) return 1;
    return 0;
}

// الحصول على أوراق شكل معين
function getCardsBySuit(hand, suit) {
    var result = [];
    for (var i = 0; i < hand.length; i++) {
        if (hand[i] && hand[i].suit === suit) {
            result.push(hand[i]);
        }
    }
    return result;
}

// حساب مجموع قيم اليد
function getHandTotal(hand) {
    var total = 0;
    for (var i = 0; i < hand.length; i++) {
        if (hand[i]) {
            total += hand[i].value;
        }
    }
    return total;
}

// أعلى قيمة في اليد
function getMaxValue(hand) {
    var max = 0;
    for (var i = 0; i < hand.length; i++) {
        if (hand[i] && hand[i].value > max) {
            max = hand[i].value;
        }
    }
    return max;
}

// أدنى قيمة في اليد
function getMinValue(hand) {
    var min = 999;
    for (var i = 0; i < hand.length; i++) {
        if (hand[i] && hand[i].value < min) {
            min = hand[i].value;
        }
    }
    return min === 999 ? 0 : min;
}

// عدد الأشكال المختلفة
function getSuitCount(hand) {
    var suits = {};
    for (var i = 0; i < hand.length; i++) {
        if (hand[i]) {
            suits[hand[i].suit] = true;
        }
    }
    return Object.keys(suits).length;
}

// التحقق من ورقتين متتاليتين من نفس الشكل
function hasConsecutiveSameSuit(hand) {
    var bySuit = {};
    for (var i = 0; i < hand.length; i++) {
        if (!hand[i]) continue;
        if (!bySuit[hand[i].suit]) {
            bySuit[hand[i].suit] = [];
        }
        bySuit[hand[i].suit].push(hand[i].value);
    }

    var suits = Object.keys(bySuit);
    for (var s = 0; s < suits.length; s++) {
        var vals = bySuit[suits[s]].sort(
            function(a, b) { return a - b; }
        );
        for (var v = 0; v < vals.length - 1; v++) {
            if (vals[v + 1] - vals[v] === 1) {
                return true;
            }
        }
    }
    return false;
}

// التحقق من ورقتين بنفس القيمة
function hasDuplicateValues(hand) {
    var vals = {};
    for (var i = 0; i < hand.length; i++) {
        if (!hand[i]) continue;
        if (vals[hand[i].value]) {
            return true;
        }
        vals[hand[i].value] = true;
    }
    return false;
}

// التحقق من أكثر من N أوراق من نفس الشكل
function hasMoreThanNOfSuit(hand, n) {
    var counts = {};
    for (var i = 0; i < hand.length; i++) {
        if (!hand[i]) continue;
        counts[hand[i].suit] =
            (counts[hand[i].suit] || 0) + 1;
        if (counts[hand[i].suit] > n) {
            return true;
        }
    }
    return false;
}

// التحقق من وجود ورقة مصورة
function hasFaceCard(hand) {
    for (var i = 0; i < hand.length; i++) {
        if (!hand[i]) continue;
        var v = hand[i].value;
        if (v === 1 || v === 11 ||
            v === 12 || v === 13) {
            return true;
        }
    }
    return false;
}

// الحصول على ملخص اليد
function getHandSummary(hand) {
    if (!hand || hand.length === 0) {
        return 'يد فارغة';
    }

    var summary = '';
    for (var i = 0; i < hand.length; i++) {
        if (hand[i]) {
            summary += valueToDisplay(hand[i].value);
            summary += SUITS[hand[i].suit].symbol;
            if (i < hand.length - 1) summary += ' ';
        }
    }
    return summary;
}