/**
 * Konichiwa~
 *
 * This script gets injected into rapidvideo player and sends
 * a list of all the video sources as a message to the top level
 * window.
 */
(() => {
    const script = document.createElement("script");
    script.innerText =
        `if (parent != window) {
            parent.postMessage({
                event: "nac__external__rapidvideo-sources",
                sources: window.jwplayer().getPlaylist()[0].sources
            }, "*");
        }`;
    document.getElementsByTagName("head")[0].appendChild(script);
})();
