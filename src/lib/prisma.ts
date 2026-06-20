import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { execSync } from 'child_process';
import { URL } from 'url';

const connectionString = process.env.DATABASE_URL;

/**
 * Resolves a hostname to IPv4 synchronously using system 'getent'.
 * This completely bypasses Node's DNS resolving behaviors which can hang/timeout on WSL
 * due to broken IPv6 resolution paths.
 */
function resolveHostnameSync(hostname: string): string {
  try {
    const output = execSync(`getent ahostsv4 ${hostname}`, { encoding: 'utf8', timeout: 2000 });
    console.log(`resolveHostnameSync: getent output for ${hostname}:`, output.trim().split('\n')[0]);
    const match = output.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    if (match) {
      return match[1];
    }
  } catch (e: any) {
    console.warn(`resolveHostnameSync: DNS resolution failed for ${hostname}:`, e.message);
  }
  return hostname;
}

function getPoolConfig(connStr: string) {
  const parsed = new URL(connStr);
  const hostname = parsed.hostname;
  const resolvedIp = resolveHostnameSync(hostname);
  const schema = parsed.searchParams.get('schema') || 'bachatvaani';
  
  console.log(`getPoolConfig: hostname=${hostname}, resolvedIp=${resolvedIp}, schema=${schema}`);
  
  return {
    config: {
      host: resolvedIp,
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      database: parsed.pathname.substring(1),
      user: parsed.username,
      password: decodeURIComponent(parsed.password),
      ssl: {
        rejectUnauthorized: false,
        servername: hostname, // Explicitly pass SNI hostname
      }
    },
    schema
  };
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const { config, schema } = getPoolConfig(connectionString);

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool(config);
  pool.on('connect', (client) => {
    client.query(`SET search_path TO ${schema}`).catch(err => {
      console.error('Failed to set search path:', err);
    });
  });
  const adapter = new PrismaPg(pool, { schema });
  prismaInstance = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const pool = new Pool(config);
    pool.on('connect', (client) => {
      client.query(`SET search_path TO ${schema}`).catch(err => {
        console.error('Failed to set search path:', err);
      });
    });
    const adapter = new PrismaPg(pool, { schema });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;
