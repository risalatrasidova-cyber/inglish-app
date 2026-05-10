import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CheckSpellingLevel3Dto {
  @ApiProperty({
    description: 'ID слова',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  word_id: number;

  @ApiProperty({
    description: 'Введенный текст',
    example: 'dog',
  })
  @IsString()
  @IsNotEmpty()
  typed_text: string;
}

