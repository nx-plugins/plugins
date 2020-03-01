import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { Observable, of, bindNodeCallback, from } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { NpmBuilderSchema } from './schema';
import { readJsonFile } from '@nrwl/workspace';
import { unlink } from 'fs';
import { exec } from 'child_process';
import { writeJsonFile } from '@nrwl/workspace/src/utils/fileutils';

export function runBuilder(
  options: NpmBuilderSchema,
  { logger, workspaceRoot }: BuilderContext
): Observable<BuilderOutput> {
  logger.info('Start npm deploy builder' + JSON.stringify(options));


  const libraryPackageJson = readJsonFile(options.packageJsonPath);

  const unlinkFileObservable = bindNodeCallback(unlink);
  const execObservable = bindNodeCallback(exec);

  return unlinkFileObservable(options.packageJsonPath).pipe(
    switchMap(()=>{
      return from(executeCommand(logger,`git describe --tags`))
    }),
    map((version) => {
      logger.warn(`The version to use ${version
        }`);
      writeJsonFile(options.outputPath, {
        ...libraryPackageJson,
        version: version.replace('\n',"").replace('v',"")
      });
    }),
    map(()=>{
        return { success: true };
    }),
    tap(() => logger.info('npm copy package ran successfully')),
    catchError(e => {
      logger.error(`Failed to ran npm copy package ${e}`);
      return of({ success: false });
    })
  );
}


function executeCommand(logger, command): Promise<any>{
  var ChildProcess = require('child_process');

  return new Promise((res,rej) => {
    const a  = ChildProcess.exec('git describe --tags');
    a.stdout.on('data', data => {
        logger.info(`Current Tag Version ${data}`);
        res(data);
      });
      a.stderr.on('data', err => {
        logger.error(`There is an error ${err}`);
        res('1.0.0');
      });
  });
}

export default createBuilder(runBuilder);
