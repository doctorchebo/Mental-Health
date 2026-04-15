import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DRIZZLE } from '../db/db.module';
import { CreateLogDto } from './dto/create-log.dto';
import { LogsService } from './logs.service';

const makeLog = (overrides: Record<string, unknown> = {}) => ({
  id: 'log-id',
  userId: 'user-id',
  logDate: '2026-04-15',
  moodRating: 7,
  anxietyLevel: 3,
  stressLevel: 4,
  sleepHours: '7.5',
  sleepQuality: 4,
  sleepDisturbances: '[]',
  activityType: 'walking',
  activityMinutes: 30,
  socialInteractions: 3,
  depressionSymptoms: '[]',
  anxietySymptoms: '[]',
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const dto: CreateLogDto = {
  logDate: '2026-04-15',
  moodRating: 7,
  anxietyLevel: 3,
  stressLevel: 4,
  sleepHours: 7.5,
  sleepQuality: 4,
  socialInteractions: 3,
} as CreateLogDto;

describe('LogsService', () => {
  let service: LogsService;
  let mockReturning: jest.Mock;
  let mockSelectWhere: jest.Mock;
  let mockFindFirst: jest.Mock;

  beforeEach(async () => {
    mockReturning = jest.fn();
    mockSelectWhere = jest.fn();
    mockFindFirst = jest.fn();

    const mockDb = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: mockReturning }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ returning: mockReturning }),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({ returning: mockReturning }),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({ where: mockSelectWhere }),
      }),
      query: {
        dailyLogs: { findFirst: mockFindFirst },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsService, { provide: DRIZZLE, useValue: mockDb }],
    }).compile();

    service = module.get(LogsService);
  });

  describe('create', () => {
    it('creates and returns a parsed log', async () => {
      mockReturning.mockResolvedValueOnce([makeLog()]);

      const result = await service.create('user-id', dto);

      expect(result.id).toBe('log-id');
      expect(result.sleepDisturbances).toEqual([]);
      expect(result.depressionSymptoms).toEqual([]);
    });

    it('throws ConflictException on duplicate date (pg unique violation)', async () => {
      mockReturning.mockRejectedValueOnce({ code: '23505' });

      await expect(service.create('user-id', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('re-throws unexpected database errors', async () => {
      mockReturning.mockRejectedValueOnce(new Error('db connection lost'));

      await expect(service.create('user-id', dto)).rejects.toThrow(
        'db connection lost',
      );
    });
  });

  describe('findAll', () => {
    it('returns parsed logs for a user', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        makeLog(),
        makeLog({ id: 'log-id-2' }),
      ]);

      const result = await service.findAll('user-id');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('log-id');
    });

    it('returns empty array when user has no logs', async () => {
      mockSelectWhere.mockResolvedValueOnce([]);

      const result = await service.findAll('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns a parsed log when found', async () => {
      mockFindFirst.mockResolvedValueOnce(makeLog());

      const result = await service.findOne('log-id', 'user-id');

      expect(result.id).toBe('log-id');
    });

    it('throws NotFoundException when the log does not exist', async () => {
      mockFindFirst.mockResolvedValueOnce(undefined);

      await expect(service.findOne('missing-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates and returns the log', async () => {
      mockReturning.mockResolvedValueOnce([makeLog({ moodRating: 9 })]);

      const result = await service.update('log-id', 'user-id', {
        moodRating: 9,
      });

      expect(result.moodRating).toBe(9);
    });

    it('throws NotFoundException when the log does not exist', async () => {
      mockReturning.mockResolvedValueOnce([]);

      await expect(service.update('missing-id', 'user-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('returns { ok: true } when log is deleted', async () => {
      mockReturning.mockResolvedValueOnce([makeLog()]);

      const result = await service.remove('log-id', 'user-id');

      expect(result).toEqual({ ok: true });
    });

    it('throws NotFoundException when log does not exist', async () => {
      mockReturning.mockResolvedValueOnce([]);

      await expect(service.remove('missing-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
