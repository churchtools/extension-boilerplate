# Extension Point Contracts

Guide for defining extension point contracts in the `churchtools-extension-points` package.

## What is a Contract?

An extension point contract defines:
1. **Data** - What data ChurchTools provides to the extension
2. **Events** - What events the extension can listen to FROM ChurchTools
3. **Emits** - What events the extension can emit TO ChurchTools

## Contract Structure

```typescript
// Data interface
export interface MyExtensionPointData {
  // Data ChurchTools provides
}

// Events FROM ChurchTools (extension listens)
export interface MyExtensionPointEvents {
  'event:name': (data: DataType) => void;
}

// Events TO ChurchTools (extension emits)
export interface MyExtensionPointEmits {
  'event:name': (data: DataType) => void;
}

// Metadata for development/testing
export const MyExtensionPointMetadata = {
  id: 'my-extension-point',
  eventNames: ['event:name'] as const,
} as const;
```

## Creating a Contract

### 1. Create Contract File

`churchtools-extension-points/src/my-extension-point.ts`:

```typescript
/**
 * Extension Point: my-extension-point
 *
 * Location: Where in ChurchTools UI
 * Purpose: What this extension point does
 */

export interface MyExtensionPointData {
  userId: number;
  context: object;
}

export interface MyExtensionPointEvents {
  'data:updated': (data: object) => void;
  'view:closing': () => void;
}

export interface MyExtensionPointEmits {
  'action:performed': (data: object) => void;
}

export type MyExtensionPointContract = {
  data: MyExtensionPointData;
  events: MyExtensionPointEvents;
  emits: MyExtensionPointEmits;
};

export const MyExtensionPointMetadata = {
  id: 'my-extension-point',
  eventNames: ['data:updated', 'view:closing'] as const,
} as const;
```

### 2. Export from Index

`churchtools-extension-points/src/index.ts`:

```typescript
export * from './my-extension-point';

// Add to metadata collection
import { MyExtensionPointMetadata } from './my-extension-point';

export const allExtensionPointMetadata = [
  MainModuleMetadata,
  AdminMetadata,
  MyExtensionPointMetadata, // Add here
] as const;

export const extensionPointMetadataById = Object.fromEntries(
  allExtensionPointMetadata.map(metadata => [metadata.id, metadata])
);
```

### 3. Build Package

```bash
cd churchtools-extension-points
npm run build
```

## Contract Best Practices

### 1. Document Everything

```typescript
/**
 * Data provided by ChurchTools for calendar dialogs
 */
export interface CalendarDialogData {
  /** Current appointment being edited */
  currentAppointment: Appointment;

  /** Calendar master data (resources, categories, etc.) */
  masterData: CalendarMasterData;
}
```

### 2. Use Specific Types

```typescript
// Good: Specific types
export interface PersonData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Bad: Generic types
export interface PersonData {
  data: object; // Too generic!
}
```

### 3. Version Contracts Carefully

Contracts are public APIs. Changes should be backward compatible:

```typescript
// Good: Add optional field
export interface PersonData {
  id: number;
  firstName: string;
  lastName: string;
  email?: string; // New optional field
}

// Bad: Remove or change existing field
export interface PersonData {
  id: number;
  // firstName removed - BREAKING CHANGE!
  fullName: string; // Changed field - BREAKING CHANGE!
}
```

## See Also

- [Integration Guide](integration-guide.md) - Loading extensions
- [Multi-Extension Support](multi-extension-support.md) - Multiple extensions
