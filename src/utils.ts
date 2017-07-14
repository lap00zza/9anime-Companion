/**
 * Konichiwa~
 * Before you make any changes please consider the following:
 *
 * 1. utils houses the utility functions that can be reused
 *    anywhere. If you want to add a specialized/single
 *    use-case function, utils is not the place for it.
 * 2. Comments are a must in JSDoc style. But dont specify
 *    the types. We are using typescript which render JSDoc
 *    types useless. Remember to briefly explain the params
 *    and the return value (if any).
 *
 * Thanks for deciding to contribute/read :) You are awesome!
 */

/**
 * Defines a generic object with key, value as strings.
 * Since TS needs a index signature, we will use this
 * quite often.
 */
interface IGenericObject {
    [key: string]: string|number;
}

/**
 * A simple helper function to remove the leading
 * and trailing whitespace in each lines of template
 * literals and convert to a single line.
 * @param {string} data
 * @returns {string}
 */
export function dedent(data: string): string {
    return data
        .split("\n")
        .map(item => item.trim())
        .join("");
}

/**
 * Just as the function name says!
 * We remove the illegal characters.
 * @param filename
 *      The current name of the episode
 * @returns
 *      The file-safe name of the episode
 */
export function fileSafeString(filename: string): string {
    let re = /[\\/<>*?:"|]/gi;
    return filename.replace(re, "");
}

/**
 * Generates a 3 digit episode number from the given
 * number. This is helpful while sorting files.
 * @param num
 *      The episode number
 * @returns
 *      The 3 digit episode id
 */
export function pad(num: string): string {
    if (num.length >= 3) {
        return num;
    } else {
        return ("000" + num).slice(-3);
    }
}

/**
 * A simple helper function that merges 2 objects.
 * @returns The merged object
 */
export function mergeObject (obj1: IGenericObject, obj2: IGenericObject): IGenericObject {
    for (let b in obj2) {
        if (obj2.hasOwnProperty(b)) {
            obj1[b] = obj2[b];
        }
    }
    return obj1;
}

let parser = document.createElement("a");
/**
 * Returns a [url, searchParams] tuple from a uri string.
 * Remember, tuple is basically a fixed length array.
 * Credits to jlong for this implementation idea:
 * https://gist.github.com/jlong/2428561
 * @param uriString
 *      The full fledged grabber link.
 *      Ex: https://9anime.to/grabber-api/?server=21
 * @returns
 *      The tuple [url, searchParams]
 */
export function decomposeURL(uriString: string): [string, IGenericObject] {
    parser.href = uriString;
    let searchParams: IGenericObject = {};
    let url =  parser.protocol + "//" + parser.hostname + parser.pathname;

    // query string contains a '?' followed by
    // the parameters of the URL. We don't need
    // the '?' so we slice it.
    let params = parser.search.slice(1);

    // All search params are delimited by '&'.
    // We split them into an array and iterate
    // through it to get the keys and values.
    // ex: hello=world&hi=there&once=again
    let items = params.split("&");

    for (let item of items) {
        let searchSplit = item.split("=");
        // We don't want params that are not
        // proper k,v pairs
        if (searchSplit[0] !== "" && searchSplit[1] !== undefined) {
            searchParams[searchSplit[0]] = searchSplit[1];
        }
    }
    return [url, searchParams];
}
