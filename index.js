#! /usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import mermaidParse from 'mermaid-parse';
import fs from 'fs/promises';

const NEW_LINE = process.platform === 'win32' ? '\r\n' : '\n';

const printSuccess = function (text) {
  process.stdout.write(chalk.green.bold(`${text}${NEW_LINE}`));
};

const printError = function (text, stderr) {
  const writer = stderr ? process.stderr : process.stdout;
  writer.write(chalk.red.bold(`${text}${NEW_LINE}`));
};

const printFilename = function (filename) {
  process.stdout.write(chalk.bold(filename));
};

const mdToDiagram = async function(md) {
  const definition = md.replace(/^```mermaid\s(.*)```$/s, '$1');
  return await mermaidParse(definition, { extension: 'svg' });
};

const fileExists = async function (path) {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
}

const checkDirectories = async function (input, output) {
  const inputExists = await fileExists(input);
  const outputExists = await fileExists(output);
  const inputStats = inputExists && await fs.stat(input);
  const outputStats = outputExists && await fs.stat(output);
  if (!inputExists || !inputStats.isDirectory()) {
    printError('input does not exist or is not a directory.', true);
    process.exit(1);
  }
  if (!outputExists || !outputStats.isDirectory()) {
    printError('output does not exist or is not a directory.', true);
    process.exit(1);
  }
};

const buildFiles = async function (input, output, all, verbose) {
  await checkDirectories(input, output);

  const fileNames = await fs.readdir(input);
  
  for (const fileName of fileNames) {
    const filePath = `${input}/${fileName}`;
    const fileStats = await fs.stat(filePath);
    const diagramPath = `${output}/${fileName.replace(/\.md$/, '.svg')}`;
    const diagramExists = await fileExists(diagramPath);
    const skip = diagramExists && !all;
    if (!fileStats.isFile() || !fileName.endsWith('.md') || skip) {
      continue;
    }
    if (verbose) printFilename(fileName);
    try {
      const md = await fs.readFile(filePath, 'utf8');
      const diagram = await mdToDiagram(md);
      await fs.writeFile(diagramPath, diagram, 'utf8');
      if (verbose) printSuccess(' OK');
    } catch (err) {
      if (verbose) printError(' Error', false);
      printError(`${fileName}: ${err.message}`, true);
    }
  }
};

const build = async function (...args) {
  const [input, output, options] = args;
  const all = options.all ?? false;
  const verbose = options.verbose ?? false;

  await buildFiles(input, output, all, verbose);
};

program
  .description(`Reads md files in input directory and saves the diagrams (svg) into output directory.
    More Information: https://www.npmjs.com/package/mermaider`)
  .option('-a, --all', 'Re-build all diagrams. This will also build files that already exists (overwrite).')
  .option('-v, --verbose', 'Log files while beeing processed.')
  .argument('<input>', 'The input directory where the MD files are.')
  .argument('<output>', 'The output directory where the diagrams will be saved.')
  .action(build)
  .parse();

export { build };
