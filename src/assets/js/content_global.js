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
import $ from "../lib/jquery-3.2.0.min";
import * as animeUtils from "./animeUtils";

// This content script handles global functionality like pins etc
// TODO: maybe add some animation to the anime item to indicate add success?
(function () {
    console.log("%c 9anime Companion loaded successfully", "color: orange; font-weight: bold;");

    animeUtils.loadSettings(["pinIconToggle"]).then(function (settings) {
        if (settings["pinIconToggle"]) {
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

                        animeUtils
                            .addToPinnedList(animeName, animeUrl)
                            .then(function (response) {
                                console.log(response);
                            })
                            .catch(function (response) {
                                console.log(response);
                            })

                    });
                });
        }
    });
})();