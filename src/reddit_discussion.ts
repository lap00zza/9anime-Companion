export default class RedditDiscussion {
    private name: string;
    private altNames: string[];
    private episode: string;
    // Reddit search endpoint
    private endpoint: string = "https://www.reddit.com/r/anime/search?q=";

    public constructor(name: string, altNames: string[], episode: string = "") {
        this.name = name;
        this.altNames = altNames;
        this.episode = episode;
    }

    /**
     * Returns the reddit search url.
     * @returns {string}
     */
    public url(): string {
        if (this.episode) {
            return this.urlWithEp();
        } else {
            return this.urlWithoutEp();
        }
    }

    private cleanTitle(): string {
        return this.name.replace(/\(DUB\)|\(SUB\)|\(TV\)/gi, "").trim();
    }

    private urlWithEp(): string {
        let titleText = `title:"${this.cleanTitle()} Episode ${this.episode}" `/* <-- trailing space is important */;
        if (this.altNames.length > 0) {
            this.altNames.forEach((name) => {
                titleText += ` OR title:"${name} Episode ${this.episode}"`;
            });
        }
        let params = `subreddit:anime self:yes title:"[Spoilers]" title:"[Discussion]"`;
        return encodeURI(this.endpoint + titleText + params + "&sort=new");
    }

    private urlWithoutEp(): string {
        let titleText = `title:"${this.cleanTitle()}" `/* <-- trailing space is important */;
        if (this.altNames.length > 0) {
            this.altNames.forEach((name) => {
                titleText += ` OR title:"${name}"`;
            });
        }
        let params = `subreddit:anime self:yes title:"[Spoilers]" title:"[Discussion]"`;
        return encodeURI(this.endpoint + titleText + params + "&sort=new");
    }
}
