import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admin/entities/admin.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  // Пользователь: вход (только логин)
  async loginUser(loginDto: UserLoginDto) {
    let user = await this.userRepository.findOne({
      where: { login: loginDto.login },
    });

    // Если пользователя нет - создаем нового
    if (!user) {
      user = this.userRepository.create({
        login: loginDto.login,
        total_money: 0,
      });
      user = await this.userRepository.save(user);
    } else {
      // Обновляем last_login
      user.last_login = new Date();
      await this.userRepository.save(user);
    }

    const payload = { sub: user.id, login: user.login, type: 'user' };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return {
      user: {
        id: user.id,
        login: user.login,
        total_money: user.total_money,
        created_at: user.created_at,
      },
      token,
    };
  }

  // Пользователь: регистрация
  async registerUser(registerDto: UserRegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { login: registerDto.login },
    });

    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    const user = this.userRepository.create({
      login: registerDto.login,
      total_money: 0,
    });

    const savedUser = await this.userRepository.save(user);

    const payload = { sub: savedUser.id, login: savedUser.login, type: 'user' };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return {
      user: {
        id: savedUser.id,
        login: savedUser.login,
        total_money: savedUser.total_money,
        created_at: savedUser.created_at,
      },
      token,
    };
  }

  // Администратор: вход (логин + пароль)
  async loginAdmin(loginDto: AdminLoginDto) {
    const admin = await this.adminRepository.findOne({
      where: { login: loginDto.login },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Обновляем last_login
    admin.last_login = new Date();
    await this.adminRepository.save(admin);

    const payload = { sub: admin.id, login: admin.login, type: 'admin' };
    const token = this.jwtService.sign(payload, {
      secret: process.env.ADMIN_JWT_SECRET || 'your-admin-secret-key',
      expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1h',
    });

    return {
      admin: {
        id: admin.id,
        login: admin.login,
        created_at: admin.created_at,
        last_login: admin.last_login,
      },
      token,
    };
  }
}

