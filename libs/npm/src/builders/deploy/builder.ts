import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { Observable, of, bindNodeCallback } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { NpmDeployBuilderSchema } from './schema';
import { exec } from 'child_process';
import { bumpVersion as syncPackage } from '../sync-package/builder';

export function runBuilder(
  options: NpmDeployBuilderSchema,
  { logger, workspaceRoot }: BuilderContext
): Observable<BuilderOutput> {
  logger.info('Start npm deploy builder' + JSON.stringify(options));
  const command = `npm publish ${options.packageJsonPath.replace(
    'package.json',
    ''
  )} --access ${options.access} ${
    options.ignoreScripts ? '--ignore-scripts' : ''
  }`;

  const execObservable = bindNodeCallback(exec);
  return from(
    options.syncPackage
      ? syncPackage(logger, { packageJsonPath: options.packageJsonPath })
      : null
  ).pipe(
    switchMap(() => {
      return execObservable(command).pipe(
        map(() => {
          logger.info('npm deploy ran successfully');
          return { success: true };
        }),
        catchError(e => {
          logger.error(`Failed to ran npm deploy ${e}`);
          return of({ success: false });
        })
      );
    })
  );
}

export default createBuilder(runBuilder);
