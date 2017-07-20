/**
 * Konichiwa~
 *
 * => Part of Content Script
 * This is responsible for the Download All widgets/components.
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
} from  "../common";
import * as utils from "../utils";

// see core.ts to understand what the variables
// below mean.
let server: Server = Server.Default;
let method: DownloadMethod = DownloadMethod.Browser;
let isDownloading = false;
let ts = "";
let animeName = "";

// Contains most of the selectors used. Can be
// used to quickly access the required selectors
// without having to remember the names.
const selectors = {
    copyLinks:  "#nac__dl-all__copy-links",     /* linksModal */
    dlBtn:      ".nac__dl-all__btn",            /* Page */
    download:   "#nac__dl-all__download",       /* epModal */
    epModal:    "#nac__dl-all__ep-modal",       /* epModal */
    links:      "#nac__dl-all__links",          /* linksModal */
    linksModal: "#nac__dl-all__links-modal",    /* linksModal */
    method:     "#nac__dl-all__method",         /* epModal */
    quality:    "#nac__dl-all__quality",        /* epModal */
    selectAll:  "#nac__dl-all__select-all",     /* linksModal */
    status:     "#nac__dl-all__status",         /* Page */
    statusBar:  ".nac__dl-all__status-bar",     /* Page */
};

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
    $(selectors.dlBtn).attr("disabled", "disabled");
}

function enableInputs(): void {
    $(selectors.dlBtn).removeAttr("disabled");
}

export function statusBar() {
    return `
    <div class="nac__dl-all__status-bar" style="display: none;">
        <span>Status:</span>
        <div id="nac__dl-all__status">ready to download...</div>
    </div>`;
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
    let btn = $(`<button data-type="${targetServer}" class="nac__dl-all__btn">Download</button>`);
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
        let modalBody = $(selectors.epModal).find(".body");
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
        showModal(selectors.epModal);
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
    let template = require("html-loader!../templates/dlAll_linksModal.html");
    let modal = $(template);
    let clipboardIcon = chrome.extension.getURL("assets/images/clipboard.png");

    // 1> Add the clipboard icon to the button
    modal.find(selectors.copyLinks).find("img").attr("src", clipboardIcon);

    // 2> When the overlay is clicked, the modal hides
    modal.on("click", e => {
        if (e.target === modal[0]) {
            hideModal(selectors.linksModal);
        }
    });

    // 3> Bind functionality to the 'Copy to clipboard' button.
    modal.find(selectors.copyLinks).on("click", () => {
        $(selectors.links).select();
        document.execCommand("copy");
    });

    // When the modal is first attached, it should be hidden.
    // Not to be confused with hideModal() function.
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
    let template = require("html-loader!../templates/dlAll_epModal.html");
    let modal = $(template);

    // 1> Add the anime name to the "header"
    modal.find(".title").text(`Download ${animeName} episodes:`);

    // 2> When the overlay is clicked, the modal hides
    modal.on("click", e => {
        if (e.target === modal[0]) {
            hideModal(selectors.epModal);
        }
    });

    // 3> Bind functionality for the "Select All" button
    modal.find(selectors.selectAll).on("click", () => {
        $(selectors.epModal).find(".body input[type='checkbox']").prop("checked", true);
    });

    // 4> Bind functionality for the "Download" button
    modal.find(selectors.download).on("click", () => {
        if (!isDownloading) {
            let selectedEpisodes: IEpisode[] = [];

            // This part might look a bit complex but what its actually doing is
            // mapping the select value in the modal to DownloadQuality and
            // DownloadMethod types.
            let quality: DownloadQuality = DownloadQuality[$(selectors.quality).val() as DownloadQualityKeys]
                || DownloadQuality["360p"];
            method = DownloadMethod[$(selectors.method).val() as DownloadMethodKeys] || DownloadMethod.Browser;

            // First, we get all the checked episodes in the
            // modal and push these to selectedEpisodes.
            $(selectors.epModal)
                .find(".body input[type='checkbox']:checked")
                .each((i, el) => {
                    selectedEpisodes.push({
                        id: $(el).attr("id") || "",
                        num: $(el).data("num"),
                    });
                });

            // And... let it rip!
            if (selectedEpisodes.length > 0) {
                isDownloading = true;
                hideModal(selectors.epModal);
                disableInputs();
                $(selectors.statusBar).show();

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
                shakeModal(selectors.epModal);
            }
        }
    });

    // When the modal is first attached, it should be hidden.
    // Not to be confused with hideModal() function.
    modal.hide();
    return modal;
}

/**
 * This part will notify us when the downloads are complete.
 */
chrome.runtime.onMessage.addListener((message: IRuntimeMessage) => {
    switch (message.intent) {
        case Intent.Download_Complete:
            if (method === DownloadMethod.External) {
                // Display the aggregate links.
                $(selectors.links).text(message.links);
                showModal(selectors.linksModal);
            }
            $(selectors.statusBar).hide();
            isDownloading = false;
            enableInputs();
            break;
        case Intent.Download_Status:
            $(selectors.status).text(message.status);
            break;
        default:
            break;
    }
});
