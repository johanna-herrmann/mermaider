import { assert } from 'assertthat';
import fs from 'fs/promises';

const fileExists = async function (path) {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
};

const getFileContent = async function (path) {
  const exists = await fileExists(path);
  return exists ? await fs.readFile(path, 'utf8') : '';
};

describe('mermaider', () => {
  describe('build', () => {

    // removes specific diagram id, cause this is always a new one
    const generalize = function (diagram) {
      return diagram
        .replace(/id="mermaid-[0-9]+"/, 'id="mermaid-id"')
        .replace(/#mermaid-[0-9]+/g, '#mermaid-id');
    };

    const getActualDiagramContent = async function (name, location) {
      const diagramPath = `./out/${location}/${name}`;
      return await getFileContent(diagramPath);
    };

    const assertDiagram = async function (name, location) {
      const diagram = await getActualDiagramContent(name, location);
      const expectedDiagram = await getFileContent(`./fixtures/${name}`);

      assert.that(generalize(diagram)).is.equalTo(generalize(expectedDiagram));
    };

    test('builds all diagrams initially.', async () => {
      await assertDiagram('forms-and-links.svg', 'init');
      await assertDiagram('sequenceWithActors.svg', 'init');
      await assertDiagram('simple.svg', 'init');
      await assertDiagram('subgraphs.svg', 'init');
    });

    test('does override, if --all IS set.', async () => {
      await assertDiagram('forms-and-links.svg', 'all');
      await assertDiagram('sequenceWithActors.svg', 'all');
      await assertDiagram('simple.svg', 'all');
      await assertDiagram('subgraphs.svg', 'all');
    });

    test('does not override, if --all is NOT set.', async () => {
      const actualSimple = await getActualDiagramContent('simple.svg', 'notAll');
      await assertDiagram('forms-and-links.svg', 'notAll');
      await assertDiagram('sequenceWithActors.svg', 'notAll');
      await assertDiagram('subgraphs.svg', 'notAll');
      assert.that(actualSimple).is.equalTo('modified\n');
    });

    test('still builds valid diagrams, if one is invalid.', async () => {
      const invalidExists = await fileExists('out/invalid.svg');
      await assertDiagram('simple.svg', 'oneInvalid');
      assert.that(invalidExists).is.false();
    });
  });

  describe('command', () => {
    const assertFilesEqual = async function (name) {
      const expected = await getFileContent(`fixtures/outs/${name}`);
      const actual = await getFileContent(`out/${name}`);
      assert.that(actual).is.equalTo(expected);
    };

    const assertEmpty = async function (name) {
      const actual = await getFileContent(`out/${name}`);
      assert.that(actual.trim()).is.empty();
    }

    test('outputs nothing on success, if --verbose is NOT set.', async () => {
      await assertEmpty('notVerbose.out');
    });

    test('outputs 4 md files with OK on success, if --verbose IS set.', async () => {
      await assertFilesEqual('verbose.out');
    });

    test('outputs inputDirectoryError to stderr, if input directory is missing or not a directory.', async () => {
      await assertFilesEqual('invalidIn0.err');
      await assertFilesEqual('invalidIn1.err');
      await assertEmpty('invalidIn0.out');
      await assertEmpty('invalidIn1.out');
    });

    test('outputs outputDirectoryError to stderr, if output directory is missing or not a directory.', async () => {
      await assertFilesEqual('invalidOut0.err');
      await assertFilesEqual('invalidOut1.err');
      await assertEmpty('invalidOut0.out');
      await assertEmpty('invalidOut1.out');
    });

    test('outputs missingArgumentError to stderr, if argument is missing.', async () => {
      await assertFilesEqual('missingArgs0.err');
      await assertFilesEqual('missingArgs1.err');
      await assertEmpty('missingArgs0.out');
      await assertEmpty('missingArgs1.out');
    });
    
    test('outputs only build errors, if --verbose is NOT set.', async () => {
      await assertFilesEqual('oneInvalid.err');
      await assertEmpty('oneInvalid.out');
    });

    test('outputs build errors and success separated, if --verbose IS set.', async () => {
      await assertFilesEqual('oneInvalidVerbose.err');
      await assertFilesEqual('oneInvalidVerbose.out');
      await assertFilesEqual('oneInvalidVerbose.both');
    });

    test('outputs build errors and success correctly formatted.', async () => {
      await assertFilesEqual('oneInvalidVerboseFormatted.both');
    });

    test('outputs correct help text on --help.', async () => {
      await assertFilesEqual('help.out');
    });
  });
});
