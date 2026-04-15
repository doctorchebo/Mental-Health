import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: { findById: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  describe('issueTokens', () => {
    it('signs and returns access and refresh tokens', () => {
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = service.issueTokens('user-id', 'user@example.com');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshTokens', () => {
    it('returns new tokens when the refresh token is valid and the user exists', async () => {
      (jwtService.verify as jest.Mock).mockReturnValueOnce({
        sub: 'user-id',
        email: 'user@example.com',
      });
      (usersService.findById as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
      });
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('new-access')
        .mockReturnValueOnce('new-refresh');

      const result = await service.refreshTokens('valid-token');

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });

    it('throws UnauthorizedException when token verification fails', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the user no longer exists', async () => {
      (jwtService.verify as jest.Mock).mockReturnValueOnce({
        sub: 'ghost-id',
        email: 'ghost@example.com',
      });
      (usersService.findById as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(service.refreshTokens('orphan-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
