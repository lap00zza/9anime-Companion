/**
 * Created by Jewel Mahanta (@lap00zza) on 12-04-2017.
 */
/*global spyOn, describe, expect, it, beforeEach, afterEach*/
import "jasmine-ajax";
import * as downloadAll from "../../src/assets/js/download_all";

// TODO Maybe add tests for downloadFiles method too?
describe("Tests for download_all", function () {
    var grabberUrl = "https://example.com/grabber-api";

    // ***
    describe("generateFileSafeString", function () {
        it("should return nar__to when input string is nar::to", function () {
            var result = downloadAll.generateFileSafeString("nar::to");
            expect(result).toBe("nar__to");
        });

        it("should return nar__to when input string is nar\\\/to", function () {
            var result = downloadAll.generateFileSafeString("nar\\\/to");
            expect(result).toBe("nar__to");
        });

        it(`should return nar__to when input string is nar<>?*|"to`, function () {
            var result = downloadAll.generateFileSafeString(`nar<>?*|"to`);
            expect(result).toBe("nar______to");
        });
    });

    // ***
    describe("getGrabberInfo", function () {
        var request;

        beforeEach(function () {
            jasmine.Ajax.install();
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });

        /**************************************************************************************************************/
        it("should resolve when request succeeds", function (done) {
            downloadAll
                .getGrabberInfo("1")
                .then(function (data) {
                    expect(data.grabber).toBeDefined();
                    expect(data.params.id).toBeDefined();
                    expect(data.params.token).toBeDefined();
                    expect(data.params.options).toBeDefined();
                    done();
                });

            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 200,
                responseText: JSON.stringify({
                    grabber: grabberUrl,
                    params: {
                        id: "1",
                        token: "2",
                        options: "3"
                    }
                })
            });

            expect(request.url).toBe("https://9anime.to/ajax/episode/info?id=1&update=0");
        });

        /**************************************************************************************************************/
        it("should reject when the request fails", function (done) {
            downloadAll
                .getGrabberInfo("1")
                .catch(function (response) {
                    expect(response.status).toBe(404);
                    done();
                });

            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 404
            });

            expect(request.url).toBe("https://9anime.to/ajax/episode/info?id=1&update=0");
        });

    });

    // ***
    describe("getFiles", function () {
        var request;

        beforeEach(function () {
            jasmine.Ajax.install();
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });

        /**************************************************************************************************************/
        it("should resolve when request succeeds", function (done) {
            downloadAll
                .getFiles(grabberUrl, "1", "2", "3")
                .then(function (data) {
                    expect(data).toEqual(jasmine.any(Array));
                    done();
                });

            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 200,
                responseText: JSON.stringify({
                    data: [],
                    error: "...",
                    token: "..."
                })
            });

            expect(request.url).toBe(grabberUrl + "?id=1&token=2&options=3&mobile=0");
        });

        /**************************************************************************************************************/
        it("should reject when the request fails", function (done) {
            downloadAll
                .getFiles(grabberUrl, "1", "2", "3")
                .catch(function (response) {
                    expect(response.status).toBe(404);
                    done();
                });

            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 404
            });

            expect(request.url).toBe(grabberUrl + "?id=1&token=2&options=3&mobile=0");
        });
    });
});
