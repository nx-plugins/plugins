import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
  scheduleTargetAndForget,
  targetFromTargetString
} from '@angular-devkit/architect';
import { Observable, of, from, noop } from 'rxjs';
import { map, tap, take, catchError } from 'rxjs/operators';
import { NgTailwindBuilderSchema } from './schema';
import * as build from 'ng-tailwindcss/lib/build';
import * as watch from 'ng-tailwindcss/lib/watch';
import { render } from 'node-sass';
import { normalize, resolve } from 'path';
import { existsSync } from 'fs';

export function runBuilder(
  options: NgTailwindBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  {
    success: true;
  }
  context.logger.info('Builder start for ng-tailwind', { options });
  return from(selectMode(options)).pipe(
    options.mode === 'watch' ? tap(noop) : take(1),
    catchError(e => {
      context.logger.error('Failed to ran tailwind', e);
      return of({ success: false });
    })
  );
  // try {
  //   selectMode(options);
  //   context.logger.info('Builder ran for ng-tailwind');
  // } catch (e) {
  //   return of({ success: false });
  // }
}

function selectMode(
  options: NgTailwindBuilderSchema
): Observable<BuilderOutput> {
  return from(
    options.mode === 'watch'
      ? watch({ configPath: options.configPath })
      : build({
          purgeFlag: options.purge,
          configPath: options.configPath
        })
  ).pipe(
    map(result => ({
      success: true
    }))
  );
}

export default createBuilder(runBuilder);
