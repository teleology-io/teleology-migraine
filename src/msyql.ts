/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import mysql, { ConnectionConfig } from 'mysql';
import fs from 'fs';
import path from 'path';
import {
  MigraineController,
  MigraineControllerOptions,
  Migration,
} from './types';

export default class MySqlController implements MigraineController {
  client: mysql.Connection;

  migrations: Migration[] = [];

  migrationDir: string;

  constructor(
    options: ConnectionConfig &
      MigraineControllerOptions & { connectionString?: string },
  ) {
    const {
      connectionString,
      host,
      user,
      password,
      database,
      port,
      migrationDir,
    } = options;

    const connectionOptions = connectionString || {
      host,
      user,
      password,
      database,
      port,
    };

    this.migrationDir = migrationDir;
    this.client = mysql.createConnection(connectionOptions);
  }

  query(qry: string, args: any[] = []) {
    const { client } = this;
    return new Promise((resolve, reject) => {
      client.query(qry, args, (err, result) =>
        err ? reject(err) : resolve(result),
      );
    });
  }

  async init() {
    await this.query(
      `CREATE TABLE IF NOT EXISTS migraine (
      id SERIAL PRIMARY KEY,
      name varchar(255) not null unique,
      created timestamp not null default current_timestamp
    );`,
    );

    this.migrations = await this.query(
      `SELECT * FROM migraine ORDER BY id`,
    ).then((r) => r as Migration[]);
  }

  async up(unresolved: string[]) {
    for (const file of unresolved) {
      const content = fs.readFileSync(
        path.resolve(this.migrationDir, `${file}.up.sql`),
        'utf8',
      );
      await this.query(content);
      await this.query(`INSERT INTO migraine (name) VALUES (?);`, [file]);
    }
  }

  async down(unresolved: string[], dropTable = false) {
    for (const file of unresolved) {
      const content = fs.readFileSync(
        path.resolve(this.migrationDir, `${file}.down.sql`),
        'utf8',
      );

      await this.query(content);
      await this.query(`DELETE FROM migraine WHERE name like ?;`, [file]);
    }

    if (dropTable) {
      await this.query(`drop table if exists migraine`);
    }
  }
}
