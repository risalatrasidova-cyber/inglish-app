import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class BatchMoveWordsDto {
  @ApiProperty({
    description: 'Массив ID слов для перемещения',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1, { message: 'Word IDs array is required' })
  word_ids: number[];

  @ApiProperty({
    description: 'ID урока для перемещения',
    example: 2,
  })
  @IsInt()
  lesson_id: number;
}

