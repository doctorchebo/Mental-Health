import {
  Body,
  Controller,
  Delete,
  Get,
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
  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateLogDto) {
    const user = req.user as { id: string };
    return this.logsService.create(user.id, dto);
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
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLogDto,
  ) {
    const user = req.user as { id: string };
    return this.logsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as { id: string };
    return this.logsService.remove(id, user.id);
  }
}
