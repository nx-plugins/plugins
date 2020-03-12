import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
  scheduleTargetAndForget,
  targetFromTargetString
} from '@angular-devkit/architect';
import { Observable, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NgTailwindBuilderSchema } from './schema';
import * as build from 'ng-tailwindcss/lib/src/build';
import * as watch from 'ng-tailwindcss/lib/src/watch';

export function runBuilder(
  options: NgTailwindBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  return from(
    options.watch
      ? watch({ configPath: options.configPath })
      : build({ purgeFlag: options.purge, configPath: options.configPath })
  ).pipe(
    map(() => ({
      success: true
    })),
    catchError(e => {
      context.logger.error(e.message);
      return of({ success: false });
    })
  );
}

/**
 * @whatItDoes Compile the application using the webpack builder.
 * @param devServerTarget
 * @param context
 * @private
 */
export function startDevServer(
  devServerTarget: string,
  context: BuilderContext
): Observable<string> {
  return scheduleTargetAndForget(
    context,
    targetFromTargetString(devServerTarget),
    {}
  ).pipe(
    map(output => {
      if (!output.success) {
        throw new Error('Could not compile application files');
      }
      return output.baseUrl as string;
    })
  );
}

export default createBuilder(runBuilder);
