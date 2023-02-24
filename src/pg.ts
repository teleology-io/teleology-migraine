/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { Pool, PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';
import {
  MigraineController,
  MigraineControllerOptions,
  Migration,
} from './types';

export default class PostgresController implements MigraineController {
  pool: Pool;

  migrationDir: string;

  migrations: Migration[] = [];

  constructor(options: PoolConfig & MigraineControllerOptions) {
    const { migrationDir, ...connectionOptions } = options;
    
    this.pool = new Pool(connectionOptions);
    this.migrationDir = migrationDir;
  }

  async init() {
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS migraine (
      id SERIAL PRIMARY KEY,
      name text not null unique,
      created timestamp not null default current_timestamp
    );`,
    );

    this.migrations = await this.pool
      .query(`SELECT * FROM MIGRAINE ORDER BY id`)
      .then(({ rows }: { rows: Migration[] }) => rows);
  }

  async up(unresolved: string[]) {
    for (const file of unresolved) {
      const content = fs.readFileSync(
        path.resolve(this.migrationDir, `${file}.up.sql`),
        'utf8',
      );
      await this.pool.query(content);
      await this.pool.query(`INSERT INTO migraine (name) VALUES ($1);`, [file]);
    }
  }

  async down(unresolved: string[], dropTable = false) {
    for (const file of unresolved) {
      const content = fs.readFileSync(
        path.resolve(this.migrationDir, `${file}.down.sql`),
        'utf8',
      );

      await this.pool.query(content);
      await this.pool.query(`DELETE FROM migraine WHERE name like $1;`, [file]);
    }

    if (dropTable) {
      await this.pool.query(`drop table if exists migraine`);
    }
  }
}
