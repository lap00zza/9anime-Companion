/**
 * Created by Jewel Mahanta (@lap00zza) on 26-03-2017.
 */
/*global describe, beforeEach, inject, module, expect, it, sinon*/
describe("Tests for animeUtils", function () {

    var testUrl = "https://9anime.is/watch/ao-haru-ride.qk5n/vpz64";

    describe("extractIdFromUrl, using: " + testUrl, function () {

        it("should return animeId qk5n", function () {
            var extracted = window.animeUtils.extractIdFromUrl(testUrl);
            expect(extracted.animeId).toBe("qk5n");
        });

        it("should return episodeId vpz64", function () {
            var extracted = window.animeUtils.extractIdFromUrl(testUrl);
            expect(extracted.episodeId).toBe("vpz64");
        });
    });

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
    
});
