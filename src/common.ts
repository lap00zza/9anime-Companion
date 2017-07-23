/**
 * Konichiwa~
 *
 * This file contains the common interfaces, enums and types.
 */

/**
 * The available settings in 9anime Companion along with
 * the default values.
 * rem* -> remove*
 * res* -> resize*
 */
export const Settings = {
    downloadAll: true,
    remAds: true,
    remComments: false,
    remInfo: false,
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
    downloadAll?: boolean;
    remAds?: boolean;
    remComments?: boolean;
    remInfo?: boolean;
    remSuggested?: boolean;
    resPlayer?: boolean;
    utilityBar?: boolean;
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
 * Defines a generic object with key, value as strings.
 * Since TS needs a index signature, we will use this
 * quite often.
 *
 * @todo this might be better of as union instead of any
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

export interface IRuntimeMessage extends IGenericObject {
    intent: Intent;
}

// --- ENUMS ---
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
 */
export enum Intent {
    "Download_All",
    "Download_Complete",
    "Download_Status",
    "Find_In_Mal",
    "Find_In_Kitsu",
    "Reddit_Discussion",
    "Recently_Watched_Add",
    "Recently_Watched_List",
    "Recently_Watched_Remove",
}
