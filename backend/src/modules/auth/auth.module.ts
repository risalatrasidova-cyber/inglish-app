import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admin/entities/admin.entity';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Admin]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAdminStrategy, JwtAdminGuard],
  exports: [AuthService, JwtAdminGuard],
})
export class AuthModule {}

