export class CommandAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
    }
}