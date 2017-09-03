/**
 * Konichiwa~
 *
 * This module contains the utility functions that are used
 * by content script, background script and the popup.
 */

import {IGenericObject, ISettings} from "./common";

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

// /**
//  * Generates a slug from an anime name. The slug only contains
//  * letters a to z, number 0 to 9 and the character -.
//  * @param name
//  * @returns
//  *      slug
//  */
// export function getSlug(name: string): string {
//     let slugRe = /[^A-Za-z0-9\-]/g;
//     // the first replace replaces all spaces with -
//     return name.toLocaleLowerCase().replace(/\s/g, "-").replace(slugRe, "");
// }

/**
 * Removes some of the modifiers like DUB, SUB etc that are
 * present in anime titles.
 * @param name - anime name
 * @returns cleaned anime title
 */
export function cleanAnimeName(name: string): string {
    let modifierRe = /\(SUB\)|\(DUB\)/gi;
    return name.replace(modifierRe, "").trim();
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
    if (num === "") {
        throw new Error("num can't be a blank string");
    }
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
export function mergeObject(obj1: IGenericObject, obj2: IGenericObject): IGenericObject {
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
 * Credits to jlong for this implementation idea:
 * https://gist.github.com/jlong/2428561
 * @param uriString
 *      The full fledged grabber link.
 *      Ex: https://9anime.to/grabber-api/?server=21
 * @returns
 *      The tuple [url, searchParams]
 */
export function decomposeURL(uriString: string): [string, { [key: string]: string }] {
    parser.href = uriString;
    let searchParams: { [key: string]: string } = {};
    let url = parser.protocol + "//" + parser.hostname + parser.pathname;

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

/**
 * Joins a URL with search params object and returns a proper url string.
 * This function does not verify if a url is valid or not. It simply joins.
 * Care must be taken while passing the url parameter.
 * @param url
 *      The url string onto which the search parameters
 *      are to be joined
 * @param searchParams
 *      An object containing the search parameters
 */
export function joinURL(url: string, searchParams: IGenericObject): string {
    Object.keys(searchParams).forEach((key, index) => {
        if (index === 0) {
            url += `?${key}=${searchParams[key]}`;
        } else {
            url += `&${key}=${searchParams[key]}`;
        }
    });
    return url;
}

/**
 * A helper function that converts a object to a query string.
 * Credits to [Artur Klesun]{@link https://stackoverflow.com/users/2750743/artur-klesun}
 * [Stack Overflow Thread]{@link http://stackoverflow.com/a/34209399/707580}
 *
 * NOTE: Pass flat objects only. Don't pass nested objects.
 */
export function obj2query(params: {[key: string]: string | number | boolean}): string {
    return Object.keys(params)
        .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k].toString()))
        .join("&");
}

/**
 * This helper function will help us test whether a given string is a valid URL.
 * Credits to [Daveo]{@link https://stackoverflow.com/users/165839/daveo} for the regex.
 * [Stack Overflow Thread]{@link https://stackoverflow.com/a/3809435/5800855}
 *
 * @param url
 *      The url that we are supposed to test.
 */
export function isUrl(url: string): boolean {
    const re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    return re.test(url);
}

export function loadSettings(key: string | string[] | null): Promise<ISettings> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result: ISettings) => {
            resolve(result);
        });
    });
}
