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
import "../lib/bootstrap/js/bootstrap.min";
import * as animeUtils from "./animeUtils";

(function () {
    // Handles the functionality for the Options page.
// TODO: Use storage.sync for the settings
    var optionsWindow = $("#optionsWindow");
    var loader = chrome.extension.getURL("assets/images/loader.svg");

// Initialize bootstrap tooltips
    $("[data-toggle='tooltip']").tooltip();

// TODO: document this function
    $("#mal_cred_form").on("submit", function (event) {
        event.preventDefault();

        var submitBtn = $(this).find("button[type='submit']");
        var statusWindow = $(this).find(".status");

        // Disable the submit button so that verification
        // checks to the api can't be spammed. Also, show
        // the loading animation to indicate that
        // verification is underway.
        $(submitBtn).attr("disabled", true);
        $(statusWindow).empty().append(`<img src='${loader}'>`);

        var username = $("#malUserName").val().trim();
        var password = $("#malPassword").val();

        console.log(username, password);
        // Send off verification check to the background
        chrome.runtime.sendMessage({
            intent: "verifyAndSetCredentials",
            username: username,
            password: password

        }, function (response) {
            if (response.result === "success") {

                $(statusWindow).empty().text("Success");
                $("#mal_verified_status").text("Verified");

                // Hide the verify button and show the
                // remove credentials button
                $(submitBtn).css({display: "none"});
                $("#_remove_mal_credentials_").css({display: "block"});

                // Once verified the username and password
                // fields are to remain read only.
                $("#malUserName").val("").attr("disabled", true);
                $("#malPassword").val("").attr("disabled", true);

            } else {
                console.log(response);
                $(submitBtn).removeAttr("disabled");
                $(statusWindow).empty().text("Verification failed");
            }
        });

    });

    $("#_remove_mal_credentials_").on("click", function () {
        chrome.runtime.sendMessage({intent: "removeMALCredentials"});
        $("#mal_verified_status").text("Not Verified");

        // Hide the verify button and show the
        // remove credentials button
        $("#_submit_mal_credentials_").css({display: "block"});
        $("#_remove_mal_credentials_").css({display: "none"});

        // Once verified the username and password
        // fields are to remain read only.
        $("#malUserName").removeAttr("disabled");
        $("#malPassword").removeAttr("disabled");
    });

    $(optionsWindow).find("input:checkbox").change(function () {
        var key = this.id;
        var checked = $(this).is(":checked");

        // TODO: turning on MAL integration should ask for permission to access MAL Website
        switch (key) {
            case "minimalModeToggle":
                if (checked) {
                    $("#adsToggle").prop("disabled", "true").parent().addClass("slide-disabled");
                    $("#playerSizeToggle").prop("disabled", "true").parent().addClass("slide-disabled");
                    $("#shareBarToggle").prop("disabled", "true").parent().addClass("slide-disabled");
                    $("#commentsToggle").prop("disabled", "true").parent().addClass("slide-disabled");
                    $("#youMightAlsoLikeToggle").prop("disabled", "true").parent().addClass("slide-disabled");

                } else {
                    $("#adsToggle").removeAttr("disabled").parent().removeClass("slide-disabled");
                    $("#playerSizeToggle").removeAttr("disabled").parent().removeClass("slide-disabled");
                    $("#shareBarToggle").removeAttr("disabled").parent().removeClass("slide-disabled");
                    $("#commentsToggle").removeAttr("disabled").parent().removeClass("slide-disabled");
                    $("#youMightAlsoLikeToggle").removeAttr("disabled").parent().removeClass("slide-disabled");
                }
                break;
        }

        // This will run for everything.
        // NOTE: We are using computed property names
        // to generate dynamic keys based on ID.
        if (checked) {
            console.log(key + " is on!");
            chrome.storage.local.set({[key]: 1});
        } else {
            console.log(this.id + " is off!");
            chrome.storage.local.set({[key]: 0});
        }
    });

    animeUtils.loadSettings().then(function (settings) {
        Object.keys(settings).forEach(function (key) {
            // We bind the value and trigger the change event so that
            // any listeners which might say disable/enable the slide
            // buttons wont need any separate code and instead stay on
            // the "change" event only.
            $("#" + key).prop("checked", !!(settings[key])).trigger("change");
        });
    });

// Display welcome notice or update log
    chrome.storage.local.get([
        "installType",
        "installedOn",
        "installModalShown",
        "malUsername",
        "malPassword"
    ], function (result) {
        // TODO: work on the fresh install modal later
        // if(result["installType"] === "fresh" && result["installModalShown"] === false) {
        //     $("#fresh_install_modal").modal();
        //     chrome.storage.local.set({installModalShown: true});
        // }

        // Lets focus on the update modal for now
        if (result["installType"] === "update" && result["installModalShown"] === false) {
            $("#update_install_modal").modal();
            chrome.storage.local.set({installModalShown: true});
        }
        console.log(result);

        if (result["malUsername"] && result["malPassword"]) {

            $("#mal_verified_status").text("Verified");

            // Hide the verify button and show the
            // remove credentials button
            $("#_submit_mal_credentials_").css({display: "none"});
            $("#_remove_mal_credentials_").css({display: "block"});

            // Once verified the username and password
            // fields are to remain read only.
            $("#malUserName").attr("disabled", true);
            $("#malPassword").attr("disabled", true);
        }
    });
})();