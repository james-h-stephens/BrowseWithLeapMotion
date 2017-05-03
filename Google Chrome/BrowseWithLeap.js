Leap.loop(null, function (frame) {
    if (frame.hands.length > 0) {
        var rightHand = GetHand(frame.hands, settings.scrollHand);

        if (rightHand) {
            var pitch = rightHand.pitch();

            if (pitch < settings.scrollDownBounds[0]) {
                pitch = Math.max(pitch, settings.scrollDownBounds[1]);
                scrollDown((pitch - settings.scrollDownBounds[0]) / (settings.scrollDownBounds[1] - settings.scrollDownBounds[0]));
            }

            if (pitch > settings.scrollUpBounds[0]) {
                pitch = Math.min(pitch, settings.scrollUpBounds[1]);
                scrollUp((pitch - settings.scrollUpBounds[0]) / (settings.scrollUpBounds[1] - settings.scrollUpBounds[0]));
            }
        }
    }
})

function GetHand(hands, side) {
    for (var i = 0; i < hands.length; i++) {
        if (hands[i].type === side) {
            return hands[i];
        }
    }

    return null;
}

function scrollUp(percent) {
    window.scrollBy(0, -settings.scrollMax * percent);
}

function scrollDown(percent) {
    window.scrollBy(0, +settings.scrollMax * percent);
}