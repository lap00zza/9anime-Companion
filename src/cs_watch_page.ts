// TODO: find a better way to render templates instead of jquery

import * as $ from "jquery";
import {Intent, ISettings, Server} from "./common";
import * as dlAll from "./download_all_widgets";
import utilityBar from "./utility_bar";
import {loadSettings} from "./utils";

console.info("%c9anime Companion 1.0.0", "color: orange; font-weight: bold;");

let title = $("h1.title");
let serverDiv = $("#servers");
let animeName = title.text();
let animeId = $("#movie").data("id");

/* --- Register recently watched --- */
// See "recently_watched.ts" to find out
// how this part works.
let recentEpId = serverDiv.find(".episodes > li > a.active").data("id");
let recentEpNum = serverDiv.find(".episodes > li > a.active").data("base");
function registerRecent() {
    chrome.runtime.sendMessage({
        animeId,
        animeName,
        epId: recentEpId,
        epNum: recentEpNum,
        intent: Intent.Recently_Watched_Add,
        path: window.location.pathname,
    });
}
registerRecent(); /* register once at page load */
// We also track the episodes that are changed after opening
// a page. Since the episodes are loaded via ajax, there is
// no direct way to track them. Instead, we poll history.state
// every 10 seconds and register if id was changed.
//
// NOTE: this means you need to be on a episode for at-least 10
// seconds to be counted and additional 10 seconds to be added
// to list. So 20 seconds :).
setInterval(() => {
    if (history.state && history.state.name) {
        let newEpId = history.state.name;
        if (newEpId !== recentEpId) {
            recentEpId = newEpId;
            recentEpNum = serverDiv.find(".episodes > li > a.active").data("base");
            console.info(`%cUpdated recent to ${recentEpNum}`, "color: yellow;");
            registerRecent();
        }
    }
}, 10000);
/* --- ^.^ --- */

/* --- Page actions based on settings --- */
loadSettings([
    "downloadAll",
    "remAds",
    "remComments",
    "remInfo",
    "remSuggested",
    "resPlayer",
    "utilityBar",
]).then((settings: ISettings) => {
    // Remove visible ads from the DOM. This does not block
    // ads. Remember: 9ac DOES NOT block ads, just removes
    // what it can. 9ac should be coupled with uBlock Origin
    // to get zero ads/popups.
    if (settings.remAds) {
        console.info("Removing ads");
        // Contains the known ad selectors.
        let adsSelectors = [
            ".a_d",
            ".ads",
            ".sidebar",
        ];
        for (let i of adsSelectors) {
            $(i).remove();
        }
        // This line below refers to the alert just above the player.
        // If we dont make float none, once we remove the sidebar, the
        // player slides down when the width of the window decreases.
        $("#movie").find("div.container.player-wrapper > div > div.col-xs-24").css({float: "none"});
    }

    if (settings.resPlayer) {
        console.info("Resizing player");
        let player = $("#player");
        player.css("maxHeight", "500px");
        player.parent().css("width", "100%");
    }

    if (settings.remComments) {
        console.info("Removing comments");
        $("#comment").remove();
    }

    if (settings.remSuggested) {
        console.info("Removing suggested");
        $("#movie")
            .find("div.widget-title")
            .filter((index, el) => {
                return $(el).text() === "You might also like";
            })
            .parent()
            .remove();
    }

    if (settings.remInfo) {
        console.info("Removing info");
        title.remove();
        $("#info").remove();
    }

    if (settings.utilityBar) {
        $("#player").parent().append(utilityBar(animeName));
    }

    if (settings.downloadAll) {
        // NOTE:
        // "dlAll" means downloadAll. Its a short form.
        // We will use quite a bit of these throughout
        // 9anime Companion.

        let body = $("body");
        let servers = $(".server.row > label");

        dlAll.setup({
            name: animeName,
            ts: body.data("ts"),
        });
        serverDiv.prepend(dlAll.statusBar());
        body.append(dlAll.epModal());
        body.append(dlAll.linksModal());

        for (let server of servers) {
            let serverLabel = $(server).text();

            // Basically what we are doing here is testing
            // the labels and adding appropriate dl buttons.
            if (/Server\s+F/i.test(serverLabel)) {
                $(server).append(dlAll.downloadBtn(Server.Default));
            }
            // TODO: lets do the RapidVideo bit later
            // else if (/RapidVideo/i.test(serverLabel)) {
            //     $(server).append(dlAll.downloadBtn(Server.RapidVideo));
            // }
        }
    }
});
