/* --- version is the 3rd arg --- */
if (process.argv.length !== 3) process.exit(1);
/* --- */

const fs = require("fs");
const path = {
    chrome: "./platform/chromium/manifest.json",
    firefox: "./platform/firefox/manifest.json",
    pkgjson: "./package.json",
};

const compose = (...fns) => val => fns.reduceRight((acc, each) => each(acc), val);
const assign = (prop, val) => obj => {obj[prop] = val; return obj;};
const JSONStringify = replacer => data => JSON.stringify(data, null, replacer);

// for manifest.json, duh!
const changeManifestVer = compose(
    JSONStringify("  "),
    assign("version_name", process.argv[2]),
    assign("version", process.argv[2]),
    JSON.parse,
    fs.readFileSync,
);
const updateManifest = path => fs.writeFileSync(path, changeManifestVer(path) + "\n"); /* ending newline */
updateManifest(path.chrome);
updateManifest(path.firefox);


const changePkgJsonVer = compose(
    JSONStringify("  "),
    assign("version", process.argv[2]),
    JSON.parse,
    fs.readFileSync,
);
const updatePkgJson = path => fs.writeFileSync(path, changePkgJsonVer(path) + "\n"); /* ending newline */
updatePkgJson(path.pkgjson);
