/**
 * This script handles all the functionality. It automatically loads
 * when the user goes to 9Anime website.
 */
(function ($) {
    // TODO: add support for settings storage
    console.log("9Anime Companion has loaded.", document.location.href);

    // Initializing all the variables for 9Anime Companion
    // Some of the default values are necessary as fallback measure.
    var removeAds,
        resizePlayer,
        minimalMode,
        playerWidth = 0.9,
        optionsArray = ["minimalModeToggle", "adsToggle", "playerSizeToggle"];

    // Ads Locations
    // TODO: add a way to update the ads locations remotely via updates
    var adsLocations = [
        "#movie > div.container.player-wrapper > div > div.col-lg-7.col-sm-24.sidebar",
        "#movie > div.widget.info > div:nth-child(1) > div > div.col-md-7",
        "#movie > div.widget.info > div:nth-child(1) > div > div > div.widget.mt20.a_d",
        "#movie > div.widget.info > div:nth-child(1) > div > div > div.hidden-xs.a_d"
    ];

    // Other important locations
    var movieDiv = $("#movie");
    var playerDiv = $(movieDiv).find("div.container.player-wrapper > div > div.col-lg-17.col-sm-24");
    var topNotificationBar = $(movieDiv).find("div.container.player-wrapper > div > div.col-xs-24");
    var titleDiv = $(movieDiv).find("div.widget.info > div > div > div > h1");
    var suggestedDiv = $(movieDiv).find("div.widget.info > div.widget.container");
    var commentDiv = $("#comment");
    var infoDiv = $("#info");
    var episodeListDiv = $(movieDiv).find("> div.widget.info > div > div > div");

    // Load Settings. In case the settings are missing, we will use
    // default values.
    var settingsLoadedPromise = new Promise(function (resolve, reject) {
        chrome.storage.local.get(optionsArray, function (values) {

            removeAds = !!values["adsToggle"] || false;
            resizePlayer = !!values["playerSizeToggle"] || false;
            minimalMode = !!values["minimalModeToggle"] || false;
            
            // Once we load the settings, we resolve our promise.
            resolve();
        });
    });

    // We will use this to store the last watched anime details
    chrome.storage.local.set({
        lastWatchedUrl: document.location.href || false,
        lastWatchedName: $(titleDiv).text() || false
    });

    function adsRemover() {
        for (var i = 0; i < adsLocations.length; i++) {
            $(adsLocations[i]).remove();
        }
    }

    function playerResizer() {
        $(playerDiv).css({width: (playerWidth * 100) + "%", paddingLeft: ((1 - playerWidth) * 100) + "%"});
        $(topNotificationBar).css({width: (playerWidth * 100) + "%", paddingLeft: ((1 - playerWidth) * 100) + "%"});
    }

    settingsLoadedPromise.then(function () {

        // Minimal Mode
        // This mode will also remove ads and resize/center player,
        // regardless of whether this option is chosen or not.
        if (minimalMode) {
            $(suggestedDiv).remove();
            $(commentDiv).remove();
            $(infoDiv).remove();
            $(titleDiv).remove();
            $(episodeListDiv).css({width: "90%", paddingLeft: "10%"});

            adsRemover();
            playerResizer();
        }

        // Ads Removal
        if (!minimalMode && removeAds) {
            // console.log("Oui Ads");
            adsRemover();
        }

        // Player Resizer
        if (!minimalMode && resizePlayer) {
            // console.log("Oui Resize");
            playerResizer();
        }
    });

    // Interaction between extension and Page
    chrome.runtime.sendMessage({intent: "hello"}, function (response) {
        console.log(response.result);
    });
})(jQuery);