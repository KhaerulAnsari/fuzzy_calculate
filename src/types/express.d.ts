import express from "express";
import type { User } from "@prisma/client";

declare module 'express' {
    export interface Request {
        user: User
    }
}