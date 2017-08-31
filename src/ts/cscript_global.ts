/**
 * Konichiwa~
 *
 * This is a content script that runs directly on the page.
 * It contains the global functions/methods that can be used
 * throughout the 9anime website.
 */

import * as enhancements from "./enhancements";
import {loadSettings} from "./utils";

console.info("9anime Companion 1.0.0 (Global Script)");

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
