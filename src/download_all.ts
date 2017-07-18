/**
 * Konichiwa~
 *
 * This is responsible for the Download All core functionality.
 * Chrome does not allow content scripts to download, that's why
 * the functionality had to be split.
 *
 * @see {@link https://git.io/vQdkU} for a brief overview.
 */

import * as api from "./api";
import {
    DownloadMethod,
    DownloadQuality,
    IEpisode,
    Intent,
    Server,
} from  "./common";
import * as utils from "./utils";

interface IDownloadPromise {
    intent: Intent;
    links?: string;
}

// We need this value while sending API requests.
let ts = "";

// Name of the current anime.
let animeName = "";

/**
 * resolver and rejecter holds the references to the resolve
 * and reject callbacks of the start method. These are then
 * later called as required.
 */
let resolver: (value?: IDownloadPromise) => void;
let rejecter: (value?: IDownloadPromise) => void;

/**
 * This variable holds all links when method external is selected.
 * The links are then resolved via promise which then shows up in
 * the users tab.
 * @see getLinks9a
 */
let aggregateLinks = "";

/**
 * The episodes that the users selected in the epModal
 * are stored here. These are the episodes that will be
 * downloaded.
 * @default []
 */
let selectedEpisodes: IEpisode[] = [];

/**
 * A boolean flag to track if download is in progress.
 * @default false
 */
let isDownloading = false;

/**
 * 9anime Companion can only download from 1 server at
 * a time. This variable holds the type of server from
 * which we are currently downloading/will download.
 * @default Server.Default
 */
let server: Server = Server.Default;

/**
 * The preferred quality of the files to download.
 * @default Quality["360p"]
 */
let quality: DownloadQuality = DownloadQuality["360p"];

/**
 * The preferred download method.
 * @default DownloadMethod.Browser
 */
let method: DownloadMethod = DownloadMethod.Browser;

interface ISetupOptions {
    animeName: string;
    method: DownloadMethod;
    quality: DownloadQuality;
    selectedEpisodes: IEpisode[];
    server: Server;
    ts: string;
}

// Setup
export function setup(options: ISetupOptions) {
    animeName = options.animeName;
    method = options.method;
    quality = options.quality;
    selectedEpisodes = options.selectedEpisodes;
    server = options.server;
    ts = options.ts;
}

/**
 * A simple helper function that generates a filename.
 * @param file
 *      The current episode file
 * @param episode
 *      episode data, i.e: id and num
 * @param ext
 *      boolean value; should extension (ex: mp4) be part
 *      of the title. Defaults to true.
 * @returns filename
 */
export function fileName(file: api.IFile, episode: IEpisode, ext = true): string {
    if (ext) {
        return utils.fileSafeString(`${animeName}_E${episode.num }_${file.label}.${file.type}`);
    } else {
        return utils.fileSafeString(`${animeName}_E${episode.num }_${file.label}`);
    }
}

/**
 * Returns a file of users preferred quality from a list of files,
 * or, if preferred quality is missing, returns the next lower
 * quality. If there are no lower qualities then null is returned.
 * @param pref
 *      The preferred quality.
 * @param files
 *      The list of files from which we choose.
 * @returns
 *      A file with preferred quality or the next lower quality.
 * @see {@link https://git.io/vQdkt} for the unit tests.
 */
export function autoFallback(pref: DownloadQuality, files: api.IFile[]): api.IFile | null {
    // Start at the preferred quality, then count down.
    for (let i = pref; i >= DownloadQuality["360p"]; i--) {
        // for each "quality" we loop through episodes
        // and see if we find a suitable match.
        for (let file of files) {
            if (file.label === DownloadQuality[i]) {
                return file;
            }
        }
    }
    // Meaning fallback failed
    return null;
}

/**
 * This function requeue's the downloader to run every
 * 2 seconds to avoid overloading the 9anime API and/or
 * getting our IP flagged as bot.
 */
function requeue(): void {
    if (selectedEpisodes.length > 0) {
        setTimeout(downloader, 2000);
    } else {
        // All downloads over
        isDownloading = false;

        // Resolve the Download Promise.
        if (method === DownloadMethod.Browser) {
            resolver({
                intent: Intent.Download_Complete,
            });
        } else {
            resolver({
                intent: Intent.Download_Complete,
                links: aggregateLinks,
            });
        }
    }
}

function getLinks9a(data: api.IGrabber, episode: IEpisode) {
    api
        .links9a(data.grabber, {
            ts,
            id: data.params.id,
            mobile: 0,
            options: data.params.options,
            token: data.params.token,
        })
        .then(resp => {
            let file = autoFallback(quality, resp.data);
            // downloadMethod can either be Browser or External.
            // For Browser, we make use of the default case.
            switch (method) {
                case DownloadMethod.External:
                    if (file) {
                        aggregateLinks += `${file.file}&title=${fileName(file, episode, false)}&type=${file.type}\n`;
                    }
                    break;
                default:
                    if (file) {
                        chrome.downloads.download({
                            conflictAction: "uniquify",
                            filename: fileName(file, episode),
                            url: file.file,
                        });
                    }
                    break;
            }
        })
        .catch(err => console.debug(err))
        // The last then acts like a finally.
        .then(() => requeue());
}

/**
 * The boss function. It handles the entire downloading
 * process.
 */
export function downloader(): void {
    let ep = selectedEpisodes.shift();
    if (ep) {
        api
            .grabber({
                id: ep.id,
                ts,
                update: 0,
            })
            .then(resp => {
                // Server can either be RapidVideo or Default.
                // For Default, we make use of default case.
                switch (server) {
                    // TODO: lets do the RapidVideo bit later
                    // case Server.RapidVideo:
                    //     // RapidVideo
                    //     // When this is selected, additional permissions must be
                    //     // asked to be able to access that domain.
                    //     break;
                    default:
                        getLinks9a(resp, ep as IEpisode);
                        break;
                }
            })
            .catch(err => console.debug(err));
    }
}

/**
 * Triggers the download process.
 * @param baseUrl
 *      The baseUrl of the 9anime site.
 *      Ex: https://9anime.to, https://9anime.is etc
 */
export function start(baseUrl: string): Promise<IDownloadPromise> {
    api.setup({
        baseUrl,
    });
    downloader();
    return new Promise((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });
}
