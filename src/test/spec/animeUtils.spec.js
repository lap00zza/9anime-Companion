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

/*global describe, beforeEach, inject, module, expect, it, sinon*/
describe("Tests for animeUtils", function () {

    // TODO: maybe we are better off using chrome-sinon
    // and running it with karma instead of doing it manually
    // on the browser. That way we can run the tests during
    // the travis build. And since end users don't really care
    // about tests we can remove it from "dist" altogether. I
    // wonder what future me will think of this :/

    var testUrl = "https://9anime.is/watch/ao-haru-ride.qk5n/vpz64";

    // ***
    describe("extractIdFromUrl, using: " + testUrl, function () {

        it("should return animeId: qk5n", function () {
            var extracted = window.animeUtils.extractIdFromUrl(testUrl);
            expect(extracted.animeId).toBe("qk5n");
        });

        it("should return episodeId: vpz64", function () {
            var extracted = window.animeUtils.extractIdFromUrl(testUrl);
            expect(extracted.episodeId).toBe("vpz64");
        });

        it("should return animeUrl: https://9anime.is/watch/ao-haru-ride.qk5n", function () {
            var extracted = window.animeUtils.extractIdFromUrl(testUrl);
            expect(extracted.animeUrl).toBe("https://9anime.is/watch/ao-haru-ride.qk5n");
        });
    });

    // ***
    describe("isUrl", function () {
        it("should return false when url is: javascript:alert(1)", function () {
            var result = window.animeUtils.helper.isUrl("javascript:alert(1)");
            expect(result).not.toBe(true);
        });

        it("should return false when url is: shpp://#$%%*12121210....90qwqw", function () {
            var result = window.animeUtils.helper.isUrl("javascript:alert(1)");
            expect(result).not.toBe(true);
        });

        it("should return true when url is: " + testUrl, function () {
            var result = window.animeUtils.helper.isUrl(testUrl);
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
            var result = window.animeUtils.checkIfEntryExists(testArray, testUrl);
            expect(result).toBe(true);
        });

        it("should return false when list does not contain URL", function () {
            var result = window.animeUtils.checkIfEntryExists(testArray1, testUrl);
            expect(result).not.toBe(true);
        });
    });

    // ***
    describe("addToPinnedList", function () {
        it("should add anime: test with url: https://test.com", function (done) {
            window
                .animeUtils
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
            window
                .animeUtils
                .removeFromPinnedList("test", "https://test.com")
                .catch(function (reason) {
                    console.log(reason);
                    expect(reason).toBe("does not exist");
                    done();
                });
        });
    });

});
