import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsArray, Min, MaxLength } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Название урока',
    example: 'Урок 1: Животные',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Описание урока',
    example: 'Изучаем названия животных',
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
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Массив ID слов для привязки к уроку',
    example: [1, 2, 3, 5, 7],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  word_ids?: number[];
}

