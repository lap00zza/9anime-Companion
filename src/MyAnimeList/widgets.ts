/**
 * Konichiwa~
 * => Part of Content Script
 * This is responsible for the MyAnimeList widgets/components.
 */

declare function require(arg: string): string;
import * as $ from "jquery";
import {
    IMALSearchAnime,
    IMALUserListAnime,
    Intent,
} from "../common";
import {cleanAnimeName} from "../utils";

let animeName = "";
let animeId = "";
let currentAnime: IMALSearchAnime;
let currentEpisode = "1";
let statusIconTimeout = 0;
let userList: IMALUserListAnime[];

enum StatusType {
    InProgress,
    Success,
    Fail,
}

const selectors = {
    add:            "#nac__mal__add",
    incrementEp:    "#nac__mal__increment-ep",
    quickAccess:    "#nac__mal__quick-access",
    sectionAdd:     "#nac__mal__section-add",
    sectionUpdate:  "#nac__mal__section-update",
    statusIcon:     "#nac__mal__status-icon",
    totalEp:        "#nac__mal__total-ep",
    update:         "#nac__mal__update",
    watchedEp:      "#nac__mal__watched-ep",        /* textbox */
};

interface ISetupOptions {
    animeName: string;
    currentEpisode: string;
}

// Setup
export function setup(options: ISetupOptions): void {
    animeName = cleanAnimeName(options.animeName);
    currentEpisode = options.currentEpisode;

    // The actual setup
    $("#player").parent().append(quickAccess());
    initialize();
}

// Hides the loader in the quick access widget.
function hideLoader(): void {
    $(selectors.quickAccess).find(".loader").fadeOut(300);
}

function showStatusIcon(statusType: StatusType = StatusType.InProgress): void {
    // Clear the timeout to make sure we dont
    // accidentally hide a icon when its needed.
    clearTimeout(statusIconTimeout);

    let statusIcon = $(selectors.statusIcon);
    switch (statusType) {
        case StatusType.Success:
            statusIcon.attr("src", chrome.extension.getURL("assets/images/check-mark.png"));
            break;
        case StatusType.Fail:
            statusIcon.attr("src", chrome.extension.getURL("assets/images/x-mark.png"));
            break;
        default: /* StatusType.InProgress */
            statusIcon.attr("src", chrome.extension.getURL("assets/images/tail-spin.svg"));
            break;
    }
    statusIcon.show();
}

function hideStatusIcon(): void {
    // Clear the timeout to make sure we dont
    // accidentally hide a icon when its needed.
    clearTimeout(statusIconTimeout);

    statusIconTimeout = setTimeout(() => {
        $(selectors.statusIcon).fadeOut(500);

        // FIXME: glitch where on showing status icon the previous icon is temporarily visible.
        // $(selectors.statusIcon).attr("src", "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=");
    }, 5000);
}

function showSectionAdd(): void {
    $(selectors.sectionAdd).show();
    $(selectors.sectionUpdate).hide();
}

function showSectionUpdate(): void {
    $(selectors.sectionAdd).hide();
    $(selectors.sectionUpdate).show();
}

/**
 * Callback function for {@link epChangeCallbacks}. This function helps
 * implement the auto mal sync behaviour.
 * @param newEpId
 * @param newEpNum
 * @todo only use this for autoupdate.
 */
export function epTracker(newEpId: string, newEpNum: string): void {
    // console.log(newEpId, newEpNum);

    // We need to make sure that the newEpNum is actually a episode
    // number and not stuff like tv, full, movie etc.
    if (!isNaN(Number(newEpNum))) {
        currentEpisode = newEpNum;
        // makes no sense updating watched box without auto sync
        // $(selectors.watchedEp).val(newEpNum);
    }
}

/**
 * Checks if the current anime is in users MAL List. If it
 * exists, then the MAL entry is returned which is used for
 * getting information like watched episodes etc. If the
 * current anime does not exist, then null is returned.
 */
function isAnimeInUserList(): IMALUserListAnime | null {
    for (let entry of userList) {
        if (currentAnime.id === entry.series_animedb_id) {
            return entry;
        }
    }
    return null;
}

/**
 * Searches MAL and returns current anime. It does this by regex
 * matching the items on the returned MAL search list with the
 * anime name that we get from the title.
 */
function getCurrentAnime(): Promise<IMALSearchAnime> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            animeName,
            intent: Intent.MAL_Search,
        }, resp => {
            if (resp.success) {
                // We need the actual brackets in the regex for anime's
                // like Little Witch Academia (TV). So we escape them.
                let fixed = animeName.replace("(", "\\(").replace(")", "\\)");
                let titleRe = new RegExp(`^${fixed}$`, "i");
                // console.log(resp);

                for (let entry of (resp.data as IMALSearchAnime[])) {
                    if (entry.title.match(titleRe)) {
                        // Why return? because we need to break away
                        // here without executing any more code in
                        // this block.
                        return resolve(entry);
                    }
                }
            }
            // If there were no match,
            // we reject this promise :<
            reject(resp.err);
        });
    });
}

/**
 * Returns users MAL Anime List.
 */
function getUserList(): Promise<IMALUserListAnime[]> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            intent: Intent.MAL_Userlist,
        }, resp => {
            if (resp.success) {
                resolve(resp.data as IMALUserListAnime[]);
            } else {
                reject(resp.err);
            }
        });
    });
}

export function initialize(): void {
    Promise.all([getCurrentAnime(), getUserList()])
        .then(value => {
            currentAnime = value[0];
            userList = value[1];
            animeId = currentAnime.id;
            // console.log(currentAnime, userList);

            let entry = isAnimeInUserList();
            if (entry) {    /* --- Update Anime --- */
                showSectionUpdate();
                $(selectors.totalEp).text(currentAnime.episodes);
                $(selectors.watchedEp).val(entry.my_watched_episodes);
            } else {        /* --- Add Anime --- */
                showSectionAdd();
            }
            hideLoader();
        })
        .catch(err => {
            // console.log(err);
            let qa = $(selectors.quickAccess);
            qa.find(".loader > img").hide();
            switch (err) {
                case 204:
                    qa.find(".loader > .status").show().text("Anime not found in MAL :(");
                    break;
                case 401:
                    qa.find(".loader > .status").show().text("Invalid MAL credentials");
                    break;
                default:
                    qa.find(".loader > .status").show().text("Oops! Something went wrong");
                    break;
            }
        });
}

/**
 * Returns the MyAnimeList quick access widget. This widget
 * allows a user to quickly add/update anime to their MAL.
 */
export function quickAccess(): JQuery<HTMLElement> {
    let template = require("html-loader!../templates/mal_quickAccess.html");
    let qa = $(template);

    // Set the default images. For the statusIcon, we embed a
    // blank 1x1 gif because a img tag with no source is not
    // valid and will cause a unwanted server hit.
    qa.find(".loader > img").attr("src", chrome.extension.getURL("assets/images/puff.svg"));
    qa.find(selectors.statusIcon).attr("src", "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=");

    // Hide the status icon. Its only visible
    // during a ongoing operations.
    qa.find(selectors.statusIcon).hide();

    // --- Attach functionality ---
    // watchedEp textbox should only allow numbers
    qa.find(selectors.watchedEp).on("keydown", e => {
        if (e.keyCode) {
            // Backspace is allowed
            if (!(e.keyCode === 8 || (e.keyCode >= 48 && e.keyCode <= 57))) {
                return false;
            }
        }
    });

    qa.find(selectors.incrementEp).on("click", () => {
        let c = $(selectors.watchedEp).val();
        $(selectors.watchedEp).val(Number(c) + 1);
    });

    qa.find(selectors.add).on("click", () => {
        showStatusIcon();
        chrome.runtime.sendMessage({
            animeId,
            intent: Intent.MAL_QuickAdd,
        }, resp => {
            if (resp.success) {
                showStatusIcon(StatusType.Success);
                showSectionUpdate();
                $(selectors.totalEp).text(currentAnime.episodes);
                $(selectors.watchedEp).val(1);
            } else {
                showStatusIcon(StatusType.Fail);
            }
            // Hide the status icon after 5 seconds
            hideStatusIcon();
        });
    });

    qa.find(selectors.update).on("click", () => {
        showStatusIcon();
        chrome.runtime.sendMessage({
            animeId,
            episode: $(selectors.watchedEp).val(),
            intent: Intent.MAL_QuickUpdate,
        }, resp => {
            if (resp.success) {
                showStatusIcon(StatusType.Success);
            } else {
                showStatusIcon(StatusType.Fail);
            }
            // Hide the status icon after 5 seconds
            hideStatusIcon();
        });
    });

    // Hide the status span since we only show
    // it if loading the mal widget fails for
    // some reason.
    qa.find(".loader > .status").hide();
    return qa;
}
