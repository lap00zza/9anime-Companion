/**
 * Created by Jewel Mahanta (@lap00zza) on 12-04-2017.
 */
// MOCKS for global objects that cant be injected

// jQuery mock
window.jQuery = {
    ajax: function () {}
};

// chrome.* API mock
window.chrome = {
    downloads: {
        download: function() {}
    },
    runtime: {
        onMessage: {
            addListener: function () {}
        },
        onInstalled: {
            addListener: function () {}
        }
    },
    storage: {
        local: {
            get: function () {},
            set: function () {}
        }
    }
};