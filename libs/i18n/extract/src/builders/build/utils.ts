import { readFileSync } from 'fs';
import { NodeFile } from "./types";
import { parse } from 'himalaya'
import { createProjectGraph, onlyWorkspaceProjects, ProjectGraph, ProjectGraphDependency } from '@nrwl/workspace/src/core/project-graph';
import { readJsonFile } from '@nrwl/workspace';
import { fileExists, writeJsonFile } from '@nrwl/workspace/src/utils/fileutils';

export function getTranslations(directory: string, locale: string) {
    if(!fileExists(`${directory}/messages.${locale}.json`)){
        return {}
    } else {
        readJsonFile(`${directory}/messages.${locale}.json`);
    }
    
}

export function getTranslationById(translations: any, id: string) {
    return translations ? translations[id] : null;
}

export function getWorkspaceGraph() {
    return onlyWorkspaceProjects(createProjectGraph());
}

export function getProjectDeps(depGraph: ProjectGraph, project: string, exclude: string = '') {
    return depGraph.dependencies[project].filter((i) =>
        !i.target.includes(exclude)
    );
}

export function getNodesFiles(depGraph: ProjectGraph, project: string, include: string, exclude: string) {
    return depGraph.nodes[project].data.files.filter((i) =>
        i.ext === include && !i.file.includes(exclude));
}

export function getProjectDepsFiles(depGraph: ProjectGraph, projectDeps: ProjectGraphDependency[], include: string, exclude: string) {
    const deps = projectDeps.map((p: any) => {
        return getNodesFiles(depGraph, p.target, include, exclude);
    });
    const a = deps as any;
    return a.flat();
}

export function extractTransUnitsInFiles(files: NodeFile[]) {
    return files.map((p) => {
        const fileContent = readFileSync(p.file).toString();
        const elements = parse(fileContent) as [];
        return elements.filter((i: any) => i.tagName === 'transunit').map((e: any) => {
            return { ...e, file: p.file };
        });
    });
}

export function manageMetadata(e) {
    const value = e.attributes.find((a) => a.key === 'value').value.slice(1, -1);
    const id = `${value.split('@@@')[1]}`.replace(/'{1,}/g, "");
    const meaningDesc = value.split('|');
    const description = removeDoubleWhitespace(`${meaningDesc[0]}`);
    const intent = removeDoubleWhitespace(`${meaningDesc[1].slice(0, meaningDesc.indexOf('@@@'))}`);
    const content = removeDoubleWhitespace(e.children.map((c) => {
        if (c.type === "text") {
            return c.content.replace(/{{1,}/g, "").replace(/}{1,}/g, "").replace(/'{1,}/g, "").trim()
        }
        return c.children.map((d) => {
            if (d.type === "text") {
                return d.content.replace(/}{2,}/g, "").replace(/{{1,}/g, "").replace(/>{1,}/g, "")
            }
        }).toString();
    }).filter((i) => i.length > 1).toString());
    return {
        value,
        id,
        description,
        intent,
        content
    }
}

export function manageTrans(elements, translations) {
    let result = [];
    // FLAT is used to avoid empty arrays
    elements.flat().forEach((e) => {
        const { id, description, intent, content } = manageMetadata(e);
        const previousTranslation = getTranslationById(translations, id);
        result[id] = {
            id,
            description,
            intent,
            source: e.file,
            type: 'TransUnit',
            target: previousTranslation ? previousTranslation.target : content,
        }
    });
    return result;
}

export function extractPluralInFiles(files: NodeFile[]) {
    return files.map((p) => {
        const fileContent = readFileSync(p.file).toString();
        const elements = parse(fileContent) as [];
        return elements.filter((i: any) => i.tagName === 'plural').map((e: any) => {
            return { ...e, file: p.file };
        });
    });
}

export function managePlural(elements, translations) {
    let result = [];
    elements.flat().forEach((e) => {
        const { id, description, intent, content } = manageMetadata(e);
        const previousTranslation = getTranslationById(translations, id);
        result[id] = {
            id,
            description,
            intent,
            source: e.file,
            type: 'Plural',
            target: {
                zero: previousTranslation ? previousTranslation.target.zero : content,
                one: previousTranslation ? previousTranslation.target.one : content,
                two: previousTranslation ? previousTranslation.target.two : content,
                other: previousTranslation ? previousTranslation.target.other : content,
            }
        }
    });
    return result;
}

export function removeDoubleWhitespace(data: string) {
    return data.replace(/\s{2,}/g, ' ')
}

export function writeTranslationFile(directory: string, translations: any, locale: string) {
    writeJsonFile(`${directory}/messages.${locale}.json`, translations )
}

