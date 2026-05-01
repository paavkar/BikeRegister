/**
 * This function is to check if the object given is empty.
 */
export function isPlainEmptyObject(value: unknown): value is Record<string, never> {
    return (
        typeof value === "object" &&
        value !== null &&
        Object.getPrototypeOf(value) === Object.prototype &&
        Object.keys(value).length === 0
    );
}