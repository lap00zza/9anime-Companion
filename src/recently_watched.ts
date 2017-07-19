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

interface IRecentlyWatched {
    animeId: string;     /* 9anime ID of this anime */
    animeName: string;   /* anime name */
    epId: string;   /* episode ID */
    epNum: string;  /* episode number */
    // since all the anime start with "https://9anime.to", we
    // only store the part after it, example:
    // "/watch/boruto-naruto-next-generations.97vm/zwz4xw"
    // This way if one of the domain is down, we can use the
    // other ones, ex: 9anime.is instead of 9anime.to.
    path: string;
    timestamp: string;
}

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
function addToList(params: IRecentlyWatched): void {
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
            path: params.path,
            timestamp: params.timestamp,
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
 *      Defaults to 10000 (or 10 sec).
 */
export function register(params: IRecentlyWatched, countDuration: number = 10000): void {
    // TODO: will a timeout really prevent unwanted additions to list?
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => addToList(params), countDuration);
}
