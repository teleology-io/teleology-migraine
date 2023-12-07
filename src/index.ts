#!/usr/bin/env node
/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import path from 'path';

import { MigraineController, Migration } from './types';

import parse from './args';
import MySqlController from './msyql';
import PostgresController from './pg';

import * as errors from './errors';

const args = parse();

const getController = ({
  migrationDir,
}: {
  migrationDir: string;
}): MigraineController => {
  if (process.env.DATABASE_URL?.includes('postgres')) {
    return new PostgresController({
      connectionString: process.env.DATABASE_URL,
      migrationDir,
    });
  }

  if (process.env.DATABASE_URL?.includes('mysql')) {
    return new MySqlController({
      connectionString: process.env.DATABASE_URL,
      migrationDir,
    });
  }

  throw errors.MISSING_CONTROLLER_ERROR;
};

(async () => {
  try {
    if (!process.env.DATABASE_URL) throw errors.MISSING_DATABASE_URL_ERROR;

    if (!args.directory) {
      console.warn(`No migration directory found, defaulting to /migrations`);
    }

    const migrationDir = path.resolve(
      process.cwd(),
      args.directory || 'migrations',
    );

    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }

    const migrationFiles = fs.readdirSync(migrationDir);

    const controller = getController({ migrationDir });
    await controller.init();

    if (args._unknown?.includes('show')) {
      const migrated = controller.migrations
        .map((it: Migration) => it.name)
        .sort();

      const upFiles = migrationFiles
        .filter((it) => it.indexOf('.up.') !== -1)
        .map((it) => it.replace('.up.sql', ''))
        .sort();

      console.log(`\nMigration(s):\n`);
      for (const name of upFiles) {
        const m = migrated.indexOf(name) !== -1;
        if (m) {
          console.log(`  [x] ${name}`);
        } else {
          console.log(`  [ ] ${name}`);
        }
      }
      console.log(``);
    }
    if (args._unknown?.includes('create')) {
      const now = Date.now();
      const filename = args._unknown
        .slice(1)
        .join('_')
        .replace(/ /g, '_')
        .toLowerCase();
      fs.writeFileSync(
        path.resolve(migrationDir, `${now}-${filename}.up.sql`),
        '',
      );
      fs.writeFileSync(
        path.resolve(migrationDir, `${now}-${filename}.down.sql`),
        '',
      );
    }
    if (args._unknown?.includes('up')) {
      const migrated = controller.migrations
        .map((it: Migration) => it.name)
        .sort();

      const upFiles = migrationFiles
        .filter((it) => it.indexOf('.up.') !== -1)
        .map((it) => it.replace('.up.sql', ''))
        .sort();

      const unresolved = upFiles.filter(
        (file) => !migrated.some((mfile) => file.indexOf(mfile) !== -1),
      );

      // count
      if (args.count) {
        await controller.up(unresolved.slice(0, args.count));
      } else if (args.migration) {
        await controller.up(
          unresolved.filter((file) => file.indexOf(args.migration) !== -1),
        );
      } else {
        await controller.up(unresolved);
      }
    }
    if (args._unknown?.includes('down')) {
      const migrated = controller.migrations
        .map((it) => it.name)
        .sort()
        .reverse();
      const downFiles = migrationFiles.filter(
        (it) => it.indexOf('.down.sql') !== -1,
      );

      // count
      if (args.count) {
        const count = parseInt(args[2], 10);
        await controller.down(migrated.slice(0, count));
      } else if (args.migration) {
        await controller.down(
          migrated.filter((file) => file.indexOf(args.migration) !== -1),
        );
      } else {
        await controller.down(migrated, downFiles.length === migrated.length);
      }
    }
  } catch (e) {
    console.error((e as Error).message);
  } finally {
    process.exit(0);
  }
})();
