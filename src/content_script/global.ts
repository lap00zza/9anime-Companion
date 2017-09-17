/**
 * Konichiwa~
 *
 * This is a content script that runs directly on the page.
 * It contains the global functions/methods that can be used
 * throughout the 9anime website.
 */

import {Intent, IRuntimeMessage, IRuntimeResponse} from "../lib/common";
import * as enhancements from "../lib/enhancements";
import {loadSettings} from "../lib/utils";

console.info("9anime Companion 1.0.0 (Global Script)");

/* --- Set options for toastr --- */
toastr.options.timeOut = 10000;
toastr.options.closeButton = true;

/* --- Attach enhancements --- */
console.info("%c[✔] Attaching enhancements", "color: lightgreen;");
enhancements.globalShortcuts();
enhancements.enhancedSearch();
enhancements.scrollToTop();

loadSettings([
    "remSocialShare",
]).then(settings => {
    if (settings.remSocialShare) {
        console.info("%c[✔] Removing social share box", "color: lightgreen;");
        let socialSelectors = [
            ".addthis_native_toolbox",
            ".home-socials",
        ];
        for (let i of socialSelectors) {
            document.querySelectorAll(i).forEach(el => {
                el.remove();
            });
        }
    }
});

let changelogToast = (versionName: string) => {
    toastr.info(
        `Updated to ${versionName}.<br>` +
        "<button class='nac__toast-btn' id='nac__toast__open-changelog'>View changes</button>",
        "9anime Companion",
    );
    $("#nac__toast__open-changelog").on("click", () => {
        chrome.runtime.sendMessage({
            intent: 0,
            params: {
                goto: "Changelog",
            },
        });
    });
};

let EnableAdblockToast = () => {
    toastr.info(
        "Looks like \"Remove ads\" is not turned on. Be sure to enable it from settings.<br>" +
        "<button class='nac__toast-btn' id='nac__toast__open-settings'>Open Settings</button>",
        "9anime Companion",
    );
    $("#nac__toast__open-settings").on("click", () => {
        chrome.runtime.sendMessage({
            intent: Intent.Open_Options,
        });
    });
};

// On every page load the global content script fetches messages
// that needs to be displayed to the user.
chrome.runtime.sendMessage({
    intent: Intent.Install_Check,
}, (response: IRuntimeResponse) => {
    if (response.success && response.data) {
        switch (response.data.type) {
            case "update":
                changelogToast(response.data.versionName);
                break;

            // Reminder to turn on "Remove Ads" is only shown on fresh install.
            case "install":
                loadSettings("remAds").then(settings => {
                    if (!settings.remAds) {
                        EnableAdblockToast();
                    }
                });
                break;

            default:
                break;
        }
    }
});

// This portions deals with showing notifications on the page.
chrome.runtime.onMessage.addListener((message: IRuntimeMessage) => {
    switch (message.intent) {
        case Intent.Show_Notification:
            toastr.success(message.message, message.title);
            break;
        default:
            break;
    }
});
