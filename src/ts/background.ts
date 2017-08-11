/**
 * Konichiwa~
 *
 * This is the background script.
 */

import * as adBlocker from "./adBlocker";
import {Intent, IRuntimeMessage, IRuntimeResponse, Settings} from "./common";
import * as dlAll from "./download_all/core";
import * as mal from "./MyAnimeList/core";
import * as recentlyWatched from "./recently_watched";
import RedditDiscussion from "./reddit_discussion";
import {cleanAnimeName, joinURL} from "./utils";

export type SendResponse = (param: IRuntimeResponse) => void;

/* --- Initialize other background services --- */
adBlocker.setup();

/***
 * This is the background listener. It listens to the messages sent
 * by content script and friends and act accordingly. It also sends
 * out messages to tabs/content scripts when required.
 */
chrome.runtime.onMessage.addListener((message: IRuntimeMessage, sender, sendResponse: SendResponse) => {
    // Probably a validation for whether the required
    // object properties are present or missing?
    switch (message.intent) {
        case Intent.AdBlocker_UpdateFilter_Local:
            adBlocker
                .updateViaLocal(message.filterList)
                .then(() => sendResponse({
                    success: true,
                }));
            return true;

        /**************************************************************************************************************/
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

        /**************************************************************************************************************/
        case Intent.Reddit_Discussion:
            let redditSearchUrl = new RedditDiscussion(message.animeName, message.episode, message.altNames).url();
            chrome.tabs.create({
                url: redditSearchUrl,
            });
            break;

        case Intent.Find_In_Mal:
            chrome.tabs.create({
                url: "https://myanimelist.net/anime.php?q=" + cleanAnimeName(message.animeName),
            });
            break;

        case Intent.Find_In_Kitsu:
            chrome.tabs.create({
                url: "https://kitsu.io/anime?text=" + cleanAnimeName(message.animeName),
            });
            break;

        /**************************************************************************************************************/
        case Intent.Open_Options:
            // TODO: should only 1 settings page be allowed open at a time
            // The way this works is, if message.params is not present the
            // url to open is url of "dashboard.html". If message.params is
            // present, the url to open is same as above with the search
            // params added to it.
            let url = chrome.runtime.getURL("dashboard.html");
            if (message.params && typeof message.params === "object") {
                url = joinURL(url, message.params);
            }
            chrome.tabs.create({
                url,
            });
            break;

        /**************************************************************************************************************/
        case Intent.Recently_Watched_Add:
            recentlyWatched.addToList({
                animeId: message.animeId,
                animeName: message.animeName,
                epId: message.epId,
                epNum: message.epNum,
                timestamp: new Date().toISOString(),
                url: message.url,
            });
            break;

        case Intent.Recently_Watched_List:
            sendResponse({
                data: recentlyWatched.getList(),
                success: true,
            });
            break;

        case Intent.Recently_Watched_Remove:
            let isRemoved = recentlyWatched.removeFromList(message.animeId);
            let count =  recentlyWatched.listCount();
            sendResponse({
                data: count,
                success: isRemoved,
            });
            break;

        /**************************************************************************************************************/
        case Intent.MAL_QuickAdd:
            mal
                .quickAdd(message.animeId)
                .then(() => sendResponse({
                    success: true,
                }))
                .catch((err: number) => {
                    sendResponse({
                        success: false,
                        err,
                    });
                });
            // means we want to return the response
            // asynchronously.
            return true;

        case Intent.MAL_QuickUpdate:
            mal
                .quickUpdate(message.animeId, message.episode)
                .then(() => sendResponse({
                    success: true,
                }))
                .catch((err: number) => {
                    sendResponse({
                        success: false,
                        err,
                    });
                });
            return true;

        case Intent.MAL_Userlist:
            mal
                .getUserList()
                .then(resp => sendResponse({
                    data: resp,
                    success: true,
                }))
                .catch((err: number) => {
                    sendResponse({
                        success: false,
                        err,
                    });
                });
            return true;

        case Intent.MAL_Search:
            mal
                .search(message.animeName)
                .then(resp => sendResponse({
                    data: resp,
                    success: true,
                }))
                .catch((err: number) => {
                    sendResponse({
                        success: false,
                        err,
                    });
                });
            return true;

        case Intent.MAL_VerifyCredentials:
            mal
                .verify(message.username, message.password)
                .then(resp => sendResponse({
                    success: true,
                }))
                .catch((err: number) => {
                    sendResponse({
                        success: false,
                        err,
                    });
                });
            return true;

        case Intent.MAL_RemoveCredentials:
            mal.removeCredentials();
            sendResponse({
                success: true,
            });
            break;

        /**************************************************************************************************************/
        default:
            console.info("Intent not valid");
            break;
    }
});

chrome.runtime.onInstalled.addListener(details => {
    // TODO: in 1.0, the old settings are better off deleted
    // chrome.storage.local.clear();
    switch (details.reason) {
        case "install":
            console.info(
                "%cNew install: Saving default settings to localStorage",
                "color: lightgreen;");
            chrome.storage.local.set(Settings);
            break;
        case "update":
            console.info(
                "%cUpdate: Preserving old settings and adding new ones",
                "color: lightgreen;");
            break;
        default:
            break;
    }
});
