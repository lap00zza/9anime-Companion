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

// Handles the functionality for the Options page.
// TODO: Use storage.sync for the settings
(function () {
    var optionsWindow = $("#optionsWindow");
    var optionElements = [
        "minimalModeToggle",
        "adsToggle",
        "playerSizeToggle",
        "shareBarToggle",
        "commentsToggle",
        "youMightAlsoLikeToggle"
    ];

    // Initialize bootstrap tooltips
    $("[data-toggle='tooltip']").tooltip();

    // NOTE: We are using computed property to generate
    // dynamic keys based on ID.
    $(optionsWindow).find("input:checkbox").change(function () {
        var key = this.id;
        var checked = $(this).is(":checked");

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

        // This will run for everything, regardless of
        // what the key is.
        if (checked) {
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

                // We bind the value and trigger the change event so that
                // any listeners which might say disable/enable the slide
                // buttons wont need any separate code and instead stay on
                // the "change" event only.
                $("#" + key).prop("checked", !!(keys[key])).trigger("change");
            }
        }
    });
})();