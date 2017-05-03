var canClick = true;

if (Leap) {
    var pointer = document.createElement('div');
    pointer.id = 'pointer';
    pointer.className = 'pointer';
    pointer.style = "border-radius: 50%;position: absolute;visibility: hidden;z-index: 1000;";
    document.getElementsByTagName('body')[0].appendChild(pointer);

    Leap.loop(null, function (frame) {
        if (frame.hands.length > 0) {
            var hand = GetHand(frame.hands, settings.scrollHand);

            if (hand) {
                Scroll(hand);
                Point(frame.interactionBox, hand, pointer);
            }
        }
        else {
            ClearPoint(pointer);
        }
    })
}

function GetHand(hands, side) {
    for (var i = 0; i < hands.length; i++) {
        if (hands[i].type === side) {
            return hands[i];
        }
    }

    return null;
}

function Scroll(hand) {
    if (!AllFingersExtended(hand)) {
        return;
    }

    var pitch = hand.pitch();

    if (pitch < settings.scrollDownBounds[0]) {
        pitch = Math.max(pitch, settings.scrollDownBounds[1]);
        ScrollDown((pitch - settings.scrollDownBounds[0]) / (settings.scrollDownBounds[1] - settings.scrollDownBounds[0]));
    }

    if (pitch > settings.scrollUpBounds[0]) {
        pitch = Math.min(pitch, settings.scrollUpBounds[1]);
        ScrollUp((pitch - settings.scrollUpBounds[0]) / (settings.scrollUpBounds[1] - settings.scrollUpBounds[0]));
    }
}

function ScrollUp(percent) {
    window.scrollBy(0, -settings.scrollMax * percent);
}

function ScrollDown(percent) {
    window.scrollBy(0, +settings.scrollMax * percent);
}

function AllFingersExtended(hand) {
    return hand.fingers[0].extended && hand.fingers[1].extended && hand.fingers[2].extended && hand.fingers[3].extended && hand.fingers[4].extended;
}

function Point(iBox, hand, div) {
    if (OnlyPointerExtended(hand)) {
        DrawPoint(iBox, hand, div, "rgba(255,0,0,.5)")
    }
    else {
        if (PointerAndThumbExtended(hand)) {
            DrawPoint(iBox, hand, div, "rgba(0,0,255,.5)");

            if (canClick) {

            }
        }
        else {
            ClearPoint(div);
        }
    }
}

function OnlyPointerExtended(hand) {
    return !hand.fingers[0].extended && hand.fingers[1].extended && !hand.fingers[2].extended && !hand.fingers[3].extended && !hand.fingers[4].extended;
}

function PointerAndThumbExtended(hand) {
    return hand.fingers[0].extended && hand.fingers[1].extended && !hand.fingers[2].extended && !hand.fingers[3].extended && !hand.fingers[4].extended;
}

function DrawPoint(iBox, hand, div, color) {
    var point = iBox.normalizePoint(hand.fingers[1].tipPosition);

    var wh = window.innerHeight;
    var ww = window.innerWidth;

    var size = (1 - Math.min(.6, Math.max(0, Math.abs(point[2] - .5)))) * 50;
    var offset = GetOffset();

    div.style.width = size + "px";
    div.style.height = size + "px";
    div.style.background = color;
    div.style.left = point[0] * ww + offset.left + "px";
    div.style.top = (1 - point[1]) * wh + offset.top + "px";
    div.style.visibility = "visible";
}

function GetOffset() {
    var doc = document.documentElement;

    return {
        left: (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
        top: (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    }
}

function ClearPoint(div) {
    div.style.visibility = "hidden";
}