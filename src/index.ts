import fs from 'fs';
import path from 'path';

import PostgresController from './pg';
import { Migration } from './types';

const migrationDir = path.resolve(process.cwd(), 'migrations');
if (!fs.existsSync(migrationDir)) {
  throw new Error(`Migrations directory not found`);
}

if (!process.env.DATABASE_URL) {
  throw new Error(`Required DATABASE_URL environemnt variable not detected`);
}

const args = process.argv.slice(2);

const migrationFiles = fs.readdirSync(migrationDir);

const controller = new PostgresController({
  connectionString: process.env.DATABASE_URL,
  migrationDir,
});

(async () => {
  switch (args[0]) {
    case 'show': {
      await controller.init();

      const migrated = controller.migrations
        .map((it: Migration) => it.name)
        .sort();


      const upFiles = migrationFiles
        .filter((it) => it.indexOf('.up.') !== -1)
        .map((it) => it.replace('.up.sql', ''))
        .sort();

      console.log(`\nMigration(s):\n`)
      for (const name of upFiles) {
        const m = migrated.indexOf(name) !== -1
        if (m) {
          console.log(`  [x] ${name}`) 
        } else {
          console.log(`  [ ] ${name}`) 
        }
      }
      console.log(``)

      break;
    }
    case 'create': {
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
      await controller.init();

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
      await controller.init();

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
