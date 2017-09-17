declare function require(arg: string): string;
import {Intent} from "./common";

let redditLogo = chrome.extension.getURL("images/reddit-icon.png");
let malLogo = chrome.extension.getURL("images/mal-icon.png");
let kitsuLogo = chrome.extension.getURL("images/kitsu-icon.png");

/**
 * Returns a string template of the Utility Bar.
 * @param {string} animeName - Name of the current anime
 * @returns
 *      The Utility Bar
 */
export default function utilityBar(animeName: string): JQuery<HTMLElement> {
    let template = require("html-loader!../templates/utilityBar.html");
    let bar = $(template);

    let reddit = bar.find("#nac__utility-bar__reddit");
    let mal = bar.find("#nac__utility-bar__mal");
    let kitsu = bar.find("#nac__utility-bar__kitsu");

    // Add icons
    reddit.find("img").attr("src", redditLogo);
    mal.find("img").attr("src", malLogo);
    kitsu.find("img").attr("src", kitsuLogo);

    // Attach functionality
    reddit.on("click", () => {
        let episode = $("#servers").find(".episodes > li > a.active").data("base");
        chrome.runtime.sendMessage({
            episode,
            intent: Intent.Reddit_Discussion,
            animeName,
        });
    });
    mal.on("click", () => {
        chrome.runtime.sendMessage({
            intent: Intent.Find_In_Mal,
            animeName,
        });
    });
    kitsu.on("click", () => {
        chrome.runtime.sendMessage({
            intent: Intent.Find_In_Kitsu,
            animeName,
        });
    });
    return bar;
}
