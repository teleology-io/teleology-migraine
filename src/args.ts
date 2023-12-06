import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

const OPTIION_DEFINITIONS = [
  { name: 'directory', alias: 'd', type: String },
  { name: 'count', alias: 'c', type: Number },
  { name: 'migration', alias: 'm', type: String },
  { name: 'help', alias: 'h', type: Boolean },
];

export default function parse() {
  const options = commandLineArgs(OPTIION_DEFINITIONS, {
    partial: true,
    stopAtFirstUnknown: false,
  });

  if (options.help) {
    const helpSections = [
      {
        header: '@teleolgy/migraine',
        content: 'Taking the headache out of db migrations.',
      },
      {
        header: 'Options',
        optionList: [
          {
            name: 'directory',
            alias: 'd',
            typeLabel: '{underline file}',
            description: 'Where migration files exist',
          },
          {
            name: 'count',
            alias: 'c',
            typeLabel: '{underline int}',
            description: 'The number of migrations to run, defaults to all',
          },
          {
            name: 'migration',
            alias: 'm',
            typeLabel: '{underline string}',
            description: 'The non-suffixed name of a specific migration to run',
          },
          {
            name: 'help',
            alias: 'h',
            typeLabel: '{underline boolean}',
            description: 'Print this usage guide.',
          },
        ],
      },
    ];

    console.log(commandLineUsage(helpSections));
  }

  return options;
}
