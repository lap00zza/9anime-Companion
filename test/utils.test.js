/* global test, expect */
const utils = require("../src/utils")

// [1]: fileSafeString
test("fileSafeString: illegal characters should be removed", () => {
    expect(utils.fileSafeString("nar::to")).toBe("narto")
    expect(utils.fileSafeString("nar\\\/to")).toBe("narto")
    expect(utils.fileSafeString("nar<>?*|'to")).toBe("nar'to")
});

// [2]: pad
test("pad: should be padded if less than 3 digit", () => {
    expect(() => {
        utils.pad("")
    }).toThrowError("num can't be a blank string")
    expect(utils.pad("1")).toBe("001");
    expect(utils.pad("11")).toBe("011");
})

test("pad: should not be padded if 3 or more digit", () => {
    expect(utils.pad("111")).toBe("111");
    expect(utils.pad("1111")).toBe("1111");
})

// [3]: mergeObject
test("mergeObject: should merge given 2 objects", () => {
    let obj1 = {a: 1, b: 2}
    let obj2 = {c: 3, d: 4}
    expect(utils.mergeObject(obj1, obj2)).toEqual({a: 1, b: 2, c: 3, d: 4})
})

// [4]: decomposeURL
test("decomposeURL: should decompose given a proper uri", () => {
    let uri = "https://9anime.to/grabber-api/?server=21";
    expect(utils.decomposeURL(uri)).toEqual(["https://9anime.to/grabber-api/", {server: "21"}])

    let uri1 = "https://9anime.to/grabber-api/?server=21&a=b";
    expect(utils.decomposeURL(uri1)).toEqual(["https://9anime.to/grabber-api/", {server: "21", a: "b"}])
})

test("decomposeURL: should ignore params that are not proper", () => {
    let uri = "https://9anime.to/grabber-api/?server=21&hello";
    expect(utils.decomposeURL(uri)).toEqual(["https://9anime.to/grabber-api/", {server: "21"}])

    let uri1 = "https://9anime.to/grabber-api/?server=21&";
    expect(utils.decomposeURL(uri1)).toEqual(["https://9anime.to/grabber-api/", {server: "21"}])
})

// [5]: getSlug
// test("getSlug: should generate a proper slug", () => {
//     let testData = [{
//         name: "Kono Subarashii Sekai ni Shukufuku wo! 2",
//         slug: "kono-subarashii-sekai-ni-shukufuku-wo-2"
//     }, {
//         name: "Keijo!!!!!!!!",
//         slug: "keijo"
//     }, {
//         name: "A    A    A",
//         slug: "a----a----a"
//     }]
//
//     testData.forEach(el => {
//         expect(utils.getSlug(el.name)).toBe(el.slug)
//     })
// })

// [6]: cleanAnimeName
test("cleanAnimeName: should generate a clean title", () => {
    let testData = [{
        name: "Kono Subarashii (DUB)",
        slug: "Kono Subarashii"
    }, {
        name: "Keijo (SUB)",
        slug: "Keijo"
    }, {
        name: "A (TV)(SUB)(DUB)",
        slug: "A (TV)"
    }]

    testData.forEach(el => {
        expect(utils.cleanAnimeName(el.name)).toBe(el.slug)
    })
})
