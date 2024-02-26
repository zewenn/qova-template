export default class Err {
    public message: string;

    constructor(message: string) {
        this.message = message;
    }

    static isError(obj: any): obj is Err {
        if (obj instanceof Err) {
            return true;
        }
        return false;
    }
}