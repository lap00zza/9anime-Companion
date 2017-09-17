/**
 * MIT License
 * Copyright (c) 2017 Jewel Mahanta
 * Check accompanied LICENSE file for details.
 */

/**
 * Konichiwa~
 *
 * This is the site integration "content script" for MAL.
 * This adds the watch on 9anime button to MAL anime pages.
 *
 * This is written in JS for the time being.
 * @todo change to typescript
 */

/* globals chrome, console */

const titleSpan = document.querySelectorAll("h1 > span[itemprop='name']");
const profileRows = document.getElementById("profileRows");
const linkDiv = domAddLink();

const isUrl = function (url) {
    const re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    return re.test(url);
};

/**
 * Parses the html from 9anime search results and returns
 * the url of the anime.
 * @param {string} animeName
 *      Name of the anime whose link to return
 * @param {string} html
 *      HTML string returned by 9anime search
 * @returns {string}
 */
let getAnimeLink = (animeName, html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const searchArr = doc.querySelectorAll(".info > a.name");
    for (let i = 0; i < searchArr.length; i++) {
        if (searchArr[i].innerText === animeName) {
            const url = searchArr[i].href;
            return isUrl(url) ? url : "";
        }
    }
    return "";
};

function domAddLink() {
    if (profileRows) {
        const iconReverse = chrome.runtime.getURL("images/iconReverse.png");
        const icon = chrome.runtime.getURL("images/icon.png");
        const linkDiv = document.createElement("div");
        linkDiv.classList.add("nac__mal-site-link");
        linkDiv.innerHTML =
            `<a href="#">` +
            `    <img src="${icon}"><span>Fetching 9anime link</span>` +
            `</a>`;
        linkDiv.addEventListener("mouseenter", function () {
            linkDiv.getElementsByTagName("img")[0].src = iconReverse;
        });
        linkDiv.addEventListener("mouseleave", function () {
            linkDiv.getElementsByTagName("img")[0].src = icon;
        });
        profileRows.parentNode.insertBefore(linkDiv, profileRows.nextSibling);
        return linkDiv;
    }
    return null;
}

function prepareLink(url) {
    if (linkDiv) {
        const link = linkDiv.querySelectorAll("a");
        const span = linkDiv.querySelectorAll("span");
        if (link && span && link.length > 0 && span.length > 0) {
            link[0].href = url;
            link[0].rel = "noopener noreferrer";
            link[0].target = "_blank";
            span[0].innerText = "Watch on 9anime";
        }
    }
}

// Attach the link div and start searching the link for anime
if (titleSpan.length > 0) {
    const anime = titleSpan[0].innerText;
    // The idea here is, first we try to get the anime from
    // @Akkusativ's endpoint. If its not present in his
    // database we get it from 9anime search.
    chrome.runtime.sendMessage({
        intent: 22, /* Intent.SiteIntegration_GetLink */
        anime,
    }, resp => {
        console.log(resp);
        if (resp.success && resp.data /*&& resp.data.url*/) {
            prepareLink(resp.data);
        } else {
            chrome.runtime.sendMessage({
                baseUrl: "https://9anime.to",
                intent: 19, /* Intent.Search_Anime */
                searchText: anime,
            }, resp => {
                if (resp.success && resp.data && resp.data.html) {
                    prepareLink(getAnimeLink(anime, resp.data.html));
                }
            });
        }
    });
}
