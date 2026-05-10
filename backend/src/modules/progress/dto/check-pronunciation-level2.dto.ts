import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CheckPronunciationLevel2Dto {
  @ApiProperty({
    description: 'ID слова',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  word_id: number;

  @ApiProperty({
    description: 'Распознанный текст (от Web Speech API)',
    example: 'dog',
  })
  @IsString()
  @IsNotEmpty()
  spoken_text: string;
}

