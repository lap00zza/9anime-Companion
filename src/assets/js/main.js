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
/*global chrome*/
import $ from "../lib/jquery-3.2.0.min";
import * as animeUtils from "./animeUtils";

// Handles the functionality withing the main popup UI.
var animeLink = $("#anime-link-image");
var settingsBtn = $("#settingsWindowToggle");
var pinnedListDiv = $("#pinnedList");

// Click Handlers
$(animeLink).on("click", function () {
    chrome.tabs.create({
        "url": "https://9anime.to"
    });
});

$(settingsBtn).on("click", function () {
    chrome.runtime.sendMessage({intent: "openOptions"});
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
chrome.storage.local.get({
    pinnedList: []

}, function (values) {
    var pinned = values["pinnedList"];
    if (pinned.length > 0) {

        // console.log(pinned);
        for (var i = 0; i < pinned.length; i++) {
            $(pinnedListDiv)[0].appendChild(pinItem(pinned[i].name, pinned[i].url));
        }

        $(".pinned_item .anime_item").on("click", function () {
            var url = $(this).parent().data("url");
            if (animeUtils.isUrl(url)) {
                chrome.tabs.create({
                    "url": url
                });
            }
        });

        $(".pinned_item .pinned_delete").on("click", function () {
            var that = this;
            var url = $(this).parent().data("url");

            animeUtils
                .removeFromPinnedList(url)
                .then(function (response) {
                    if (response.result === "success") {
                        $(that).parent().addClass("deleting_exit");
                        setTimeout(function () {
                            $(that).parent().remove();
                        }, 500);
                    }
                    if (response.itemCount === 0) {
                        $(pinnedListDiv).css({background: "url('../../assets/images/no_item_banner.png')"});
                    }
                })
                .catch(function (response) {
                    console.error(response);
                });

        });

    } else {
        // console.log("Wew no anime!");
        $(pinnedListDiv).css({background: "url('../../assets/images/no_item_banner.png')"});
    }
});
