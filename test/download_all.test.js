/* global test, expect */
const autoFallback = require("../src/download_all").autoFallback
const Quality = require("../src/common").DownloadQuality


// autoFallback
test("fallback if there a lower quality", () => {
    let mockData1 = [
        {label: "360p", file: "1", type: "mp4"},
        {label: "480p", file: "2", type: "mp4"}
    ]
    // expected is the 360p file
    expect(autoFallback(Quality["720p"], mockData1)).toBe(mockData1[1])

    let mockData2 = [
        {label: "360p", file: "1", type: "mp4"},
        {label: "480p", file: "2", type: "mp4"},
        {label: "1080p", file: "3", type: "mp4"}
    ]
    // expected is the 480p file
    expect(autoFallback(Quality["720p"], mockData2)).toBe(mockData2[1])

    let mockData3 = [
        {label: "360p", file: "1", type: "mp4"},
        {label: "480p", file: "2", type: "mp4"},
        {label: "720p", file: "3", type: "mp4"},
        {label: "1080p", file: "4", type: "mp4"}
    ]
    // expected is the 720p file
    expect(autoFallback(Quality["720p"], mockData3)).toBe(mockData3[2])
})

test("don't fallback when no lower quality", () => {
    let mockData = [
        {label: "360p", file: "1", type: "mp4"},
        {label: "480p", file: "2", type: "mp4"}
    ]
    // expected is the 360p file
    expect(autoFallback(Quality["360p"], mockData)).toBe(mockData[0])
})

test("don't fallback if invalid preferred quality", () => {
    let mockData = [
        {label: "360p", file: "1", type: "mp4"},
        {label: "480p", file: "2", type: "mp4"}
    ]
    // expected is null
    expect(autoFallback(Quality["555p"], mockData)).toBeNull()

    // expected is null
    expect(autoFallback(Quality["361p"], mockData)).toBeNull()

    // expected is null
    expect(autoFallback(Quality["481p"], mockData)).toBeNull()
})
