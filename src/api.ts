// This module contains all the api calls.
import * as $ from "jquery";
import * as utils from "./utils";

// The parts/functions marked as [*] are part of
// 9anime encryption scheme. If they make no sense
// (and they probably should not anyway), just skip
// to the parts after it.

// [*]
const DD = "gIXCaNh";

// [*]
function s(t: string): number {
    let e;
    let i = 0;
    for (e = 0; e < t.length; e++) {
        i += t.charCodeAt(e) * e + e;
    }
    return i;
}

// [*]
function a(t: string, e: string): string {
    let i;
    let n = 0;
    for (i = 0; i < Math.max(t.length, e.length); i++) {
        n += i < e.length ? e.charCodeAt(i) : 0;
        n += i < t.length ? t.charCodeAt(i) : 0;
    }
    return Number(n).toString(16);
}

// [*]
export function generateToken(data: { [key: string]: string | number }, initialState = 0): number {
    let keys = Object.keys(data);
    let _ = s(DD) + initialState;
    for (let key of keys) {
        let trans = a(DD + key, data[key].toString());
        _ += s(trans);
    }
    return _;
}

// The parameters structure for grabber.
interface IGrabberParams {
    ts: string;
    id: string;
    update: number; /* this is 0 is most cases */
    [key: string]: string | number; /* excess property used for _ */
}

// The response structure of the Grabber.
export interface IGrabber {
    grabber: string;
    name: string;
    params: {
        id: string,
        options: string,
        token: string,
    };
    subtitle: string;
    target: string;
    type: string;
}

/**
 * Query the 9anime "episode/info" endpoint and get grabber target.
 * This target will later be used to fetch the episode links.
 * @param params
 *      ts, id and update parameter. Note: update is always 0.
 * @returns
 *      Promise which resolves to an object with interface IGrabber.
 */
export function grabber(params: IGrabberParams): Promise<IGrabber> {
    // [*] this is the token
    params._ = generateToken(params);
    return new Promise((resolve, reject) => {
        $
            .ajax({
                data: params,
                dataType: "json",
                url: "/ajax/episode/info?",
            })
            .done(resp => resolve(resp))
            .fail(err => reject(err));
    });
}

interface IlinksParams {
    ts: string;
    id: string;
    options: string;
    token: string;
    mobile: number; /* this is 0 is most cases */
    [key: string]: string | number; /* excess property used for _ */
}

interface ILinks {
    data: [{ file: string, label: string, type: string }];
    error: number;
    token: string;
}

/**
 * Query the 9anime grabber and fetch the episode links.
 * @param uri
 *      The grabber uri.
 * @param data
 *      ts, id, options, token and mobile parameters.
 *      Note: mobile is always 0.
 * @returns
 *      A promise which resolves to an object of type ILinks.
 */
export function links9a(uri: string, data: IlinksParams): Promise<ILinks> {
    // The uri is something like this https://9anime.to/grabber-api/?server=21.
    // We need the url part of it to send the next request and the search param
    // part of it (ie server=21) to generate the token. So we decompose the uri
    // and merge the searchParams with the data.
    let decomposed = utils.decomposeURL(uri);
    let initState = s(a(DD + decomposed[0], ""));
    let merged = utils.mergeObject(data, decomposed[1]);
    merged._ = generateToken(merged, initState);

    return new Promise((resolve, reject) => {
        $
            .ajax({
                data: merged,
                dataType: "json",
                url: decomposed[0],
            })
            .done(resp => resolve(resp))
            .fail(err => reject(err));
    });
}
