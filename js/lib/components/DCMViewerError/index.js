/**
 * Objects to be used to throw errors.
 */
export class DCMViewerError extends Error {
    constructor(message) {
        super();
        this.message = message;
        this.stack = (new Error()).stack;
        this.name = this.constructor.name;
    }
}
