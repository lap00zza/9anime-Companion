/**
 * Konichiwa~
 *
 * This is a content script that runs directly on the page.
 * This one runs at document_start (thus the pre suffix).
 * It contains the global functions/methods that must be
 * called before the 9anime page is loaded.
 */

import {loadSettings} from "./utils";

console.info("9anime Companion 1.0.0 (Global Script Pre)");

loadSettings([
    "remAds",
]).then(settings => {
    /**
     * The following is mainly to counter this specific script that 9anime uses.
     * According to my personal research, this accounts for most of the popups.
     *
     *      <script src="//go.oclasrv.com/apu.php?zoneid=1308556" data-cfasync="false"
     *      async="" onerror="_elavfx()" onload="_msdurx()"></script>
     *
     * The following adds the _elavfx and _msdurx methods to window and makes sure
     * they cant be overwritten by 9anime. Thus, stopping (most of) the popups.
     */
    if (settings.remAds) {
        console.info("9anime Companion: Neutralizing ads");
        let head = document.querySelectorAll("head");
        let script = document.createElement("script");
        script.innerText = `
            window._msdurx = () => {
                console.log("9anime Companion: 'Blocking popup...'");
            };
            window._elavfx = () => {
                console.log("9anime Companion: 'Blocking popup...'");
            };
            Object.defineProperty(window, "_msdurx", {
                enumerable: true,
                configurable: false,
                writable: false
            });
            Object.defineProperty(window, "_elavfx", {
                enumerable: true,
                configurable: false,
                writable: false
            })`;

        // Script inject is required because thats the only way to
        // manipulate the global window object.
        head[0].appendChild(script);
    }
});
