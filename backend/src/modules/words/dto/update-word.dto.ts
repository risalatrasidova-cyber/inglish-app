import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWordDto {
  @ApiPropertyOptional({
    description: 'Английское слово',
    example: 'cat',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  english_word?: string;

  @ApiPropertyOptional({
    description: 'Русский перевод',
    example: 'кот',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  russian_translation?: string;

  @ApiPropertyOptional({
    description: 'ID урока',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  lesson_id?: number;
}

