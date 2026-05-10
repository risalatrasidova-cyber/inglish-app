import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;

  @ApiProperty()
  total_money: number;

  @ApiProperty()
  created_at: Date;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty()
  token: string;
}

export class AdminResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ nullable: true })
  last_login: Date | null;
}

export class AdminAuthResponseDto {
  @ApiProperty({ type: AdminResponseDto })
  admin: AdminResponseDto;

  @ApiProperty()
  token: string;
}

