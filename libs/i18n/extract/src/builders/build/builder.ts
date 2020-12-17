import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { exec } from 'child_process';
import { bindNodeCallback, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ExtractBuilderSchema } from './schema';
import { executeDepGraph, extractPluralInFiles, extractTransUnitsInFiles, getNodesFiles, getProjectDeps, getProjectDepsFiles, getTranslations, managePlural, manageTrans, writeTranslationFile } from './utils';

export function runBuilder(
  options: ExtractBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {

  context.logger.error('');

  from(extractor)
  return of({ success: true }).pipe(
    tap(() => {
      context.logger.info('Builder ran for build');
    })
  );
}

async function extractor(options: ExtractBuilderSchema) {
  try {
    const depGraph = await executeDepGraph(options.project)
    const projectDeps = getProjectDeps(depGraph, options.project);
    const appTsxFiles = getNodesFiles(depGraph, options.project, '.tsx', '.spec');
    const projectDepsTsxFiles = getProjectDepsFiles(depGraph, projectDeps, '.tsx', '.spec').flat();
    const transUnitsApp = extractTransUnitsInFiles(appTsxFiles);
    const transUnitsProjectDeps = extractTransUnitsInFiles(projectDepsTsxFiles);
    const pluralsApp = extractPluralInFiles(appTsxFiles);
    const pluralsProjectsDeps = extractPluralInFiles(projectDepsTsxFiles);

    options.locales.map((locale) => {
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
