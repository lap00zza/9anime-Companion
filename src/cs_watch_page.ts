// TODO: implement settings loader
import * as $ from "jquery";
import {downloadBtn, epModal, Server} from "./download_all";
import utilityBar from "./utility_bar";

console.info("%c9anime Companion 1.0.0", "color: orange; font-weight: bold;");

let title = $("h1.title");
let animeName = title.text();
let currentEpisode = $("#servers").find(".episodes > li > a.active").data("base");

// INFO:
// rem* -> remove*
// res* -> resize*
// TODO: is minimal mode actually required?
let settings = {
    downloadAll: true,
    remAds: true,
    remComments: false,
    remInfo: false,
    remSuggested: false,
    resPlayer: true,
    utilityBar: true,
};

// Remove visible ads from the DOM.
// This does not block ads.
if (settings.remAds) {
    console.info("Removing ads");
    // Contains the known ad selectors.
    let adsSelectors = [
        ".a_d",
        ".sidebar",
    ];
    for (let i of adsSelectors) {
        $(i).remove();
    }
}

if (settings.resPlayer) {
    console.info("Resizing player");
    let player = $("#player");
    player.css("maxHeight", "500px");
    player.parent().css("width", "100%");
}

if (settings.remComments) {
    console.info("Removing comments");
    $("#comment").remove();
}

if (settings.remSuggested) {
    console.info("Removing suggested");
    $("#movie")
        .find("div.widget-title")
        .filter((index, el) => {
            return $(el).text() === "You might also like";
        })
        .parent()
        .remove();
}

if (settings.remInfo) {
    console.info("Removing info");
    title.remove();
    $("#info").remove();
}

if (settings.utilityBar) {
    $("#player").parent().append(utilityBar(animeName, {episode: currentEpisode}));
}

if (settings.downloadAll) {
    $("body").append(epModal(animeName));

    let servers = $(".server.row > label");
    for (let server of servers) {
        let serverLabel = $(server).text();

        // Basically what we are doing here is testing
        // the labels and adding appropriate dl buttons.
        if (/RapidVideo/i.test(serverLabel)) {
            $(server).append(downloadBtn(Server.RapidVideo, animeName));
        } else if (/Server\s+F/i.test(serverLabel)) {
            $(server).append(downloadBtn(Server.Default, animeName));
        }
    }
}
