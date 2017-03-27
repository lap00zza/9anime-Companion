/**
 * Created by Jewel Mahanta (@lap00zza) on 26-03-2017.
 */
/*global describe, beforeEach, inject, module, expect, it, sinon*/
describe("Events Page Tests", function () {

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
    
});
