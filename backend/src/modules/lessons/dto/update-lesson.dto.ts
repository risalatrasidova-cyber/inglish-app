import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min, MaxLength } from 'class-validator';

export class UpdateLessonDto {
  @ApiPropertyOptional({
    description: 'Название урока',
    example: 'Урок 1: Животные (обновлено)',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Описание урока',
    example: 'Новое описание',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Порядок отображения',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    description: 'Активен ли урок',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Массив ID слов для привязки к уроку',
    example: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  word_ids?: number[];
}

