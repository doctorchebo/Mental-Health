import { Test, TestingModule } from '@nestjs/testing';
import { DRIZZLE } from '../db/db.module';
import { GoogleProfile, UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockFindFirst: jest.Mock;
  let mockReturning: jest.Mock;

  beforeEach(async () => {
    mockFindFirst = jest.fn();
    mockReturning = jest.fn();

    const mockDb = {
      query: {
        users: { findFirst: mockFindFirst },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: mockReturning }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn() }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: DRIZZLE, useValue: mockDb }],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const user = { id: 'user-id', email: 'test@example.com' };
      mockFindFirst.mockResolvedValueOnce(user);

      const result = await service.findById('user-id');

      expect(result).toEqual(user);
    });

    it('returns undefined when user does not exist', async () => {
      mockFindFirst.mockResolvedValueOnce(undefined);

      const result = await service.findById('unknown-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findOrCreateByGoogle', () => {
    const profile: GoogleProfile = {
      email: 'test@example.com',
      name: 'Test User',
      googleId: 'google-123',
    };

    it('returns existing user without inserting when found by googleId', async () => {
      const existing = { id: 'user-id', email: profile.email };
      mockFindFirst.mockResolvedValueOnce(existing);

      const result = await service.findOrCreateByGoogle(profile);

      expect(result).toEqual(existing);
      expect(mockReturning).not.toHaveBeenCalled();
    });

    it('creates and returns a new user when not found', async () => {
      const newUser = {
        id: 'new-id',
        email: profile.email,
        name: profile.name,
      };
      mockFindFirst.mockResolvedValueOnce(undefined);
      mockReturning.mockResolvedValueOnce([newUser]);

      const result = await service.findOrCreateByGoogle(profile);

      expect(result).toEqual(newUser);
      expect(mockReturning).toHaveBeenCalled();
    });
  });
});
