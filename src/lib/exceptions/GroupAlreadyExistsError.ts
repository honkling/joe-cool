export class GroupAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
    }
}