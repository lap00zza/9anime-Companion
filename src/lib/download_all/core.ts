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
} from "../common";
import * as utils from "../utils";
import * as api from "./api";
import {IFile} from "./api";

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
let serverId = 22; // default F2 server

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
    serverId: number;
    ts: string;
}

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
    serverId = options.serverId;
    ts = options.ts;
}

/* --- 26-11-2017 --- */
// 9anime's new encryption
// A special thanks to @hoppler (https://github.com/hoppler) for
// helping out with decryptTs and rot8.
const decryptTs = (str: string) => {
    let result = "";
    const firstCharMap = [];
    const secondCharMap = [];
    for (let n = 65; n < 91; n++) {
        firstCharMap.push(String.fromCharCode(n));
        if (n % 2 !== 0) {
            secondCharMap.push(String.fromCharCode(n));
        }
    }
    for (let n = 65; n < 91; n++) {
        if (n % 2 === 0) {
            secondCharMap.push(String.fromCharCode(n));
        }
    }
    for (let i = 0; i < str.length; i++) {
        let charReplaced = false;
        for (let y = 0; y < secondCharMap.length; y++) {
            if (str[i] === secondCharMap[y]) {
                result += firstCharMap[y];
                charReplaced = true;
                break;
            }
        }
        if (!charReplaced) {
            result += str[i];
        }
    }
    return atob(result);
};

function decryptTokenAndOptions(str: string) { /* line: 14138, all.js */
    const cleanStr = str.replace(/^-/, "");
    const firstCharMap = [];
    const secondCharMap = [];
    for (let j = 97; j <= 122; j++) {
        firstCharMap.push(String.fromCharCode(j));
        if (j % 2) {
            secondCharMap.push(String.fromCharCode(j));
        }
    }
    for (let k = 97; k <= 122; k++) {
        if (k % 2 === 0) {
            secondCharMap.push(String.fromCharCode(k));
        }
    }
    /* --- */
    let result = "";
    for (let e = 0; e < cleanStr.length; e++) {
        let replaced = false;
        for (let f = 0; f < secondCharMap.length; f++) {
            if (cleanStr[e] === secondCharMap[f]) {
                result += firstCharMap[f];
                replaced = true;
                break;
            }
        }
        if (!replaced) {
            result += cleanStr[e];
        }
    }
    /* --- */
    return atob(result);
}

/*const rot8 = (str: string) => {
    const i = -18;
    const e = [];
    for (let q = 1; q < str.length; q++) {
        const intChar = str[q].charCodeAt(0);
        let newChar = 0;
        if (intChar >= 97 && intChar <= 122) {
            newChar = (intChar - 71 + i) % 26 + 97;
        } else if (intChar >= 65 && intChar <= 90) {
            newChar = (intChar - 39 + i) % 26 + 65;
        } else {
            newChar = intChar;
        }
        e.push(newChar);
    }
    return e
        .map(c => String.fromCharCode(c))
        .join("");
};*/
/* --- ~~~ --- */

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

function startDownload(file: IFile): void {
    switch (method) {
        case DownloadMethod.External:
            // the "?" is important after file.file
            aggregateLinks += `${file.file}?title=${fileName(file, dlEpisode, false)}&type=${file.type}\n`;
            status(`✔ Completed ${dlEpisode.num}`);
            break;
        default:
            chrome.downloads.download({
                conflictAction: "uniquify",
                // this means, downloads will go to the 9anime Companion
                // subdirectory, inside the default download directory.
                filename: "9anime Companion/" + fileName(file, dlEpisode),
                url: file.file,
            });
            status(`✔ Completed ${dlEpisode.num}`);
            break;
    }
}

function getLinks9a(data: api.IGrabber): void {
    api
        .links9a(data.grabber, {
            id: data.params.id,
            mobile: 0,
            options: decryptTokenAndOptions(data.params.options),
            token: decryptTokenAndOptions(data.params.token),
            ts: decryptTs(ts),
        })
        .then(resp => {
            // console.log(resp);
            let file = autoFallback(quality, resp.data);
            if (!file) {
                status(`❌ Failed ${dlEpisode.num}. No fallback quality found. Use a higher preferred quality.`);
                return;
            }
            startDownload(file);
        })
        .catch(err => {
            console.debug(err);
            status(`❌ Failed ${dlEpisode.num}`);
        })
        // The last then acts like a finally.
        .then(() => {
            // inProgress = false;
            requeue();
        });
}

/**
 * Parse a source string of the form below and return a object.
 * <source src="https://xxx/xxx.mp4" type="video/mp4" title="720p" data-res="720" />
 * @param {string} source
 *      The source string
 */
function rvParseEpisodeDetails(source: string): IFile | null {
    let episodeDetails: IFile = {
        file: "",
        label: "",
        type: "",
    };
    source.split(" ").forEach((el: string) => {
        let rvEpData = el.split("=");
        if (rvEpData.length === 2) {
            let value = rvEpData[1].replace(/["']/g, "");
            // console.log(rvEpData[1], value);
            switch (rvEpData[0]) {
                case "src":
                    episodeDetails.file = value;
                    break;
                case "type":
                    episodeDetails.type = value.replace("video/", "");
                    break;
                case "title":
                    episodeDetails.label = value;
                    break;
                default:
                    break;
            }
        }
    });
    if (episodeDetails.file === "" || episodeDetails.label === "" || episodeDetails.type === "") {
        return null;
    } else {
        return episodeDetails;
    }
}

// To get the links we basically scrap the RapidVideo link using regex.
// TODO: try implementing fallback for rapidvideo downloads later
export function getLinksRV(data: api.IGrabber): void {
    const rvSourcesRegex = /<source(.*)\/>/i;
    // decryptTokenAndOptions works for token, options and target.
    // const endpoint = decryptTokenAndOptions(data.target) + `?q=${DownloadQuality[quality]}`;
    // 18-12-2017
    // looks like 9anime removed the encryption from RapidVideo target
    const endpoint = data.target + `?q=${DownloadQuality[quality]}`;
    fetch(endpoint)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error(response.status.toString());
        })
        .then(resp => {
            // We are looking for this specific line in the RapidVideo html file.
            // <source src="https://xxx/xxx.mp4" type="video/mp4" title="720p" data-res="720" />
            let matched = resp.match(rvSourcesRegex);
            if (matched) {
                let rvEpisodeDetails = rvParseEpisodeDetails(matched[0]);
                // console.log(rvEpisodeDetails);
                if (rvEpisodeDetails && rvEpisodeDetails.label === DownloadQuality[quality]) {
                    startDownload(rvEpisodeDetails);
                } else {
                    status(`❌ Failed ${dlEpisode.num}. Preferred quality not found. Try changing the quality.`);
                    return;
                }
            } else {
                status(`❌ Failed ${dlEpisode.num}. Preferred quality not found. Try changing the quality.`);
                return;
            }
        })
        .catch(err => {
            console.debug(err);
            status(`❌ Failed ${dlEpisode.num}`);
        })
        // The last then acts like a finally.
        .then(() => {
            // inProgress = false;
            requeue();
        });
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
                server: serverId,
                ts: decryptTs(ts),
                update: 0,
            })
            .then(resp => {
                // console.log(resp);
                // Server can either be RapidVideo or Default.
                // For Default, we make use of default case.
                switch (server) {
                    case Server.RapidVideo:
                        getLinksRV(resp);
                        break;
                    default:
                        getLinks9a(resp);
                        break;
                }
            })
            .catch(err => {
                status(`❌ Failed ${(ep as IEpisode).num}`);
                console.debug(err);

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
    sendMessage({
        intent: Intent.Show_Notification,
        message: "Sit tight!",
        title: "Starting downloads",
    });
}
