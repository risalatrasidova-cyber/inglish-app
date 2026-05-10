import { ApiProperty } from '@nestjs/swagger';

export class CheckResponseDto {
  @ApiProperty()
  is_correct: boolean;

  @ApiProperty({ required: false })
  is_new_word?: boolean;

  @ApiProperty({ required: false })
  reward?: {
    amount: number;
    message: string;
  };

  @ApiProperty()
  progress: {
    correct_count: number;
    total_words: number;
    percentage: number;
  };

  @ApiProperty({ required: false })
  correct_answer?: string;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty()
  audio_file_path: string;

  @ApiProperty({ required: false })
  similarity?: number;
}

