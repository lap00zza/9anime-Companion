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

// see download_all.ts to understand what the variables
// below mean.
let server: Server = Server.Default;
let method: DownloadMethod = DownloadMethod.Browser;
let isDownloading = false;
let ts = "";
let animeName = "";

interface ISetupOptions {
    name: string;
    ts: string;
}

// Setup
export function setup(options: ISetupOptions) {
    animeName = options.name;
    ts = options.ts;
}

// *** Animations ***
function showModal(selector: string): void {
    let modal = $(selector);
    $(modal).show();
    $(modal).find(".container").addClass("fade_in");
    setTimeout(() => {
        $(modal).find(".container").removeClass("fade_in");
    }, 500);
}

function hideModal(selector: string): void {
    let modal = $(selector);
    $(modal).find(".container").addClass("fade_out");
    setTimeout(() => {
        $(modal).find(".container").removeClass("fade_out");
        $(modal).hide();
    }, 500);
}

function shakeModal(selector: string): void {
    let modal = $(selector);
    $(modal).find(".container").addClass("shake");
    setTimeout(() => {
        $(modal).find(".container").removeClass("shake");
    }, 820);
}

function disableInputs(): void {
    $(".nac__dl-all").attr("disabled", "disabled");
}

function enableInputs(): void {
    $(".nac__dl-all").removeAttr("disabled");
}

/**
 * Returns a 'Download' button.
 * @param {Server} targetServer
 *      The server from which episodes will be downloaded.
 *      Allowed types are Server.Default and Server.RapidVideo.
 * @returns
 *      A nicely generated 'Download' button
 */
export function downloadBtn(targetServer: Server): JQuery<HTMLElement> {
    let btn = $(`<button data-type="${targetServer}" class="nac__dl-all">Download</button>`);
    btn.on("click", e => {
        // This array hold's all the the episodes of the current
        // anime for a particular server (ex: RapidVideo, F2, F4)
        let episodes: IEpisode[] = [];
        server = $(e.currentTarget).data("type");

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
        showModal("#nac__dl-all__ep-modal");
    });
    return btn;
}

/**
 * Returns a modal which will be used for displaying links
 * when download method external is chosen.
 * @returns
 *      The Links Modal
 */
export function linksModal(): JQuery<HTMLElement> {
    let template = require("html-loader!./templates/dlAll_linksModal.html");
    let modal = $(template);
    let clipboardIcon = chrome.extension.getURL("assets/images/clipboard.png");

    // 1> Add the clipboard icon to the button
    modal.find("#nac__dl-all__copy-links > img").attr("src", clipboardIcon);

    // 2> When the overlay is clicked, the modal hides
    modal.on("click", e => {
        if (e.target === modal[0]) {
            hideModal("#nac__dl-all__links-modal");
        }
    });

    // 3> Bind functionality to the 'Copy to clipboard' button.
    modal.find("#nac__dl-all__copy-links").on("click", () => {
        $("#nac__dl-all__links").select();
        document.execCommand("copy");
    });

    modal.hide();
    return modal;
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
    modal.find(".title").text(`Download ${animeName} episodes:`);

    // 2> When the overlay is clicked, the modal hides
    modal.on("click", e => {
        if (e.target === modal[0]) {
            hideModal("#nac__dl-all__ep-modal");
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
                // This part might look a bit complex but what its actually
                // doing is mapping the select value in the modal to
                // DownloadQuality and DownloadMethod types.
                let quality: DownloadQuality = DownloadQuality[$("#nac__dl-all__quality").val() as DownloadQualityKeys]
                    || DownloadQuality["360p"];
                method = DownloadMethod[$("#nac__dl-all__method").val() as DownloadMethodKeys]
                    || DownloadMethod.Browser;

                isDownloading = true;
                // hideEpModal();
                disableInputs();

                // Well since content scripts cant really download
                // we will send a message to the background script
                // which will do it for us.
                chrome.runtime.sendMessage({
                    animeName,
                    // Note: location.origin is not supported in all browser
                    baseUrl: window.location.origin,
                    server,
                    intent: Intent.Download_All,
                    method,
                    quality,
                    selectedEpisodes,
                    ts,
                });
            } else {
                // Gotta select some episodes!!!
                shakeModal("#nac__dl-all__ep-modal");
            }
        }
    });

    // When the modal is first attached, it should be hidden.
    modal.hide();
    return modal;
}

/**
 * This part will notify us when the downloads are complete.
 */
chrome.runtime.onMessage.addListener((message: IRuntimeMessage) => {
    if (message.intent === Intent.Download_Complete) {
        console.info("Download Complete", message);
        if (method === DownloadMethod.External) {
            $("#nac__dl-all__links").text(message.links);
            showModal("#nac__dl-all__links-modal");
        }
        isDownloading = false;
        enableInputs();
    }
});
