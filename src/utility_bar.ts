declare function require(arg: string): string;
import * as $ from "jquery";
import {Intent} from "./common";

let redditLogo = chrome.extension.getURL("assets/images/reddit-icon.png");
let malLogo = chrome.extension.getURL("assets/images/mal-icon.png");

/**
 * Returns a string template of the Utility Bar.
 * @param {string} animeName - Name of the current anime
 * @returns
 *      The Utility Bar
 */
export default function utilityBar(animeName: string): JQuery<HTMLElement> {
    let template = require("html-loader!./templates/utilityBar.html");
    let bar = $(template);

    let reddit = bar.find("#nac__utility-bar__reddit");
    let malSearch = bar.find("#nac__utility-bar__mal-search");

    // Add icons
    reddit.find("img").attr("src", redditLogo);
    malSearch.find("img").attr("src", malLogo);

    // Attach functionality
    reddit.on("click", () => {
        let episode = $("#servers").find(".episodes > li > a.active").data("base");
        chrome.runtime.sendMessage({
            episode,
            intent: Intent.Reddit_Discussion,
            animeName,
        });
    });
    malSearch.on("click", () => {
        chrome.runtime.sendMessage({
            intent: Intent.MAL_Search,
            animeName,
        });
    });
    return bar;
}
