global.chrome = {
    storage: {
        local: {
            get: () => {
                return {
                    settings: {malUsername: "", malPassword: ""}
                }
            },
            set: () => {
                return true
            }
        }
    }
}

const malDate = require("../src/ts/MyAnimeList/core").malDate

// malDate
describe("malDate", () => {
    test("generate date strings properly", () => {
        expect(malDate(new Date("2016", "2", "1"))).toBe("03012016")
        expect(malDate(new Date("2016", "11", "12"))).toBe("12122016")
    })
})
