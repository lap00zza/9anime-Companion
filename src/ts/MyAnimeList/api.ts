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

import axios, {AxiosError} from "axios";
import * as X2JS from "x2js";
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
            let url = encodeURI(`https://myanimelist.net/malappinfo.php?u=${this.username}&status=all&type=anime`);
            axios
                .get(url, {
                    responseType: "text",
                })
                .then(resp => {
                    resolve(x2js.xml2js(resp.data));
                })
                .catch(err => reject(err));
        });
    }

    public verify(username: string, password: string): Promise<IVerify> {
        return new Promise((resolve, reject) => {
            let endpoint = "https://myanimelist.net/api/account/verify_credentials.xml";
            axios
                .get(endpoint, {
                    auth: {
                        password,
                        username,
                    },
                })
                .then(resp => {
                    resolve(x2js.xml2js(resp.data));
                })
                .catch(err => reject(err));
        });
    }

    public searchAnime(name: string): Promise<IMALSearch> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/api/anime/search.xml`;
            axios
                .get(endpoint, {
                    auth: {
                        password: this.password,
                        username: this.username,
                    },
                    params: {
                        // NOTE: query should not be uri encoded,
                        // as it seems to cause issues.
                        q: name,
                    },
                    responseType: "text",
                    // NOTE: You maybe wondering why 204 is set as error. 204
                    // means No Content, which is a error in terms of our API.
                    validateStatus(status) {
                        return status !== 204 && (status >= 200 && status < 300);
                    },
                })
                .then(resp => {
                    resolve(x2js.xml2js(resp.data));
                })
                .catch(err => reject(err));
        });
    }

    public addAnime(animeId: string, data: IAnimeValues): Promise<string> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/api/animelist/add/${animeId}.xml`;
            axios
            // data=xxx is how data is sent with our
            // x-www-form-urlencoded content type.
                .post(endpoint, "data=" + x2js.js2xml(data), {
                    auth: {
                        password: this.password,
                        username: this.username,
                    },
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                })
                // 201: Created/Success
                .then(resp => resolve(resp.data))
                // 400: invalid animeID/Failure
                .catch(err => reject(err));
        });
    }

    public updateAnime(animeId: string, data: IAnimeValues): Promise<string> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/api/animelist/update/${animeId}.xml`;
            axios
                .post(endpoint, "data=" + x2js.js2xml(data), {
                    auth: {
                        password: this.password,
                        username: this.username,
                    },
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                })
                .then(resp => resolve(resp.data))
                // 400: Invalid XML format
                .catch(err => reject(err));
        });
    }

    public deleteAnime(animeId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let endpoint = `https://myanimelist.net/api/animelist/delete/${animeId}.xml`;
            axios
                .post(endpoint, null, {
                    auth: {
                        password: this.password,
                        username: this.username,
                    },
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                })
                .then(resp => resolve(resp.data))
                // 400: Invalid ID
                .catch(err => reject(err));
        });
    }
}
