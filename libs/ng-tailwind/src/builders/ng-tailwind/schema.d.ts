import { JsonObject } from '@angular-devkit/core';

export interface NgTailwindBuilderSchema extends JsonObject {
    mode: string;
    configPath:string;
    purge: boolean;
}
