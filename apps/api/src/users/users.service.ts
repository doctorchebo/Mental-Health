import * as schema from '@mental-health/db/schema';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../db/db.module';

type Db = NodePgDatabase<typeof schema>;

export interface GoogleProfile {
  email: string;
  name: string | null;
  googleId: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  async findOrCreateByGoogle(profile: GoogleProfile) {
    const existing = await this.db.query.users.findFirst({
      where: eq(schema.users.googleId, profile.googleId),
    });
    if (existing) return existing;

    const [created] = await this.db
      .insert(schema.users)
      .values({
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
      })
      .returning();
    this.logger.log(
      `New user created via Google — userId: ${created.id}, email: ${created.email}`,
    );
    return created;
  }

  async markOnboardingSeen(userId: string) {
    await this.db
      .update(schema.users)
      .set({ hasSeenOnboarding: 1, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
  }
}
