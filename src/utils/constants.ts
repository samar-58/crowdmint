import { PrismaClient } from "../../generated/prisma/client";

export const prisma = new PrismaClient()

export const LAMPORTS_PER_SOL = 10 ** 9;

export const PARENT_WALLET_ADDRESS = process.env.PARENT_WALLET_ADDRESS as string?? "FdYARKsLYMSWExkxLedf5VdeGbLWp8Y4iTTKMK2G8mDh";

export const PARENT_WALLET_SECRET_KEY = process.env.PARENT_WALLET_SECRET_KEY as string ?? ""