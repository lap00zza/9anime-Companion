/**
 * Created by Jewel Mahanta (@lap00zza) on 12-04-2017.
 */
/*global spyOn, describe, beforeEach, inject, module, expect, it, sinon*/
/*eslint no-undef: "error"*/
describe("Tests for download_all", function () {

    // ***
    describe("generateFileSafeString", function () {

        /************************************************************************/
        it("should return nar__to when input string is nar::to", function () {
            var result = window.downloadAll.generateFileSafeString("nar::to");
            expect(result).toBe("nar__to");
        });


        /************************************************************************/
        it("should return nar__to when input string is nar\\\/to", function () {
            var result = window.downloadAll.generateFileSafeString("nar\\\/to");
            expect(result).toBe("nar__to");
        });


        /************************************************************************/
        it('should return nar__to when input string is nar<>?*|"to', function () {
            var result = window.downloadAll.generateFileSafeString('nar<>?*|"to');
            expect(result).toBe("nar______to");
        });
    });

    // ***
    describe("getGrabberInfo", function () {

        /************************************************************************/
        it("should resolve with data when the request succeeds", function (done) {
            spyOn(window.jQuery, "ajax").and.callFake(function (requestObj) {
                return new Promise(function (resolve, reject) {
                    resolve({foo: "bar"});
                });
            });

            window
                .downloadAll
                .getGrabberInfo("1")
                .then(function (data) {
                    expect(data.foo).toBe("bar");
                    done();
                });
        });


        /************************************************************************/
        it("should reject with response when the request fails", function (done) {
            spyOn(window.jQuery, "ajax").and.callFake(function (requestObj) {
                return new Promise(function (resolve, reject) {
                    reject({foo: "bar"});
                });
            });

            window
                .downloadAll
                .getGrabberInfo("1")
                .catch(function (response) {
                    expect(response.foo).toBe("bar");
                    done();
                });
        });
    });

    // ***
    describe("getFiles", function () {

        /************************************************************************/
        it("should resolve with data when the request succeeds", function (done) {
            spyOn(window.jQuery, "ajax").and.callFake(function (requestObj) {
                return new Promise(function (resolve, reject) {
                    resolve({data: "bar"});
                });
            });

            window
                .downloadAll
                .getFiles("abc", "1", "123", "xyz")
                .then(function (data) {
                    expect(data).toBe("bar");
                    done();
                });
        });


        /************************************************************************/
        it("should reject with response when the request fails", function (done) {
            spyOn(window.jQuery, "ajax").and.callFake(function (requestObj) {
                return new Promise(function (resolve, reject) {
                    reject({foo: "bar"});
                });
            });

            window
                .downloadAll
                .getFiles("abc", "1", "123", "xyz")
                .catch(function (response) {
                    expect(response.foo).toBe("bar");
                    done();
                });
        });
    });

    // ***
    describe("downloadFiles", function () {

        /************************************************************************/
        it("should not start downloading if episodes is not an array", function () {

            // We need to wrap it in an anonymous function so that the
            // error does not get passed to expect. We want it to throw.
            expect(function () {
                window.downloadAll.downloadFiles("1,2", "1");
            })
                .toThrow(new Error("Download Error: episodes should be an array"));
        });


        /************************************************************************/
        it("should start downloading if episodes is an array with length greater than zero", function (done) {
            spyOn(chrome.downloads, "download");

            spyOn(window.downloadAll, "getGrabberInfo").and.callFake(function () {
                return new Promise(function (resolve, reject) {
                    resolve({
                        grabber: "xyz",
                        params: {
                            id: "123",
                            token: "abc",
                            options: "@#$"
                        }
                    });
                });
            });

            spyOn(window.downloadAll, "getFiles").and.callFake(function () {
                return new Promise(function (resolve, reject) {
                    resolve([
                        {label: "360p", file: "someFile", type: "someType"}
                    ]);
                });
            });

            window.downloadAll.downloadFiles([
                {id: "12", number: "12"},
                {id: "13", number: "12"}
            ], "xyz");

            // Why setTimeout? because it was proving difficult to
            // track this async function call.
            // TODO: probably think of a better way to test this?
            setTimeout(function () {
                expect(chrome.downloads.download).toHaveBeenCalled();
                done();
            }, 1000);

        });


        /************************************************************************/
        it("should not download if episodes is an array with length zero", function () {
            console.log = jasmine.createSpy("log");
            window.downloadAll.downloadFiles([]);
            expect(console.log).toHaveBeenCalledWith("No more items left to download!");
        });

    });
});
