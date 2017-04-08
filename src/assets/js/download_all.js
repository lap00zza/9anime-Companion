/**
 *  MIT License
 *
 *  Copyright (c) 2017 Jewel Mahanta
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */
(function ($) {

    var downloadAll = window.downloadAll = downloadAll || {};

    /**
     * Fetch the grabber information. These are necessary to use the
     * file grabber api.
     *
     * @param episodeId - The episodeId for which we need grabber info.
     * @param update - This is probably used for Seek function. For our case its always 0.
     * @param baseUrl - The current base url. Example: https://9anime.tv, https://9anime.is etc.
     * @returns {Promise}
     */
    downloadAll.getGrabberInfo = function (episodeId, update = 0, baseUrl = "https://9anime.to") {
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
                    // console.log(data);
                    resolve(data);
                })
                .catch(function (response) {
                    console.log(response);
                    reject(response);
                })
        });
    };

    /**
     *  Get the list of downloadable files using the file grabber.
     *
     * @param grabberUrl
     * @param episodeId
     * @param token
     * @param options
     * @param mobile
     * @returns {Promise}
     */
    downloadAll.getFiles = function (grabberUrl, episodeId, token, options, mobile = 0) {
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
                    console.log(data);
                    // The data key contains the files arrays
                    resolve(data["data"]);
                })
                .catch(function (response) {
                    console.log(response);
                    reject(response);
                })
        });
    };

    /**
     * Download all anime!
     *
     * @param {Array} episodes - The list of episode ID's to download. This should always be a array.
     * @param {String} name - (Optional) The name of the anime.
     * @param {String} quality - Possible values => 360p/480p/720p/1080p
     * @param {String} method - Possible values => browser/external
     *                          Whether we will use the chrome downloader or external downloader
     * @param {String} baseUrl - The current base url. Example: https://9anime.tv, https://9anime.is etc.
     */
    downloadAll.downloadFiles = function (episodes, name, quality = "720p", method = "browser", baseUrl = "https://9anime.to") {
        // TODO: do we really need a promise for this?
        // TODO: if we do use promise, maybe add a progress callback?
        return new Promise(function (resolve, reject) {

            var qualityEnums = {
                0: "360p",
                1: "480p",
                2: "720p",
                3: "1080p"
            };

            if (episodes instanceof Array) {
                var totalEpisodes = episodes.length - 1;

                // This function houses the entire download process.
                function processDl() {
                    if (episodes.length === 0) {
                        return true;
                    }

                    var ep = episodes[totalEpisodes]["id"];
                    var ep_number = episodes[totalEpisodes]["number"];

                    console.log(ep, ep_number);

                    /******************************************/
                    // First we get the file grabber info
                    downloadAll
                        .getGrabberInfo(ep)
                        .then(function (data) {

                            console.log(data);
                            var grabberUrl = data["grabber"];
                            var episodeId = data["params"]["id"];
                            var episodeToken = data["params"]["token"];
                            var episodeOptions = data["params"]["options"];

                            /******************************************/
                            // The we get the files
                            downloadAll
                                .getFiles(grabberUrl, episodeId, episodeToken, episodeOptions)
                                .then(function (data) {
                                    console.log(data);

                                    // And then we start the actual download
                                    data.forEach(function (file) {
                                        var fileQuality = file["label"];
                                        var fileUrl = file["file"];
                                        var fileType = file["type"];

                                        if(fileQuality === quality) {
                                            chrome.downloads.download({
                                                url: fileUrl,
                                                filename: `9anime Companion/${name} - E${ep_number}.${fileType}`,
                                                conflictAction: "uniquify"

                                            }, function (downloadId) {
                                                console.log(downloadId);
                                            })
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
                                    console.log(response)
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
                reject("episodes should be an array")
            }
        });
    }

})(jQuery);