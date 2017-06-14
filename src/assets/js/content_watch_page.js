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
import { MyAnimeListWidget as MALWidget, BindMALEvents } from "./MyAnimeList/Widget";

// This script handles all the functionality in the watch page.
(function () {

    // All the selectors are placed together so that if in case 9anime
    // changes anything in the future we can easily update it.
    var player = $("#player"),
        infoDiv = $("#info"),
        movieDiv = $("#movie"),
        commentDiv = $("#comment"),
        servers = $("#servers"),
        titleDiv = $("h1.title"),
        suggestedDiv =
            $(movieDiv)
                .find("div.widget-title")
                .filter(function () {
                    if ($(this).text() === "You might also like") {
                        return this;
                    }
                })
                .parent();

    // Extract all the information about the current
    // anime. This is extracted from the definition
    // lists found in #info
    var animeInfo = {};
    $(infoDiv).find("dl dt").each(function () {
        var key = $(this).text();
        var value = [];
        $(this).nextUntil("dt").each(function () {
            value.push($(this).text());
        });
        animeInfo[key] = value;
    });
    // console.log(animeInfo);

    // Web Accessible Resource URL's
    var pinImage = chrome.extension.getURL("assets/images/pin.png"),
        redditLogo = chrome.extension.getURL("assets/images/reddit-icon.png"),
        malLogo = chrome.extension.getURL("assets/images/mal-icon.png"),
        loader = chrome.extension.getURL("assets/images/loader.svg"),
        downloadIcon = chrome.extension.getURL("assets/images/download.png");

    /******************************************************************************************************************/
    // Custom Objects
    // --------------
    /**
     * Attaches common modal behaviours. All modals using this are expected to have
     *  - class => identifier_container
     *  - class => identifier_close
     *  where, identifier represents the modal identifier
     *
     * @param {jQuery} modal - The jQuery selector of the modal
     * @param {String} identifier - The preface id for this modal
     * @private
     */
    function _9ac_modal(modal, identifier){
        // capture this scope
        var that = this;

        that.entry = function () {
            $(modal).css({display: "block"});
            $(modal).find(`.${identifier}_container`).addClass("fadeInFromTop");
            setTimeout(function () {
                $(modal).find(`.${identifier}_container`).removeClass("fadeInFromTop");
            }, 500);
        };


        that.exit = function () {
            $(modal).find(`.${identifier}_container`).addClass("fadeOutToTop");
            setTimeout(function () {
                $(modal).css({display: "none"});
                $(modal).find(`.${identifier}_container`).removeClass("fadeOutToTop");
            }, 500);
        };

        that.shake = function () {
            $(modal).find(`.${identifier}_container`).addClass("shake");
            setTimeout(function () {
                $(modal).find(`.${identifier}_container`).removeClass("shake");
            }, 820);
        };

        // Modal Behaviour
        // Close modal when user clicks outside the container
        $(modal).on("click", function (e) {
            if (e.target === modal[0]) {
                that.exit();
            }
        });

        // Close the modal when user clicks close
        $(modal).find(`.${identifier}_close`).on("click", function () {
            that.exit();
        });
    }
    
    /******************************************************************************************************************/
    // Runtime Listeners
    //noinspection JSCheckFunctionSignatures
    chrome.runtime.onMessage.addListener(function (request) {
        var dla_footer_progress = $("#dla_footer_progress");

        switch (request.intent) {
            case "9ac-dla-mal_dl_over":
                $(dla_footer_progress).hide();
                break;

            case "9ac-dla-mal_external_dl_links":
                // Validation
                if (request.links && request.links instanceof Array) {
                    // Generate the Modal
                    // medl = mal external download links
                    $("body").append(
                        `<div id="medl_popup" style="display: none;">
                        <div class="medl_container">
                            <div class="medl_header">
                                Make sure to <a href="https://github.com/lap00zza/9anime-Companion/wiki" 
                                target="_blank">read the wiki</a> on how to set up external downloaders.
                            </div>
                            <div class="medl_links">
                                <textarea readonly id="medl_links_text">${request.links.join("\n")}</textarea>
                            </div>
                            <div class="medl_footer">
                                <button type="button" id="medl_copy">Copy to clipboard</button>
                                <button type="button" class="medl_close">Close</button>
                            </div>
                        </div>
                    </div>`
                    );

                    var medl_modal = new _9ac_modal($("#medl_popup"), "medl");
                    medl_modal.entry();

                    // Hide the download in progress footer
                    $(dla_footer_progress).hide();

                    // Copy Functionality
                    $("#medl_copy").on("click", function () {
                        try {
                            $("#medl_links_text").select();
                            document.execCommand("copy");
                        } catch (e) {
                            console.warn("Error in medl_copy: ", e);
                        }
                    });
                }
                break;
        }
    });

    /******************************************************************************************************************/
    // Load Settings.
    animeUtils.loadSettings().then(function (settings) {
        function playerResizer() {
            $(player).parent().css({width: "100%"});
        }

        // Minimal Mode
        // This mode will also remove ads and resize/center player,
        // regardless of whether this option is chosen or not.
        if (settings["minimalModeToggle"]) {
            $(suggestedDiv).remove();
            $(commentDiv).remove();
            $(infoDiv).remove();
            $(titleDiv).remove();
            $(servers).parent().css({width: "100%"});

            playerResizer();
        }

        // If Minimal Mode is disabled, then run these as per user
        // customization.
        if (!settings["minimalModeToggle"]) {
            // Player Resizer
            if (settings["playerSizeToggle"]) {
                playerResizer();
            }

            // Remove comments
            if (settings["commentsToggle"]) {
                $(commentDiv).remove();
            }

            // Remove You Might Also Like
            if (settings["youMightAlsoLikeToggle"]) {
                $(suggestedDiv).remove();
            }
        }

        /**************************************************************************************************************/
        // UTILITY BAR
        // -----------
        // This portion deals with attaching the utility bar
        // at the bottom of the player. This bar provide quite
        // a few functionality like pin etc.
        if (settings["utilityBarToggle"]) {
            if ($(player).length > 0) {
                $(player)
                    .parent()
                    .append(
                        `<div class="player_utilities">
                            <!--<div class="utility_header">Utility Bar:</div>-->
                            <div id="pin_utility" class="utility_item">
                                <img src='${pinImage}'>
                                Pin This
                            </div>
                            <div id="reddit_disc_utility" class="utility_item">
                                <img src='${redditLogo}'>
                                Reddit Discussion
                            </div>
                            <div id="mal_search_utility" class="utility_item">
                                <img src='${malLogo}'>
                                Find in MAL
                            </div>
                            <div id="download_all_utility" class="utility_item">
                                <img src='${downloadIcon}'>
                                Download All
                            </div>
                        </div>`
                    )
                    .promise()
                    .done(function () {
                        var animeName = $(titleDiv).text() || null;

                        $("#pin_utility").on("click", function () {
                            // var animeUrl = document.location.href || "";

                            // Why do this and not just take the document.location.href?
                            // Well if we take that, then it will also contain the parts
                            // added to the main url to specify episode number (which we are
                            // not interested in)
                            var animeUrl = $("meta[property='og:url']").attr("content");
                            // console.log(animeUrl);

                            animeUtils
                                .addToPinnedList(animeName, animeUrl)
                                // .then(function (response) {
                                //     console.log(response);
                                // })
                                .catch(function (response) {
                                    console.error(response);
                                });
                        });

                        // The current behaviour is as follows:
                        // If the url contains episodeId portion, for example: /watch/gintama.5kq/llrp3n
                        // then it will open episode discussion. Else it will open general discussion.
                        // TODO: maybe use simple <a href> instead of using chrome.tabs?
                        $("#reddit_disc_utility").on("click", function () {
                            var alternateNames = [];
                            var urlDetails = animeUtils.extractIdFromUrl(document.location.href);
                            var currentlyWatching = $(servers).find(`[data-id='${urlDetails.episodeId}']`).data("base");

                            if (animeInfo["Other names:"] && animeInfo["Other names:"].length > 0) {

                                // Why the 0th Index? Because all the values are stored
                                // as arrays.
                                animeInfo["Other names:"][0].split(";").forEach(function (name) {

                                    // We don't want the leading and trailing spaces.
                                    // So we trim it.
                                    var trimmedName = name.trim();

                                    // We need this check because we don't want to add
                                    // blank strings to the alternate names.
                                    if (trimmedName) {
                                        alternateNames.push(trimmedName);
                                    }
                                });
                            }

                            var requestObj = {
                                intent: "openRedditDiscussion",
                                animeName: animeName,
                                alternateNames: alternateNames,
                                episode: currentlyWatching
                            };

                            chrome.runtime.sendMessage(
                                requestObj
                                // , function (response) {
                                //     console.log(response.result);
                                // }
                            );
                        });

                        $("#mal_search_utility").on("click", function () {
                            var requestObj = {
                                intent: "findInMal",
                                animeName: animeName
                            };

                            chrome.runtime.sendMessage(
                                requestObj
                                // , function (response) {
                                //     console.log(response.result);
                                // }
                            );
                        });

                        /**********************************************************************************************/
                        // DOWNLOAD ALL
                        // We are not going to put the Modal generation inside the click handler
                        // because there is no need to generate the contents every time. Instead
                        // we generate it once on load, here.
                        var episodes = [];
                        $(servers)
                            // We are only interested in the direct
                            // file server downloads. And not the iframe ones
                            // like openload etc.
                            .find(".server.row[data-type='direct']")
                            // There are usually 2 direct servers, f1 and f2
                            // we select the first one for now
                            .first()
                            .find(".episodes.range li > a")
                            .each(function () {
                                episodes.push({
                                    id: $(this).data("id"),
                                    number: $(this).data("base")
                                });
                            });


                        var epCheckBoxes = document.createElement("div");
                        epCheckBoxes.classList.add("epCheckBoxes");

                        episodes.forEach(function (episode) {
                            var checkItem = document.createElement("div");
                            checkItem.classList.add("check_item");

                            var checkBox = document.createElement("input");
                            var label = document.createElement("label");

                            checkBox.setAttribute("type", "checkbox");
                            checkBox.id = "dl_option_" + episode.id;
                            checkBox.dataset.id = episode.id;
                            checkBox.dataset.number = episode.number;

                            label.setAttribute("for", "dl_option_" + episode.id);
                            label.appendChild(document.createTextNode("Episode " + episode.number));

                            checkItem.append(checkBox);
                            checkItem.append(label);

                            epCheckBoxes.append(checkItem);
                        });

                        // console.log(episodes);

                        $("body").append(
                            `<div id="download_all_options" style="display: none">
                                <div class="dla_container">
                                    <div class="title">Select Episodes<span aria-hidden="true" class="dla_close">&times;</span></div>
                                    <div class="content">
                                        
                                    </div>
                                    <div class="footer"> 
                                        <div id="dla_footer_progress" style="display: none">
                                            <img src="${loader}">
                                            Please wait
                                        </div>
                                        <a class="footer_item" id="dla_select_all_episodes">Toggle Select All</a>
                                        <div class="footer_item">
                                            <span>Quality</span>
                                            <select id="dla_quality_select">
                                                <option value="360p">360p</option>
                                                <option value="480p">480p</option>
                                                <option value="720p">720p</option>
                                                <option value="1080p">1080p</option>
                                            </select>
                                        </div>
                                        <div class="footer_item">
                                            <span>Downloader</span>
                                            <select id="dla_method_select">
                                                <option value="browser">Default</option>
                                                <option value="external">External</option>
                                            </select>
                                        </div>
                                        <a class="footer_item" id="dla_start_download">Download</a>
                                    </div>
                                </div>
                            </div>`
                        );

                        var download_all_options = $("#download_all_options");

                        // Initialize our modal
                        var dla_modal = new _9ac_modal(download_all_options, "dla");

                        $(download_all_options).find(".content").append(epCheckBoxes);

                        // Click listener for download all utility
                        $("#download_all_utility").on("click", function () {
                            dla_modal.entry();
                        });

                        /**********************************************************************************************/
                        // Click listener to start download
                        $("#dla_start_download").on("click", function () {
                            var selected = [];
                            var quality = $("#dla_quality_select").val();
                            var method = $("#dla_method_select").val();

                            $("#download_all_options")
                                .find(".content input[type='checkbox']:checked")
                                .each(function () {
                                    selected.push({
                                        id: $(this).data("id"),
                                        number: $(this).data("number")
                                    });
                                });

                            // console.log(selected);

                            // Coz', what's the use of starting downloads with
                            // no episodes.
                            if (selected.length === 0) {
                                dla_modal.shake();

                            } else {
                                chrome.runtime.sendMessage({
                                    intent: "downloadFiles",
                                    episodes: selected,
                                    animeName: animeName,
                                    quality: quality,
                                    method: method,
                                    ts: $("body").data("ts"),

                                    // document.location.origin should work in firefox
                                    baseUrl: document.location.origin
                                });

                                // Show the download in progress footer
                                $("#dla_footer_progress").show();
                                
                                // Remove stale external dl popup if exists
                                $("#medl_popup").remove();
                            }
                        });

                        /**********************************************************************************************/
                        // This handles the toggle select all episodes. Coz'
                        // only select all with no deselect all is PTSD inducing.
                        var dla_sel_state = false;
                        $("#dla_select_all_episodes").on("click", function () {
                            if (dla_sel_state) {
                                $("#download_all_options")
                                    .find(".content input[type='checkbox']")
                                    .prop("checked", false);
                            } else {
                                $("#download_all_options")
                                    .find(".content input[type='checkbox']")
                                    .prop("checked", true);
                            }
                            dla_sel_state = !dla_sel_state;
                        });
                    });
            }

        }

        /**************************************************************************************************************/
        // MAL INTEGRATION
        // ---------------
        // This portion is responsible for the MyAnimeList integration
        // which adds features such as updating and adding anime to
        // user's MAL.
        if (settings["malIntegrationToggle"]) {
            if ($(player).length > 0) {
                BindMALEvents();
                
                var malWidget = new MALWidget($(titleDiv).text());
                // var malWidget2 = new MALWidget($(titleDiv).text());

                $(player).parent().append(malWidget);
                // $(player).parent().append(malWidget2);
            }
        }
    });
})();
