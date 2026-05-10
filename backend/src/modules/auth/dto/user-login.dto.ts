import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    description: 'Логин пользователя',
    example: 'user123',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Login is required' })
  @MinLength(1)
  @MaxLength(100)
  login: string;
}

