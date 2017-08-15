/**
 * Konichiwa~
 *
 * This file contains small enhancements like keyboard shortcuts
 * and tiny utilities like scroll to top which dramatically improves
 * the usability of 9anime.
 */

import * as $ from "jquery";

/* --- Watchpage Enhancement Shortcuts --- */
export let shortcuts = () => {
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
};

/* --- Watchpage Enhancement Utilities --- */
export let utilities = () => {
    // [1]: Adds a scroll to top arrow at the bottom right corner
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
};
