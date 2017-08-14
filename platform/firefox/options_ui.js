(function () {
    document
        .getElementById("openSettings")
        .addEventListener("click", function () {
            // 0 means Intent.Open_Options. Check
            // src/ts/common.ts for more details
            chrome.runtime.sendMessage({
                intent: 0,
            });
        });
})();
