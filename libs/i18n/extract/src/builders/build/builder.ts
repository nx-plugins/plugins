import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import { exec } from 'child_process';
import { bindNodeCallback, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ExtractBuilderSchema } from './schema';
import { getWorkspaceGraph, extractPluralInFiles, extractTransUnitsInFiles, getNodesFiles, getProjectDeps, getProjectDepsFiles, getTranslations, managePlural, manageTrans, writeTranslationFile } from './utils';
import { calculateProjectDependencies } from '@nrwl/workspace/src/utils/buildable-libs-utils';
import { createProjectGraph, onlyWorkspaceProjects, ProjectGraph, ProjectGraphNode } from '@nrwl/workspace/src/core/project-graph';
import { generateGraph } from '@nrwl/workspace/src/command-line/dep-graph';


export function runBuilder(
  options: ExtractBuilderSchema,
  context: BuilderContext
): Observable<any> {

  context.logger.error('');

  // const projects = Object.values(graph.nodes) as ProjectGraphNode[];
  // projects.sort((a, b) => {
  //   return a.name.localeCompare(b.name);
  // });
  // context.logger.info(JSON.stringify(graph));
  // context.logger.info(JSON.stringify(projects));

  from(extractor(options, context))
  return of({ success: true }).pipe(
    tap(() => {
      context.logger.info('Builder ran for build');
    })
  );
}

async function extractor(options: ExtractBuilderSchema, context: BuilderContext) {
  try {
    const depGraph = getWorkspaceGraph() as ProjectGraph;
    const projectDeps = getProjectDeps(depGraph, context.target.project);
    const appTsxFiles = getNodesFiles(depGraph, context.target.project, '.tsx', '.spec');
    const projectDepsTsxFiles = getProjectDepsFiles(depGraph, projectDeps, '.tsx', '.spec').flat();
    const transUnitsApp = extractTransUnitsInFiles(appTsxFiles);
    const transUnitsProjectDeps = extractTransUnitsInFiles(projectDepsTsxFiles);
    const pluralsApp = extractPluralInFiles(appTsxFiles);
    const pluralsProjectsDeps = extractPluralInFiles(projectDepsTsxFiles);
    context.logger.info("transUnitsApp", { transUnitsApp });


    options.locales.map((locale) => {
      context.logger.info("Running extract for locale", { locale });
      const translations = getTranslations(options.directory, locale);

      const translationsUnitsApp = manageTrans(transUnitsApp, translations);
      const translationsUnitsProjectDeps = manageTrans(transUnitsProjectDeps, translations);
      const translationsPluralsApp = managePlural(pluralsApp, translations);
      const translationsPluralsProjectsDeps = managePlural(pluralsProjectsDeps, translations);
      writeTranslationFile(options.directory, { ...translationsUnitsApp, ...translationsUnitsProjectDeps, ...translationsPluralsApp, ...translationsPluralsProjectsDeps }, locale);
    });

    return { success: true };
  }
  catch (e) {
    throw new Error(e);
  }
}



export default createBuilder(runBuilder);
