import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { LogsService } from './logs.service';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  private readonly logger = new Logger(LogsController.name);

  constructor(private readonly logsService: LogsService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateLogDto) {
    const { id: userId } = req.user as { id: string };
    try {
      const result = await this.logsService.create(userId, dto);
      return result;
    } catch (error) {
      this.logger.error(
        `create failed — userId: ${userId}, body: ${JSON.stringify(dto)}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const user = req.user as { id: string };
    return this.logsService.findAll(user.id, from, to);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as { id: string };
    return this.logsService.findOne(id, user.id);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLogDto,
  ) {
    const { id: userId } = req.user as { id: string };
    try {
      const result = await this.logsService.update(id, userId, dto);
      return result;
    } catch (error) {
      this.logger.error(
        `update failed — id: ${id}, userId: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const { id: userId } = req.user as { id: string };
    try {
      const result = await this.logsService.remove(id, userId);
      return result;
    } catch (error) {
      this.logger.error(
        `remove failed — id: ${id}, userId: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
