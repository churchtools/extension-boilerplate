# ChurchTools Extension Boilerplate

This project provides a boilerplate for building your own extension for [ChurchTools](https://www.church.tools).

## Getting Started

### Prerequisites

-   Node.js (version compatible with the project)
-   npm or yarn
-   Angular v21

### Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```

### Optional: Using Dev Container

This project includes a dev container configuration. If you use VS Code with the "Dev Containers" extension, you can:

1. Clone the repository
2. Open it in VS Code
3. Click the Remote Indicator in the bottom-left corner of VS Code status bar
4. Select "Reopen in Container"

The container includes the tools mentioned in the prerequisites pre-installed and also runs `npm install` on startup.

## Configuration

Copy `.env-example` to `.env` and fill in your data.

In the `.env` file, configure the necessary constants for your project. This file is included in `.gitignore` to prevent sensitive data from being committed to version control.

## Development and Deployment

### Development Server

Start a development server with hot-reload:

```bash
npm run start
```

> **Note:** For local development, make sure to configure CORS in your ChurchTools
> instance to allow requests from your local development server
> (typically `http://localhost:4200`).
> This can be done in the ChurchTools admin settings under:
> "System Settings" > "Integrations" > "API" > "Cross-Origin Resource Sharing"
>
> If login works in Chrome but not in Safari, the issue is usually that Safari has stricter cookie handling:
> - Safari blocks `Secure; SameSite=None` cookies on `http://localhost` (Chrome allows them in dev).
> - Safari also blocks cookies if the API is on another domain (third‑party cookies).
>
> **Fix:**
> 1. Use a Vite proxy so API calls go through your local server (`/api → https://xyz.church.tools`). This makes cookies look first‑party.
> 2. Run your dev server with **HTTPS**. You can generate a local trusted certificate with [mkcert](https://github.com/FiloSottile/mkcert).
>
> With proxy + HTTPS, Safari will accept and store cookies just like Chrome.

### Building for Production

To create a production build:

```bash
npm run deploy
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

### Deployment

To build and package your extension for deployment:

```bash
ng build
```

This command will:

1. Build the project
2. Package it using the `scripts/package.js` script

You can find the package in the `releases` directory.

## API

Following endpoints are available. Permissions are possible per route. Types are documented in `ct-types.d.ts` (CustomModuleCreate, CustomModuleDataCategoryCreate, CustomModuleDataValueCreate)

GET `/custommodules` get all extensions  
GET `/custommodules/{extensionkey}` get an extensions by its key  
GET `/custommodules/{moduleId}` get an extension by its ID

GET `/custommodules/{moduleId}/customdatacategories`  
POST `/custommodules/{moduleId}/customdatacategories`  
PUT `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}`  
DELETE `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}`

GET `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}/customdatavalues`  
POST `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}/customdatavalues`  
PUT `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}/customdatavalues/{valueId}`  
DELETE `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}/customdatavalues/{valueId}`

## Support

For questions about the ChurchTools API, visit the [Forum](https://forum.church.tools).
