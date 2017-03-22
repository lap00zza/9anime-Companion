/**
 * This content script handles global functionality like pins etc
 */
// TODO: maybe add some animation to the anime item to indicate add success?
(function ($) {
    console.log("%c 9anime Companion loaded successfully", "color: orange; font-weight: bold;");
    var animeItems = $(".list-film .item");

    // Web Accessible Resource URL's
    var pinImage = chrome.extension.getURL("assets/images/pin.png");

    // This portion deals with adding the pin to all
    // the anime items present in a page. The pin is
    // attached onto the bottom-left corner of the anime
    // cover image.
    $(animeItems)
        .each(function (key, item) {
            $(item).append(`<div class='pin_anime'><img src='${pinImage}'></div>`);
        })
        .promise()
        .done(function () {

            $(".pin_anime").on("click", function () {
                var animeName = $(this).parent().find(".name").text();
                var animeUrl = $(this).parent().find(".name").prop("href");

                var requestObj = {
                    intent: "addPinnedAnime",
                    animeName: animeName,
                    animeUrl: animeUrl
                };

                chrome.runtime.sendMessage(requestObj, function (response) {
                    console.log(response.result);
                });

            });
        });

    // Test interaction between content script and background page
    // chrome.runtime.sendMessage({intent: "hello"}, function (response) {
    //     console.log(response.result);
    // });

})(jQuery);