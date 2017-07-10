declare function require(arg: string): string;
import * as $ from "jquery";
import * as api from "./api";
import * as utils from "./utils";

// The list of servers that 9anime Companion can
// currently download from. PR's are welcome to
// help expand the server pool.
export enum Server {
    "Default", /* default means the 9anime server */
    "RapidVideo",
}

interface IEpisode {
    id: string; /* The actual episode id. ex: 42m48j */
    num: string; /* The  digit episode number. ex: 001 */
}

// This array hold's all the id's of the episodes of
// a particular server (ex: RapidVideo or 9anime) of
// the current anime.
let episodes: IEpisode[] = [];
let selectedEpisodes: IEpisode[] = [];

// 9anime Companion can only download from 1 server at
// a time. This variable holds the type of server from
// which we are currently downloading/will download.
let currentServer: Server = Server.Default;

// A boolean flag to track if download is in progress.
let isDownloading = false;

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
 * @param {string} animeName - Name of the current anime.
 * @returns {JQuery<HTMLElement>} - 'Download' button
 */
export function downloadBtn(server: Server, animeName: string): JQuery<HTMLElement> {
    let btn = $(`<button data-type="${server}" class="nac__dl-all">Download</button>`);
    btn.on("click", e => {
        episodes = [];
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
                `<span class="nac__dl-all__episode">
                    <input type="checkbox" id="${ep.id}" data-num="${ep.num}">
                    <label for="${ep.id}">${animeName}: Ep. ${ep.num}</label>
                </span>`);
            modalBody.append(epSpan);
        }
        console.info(currentServer);
        showEpModal();
    });
    return btn;
}

/**
 * Returns a modal which will be used for displaying the
 * episodes checklist, quality preference and downloader
 * select before the user downloads.
 * @param {string} name - Name of the current anime
 * @returns {JQuery<HTMLElement>} - Episode Select Modal
 */
export function epModal(name: string): JQuery<HTMLElement> {
    // We wil start by loading the template from an external file.
    let template = require("html-loader!./templates/dlAll_epModal.html");
    let modal = $(template);

    // 1> Add the anime name to the "header"
    modal.find(".title").text("Download " + name + " episodes:");

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
        selectedEpisodes = [];
        // First, we get all the episodes that are
        // checked in the modal and push these to
        // selectedEpisodes.
        $("#nac__dl-all__ep-modal")
            .find(".body input[type='checkbox']:checked")
            .each((i, el) => {
                selectedEpisodes.push({
                    id: $(el).attr("id") || "",
                    num: $(el).data("num"),
                });
            });
        // And... let it rip! We start downloading.
        if (!isDownloading && selectedEpisodes.length > 0) {
            isDownloading = true;
            downloader();
        }
    });

    // When the modal is first attached, it should be hidden.
    modal.hide();
    return modal;
}

function downloader(): void {
    console.info("Downloading...", selectedEpisodes);
    api
        .grabber({
            id: selectedEpisodes[0].id,
            ts: "1499673600",
            update: 0,
        })
        .then(resp => console.info(resp))
        .catch(err => console.debug(err));
}
