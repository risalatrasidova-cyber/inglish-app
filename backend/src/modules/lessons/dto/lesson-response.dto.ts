import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LessonResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  order: number;

  @ApiProperty()
  is_active: boolean;

  @ApiPropertyOptional()
  word_count?: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class LessonDetailResponseDto extends LessonResponseDto {
  @ApiPropertyOptional({ type: [Object] })
  words?: Array<{
    id: number;
    english_word: string;
    russian_translation: string;
  }>;
}

