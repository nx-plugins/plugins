import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { NpmSchematicSchema } from './schema';

describe('npm schematic', () => {
  let appTree: Tree;
  const options: NpmSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@nx-plugins/npm',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner.runSchematicAsync('npm', options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
