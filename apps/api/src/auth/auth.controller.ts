import {
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Cross-origin cookies require sameSite: 'none' + secure: true
const COOKIE_DEFAULTS = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
};

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport redirects to Google automatically
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { id: string; email: string };
    this.logger.log(`Google OAuth callback — userId: ${user.id}`);
    const { accessToken, refreshToken } = this.authService.issueTokens(
      user.id,
      user.email,
    );
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');

    res.cookie('access_token', accessToken, {
      ...COOKIE_DEFAULTS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_DEFAULTS,
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${frontendUrl}/dashboard`);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const token: string | undefined = req.cookies?.refresh_token;
    if (!token) {
      this.logger.warn('Token refresh attempted without a refresh cookie');
      throw new UnauthorizedException('No refresh token');
    }

    try {
      const { accessToken } = await this.authService.refreshTokens(token);
      res.cookie('access_token', accessToken, {
        ...COOKIE_DEFAULTS,
        maxAge: 15 * 60 * 1000,
      });
      this.logger.log('Access token refreshed successfully');
      return res.json({ ok: true });
    } catch (error) {
      this.logger.error(
        'Token refresh failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    this.logger.log('User logged out');
    res.clearCookie('access_token', COOKIE_DEFAULTS);
    res.clearCookie('refresh_token', {
      ...COOKIE_DEFAULTS,
      path: '/api/auth/refresh',
    });
    return res.json({ ok: true });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const authUser = req.user as { id: string; email: string };
    return this.usersService.findById(authUser.id);
  }

  @Post('onboarding-seen')
  @UseGuards(JwtAuthGuard)
  async markOnboardingSeen(@Req() req: Request) {
    const authUser = req.user as { id: string; email: string };
    await this.usersService.markOnboardingSeen(authUser.id);
    return { ok: true };
  }
}
