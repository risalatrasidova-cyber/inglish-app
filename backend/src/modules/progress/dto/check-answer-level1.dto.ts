import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CheckAnswerLevel1Dto {
  @ApiProperty({
    description: 'ID слова',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  word_id: number;

  @ApiProperty({
    description:
      'Как показывалось слово в задании: true — английское слово (варианты ответа на русском), false — русское слово (варианты на английском)',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  show_in_english: boolean;

  @ApiProperty({
    description: 'Выбранный ответ (на том же языке, что и варианты)',
    example: 'собака',
  })
  @IsString()
  @IsNotEmpty()
  selected_answer: string;
}

