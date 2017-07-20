import * as $ from "jquery";
import {Intent, IRecentlyWatched} from "./common";

let recentlyWatched = $("#nac__recently-watched");

chrome.runtime.sendMessage({
    intent: Intent.Recently_Watched_List,
}, (resp: IRecentlyWatched[]) => {
    let listItems = "";

    resp.forEach(item => {
        let episodeDiv = "";
        let url = "";

        // Not all item's have epNum. If epNum is not present
        // we just show the animeName.
        if (item.epNum && item.epId) {
            episodeDiv = `<span class="episode">E${item.epNum}</span>`;
            url = `https://9anime.to${item.path}/${item.epId}`;
        } else {
            url = `https://9anime.to${item.path}`;
        }
        listItems +=
            // The idea is to make it have a flex display.
            // It should also include a delete (x) icon.
            `<div class="item" data-url=${url}>
                <div>
                    <span class="name">${item.animeName}</span>
                    ${episodeDiv}
                </div>
            </div>`;
    });

    // Since list items contains nac__recently-watched__item
    // as the top level div's and we want click handler on
    // them, no need to run a separate find().
    let list = $(listItems);
    $(list).on("click", e => {
        chrome.tabs.create({
            url: $(e.currentTarget).data("url"),
        });
    });
    recentlyWatched.append(list);
});
