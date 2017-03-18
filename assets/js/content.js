/**
 * This script handles all the functionality. It automatically loads
 * when the user goes to 9Anime website.
 */
(function () {
    // TODO: add support for settings storage
    console.log("9Anime Companion has loaded.",  document.location.href);

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
    var playerDiv = document.querySelectorAll("#movie > div.container.player-wrapper > div > div.col-lg-17.col-sm-24");
    var topNotificationBar = document.querySelectorAll("#movie > div.container.player-wrapper > div > div.col-xs-24");
    var titleLocation = document.querySelectorAll("#movie > div.widget.info > div:nth-child(1) > div > div > h1");


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
        lastWatchedName: titleLocation[0].innerHTML || false
    });

    settingsLoadedPromise.then(function () {
        // First we make sure that the query selector actually has
        // elements. Then we hide the sideBar and adjust the width
        // of the player and the notification banner.
        if (removeAds) {
            for (var i = 0; i < adsLocations.length; i++) {
                var ad = document.querySelectorAll(adsLocations[i]);
                if (ad.length > 0) {
                    ad[0].remove();
                }
            }

        }

        if (playerDiv.length > 0 && resizePlayer) {
            playerDiv[0].style.width = (playerWidth * 100) + "%";
            playerDiv[0].style.paddingLeft = ((1 - playerWidth) * 100) + "%";
        }

        if (topNotificationBar.length > 0 && resizePlayer) {
            topNotificationBar[0].style.width = (playerWidth * 100) + "%";
            topNotificationBar[0].style.paddingLeft = ((1 - playerWidth) * 100) + "%";
        }
    });

    // Interaction between extension and Page
    chrome.runtime.sendMessage({intent: "hello"}, function (response) {
        console.log(response.result);
    });
})();