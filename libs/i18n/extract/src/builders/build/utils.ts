import { exec, execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { Dependencies, DepGraph, NodeFile } from "./types";
import { parse } from 'himalaya'
export const LARGE_BUFFER = 1024 * 1000000;


export function getTranslations(directory: string, locale: string) {
    return JSON.parse(readFileSync(`${directory}/messages.${locale}.json`, 'utf-8'));
}

export function getTranslationById(translations: any, id: string) {
    return translations ? translations[id] : null;
}

export function executeDepGraph(project) {
    return createExecProcess(`nx dep-graph --include=${project} --exclude=${project}-e2e --file=dep-graph.json`,
        `Info: Successfully executed dependency graph`
    ).then(() => {
        return JSON.parse(readFileSync("dep-graph.json", 'utf-8'));
    })
        .catch((e) => {
            throw new Error("Error: Unable to execute dependency graph");
        })
}

export function getProjectDeps(depGraph: DepGraph, project: string, exclude: string = '') {
    return depGraph.graph.dependencies[project].filter((i) =>
        !i.target.includes(exclude)
    );
}

export function getNodesFiles(depGraph: DepGraph, project: string, include: string, exclude: string) {
    return depGraph.graph.nodes[project].data.files.filter((i) =>
        i.ext === include && !i.file.includes(exclude));
}

export function getProjectDepsFiles(depGraph: DepGraph, projectDeps: Dependencies[], include: string, exclude: string) {
    const deps = projectDeps.map((p: any) => {
        return getNodesFiles(depGraph, p.target, include, exclude);
    });
    const a = deps as any;
    return a.flat();
}

export function extractTransUnitsInFiles(files: NodeFile[]) {
    return files.forEach((p) => {
        const fileContent = readFileSync(p.file).toString();
        const elements = parse(fileContent) as [];
        elements.filter((i: any) => i.tagName === 'transunit').map((e: any) => {
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
    elements.forEach((e) => {
        const { id, description, intent, content} = manageMetadata(e);
        const previousTranslation = getTranslationById(translations,id);
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
    return files.forEach((p) => {
        const fileContent = readFileSync(p.file).toString();
        const elements = parse(fileContent) as [];
        elements.filter((i: any) => i.tagName === 'transunit').map((e: any) => {
            return { ...e, file: p.file };
        });
    });
}

export function managePlural(elements, translations) {
    let result = [];
    elements.forEach((e) => {
        const { id, description, intent, content} = manageMetadata(e);
        const previousTranslation = getTranslationById(translations,id);
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
            }        }
    });
    return result;
}

export function removeDoubleWhitespace(data: string) {
    return data.replace(/\s{2,}/g, ' ')
}

export function writeTranslationFile(directory: string, translations: any, locale: string) {
    writeFileSync(`${directory}/messages.${locale}.json`,
        JSON.stringify({ translations }, null, 2))
}

export function removeFile(path: string) {
    return execSync(`rm -rf ${path}`);
}

function createExecProcess(
    command: string,
    readyWhen: string,
    cwd?: string
): Promise<any> {
    return new Promise((res) => {
        const childProcess = exec(command, {
            maxBuffer: LARGE_BUFFER,
            cwd,
        });
        /**
         * Ensure the child process is killed when the parent exits
         */
        process.on('exit', () => childProcess.kill());
        childProcess.stdout.on('data', (data) => {
            process.stdout.write(data);
            if (readyWhen && data.toString().indexOf(readyWhen) > -1) {
                res(data);
            }
        });
        childProcess.stderr.on('data', (err) => {
            process.stderr.write(err);
            if (readyWhen && err.toString().indexOf(readyWhen) > -1) {
                res(err);
            }
        });
        childProcess.on('close', (code) => {
            if (!readyWhen) {
                res(code);
            }
        });
    });
}
