import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  renameTemplateFiles,
  move,
  Rule,
  url,
  Tree,
  TypedSchematicContext
} from '@angular-devkit/schematics';
import {
  addProjectToNxJsonInTree,
  names,
  offsetFromRoot,
  projectRootDir,
  ProjectType,
  toFileName,
  updateWorkspace,
  getProjectConfig,
  readWorkspaceConfigPath,
  readWorkspace,
  updateWorkspaceInTree
} from '@nrwl/workspace';
import { NgTailwindSchematicSchema } from './schema';
import { join, normalize } from 'path';

/**
 * Depending on your needs, you can change this to either `Library` or `Application`
 */

interface NormalizedSchema extends NgTailwindSchematicSchema {
  projectName: string;
}

function normalizeOptions(
  options: NgTailwindSchematicSchema
): NormalizedSchema {
  const projectName = toFileName(options.project);
  return {
    ...options,
    projectName
  };
}

function check(options: NormalizedSchema): Rule {
  return (host: Tree, context: TypedSchematicContext<{}, {}>) => {
    const projectConfig = getProjectConfig(host, options.project);
    if (projectConfig.architect.tailwind) {
      throw new Error(
        `${options.project} already has tailwind architect option`
      );
    }
    return host;
  };
}

function generateConfigFiles(options: NormalizedSchema) {
  return (host: Tree, context: TypedSchematicContext<{}, {}>) => {
    const projectConfig = getProjectConfig(host, options.project);

    return mergeWith(
      apply(url(`./files/config/`), [
        applyTemplates({
          ...options
        }),
        move(projectConfig.root)
      ])
    )(host, context);
  };
}

function generateFiles(options: NormalizedSchema) {
  return (host: Tree, context: TypedSchematicContext<{}, {}>) => {
    const projectConfig = getProjectConfig(host, options.project);

    options['ext'] = 'scss';
    return mergeWith(
      apply(url(`./files/src/`), [
        applyTemplates({
          ...options,
          ...names(options.project),
          ext: options.scss ? 'scss' : 'css'
        }),
        move(`${projectConfig.root}/src`)
      ])
    )(host, context);
  };
}

function updateWorkspaceJSON(options: NormalizedSchema): Rule {
  return updateWorkspace(json => {
    const projectConfig = json.projects.get(options.project);

    projectConfig.targets.add({
      name: 'tailwind',
      builder: '@nx-plugins/ng-tailwind:execute',
      options: {
        configPath: join(normalize(projectConfig.root), 'ng-tailwind.js'),
        purge: false
      }
    });
  });
}

export default function(options: NgTailwindSchematicSchema): Rule {
  const normalizedOptions = normalizeOptions(options);
  return chain([
    check(normalizedOptions),
    generateConfigFiles(normalizedOptions),
    generateFiles(normalizedOptions),
    updateWorkspaceJSON(normalizedOptions)
  ]);
}
