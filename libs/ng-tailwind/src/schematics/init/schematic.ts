import {
  chain,
  noop,
  Rule,
  Tree,
  SchematicContext
} from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  readJsonInTree,
  updateJsonInTree
} from '@nrwl/workspace';
import {
  nxPluginsVersion,
  ngTailwingCssVersion,
  tailwingCssVersion
} from '../../../utils/versions';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

function checkDependenciesInstalled(): Rule {
  return (host: Tree, context: SchematicContext): Rule => {
    const packageJson = readJsonInTree(host, 'package.json');
    const dependencyList: { name: string; version: string }[] = [];
    if (!packageJson.devDependencies['@nx-plugins/ng-tailwind']) {
      context.addTask(new NodePackageInstallTask());
      dependencyList.push(
        { name: 'ng-tailwindcss', version: ngTailwingCssVersion },
        { name: 'tailwind-css', version: tailwingCssVersion }
      );
    }

    if (!dependencyList.length) {
      return noop();
    }

    return addDepsToPackageJson(
      {},
      dependencyList.reduce((dictionary, value) => {
        dictionary[value.name] = value.version;
        return dictionary;
      }, {})
    );
  };
}

function installDependencies(
  dependencyList: { name: string; version: string }[]
) {
  return (host: Tree, context: SchematicContext): Rule => {
    return addDepsToPackageJson(
      {},
      dependencyList.reduce((dictionary, value) => {
        context.logger.info(
          '@nrwl-plugins/ng-tailwind dependencies installed successfully'
        );
        dictionary[value.name] = value.version;
        return dictionary;
      }, {})
    );
   
  };
}

function removeDependency() {
  return updateJsonInTree('package.json', json => {
    json.dependencies = json.dependencies || {};
    delete json.dependencies['ng-tailwindcss'];
    delete json.dependencies['tailwind-css'];
    return json;
  });
}

export default function() {
  return chain([removeDependency(), checkDependenciesInstalled()]);
}