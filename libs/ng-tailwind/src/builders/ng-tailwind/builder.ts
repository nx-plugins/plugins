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
  return of({ success: true }).pipe(
    tap(() => {
      try{
        this.selectMode(options);
        context.logger.info('Builder ran for ng-tailwind');
        return { success: true };
      }catch(e){
        return of({ success: false });
      }
    })
  );
}

function selectMode(options: NgTailwindBuilderSchema){
  switch(options.mode){
    case "build":{
      build({ purgeFlag: options.purge, configPath: options.configPath });
    }
    case "watch":{
      watch({ configPath: options.configPath });
    }
  }
}

export default createBuilder(runBuilder);
