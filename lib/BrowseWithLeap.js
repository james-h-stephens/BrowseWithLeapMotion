BrowseWithLeap = function () {

    var Settings = {
        // The maximum scroll speed per Leap Motion frame
        scrollMax: 50,

        // The hand used for scrolling. Valid values are 'left' or 'right'
        scrollHand: "right",

        // The bounds for when to signify scrolling down. If the pitch is between the scrollDownBounds, Browse with Leap will tell the window to scroll down
        scrollDownBounds: [-.25, -.6],

         // The bounds for when to signify scrolling up. If the pitch is between the scrollUpBounds, Browse with Leap will tell the window to scroll up
        scrollUpBounds: [.5, 1],

        // The color of the pointer
        pointerColor: "rgba(255,0,0,.5)",

        // The color of the pointer when clicking
        clickerColor: "rgba(0,0,255,.5)",

        // The delay between clicks
        clickDelay: 1000
    }

    // An easy way to enable or disable the script
    var Enable = function (enabled) {
        enabled = !!enabled;
    }

    // Callback function for when the Leap Motion device is attached
    var DeviceAttached = function () { };

    // Callback function for when the Leap Motion device is streaming
    var DeviceStreaming = function () { };

    // Callback function for when the Leap Motion device is stopped
    var DeviceStopped = function () { };

    // Internal variable to determine whether the user can click
    var canClick = true;

    // Internal variable to tracker whether the plugin is enabled
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

            // Attaches callback to Leap's deviceAttached event
            controller.on('deviceAttached', function () {
                if (BrowseWithLeap.DeviceAttached && typeof BrowseWithLeap.DeviceAttached === "function") {
                    BrowseWithLeap.DeviceAttached();
                }
            });

            // Attaches callback to Leap's deviceStreaming event
            controller.on('deviceStreaming', function () {
                if (BrowseWithLeap.DeviceStreaming && typeof BrowseWithLeap.DeviceStreaming === "function") {
                    BrowseWithLeap.DeviceStreaming();
                }
            });

            // Attaches callback to Leap's deviceStopped event
            controller.on('deviceStopped', function () {
                if (BrowseWithLeap.DeviceStreaming && typeof BrowseWithLeap.DeviceStreaming === "function") {
                    BrowseWithLeap.DeviceStopped();
                }
            });
        }
    });

    // Get's the hand configured for scrolling
    function GetHand(hands, side) {
        for (var i = 0; i < hands.length; i++) {
            if (hands[i].type === side) {
                return hands[i];
            }
        }

        return null;
    }

    // Performs the scroll
    function Scroll(hand) {

        // All fingers must be extended to scroll
        if (!AllFingersExtended(hand)) {
            return;
        }

        var pitch = hand.pitch();

        if (pitch < Settings.scrollDownBounds[0]) {
            // Normalizes the pitch to be between 0 and 1
            var normalizedPitch = (Math.max(pitch, Settings.scrollDownBounds[1]) - Settings.scrollDownBounds[0]) / (Settings.scrollDownBounds[1] - Settings.scrollDownBounds[0]);
            ScrollDown(normalizedPitch);
        }

        if (pitch > Settings.scrollUpBounds[0]) {
            // Normalizes the pitch to be between 0 and 1
            var normalizedPitch = (Math.min(pitch, Settings.scrollUpBounds[1]) - Settings.scrollUpBounds[0]) / (Settings.scrollUpBounds[1] - Settings.scrollUpBounds[0]);
            ScrollUp(normalizedPitch);
        }
    }

    function ScrollUp(percent) {
        window.scrollBy(0, -Settings.scrollMax * percent);
    }

    function ScrollDown(percent) {
        window.scrollBy(0, +Settings.scrollMax * percent);
    }

    // Checks if all fingers are extended
    function AllFingersExtended(hand) {
        return hand.fingers[0].extended && hand.fingers[1].extended && hand.fingers[2].extended && hand.fingers[3].extended && hand.fingers[4].extended;
    }

    function Point(iBox, hand, div) {
        // Checks if pointing
        if (OnlyPointerExtended(hand)) {
            DrawPoint(GetPoint(iBox, hand), div, Settings.pointerColor);
        }
        else {
            // Checks if clicking
            if (PointerAndThumbExtended(hand)) {
                var point = GetPoint(iBox, hand);
                DrawPoint(point, div, Settings.clickerColor);

                // Checks if can click
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

    // Checks if only the pointer is extended
    function OnlyPointerExtended(hand) {
        return !hand.fingers[0].extended && hand.fingers[1].extended && !hand.fingers[2].extended && !hand.fingers[3].extended && !hand.fingers[4].extended;
    }

    // Checks if only the pointer and thumb extended
    function PointerAndThumbExtended(hand) {
        return hand.fingers[0].extended && hand.fingers[1].extended && !hand.fingers[2].extended && !hand.fingers[3].extended && !hand.fingers[4].extended;
    }

    // Gets the point array where 0 represents the x-coordinate on the site, 1 represents the y-coordinate on the site, and 2 represents the size of the pointer to render between 30 and 50 pixels.
    function GetPoint(iBox, hand) {
        // Gets the normalized point in 3-space
        var point = iBox.normalizePoint(hand.fingers[1].tipPosition);

        var wh = window.innerHeight;
        var ww = window.innerWidth;

        var offset = GetOffset();
        var size = (1 - Math.abs(point[2] - .5)) * 50;

        return [
            point[0] * ww + offset.left + (size / 2),
            (1 - point[1]) * wh + offset.top + (size / 2),
            size
        ]
    }

    // Draws the point
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

    // Gets the current scroll offset
    function GetOffset() {
        var doc = document.documentElement;

        return {
            left: (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
            top: (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
        }
    }

    // Hides the point
    function ClearPoint(div) {
        div.style.visibility = "hidden";
    }

    // Finds the closest anchor
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