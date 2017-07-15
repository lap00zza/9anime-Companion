/**
 * Konichiwa~
 *
 * @file Responsible for the Download All functionality.
 * @see {@link https://git.io/vQdkU} for a brief overview.
 *
 * Thanks for deciding to contribute/read :) You are awesome!
 */

declare function require(arg: string): string;
import * as $ from "jquery";
import * as api from "./api";
import * as utils from "./utils";

/**
 * The list of servers that 9anime Companion can
 * currently download from. PR's are welcome to
 * help expand the server pool.
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

type DownloadQualityKeys = "360p" | "480p" | "720p" | "1080p";

/**
 * The available download methods. There are 2:
 * - Browser: files will be downloaded via the browser downloader
 * - External: links will be displayed in a popup for the users.
 *   (Links can then be used with external download managers.)
 *
 * Items here **must** match the items in the dlAll_epModal.html file.
 */
enum DownloadMethod {
    "Browser",
    "External",
}

type DownloadMethodKeys = "Browser" | "External";

interface IEpisode {
    id: string; /* The actual episode id. ex: 42m48j */
    num: string; /* The  digit episode number. ex: 001 */
}

// The episodes that the users selected in the epModal
// are stored here. These are the episodes that will be
// downloaded.
let selectedEpisodes: IEpisode[] = [];

// 9anime Companion can only download from 1 server at
// a time. This variable holds the type of server from
// which we are currently downloading/will download.
// Defaults to Server.Default which is the 9anime server.
let currentServer: Server = Server.Default;

// A boolean flag to track if download is in progress.
let isDownloading = false;

// We need this value while sending API requests. This
// is set by the `setup()` method.
let ts = "";

// Name of the current anime. This is set by the `setup()`
// method.
let animeName = "";

/**
 * The preferred quality of the files to download.
 * @default Quality["360p"]
 */
let downloadQuality: DownloadQuality = DownloadQuality["360p"];

/**
 * The preferred download method.
 * @default DownloadMethod.Browser
 */
let downloadMethod: DownloadMethod = DownloadMethod.Browser;

function showEpModal(): void {
    $("#nac__dl-all__ep-modal").show();
}

function hideEpModal(): void {
    $("#nac__dl-all__ep-modal").hide();
}

interface ISetupOptions {
    name: string;
    ts: string;
}

/**
 * This function is very important. It must be called
 * before using any functions from this module. Its
 * sets a few important variables like animeName and
 * ts that are required by the functions.
 * @param options
 *      name and ts parameters
 */
export function setup(options: ISetupOptions) {
    animeName = options.name;
    ts = options.ts;
}

/**
 * Returns a 'Download' button.
 * @param {Server} server
 *      The server from which episodes will be downloaded.
 *      Allowed types are 9anime and RapidVideo.
 * @returns
 *      A nicely generated 'Download' button
 */
export function downloadBtn(server: Server): JQuery<HTMLElement> {
    let btn = $(`<button data-type="${server}" class="nac__dl-all">Download</button>`);
    btn.on("click", e => {
        // This array hold's all the the episodes of the current
        // anime for a particular server (ex: RapidVideo, F2, F4)
        let episodes: IEpisode[] = [];
        currentServer = $(e.currentTarget).data("type");

        // TODO: maybe all of this should be generated only once or somehow cached
        // Every time the 'Download' button is clicked,
        // all the episodes for the current server are
        // fetched and added to "episodes".
        let epLinks = $(e.currentTarget).parents(".server.row").find(".episodes > li > a");
        for (let ep of epLinks) {
            let id = $(ep).data("id");
            let num = $(ep).data("base");
            if (id && num) {
                episodes.push({
                    id, /* short hand property. "id" means id: id */
                    num: utils.pad(num),
                });
            }
        }

        // Then we iterate through "episodes" and add each
        // episode to the "epModal". The user can then take
        // further action.
        let modalBody = $("#nac__dl-all__ep-modal").find(".body");
        // Delete the earlier episodes and start fresh
        modalBody.empty();
        for (let ep of episodes) {
            let epSpan = $(
                // TODO: do we really need the animeName in the download box? looks a bit crowded
                `<span class="nac__dl-all__episode">
                    <input type="checkbox" id="${ep.id}" data-num="${ep.num}">
                    <label for="${ep.id}">${animeName}: Ep. ${ep.num}</label>
                </span>`);
            modalBody.append(epSpan);
        }
        showEpModal();
    });
    return btn;
}

/**
 * Returns a modal which will be used for displaying the
 * episodes checklist, quality preference and downloader
 * select before the user downloads.
 * @returns
 *      The Episode Select Modal
 */
export function epModal(): JQuery<HTMLElement> {
    // We wil start by loading the template from an external file.
    let template = require("html-loader!./templates/dlAll_epModal.html");
    let modal = $(template);

    // 1> Add the anime name to the "header"
    modal.find(".title").text("Download " + animeName + " episodes:");

    // 2> When the overlay is clicked, the modal hides
    modal.on("click", e => {
        if (e.target === modal[0]) {
            hideEpModal();
        }
    });

    // 3> Bind functionality for the "Select All" button
    modal.find("#nac__dl-all__select-all").on("click", () => {
        $("#nac__dl-all__ep-modal").find(".body input[type='checkbox']").prop("checked", true);
    });

    // 4> Bind functionality for the "Download" button
    modal.find("#nac__dl-all__download").on("click", () => {
        if (!isDownloading) {
            selectedEpisodes = [];
            // First, we get all the checked episodes in the
            // modal and push these to selectedEpisodes.
            $("#nac__dl-all__ep-modal")
                .find(".body input[type='checkbox']:checked")
                .each((i, el) => {
                    selectedEpisodes.push({
                        id: $(el).attr("id") || "",
                        num: $(el).data("num"),
                    });
                });
            // And... let it rip! We start downloading.
            if (selectedEpisodes.length > 0) {
                // TODO: disable inputs
                downloadQuality = DownloadQuality[$("#nac__dl-all__quality").val() as DownloadQualityKeys]
                    || DownloadQuality["360p"];
                downloadMethod = DownloadMethod[$("#nac__dl-all__method").val() as DownloadMethodKeys]
                    || DownloadMethod.Browser;
                isDownloading = true;
                downloader();
            } else {
                // TODO: shake the epModal
                console.info("You need to select some episodes");
            }
        }
    });

    // When the modal is first attached, it should be hidden.
    modal.hide();
    return modal;
}

/**
 * This function returns a episode of users preferred quality, or,
 * if preferred quality is missing, returns the next lower quality.
 * @param pref
 *      The preferred quality. Must be of type Quality.
 * @param episodes
 *      The list of episodes from which we choose an episode
 *      with the preferred quality.
 * @returns
 *      A episode with preferred quality or the next lower
 *      quality. If there are no lower qualities then null
 *      is returned.
 * @see {@link https://git.io/vQdkt} for the unit tests.
 */
export function autoFallback(pref: DownloadQuality, episodes: api.IFile[]): api.IFile | null {
    // Start at the preferred quality, the count down.
    for (let i = pref; i >= DownloadQuality["360p"]; i--) {
        // for each "quality" we loop through episodes
        // and see if we find a suitable match.
        for (let episode of episodes) {
            if (episode.label === DownloadQuality[i]) {
                return episode;
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
    }
}

function getLinks9a(data: api.IGrabber) {
    api
        .links9a(data.grabber, {
            ts,
            id: data.params.id,
            mobile: 0,
            options: data.params.options,
            token: data.params.token,
        })
        .then(resp => {
            console.info(resp);
            // downloadMethod can either be browser or external.
            // For browser, we make use of the default case.
            switch (downloadMethod) {
                case DownloadMethod.External:
                    break;
                default:
                    let file = autoFallback(downloadQuality, resp.data);
                    break;
            }
        })
        .catch(err => console.debug(err));
}

/**
 * The boss function. It handles the entire downloading
 * process.
 */
function downloader(): void {
    let ep = selectedEpisodes.shift();
    if (ep) {
        console.info("Downloading:", ep.num);
        api
            .grabber({
                id: ep.id,
                ts,
                update: 0,
            })
            .then(resp => {
                // Server can either be RapidVideo or Default.
                // For Default, we make use of default case.
                switch (currentServer) {
                    case Server.RapidVideo:
                        // RapidVideo
                        break;
                    default:
                        getLinks9a(resp);
                        break;
                }
            })
            .catch(err => console.debug(err))
            // The last then acts like a finally.
            // It will always run no matter what.
            .then(() => requeue());
    }
}
