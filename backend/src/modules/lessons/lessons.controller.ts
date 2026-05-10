import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonQueryDto } from './dto/lesson-query.dto';
import { LessonResponseDto, LessonDetailResponseDto } from './dto/lesson-response.dto';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';

@ApiTags('Admin - Lessons')
@Controller('admin/lessons')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать урок' })
  @ApiResponse({
    status: 201,
    description: 'Урок создан',
    type: LessonResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех уроков' })
  @ApiResponse({ status: 200, description: 'Список уроков' })
  findAll(@Query() query: LessonQueryDto) {
    return this.lessonsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детали урока' })
  @ApiResponse({
    status: 200,
    description: 'Детали урока',
    type: LessonDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Урок не найден' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить урок' })
  @ApiResponse({
    status: 200,
    description: 'Урок обновлен',
    type: LessonDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Урок не найден' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить урок' })
  @ApiResponse({ status: 200, description: 'Урок удален' })
  @ApiResponse({ status: 404, description: 'Урок не найден' })
  @ApiResponse({
    status: 400,
    description: 'Нельзя удалить урок со связанными словами',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.remove(id);
  }
}

