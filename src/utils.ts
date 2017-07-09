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
 * @param {string} filename
 * @returns {string}
 */
export function fileSafeString (filename: string): string {
    let re = /[\\/<>*?:"|]/gi;
    return filename.replace(re, "");
}

/**
 * Generates a 3 digit episode id from the given
 * id. This is id is helpful while sorting files.
 * @param {string} num - The episode id
 * @returns {string} - The 3 digit episode id
 */
export function pad (num: string): string {
    if (num.length >= 3) {
        return num;
    } else {
        return ("000" + num).slice(-3);
    }
}
