import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../modules/admin/entities/admin.entity';
import { AppDataSource } from '../config/data-source';

async function createAdmin() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const adminRepository = AppDataSource.getRepository(Admin);

    // Параметры администратора (можно передать через аргументы командной строки)
    const login = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';

    // Проверка существования администратора
    const existingAdmin = await adminRepository.findOne({
      where: { login },
    });

    if (existingAdmin) {
      console.log(`Admin with login "${login}" already exists`);
      await AppDataSource.destroy();
      return;
    }

    // Хеширование пароля
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создание администратора
    const admin = adminRepository.create({
      login,
      password_hash: passwordHash,
    });

    await adminRepository.save(admin);

    console.log(`✅ Admin created successfully!`);
    console.log(`Login: ${login}`);
    console.log(`Password: ${password}`);
    console.log(`\n⚠️  Remember to change the password after first login!`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

