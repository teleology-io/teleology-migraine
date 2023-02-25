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

Start off by creating a `.migraine.json` configuration file by running the following script:

```
migraine init
```

This will create a sample configuration for your database. 


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

*Note: all whitespace and uppercase characters will be converted.

## Up

Run ALL migration files not previously ran:

```
migraine up
```

Run a specific number of up migrations:

```
migraine up -c <number>
```

Run a specific migration file:

```
migraine up <filename>
```

*Note: Do not include the `.up.sql` portion of the file name


## Down

Revert ALL migration files and drop migraine table:

```
migraine down
```

Revert a specific number of migrations:

```
migraine down -c <number>
```

Revert a specific migration file:

```
migraine down <filename>
```

*Note: Do not include the `.down.sql` portion of the file name