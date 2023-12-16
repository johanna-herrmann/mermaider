#! /usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';

const build = async function (...args) {
};

program
  .description(`Parses md files in input directory and will save the diagrams into input directory (rescursive).
    More Information: https://www.npmjs.com/package/mermaid-builder`)
  .option('-a, --all', 'Re-build all diagrams. This will also build files that already exists (overwrite).')
  .option('-v, --verbose', 'Log files while beeing processed.')
  .argument('<input>', 'The input directory where the MD files are.')
  .argument('<output>', 'The output directory where the diagrams will be saved.')
  .action(build)
  .parse();
