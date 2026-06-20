// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { execSync } from 'child_process';
import { URL } from 'url';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

function resolveHostnameSync(hostname: string): string {
  try {
    const output = execSync(`getent ahostsv4 ${hostname}`, { encoding: 'utf8', timeout: 2000 });
    const match = output.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    if (match) return match[1];
  } catch (e) {
    // getent not available in some environments; fall back to hostname
  }
  return hostname;
}

function getPoolConfig(connStr: string) {
  const parsed = new URL(connStr);
  const hostname = parsed.hostname;
  const resolvedIp = resolveHostnameSync(hostname);
  const schema = parsed.searchParams.get('schema') || 'bachatvaani';

  return {
    config: {
      host: resolvedIp,
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      database: parsed.pathname.substring(1),
      user: parsed.username,
      password: decodeURIComponent(parsed.password),
      ssl: {
        rejectUnauthorized: false,
        servername: hostname,
      }
    },
    schema
  };
}

const { config, schema } = getPoolConfig(connectionString);

// Recommended global singleton for PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool(config);
  pool.on('connect', (client) => {
    client.query(`SET search_path TO ${schema}`).catch(() => {});
  });
  const adapter = new PrismaPg(pool, { schema });
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.__prisma__) {
    const pool = new Pool(config);
    pool.on('connect', (client) => {
      client.query(`SET search_path TO ${schema}`).catch(() => {});
    });
    const adapter = new PrismaPg(pool, { schema });
    global.__prisma__ = new PrismaClient({ adapter });
  }
  prisma = global.__prisma__!;
}

export { prisma };
