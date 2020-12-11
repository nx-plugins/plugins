import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { I18nExtractSchematicSchema } from './schema';

describe.skip('i18n--extract schematic', () => {
  let appTree: Tree;
  const options: I18nExtractSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@nx-plugins/i18n--extract',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner
        .runSchematicAsync('i18n--extract', options, appTree)
        .toPromise()
    ).resolves.not.toThrowError();
  });
});
