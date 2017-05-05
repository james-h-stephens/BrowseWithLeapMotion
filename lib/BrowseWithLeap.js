BrowseWithLeap = function () {

    var Settings = {
        scrollMax: 50,
        scrollHand: "right",
        scrollDownBounds: [-.25, -.6],
        scrollUpBounds: [.5, 1],
        pointerColor: "rgba(255,0,0,.5)",
        clickerColor: "rgba(0,0,255,.5)",
        clickDelay: 1000
    }

    var Enable = function (enabled) {
        enabled = !!enabled;
    }

    var DeviceAttached = function () { };
    var DeviceStreaming = function () { };
    var DeviceStopped = function () { };

    var canClick = true;
    var enabled = true;

    document.addEventListener("DOMContentLoaded", function () {
        if (enabled && Leap) {
            var pointer = document.createElement('div');
            pointer.id = 'pointer';
            document.body.insertBefore(pointer, document.body.firstChild);

            var status = document.getElementById("status");

            var controller = Leap.loop(null, function (frame) {
                if (frame.hands.length > 0) {
                    var hand = GetHand(frame.hands, BrowseWithLeap.Settings.scrollHand);

                    if (hand) {
                        Scroll(hand);
                        Point(frame.interactionBox, hand, pointer);
                    }
                }
                else {
                    ClearPoint(pointer);
                }
            })

            controller.on('deviceAttached', function () {
                BrowseWithLeap.DeviceAttached();
            });

            controller.on('deviceStreaming', function () {
                BrowseWithLeap.DeviceStreaming();
            });

            controller.on('deviceStopped', function () {
                BrowseWithLeap.DeviceStopped();
            });
        }
    });

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

        if (pitch < Settings.scrollDownBounds[0]) {
            pitch = Math.max(pitch, Settings.scrollDownBounds[1]);
            ScrollDown((pitch - Settings.scrollDownBounds[0]) / (Settings.scrollDownBounds[1] - Settings.scrollDownBounds[0]));
        }

        if (pitch > Settings.scrollUpBounds[0]) {
            pitch = Math.min(pitch, Settings.scrollUpBounds[1]);
            ScrollUp((pitch - Settings.scrollUpBounds[0]) / (Settings.scrollUpBounds[1] - Settings.scrollUpBounds[0]));
        }
    }

    function ScrollUp(percent) {
        window.scrollBy(0, -Settings.scrollMax * percent);
    }

    function ScrollDown(percent) {
        window.scrollBy(0, +Settings.scrollMax * percent);
    }

    function AllFingersExtended(hand) {
        return hand.fingers[0].extended && hand.fingers[1].extended && hand.fingers[2].extended && hand.fingers[3].extended && hand.fingers[4].extended;
    }

    function Point(iBox, hand, div) {
        if (OnlyPointerExtended(hand)) {
            DrawPoint(GetPoint(iBox, hand), div, Settings.pointerColor);
        }
        else {
            if (PointerAndThumbExtended(hand)) {
                var point = GetPoint(iBox, hand);
                DrawPoint(point, div, Settings.clickerColor);

                if (canClick) {
                    var anchor = FindClosestAnchor(point);

                    if (anchor) {
                        anchor.click();
                        canClick = false;
                        window.setTimeout(function () {
                            canClick = true;
                        }, Settings.clickDelay);
                    }
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

    function GetPoint(iBox, hand) {
        var point = iBox.normalizePoint(hand.fingers[1].tipPosition);

        var wh = window.innerHeight;
        var ww = window.innerWidth;

        var offset = GetOffset();
        var size = (1 - Math.min(.6, Math.max(0, Math.abs(point[2] - .5)))) * 50;

        return [
            point[0] * ww + offset.left + (size / 2),
            (1 - point[1]) * wh + offset.top + (size / 2),
            size
        ]
    }

    function DrawPoint(point, div, color) {
        div.style.background = color;
        div.style.left = point[0] + "px";
        div.style.top = point[1] + "px";
        div.style.width = point[2] + "px";
        div.style.height = point[2] + "px";
        div.style.position = "absolute";
        div.style["border-radius"] = "50%";
        div.style["z-index"] = 10000;
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

    function FindClosestAnchor(point) {
        var anchor = null;


        var offset = GetOffset();

        var parent = document.elementFromPoint(point[0] - offset.left, point[1] - offset.top);

        if (parent) {

            if (parent.tagName.toLowerCase() === "a") {
                anchor = parent;
            }
            else {
                var anchors = parent.getElementsByTagName('a');
                if (anchors.length > 0) {
                    anchor = anchors[0];
                }
            }
        }

        return anchor
    }

    return {
        Settings: Settings,
        Enable: Enable,
        DeviceAttached: DeviceAttached,
        DeviceStreaming: DeviceStreaming,
        DeviceStopped: DeviceStopped
    }
}();