// TODO: The API calls for search and userlist should be cached
import {AxiosError} from "axios";
import {IMALSearchAnime, IMALUserListAnime, ISettings, MALStatus} from "../common";
import {loadSettings, notify} from "../utils";
import MyAnimeListAPI from "./api";

let api = new MyAnimeListAPI();

// Initialize the API
loadSettings([
    "malUsername",
    "malPassword",
]).then((settings: ISettings) => {
    // Undefined when someone deletes settings on purpose.
    if (settings.malUsername !== undefined && settings.malPassword !== undefined) {
        api.setCredentials(settings.malUsername, settings.malPassword);
    }
    // else {
    //     notify("MAL Error", "MAL Credentials not present where it is expected.");
    // }
});

/**
 * Returns current date in MMDDYYYY format.
 */
export function malDate(date: Date = new Date()) {
    let year = date.getFullYear();
    let month = "";
    let day = "";

    if (date.getMonth() + 1 < 10) {
        month = "0" + String(date.getMonth() + 1);
    } else {
        month = String(date.getMonth() + 1);
    }

    if (date.getDate() < 10) {
        day = "0" + String(date.getDate());
    } else {
        day = String(date.getDate());
    }

    return month + day + year;
}

export function getUserList(): Promise<IMALUserListAnime[]> {
    return new Promise((resolve, reject) => {
        api
            .userList()
            .then(resp => resolve(resp.myanimelist.anime))
            .catch((err: AxiosError) => {
                if (err.response) {
                    reject(err.response.status);
                }
                reject(0);
            });
    });
}

export function search(animeName: string): Promise<IMALSearchAnime[]> {
    return new Promise((resolve, reject) => {
        api
            .searchAnime(animeName)
            .then(resp => resolve(resp.anime.entry))
            .catch((err: AxiosError) => {
                if (err.response) {
                    reject(err.response.status);
                }
                reject(0);
            });
    });
}

export function quickAdd(animeId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        api
            .addAnime(animeId, {
                entry: {
                    date_start: malDate(),
                    episode: 1,
                    status: MALStatus.WATCHING,
                },
            })
            .then(() => resolve())
            .catch((err: AxiosError) => {
                if (err.response) {
                    reject(err.response.status);
                }
                reject(0);
            });
    });
}

export function quickUpdate(animeId: string, episode: number): Promise<void> {
    return new Promise((resolve, reject) => {
        api
            .updateAnime(animeId, {
                entry: {
                    episode,
                },
            })
            .then(() => resolve())
            .catch((err: AxiosError) => {
                if (err.response) {
                    reject(err.response.status);
                }
                reject(0);
            });
    });
}

export function verify(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
        api
            .verify(username, password)
            .then(() => {
                // Once verified, we need to make our API
                // use the new username and password.
                api.setCredentials(username, password);
                resolve();
            })
            .catch((err: AxiosError) => {
                if (err.response) {
                    reject(err.response.status);
                }
                reject(0);
            });
    });
}

export function removeCredentials() {
    api.setCredentials("", "");
}
