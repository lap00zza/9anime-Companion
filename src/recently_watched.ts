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
 *
 * @todo should the list have a hard limit on items?
 */
import {IRecentlyWatched} from "./common";

let watchList: IRecentlyWatched[] = [];
let timeoutId: number;

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

/**
 * Get the recently watched anime's.
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
    if (!params.animeId || !params.animeName || !params.epId || !params.epNum || !params.url) {
        throw new Error("[Recently Watched] [Error] All properties must be present.");
    }

    let exist = false;
    // Check if same id exists. If it does then
    // change epId, epNum and ts. else push.
    for (let item of watchList) {
        if (item.animeId === params.animeId) {
            exist = true;
            item.epId = params.epId;
            item.epNum = params.epNum;
            item.timestamp = params.timestamp;
        }
    }
    if (!exist) {
        watchList.push({
            animeId: params.animeId,
            animeName: params.animeName,
            epId: params.epId,
            epNum: params.epNum,
            timestamp: params.timestamp,
            url: params.url,
        });
    }
    commit();
    // console.log(watchList, getList());
}

/**
 * Register recently watched! It will call addToList after
 * a set countDuration so that only legit anime's are added
 * to watchList.
 * @param params
 *      id, name and path
 * @param countDuration
 *      The duration after which anime is counted.
 *      Defaults to 5000 (or 5 sec).
 */
export function register(params: IRecentlyWatched, countDuration: number = 5000): void {
    // TODO: will a timeout really prevent unwanted additions to list?
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => addToList(params), countDuration);
}
