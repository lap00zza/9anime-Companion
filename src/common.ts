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

/**
 * A collection of intents that the background can
 * understand. Intents other than these are not valid.
 */
export enum Intent {
    "Download_All",
    "Download_Complete",
    "Download_Status",
    "MAL_Search",
    "Reddit_Discussion",
}

export interface IRuntimeMessage extends IGenericObject {
    intent: Intent;
}
