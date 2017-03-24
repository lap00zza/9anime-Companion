/**
 * Handles the functionality for the Options page.
 */
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