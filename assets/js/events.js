/**
 * This module is responsible for listening to events from the
 * main interface. This module is required since it can
 * run even without being on 9anime websites.
 */
(function () {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {

            if (request.intent == "hello") {
                sendResponse({result: "Hello! Events Page is working properly."});
            }
            else if (request.intent == "open_9anime") {
                chrome.tabs.create({'url': "https://9anime.to"});
                sendResponse({result: "opened"});
            }
            else if (request.intent == "open_anime") {
                chrome.tabs.create({'url': request.anime_url});
                sendResponse({result: "opened"});
            }

        }
    );
})();