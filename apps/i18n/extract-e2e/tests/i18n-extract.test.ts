import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
  newNxProject,
  readFile,
  updateFile,
  runPackageManagerInstall,
  tmpProjPath
} from '@nrwl/nx-plugin/testing';
import { writeFileSync } from 'fs';
import { newProject, runCLI } from './utils';

const asyncTimeout = 150000;

describe('i18n--extract e2e', () => {
  it.only('should create i18n--extract', async (done) => {

    const plugin = uniq('i18n--extract');

    const myapp = uniq('myapp');

    ensureNxProject('@nx-plugins/extract', 'dist/libs/i18n/extract');
    ensureNxProject('@nx-plugins/extract', 'dist/libs/i18n/extract');
    const packageJson = JSON.parse(readFile('package.json'));
    packageJson.devDependencies['@nrwl/next'] = '*';
    updateFile('package.json', JSON.stringify(packageJson));
    runPackageManagerInstall(false);
    await runNxCommandAsync(
      `generate @nrwl/next:app ${myapp} --e2eTestRunner=cypress --linter=eslint`
    );
    await runNxCommandAsync(
      `generate @nx-plugins/extract:i18n-extract ${plugin}`
    );


    // create a React component we can reference
    writeFileSync(
      tmpProjPath(`apps/${myapp}/pages/_app.tsx`),
      `
          import React from 'react';
          import { AppProps } from 'next/app';
          import './styles.css';
          import { InboxMessages } from '@nx-i18next/mail-app-ui';
          import { TranslateContextProvider } from '@nx-i18next/i18n/react/data-access';
          
          function CustomApp({ Component, pageProps }: AppProps) {
            return (
              <>
              <TranslateContextProvider>
              <main>
                <Component {...pageProps} />
              </main>  
              </TranslateContextProvider>
              </>
            );
          }
          
          export default CustomApp;
      `
    );
    // const result = await runNxCommandAsync(`build ${plugin}`);
    // expect(result.stdout).toContain('Builder ran');

    done();
  }, asyncTimeout);

  describe('--directory', () => {
    it('should create src in the specified directory', async (done) => {
      const plugin = uniq('i18n--extract');
      ensureNxProject('@nx-plugins/extract', 'dist/libs/i18n//extract');
      await runNxCommandAsync(
        `generate @nx-plugins/extract:i18n--extract ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
      ).not.toThrow();
      done();
    });
  });

  describe('--tags', () => {
    it('should add tags to nx.json', async (done) => {
      const plugin = uniq('i18n--extract');
      ensureNxProject('@nx-plugins/extract', 'dist/libs/i18n//extract');
      await runNxCommandAsync(
        `generate @nx-plugins/extract:i18n--extract ${plugin} --tags e2etag,e2ePackage`
      );
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
      done();
    });
  });
});
