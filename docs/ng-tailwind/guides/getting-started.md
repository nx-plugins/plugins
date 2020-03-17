# Getting Started

NG Tailwind is an awesome tool that helps you to add easily tailwind into your project.

To learn how to use `@nx-plugins:ng-tailwind`, run:

```bash 
nx g @nx-plugins/ng-tailwind:tailwind-project --project=sample-app --scss
``` 

**Explanation**

- **--project**: App project to add ng-tailwind configuration.

- **--scss**: Add support for scss.


Now you can see that under `sample-app` you will have some new files:


```treeview
myorg/
├── apps/
│   └── sample-app/
│       ├── src/
│       │   ├── styles.scss
│       │   ├── tailwind-build.scss
│       │   └── tailwind.scss
│       ├── ng-tailwind.js
│       └── tailwind.config.js
├── libs/
├── angular.json
├── package.json
├── tools/
├── tsconfig.json
└── tslint.json
```

Explanation:

- **tailwind-build**: This files is used to inject Tailwind's base, components, and utilities styles into your CSS.

- **tailwind-css**: This file will contains all the compile styles injected by tailwind-build.

- **ng-tailwind**: This file is used to configure ng-tailwind.

- **tailwind-config.js**: This file is used to configure Tailwind's plugins, themes and variants.

Now adds `tailwind-css` file  part of the styles of the app, 
go to `angular.json` and find the `build` target for the app:
```json 
"architect": {
    "build": {
        "builder": "@angular-devkit/build-angular:browser",
        "options": {
            "styles": [
                "apps/sample-app/src/styles.scss",
                "apps/sample-app/src/tailwind.scss"
            ],
            "scripts": []
        }
    }
}
```

You are ready to go, now you just have to start tailwind and your application.

```
ng serve sample-app
```

```
ng run sample-app:tailwind
```
