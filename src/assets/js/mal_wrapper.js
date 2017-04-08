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
// This library is responsible for interfacing with myAnimeList.
// MAL API Docs: https://myanimelist.net/modules.php?go=api
(function ($) {

    // expose it to window
    var mal = window.mal = window.mal || {};

    // get a reference to our awesome utils library ;)
    var animeUtils = window.animeUtils;

    // Instantiate X2JS
    var x2js = new window.X2JS({
        arrayAccessFormPaths : [
            "anime.entry"
        ]
    });

    // username and password are stored in the local-storage.
    // what that means is its exposed to pretty much anything.
    var username = null;
    var password = null;

    chrome.storage.local.get(["malUsername", "malPassword"], function (credentials) {
        console.log(credentials);
        username = credentials["malUsername"];
        password = credentials["malPassword"]
    });


    var MAL_STATUS_ENUMS = {
        "watching": 1,
        "completed": 2,
        "onhold": 3,
        "dropped": 4,
        "plantowatch": 6
    };

    /******************************************************************************************************************/
    // mal.generateAnimeValues = function (episode, score, status) {
    //     // var parser = new DOMParser();
    //     var animeValues =
    //         `<?xml version="1.0" encoding="UTF-8"?>
    //         <entry>
    //             <episode>${episode || ''}</episode>
    //             <status>${status || ''}</status>
    //             <score>${score || ''}</score>
    //             <storage_type></storage_type>
    //             <storage_value></storage_value>
    //             <times_rewatched></times_rewatched>
    //             <rewatch_value></rewatch_value>
    //             <date_start></date_start>
    //             <date_finish></date_finish>
    //             <priority></priority>
    //             <enable_discussion></enable_discussion>
    //             <enable_rewatching></enable_rewatching>
    //             <comments></comments>
    //             <tags></tags>
    //         </entry>`;
    //
    //     return animeValues;
    //     // return parser.parseFromString(animeValues, "text/xml");
    // };


    /******************************************************************************************************************/
    /**
     *
     * @returns {string}
     */
    mal.removeCredentials = function () {
        chrome.storage.local.remove(["malUsername", "malPassword"]);
        username = null;
        password = null;
    };

    /******************************************************************************************************************/
    /**
     * Verify the username and password and set it.
     *
     * @returns {Promise}
     */
    mal.verifyAndSetCredentials = function (usr, pwd) {
        return new Promise(function (resolve, reject) {

            if (usr && pwd) {
                var requestDetails = {
                    url: encodeURI("https://myanimelist.net/api/account/verify_credentials.xml"),
                    dataType: "xml",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Basic " + btoa(usr + ":" + pwd));
                    }
                };
                $.ajax(requestDetails)
                    .then(function (data, textStatus, response) {

                        // Save the credentials
                        chrome.storage.local.set({
                            malUsername: usr,
                            malPassword: pwd
                        });

                        // set it
                        username = usr;
                        password = pwd;

                        resolve(x2js.xml2json(data));
                    })
                    .catch(function (response) {
                        reject(response);
                    })
            } else {
                reject("Both Username and Password are required.")
            }
        });
    };

    /******************************************************************************************************************/
    /**
     * Get users current list from MAL
     * 
     * TODO: this should implement some sort of caching.
     * @returns {Promise}
     */
    mal.getUserList = function () {
        return new Promise(function (resolve, reject) {
            if (username && password) {
                var requestDetails = {
                    url: encodeURI("https://myanimelist.net/malappinfo.php?u=" + username + "&status=all&type=anime"),
                    dataType: "xml",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                    }
                };
                $.ajax(requestDetails)
                    .then(function (data, textStatus, response) {
                        resolve(x2js.xml2json(data));
                    })
                    .catch(function (reason) {
                        reject(reason);
                    });
            } else {
                reject("Not Verified");
            }
        });
    };

    /******************************************************************************************************************/
    /**
     * Search for an anime on MAL
     * 
     * @param animeName
     * @returns {Promise}
     */
    mal.searchAnime = function (animeName) {
        return new Promise(function (resolve, reject) {
            if (username && password) {

                /*************************/
                if (animeName) {
                    var cleanedName = animeName.replace(/\(DUB\)|\(SUB\)|\(TV\)/gi, "").trim();
                    var requestDetails = {
                        url: encodeURI("https://myanimelist.net/api/anime/search.xml?q=" + cleanedName),
                        dataType: "xml",
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                        }
                    };

                    // Send the AJAX request
                    $
                        .ajax(requestDetails)
                        .then(function (data, textStatus, response) {
                            // If MAL return status code 200 then its guaranteed to have
                            // items. In case no anime's are matched, it returns status code
                            // 204.
                            // TODO: implement some sort of caching. There is no need to resend request for same anime.
                            if (response.status === 200) {
                                try {
                                    // I am going to use X2JS instead of writing my
                                    // own XML to JSON converter.
                                    var jsonResp = x2js.xml2json(data);
                                    if (jsonResp["anime"]["entry"] && jsonResp["anime"]["entry"].length > 0) {
                                        resolve(jsonResp["anime"]["entry"]);
                                    } else {
                                        reject("error during xml to json conversion");
                                    }

                                } catch (e) {
                                    reject(e);
                                }
                            } else {
                                // TODO: maybe add a better reject message?
                                reject(response);
                            }

                        })
                        .catch(function (response) {
                            reject(response);
                        })
                } else {
                    reject("animeName is missing");
                }
                /*************************/

            } else {
                reject("Not Verified");
            }
        });
    };

    /******************************************************************************************************************/
    /**
     * Add anime to users MAL
     * 
     * @param animeId
     * @returns {Promise}
     */
    mal.addAnime = function (animeId) {
        return new Promise(function (resolve, reject) {
            if (username && password) {

                /*************************/
                if (!animeId) {
                    reject("Parameter animeId is both required.")
                } else {
                    var requestDetails = {
                        url: encodeURI("https://myanimelist.net/api/animelist/add/" + animeId + ".xml"),
                        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                        data: {
                            data: `<?xml version="1.0" encoding="UTF-8"?><entry>` +
                            `<status>${MAL_STATUS_ENUMS.watching}</status></entry>`
                        },
                        method: "POST",
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                        }
                    };

                    $
                        .ajax(requestDetails)
                        .then(function (data, textStatus, response) {
                            // console.log(response);
                            resolve("success");
                        })
                        .catch(function (reason) {
                            console.log(reason);
                            reject("error");
                        });
                    // console.log(requestDetails);
                }
                /*************************/

            } else {
                reject("Not Verified");
            }
        });
    };

    /******************************************************************************************************************/
    /**
     * Update users MAL
     * 
     * NOTE:
     * Ok so updated returns success if the animeId
     * is not present in users MAL. So we will have
     * to check the synced list every time before
     * updating.
     *
     * @param animeId
     * @param episode
     * @returns {Promise}
     */
    mal.updateAnime = function (animeId, episode) {
        return new Promise(function (resolve, reject) {
            if (username && password) {

                /*************************/
                if (animeId && episode) {
                    var requestDetails = {
                        url: encodeURI("https://myanimelist.net/api/animelist/update/" + animeId + ".xml"),
                        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                        data: {
                            data: `<?xml version="1.0" encoding="UTF-8"?><entry><episode>${episode}</episode></entry>`
                        },
                        method: "POST",
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                        }
                    };

                    $
                        .ajax(requestDetails)
                        .then(function (data, textStatus, response) {
                            // console.log(response);
                            resolve("success");
                        })
                        .catch(function (reason) {
                            console.log(reason);
                            reject("error");
                        });
                    // console.log(requestDetails);
                } else {
                    reject("Parameters animeId and episode are both required.");
                }
                /*************************/

            } else {
                reject("Not Verified");
            }
        });
    }

})(jQuery);