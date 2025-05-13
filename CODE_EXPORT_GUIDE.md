# Component Designer: Code Export Guide

The Component Designer offers powerful code export capabilities that generate production-ready code files from your component specifications. This guide explains the available options and how to use them effectively.

## Available Export Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| **Assistant** | `.md` | **NEW!** Markdown file with instructions and code blocks optimized for AI assistants |
| TypeScript | `.ts` | TypeScript interfaces with JSDoc comments |
| JavaScript | `.js` | JavaScript classes with JSDoc documentation |
| TSX | `.tsx` | React TypeScript components with interface definitions |
| JSON | `.json` | Structured JSON with metadata and component specs |
| Go | `.go` | Go structs with idiomatic Go documentation |
| Rust | `.rs` | Rust structs with standard Rust documentation patterns |
| HTML | `.html` | HTML template with CSS and component structure |
| Text | `.txt` | Plain text documentation of component specs |

## AI Assistant Format (New!)

The Assistant format is specially designed for use with AI coding assistants in modern code editors. It provides several benefits:

- **Multiple implementations** - Contains all implementations in one file
- **Clear instructions** - Includes specific guidance for AI assistants
- **Integration notes** - Provides usage examples and integration steps
- **Contextual information** - Explains field types and validation requirements
- **Proper code blocks** - Uses markdown code fence blocks with language identifiers

### Naming Components for AI Assistants

When creating components for use with AI assistants:

1. **Use descriptive, literal titles** - Name components based on their function, not trendy names
   - Good: "User Registration Form", "Product Details Card", "Comment Section"  
   - Avoid: "Cool Signup", "Awesome Product Box", "Chat Bubble"

2. **First list is your component manifest** - The first list you create in the app represents all components
   - Each item in this list becomes a separate component file
   - Each component's sublist represents the input fields for that component

3. **Be specific with field descriptions** - AI assistants use these descriptions to understand purpose
   - Add detailed content/descriptions to each field explaining validation rules and usage

This approach helps AI assistants better understand the context and purpose of your components, leading to more accurate implementations.

### Using AI Assistant Format

When using this format:

1. Save the file to your project or share it with your team
2. Open the file in a code editor with an AI assistant
3. Ask the AI to implement the component based on the specifications
4. The AI will understand the structure and provide appropriate code

For detailed examples and tips on working with AI assistants, see the [AI Assistant Guide](./AI_ASSISTANT_GUIDE.md).

## Code Export Features

### 1. Professional Documentation Headers

All exported code files include:

- File headers with metadata (creation date, version, etc.)
- Proper documentation comments in the language's native style
- Comprehensive descriptions for all properties and methods
- Usage examples where appropriate

### 2. Rich Metadata

Code files include metadata like:

- Component name and description
- Creation timestamp
- Version information
- Schema references

### 3. Language-Specific Best Practices

Each export follows the target language's conventions:

- **TypeScript/TSX**: Proper interface definitions with JSDoc comments
- **JavaScript**: Classes with JSDoc annotations and type hints
- **Go**: Idiomatic Go struct definitions with appropriate comments
- **Rust**: Rust-style documentation and derive attributes
- **HTML**: Semantic HTML with CSS class structure

## How to Use Code Export

### Single Format Export

1. Switch to "Code View" in the component view
2. Select your desired format from the dropdown
3. Click the download icon to save the current format

### Export All Formats

1. Switch to "Code View" in the component view
2. Click "Export All Formats" to download all available formats
3. Files will be downloaded to your downloads folder

### Batch Export (Multiple Components)

1. Open the Booklet Manager
2. Click the Archive icon (batch export)
3. Select the components you want to export
4. Choose a format
5. Click "Export Selected"

## Tips for Better Code Exports

1. **Provide Detailed Descriptions**: The content fields for each component property are used in code documentation
2. **Use Consistent Naming**: Property names are converted to appropriate variable names in code
3. **Add Component Description**: The original text field becomes the main component description
4. **Structure Hierarchically**: Use sub-items to create proper hierarchy in the generated code

## Working with AI Assistants

When working with AI coding assistants like GitHub Copilot, Claude, or GPT-based assistants:

1. Export your component specification using the **Assistant** format
2. Share the file with your development team
3. When implementing the component, open the file alongside your code
4. Ask the AI assistant to help implement the component based on the specs
5. The AI will be able to understand the structure and provide appropriate implementation

## Customizing Export Formats

If you need to customize the export formats beyond what's available, you can modify the `EXPORT_FORMATS` object in the `storage.ts` file to add new formats or adjust existing ones. 