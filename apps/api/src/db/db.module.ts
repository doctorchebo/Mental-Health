import * as schema from '@mental-health/db/schema';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');
        // prepare: false required for Supabase transaction pooler
        const client = postgres(url, { prepare: false, max: 10 });
        return drizzle({ client, schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule {}
