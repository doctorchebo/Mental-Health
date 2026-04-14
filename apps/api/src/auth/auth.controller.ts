import {
  Controller,
  Get,
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

const COOKIE_DEFAULTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

@Controller('auth')
export class AuthController {
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
    if (!token) throw new UnauthorizedException('No refresh token');

    const { accessToken } = await this.authService.refreshTokens(token);
    res.cookie('access_token', accessToken, {
      ...COOKIE_DEFAULTS,
      maxAge: 15 * 60 * 1000,
    });
    return res.json({ ok: true });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
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
