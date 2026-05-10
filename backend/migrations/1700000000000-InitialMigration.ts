import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Таблица: lessons
    await queryRunner.createTable(
      new Table({
        name: 'lessons',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'int',
            isNullable: true,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'lessons',
      new TableIndex({
        name: 'idx_order',
        columnNames: ['order'],
      }),
    );

    await queryRunner.createIndex(
      'lessons',
      new TableIndex({
        name: 'idx_is_active',
        columnNames: ['is_active'],
      }),
    );

    // 2. Таблица: words
    await queryRunner.createTable(
      new Table({
        name: 'words',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'english_word',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'russian_translation',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'lesson_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'audio_file_path',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'audio_file_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'words',
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
        name: 'fk_words_lesson',
      }),
    );

    await queryRunner.createIndex(
      'words',
      new TableIndex({
        name: 'idx_lesson_id',
        columnNames: ['lesson_id'],
      }),
    );

    await queryRunner.createIndex(
      'words',
      new TableIndex({
        name: 'idx_english_word',
        columnNames: ['english_word'],
      }),
    );

    await queryRunner.createIndex(
      'words',
      new TableIndex({
        name: 'idx_russian_translation',
        columnNames: ['russian_translation'],
      }),
    );

    // 3. Таблица: users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'login',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'total_money',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'last_login',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_login',
        columnNames: ['login'],
      }),
    );

    // 4. Таблица: admins
    await queryRunner.createTable(
      new Table({
        name: 'admins',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'login',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'last_login',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // 5. Таблица: level_progress
    await queryRunner.createTable(
      new Table({
        name: 'level_progress',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'lesson_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'level_number',
            type: 'tinyint',
            isNullable: false,
          },
          {
            name: 'best_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0.0,
          },
          {
            name: 'total_correct_answers',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'total_attempts',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_completed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'has_gold_star',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'has_diamond_star',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'first_started_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'last_played_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'level_progress',
      new TableUnique({
        name: 'uk_user_lesson_level',
        columnNames: ['user_id', 'lesson_id', 'level_number'],
      }),
    );

    await queryRunner.createForeignKey(
      'level_progress',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'fk_level_progress_user',
      }),
    );

    await queryRunner.createForeignKey(
      'level_progress',
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
        name: 'fk_level_progress_lesson',
      }),
    );

    await queryRunner.createIndex(
      'level_progress',
      new TableIndex({
        name: 'idx_level_progress_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'level_progress',
      new TableIndex({
        name: 'idx_level_progress_lesson_id',
        columnNames: ['lesson_id'],
      }),
    );

    // 6. Таблица: word_progress
    await queryRunner.createTable(
      new Table({
        name: 'word_progress',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'word_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'lesson_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'level_number',
            type: 'tinyint',
            isNullable: false,
          },
          {
            name: 'is_passed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'correct_count',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'first_correct_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'last_correct_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'word_progress',
      new TableUnique({
        name: 'uk_user_word_level',
        columnNames: ['user_id', 'word_id', 'level_number'],
      }),
    );

    await queryRunner.createForeignKey(
      'word_progress',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'fk_word_progress_user',
      }),
    );

    await queryRunner.createForeignKey(
      'word_progress',
      new TableForeignKey({
        columnNames: ['word_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'words',
        onDelete: 'CASCADE',
        name: 'fk_word_progress_word',
      }),
    );

    await queryRunner.createForeignKey(
      'word_progress',
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
        name: 'fk_word_progress_lesson',
      }),
    );

    await queryRunner.createIndex(
      'word_progress',
      new TableIndex({
        name: 'idx_word_progress_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'word_progress',
      new TableIndex({
        name: 'idx_word_progress_word_id',
        columnNames: ['word_id'],
      }),
    );

    await queryRunner.createIndex(
      'word_progress',
      new TableIndex({
        name: 'idx_word_progress_lesson_level',
        columnNames: ['lesson_id', 'level_number'],
      }),
    );

    await queryRunner.createIndex(
      'word_progress',
      new TableIndex({
        name: 'idx_word_progress_is_passed',
        columnNames: ['is_passed'],
      }),
    );

    // 7. Таблица: rewards
    await queryRunner.createTable(
      new Table({
        name: 'rewards',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'reward_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'lesson_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'word_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'level_number',
            type: 'tinyint',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'rewards',
      new TableUnique({
        name: 'uk_reward_unique',
        columnNames: ['user_id', 'reward_type', 'lesson_id', 'word_id', 'level_number'],
      }),
    );

    await queryRunner.createForeignKey(
      'rewards',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'fk_rewards_user',
      }),
    );

    await queryRunner.createForeignKey(
      'rewards',
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
        name: 'fk_rewards_lesson',
      }),
    );

    await queryRunner.createForeignKey(
      'rewards',
      new TableForeignKey({
        columnNames: ['word_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'words',
        onDelete: 'CASCADE',
        name: 'fk_rewards_word',
      }),
    );

    await queryRunner.createIndex(
      'rewards',
      new TableIndex({
        name: 'idx_rewards_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'rewards',
      new TableIndex({
        name: 'idx_rewards_reward_type',
        columnNames: ['reward_type'],
      }),
    );

    // 8. Таблица: admin_logs
    await queryRunner.createTable(
      new Table({
        name: 'admin_logs',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'admin_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'entity_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'details',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'admin_logs',
      new TableForeignKey({
        columnNames: ['admin_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'admins',
        onDelete: 'SET NULL',
        name: 'fk_admin_logs_admin',
      }),
    );

    await queryRunner.createIndex(
      'admin_logs',
      new TableIndex({
        name: 'idx_admin_id',
        columnNames: ['admin_id'],
      }),
    );

    await queryRunner.createIndex(
      'admin_logs',
      new TableIndex({
        name: 'idx_entity',
        columnNames: ['entity_type', 'entity_id'],
      }),
    );

    await queryRunner.createIndex(
      'admin_logs',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление таблиц в обратном порядке (из-за внешних ключей)
    await queryRunner.dropTable('admin_logs', true);
    await queryRunner.dropTable('rewards', true);
    await queryRunner.dropTable('word_progress', true);
    await queryRunner.dropTable('level_progress', true);
    await queryRunner.dropTable('admins', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('words', true);
    await queryRunner.dropTable('lessons', true);
  }
}

