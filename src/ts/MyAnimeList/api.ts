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
    private username: string = "";
    private password: string = "";

    public setCredentials(username: string, password: string): void {
        this.username = username;
        this.password = password;
    }

    public userList(): Promise<IMALUserList> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/malappinfo.php?u=${this.username}&status=all&type=anime`;
            fetch(endpoint)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(response.status.toString());
                })
                .then(resp => resolve(x2js.xml2js(resp)))
                .catch(err => reject(err));
        });
    }

    public verify(username: string, password: string): Promise<IVerify> {
        return new Promise((resolve, reject) => {
            let endpoint = "https://myanimelist.net/api/account/verify_credentials.xml";
            const token = btoa(`${username}:${password}`);
            fetch(endpoint, {
                headers: {
                    authorization: `Basic ${token}`,
                },
            })
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(response.status.toString());
                })
                .then(resp => resolve(x2js.xml2js(resp)))
                .catch(err => reject(err));
        });
    }

    public searchAnime(name: string): Promise<IMALSearch> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/api/anime/search.xml?q=${name}`;
            const token = btoa(`${this.username}:${this.password}`);
            fetch(endpoint, {
                headers: {
                    authorization: `Basic ${token}`,
                },
            })
                .then(response => {
                    // NOTE: You maybe wondering why 204 is set as error. 204
                    // means No Content, which is a error in terms of our API.
                    if (response.status !== 204 && (response.status >= 200 && response.status <= 299)) {
                        return response.text();
                    }
                    throw new Error(response.status.toString());
                })
                .then(resp => resolve(x2js.xml2js(resp)))
                .catch(err => reject(err));
        });
    }

    public addAnime(animeId: string, data: IAnimeValues): Promise<string> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/api/animelist/add/${animeId}.xml`;
            const token = btoa(`${this.username}:${this.password}`);
            fetch(endpoint, {
                body: "data=" + x2js.js2xml(data),
                headers: {
                    "authorization": `Basic ${token}`,
                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                method: "POST",
            })
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(response.status.toString());
                })
                .then(resp => resolve(x2js.xml2js(resp)))
                .catch(err => reject(err));
        });
    }

    public updateAnime(animeId: string, data: IAnimeValues): Promise<string> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/api/animelist/update/${animeId}.xml`;
            const token = btoa(`${this.username}:${this.password}`);
            fetch(endpoint, {
                body: "data=" + x2js.js2xml(data),
                headers: {
                    "authorization": `Basic ${token}`,
                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                method: "POST",
            })
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(response.status.toString());
                })
                .then(resp => resolve(x2js.xml2js(resp)))
                .catch(err => reject(err));
        });
    }

    public deleteAnime(animeId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/api/animelist/delete/${animeId}.xml`;
            const token = btoa(`${this.username}:${this.password}`);
            fetch(endpoint, {
                headers: {
                    authorization: `Basic ${token}`,
                },
                method: "POST",
            })
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(response.status.toString());
                })
                .then(resp => resolve(resp))
                .catch(err => reject(err));
        });
    }
}
/* tslint:enable:max-classes-per-file */
