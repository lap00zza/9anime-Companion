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
// NOTES:
// 1. JQUERY is only used for the AJAX function. So, it is 100% possible to convert this
//    to a pure javascript based library.
// 2. The downloads start at 5 seconds interval. Please don't try to decrease this. If you
//    do, your IP might get flagged for spamming.

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

/**
 * Fetch the grabber information. These are necessary to use the
 * file grabber api.
 *
 * @param episodeId - The episodeId for which we need grabber info.
 * @param update - This is probably used for Seek function. For our case its always 0.
 * @param baseUrl - The current base url. Example: https://9anime.tv, https://9anime.is etc.
 * @returns {Promise}
 */
function getGrabberInfo(episodeId, baseUrl = "https://9anime.to", update = 0) {
    return new Promise(function (resolve, reject) {
        var requestDetails = {
            url: baseUrl + "/ajax/episode/info",
            data: {
                id: episodeId,
                update: update
            },
            dataType: "json",
            method: "GET"
        };
        $
            .ajax(requestDetails)
            .then(function (data, textStatus, response) {
                // console.log(response);
                resolve(data);
            })
            .catch(function (response) {
                console.log(response);
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
function getFiles(grabberUrl, episodeId, token, options, mobile = 0) {
    return new Promise(function (resolve, reject) {
        var requestDetails = {
            url: grabberUrl,
            data: {
                id: episodeId,
                token: token,
                options: options,
                mobile: mobile
            },
            dataType: "json",
            method: "GET"
        };
        $
            .ajax(requestDetails)
            .then(function (data, textStatus, response) {
                // console.log(data);
                // The data key contains the files arrays
                resolve(data["data"]);
            })
            .catch(function (response) {
                console.log(response);
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
 */
function downloadFiles(episodes, name, quality = "360p", baseUrl = "https://9anime.to", method = "browser") {
    // TODO: add a quality fallback

    // var qualityEnums = {
    //     0: "360p",
    //     1: "480p",
    //     2: "720p",
    //     3: "1080p"
    // };

    if (episodes instanceof Array) {
        // Why exactly are we reversing the array?
        // Well the rationale behind it is simple, if we reverse it
        // we can start downloading the episodes in increasing order
        // of episodes. But why? because we take the last item of the
        // episodes array and once we are done triggering the download
        // we pop it. "Pop"-ing is simpler then slicing but sadly only
        // works on the last element. Cheers!
        episodes.reverse();

        // Why? because the array starts at the 0th element
        var totalEpisodes = episodes.length - 1;

        // This function houses the entire download process.
        function processDl() {
            if (episodes.length === 0) {
                // console.log("No more items left to download!");
                return true;
            }

            // Select the last element of the array
            var ep = episodes[totalEpisodes]["id"];
            var ep_number = episodes[totalEpisodes]["number"];

            // console.log(ep, ep_number);

            /******************************************/
            // First we get the file grabber info
            getGrabberInfo(ep, baseUrl)
                .then(function (data) {

                    // console.log(data);
                    var grabberUrl = data["grabber"];
                    var episodeId = data["params"]["id"];
                    var episodeToken = data["params"]["token"];
                    var episodeOptions = data["params"]["options"];

                    /******************************************/
                    // The we get the files
                    getFiles(grabberUrl, episodeId, episodeToken, episodeOptions)
                        .then(function (data) {
                            // console.log(data);

                            // And then we start the actual download
                            data.forEach(function (file) {
                                var fileQuality = file["label"];
                                var fileUrl = file["file"];
                                var fileType = file["type"];

                                if (fileQuality === quality) {
                                    chrome.downloads.download({
                                        url: fileUrl,
                                        // Example file name: "Shingeki No Kyojen - E5 (1080p).mp4"
                                        // Remember: Files are stored in the 9anime Companion sub-folder
                                        // within your main downloads folder.
                                        filename: `9anime Companion/${generateFileSafeString(name)}` +
                                        ` - E${ep_number} (${quality}).${fileType}`,
                                        conflictAction: "uniquify"

                                    }
                                    // , function (downloadId) {
                                    //     console.log(downloadId);
                                    // }
                                    );
                                }
                            });

                            episodes.pop();
                            totalEpisodes--;

                            // For now we are setting a 5 second timeout
                            // because we don't know for sure what is the
                            // exact interval after which we will be flagged
                            // for spamming.
                            setTimeout(processDl, 5000);

                        })
                        .catch(function (response) {
                            console.log(response);
                        });
                    /******************************************/

                })
                .catch(function (response) {
                    console.log(response);
                });
            /******************************************/
        }

        // start the download process
        processDl();

    } else {
        throw new Error("Download Error: episodes should be an array");
    }
}

export {
    generateFileSafeString, getGrabberInfo, getFiles, downloadFiles
};
