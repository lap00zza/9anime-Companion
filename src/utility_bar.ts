import * as utils from "./utils";
import RedditDiscussion from "./reddit_discussion";

export default class UtilityBar {
    private redditSearchUrl: string;
    private malSearchUrl: string;
    private redditLogo: string = chrome.extension.getURL("assets/images/reddit-icon.png");
    private malLogo: string = chrome.extension.getURL("assets/images/mal-icon.png");

    public constructor(name: string, altNames: string[], episode: string = "") {
        this.redditSearchUrl = new RedditDiscussion(name, altNames, episode).url();
        this.malSearchUrl = "https://myanimelist.net/anime.php?q=" + name;
    }

    public generate(): string {
        return this.template();
    }

    private template(): string {
        return utils.dedent(
            `<div id="nac__utility-bar">
                <a class="utility" href="${this.redditSearchUrl}" target="_blank">
                    <img src='${this.redditLogo}'>
                    Reddit Discussion
                </a>
                <a class="utility" href="${this.malSearchUrl}" target="_blank">
                    <img src='${this.malLogo}'>
                    Find in MAL
                </a>
            </div>`);
    }
}
