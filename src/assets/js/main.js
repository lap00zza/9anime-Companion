/**
 *  MIT License
 *
 *  Copyright (c) 2017 Jewel Mahanta
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

// Handles the functionality withing the main popup UI.
// TODO: maybe add removeFromPinnedList to the events page instead?
(function ($) {
    var animeLink = $("#anime-link-image");
    var settingsBtn = $("#settingsWindowToggle");
    var lastWatched = $("#lastWatched");
    var lastWatchedDetails = $("#lastWatchedDetails");
    var pinnedListDiv = $("#pinnedList");
    var pinned = $("#pinned");
    var quickSettings = $("#quickSettings");
    var optionElements = ["minimalModeToggle", "adsToggle", "playerSizeToggle", "pinIconToggle"];

    // NOTE: We are using computed property to generate
    // dynamic keys based on ID.
    $(quickSettings).find("input:checkbox").change(function () {
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

    // Click Handlers
    $(animeLink).on("click", function () {
        chrome.runtime.sendMessage({intent: "open_9anime"}, function (response) {
            console.log(response.result);
        });
    });

    $(settingsBtn).on("click", function () {
        // chrome.runtime.openOptionsPage();
        $(pinned).toggle("fast");
        $(quickSettings).toggle("fast");
    });
    
    // This portion deals with binding the pinned anime list
    // onto the popup.
    // TODO: maybe this can be broken down to smaller functions?
    chrome.storage.local.get({pinnedList: []}, function (values) {
        var pinned = values["pinnedList"];
        if (pinned.length > 0) {

            console.log(pinned);
            for (var i = 0; i < pinned.length; i++) {
                $(pinnedListDiv).append(`<div data-url="${pinned[i].url}" class="pinned_item"><div class="anime_item">${pinned[i].name}</div><div class="pinned_delete"><img src="../../assets/images/delete.png"></div></div>`);
            }

            $(".pinned_item .anime_item").on("click", function () {

                var url = $(this).parent().data("url");
                chrome.runtime.sendMessage({intent: "open_anime", anime_url: url}, function (response) {
                    console.log(response.result);
                });
            });

            $(".pinned_item .pinned_delete").on("click", function () {

                var that = this;
                var url = $(this).parent().data("url");
                var requestObj = {
                    intent: "removePinnedAnime",
                    animeUrl: url
                };

                chrome.runtime.sendMessage(requestObj, function (response) {
                    // console.log(response.result, response.itemCount);
                    if (response.result === "success") {
                        $(that).parent().addClass("deleting_exit");
                        setTimeout(function () {
                            $(that).parent().remove();
                        }, 500);
                    }
                    if (response.itemCount === 0) {
                        $(pinnedListDiv).css({background: 'url("../../assets/images/no_item_banner.png")'});
                    }
                });

            });

        } else {
            console.log("Wew no anime!");
            $(pinnedListDiv).css({background: 'url("../../assets/images/no_item_banner.png")'});
        }

    })

})(jQuery);