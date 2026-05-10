import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWordDto {
  @ApiProperty({
    description: 'Английское слово',
    example: 'cat',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'English word is required' })
  @MaxLength(255)
  english_word: string;

  @ApiProperty({
    description: 'Русский перевод',
    example: 'кот',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Russian translation is required' })
  @MaxLength(255)
  russian_translation: string;

  @ApiProperty({
    description: 'ID урока',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'Lesson ID is required' })
  lesson_id: number;
}

