import { JsonObject } from '@angular-devkit/core';

export interface NpmBuilderSchema extends JsonObject {
    packageJsonPath: string;
    outputPath: string;
}
