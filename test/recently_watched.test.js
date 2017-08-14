global.chrome = {
    storage: {
        local: {
            get: () => {return {recentlyWatched: []}},
            set: () => {return true}
        }
    }
};

const addToList = require("../src/ts/recently_watched").addToList;
const getList = require("../src/ts/recently_watched").getList;
const removeFromList = require("../src/ts/recently_watched").removeFromList;
const setMaxItems = require("../src/ts/recently_watched").setMaxItems;
const clearList = require("../src/ts/recently_watched").clearList;

beforeEach(() => clearList());

// addToList
describe("addToList", () => {
    test("should throw error if properties are missing", () => {
        let errorMessage = "[Recently Watched] [Error] animeId, animeName and url must be present.";
        // Leaving out timestamp, epId and epNum the other 3
        // properties are required. Hence, there is a test
        // case for all of them.
        expect(() => {
            addToList({
                animeName: "123",
                url: "123"
            })
        }).toThrowError(errorMessage);

        expect(() => {
            addToList({
                animeId: "123",
                url: "123"
            })
        }).toThrowError(errorMessage);

        expect(() => {
            addToList({
                animeId: "123",
                animeName: "123",
            })
        }).toThrowError(errorMessage);
    });

    test("should add when the required properties are present", () => {
        addToList({
            animeId: "123",
            animeName: "123",
            epId: "123",
            epNum: "123",
            url: "123"
        });
        expect(getList().length).toBe(1);
    });

    test("should update when same animeId is present", () => {
        addToList({
            animeId: "123",
            animeName: "123",
            epId: "123",
            epNum: "123",
            url: "123"
        });
        addToList({
            animeId: "123",     /* animeId same */
            animeName: "123",
            epId: "234",        /* epId different */
            epNum: "234",
            url: "123"
        });
        expect(getList().length).toBe(1);
        expect(getList()[0].epId).toBe("234");
    });

    test("total number of items should not exceed MAX_ITEM", () => {
        setMaxItems(2);
        addToList({
            animeId: "123",
            animeName: "123",
            epId: "123",
            epNum: "123",
            timestamp: "2017-07-20T14:21:42.859Z",
            url: "123"
        });
        addToList({
            animeId: "234",
            animeName: "123",
            epId: "123",
            epNum: "123",
            timestamp: "2017-07-20T14:31:42.859Z",
            url: "123"
        });
        addToList({
            animeId: "345",
            animeName: "123",
            epId: "123",
            epNum: "123",
            timestamp: "2017-07-20T14:41:42.859Z",
            url: "123"
        });
        expect(getList().length).toBe(2);
        expect(getList()[0].animeId).toBe("345");
        expect(getList()[1].animeId).toBe("234");
    });
});

// getList
describe("getList", () => {
    test("returned array should be sorted by time; recent first", () => {
        addToList({
            animeId: "123",
            animeName: "123",
            epId: "123",
            epNum: "123",
            timestamp: "2017-07-20T14:21:42.859Z",
            url: "123",
        });
        addToList({
            animeId: "456",
            animeName: "456",
            epId: "456",
            epNum: "456",
            timestamp: "2017-07-20T14:31:42.859Z", /* time changed by 10 min's */
            url: "456"
        });
        expect(getList().length).toBe(2);
        expect(getList()[0].animeId).toBe("456");
    });
});

// removeFromList
describe("removeFromList", () => {
    test("should remove item from list if valid id is present", () => {
        addToList({
            animeId: "123",
            animeName: "123",
            epId: "123",
            epNum: "123",
            timestamp: "2017-07-20T14:21:42.859Z",
            url: "123",
        });
        expect(removeFromList("123")).toBe(true);
    });

    test("should not remove item from list if valid id is not present", () => {
        expect(removeFromList("RANDOM_ID")).toBe(false);
    });
});
