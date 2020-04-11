import { JsonObject } from '@angular-devkit/core';

export interface NpmDeployBuilderSchema extends JsonObject {
  packageJsonPath: string;
  access: string;
  syncPackage: boolean;
  ignoreScripts: boolean;
}
