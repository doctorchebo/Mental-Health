import * as schema from '@mental-health/db/schema';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gte, lte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../db/db.module';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';

type Db = NodePgDatabase<typeof schema>;

@Injectable()
export class LogsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async create(userId: string, dto: CreateLogDto) {
    try {
      const [log] = await this.db
        .insert(schema.dailyLogs)
        .values({
          userId,
          logDate: dto.logDate,
          moodRating: dto.moodRating,
          anxietyLevel: dto.anxietyLevel,
          stressLevel: dto.stressLevel,
          sleepHours: String(dto.sleepHours),
          sleepQuality: dto.sleepQuality,
          ...(dto.sleepDisturbances !== undefined && {
            sleepDisturbances: JSON.stringify(dto.sleepDisturbances),
          }),
          ...(dto.activityType !== undefined && {
            activityType: dto.activityType,
          }),
          ...(dto.activityMinutes !== undefined && {
            activityMinutes: dto.activityMinutes,
          }),
          socialInteractions: dto.socialInteractions ?? 0,
          ...(dto.depressionSymptoms !== undefined && {
            depressionSymptoms: JSON.stringify(dto.depressionSymptoms),
          }),
          ...(dto.anxietySymptoms !== undefined && {
            anxietySymptoms: JSON.stringify(dto.anxietySymptoms),
          }),
          notes: dto.notes,
        })
        .returning();
      return this.parseLog(log);
    } catch (err: unknown) {
      const pgErr = err as { code?: string };
      if (pgErr?.code === '23505') {
        throw new ConflictException('A log for this date already exists');
      }
      throw err;
    }
  }

  async findAll(userId: string, from?: string, to?: string) {
    const conditions = [eq(schema.dailyLogs.userId, userId)];
    if (from) conditions.push(gte(schema.dailyLogs.logDate, from));
    if (to) conditions.push(lte(schema.dailyLogs.logDate, to));

    const rows = await this.db
      .select()
      .from(schema.dailyLogs)
      .where(and(...conditions));

    return rows.map((r) => this.parseLog(r));
  }

  async findOne(id: string, userId: string) {
    const row = await this.db.query.dailyLogs.findFirst({
      where: and(
        eq(schema.dailyLogs.id, id),
        eq(schema.dailyLogs.userId, userId),
      ),
    });
    if (!row) throw new NotFoundException('Log not found');
    return this.parseLog(row);
  }

  async update(id: string, userId: string, dto: UpdateLogDto) {
    const values: Partial<typeof schema.dailyLogs.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (dto.moodRating !== undefined) values.moodRating = dto.moodRating;
    if (dto.anxietyLevel !== undefined) values.anxietyLevel = dto.anxietyLevel;
    if (dto.stressLevel !== undefined) values.stressLevel = dto.stressLevel;
    if (dto.sleepHours !== undefined)
      values.sleepHours = String(dto.sleepHours);
    if (dto.sleepQuality !== undefined) values.sleepQuality = dto.sleepQuality;
    if (dto.sleepDisturbances !== undefined)
      values.sleepDisturbances = JSON.stringify(dto.sleepDisturbances);
    if (dto.activityType !== undefined) values.activityType = dto.activityType;
    if (dto.activityMinutes !== undefined)
      values.activityMinutes = dto.activityMinutes;
    if (dto.socialInteractions !== undefined)
      values.socialInteractions = dto.socialInteractions;
    if (dto.depressionSymptoms !== undefined)
      values.depressionSymptoms = JSON.stringify(dto.depressionSymptoms);
    if (dto.anxietySymptoms !== undefined)
      values.anxietySymptoms = JSON.stringify(dto.anxietySymptoms);
    if (dto.notes !== undefined) values.notes = dto.notes;

    const [updated] = await this.db
      .update(schema.dailyLogs)
      .set(values)
      .where(
        and(eq(schema.dailyLogs.id, id), eq(schema.dailyLogs.userId, userId)),
      )
      .returning();

    if (!updated) throw new NotFoundException('Log not found');
    return this.parseLog(updated);
  }

  async remove(id: string, userId: string) {
    const [deleted] = await this.db
      .delete(schema.dailyLogs)
      .where(
        and(eq(schema.dailyLogs.id, id), eq(schema.dailyLogs.userId, userId)),
      )
      .returning();

    if (!deleted) throw new NotFoundException('Log not found');
    return { ok: true };
  }

  private parseLog(row: typeof schema.dailyLogs.$inferSelect) {
    return {
      ...row,
      sleepDisturbances: row.sleepDisturbances
        ? (JSON.parse(row.sleepDisturbances) as string[])
        : [],
      depressionSymptoms: row.depressionSymptoms
        ? (JSON.parse(row.depressionSymptoms) as string[])
        : [],
      anxietySymptoms: row.anxietySymptoms
        ? (JSON.parse(row.anxietySymptoms) as string[])
        : [],
    };
  }
}
