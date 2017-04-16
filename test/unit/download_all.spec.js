/**
 * Created by Jewel Mahanta (@lap00zza) on 12-04-2017.
 */
/*global spyOn, describe, beforeEach, afterEach, inject, module, expect, it, sinon*/
/*eslint no-undef: "error"*/
import "jasmine-ajax";
import * as downloadAll from "../../src/assets/js/download_all";

// TODO Maybe add tests for downloadFiles method too?
describe("Tests for download_all", function () {
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
        
        it('should return nar__to when input string is nar<>?*|"to', function () {
            var result = downloadAll.generateFileSafeString('nar<>?*|"to');
            expect(result).toBe("nar______to");
        });
    });

    // ***
    describe("getGrabberInfo", function () {
        var request;
        var onSuccess, onFailure;

        beforeEach(function () {
            jasmine.Ajax.install();
            onSuccess = jasmine.createSpy("onSuccess");
            onFailure = jasmine.createSpy("onFailure");

            downloadAll
                .getGrabberInfo("1")
                .then(function () {
                    onSuccess("success");
                })
                .catch(function () {
                    onFailure("fail");
                });
            request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe("https://9anime.to/ajax/episode/info?id=1&update=0");
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });

        describe("on success", function () {
            beforeEach(function () {
                request.respondWith({
                    status: 200
                });
            });

            it("should resolve with data when the request succeeds", function () {
                setTimeout(function () {
                    console.log(onSuccess.calls);
                    expect(onSuccess).toHaveBeenCalled();
                    // var successArgs = onSuccess.calls.mostRecent().args;
                    // console.log(successArgs);
                }, 1000);
            });

        });

        describe("on failure", function () {
            beforeEach(function () {
                request.respondWith({
                    status: 404
                });
            });

            it("should reject with response when the request fails", function () {
                setTimeout(function () {
                    console.log(onFailure.calls);
                    expect(onFailure).toHaveBeenCalled();
                    // var failureArgs = onFailure.calls.mostRecent().args;
                    // console.log(failureArgs);
                }, 1000);
            });

        });
    });

    // ***
    describe("getFiles", function () {
        var request;
        var onSuccess, onFailure;

        beforeEach(function () {
            jasmine.Ajax.install();
            onSuccess = jasmine.createSpy("onSuccess");
            onFailure = jasmine.createSpy("onFailure");

            downloadAll
                .getFiles("https://abc.xyz/", "1", "123", "xyz")
                .then(function () {
                    onSuccess();
                })
                .catch(function () {
                    onFailure();
                });
            request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe("https://abc.xyz/?id=1&token=123&options=xyz&mobile=0");
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });

        describe("on success", function () {
            beforeEach(function () {
                request.respondWith({
                    status: 200
                });
            });

            it("should resolve with data when the request succeeds", function () {
                setTimeout(function () {
                    console.log(onSuccess.calls);
                    expect(onSuccess).toHaveBeenCalled();
                    // var successArgs = onSuccess.calls.mostRecent().args;
                    // console.log(successArgs);
                }, 1000);
            });

        });

        describe("on failure", function () {
            beforeEach(function () {
                request.respondWith({
                    status: 404
                });
            });

            it("should reject with response when the request fails", function () {
                setTimeout(function () {
                    console.log(onFailure.calls);
                    expect(onFailure).toHaveBeenCalled();
                    // var failureArgs = onFailure.calls.mostRecent().args;
                    // console.log(failureArgs);
                }, 1000);
            });

        });
    });
});
