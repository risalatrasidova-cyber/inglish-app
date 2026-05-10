import { Controller, Get, Param, Query, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { LessonListQueryDto } from './dto/lesson-list-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LessonsUserController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех доступных уроков' })
  @ApiResponse({ status: 200, description: 'Список уроков' })
  findAll(@Query() query: LessonListQueryDto, @Request() req) {
    return this.lessonsService.findAllForUser(req.user.userId, query);
  }

  @Get(':lessonId')
  @ApiOperation({ summary: 'Получить детали урока' })
  @ApiResponse({ status: 200, description: 'Детали урока' })
  @ApiResponse({ status: 404, description: 'Урок не найден' })
  findOne(@Param('lessonId', ParseIntPipe) id: number) {
    return this.lessonsService.findOne(id);
  }
}

