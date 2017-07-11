/**
 * Copyright 2017 Jewel Mahanta(@lap00zza)
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list
 *    of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this
 *    list of conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may
 *    be used to endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE.
 */
/*global chrome*/

import $ from "../lib/jquery-3.2.0.min";

/**
 * Just as the function name says!
 * We replace the illegal characters with underscore (_)
 *
 * @param filename
 * @returns {void|XML|string|*}
 */
function generateFileSafeString(filename) {
    var re = /[\\\/<>*?:"|]/gi;
    return filename.replace(re, "_");
}

// --- Token generation scheme for 9anime ---
const DD = "gIXCaNh";

function s(t) {
    var e, i = 0;
    for (e = 0; e < t.length; e++) {
        i += t.charCodeAt(e) * e + e;
    }
    return i;
}

function a(t, e) {
    var i, n = 0;
    for (i = 0; i < Math.max(t.length, e.length); i++) {
        n += i < e.length ? e.charCodeAt(i) : 0;
        n += i < t.length ? t.charCodeAt(i) : 0;
    }
    return Number(n).toString(16);
}

function generate_token(data, initial_state = 0) {
    // console.log("INIT STATE: ", initial_state);

    var keys = Object.keys(data);
    var _ = s(DD) + initial_state;
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var trans = a(DD + key, data[key].toString());
        // console.log(trans);
        _ += s(trans);
    }
    return _;
}
// --- End Token Generation

/**
 * Fetch the grabber information. These are necessary to use the
 * file grabber api.
 *
 * @param episodeId - The episodeId for which we need grabber info.
 * @param update - This is probably used for Seek function. For our case its always 0.
 * @param baseUrl - The current base url. Example: https://9anime.tv, https://9anime.is etc.
 * @returns {Promise}
 */
function getGrabberInfo(ts, episodeId, baseUrl = "https://9anime.to", update = 0) {
    return new Promise(function (resolve, reject) {
        var data = {
            ts: ts,
            id: episodeId,
            update: update
        };
        data["_"] = generate_token(data);

        var requestDetails = {
            url: baseUrl + "/ajax/episode/info",
            data: data,
            dataType: "json",
            method: "GET"
        };
        $
            .ajax(requestDetails)
            .then(function (data) {
                resolve(data);
            })
            .catch(function (response) {
                console.error(response);
                reject(response);
            });
    });
}

/**
 * Get the list of downloadable files using the file grabber.
 *
 * @param grabberUrl
 * @param episodeId
 * @param token
 * @param options
 * @param mobile
 * @returns {Promise}
 */
function getFiles(ts, grabberUrl, episodeId, token, options, mobile = 0) {
    return new Promise(function (resolve, reject) {

        var data = {
            ts: ts,
            id: episodeId,
            token: token,
            options: options,
            mobile: mobile
        };

        // Add any extra queries to the data and then
        // calculate the token.
        var re = /([^=\?&]+)(?:=([^&$]+))?/gi;
        
        // The first match is the grabber URL
        // All the proceeding matches are the query params.
        var query_params = grabberUrl.match(re);
        
        var init_state = s(a(DD + query_params[0], ""));
        
        for (var i = 1; i < query_params.length; i++) {
            var query = query_params[i].split("=");
            data[query[0]] = query[1];
        }

        data["_"] = generate_token(data, init_state);
        // console.log(data);

        var requestDetails = {
            url: query_params[0],
            data: data,
            dataType: "json",
            method: "GET"
        };
        $
            .ajax(requestDetails)
            .then(function (data) {
                // The data key contains the files arrays
                resolve(data["data"]);
            })
            .catch(function (response) {
                console.error(response);
                reject(response);
            });
    });
}

/**
 * Download all anime!
 *
 * @param {Array} episodes - The list of episode ID's to download. This should always be a array.
 * @param {String} name - The name of the anime.
 * @param {String} quality - Possible values => 360p/480p/720p/1080p
 * @param {String} baseUrl - The current base url. Example: https://9anime.tv, https://9anime.is etc.
 * @param {String} method - Possible values => browser/external
 *                          Whether we will use the chrome downloader or external downloader
 * @param {Number} requestInterval - The interval after which requests are sent to fetch file links.
 *                                   This value should ideally be kept between 2000 to 5000
 */
function downloadFiles(ts, episodes, name, quality = "360p", baseUrl = "https://9anime.to", method = "browser", requestInterval = 5000) {
    // TODO: add a quality fallback
    // TODO: what happens when the api returns different keys?

    return new Promise(function (resolve, reject) {
        if (episodes instanceof Array) {
            var episodeLinks = [];

            // This function houses the entire download process.
            function processDl() {
                if (episodes.length === 0) {
                    if (method === "browser") {
                        resolve("All downloads are over");
                        return true;
                    } else {
                        resolve(episodeLinks);
                        return true;
                    }
                }

                var currentEp = episodes.shift();
                var epId = currentEp["id"];
                var epNumber = currentEp["number"];

                // First we get the file grabber info
                getGrabberInfo(ts, epId, baseUrl)
                    .then(function (data) {
                        var grabberUrl = data["grabber"];
                        var episodeId = data["params"]["id"];
                        var episodeToken = data["params"]["token"];
                        var episodeOptions = data["params"]["options"];

                        // The we get the files
                        getFiles(ts, grabberUrl, episodeId, episodeToken, episodeOptions)
                            .then(function (data) {
                                // And then we start the actual download
                                data.forEach(function (file) {
                                    var fileQuality = file["label"];
                                    var fileUrl = file["file"];
                                    var fileType = file["type"];

                                    if (fileQuality === quality) {
                                        if (method === "browser") {
                                            chrome.downloads.download({
                                                url: fileUrl,
                                                // Example file name: "Shingeki No Kyojen - E5 (1080p).mp4"
                                                // Remember: Files are stored in the 9anime Companion sub-folder
                                                // within your main downloads folder.
                                                filename: `9anime Companion/${generateFileSafeString(name)}` +
                                                ` - E${epNumber} (${quality}).${fileType}`,
                                                conflictAction: "uniquify"

                                            });

                                        } else {
                                            // We want to make sure that title is properly encoded for the URL
                                            var downloadTitle = encodeURIComponent(
                                                `${generateFileSafeString(name)}` + ` - E${epNumber} (${quality})`
                                            );
                                            var downloadUrl = fileUrl + "&title=" + downloadTitle;
                                            episodeLinks.push(downloadUrl);
                                        }
                                    }
                                });

                                // Restart entire process after the specified
                                // request interval. This defaults to 5 seconds.
                                setTimeout(processDl, requestInterval);

                            })
                            .catch(function (response) {
                                console.error(response);
                                reject(response);
                            });

                    })
                    .catch(function (response) {
                        console.error(response);
                        reject(response);
                    });
            }

            // start the download process
            processDl();

        } else {
            reject("episodes should be an array");
        }
    });

}

export {
    generateFileSafeString, getGrabberInfo, getFiles, downloadFiles
};
