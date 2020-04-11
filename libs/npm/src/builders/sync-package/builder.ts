import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { Observable, of, bindNodeCallback, from } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { NpmBumpBuilderSchema } from './schema';
import { readJsonFile } from '@nrwl/workspace';
import { unlink } from 'fs';
import { exec } from 'child_process';
import { writeJsonFile } from '@nrwl/workspace/src/utils/fileutils';

export function runBuilder(
  options: NpmBumpBuilderSchema,
  { logger, workspaceRoot }: BuilderContext
): Observable<BuilderOutput> {
  logger.info('Start npm deploy builder' + JSON.stringify(options));

  return bumpVersion(logger, options).pipe(
    map(() => {
      return { success: true };
    }),
    tap(() => logger.info('npm copy package ran successfully')),
    catchError(e => {
      logger.error(`Failed to ran npm copy package ${e}`);
      return of({ success: false });
    })
  );
}

export function bumpVersion(logger, options: NpmBumpBuilderSchema) {
  const libraryPackageJson = readJsonFile(options.packageJsonPath);

  const unlinkFileObservable = bindNodeCallback(unlink);
  const execObservable = bindNodeCallback(exec);
  return unlinkFileObservable(options.packageJsonPath).pipe(
    switchMap(() => {
      return from(execObservable(`git tag | tail -1`));
    }),
    map(([version, output]: [string, string]) => {
      logger.warn(`The version to use is ${version}`);
      writeJsonFile(options.packageJsonPath, {
        ...libraryPackageJson,
        version: version.replace('\n', '')
      });
    })
  );
}

export default createBuilder(runBuilder);
