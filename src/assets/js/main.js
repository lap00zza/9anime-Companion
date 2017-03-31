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
(function ($) {
    var animeLink = $("#anime-link-image");
    var settingsBtn = $("#settingsWindowToggle");
    var lastWatched = $("#lastWatched");
    var lastWatchedDetails = $("#lastWatchedDetails");
    var pinnedListDiv = $("#pinnedList");
    var pinned = $("#pinned");
    var quickSettings = $("#quickSettings");
    var advancedSettings = $("#advancedSettings");
    var defaultSettings = {
        adsToggle: 1,
        playerSizeToggle: 1,
        minimalModeToggle: 0,
        pinIconToggle: 1
    };
    var optionElements = Object.keys(defaultSettings);

    // NOTE: We are using computed property to generate
    // dynamic keys based on ID.
    $(quickSettings).find("input:checkbox").change(function () {
        var setting = this.id;
        if ($(this).is(":checked")) {
            console.log(setting + " is on!");
            chrome.storage.local.set({[setting]: 1});

        } else {
            console.log(this.id + " is off!");
            chrome.storage.local.set({[setting]: 0});
        }
    });

    chrome.storage.local.get(optionElements, function (settings) {
        console.log(settings, optionElements);
        for (var i = 0; i < optionElements.length; i++) {
            var option = optionElements[i];

            // Ok this might look a bit confusing. Here is what it is doing.
            // We first check of localStorage has a saved value for this option.
            // In case it does not have (which is, in the case of fresh install),
            // then we will use the default values instead.
            if (settings[option] === undefined) {
                console.log("Using default setting for: " + option);
                $("#" + option).prop("checked", !!defaultSettings[option]);
            } else {
                $("#" + option).prop("checked", !!settings[option]);
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
    
    $(advancedSettings).on("click", function () {
        chrome.tabs.create({
            url: "../../options.html"
        })
    });

    /**
     * This function is used to create sanitized pin items.
     * TODO: maybe put this inside animeUtils?
     *
     * @param name
     * @param url
     * @returns {Element}
     */
    function pinItem(name, url) {

        var pinnedItem = document.createElement("div"),
            pinnedName = document.createElement("div"),
            pinnedDeleteBtn = document.createElement("div"),
            pinnedDeleteBtnImg = document.createElement("img");

        pinnedItem.classList.add("pinned_item");
        pinnedItem.setAttribute("data-url", url);

        pinnedName.classList.add("anime_item");
        pinnedDeleteBtn.classList.add("pinned_delete");
        pinnedDeleteBtnImg.setAttribute("src", "../../assets/images/delete.png");

        pinnedDeleteBtn.appendChild(pinnedDeleteBtnImg);
        pinnedName.appendChild(document.createTextNode(name));
        pinnedItem.appendChild(pinnedName);
        pinnedItem.appendChild(pinnedDeleteBtn);

        return pinnedItem;
    }
    
    // This portion deals with binding the pinned anime list
    // onto the popup.
    // TODO: maybe this can be broken down to smaller functions?
    // TODO: maybe make getPinnedList a function in events page?
    chrome.storage.local.get({pinnedList: []}, function (values) {
        var pinned = values["pinnedList"];
        if (pinned.length > 0) {

            console.log(pinned);
            for (var i = 0; i < pinned.length; i++) {
                $(pinnedListDiv)[0].appendChild(pinItem(pinned[i].name,pinned[i].url));
            }
            
            // $(".pinned_item").on("mouseover", function () {
            //     $(this).addClass("pin_item_slide_entry").removeClass("pin_item_slide_exit");
            // });
            // $(".pinned_item").on("mouseout", function () {
            //     $(this).addClass("pin_item_slide_exit").removeClass("pin_item_slide_entry");
            // });

            $(".pinned_item .anime_item").on("click", function () {

                var url = $(this).parent().data("url");
                chrome.runtime.sendMessage({intent: "open_anime", animeUrl: url}, function (response) {
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
    });

})(jQuery);