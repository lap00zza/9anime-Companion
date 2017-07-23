/**
 * Konichiwa~
 *
 * This is the background script.
 */

import {Intent, IRuntimeMessage, Settings} from "./common";
import * as dlAll from "./download_all/core";
import * as recentlyWatched from "./recently_watched";
import RedditDiscussion from "./reddit_discussion";
import {getSlug} from "./utils";

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

        case Intent.Reddit_Discussion:
            let redditSearchUrl = new RedditDiscussion(message.animeName, message.episode, message.altNames).url();
            chrome.tabs.create({
                url: redditSearchUrl,
            });
            break;

        case Intent.Find_In_Mal:
            chrome.tabs.create({
                url: "https://myanimelist.net/anime.php?q=" + message.animeName,
            });
            break;

        case Intent.Find_In_Kitsu:
            chrome.tabs.create({
                url: "https://kitsu.io/anime/" + getSlug(message.animeName),
            });
            break;

        case Intent.Recently_Watched_Add:
            recentlyWatched.register({
                animeId: message.animeId,
                animeName: message.animeName,
                epId: message.epId,
                epNum: message.epNum,
                timestamp: new Date().toISOString(),
                url: message.url,
            });
            break;

        case Intent.Recently_Watched_List:
            sendResponse(recentlyWatched.getList());
            break;

        case Intent.Recently_Watched_Remove:
            sendResponse(recentlyWatched.removeFromList(message.animeId));
            break;

        default:
            console.info("Intent not valid");
            break;
    }
});

chrome.runtime.onInstalled.addListener(details => {
    console.info("%cSaving default settings to localStorage", "color: lightgreen");
    chrome.storage.local.set(Settings);
   // switch (details.reason) {
   //     case "install":
   //         console.info("%cNew install: Saving default settings to localStorage", "lightgreen");
   //         chrome.storage.local.set(Settings);
   //         break;
   //     case "update":
   //         console.info("update");
   //         break;
   //     default:
   //         break;
   // }
});
