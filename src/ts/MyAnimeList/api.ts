/**
 * Konichiwa~
 *
 * This module contains all the api calls related to MyAnimeList.
 * Whenever applicable, the methods are for Anime only. Not for Manga.
 *
 * Status Code Guide:
 *      201  Anime Created
 *      204  No Content, which is a error in terms of our API
 *      400  Bad Request
 *      401  Invalid Credentials passed (wrong or no username/password)
 *
 * All the known endpoints are known and mapped. This can very well
 * be used as a standalone script.
 */

/* tslint:disable:max-classes-per-file */
// Type declaration for x2js. Why not just import x2js?
// Because I wanted to keep all vendor libraries separate
// so that its easier and faster for the AMO reviewers to
// go through the code.
declare class X2JS {
    constructor(config?: {arrayAccessFormPaths: string[]});
    public js2xml<T>(json: T): string;
    public xml2js<T>(xml: string): T;
}

import { IAnimeValues, IMALSearch, IMALUserList } from "../common";

let x2js = new X2JS({
    // Specify which elements will always be arrays
    // even if only 1 item exists.
    arrayAccessFormPaths: [
        "anime.entry",
    ],
});

interface IVerify {
    user: {
        id: string;
        username: string;
    };
}

export default class MyAnimeListAPI {
    public static async verify(username: string, password: string): Promise<IVerify> {
        try {
            const endpoint = "https://myanimelist.net/api/account/verify_credentials.xml";
            const token = btoa(`${username}:${password}`);
            const response = await fetch(endpoint, {
                headers: {
                    authorization: `Basic ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(response.status.toString());
            }
            return x2js.xml2js(await response.text());
        } catch (err) {
            throw new Error(err.message);
        }
    }

    private username: string = "";
    private password: string = "";

    public setCredentials(username: string, password: string): void {
        this.username = username;
        this.password = password;
    }

    public async userList(): Promise<IMALUserList> {
        try {
            const endpoint = `https://myanimelist.net/malappinfo.php?u=${this.username}&status=all&type=anime`;
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(response.status.toString());
            }
            return x2js.xml2js(await response.text());
        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async searchAnime(name: string): Promise<IMALSearch> {
        try {
            const endpoint = `https://myanimelist.net/api/anime/search.xml?q=${name}`;
            const token = btoa(`${this.username}:${this.password}`);
            const response = await fetch(endpoint, {
                headers: {
                    authorization: `Basic ${token}`,
                },
            });
            if (response.status === 204 || !response.ok) {
                throw new Error(response.status.toString());
            }
            return x2js.xml2js(await response.text());
        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async addAnime(animeId: string, data: IAnimeValues): Promise<string> {
        try {
            const endpoint = `https://myanimelist.net/api/animelist/add/${animeId}.xml`;
            const token = btoa(`${this.username}:${this.password}`);
            const response = await fetch(endpoint, {
                body: "data=" + x2js.js2xml(data),
                headers: {
                    "authorization": `Basic ${token}`,
                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                method: "POST",
            });
            if (!response.ok) {
                throw new Error(response.status.toString());
            }
            return x2js.xml2js(await response.text());
        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async updateAnime(animeId: string, data: IAnimeValues): Promise<string> {
        try {
            const endpoint = `https://myanimelist.net/api/animelist/update/${animeId}.xml`;
            const token = btoa(`${this.username}:${this.password}`);
            const response = await fetch(endpoint, {
                body: "data=" + x2js.js2xml(data),
                headers: {
                    "authorization": `Basic ${token}`,
                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                method: "POST",
            });
            if (!response.ok) {
                throw new Error(response.status.toString());
            }
            return x2js.xml2js(await response.text());
        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async deleteAnime(animeId: string): Promise<string> {
        try {
            const endpoint = `https://myanimelist.net/api/animelist/delete/${animeId}.xml`;
            const token = btoa(`${this.username}:${this.password}`);
            const response = await fetch(endpoint, {
                headers: {
                    authorization: `Basic ${token}`,
                },
                method: "POST",
            });
            if (!response.ok) {
                throw new Error(response.status.toString());
            }
            return x2js.xml2js(await response.text());
        } catch (err) {
            throw new Error(err.message);
        }
    }
}
/* tslint:enable:max-classes-per-file */
