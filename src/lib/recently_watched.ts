/**
 * Konichiwa~
 *
 * This module is responsible for Recently Watched. Recently
 * watched is basically a collection of all the anime's that
 * you have watched in the recent past sorted by watch count.
 *
 * IMPORTANT:
 * This module relies on a persistent state. So it must be
 * called in the background script. Don't call this from any
 * content script/popup.
 */
import {IRecentlyWatched} from "./common";

/**
 * Limiting the maximum amount of recently watched to 20, since
 * beyond that people dont really care. Later on, I might add a
 * way to change this number via the settings page.
 */
let MAX_ITEMS = 10;
let watchList: IRecentlyWatched[] = [];

// This is the initialization function. Its IIFE since
// it must execute right away. It is responsible for
// loading the recentlyWatched list to memory.
(() => {
    // we initialize with default value in case
    // our recentlyWatched is empty.
    chrome.storage.local.get({recentlyWatched: []}, result => {
        watchList = result.recentlyWatched;
    });
})();

/**
 * Commit the current watchList to the chrome.local storage.
 */
function commit(): void {
    chrome.storage.local.set({recentlyWatched: watchList});
}

export function setMaxItems(amount: number): void {
    MAX_ITEMS = amount;
}

export function listCount(): number {
    return watchList.length;
}

export function clearList(): void {
    watchList = [];
    commit();
}

/**
 * Get the recently watched anime's. Remember, getList returns
 * anime's from watchList which is stored in memory. It does
 * not read it from chrome.local storage everytime. So if
 * chrome.local storage is manually modified, the changes
 * **WONT BE REFLECTED**.
 * @param items
 *      The amount of anime's to return.
 *      Defaults to 10.
 */
export function getList(items = 10): IRecentlyWatched[] {
    // since sort edits arrays in place, we
    // copy it to a different variable.
    let sorted = Array.from(watchList);
    sorted.sort((a, b) => {
        // Turn timestamp strings into dates, and
        // then subtract them to get a value that
        // is either negative, positive, or zero.
        return new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf();
    });
    return sorted.slice(0, items);
}

/**
 * Adds a item to the watchList. If item already exists, the
 * count is incremented by 1.
 * @param params
 *      id, name and path
 */
export function addToList(params: IRecentlyWatched): void {
    // Check if all properties are present.
    if (!params.animeId || !params.animeName || !params.url) {
        throw new Error("[Recently Watched] [Error] animeId, animeName and url must be present.");
    }

    // Check if same id exists. If it does then
    // change epId, epNum and ts. else push.
    for (let item of watchList) {
        if (item.animeId === params.animeId) {
            item.epId = params.epId;
            item.epNum = params.epNum;
            item.timestamp = params.timestamp || new Date().toISOString();
            commit();
            return;
        }
    }

    // Since the watchlist contains items that are
    // chronologically added to it, that means the
    // oldest entry will be the first one. So we
    // shift() it to remove the first item.
    if (watchList.length >= MAX_ITEMS) {
        watchList.shift();
    }

    watchList.push({
        // FIXME: some animeId's are being stored as number
        animeId: params.animeId,
        animeName: params.animeName,
        epId: params.epId,
        epNum: params.epNum,
        timestamp: params.timestamp || new Date().toISOString(),
        url: params.url,
    });
    commit();
}

/**
 * Removes an item from the recently watched list.
 * @param animeId
 *      The animeId of the anime to be removed from
 *      the recently watched list.
 * @returns
 *      true -> item removed
 *      false -> failed to remove/not present
 */
export function removeFromList(animeId: string): boolean {
    for (let i = 0; i < watchList.length; i++) {
        if (watchList[i].animeId === animeId) {
            // Remove 1 element at the index.
            watchList.splice(i, 1);
            commit();
            return true;
        }
    }
    return false;
}
