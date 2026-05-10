import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class LessonQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Поиск по названию урока' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Сортировка',
    enum: ['name', 'created_at', 'order'],
    default: 'order',
  })
  @IsString()
  @IsOptional()
  sort?: 'name' | 'created_at' | 'order';
}

