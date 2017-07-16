/**
 * Konichiwa~
 *
 * => Part of Content Script
 * This is responsible for the Download All widgets/components.
 *
 * @see {@link https://git.io/vQdkU} for a brief overview.
 */

declare function require(arg: string): string;
import * as $ from "jquery";
import {
    DownloadMethod,
    DownloadMethodKeys,
    DownloadQuality,
    DownloadQualityKeys,
    IEpisode,
    Intent,
    IRuntimeMessage,
    Server,
} from  "./common";
import * as utils from "./utils";

/**
 * 9anime Companion can only download from 1 server at
 * a time. This variable holds the type of server from
 * which we are currently downloading/will download.
 * @default Server.Default
 */
let currentServer: Server =  Server.Default;

// A boolean flag to track if download is in progress.
let isDownloading = false;

// We need this value while sending API requests.
let ts = "";

// Name of the current anime.
let animeName = "";

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

function showEpModal(): void {
    $("#nac__dl-all__ep-modal").show();
}

function hideEpModal(): void {
    $("#nac__dl-all__ep-modal").hide();
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
            let selectedEpisodes: IEpisode[] = [];
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
            // And... let it rip!
            if (selectedEpisodes.length > 0) {
                // TODO: disable inputs
                let quality: DownloadQuality = DownloadQuality[$("#nac__dl-all__quality").val() as DownloadQualityKeys]
                    || DownloadQuality["360p"];
                let method: DownloadMethod = DownloadMethod[$("#nac__dl-all__method").val() as DownloadMethodKeys]
                    || DownloadMethod.Browser;
                isDownloading = true;

                // Well since content scripts cant really download
                // we will send a message to the background script
                // which will do it for us.
                chrome.runtime.sendMessage({
                    animeName,
                    // Note: location.origin is not supported in all browser
                    baseUrl: window.location.origin,
                    currentServer,
                    intent: Intent.Download_All,
                    method,
                    quality,
                    selectedEpisodes,
                    ts,
                });
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

chrome.runtime.onMessage.addListener((message: IRuntimeMessage) => {
    if (message.intent === Intent.Download_Complete) {
        console.info("Download Complete");
        isDownloading = false;
    }
});
