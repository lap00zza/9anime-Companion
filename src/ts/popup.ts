// TODO: popup theme switcher
// TODO: when popup 10 items are deleted but list has more, then bug

declare function require(arg: string): string;

import * as $ from "jquery";
import {Intent, IRecentlyWatched, IRuntimeResponse} from "./common";
import {loadSettings} from "./utils";

let recentlyWatched = $("#recently-watched");
let recentlyWatchedList = $("#recently-watched__list");
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

function showOverlay() {
    noItemsOverlay.show();
    recentlyWatched.hide();
}

function hideOverlay() {
    noItemsOverlay.hide();
    recentlyWatched.show();
}

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

function generateListItem(item: IRecentlyWatched, visible= true): JQuery<HTMLElement> {
    let episodeSpan = "";
    let url = item.url;
    // If epNum is not present we just show the animeName.
    // If epId is not present, the url wont have the `/epId`
    // part appended at the end.
    if (item.epNum && item.epId) {
        episodeSpan = `<span class="label">E${item.epNum}</span>`;
        url += `/${item.epId}`;
    }
    let display = visible ? "flex" : "none";
    let listItem = $(
        `<div class="item" style="display: ${display}">
                    <div class="item-body">
                        <span class="name">${item.animeName}</span>
                            ${episodeSpan}
                    </div>
                    <img src="images/remove-icon.png" class="remove" alt="Remove Item">
                </div>`,
    );
    listItem.find(".item-body").on("click", () => {
        chrome.tabs.create({
            url,
        });
    });
    listItem.find(".remove").on("click", e => {
        removeListItem(e.currentTarget, item.animeId);
    });
    return listItem;
}

/**
 * Returns a html string for the list items.
 */
function generateList(items: IRecentlyWatched[], moreItems= true, limit= 5): void {
    for (let i = 0; i < items.length; i++) {
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
    }
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
