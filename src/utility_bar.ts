import RedditDiscussion from "./reddit_discussion";
import * as utils from "./utils";

let redditLogo = chrome.extension.getURL("assets/images/reddit-icon.png");
let malLogo = chrome.extension.getURL("assets/images/mal-icon.png");

/**
 * Returns a string template of the Utility Bar.
 * @param {string} name
 * @param {string} episode
 * @param {string[]} altNames
 * @returns {string} Utility Bar
 */
export function template(name: string, episode: string = "", altNames: string[] = []): string {
    let redditSearchUrl = new RedditDiscussion(name, episode, altNames).url();
    let malSearchUrl = "https://myanimelist.net/anime.php?q=" + name;

    return utils.dedent(
        `<div id="nac__utility-bar">
            <a class="utility" href="${redditSearchUrl}" target="_blank">
                <img src='${redditLogo}'>
                Reddit Discussion
            </a>
            <a class="utility" href="${malSearchUrl}" target="_blank">
                <img src='${malLogo}'>
                Find in MAL
            </a>
        </div>`);
}
