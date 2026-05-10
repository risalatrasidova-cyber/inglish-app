import { AppDataSource } from '../config/data-source';
import { User } from '../modules/users/entities/user.entity';
import { Reward } from '../modules/progress/entities/reward.entity';
import { WordProgress } from '../modules/progress/entities/word-progress.entity';
import { LevelProgress } from '../modules/progress/entities/level-progress.entity';

/**
 * Обнуляет игровые «рубли» и историю наград.
 * Без аргумента — для всех пользователей.
 * С логином — только для этого пользователя: npm run reset:money -- mylogin
 * С флагом --full также очищается прогресс по словам/уровням (как «с нуля»):
 *   npm run reset:money -- --full
 *   npm run reset:money -- mylogin --full
 *
 * Зачем чистить rewards: иначе сервер считает, что бонус за слово/уровень уже выдан,
 * и не начислит снова при том же total_money = 0.
 */
async function main() {
  const argv = process.argv.slice(2).filter((a) => a.length > 0);
  const fullReset = argv.includes('--full');
  const login = argv.find((a) => a !== '--full')?.trim();

  try {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const rewardRepo = AppDataSource.getRepository(Reward);
    const wordProgressRepo = AppDataSource.getRepository(WordProgress);
    const levelProgressRepo = AppDataSource.getRepository(LevelProgress);

    if (login) {
      const user = await userRepo.findOne({ where: { login } });
      if (!user) {
        console.error(`Пользователь с логином "${login}" не найден.`);
        process.exit(1);
      }
      await rewardRepo.delete({ user_id: user.id });
      await userRepo.update({ id: user.id }, { total_money: 0 });
      if (fullReset) {
        await wordProgressRepo.delete({ user_id: user.id });
        await levelProgressRepo.delete({ user_id: user.id });
      }
      console.log(
        `Готово: баланс 0 и награды очищены для «${login}».` +
          (fullReset ? ' Прогресс по словам/уровням обнулён.' : ''),
      );
    } else {
      await rewardRepo.clear();
      await AppDataSource.manager.query('UPDATE users SET total_money = 0');
      if (fullReset) {
        await wordProgressRepo.clear();
        await levelProgressRepo.clear();
      }
      console.log(
        'Готово: у всех пользователей баланс 0, таблица наград пуста.' +
          (fullReset ? ' Прогресс по словам/уровням обнулён.' : ''),
      );
    }

    await AppDataSource.destroy();
  } catch (e) {
    console.error('Ошибка:', e);
    process.exit(1);
  }
}

main();
