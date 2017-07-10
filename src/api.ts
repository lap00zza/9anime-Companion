// This module contains all the api calls.
import * as $ from "jquery";

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
export function generateToken(data: any, initialState = 0): number {
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
    update: number;
    _?: number; /* this is the token */
}

// The response structure of the Grabber.
interface IGrabber {
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

export function grabber(params: IGrabberParams): Promise<IGrabber> {
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
