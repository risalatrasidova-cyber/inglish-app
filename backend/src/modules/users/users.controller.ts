import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  @ApiResponse({ status: 200, description: 'Информация о пользователе' })
  async getMe(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Получить статистику пользователя' })
  @ApiResponse({ status: 200, description: 'Статистика пользователя' })
  async getStats(@Request() req) {
    return this.usersService.getUserStats(req.user.userId);
  }
}

