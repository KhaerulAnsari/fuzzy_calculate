import { ErrorCode, HttpException } from "./root.js";

export class NotFoundException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
        super(message, errorCode, 404, null)
    }
}