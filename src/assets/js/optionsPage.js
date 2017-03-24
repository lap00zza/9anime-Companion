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
    var optionsWindow = $("#options");
    var optionElements = ["minimalModeToggle", "adsToggle", "playerSizeToggle"];
    
    // NOTE: We are using computed property to generate
    // dynamic keys based on ID.
    $(optionsWindow).find("input:checkbox").change(function () {
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
})();