// TODO: popup theme switcher
// TODO: when popup 10 items are deleted but list has more, then bug

declare function require(arg: string): string;

import {Intent, IRecentlyWatched, IRuntimeResponse} from "./lib/common";
import {isUrl, loadSettings} from "./lib/utils";

let recentlyWatched = $("#recently-watched");
let noItemsOverlay = $("#no-items");

// @Event Listener
$(".setting").on("click", () => {
    chrome.runtime.sendMessage({
        intent: Intent.Open_Options,
    });
});

// @Event Listener
loadSettings(["quickLink"]).then(res => {
    $(".logo").on("click", () => {
        chrome.tabs.create({
            url: res.quickLink || "https://9anime.to",
        });
    });
});

// @Event Listener
$(".integrate-mal").on("click", () => {
    chrome.runtime.sendMessage({
        intent: Intent.Open_Options,
        params: {
            goto: "MyAnimeList",
        },
    });
});

function showOverlay() {
    noItemsOverlay.show();
    recentlyWatched.hide();
}

// function hideOverlay() {
//     noItemsOverlay.hide();
//     recentlyWatched.show();
// }

function removeListItem(el: HTMLElement, animeId: string): void {
    chrome.runtime.sendMessage({
        animeId,
        intent: Intent.Recently_Watched_Remove,
    }, (r: IRuntimeResponse) => {
        if (r.success) {
            let target = $(el);
            // The data contains the number of items that
            // are currently in the recently watched list.
            // If this hits 0, we show our awesome no item
            // overlay, else just the animation/remove.
            if ((r.data as number) > 0) {
                target.parents(".item").addClass("fade-out");
                setTimeout(() => {
                    target.parents(".item").remove();
                }, 500);
            } else {
                target.parents(".item").remove();
                showOverlay();
            }
        }
    });
}

function generateListItem(item: IRecentlyWatched /*, visible= true*/): JQuery<HTMLElement> {
    // let display = visible ? "flex" : "none";
    let display = "flex";

    // NOTE: we are NOT BINDING the data directly to dom to
    // prevent XSS. The data is bound using the .text() method
    // later.
    let listItem = $(
        `<div class="item" style="display: ${display}">
            <div class="item-body">
                <span class="name"></span>
                <span class="label" style="display: none;"></span>
            </div>
            <img src="images/remove-icon.png" class="remove" alt="Remove Item">
        </div>`,
    );

    if (item.epNum && item.epId) {
        // If epNum is not present we just show the animeName.
        listItem.find(".label").text(`E${item.epNum}`).show();

        // If epId is present, the url will have the `/epId` part at the end.
        item.url += `/${item.epId}`;
    }
    listItem.find(".name").text(item.animeName);
    if (isUrl(item.url)) { /* only bind click if url is valid. This prevents XSS. */
        listItem.find(".item-body").on("click", () => {
            chrome.tabs.create({
                url: item.url,
            });
        });
    }
    listItem.find(".remove").on("click", e => {
        removeListItem(e.currentTarget, item.animeId);
    });
    return listItem;
}

/**
 * Returns a html string for the list items.
 */
function generateList(items: IRecentlyWatched[] /*, moreItems= true, limit= 5*/): void {
    for (let item of items) {
        recentlyWatched.append(generateListItem(item));
    }
    /*for (let i = 0; i < items.length; i++) {
        if (i >= limit && moreItems) {
            recentlyWatchedList.append(generateListItem(items[i], false));
        } else {
            recentlyWatchedList.append(generateListItem(items[i]));
        }
    }
    if (items.length > limit && moreItems) {
        let moreItem = $(require("html-loader!../templates/popup_moreItem.html"));
        moreItem.on("click", e => {
            $(e.currentTarget).hide();
            $(".item").css("display", "flex");
        });
        recentlyWatchedList.append(moreItem);
    }*/
}

// Get the last 10 recently watched anime
// and bind it to the popup.
chrome.runtime.sendMessage({
    intent: Intent.Recently_Watched_List,
}, (resp: IRuntimeResponse) => {
    // Only need to bother if the list actually contain
    // any items.
    if ((resp.data as IRecentlyWatched[]).length > 0) {
        generateList(resp.data);
    } else {
        showOverlay();
    }
});

// bind version
$(".version").text(chrome.runtime.getManifest().version);
