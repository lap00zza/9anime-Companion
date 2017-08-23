/**
 * Konichiwa~
 *
 * This is script that is responsible for request blocking.
 * It is a major part of the remove ads functionality.
 */

import {loadSettings} from "./utils";

// This can be loaded from local storage or remotely.
// For remote, maybe github is good enough, or an api.
let blockListRe: RegExp[] = [];

/**
 * As the name says! This function initializes the blocklist
 * by converting the array of string filter to a array of
 * regexes.
 */
function initializeBlockList(): Promise<void> {
    return new Promise(resolve => {
        blockListRe = [];
        loadSettings("adBlockFilters").then(resp => {
            if (resp.adBlockFilters && resp.adBlockFilters.length > 0) {
                for (let filter of resp.adBlockFilters) {
                    blockListRe.push(new RegExp(filter));
                }
            }
            // console.log(blockListRe);
            resolve();
        });
    });
}

/**
 * This is the key part of request blocking. This function basically
 * listens to all the request coming from the browser, regex match them
 * against the block list and cancels them as and when required. This
 * is very much like how other adblockers work, albeit in a much simpler
 * way.
 */
function blockListener(details: chrome.webRequest.WebRequestBodyDetails) {
    for (let re of blockListRe) {
        if (re.test(details.url)) {
            // console.log("cancelled", re);
            return {cancel: true};
        }
    }
}

// Helper for {@link blockListener}
function attachBlockListener(): void {
    chrome.webRequest.onBeforeRequest.addListener(
        blockListener,
        {
            urls:  [
                "http://*/*",
                "https://*/*",
            ],
        },
        ["blocking"],
    );
}

// Helper for {@link blockListener}
function removeBlockListener(): void {
    if (chrome.webRequest.onBeforeRequest.hasListener(blockListener)) {
        chrome.webRequest.onBeforeRequest.removeListener(blockListener);
    }
}

export function updateViaLocal(filterList: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        // Set the new list to local storage and
        // restart tha adblocker.
        chrome.storage.local.set({
            adBlockFilters: filterList,
        });
        initializeBlockList().then(() => resolve());
    });
}

export function setup(): void {
    // When the extension is first loaded, it should
    // start blocking if set to true.
    loadSettings("remAds").then(resp => {
        if (resp.remAds) {
            initializeBlockList().then(() => attachBlockListener());
        }
    });

    // In case remAds setting is changed, this is a
    // good way to track the change.
    chrome.storage.onChanged.addListener(changes => {
        // NOTE: ensuring changes.remAds.oldValue is presents
        // helps us know if this change was a legit change or
        // a first install of the extension. On first install,
        // oldValue won't be present.
        if (changes.remAds && changes.remAds.hasOwnProperty("oldValue")) {
            if (changes.remAds.newValue === true) {
                initializeBlockList().then(() => attachBlockListener());
            } else {
                removeBlockListener();
            }
        }
    });
}
