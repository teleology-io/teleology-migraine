export const MISSING_DATABASE_URL_ERROR = new Error(
  `Missing DATABASE_URL in environemnt, unable to perform migration`,
);

export const MISSING_CONTROLLER_ERROR = new Error(
  `Missing controller for provider config`,
);
