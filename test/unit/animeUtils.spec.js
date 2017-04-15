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

import * as animeUtils from "../../src/assets/js/animeUtils";

/*global spyOn, describe, beforeEach, inject, module, expect, it, sinon*/
describe("Tests for animeUtils", function () {
    
    // The casing is a bit weird to make sure we can test
    // case in-sensitive regex.
    var testUrl = "https://9Anime.IS/watch/ao-haru-ride.qk5n/vpz64";

    // ***
    describe("extractIdFromUrl, using: " + testUrl, function () {

        it("should return animeId: qk5n", function () {
            var extracted = animeUtils.extractIdFromUrl(testUrl);
            expect(extracted.animeId).toBe("qk5n");
        });

        it("should return episodeId: vpz64", function () {
            var extracted = animeUtils.extractIdFromUrl(testUrl);
            expect(extracted.episodeId).toBe("vpz64");
        });

        it("should return animeUrl: https://9anime.is/watch/ao-haru-ride.qk5n", function () {
            var extracted = animeUtils.extractIdFromUrl(testUrl);
            expect(extracted.animeUrl).toBe("https://9Anime.IS/watch/ao-haru-ride.qk5n");
        });
    });

    // ***
    describe("isUrl", function () {
        it("should return false when url is: javascript:alert(1)", function () {
            var result = animeUtils.isUrl("javascript:alert(1)");
            expect(result).not.toBe(true);
        });

        it("should return false when url is: shpp://#$%%*12121210....90qwqw", function () {
            var result = animeUtils.isUrl("javascript:alert(1)");
            expect(result).not.toBe(true);
        });

        it("should return true when url is: " + testUrl, function () {
            var result = animeUtils.isUrl(testUrl);
            expect(result).toBe(true);
        });
    });

    // ***
    describe("checkIfEntryExists, using: " + testUrl, function () {
        var testArray = [
            {url: testUrl},
            {url: "xx1#451213"},
            {url: "http://9anime.tv/watch/vpz64"}
        ];

        var testArray1 = [
            {url: "xx1#451213"},
            {url: "http://9anime.tv/watch/vpz64"}
        ];

        it("should return true when list contains URL", function () {
            var result = animeUtils.checkIfEntryExists(testArray, testUrl);
            expect(result).toBe(true);
        });

        it("should return false when list does not contain URL", function () {
            var result = animeUtils.checkIfEntryExists(testArray1, testUrl);
            expect(result).not.toBe(true);
        });
    });

    // ***
    describe("addToPinnedList", function () {
        it("should add anime: test with url: https://test.com", function (done) {
            spyOn(chrome.storage.local, "get").and.callFake(function (init, callback) {
                return callback(init);
            });
            spyOn(chrome.storage.local, "set").and.returnValue(true);
            
            animeUtils
                .addToPinnedList("test", "https://test.com")
                .then(function (result) {
                    expect(result).toBe("success");
                    done();
                });
        });
    });

    // ***
    describe("removeFromPinnedList", function () {
        it("should not remove anything if list is empty", function (done) {
            spyOn(chrome.storage.local, "get").and.callFake(function (init, callback) {
                return callback(init);
            });

            animeUtils
                .removeFromPinnedList("https://test.com")
                .catch(function (reason) {
                    expect(reason).toBe("does not exist");
                    done();
                });
        });
    });

    // ***
    describe("loadSettings", function () {
        it("should reject if parameter 'key' is not an array", function (done) {
            animeUtils
                .loadSettings("1234141")
                .catch(function (reason) {
                    expect(reason).toBe("key not an array");
                    done();
                });


            animeUtils
                .loadSettings("1234141")
                .catch(function (reason) {
                    expect(reason).toBe("key not an array");
                    done();
                });


            animeUtils
                .loadSettings(123)
                .catch(function (reason) {
                    expect(reason).toBe("key not an array");
                    done();
                });
        })
    })

});
