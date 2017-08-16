/**
 * Konichiwa~
 *
 * This file contains the common interfaces, enums and types.
 */

/**
 * These are the list of default adblock filters.
 * The default filters should not be modified.
 * NOTE: the doubles slashes because we need to
 * escape the special character \
 */
export let adBlockFilters = [
    "^https?:\\/\\/([a-z0-9]+[.])*amung\\.us",
    "^https?:\\/\\/([a-z0-9]+[.])*mgid\\.com",
    "^https?:\\/\\/([a-z0-9]+[.])*revcontent\\.com",
    "^https?:\\/\\/([a-z0-9]+[.])*addthis\\.com",
    "^https?:\\/\\/([a-z0-9]+[.])*oclasrv\\.com",
    "^https?:\\/\\/([a-z0-9]+[.])*bluekai\\.com",
    "^https?:\\/\\/([a-z0-9]+[.])*exelator\\.com",
    "^https?:\\/\\/([a-z0-9]+[.])*narrative\\.io",
    "^https?:\\/\\/([a-z0-9]+[.])*agkn\\.com",
    "^https?:\\/\\/([a-z0-9]+[.])*scorecardresearch\\.com",
    "^https?:\\/\\/([a-z0-9]+[.])*quantserve\\.com",
    "^https?:\\/\\/af2f04d5bdd\\.com",
    "^https?:\\/\\/bebi\\.com",
    "^https?:\\/\\/2mdnsys\\.com",
    "^https?:\\/\\/e2ertt\\.com",
    "^https?:\\/\\/cdnads\\.com",
    "^https?:\\/\\/onclkds\\.com",
    "^https?:\\/\\/pippio\\.com",
    "^https?:\\/\\/www\\.facebook\\.com\\/impression\\.php",
    "^https?:\\/\\/syndication\\.twitter.com\\/i\\/jot",
    "^https?:\\/\\/ssl\\.google-analytics\\.com\\/ga\\.js",
];

/**
 * The available settings in 9anime Companion along with
 * the default values.
 * rem* -> remove*
 * res* -> resize*
 */
export const Settings = {
    adBlockFilters,
    downloadAll: true,
    malPassword: "",    /* used with MAL Integration */
    malUsername: "",    /* used with MAL Integration */
    myAnimeList: false, /* used with MAL Integration */
    quickLink: "https://9anime.to",
    remAds: false,
    remComments: false,
    remInfo: false,
    remSocialShare: true,
    remSuggested: false,
    resPlayer: true,
    utilityBar: true,
};

// --- INTERFACES ---
/**
 * The interface representing a settings object. Useful
 * when used with loadSettings to quickly find out what
 * all settings can be present.
 */
export interface ISettings {
    adBlockFilters?: string[];
    downloadAll?: boolean;
    malPassword?: string;
    malUsername?: string;
    myAnimeList?: boolean;
    quickLink?: string;
    remAds?: boolean;
    remComments?: boolean;
    remInfo?: boolean;
    remSocialShare?: boolean;
    remSuggested?: boolean;
    resPlayer?: boolean;
    utilityBar?: boolean;
    [key: string]: string | string[] | boolean | undefined;
}

export interface IRecentlyWatched {
    animeId: string;    /* 9anime ID of this anime */
    animeName: string;  /* anime name */
    epId: string;       /* episode ID */
    epNum: string;      /* episode number */
    // url is the canonical url. So for example:
    //   > https://9anime.to/watch/shirobako.jv63/37rnxr
    // url will only store:
    //   > "https://9anime.to/watch/shirobako.jv63"
    // The "/37rnxr" part is added from the epId.
    url: string;        /* The canonical url, without epId */
    timestamp: string;
}

/**
 * All the AnimeValues properties for the MyAnimeList API.
 * The interface was mapped from the specification given in
 * {@link https://myanimelist.net/modules.php?go=api#animevalues}
 */
export interface IAnimeValues {
    entry: {
        episode?: number;
        status?: MALStatus;
        score?: MALScore;
        storage_type?: number;      /* no clue what this is */
        storage_value?: number;     /* no clue what this is */
        times_rewatched?: number;
        rewatch_value?: number;     /* no clue what this is */
        date_start?: string;        /* format: mmddyyyy */
        date_finish?: string;       /* format: mmddyyyy */
        priority?: number;          /* no clue what this is */
        enable_discussion?: 0 | 1;  /* no clue what this is */
        enable_rewatching?: 0 | 1;  /* no clue what this is */
        comments?: string;
        tags?: string;
    };
}

/**
 * All the properties in search response from the MyAnimeList API.
 */
export interface IMALSearchAnime {
    end_date: string;
    english: string;
    episodes: string;
    id: string;
    image: string;
    score: string;
    start_date: string;
    status: string;
    synonyms: string;
    synopsis: string;
    title: string;
    type: string;
}
export interface IMALSearch {
    anime: {
        entry: IMALSearchAnime[],
    };
}

/**
 * All the properties in userlist response from the MyAnimeList API.
 */
export interface IMALUserListAnime {
    my_finish_date: string;
    my_id: string;
    my_last_updated: string;
    my_rewatching: string;
    my_rewatching_ep: string;
    my_score: string;
    my_start_date: string;
    my_status: string;
    my_tags: string;
    my_watched_episodes: string;
    series_animedb_id: string;
    series_end: string;
    series_episodes: string;
    series_image: string;
    series_start: string;
    series_status: string;
    series_synonyms: string;
    series_title: string;
    series_type: string;
}
export interface IMALUserList {
    myanimelist: {
        anime: IMALUserListAnime[],
        myinfo: {
            user_completed: string;
            user_days_spent_watching: string;
            user_dropped: string;
            user_id: string;
            user_name: string;
            user_onhold: string;
            user_plantowatch: string;
            user_watching: string;
        },
    };
}

/**
 * Defines a generic object with key, value as strings.
 * Since TS needs a index signature, we will use this
 * quite often.
 */
export interface IGenericObject {
    /* tslint:disable:no-any */
    [key: string]: any;
    /* tslint:enable:no-any */
}

/**
 * Each episode is represented at large by this interface.
 */
export interface IEpisode {
    id: string; /* The actual episode id. ex: 42m48j */
    num: string; /* The 3 digit episode number. ex: 001 */
}

/**
 * This interface represents a response that is sent
 * by the background script when a content script
 * makes sends a message to it.
 */
export interface IRuntimeResponse {
    success: boolean;   /* required; true or false */
    /* tslint:disable:no-any */
    data?: any;         /* data; if success */
    /* tslint:enable:no-any */
    err?: number;       /* error code; if fail */
}

export interface IRuntimeMessage extends IGenericObject {
    intent: Intent;
}

// --- ENUMS ---
type MALScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export enum MALStatus {
    WATCHING = 1,
    COMPLETED = 2,
    ONHOLD = 3,
    DROPPED = 4,
    PLANTOWATCH = 6,
}

/**
 * The list of servers that 9anime Companion can
 * currently download from. Currently they are:
 * - Default: 9anime Server (F2, F4 etc)
 * - RapidVideo
 */
export enum Server {
    "Default", /* default means the 9anime server */
    "RapidVideo",
}

/**
 * The available download qualities.
 * Items here **must** match the items in the dlAll_epModal.html file.
 */
export enum DownloadQuality {
    "360p",
    "480p",
    "720p",
    "1080p",
}

export type DownloadQualityKeys = "360p" | "480p" | "720p" | "1080p";

/**
 * The available download methods. There are 2:
 * Browser: files will be downloaded via the browser downloader
 * External: links will be displayed in a popup for the users.
 *      (Links can then be used with external download managers.)
 *
 * Items here **must** match the items in the dlAll_epModal.html file.
 */
export enum DownloadMethod {
    "Browser",
    "External",
}

export type DownloadMethodKeys = "Browser" | "External";

/**
 * A collection of intents that the background can
 * understand. Intents other than these are not valid.
 *
 * NOTE: Open_Options must always be first otherwise
 * options_ui.html (in both chromium and firefox) will
 * break.
 */
export enum Intent {
    "Open_Options", /* <-- This MUST BE first */
    "AdBlocker_UpdateFilter_Local",
    "Download_All",
    "Download_Complete",
    "Download_Status",
    "Find_In_Mal",
    "Find_In_Kitsu",
    "MAL_QuickAdd",
    "MAL_QuickUpdate",
    "MAL_RemoveCredentials",
    "MAL_Search",
    "MAL_Userlist",
    "MAL_VerifyCredentials",
    "Reddit_Discussion",
    "Recently_Watched_Add",
    "Recently_Watched_List",
    "Recently_Watched_Remove",
    "Search_Anime",
}
