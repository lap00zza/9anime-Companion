/**
 * Konichiwa~
 *
 * This file contains small enhancements like keyboard shortcuts
 * and tiny utilities like scroll to top which dramatically improves
 * the usability of 9anime.
 */

declare function require(arg: string): string;
import * as $ from "jquery";
import {Intent, IRuntimeResponse} from "./common";

/* --- Watchpage Enhancement Shortcuts --- */
export function shortcuts() {
    $(document).on("keydown", e => {
        switch (e.keyCode) {
            /**
             * This shortcut will move the user to the player.
             * Key: 'T'
             */
            case 84: /*  84 is 't' */
                let playerOffset = 0;
                let player = $("#player");
                if (typeof player.offset() !== "undefined") {
                    // NOTE TO SELF: '!.' asserts that player.offset() is
                    // not undefined, which is true because we just added
                    // a condition to test this.
                    playerOffset = player.offset()!.top;
                }
                $(document).scrollTop(playerOffset - 18);
                break;
            default:
                break;
        }
    });
}

export function globalShortcuts(): void {
    const body = $("body")[0];
    $(document).on("keydown", e => {
        switch (e.keyCode) {
            /**
             * This shortcut displays the enhanced search window.
             * Key: 'S'
             */
            case 83: /* 83 is s */
                if (e.target === body) {
                    // preventDefault because we dont want the character
                    // 's' to show up in the search box.
                    e.preventDefault();
                    $("#nac__enhancedSearch").show();
                    $("#nac__enhancedSearch__searchBox").focus();
                }
                break;
            default:
                break;
        }
    });
}

/* --- Watchpage Enhancement Utilities --- */
/**
 * Adds a scroll to player arrow at the bottom right corner.
 */
export function scrollToPlayer(): void {
    let upArrowIcon = chrome.extension.getURL("images/up-arrow.png");
    $("body").append(
        `<span id='nac__scrollTop'>
            <img src="${upArrowIcon}" height="25px" width="25px">
        </span>`,
    );
    let scrollTopIcon = $("#nac__scrollTop");

    // We will only scroll to a offset near the player. There is
    // no point is scrolling all the way to offset 0/
    scrollTopIcon.on("click", () => {
        let playerOffset = 0;
        let player = $("#player");
        if (typeof player.offset() !== "undefined") {
            // NOTE TO SELF: '!.' asserts that player.offset() is
            // not undefined, which is true because we just added
            // a condition to test this.
            playerOffset = player.offset()!.top;
        }
        $(document).scrollTop(playerOffset - 18);
    });

    // We only want the scrollToTop button to be visible
    // after we have scrolled below the player.
    let scrollVisible = false;
    $(window).on("scroll", () => {
        let scrollPos = $(window).scrollTop() || 0;
        if (scrollPos >= 300 && !scrollVisible) {
            scrollVisible = true;
            scrollTopIcon.animate({
                bottom: "5px",
            });
        } else if (scrollPos < 300 && scrollVisible) {
            scrollVisible = false;
            scrollTopIcon.animate({
                bottom: "-25px",
            });
        } else {
            // do nothing
        }
    });
}

export function enhancedSearch(): void {
    const template = require("html-loader!../templates/enhancedSearchOverlay.html");
    $("body").append(template);

    let search = $("#nac__enhancedSearch");
    let searchTimeout = 0;
    let startSearch = () => {
        let searchText = $("#nac__enhancedSearch__searchBox").val();
        if (searchText) {
            chrome.runtime.sendMessage({
                baseUrl: window.location.origin,
                intent: Intent.Search_Anime,
                searchText,
            }, (resp: IRuntimeResponse) => {
                if (resp.success) {
                    $("#nac__enhancedSearch__results").empty().append(resp.data.html);
                }
            });
        }
    };

    search.on("keydown", e => {
        // Within the search window we dont want
        // any other shortcuts to work.
        e.stopPropagation();
        if (e.keyCode) {
            if (e.keyCode === 27) { /* 27 is escape key */
                search.hide();
            } else if (e.keyCode === 8 || (e.keyCode >= 48 && e.keyCode <= 90)) { /* backspace, a-z and 0-9 */
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(startSearch, 250);
            } else {
                // do nothing
            }
        }
    });
    $("#nac__enhancedSearch__close").on("click", () => {
        search.hide();
    });
}
