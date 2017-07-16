/**
 * Konichiwa~
 *
 * This is the background script.
 */

import {IGenericObject, Intent, IRuntimeMessage} from "./common";
import * as dlAll from "./download_all";

/***
 * Before sending a message to a tab, we need to perform some
 * validations. This wrapper function helps with that.
 * @param sender
 * @param data
 */
function sendMessage(sender: chrome.runtime.MessageSender, data: IGenericObject) {
    if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, data);
    }
}

/***
 * This is the background listener. It listens to the messages sent
 * by content script and friends and act accordingly. It also sends
 * out messages to tabs/content scripts when required.
 */
chrome.runtime.onMessage.addListener((message: IRuntimeMessage, sender, sendResponse) => {
    switch (message.intent) {
        case Intent.Download_All:
            dlAll.setup({
                animeName: message.animeName,
                currentServer: message.currentServer,
                method: message.method,
                quality: message.quality,
                selectedEpisodes: message.selectedEpisodes,
                ts: message.ts,
            });
            dlAll.start(message.baseUrl).then(resp => {
                sendMessage(sender, {intent: resp});
            });
            break;
        default:
            console.info("Intent not valid");
            break;
    }
});
