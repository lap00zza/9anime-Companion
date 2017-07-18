/**
 * Konichiwa~
 *
 * This is the background script.
 */

import {Intent, IRuntimeMessage} from "./common";
import * as dlAll from "./download_all";

/***
 * This is the background listener. It listens to the messages sent
 * by content script and friends and act accordingly. It also sends
 * out messages to tabs/content scripts when required.
 */
chrome.runtime.onMessage.addListener((message: IRuntimeMessage, sender, sendResponse) => {
    // Probably a validation for whether the required
    // object properties are present or missing?
    switch (message.intent) {
        case Intent.Download_All:
            let setupOptions = {
                animeName: message.animeName,
                method: message.method,
                quality: message.quality,
                selectedEpisodes: message.selectedEpisodes,
                sender,
                server: message.server,
                ts: message.ts,
            };
            dlAll.start(message.baseUrl, setupOptions);
            break;
        default:
            console.info("Intent not valid");
            break;
    }
});
