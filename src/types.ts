/* eslint-disable no-unused-vars */
export interface Migration {
  id: string;
  name: string;
  created: string;
}

export interface MigraineController {
  migrations: Migration[];
  init: () => Promise<void>;
  up: (unresolved: string[]) => Promise<void>;
  down: (unresolved: string[], dropTable?: boolean) => Promise<void>;
}

export interface MigraineControllerOptions {
  migrationDir: string;
}
