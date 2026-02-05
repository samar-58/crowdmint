import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root (two levels up from apps/server)
config({ path: resolve(__dirname, '../../../../.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export const LAMPORTS_PER_SOL = 10 ** 9;

export const PARENT_WALLET_ADDRESS = process.env.PARENT_WALLET_ADDRESS as string ?? 'FdYARKsLYMSWExkxLedf5VdeGbLWp8Y4iTTKMK2G8mDh';

export const PARENT_WALLET_SECRET_KEY = process.env.PARENT_WALLET_SECRET_KEY as string ?? '';
