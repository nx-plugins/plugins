import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { NgTailwindSchematicSchema } from './schema';
import {
  updateJsonInTree,
  readJsonInTree,
  readWorkspace
} from '@nrwl/workspace';
import { readWorkspaceFiles } from '@nrwl/workspace/src/core/file-utils';

describe('ng-tailwind schematic', () => {
  let appTree: Tree;
  const options: NgTailwindSchematicSchema = {
    project: 'sample-app',
    scss: true,
    purge: false
  };

  const testRunner = new SchematicTestRunner(
    '@nx-plugins/ng-tailwind',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(async () => {
    appTree = Tree.empty();

    appTree = createEmptyWorkspace(Tree.empty());

    appTree = await testRunner
      .callRule(
        updateJsonInTree('workspace.json', json => {
          json.projects['sample-app'] = {
            root: 'apps/sample-app',
            architect: {
              lint: {
                builder: '@angular-devkit/build-angular:tslint',
                options: {
                  tsConfig: []
                }
              }
            }
          };
          return json;
        }),
        appTree
      )
      .toPromise();

    appTree = await testRunner
      .callRule(
        updateJsonInTree('apps/sample-app/tsconfig.json', json => {
          return {
            compilerOptions: {
              types: []
            }
          };
        }),
        appTree
      )
      .toPromise();
  });

  it('should run successfully', async () => {
    const resultTree = await testRunner
      .runSchematicAsync('tailwind-project', options, appTree)
      .toPromise();

    expect(resultTree.files).toMatchSnapshot(
      expect.arrayContaining([
        '/apps/sample-app/ng-tailwind.js',
        '/apps/sample-app/tailwind.config.js',
        '/apps/sample-app/src/tailwind.scss'
      ])
    );

    const moduleContent = resultTree.readContent(
      '/apps/sample-app/ng-tailwind.js'
    );
    expect(moduleContent).toMatchSnapshot();
    // const tailwindConfig = readJsonInTree(resultTree, 'apps/sample-app/ng-tailwind.js');

    // console.warn(resultTree.readContent('/apps/sample-app/tailwind.config2.js'))
    // expect(resultTree.readContent('/apps/sample-app2/ng-tailwind2.js')).toEqual("aaaa");
    // await expect(

    // ).resolves.not.toThrowError();
  });
});
