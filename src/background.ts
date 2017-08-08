/**
 * Konichiwa~
 *
 * This is the background script.
 */

import {Intent, IRuntimeMessage, IRuntimeResponse, Settings} from "./common";
import * as dlAll from "./download_all/core";
import * as mal from "./MyAnimeList/core";
import * as recentlyWatched from "./recently_watched";
import RedditDiscussion from "./reddit_discussion";
import {cleanAnimeName, loadSettings} from "./utils";

export type SendResponse = (param: IRuntimeResponse) => void;

/***
 * This is the background listener. It listens to the messages sent
 * by content script and friends and act accordingly. It also sends
 * out messages to tabs/content scripts when required.
 */
chrome.runtime.onMessage.addListener((message: IRuntimeMessage, sender, sendResponse: SendResponse) => {
    // Probably a validation for whether the required
    // object properties are present or missing?
    switch (message.intent) {
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
            chrome.tabs.create({
                url: chrome.runtime.getURL("dashboard.html"),
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

// --- ^.^ Request Blocking ^.^ ---
// This can be loaded from local storage or remotely.
// For remote, maybe github is good enough, or an api.
let blockList = [
    "(http|https):\/\/([a-z0-9]+[.])*af2f04d5bdd\.com",
    "(http|https):\/\/([a-z0-9]+[.])*mgid\.com",
    "(http|https):\/\/([a-z0-9]+[.])*revcontent\.com",
    "(http|https):\/\/([a-z0-9]+[.])*bebi\.com",
    "(http|https):\/\/([a-z0-9]+[.])*2mdnsys\.com",
    "(http|https):\/\/([a-z0-9]+[.])*scorecardresearch\.com",
    "(http|https):\/\/([a-z0-9]+[.])*quantserve\.com",
    "(http|https):\/\/([a-z0-9]+[.])*amung\.us",
    "(http|https):\/\/([a-z0-9]+[.])*e2ertt\.com",
    "(http|https):\/\/([a-z0-9]+[.])*cdnads\.com",
    "(http|https):\/\/([a-z0-9]+[.])*addthis\.com",
    "(http|https):\/\/([a-z0-9]+[.])*oclasrv\.com",
    "(http|https):\/\/([a-z0-9]+[.])*onclkds\.com",
    "(http|https):\/\/([a-z0-9]+[.])*pippio\.com",
    "(http|https):\/\/([a-z0-9]+[.])*bluekai\.com",
    "(http|https):\/\/([a-z0-9]+[.])*exelator\.com",
    "(http|https):\/\/([a-z0-9]+[.])*narrative\.io",
    "(http|https):\/\/([a-z0-9]+[.])*agkn\.com",
];
let blockListRe: RegExp[] = [];

for (let filter of blockList) {
    blockListRe.push(new RegExp(filter, "i"));
}

let blockListener = (details: chrome.webRequest.WebRequestBodyDetails) => {
    for (let re of blockListRe) {
        if (re.test(details.url)) {
            // console.log("cancelled", re);
            return {cancel: true};
        }
    }
};

let addBlockListener = () => {
    chrome.webRequest.onBeforeRequest.addListener(
        blockListener,
        {urls:  ["<all_urls>"]},
        ["blocking"],
    );
};

let removeBlockListener = () => {
    if (chrome.webRequest.onBeforeRequest.hasListener(blockListener)) {
        chrome.webRequest.onBeforeRequest.removeListener(blockListener);
    }
};

// When the extension is first loaded, it should
// start blocking if set to true.
loadSettings("remAds").then(resp => {
    if (resp.remAds) {
        addBlockListener();
    }
});

// In case remAds setting is changed, this is a
// good way to track the change.
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (changes.remAds) {
        if (changes.remAds.newValue === true) {
            addBlockListener();
        } else {
            removeBlockListener();
        }
    }
});
// --- End Request Blocking ---

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
