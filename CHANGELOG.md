# Changelog

All notable changes to the AppAtOnce Node.js SDK will be documented in this file.

## [2.0.0] - 2024-12-28

### Added

#### New Tool Modules
- **Payment Module** (`client.payment`) - Complete payment processing integration
  - Support for multiple payment methods (card, bank account, PayPal, Stripe, crypto)
  - Subscription management with plans and billing cycles
  - Invoice generation and management
  - Payment links for easy checkout
  - Webhook support for payment events
  - Comprehensive payment analytics

- **Image Processing Module** (`client.imageProcessing`) - Advanced image manipulation
  - Image manipulation (resize, crop, rotate, flip, blur, sharpen)
  - Format conversion between JPEG, PNG, WebP, AVIF, GIF, TIFF
  - Filters and effects (vintage, noir, chrome, etc.)
  - Batch processing for multiple images
  - Smart cropping with face detection
  - Color palette extraction
  - Background removal
  - Watermarking
  - Image comparison and similarity detection

- **PDF Module** (`client.pdf`) - Comprehensive PDF handling
  - PDF generation from HTML/URL/templates
  - PDF manipulation (merge, split, rotate, extract pages)
  - Watermarking and protection with passwords
  - Form field creation and filling
  - Digital signatures
  - Compression and optimization
  - PDF to image conversion
  - Searchable PDF creation

- **OCR Module** (`client.ocr`) - Text extraction and recognition
  - Text extraction from images and PDFs
  - Multi-language support with automatic detection
  - Table detection and extraction
  - Barcode and QR code detection
  - Structured data extraction (invoices, receipts, IDs, passports)
  - Searchable PDF creation
  - Document orientation detection
  - Batch processing with job queue

- **Document Conversion Module** (`client.documentConversion`) - Universal document converter
  - Convert between 50+ document formats
  - Office document conversions (Word, Excel, PowerPoint)
  - eBook conversions (EPUB, MOBI, AZW3)
  - CAD file conversions
  - HTML and Markdown conversions
  - Batch conversion support
  - Format validation and compatibility checking
  - Job-based processing for large files

### Updated Features

#### Workflow System - Complete Redesign
- New workflow structure with simplified step definitions
- Support for all new tool types in workflow steps
- Updated status values: 'draft' | 'active' | 'paused' | 'archived'
- Improved execution tracking with detailed step results
- Removed versioning complexity in favor of simpler workflow management

#### Logic System - Enhanced Flow Control
- Renamed from "Logic Server" to "Logic Flow" for clarity
- New node types: `parallel`, `function`, `transform`
- Advanced conditional logic with `if`/`switch`/`expression` support
- Loop support with `for`/`while`/`forEach` constructs
- Flow-level variables and runtime context
- Better node connection management with inputs/outputs

#### Trigger System - Flexible Event Management
- Complete redesign replacing old smart triggers
- Three trigger types: `cron`, `webhook`, `event`
- Flexible target system supporting workflow, logic, node, or tool
- Better execution tracking with detailed statistics
- Webhook URL generation and secret management
- Event subscription system for reactive workflows

### Breaking Changes

#### Workflow Module
- **BREAKING**: `definition` property replaced with `steps` array
- **BREAKING**: `triggers` array replaced with single `trigger` object
- **BREAKING**: Status value 'inactive' split into 'paused' and 'archived'
- **BREAKING**: Removed complex versioning in favor of direct updates

#### Logic Module
- **BREAKING**: Core methods renamed for consistency:
  - `publishLogic` → `createLogicFlow`
  - `listLogic` → `listLogicFlows`
  - `getLogic` → `getLogicFlow`
  - `deleteLogic` → `deleteLogicFlow`
- **BREAKING**: Node structure completely redesigned with id-based connections
- **BREAKING**: Execution result format changed to include node-level results

#### Triggers Module
- **BREAKING**: Complete API replacement - old smart triggers removed
- **BREAKING**: Pattern detection methods deprecated and return empty arrays
- **BREAKING**: Table triggers now use the new trigger system

### Migration Guide

#### Workflow Migration
```typescript
// Old (v1.x)
const workflow = {
  name: "My Workflow",
  definition: {
    trigger: { type: "manual" },
    steps: [{ type: "email", config: {...} }]
  },
  triggers: [{ type: "webhook", config: {...} }]
};

// New (v2.0)
const workflow = {
  name: "My Workflow",
  steps: [
    {
      id: "step1",
      name: "Send Email",
      type: "email",
      config: {...},
      nextStepId: "step2"
    }
  ],
  trigger: { type: "webhook", config: {...} }
};
```

#### Logic Migration
```typescript
// Old (v1.x)
await client.logic.publishLogic(name, {
  nodes: [...],
  settings: {...}
});

// New (v2.0)
await client.logic.createLogicFlow({
  name,
  nodes: nodes.map(n => ({
    id: n.name,
    name: n.name,
    type: n.service || n.type,
    config: n.params,
    outputs: [n.next].filter(Boolean)
  }))
});
```

### Fixes
- Fixed TypeScript async method return types
- Improved error handling across all modules
- Better promise handling in file upload methods
- Consistent status enums across modules

### Technical Improvements
- FormData support for file uploads in new modules
- Consistent async/await patterns
- Better TypeScript type inference
- Improved method naming consistency

### Backward Compatibility
- Old logic methods maintained with deprecation warnings
- Trigger module includes compatibility layer for old pattern methods
- Gradual migration path recommended

## [1.0.1] - 2024-07-15

### Added
- **Project OAuth Module** - Complete multi-tenant OAuth implementation for end-user authentication
- **Social Login Support** - Google, Facebook, GitHub, Apple, and custom OAuth providers
- **PKCE Support** - Enhanced security for OAuth flows in SPAs and mobile apps
- **OAuth Provider Management** - Configure, test, enable/disable OAuth providers per project
- **Token Refresh** - Automatic OAuth token refresh functionality
- **OAuth Analytics** - Track OAuth usage and user metrics per provider
- **Custom OAuth Providers** - Support for custom SSO and OAuth providers
- **Comprehensive Examples** - TypeScript and JavaScript examples for OAuth implementation

### Enhanced
- **Type Definitions** - Added complete TypeScript types for project OAuth
- **Documentation** - Added comprehensive project OAuth documentation and examples

## [1.0.1] - 2024-07-15

### Added
- **Production-ready Socket.io client** - Replaced basic WebSocket with Socket.io for robust real-time features
- **Advanced reconnection handling** - Exponential backoff with configurable retry limits
- **Enhanced presence tracking** - Real-time collaboration with user metadata
- **Comprehensive error handling** - Graceful error recovery and detailed logging
- **Connection state monitoring** - Full visibility into connection health
- **Debug logging support** - Configurable debug output for development

### Enhanced
- **Real-time subscriptions** - More robust with automatic resubscription after reconnection
- **Channel messaging** - Improved pub/sub with better error handling
- **Workflow monitoring** - Real-time workflow execution updates
- **Analytics subscriptions** - Live system and table metrics
- **Database change events** - Enhanced filtering and event handling

### Fixed
- **Node.js compatibility** - Proper Socket.io client for server-side usage
- **TypeScript definitions** - Complete type safety for Socket.io integration
- **Memory management** - Proper cleanup of event listeners and subscriptions

## [1.0.0] - 2024-07-15

### Added
- Complete TypeScript SDK for AppAtOnce platform
- Authentication module with JWT and API key support
- Database operations with fluent query builder
- AI integration with text, image, video, and audio generation
- Storage module with S3-compatible file management
- Email module with templates and campaigns
- Real-time subscriptions with WebSocket support
- Workflow automation and management
- Administrative operations and user management
- Schema management with code-first approach
- Comprehensive TypeScript type definitions
- Four detailed usage examples
- Complete documentation with API reference

### Fixed
- TypeScript compilation errors
- Removed browser-specific types (File) for Node.js compatibility
- Updated FormData usage for server-side implementation
- Fixed unused import warnings
- Added proper Node.js and DOM type support
- Resolved all TypeScript strict mode issues

### Technical Details
- Built with TypeScript 5.8.3
- Supports Node.js 18+
- Includes source maps and declaration files
- Full ESM and CommonJS compatibility
- Comprehensive error handling
- Production-ready with security best practices

### Package Structure
```
src/
├── core/              # HTTP client and query builder
├── modules/           # Feature modules (auth, ai, storage, etc.)
├── types/             # TypeScript type definitions
└── index.ts           # Main SDK export

dist/                  # Compiled JavaScript and type definitions
examples/              # Usage examples
```

### Dependencies
- axios: HTTP client
- socket.io-client: Production-ready Socket.io client for real-time features
- form-data: File upload support
- @types/node: Node.js type definitions