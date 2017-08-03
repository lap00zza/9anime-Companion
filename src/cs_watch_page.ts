// TODO: find a better way to render templates instead of jquery

import * as $ from "jquery";
import {Intent, ISettings} from "./common";
import * as dlAll from "./download_all/widgets";
import * as mal from "./MyAnimeList/widgets";
import utilityBar from "./utility_bar";
import {loadSettings} from "./utils";

console.info("%c9anime Companion 1.0.0", "color: orange; font-weight: bold;");

let title = $("h1.title");
let serverDiv = $("#servers");
let animeName = title.text();
let animeId = $("#movie").data("id");
let currentEpId = serverDiv.find(".episodes > li > a.active").data("id");
// TODO: maybe use data("comment") instead of data("base") for EpNum
let currentEpNum = serverDiv.find(".episodes > li > a.active").data("base");

/* --- Track Episode Change --- */
/**
 * Contains the callback functions which are executed when
 * the episode on the current page is changed via ajax.
 */
let epChangeCallbacks: Array<(newEpId: string, newEpNum: string) => void> = [];

/**
 * This part tracks when episodes are changed after the page loads.
 * Since the episodes are loaded via ajax, there is no direct way
 * to track them. Instead, we poll history.state every second
 * and if id was changed, callbacks in epChangeCallbacks are executed
 * with newEpId and newEpNum as the parameters.
 */
setInterval(() => {
    if (history.state && history.state.name) {
        let newEpId = history.state.name;
        if (newEpId !== currentEpId) {
            let newEpNum = serverDiv.find(".episodes > li > a.active").data("base");

            /* update values. This HAS TO BE DONE FIRST. */
            currentEpId = newEpId;
            currentEpNum = newEpNum;

            /* execute callbacks */
            epChangeCallbacks.forEach(el => {
                el.call(null, newEpId, newEpNum);
            });
        }
    }
}, 1000);
/* --- ^.^ --- */

/* --- Register recently watched --- */
// See "recently_watched.ts" to find out how this part works.
// TODO: maybe recently watched duration should be lowered
function registerRecent() {
    chrome.runtime.sendMessage({
        animeId,
        animeName,
        epId: currentEpId,
        epNum: currentEpNum,
        intent: Intent.Recently_Watched_Add,
        url: $("link[rel='canonical']").attr("href"),
    });
}
registerRecent(); /* register once at page load */
// We also track the episodes that are changed after opening
// a page.
epChangeCallbacks.push(() => {
    console.info(`%cUpdated recent to ${currentEpNum}`, "color: yellow;");
    registerRecent();
});
/* --- ^.^ --- */

/* --- Page actions based on settings --- */
loadSettings([
    "downloadAll",
    "myAnimeList",
    "remAds",
    "remComments",
    "remInfo",
    "remSocialShare",
    "remSuggested",
    "resPlayer",
    "utilityBar",
]).then((settings: ISettings) => {
    // Remove visible ads from the DOM. This does not block
    // ads. Remember: 9ac DOES NOT block ads, just removes
    // what it can. 9ac should be coupled with uBlock Origin
    // to get zero ads/popups.
    if (settings.remAds) {
        console.info("%c[x] Removing ads", "color: lightgreen;");
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
        console.info("%c[x] Resizing player", "color: lightgreen;");
        let player = $("#player");
        player.css("maxHeight", "500px");
        player.parent().css("width", "100%");
    }

    if (settings.remComments) {
        console.info("%c[x] Removing comments", "color: lightgreen;");
        $("#comment").remove();
    }

    if (settings.remSocialShare) {
        console.info("%c[x] Removing social share box", "color: lightgreen;");
        let socialSelectors = [
            ".addthis_native_toolbox",
            ".home-socials",
        ];
        for (let i of socialSelectors) {
            $(i).remove();
        }
    }

    if (settings.remSuggested) {
        console.info("%c[x] Removing suggested", "color: lightgreen;");
        $("#movie")
            .find("div.widget-title")
            .filter((index, el) => {
                return $(el).text() === "You might also like";
            })
            .parent()
            .remove();
    }

    if (settings.remInfo) {
        console.info("%c[x] Removing info", "color: lightgreen;");
        title.remove();
        $("#info").remove();
    }

    if (settings.utilityBar) {
        console.info("%c[x] Attaching utility bar", "color: lightgreen;");
        $("#player").parent().append(utilityBar(animeName));
    }

    if (settings.downloadAll) {
        console.info("%c[x] Attaching download all", "color: lightgreen;");
        // NOTE:
        // "dlAll" means downloadAll. Its a short form.
        // We will use quite a bit of these throughout
        // 9anime Companion.
        dlAll.setup({
            name: animeName,
            ts: $("body").data("ts"),
        });
    }

    if (settings.myAnimeList) {
        console.info("%c[x] Attaching MyAnimeList", "color: lightgreen;");
        mal.setup({
            animeName,
            currentEpisode: currentEpNum,
        });
        epChangeCallbacks.push(mal.epTracker);
    }
});
