import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WordResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  english_word: string;

  @ApiProperty()
  russian_translation: string;

  @ApiProperty()
  lesson_id: number;

  @ApiPropertyOptional()
  lesson_name?: string;

  @ApiProperty()
  audio_file_path: string;

  @ApiPropertyOptional()
  audio_file_name: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

