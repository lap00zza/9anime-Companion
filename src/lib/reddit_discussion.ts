export default class RedditDiscussion {
    private name: string;
    private altNames: string[];
    private episode: string;
    // Reddit search endpoint
    private endpoint: string = "https://www.reddit.com/r/anime/search?q=";

    public constructor(name: string, episode: string = "", altNames: string[] = []) {
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

    private addAltNames(): string {
        let altNames = "";
        if (this.altNames.length > 0) {
            this.altNames.forEach(name => {
                altNames += ` OR title:"${name}`;
            });
        }
        return altNames;
    }

    private urlWithEp(): string {
        let titleText = `title:"${this.cleanTitle()} - Episode ${this.episode}"`;
        let params = `subreddit:anime self:yes title:"Spoiler" title:"Discussion"`;
        return encodeURI(this.endpoint + titleText + this.addAltNames() + " " + params + "&sort=new");
    }

    private urlWithoutEp(): string {
        let titleText = `title:"${this.cleanTitle()}"`;
        let params = `subreddit:anime self:yes title:"Spoiler" title:"Discussion"`;
        return encodeURI(this.endpoint + titleText + this.addAltNames() + " " + params + "&sort=new");
    }
}
