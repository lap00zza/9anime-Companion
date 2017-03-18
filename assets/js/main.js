/**
 * We are going to use jquery for this interface popup
 * as it is easier to make the effects using it.
 */
(function ($) {
    var animeLink = $("#anime-link-image");
    var settingsBtn = $("#settingsWindowToggle");
    var optionsWindow = $("#options");
    var mainWindow = $("#main");
    var lastWatched = $("#lastWatched");
    var optionElements = ["minimalModeToggle", "adsToggle", "playerSizeToggle"];

    $(animeLink).on("click", function () {
        chrome.runtime.sendMessage({intent: "open_9anime"}, function (response) {
            console.log(response.result);
        });
    });

    $(settingsBtn).on("click", function () {
        $(mainWindow).toggle("fast");
        $(optionsWindow).toggle("fast");
    });

    // NOTE: We are using computed property to generate
    // dynamic keys based on ID.
    $(optionsWindow).find("input:checkbox").change(function () {
        var key = this.id;
        if ($(this).is(":checked")) {
            console.log(key + " is on!");
            chrome.storage.local.set({[key]: 1});

        } else {
            console.log(this.id + " is off!");
            chrome.storage.local.set({[key]: 0});
        }
    });

    chrome.storage.local.get(optionElements, function (keys) {
        console.log(keys);
        for (var key in keys) {
            if (keys.hasOwnProperty(key)) {
                console.log(key, keys[key]);
                $("#" + key).prop("checked", !!(keys[key]))
            }
        }
    });

    // TODO: 1) Allow only 10-12 chars max for name 2) Check if name and url exists
    chrome.storage.local.get(["lastWatchedUrl", "lastWatchedName"], function (keys) {
        console.log(keys);
        $(lastWatched).text(keys["lastWatchedName"]);
        $(lastWatched)[0].dataset.url = keys["lastWatchedUrl"];
    });

})(jQuery);