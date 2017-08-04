(function () {
    // 0 means Intent.Open_Options. Check
    // src/common.ts for more details
    chrome.runtime.sendMessage({
        intent: 0,
    })
    window.close();
})();
