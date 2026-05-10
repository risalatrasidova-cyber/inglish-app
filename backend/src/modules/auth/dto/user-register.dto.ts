import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class UserRegisterDto {
  @ApiProperty({
    description: 'Логин пользователя (уникальный)',
    example: 'newuser',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Login is required' })
  @MinLength(1)
  @MaxLength(100)
  login: string;
}

