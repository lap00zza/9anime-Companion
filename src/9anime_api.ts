// This module contains function for the 9anime API.
const DD = "gIXCaNh"; /* This might change in the future */

// Part of 9anime encryption scheme.
// Can't really explain more.
function s (t: string): number {
    let e;
    let i = 0;
    for (e = 0; e < t.length; e++) {
        i += t.charCodeAt(e) * e + e;
    }
    return i;
}

// Part of 9anime encryption scheme
// Can't really explain more.
function a (t: string, e: string): string {
    let i;
    let n = 0;
    for (i = 0; i < Math.max(t.length, e.length); i++) {
        n += i < e.length ? e.charCodeAt(i) : 0;
        n += i < t.length ? t.charCodeAt(i) : 0;
    }
    return Number(n).toString(16);
}

export function generateToken (data, initialState) {
    let keys = Object.keys(data);
    let _ = s(DD) + (initialState || 0);
    for (let key of keys) {
        let trans = a(DD + key, data[key].toString());
        _ += s(trans);
    }
    return _;
}
