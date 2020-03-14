import { JsonObject } from '@angular-devkit/core';

export interface NgTailwindBuilderSchema extends JsonObject {
  watch: boolean;
  configPath: string;
  purge: boolean;
}
