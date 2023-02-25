#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

import { Migration, MigraineController } from './types';

const args = process.argv.slice(2);

const MISSING_CONFIG_ERROR = new Error(
  `Missing .migraine.json file, please run 'migraine init' to create one`,
);

const MISSING_CONTROLLER_ERROR = new Error(
  `Missing controller for provider config`,
);

const getConfig = (): any | Error => {
  try {
    return JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), '.migraine.json'), 'utf8'),
    );
  } catch (e) {
    throw MISSING_CONFIG_ERROR;
  }
};

const getController = (config: any): MigraineController => {
  if (config.driver === 'pg') {
    const PostgresController = require('./pg').default;

    return new PostgresController(config);
  }

  throw MISSING_CONTROLLER_ERROR;
};

const getControllerAndMigrationFiles = async () => {
  const config = getConfig();

  const controller = getController(config);
  await controller.init();

  const migrationDir = path.resolve(process.cwd(), config.migrationDir);
  const migrationFiles = fs.readdirSync(migrationDir);

  return {
    migrationFiles,
    controller,
    config,
  };
};

(async () => {
  switch (args[0]) {
    case 'init': {
      const sample = {
        migrationDir: './migrations',
        driver: 'pg',
        host: 'localhost',
        user: 'postgres',
        password: 'example',
        database: 'sample',
        port: 5001,
      };
      fs.writeFileSync(
        path.resolve(process.cwd(), '.migraine.json'),
        JSON.stringify(sample, null, 2),
        'utf8',
      );
      break;
    }
    case 'show': {
      const { controller, migrationFiles } =
        await getControllerAndMigrationFiles();

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

      break;
    }
    case 'create': {
      const config = getConfig();
      if (config instanceof Error) throw MISSING_CONFIG_ERROR;

      const { migrationDir } = config;

      const now = Date.now();
      const filename = args.slice(1).join('_').replace(/ /g, '_').toLowerCase();
      fs.writeFileSync(
        path.resolve(migrationDir, `${now}-${filename}.up.sql`),
        '',
      );
      fs.writeFileSync(
        path.resolve(migrationDir, `${now}-${filename}.down.sql`),
        '',
      );
      break;
    }
    case 'up': {
      const { controller, migrationFiles } =
        await getControllerAndMigrationFiles();

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
      if (args[1] === '-c') {
        const count = parseInt(args[2], 10);
        await controller.up(unresolved.slice(0, count));
      } else if (args[1]) {
        await controller.up(
          unresolved.filter((file) => file.indexOf(args[1]) !== -1),
        );
      } else {
        await controller.up(unresolved);
      }
      break;
    }
    case 'down': {
      const { controller, migrationFiles } =
        await getControllerAndMigrationFiles();

      const migrated = controller.migrations
        .map((it) => it.name)
        .sort()
        .reverse();
      const downFiles = migrationFiles.filter(
        (it) => it.indexOf('.down.sql') !== -1,
      );

      // count
      if (args[1] === '-c') {
        const count = parseInt(args[2], 10);
        await controller.down(migrated.slice(0, count));
      } else if (args[1]) {
        await controller.down(
          migrated.filter((file) => file.indexOf(args[1]) !== -1),
        );
      } else {
        await controller.down(migrated, downFiles.length === migrated.length);
      }
      break;
    }
    default: {
      // do nothing
    }
  }

  process.exit(0);
})();
