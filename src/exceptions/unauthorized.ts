import { HttpException } from "./root.js";

export class UnauthorizedException extends HttpException {
  constructor(message: string, errorcode: number, errors?: any) {
    super(message, errorcode, 401, errors);
  }
}
