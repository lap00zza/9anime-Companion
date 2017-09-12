// TODO: The API calls for search and userlist should be cached
import {IMALSearchAnime, IMALUserListAnime, ISettings, MALStatus} from "../common";
import {loadSettings} from "../utils";
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
    //     notify("", "MAL Error", "MAL Credentials not present where it is expected.");
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

export async function getUserList(): Promise<IMALUserListAnime[]> {
    try {
        return (await api.userList()).myanimelist.anime;
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function search(animeName: string): Promise<IMALSearchAnime[]> {
    try {
        return (await api.searchAnime(animeName)).anime.entry;
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function quickAdd(animeId: string): Promise<void> {
    try {
        await api.addAnime(animeId, {
            entry: {
                date_start: malDate(),
                episode: 1,
                status: MALStatus.WATCHING,
            },
        });
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function quickUpdate(animeId: string, episode: number): Promise<void> {
    try {
        await api.updateAnime(animeId, {
            entry: {
                episode,
            },
        });
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function verify(username: string, password: string): Promise<void> {
    try {
        await MyAnimeListAPI.verify(username, password);
        api.setCredentials(username, password);
    } catch (err) {
        throw new Error(err.message);
    }
}

export function removeCredentials() {
    api.setCredentials("", "");
}
