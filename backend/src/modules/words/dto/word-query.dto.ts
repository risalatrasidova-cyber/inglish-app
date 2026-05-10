import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class WordQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Фильтр по ID урока' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  lesson_id?: number;

  @ApiPropertyOptional({ description: 'Поиск по английскому или русскому слову' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Сортировка',
    enum: ['english_word', 'russian_translation', 'created_at'],
    default: 'created_at',
  })
  @IsString()
  @IsOptional()
  sort?: 'english_word' | 'russian_translation' | 'created_at';
}

