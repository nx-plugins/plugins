import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { Observable, of, from } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
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
  context.logger.info('Builder start for ng-tailwind', { options });
  return from(selectMode(options)).pipe(
    map(() => ({ success: true })),
    tap(() => context.logger.warn('Mutation Tests ran successfully')),
    catchError(e => {
      context.logger.error('Failed to ran mutation tests', e);
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

function selectMode(options: NgTailwindBuilderSchema) {
  return new Promise((res, rej) => {
    switch (options.mode) {
      case 'watch': {
        return watch({ configPath: options.configPath });
      }
      default: {
        build({
          purgeFlag: options.purge,
          configPath: options.configPath
        })
          .then(response => res(response))
          .catch(e => {
            rej(e);
          });
      }
    }
  });
}

export default createBuilder(runBuilder);
