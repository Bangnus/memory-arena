import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const rawUrl = process.env.DATABASE_URL || 'file:./data/memory_arena.db';
    let url = rawUrl;
    if (url.startsWith('file:')) {
      const relPath = url.replace('file:', '');
      const absPath = path.isAbsolute(relPath)
        ? relPath
        : path.resolve(process.cwd(), relPath);
      url = `file:${absPath.replace(/\\/g, '/')}`;
    }
    const adapter = new PrismaLibSql({ url });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log(
        'Successfully connected to SQLite database via Prisma',
      );
    } catch (error) {
      this.logger.warn(
        `Database connection failed during module init: ${(error as Error).message}. Retrying on first request...`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Disconnected from SQLite database');
  }
}
