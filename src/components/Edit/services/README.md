# Form Builder Services

This directory contains the services specifically for the **form builder** functionality. These services are completely separate from the core SadForms component library to maintain clear architectural boundaries.

## 🏗️ Architecture Separation

```
src/
├── lib/                          # 📋 Core SadForms Library
│   ├── components/               # ✅ Form components (Field, Form, etc.)
│   ├── services/                 # ✅ Core form services (validation, event handling, etc.)
│   ├── store/                    # ✅ Core form stores
│   └── types/                    # ✅ Shared types
│
└── components/Edit/              # 🏗️ Form Builder (separate from core library)
    ├── services/                 # 🎯 Form builder specific services
    │   ├── formBuilderService.ts      # Business logic for form building
    │   ├── fieldConfigService.ts      # Field configuration generation
    │   └── formBuilderConfigs.ts      # Form definitions for builder UI
    ├── EditField.svelte          # Form field editor component
    ├── EditSettings.svelte       # Form settings editor component
    └── Editor.svelte             # Main form builder component
```

## 📁 Service Descriptions

### `formBuilderService.ts`
- **Purpose**: Core business logic for form building operations
- **Responsibilities**: 
  - Form creation, update, deletion
  - Field management (add, update, delete, move)
  - Group operations
  - Value type conversions
- **Dependencies**: Core SadForms types and utilities only

### `fieldConfigService.ts`
- **Purpose**: Generates field configuration forms for the builder UI
- **Responsibilities**:
  - Field type categorization
  - Configuration form generation
  - Validation of field configurations
  - Field type registry management
- **Dependencies**: Form builder configs and core SadForms types

### `formBuilderConfigs.ts`
- **Purpose**: Form definitions that power the builder's dogfooding approach
- **Responsibilities**:
  - Basic field configuration forms
  - Type-specific field configurations
  - Group configuration forms
  - Validation function definitions
- **Dependencies**: Core SadForms types and validation utilities

## 🎯 Key Design Principles

1. **Clear Separation**: Form builder services are isolated from core library services
2. **Dogfooding**: Builder uses SadForms components to build SadForms
3. **Single Responsibility**: Each service has a focused purpose
4. **Dependency Direction**: Builder depends on core library, not vice versa
5. **No Circular Dependencies**: Clean import structure maintained

## 🔄 Import Patterns

### ✅ Correct Usage
```typescript
// Form builder services can import from core library
import type { Field, Form } from '../../../lib/types/Form';
import { validationService } from '../../../lib/services/validationService';
```

### ❌ Incorrect Usage
```typescript
// Core library services should NOT import from form builder
import { formBuilderService } from '../../../components/Edit/services/formBuilderService';
```

## 🚀 Future Extensibility

This architecture allows for:
- **Easy Testing**: Services can be unit tested independently
- **Feature Addition**: New form builder features can be added without affecting core library
- **Alternative Builders**: Different form builders can be created using the same core library
- **Plugin Architecture**: Form builder can be extended with plugins

## 📊 Benefits of This Structure

1. **Maintainability**: Clear boundaries make code easier to understand and maintain
2. **Testability**: Services can be tested in isolation
3. **Reusability**: Core library remains pure and reusable
4. **Extensibility**: Form builder can be extended without affecting core functionality
5. **Documentation**: Clear separation makes architecture self-documenting