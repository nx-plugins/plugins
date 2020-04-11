import { JsonObject } from '@angular-devkit/core';

export interface NpmBumpBuilderSchema extends JsonObject {
    packageJsonPath: string;
}
