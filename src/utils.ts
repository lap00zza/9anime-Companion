/**
 * A simple helper function to remove the leading and trailing
 * whitespace in each lines of template literals.
 *
 * @param {string} data
 * @returns {string}
 */
export function dedent(data: string) {
    return data
        .split("\n")
        .map((item) => {
            return item.trim();
        })
        .join("");
}
