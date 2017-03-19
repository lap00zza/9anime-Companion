/**
 * We are going to use jquery for this interface popup
 * as it is easier to make the effects using it.
 *
 * TODO:
 * - Watching history.
 * - Watch list.
 * - Trending.
 * - New episode of airing show available notification
 *
 * Snippet for trending list (We do this check once every 10 minutes)
 *      var x = $("#body-wrapper > div:nth-child(4) > div.widget.hotnew.has-page > div.widget-body > div > div.content.active > div:nth-child(1) > div")
 *      $(x).children().each(function (key, value) {
 *          console.log(key, $(value).find("a.name").text(), $(value).find("a.name").prop("href"));
 *      })
 */
(function ($) {
    var animeLink = $("#anime-link-image");
    var settingsBtn = $("#settingsWindowToggle");
    var optionsWindow = $("#options");
    var mainWindow = $("#main");
    var lastWatched = $("#lastWatched");
    var lastWatchedDetails = $("#lastWatchedDetails");
    var optionElements = ["minimalModeToggle", "adsToggle", "playerSizeToggle"];

    // Helper Functions
    /**
     * This helper function will help us test whether a given string is a URL.
     *
     * @param urlString
     * @returns {boolean}
     */
    function isUrl(urlString) {
        var re_url = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        return !!urlString.match(re_url);
    }

    // Click Handlers
    $(animeLink).on("click", function () {
        chrome.runtime.sendMessage({intent: "open_9anime"}, function (response) {
            console.log(response.result);
        });
    });

    $(lastWatchedDetails).on("click", function () {
        var url = $(lastWatchedDetails)[0].dataset.url;
        if (isUrl(url)) {
            chrome.runtime.sendMessage({intent: "open_anime", anime_url: url}, function (response) {
                console.log(response.result);
            });
        }

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
        $(lastWatchedDetails)[0].dataset.url = keys["lastWatchedUrl"];
    });

})(jQuery);