/**
 * Konichiwa~
 *
 * This is responsible for the Download All core functionality.
 * Chrome does not allow content scripts to download, that's why
 * the functionality had to be split.
 *
 * IMPORTANT:
 * 9ac **DOES NOT** support queues for download. So if you are
 * trying to download from multiple tabs, chances are your
 * downloads might not go as expected. Please wait till one set
 * of download is over before starting again.
 */

import {
    DownloadMethod,
    DownloadQuality,
    IEpisode,
    Intent,
    IRuntimeMessage,
    Server,
} from  "../common";
import * as utils from "../utils";
import * as api from "./api";

// We need this value while sending API requests.
let ts = "";

// Name of the current anime.
let animeName = "";

// We will use this to send message to tabs.
let sender: chrome.runtime.MessageSender;

// Keeps track of the download cycles. Each cycle starts
// at downloader and end before requeue is called.
// let inProgress = false;

// This variable holds all links when method external is selected.
// The links are then resolved via promise which then shows up in
// the users tab.
let aggregateLinks = "";

// The episodes that the users selected in the epModal are stored
// here. These are the episodes that will be downloaded.
let selectedEpisodes: IEpisode[] = [];

// This is the episode that we are currently trying to download.
let dlEpisode: IEpisode;

// 9anime Companion can only download from 1 server at a time. This
// variable holds the type of server from which we are currently
// downloading/will download.
let server: Server = Server.Default;

// The preferred quality of the files to download.
let quality: DownloadQuality = DownloadQuality["360p"];

// The preferred download method.
let method: DownloadMethod = DownloadMethod.Browser;

interface ISetupOptions {
    animeName: string;
    method: DownloadMethod;
    quality: DownloadQuality;
    selectedEpisodes: IEpisode[];
    sender: chrome.runtime.MessageSender; /* we need this to send messages to tab */
    server: Server;
    ts: string;
}

interface IJWPlayerSource {
    "default": boolean;
    file: string;
    label: string;
    preload: string;
    res: string;
    type: string;
}

/**
 * This is to listen to the messages sent from "src/ts/external_hosts/rapidvideo.ts".
 */
window.addEventListener("message", (e: MessageEvent) => {
    if (e.origin === "https://www.rapidvideo.com") {
        // console.log(e.data);
        if (e.data.event === "nac__external__rapidvideo-sources") {
            const iframe = document.getElementById("rv_grabber_iframe");
            if (iframe) {
                iframe.remove();
            }
            downloadRV(e.data.sources);
        }
    }
});

// Setup
export function setup(options: ISetupOptions): void {
    // first we clear off the previous aggregate links
    aggregateLinks = "";

    // Then we setup
    animeName = options.animeName;
    method = options.method;
    quality = options.quality;
    selectedEpisodes = options.selectedEpisodes;
    sender = options.sender;
    server = options.server;
    ts = options.ts;
}

/**
 * Send messages to the tab/content script.
 */
function sendMessage(message: IRuntimeMessage): void {
    if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, message);
    }
}

/**
 * A simple wrapper around sendMessage
 * @see sendMessage
 */
function status(message: string): void {
    sendMessage({
        intent: Intent.Download_Status,
        status: message,
    });
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
 * Returns:
 *  - a file of users preferred quality from a list of files,
 *  - or, if preferred quality is missing, returns the next lower quality,
 *  - or, ff there are no lower qualities then same quality is returned
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
    // Meaning fallback failed. This can happen
    // if the preferred quality is invalid, ex:
    // Quality["555p"] etc
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
        // Send the last status message!
        status("All done!");

        // Send the final intent!
        if (method === DownloadMethod.Browser) {
            sendMessage({
                intent: Intent.Download_Complete,
            });
        } else {
            sendMessage({
                intent: Intent.Download_Complete,
                links: aggregateLinks,
            });
        }
    }
}

function getLinks9a(data: api.IGrabber): void {
    api
        .links9a(data.grabber, {
            ts,
            id: data.params.id,
            mobile: 0,
            options: data.params.options,
            token: data.params.token,
        })
        .then(resp => {
            // console.log(resp);
            let file = autoFallback(quality, resp.data);
            // downloadMethod can either be Browser or External.
            // For Browser, we make use of the default case.
            switch (method) {
                case DownloadMethod.External:
                    if (file) {
                        // the "?" is important after file.file
                        aggregateLinks += `${file.file}?title=${fileName(file, dlEpisode, false)}&type=${file.type}\n`;
                    }
                    status(`Completed ${dlEpisode.num}`);
                    break;
                default:
                    if (file) {
                        chrome.downloads.download({
                            conflictAction: "uniquify",
                            // this means, downloads will go to the 9anime Companion
                            // subdirectory, inside the default download directory.
                            filename: "9anime Companion/" + fileName(file, dlEpisode),
                            url: file.file,
                        });
                    }
                    status(`Completed ${dlEpisode.num}`);
                    break;
            }
        })
        .catch(err => {
            console.debug(err);
            status(`Failed ${dlEpisode.num}`);
        })
        // The last then acts like a finally.
        .then(() => {
            // inProgress = false;
            requeue();
        });
}

function downloadRV(sources: IJWPlayerSource[]): void {
    let file = autoFallback(quality, sources);
    // downloadMethod can either be Browser or External.
    // For Browser, we make use of the default case.
    switch (method) {
        case DownloadMethod.External:
            if (file) {
                // the "?" is important after file.file
                aggregateLinks += `${file.file}?title=${fileName(file, dlEpisode, false)}&type=${file.type}\n`;
            }
            status(`Completed ${dlEpisode.num}`);
            break;
        default:
            if (file) {
                chrome.downloads.download({
                    conflictAction: "uniquify",
                    // this means, downloads will go to the 9anime Companion
                    // subdirectory, inside the default download directory.
                    filename: "9anime Companion/" + fileName(file, dlEpisode),
                    url: file.file,
                });
            }
            status(`Completed ${dlEpisode.num}`);
            break;
    }

    requeue();
}

/**
 * The boss function. It handles the entire downloading
 * process.
 */
export function downloader(): void {
    let ep = selectedEpisodes.shift();
    if (ep) {
        // inProgress = true;
        dlEpisode = ep;
        status(`Downloading ${ep.num}`);
        api
            .grabber({
                id: ep.id,
                ts,
                update: 0,
            })
            .then(resp => {
                // console.log(resp);
                // Server can either be RapidVideo or Default.
                // For Default, we make use of default case.
                switch (server) {
                    // To download from RapidVideo first we query the grabber as always.
                    // But after we get back the details we create a iframe and set its
                    // source to the rv url. When that page is loaded, it gets injected
                    // with "src/ts/external_hosts/rapidVideo.ts". Once the listener
                    // (line#84) gets the sources the iframe is deleted. Rinse and repeat
                    // for the other episodes in the list.
                    case Server.RapidVideo:
                        const iframe = document.createElement("iframe");
                        iframe.id = "rv_grabber_iframe";
                        iframe.src = resp.target;
                        document.getElementsByTagName("body")[0].appendChild(iframe);
                        // console.log(resp, dlEpisode);
                        break;
                    default:
                        getLinks9a(resp);
                        break;
                }
            })
            .catch(err => {
                status(`Failed ${(ep as IEpisode).num}`);
                console.debug(err.response);

                // getLinks9a automatically requeue downloads, but
                // that happens only after the download link is fetched.
                // But what if the download fails after trying to get
                // the grabber? We must requeue it again from here.
                // inProgress = false;
                requeue();
            });
    }
}

/**
 * Triggers the download process.
 * @param baseUrl
 *      The baseUrl of the 9anime site.
 *      Ex: https://9anime.to, https://9anime.is etc
 * @param setupOptions
 *      Setup options for download all
 */
export function start(baseUrl: string, setupOptions: ISetupOptions): void {
    // TODO: support queues for download
    // NOTE:
    // 9ac **DOES NOT** support queues for download. So if you
    // are trying to download from multiple tabs, chances are
    // yor downloads might not go as expected. Please wait till
    // one set of download is over before starting again.
    api.setup({ /* setup the API */
        baseUrl,
    });
    setup(setupOptions); /* setup download all */
    downloader(); /* trigger download */
    utils.notify("", "Starting downloads", "Sit tight!");
}
