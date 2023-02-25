# @teleology/migraine

Taking the headache out of db migrations


# Databases:
- postgres
- ... @todo more


# Installation:
```
yarn add -D @teleology/migraine 
```

# Usage:

Start off by creating `.migraine.json` configuration file by running the following script:

```
yarn migraine init
```

This will create a sample configuration for your databases. 


# Commands

## Show

To view which migrations you already have run:

```
yarn migraine show
```

## Create

Create a `<filename>.up.sql` and `<filename>.down.sql`:

```
yarn migraine create <some random name>
```

*Note: all whitespace and uppercase characters will be converted.

## Up

Run ALL migration files not previously ran:

```
yarn migraine up
```

Run a specific number of up migrations:

```
yarn migraine up -c <number>
```

Run a specific migration file:

```
yarn migraine up <filename>
```

*Note: Do not include the `.up.sql` portion of the file name


## Down

Revert ALL migration files and drop migraine table:

```
yarn migraine down
```

Revert a specific number of migrations:

```
yarn migraine down -c <number>
```

Revert a specific migration file:

```
yarn migraine down <filename>
```

*Note: Do not include the `.down.sql` portion of the file name