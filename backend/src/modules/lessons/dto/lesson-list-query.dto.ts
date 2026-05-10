import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class LessonListQueryDto {
  @ApiPropertyOptional({
    description: 'Включить информацию о прогрессе пользователя',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  include_progress?: boolean;
}

