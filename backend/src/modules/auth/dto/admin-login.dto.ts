import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Логин администратора',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty({ message: 'Login is required' })
  @MinLength(1)
  login: string;

  @ApiProperty({
    description: 'Пароль администратора',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(1)
  password: string;
}

