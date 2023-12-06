# @teleology/migraine

Taking the headache out of db migrations


# Databases:
- postgres
- mysql
- ... @todo more


# Installation:
```
yarn add -D @teleology/migraine 
```

# Usage:

Make sure the environment variable __DATABASE_URL__ is exported in whatever cli you are currently using. 

```bash
export DATABASE_URL='postgres://postgres:admin@localhost:5432/database?schema=public'
```


# Commands

## Show

To view which migrations you already have run:

```
migraine show
```

## Create

Create a `<filename>.up.sql` and `<filename>.down.sql`:

```
migraine create <some random name>
```

*Note: all whitespace and uppercase characters will be converted to a lower snakecase.

## Up

Run __ALL__ migration files not previously ran:

```
migraine up
```

Run a specific number of up migrations:

```
migraine up -c <number>
```

Run a specific migration file:

```
migraine up -m <filename>
```

*Note: Do not include the `.up.sql` portion of the file name


## Down

Revert __ALL__ migration files and drop migraine table:

```
migraine down
```

Revert a specific number of migrations:

```
migraine down -c <number>
```

Revert a specific migration file:

```
migraine down -m <filename>
```

*Note: Do not include the `.down.sql` portion of the file name