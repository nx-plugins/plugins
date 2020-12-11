import { JsonObject } from '@angular-devkit/core';

export interface ExtractBuilderSchema extends JsonObject {
    project: string;
    framework: string;
    directory: string;
    locales: string[];
} // eslint-disable-line
