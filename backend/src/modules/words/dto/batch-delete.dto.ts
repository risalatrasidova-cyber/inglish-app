import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class BatchDeleteWordsDto {
  @ApiProperty({
    description: 'Массив ID слов для удаления',
    example: [1, 2, 3, 5, 7],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1, { message: 'Word IDs array is required and cannot be empty' })
  word_ids: number[];
}

