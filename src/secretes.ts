import dotenv from "dotenv";
import { dot } from "node:test/reporters";

dotenv.config({ path: ".env" });

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET!;
