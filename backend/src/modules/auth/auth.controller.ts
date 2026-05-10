import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AuthResponseDto, AdminAuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admin/entities/admin.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  // Пользователь: вход
  @Post('user/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход пользователя (только логин)' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  async loginUser(@Body() loginDto: UserLoginDto) {
    return this.authService.loginUser(loginDto);
  }

  // Пользователь: регистрация
  @Post('user/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь создан',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 409, description: 'Пользователь уже существует' })
  async registerUser(@Body() registerDto: UserRegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  // Пользователь: получить текущего пользователя
  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Успешно' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getCurrentUser(@Request() req) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.userId },
    });

    return {
      id: user.id,
      login: user.login,
      total_money: user.total_money,
      created_at: user.created_at,
      last_login: user.last_login,
    };
  }

  // Администратор: вход
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход администратора (логин + пароль)' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    type: AdminAuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async loginAdmin(@Body() loginDto: AdminLoginDto) {
    return this.authService.loginAdmin(loginDto);
  }

  // Администратор: получить текущего администратора
  @Get('admin/me')
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить текущего администратора' })
  @ApiResponse({ status: 200, description: 'Успешно' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getCurrentAdmin(@Request() req) {
    const admin = await this.adminRepository.findOne({
      where: { id: req.user.adminId },
    });

    return {
      id: admin.id,
      login: admin.login,
      created_at: admin.created_at,
      last_login: admin.last_login,
    };
  }
}

