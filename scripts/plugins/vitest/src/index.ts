import {
    CreateDependencies,
    CreateNodes,
    CreateNodesContext,
    detectPackageManager,
    joinPathFragments,
    readJsonFile,
    TargetConfiguration,
    workspaceRoot,
    writeJsonFile,
  } from '@nx/devkit';
  import { dirname, isAbsolute, join, relative } from 'path';
  import { getNamedInputs } from '@nx/devkit/src/utils/get-named-inputs';
  import { existsSync, readdirSync } from 'fs';
  import { calculateHashForCreateNodes } from '@nx/devkit/src/utils/calculate-hash-for-create-nodes';
  import { projectGraphCacheDirectory } from 'nx/src/utils/cache-directory';
  import { getLockFileName } from '@nx/js';
  
  export function loadViteDynamicImport() {
    return Function('return import("vite")')() as Promise<typeof import('vite')>;
  }
  
  export interface VitePluginOptions {
    integrationTargetName?: string;
    testTargetName?: string;
  }
  
  const cachePath = join(projectGraphCacheDirectory, 'vite.hash');
  const targetsCache = existsSync(cachePath) ? readTargetsCache() : {};
  
  const calculatedTargets: Record<
    string,
    Record<string, TargetConfiguration>
  > = {};
  
  function readTargetsCache(): Record<
    string,
    Record<string, TargetConfiguration>
  > {
    return readJsonFile(cachePath);
  }
  
  function writeTargetsToCache(
    targets: Record<string, Record<string, TargetConfiguration>>
  ) {
    writeJsonFile(cachePath, targets);
  }
  
  export const createDependencies: CreateDependencies = () => {
    writeTargetsToCache(calculatedTargets);
    return [];
  };
  
  export const createNodes: CreateNodes<VitePluginOptions> = [
    '**/{vite,vitest}.config.{js,ts,mjs,mts,cjs,cts}',
    async (configFilePath, options, context) => {
      const projectRoot = dirname(configFilePath);
      // Do not create a project if package.json and project.json isn't there.
      const siblingFiles = readdirSync(join(context.workspaceRoot, projectRoot));
      if (
        !siblingFiles.includes('package.json') &&
        !siblingFiles.includes('project.json')
      ) {
        return {};
      }
      
      options = normalizeOptions(options);
  
      // We do not want to alter how the hash is calculated, so appending the config file path to the hash
      // to prevent vite/vitest files overwriting the target cache created by the other
      const hash =
        calculateHashForCreateNodes(projectRoot, options, context, [
          getLockFileName(detectPackageManager(context.workspaceRoot)),
        ]) + configFilePath;
      const targets = targetsCache[hash]
        ? targetsCache[hash]
        : await buildViteTargets(configFilePath, projectRoot, options, context);
  
      calculatedTargets[hash] = targets;
  
      return {
        projects: {
          [projectRoot]: {
            root: projectRoot,
            targets,
          },
        },
      };
    },
  ];
  
  async function buildViteTargets(
    configFilePath: string,
    projectRoot: string,
    options: VitePluginOptions,
    context: CreateNodesContext
  ) {
    const absoluteConfigFilePath = joinPathFragments(
      context.workspaceRoot,
      configFilePath
    );
  
    // Workaround for the `build$3 is not a function` error that we sometimes see in agents.
    // This should be removed later once we address the issue properly
    try {
      const importEsbuild = () => new Function('return import("esbuild")')();
      await importEsbuild();
    } catch {
      // do nothing
    }
    const { resolveConfig } = await loadViteDynamicImport();
    const viteConfig = await resolveConfig(
      {
        configFile: absoluteConfigFilePath,
        mode: 'development',
      },
      'build'
    );
  
    const { testOutputs: testOutputsUnit, hasTest } = getOutputs(
      viteConfig,
      projectRoot,
      options.testTargetName as string
    );
  
    const { testOutputs: testOutputsIntegration } = getOutputs(
      viteConfig,
      projectRoot,
      options.integrationTargetName as string
    );
  
    const namedInputs = getNamedInputs(projectRoot, context);
  
    const targets: Record<string, TargetConfiguration> = {};
  
    // if file is vitest.config or vite.config has definition for test, create target for test
    if (configFilePath.includes('vitest.config') || hasTest) {
      targets[options.testTargetName as string] = await testTarget(
        namedInputs,
        testOutputsUnit,
        projectRoot
      );
  
      targets[options.integrationTargetName as string] = await testIntegrationTarget(
        namedInputs,
        testOutputsIntegration,
        projectRoot
      );
    }
  
    return targets;
  }
  
  async function testTarget(
    namedInputs: {
      [inputName: string]: any[];
    },
    outputs: string[],
    projectRoot: string
  ) {
    return {
      
      command: `vitest run --exclude "**/*.integration.spec.ts"`,
      options: { cwd: joinPathFragments(projectRoot) },
      cache: true,
      inputs: [
        ...('production' in namedInputs
          ? ['default', '^production']
          : ['default', '^default']),
        {
          externalDependencies: ['vitest'],
        },
      ],
      outputs,
    };
  }
  
  async function testIntegrationTarget(
    namedInputs: {
      [inputName: string]: any[];
    },
    outputs: string[],
    projectRoot: string
  ) {
    return {
      command: `vitest run integration.spec.ts`,
      options: { cwd: joinPathFragments(projectRoot) },
      cache: true,
      inputs: [
        ...('production' in namedInputs
          ? ['default', '^production']
          : ['default', '^default']),
        {
          externalDependencies: ['vitest'],
        },
      ],
      outputs,
    };
  }
  
  function getOutputs(
    viteConfig: Record<"build"| "test" | "test-unit" |"test-integration" | string, any> | undefined,
    projectRoot: string,
    target: string 
  ): {
    buildOutputs: string[];
    testOutputs: string[];
    hasTest: boolean;
    isBuildable: boolean;
  } {
  
    const build = viteConfig?.build;
    const test = viteConfig?.test;
  
    const buildOutputPath = normalizeOutputPath(
      build?.outDir,
      projectRoot,
      target,
      'dist'
    ) as string;
  
    const isBuildable =
      build?.lib ||
      build?.rollupOptions?.inputs ||
      existsSync(join(workspaceRoot, projectRoot, 'index.html'));
  
    const reportsDirectoryPath = normalizeOutputPath(
      test?.coverage?.reportsDirectory,
      projectRoot,
      target,
      'coverage'
    ) as string;
  
    return {
      buildOutputs: [buildOutputPath],
      testOutputs: [reportsDirectoryPath],
      hasTest: !!test,
      isBuildable,
    };
  }
  
  function normalizeOutputPath(
    outputPath: string | undefined,
    projectRoot: string,
    target: string,
    path: 'coverage' | 'dist'
  ): string | undefined {
    if (!outputPath) {
      if (projectRoot === '.') {
        return `{projectRoot}/${path}/${target}`;
      } else {
        return `{workspaceRoot}/${path}/${target}/{projectRoot}`;
      }
    } else {
      if (isAbsolute(outputPath)) {
        return `{workspaceRoot}/${relative(workspaceRoot, outputPath)}`;
      } else {
        if (outputPath.startsWith('..')) {
          return join('{workspaceRoot}', join(projectRoot, outputPath));
        } else {
          return join('{projectRoot}', outputPath);
        }
      }
    }
  }
  
  function normalizeOptions(options: VitePluginOptions | undefined): VitePluginOptions {
    options ??= {};
    options.integrationTargetName ??= 'test-integration';
    options.testTargetName ??= 'test-unit';
    return options;
  }