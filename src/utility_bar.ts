import RedditDiscussion from "./reddit_discussion";
import * as utils from "./utils";

let redditLogo = chrome.extension.getURL("assets/images/reddit-icon.png");
let malLogo = chrome.extension.getURL("assets/images/mal-icon.png");

interface IUtilityBarOptionalParams {
    episode?: string; /* Optional */
    altNames?: string[]; /* Optional */
}

/**
 * Returns a string template of the Utility Bar.
 * @param {string} name - Name of the current anime
 * @param params
 *      Optional parameters for the Utility Bar.
 * @returns
 *      The Utility Bar
 */
export default function utilityBar(name: string, params: IUtilityBarOptionalParams = {}): string {
    let redditSearchUrl = new RedditDiscussion(name, params.episode, params.altNames).url();
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
