/**
 * Logs and returns a formatted JSON string of the provided arguments.
 *
 * @param {...*} rest - The arguments to be logged and formatted.
 * @returns {string|undefined} The formatted JSON string of the arguments, or undefined if no arguments are provided.
 */
export function print(...rest) {
    if (rest.length > 0) {
        const formatted = JSON.stringify(arguments, null, 2);
        console.log(formatted);
        return formatted;
    }
};
