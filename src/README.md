# Source Code Structure

This directory contains the source code for your ChurchTools extension.

## Directory Structure

```
src/
├── lib/                    ⚠️ Library code (don't modify)
│   ├── main.ts            - Core rendering system
│   ├── loaders.ts         - Entry point loader
│   ├── event-bus.ts       - Event system
│   └── README.md          - Library documentation
│
├── entry-points/           ✏️ Your extension implementation (edit this!)
│   ├── index.ts           - Entry point registry
│   ├── main.ts            - Main module entry point
│   ├── admin.ts           - Admin configuration entry point
│   ├── calendar-availability.ts
│   ├── welcome.ts         - Demo entry points
│   ├── user-info.ts
│   ├── data-viewer.ts
│   └── README.md          - How to add entry points
│
├── types/                  📝 TypeScript type definitions
│   └── extension.ts       - Core extension types
│
├── utils/                  🔧 Utility files
│   ├── ct-types.d.ts      - ChurchTools API types
│   └── reset.css          - CSS reset for development
│
└── index.ts                📦 Main entry point (re-exports everything)
```

## What to Edit

### ✏️ To add a new feature:

1. **Create an entry point file** in `src/entry-points/`
   ```typescript
   // src/entry-points/my-feature.ts
   import type { EntryPoint } from '../lib/main';

   const myFeatureEntryPoint: EntryPoint = ({ element, user }) => {
       element.innerHTML = `<h1>Hello ${user.firstName}!</h1>`;
   };

   export { myFeatureEntryPoint };
   export default myFeatureEntryPoint;
   ```

2. **Register it** in `src/entry-points/index.ts`:
   ```typescript
   export const entryPointRegistry = {
       // ...
       myFeature: () => import('./my-feature'),
   };
   ```

3. **Build and test**:
   ```bash
   npm run build
   npm run dev
   ```

### 📋 To use extension point types:

Extension point type definitions are provided by the `@churchtools/extension-points` package:

```typescript
import type { MainModuleData, AdminData } from '@churchtools/extension-points';
import type { EntryPoint } from '../lib/main';

const myEntryPoint: EntryPoint<MainModuleData> = ({ data, on, emit }) => {
    // Type-safe access to data
    console.log(data.userId, data.permissions);
};
```

See the package documentation for all available extension point types.

### 🔧 To add utilities:

Add helper functions, types, or styles to `src/utils/`

## What NOT to Edit

### ⚠️ Library code (`src/lib/`)

These files are part of the framework and handle:
- Extension initialization
- Entry point loading
- Event communication
- ChurchTools client setup

You typically don't need to modify these files.

## Main Entry Points

The boilerplate includes two main entry points:

- **`main.ts`** - Standalone module with its own menu entry
  - Use for full-featured extensions
  - Provides navigation, dashboard, and multiple views

- **`admin.ts`** - Admin configuration panel
  - Use for extension settings
  - Provides form handling, validation, and save/reset

You can customize these or create your own!

## Development Workflow

1. **Edit entry points** in `src/entry-points/`
2. **Register them** in `src/entry-points/index.ts`
3. **Test locally**: `npm run dev`
4. **Build**: `npm run build`
5. **Deploy**: `npm run deploy`

## Type Safety

Use TypeScript interfaces to define your data structures:

```typescript
// Define data contract
interface MyData {
    userId: number;
    settings: {
        enabled: boolean;
    };
}

// Use in entry point
const myEntryPoint: EntryPoint<MyData> = ({ data }) => {
    console.log(data.userId);  // ✅ Type-safe!
};
```

## Questions?

- See `src/entry-points/README.md` for entry point examples
- See `src/lib/README.md` for library documentation
- Check the root `README.md` for general documentation
