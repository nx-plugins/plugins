# Publishable Libraries

Nrwl nx is a great tool to manage all of your dev workflow.
Since `nx version 8.12` now you can create libs that depends that contains dependencies for other libraries.
There are some rules in order to accomplish this :

1. All the libraries that are dependencies should be publishable libs. [See more](https://github.com/nrwl/nx/issues/602#issuecomment-583897922)
2. The dependent libraries should be build it first.

3. You can  tweak the `tsconfig.base.json` that is used in all the `tsconfig.lib.json` to suite your needs or create a new file `tsconfig.build.json` specific for the build process.

**Build Configuration**

1. Duplicate the `tsconfig.base.json` file and rename with it `tsconfig.build.json` 

2. Make the following changes:
    - `"rootDir": "libs"`
    - Each `path` should point to the `dist` folder.
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": "libs",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "module": "esnext",
    "typeRoots": ["node_modules/@types"],
    "lib": ["es2017", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@nx-plugins/i18n/react/ui": [
        "dist/libs/i18n/react/ui",
        "libs/i18n/react/ui/src/index.ts"
      ],
      "@nx-plugins/i18n/react/data-access": [
        "dist/libs/i18n/react/data-access",
        "libs/i18n/react/data-access/src/index.ts"
      ],
      "@nx-plugins/i18n/react/utils": [
        "dist/libs/i18n/react/utils",
        "libs/i18n/react/utils/src/index.ts"
      ],
      "@nx-plugins/i18n/core/utils": ["libs/i18n/core/utils/src/index.ts"],
      "@nx-plugins/i18n-extract": ["libs/i18n/extract/src/index.ts"],
      "@nx-plugins/i18n/react/package": ["libs/i18n/react/package/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}

```

3. Now modify the respective `tsconfig.lib.json` files that are used in the build process  and extend it from `tsconfig.build.json`.

4. Probably you need to copy some configurations from the `tsconfig.json` relative to the lib and use it in the `tsconfig.lib.json`. This is because we cannot extend from multiple files.

```json
{
  "extends": "../../../../tsconfig.build.json",
  "compilerOptions": {
    "jsx": "react",
    "allowJs": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "outDir": "../../../../dist/out-tsc",
    "types": ["node"],
  },
  "files": [
    "../../../../node_modules/@nrwl/react/typings/cssmodule.d.ts",
    "../../../../node_modules/@nrwl/react/typings/image.d.ts"
  ],
  "exclude": ["**/*.spec.ts", "**/*.spec.tsx"],
  "include": ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"]
}
```

Note: Check the `build` builder for each library to realize which `tsconfig` needs to be modified.

Now that you have a multiples `tsconfig`, try to have it consistent.


5. Build all the libraries using the command below:

```bash
nx build i18n-react-package --with-deps
```
