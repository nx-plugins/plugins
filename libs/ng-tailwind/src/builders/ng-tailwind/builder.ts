import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { Observable, of, noop } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NgTailwindBuilderSchema } from './schema';
import * as build from 'ng-tailwindcss/lib/build';
import * as watch from 'ng-tailwindcss/lib/watch';

export function runBuilder(
  options: NgTailwindBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  context.logger.info('Builder start for ng-tailwind', { options });
  try {
    this.selectMode(options);
    context.logger.info('Builder ran for ng-tailwind');
    return of({ success: true });
  } catch (e) {
    return of({ success: false });
  }
}

function selectMode(options: NgTailwindBuilderSchema) {
  switch (options.mode) {
    case "watch": {
      return watch({ configPath: options.configPath });
    }
    default: {
      console.warn(build.toString());
      return build({ purgeFlag: options.purge, configPath: options.configPath });
    }
  }
}

export default createBuilder(runBuilder);
