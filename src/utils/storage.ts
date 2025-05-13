import { List } from '../types';
import JSZip from 'jszip';

export interface SavedBooklet {
  id: string;
  name: string;
  savedAt: string;
  list: List;
}

const BOOKLETS_KEY = 'dm_app_booklets';
const LISTS_KEY = 'savedLists';

export const getSavedBooklets = (): SavedBooklet[] => {
  const saved = localStorage.getItem(BOOKLETS_KEY);
  if (!saved) return [];
  
  try {
    const booklets = JSON.parse(saved);
    return booklets.map((booklet: any) => ({
      id: booklet.id,
      name: booklet.name,
      savedAt: booklet.savedAt || new Date().toISOString(),
      list: {
        ...booklet.list,
        createdAt: booklet.list.createdAt || new Date().toISOString(),
      }
    }));
  } catch (error) {
    console.error('Error parsing booklets:', error);
    return [];
  }
};

export const saveBooklet = (list: List) => {
  const booklets = JSON.parse(localStorage.getItem(BOOKLETS_KEY) || '[]');
  const existingIndex = booklets.findIndex((b: any) => b.list.id === list.id);
  
  const bookletToSave = {
    id: Date.now().toString(),
    name: list.name,
    savedAt: new Date().toISOString(),
    list: {
      ...list,
      createdAt: list.createdAt || new Date().toISOString(),
    }
  };
  
  if (existingIndex >= 0) {
    booklets[existingIndex] = bookletToSave;
  } else {
    booklets.unshift(bookletToSave);
  }

  localStorage.setItem(BOOKLETS_KEY, JSON.stringify(booklets));
};

export const deleteBooklet = (bookletId: string) => {
  const booklets = JSON.parse(localStorage.getItem(BOOKLETS_KEY) || '[]');
  const filtered = booklets.filter((b: any) => b.id !== bookletId);
  localStorage.setItem(BOOKLETS_KEY, JSON.stringify(filtered));
};

export const saveLists = (lists: List[]): void => {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
};

export const getLists = (): List[] => {
  const lists = localStorage.getItem(LISTS_KEY);
  if (!lists) return [];
  
  try {
    const parsedLists = JSON.parse(lists);
    return parsedLists.map((list: any) => ({
      ...list,
      createdAt: list.createdAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error parsing lists:', error);
    return [];
  }
};

export const saveList = (list: List): void => {
  const lists = getLists();
  const existingIndex = lists.findIndex(l => l.id === list.id);
  
  const listToSave = {
    ...list,
    createdAt: list.createdAt || new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    lists[existingIndex] = listToSave;
  } else {
    lists.push(listToSave);
  }
  
  saveLists(lists);
};

export const validateListStructure = (data: any): data is List => {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.id !== 'string') return false;
  if (typeof data.name !== 'string') return false;
  if (!Array.isArray(data.items)) return false;
  
  // Allow missing createdAt and originalText fields
  if (data.createdAt && typeof data.createdAt !== 'string') return false;
  if (data.originalText && typeof data.originalText !== 'string') return false;
  
  return data.items.every((item: any) => 
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    (item.content === undefined || typeof item.content === 'string') &&
    (!item.subItems || Array.isArray(item.subItems))
  );
};

// This interface isn't recognized by TypeScript, so let's declare it properly
interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface ShowSaveFilePickerOptions {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

// Add this helper function to handle the file save dialog in a TypeScript-safe way
const showSaveFilePickerPolyfill = async (options: ShowSaveFilePickerOptions): Promise<FileSystemFileHandle> => {
  // @ts-ignore - Handle the File System Access API not being recognized by TypeScript
  if (window.showSaveFilePicker) {
    // @ts-ignore
    return window.showSaveFilePicker(options);
  }
  throw new Error('File System Access API not supported');
};

// Update the exportListToFile function
export const exportListToFile = async (list: List, format: string = 'json'): Promise<void> => {
  const exportFormat = EXPORT_FORMATS[format];
  if (!exportFormat) {
    throw new Error(`Unsupported format: ${format}`);
  }

  const content = exportFormat.formatter(list);
  const blob = new Blob([content], { type: exportFormat.mimeType });

  try {
    // Try to use the native file system API
    const handle = await showSaveFilePickerPolyfill({
      suggestedName: `${list.name.replace(/\s+/g, '_')}${exportFormat.extension}`,
      types: [{
        description: `${format.toUpperCase()} File`,
        accept: {
          [exportFormat.mimeType]: [exportFormat.extension]
        }
      }]
    });
    
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    return;
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      // Fallback to traditional download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${list.name.replace(/\s+/g, '_')}${exportFormat.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
};

// Update the exportMultipleListsToZip function with the same approach
export const exportMultipleListsToZip = async (lists: List[], format: string = 'json'): Promise<void> => {
  const exportFormat = EXPORT_FORMATS[format];
  if (!exportFormat) {
    throw new Error(`Unsupported format: ${format}`);
  }

  const zip = new JSZip();
  
  // Add each list as a separate file in the zip
  lists.forEach(list => {
    const content = exportFormat.formatter(list);
    const safeName = list.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeName}${exportFormat.extension}`;
    zip.file(filename, content);
  });
  
  // Generate the zip file
  const blob = await zip.generateAsync({ type: 'blob' });
  
  try {
    // Try to use the native file system API
    const handle = await showSaveFilePickerPolyfill({
      suggestedName: `booklets_export.zip`,
      types: [{
        description: 'ZIP Archive',
        accept: {
          'application/zip': ['.zip']
        }
      }]
    });
    
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    return;
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      // Fallback to traditional download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booklets_export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
};

export const importListFromFile = async (file?: File): Promise<List> => {
  if (!file) {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    // Accept all our supported formats
    input.accept = Object.values(EXPORT_FORMATS).map(format => format.extension).join(',');

    // Wrap the file selection in a promise
    const filePromise = new Promise<File>((resolve, reject) => {
      input.onchange = () => {
        const files = input.files;
        if (files && files[0]) {
          resolve(files[0]);
        } else {
          reject(new Error('No file selected'));
        }
      };
      input.oncancel = () => reject(new Error('Import cancelled'));
    });

    // Trigger the file picker
    input.click();
    file = await filePromise;
  }

  // Read the file
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error('Invalid file content');
        }
        
        // First, try to parse as JSON
        try {
        const data = JSON.parse(content);
        
        // Check if this is a List or a SavedBooklet
        let listData: any;
        
        if (validateListStructure(data)) {
          listData = data;
        } else if (data.list && validateListStructure(data.list)) {
          // This appears to be a SavedBooklet structure
          listData = data.list;
        } else {
            throw new Error('Not a valid JSON list format');
        }
        
        resolve({
          ...listData,
          id: listData.id || Date.now().toString(), // Ensure we have an ID
          createdAt: listData.createdAt || new Date().toISOString()
        });
          return;
        } catch (jsonError) {
          // Not valid JSON, try to parse as other formats
          // Extract the file extension
          const fileExtension = file.name.includes('.') 
            ? `.${file.name.split('.').pop()}` 
            : '';
          
          // Try to determine the format based on content and extension
          let format = determineFormatFromContent(content, fileExtension);
          
          if (format) {
            // Parse the content based on format
            const list = parseContentByFormat(content, format);
            if (list) {
              resolve(list);
              return;
            }
          }
          
          // If we get here, we couldn't parse the file
          throw new Error('Failed to parse file. Please try a different format or ensure the file is valid.');
        }
      } catch (error) {
        console.error('Import error:', error);
        reject(new Error(`Failed to import file: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Helper function to determine file format from content
const determineFormatFromContent = (content: string, extension: string): string | null => {
  // Check extension first
  for (const [format, config] of Object.entries(EXPORT_FORMATS)) {
    if (config.extension === extension) {
      return format;
    }
  }
  
  // Check content patterns
  if (content.includes('interface') && content.includes('props')) {
    return extension === '.tsx' ? 'tsx' : 'typescript';
  }
  
  if (content.includes('class') && content.includes('export default')) {
    return 'javascript';
  }
  
  if (content.includes('struct') && content.includes('impl')) {
    return 'rust';
  }
  
  if (content.includes('struct') && content.includes('package main')) {
    return 'go';
  }
  
  if (content.includes('<div') && content.includes('</div>')) {
    return 'html';
  }
  
  if (content.startsWith('// ') && content.includes(':')) {
    // Generic code file, try to parse as typescript
    return 'typescript';
  }
  
  return null;
};

// Parse content based on determined format
const parseContentByFormat = (content: string, format: string): List | null => {
  // Extract component name - common pattern across formats
  const nameMatch = content.match(/\/\/\s+(.+?)\s+(?:Component|Types|Class)/i) || 
                    content.match(/class\s+(\w+)/) ||
                    content.match(/interface\s+(\w+)Props/) ||
                    content.match(/struct\s+(\w+)/);
  
  const componentName = nameMatch ? nameMatch[1] : 'Imported Component';
  
  // Extract fields based on format patterns
  let fields: { title: string, content?: string }[] = [];
  
  // TypeScript/JavaScript field extraction
  const tsFields = content.match(/\/\*\*\s*(.*?)\s*\*\/\s*(\w+):/g);
  if (tsFields) {
    fields = tsFields.map(field => {
      const contentMatch = field.match(/\/\*\*\s*(.*?)\s*\*\//);
      const titleMatch = field.match(/\*\/\s*(\w+):/);
      return {
        title: titleMatch ? titleMatch[1] : 'field',
        content: contentMatch ? contentMatch[1].trim() : '',
      };
    });
  } else {
    // Try other formats' patterns
    // For simplicity, just extract any property-like patterns
    const genericFields = content.match(/(?:\/\/|\/\*|\*)\s*(.*?)\s*(?:\*\/|$)\s*(\w+)(?::|=)/g);
    if (genericFields) {
      fields = genericFields.map(field => {
        const contentMatch = field.match(/(?:\/\/|\/\*|\*)\s*(.*?)(?:\*\/|$)/);
        const titleMatch = field.match(/(?:\*\/|$)\s*(\w+)(?::|=)/);
        return {
          title: titleMatch ? titleMatch[1] : 'field',
          content: contentMatch ? contentMatch[1].trim() : '',
        };
      });
    }
  }
  
  // If no fields extracted, just use lines as field names
  if (fields.length === 0) {
    fields = content.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => ({
        title: line.trim().substring(0, 30),
      }));
  }
  
  // Create a list object
  return {
    id: Date.now().toString(),
    name: componentName,
    items: fields.map(field => ({
      id: crypto.randomUUID(),
      title: field.title,
      content: field.content || '',
    })),
    createdAt: new Date().toISOString(),
    originalText: content
  };
};

export interface ExportFormat {
  extension: string;
  mimeType: string;
  formatter: (list: List) => string;
}

export const EXPORT_FORMATS: Record<string, ExportFormat> = {
  json: {
    extension: '.json',
    mimeType: 'application/json',
    formatter: (list: List) => {
      const metaData = {
        componentName: list.name,
        description: list.originalText || '',
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        schemaVersion: '1.0',
      };
      
      const obj: any = {
        meta: metaData,
        component: {
          name: list.name,
          description: list.originalText || '',
          specs: list.items.map(item => ({
            name: item.title,
            description: item.content || '',
            subComponents: item.subItems?.map(subItem => ({
              name: subItem.title,
              description: subItem.content || '',
            })) || [],
          })),
        }
      };
      return JSON.stringify(obj, null, 2);
    }
  },
  typescript: {
    extension: '.ts',
    mimeType: 'text/typescript',
    formatter: (list: List) => {
      const componentName = list.name.replace(/\s+/g, '');
      const now = new Date().toISOString();
      
      let code = `/**
 * @file ${componentName}.ts
 * @description TypeScript interface for ${list.name} component
 * @created ${now.split('T')[0]}
 * @version 1.0.0
 */

`;
      
      if (list.originalText) {
        code += `/**
 * ${list.originalText.split('\n').join('\n * ')}
 */
`;
      }
      
      code += `export interface ${componentName}Props {
`;
      
      list.items.forEach(item => {
        const fieldName = item.title.replace(/\s+/g, '').toLowerCase();
        code += `  /**
   * ${item.content || 'No description available'}
   */
  ${fieldName}: {
`;
        if (item.subItems && item.subItems.length) {
          item.subItems.forEach(subItem => {
            const subFieldName = subItem.title.replace(/\s+/g, '').toLowerCase();
            code += `    /**
     * ${subItem.content || 'No description available'}
     */
    ${subFieldName}: string;
`;
          });
        } else {
          code += '    // Add required fields here\n';
        }
        code += '  };\n\n';
      });
      
      code += `}

/**
 * Example usage:
 * 
 * import { ${componentName}Props } from './${componentName}';
 * 
 * const my${componentName}Props: ${componentName}Props = {
 *   // Add your implementation here
 * };
 */
`;
      return code;
    }
  },
  javascript: {
    extension: '.js',
    mimeType: 'text/javascript',
    formatter: (list: List) => {
      const componentName = list.name.replace(/\s+/g, '');
      const now = new Date().toISOString();
      
      let code = `/**
 * @file ${componentName}.js
 * @description JavaScript class for ${list.name} component
 * @created ${now.split('T')[0]}
 * @version 1.0.0
 */

`;
      
      if (list.originalText) {
        code += `/**
 * ${list.originalText.split('\n').join('\n * ')}
 */
`;
      }
      
      code += `class ${componentName} {
  constructor() {
    // Initialize component properties
`;

      list.items.forEach(item => {
        const fieldName = item.title.replace(/\s+/g, '').toLowerCase();
        code += `    /**
     * ${item.content || 'No description available'}
     * @type {Object}
     */
    this.${fieldName} = {
`;
        if (item.subItems && item.subItems.length) {
          item.subItems.forEach(subItem => {
            const subFieldName = subItem.title.replace(/\s+/g, '').toLowerCase();
            code += `      /**
       * ${subItem.content || 'No description available'}
       * @type {string}
       */
      ${subFieldName}: '',
`;
          });
        } else {
          code += '      // Add required fields here\n';
        }
        code += '    };\n\n';
      });
      
      code += `  }
  
  /**
   * Gets a string representation of this component
   * @returns {string} The component string representation
   */
  toString() {
    return '${componentName}';
  }
}

/**
 * Export the ${componentName} class for use in other modules
 */
export default ${componentName};
`;
      return code;
    }
  },
  tsx: {
    extension: '.tsx',
    mimeType: 'text/typescript-jsx',
    formatter: (list: List) => {
      const componentName = list.name.replace(/\s+/g, '');
      const now = new Date().toISOString();
      
      let code = `/**
 * @file ${componentName}.tsx
 * @description React TypeScript component for ${list.name}
 * @created ${now.split('T')[0]}
 * @version 1.0.0
 */

import React from 'react';
`;
      
      if (list.originalText) {
        code += `
/**
 * ${list.originalText.split('\n').join('\n * ')}
 */
`;
      }
      
      code += `
/**
 * Props interface for the ${componentName} component
 */
export interface ${componentName}Props {
`;
      
      list.items.forEach(item => {
        const fieldName = item.title.replace(/\s+/g, '').toLowerCase();
        code += `  /**
   * ${item.content || 'No description available'}
   */
  ${fieldName}: {
`;
        if (item.subItems && item.subItems.length) {
          item.subItems.forEach(subItem => {
            const subFieldName = subItem.title.replace(/\s+/g, '').toLowerCase();
            code += `    /**
     * ${subItem.content || 'No description available'}
     */
    ${subFieldName}: string;
`;
          });
        } else {
          code += '    // Add required fields here\n';
        }
        code += '  };\n\n';
      });
      
      code += `}

/**
 * ${componentName} Component
 * 
 * @component
 * @param {${componentName}Props} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const ${componentName}: React.FC<${componentName}Props> = (props) => {
  // Component logic goes here
  
  return (
    <div className="${componentName.toLowerCase()}-container">
      {/* Component layout structure */}
`;

      list.items.forEach(item => {
        const fieldName = item.title.replace(/\s+/g, '').toLowerCase();
        code += `      <div className="${fieldName}-section">
        {/* ${item.content || 'Section for ' + item.title} */}
`;
        if (item.subItems && item.subItems.length) {
          item.subItems.forEach(subItem => {
            const subFieldName = subItem.title.replace(/\s+/g, '').toLowerCase();
            code += `        <div className="${subFieldName}-container">
          {/* ${subItem.content || 'Container for ' + subItem.title} */}
          {props.${fieldName}.${subFieldName}}
        </div>
`;
          });
        }
        code += `      </div>
`;
      });

      code += `    </div>
  );
};

export default ${componentName};
`;
      return code;
    }
  },
  go: {
    extension: '.go',
    mimeType: 'text/x-go',
    formatter: (list: List) => {
      const componentName = list.name.replace(/\s+/g, '');
      const now = new Date().toISOString();
      
      let code = `// Package main provides the ${componentName} type and related functionality
//
// File: ${componentName}.go
// Description: Go structs for ${list.name} component
// Created: ${now.split('T')[0]}
// Version: 1.0.0

package main

import (
	"fmt"
	"time"
)

`;
      
      if (list.originalText) {
        code += `// ${list.originalText.split('\n').join('\n// ')}
`;
      }
      
      // Generate structs for each subcomponent
      list.items.forEach(item => {
        const structName = item.title.replace(/\s+/g, '');
        code += `// ${structName} represents ${item.content || 'a component section'}
type ${structName} struct {
`;
        if (item.subItems && item.subItems.length) {
          item.subItems.forEach(subItem => {
            const fieldName = subItem.title.replace(/\s+/g, '');
            code += `	// ${subItem.content || 'No description available'}
	${fieldName} string
`;
          });
        } else {
          code += '	// Add required fields here\n';
        }
        code += `}

`;
      });
      
      // Generate the main struct
      code += `// ${componentName} represents the main component
type ${componentName} struct {
`;
      list.items.forEach(item => {
        const fieldName = item.title.replace(/\s+/g, '');
        code += `	// ${item.content || 'No description available'}
	${fieldName} ${fieldName}
`;
          });
      code += `	// Metadata
	CreatedAt time.Time
	Version   string
}

// New${componentName} creates a new instance of ${componentName}
func New${componentName}() *${componentName} {
	return &${componentName}{
		CreatedAt: time.Now(),
		Version:   "1.0.0",
	}
}

// String returns a string representation of ${componentName}
func (c *${componentName}) String() string {
	return fmt.Sprintf("${componentName}(Version: %s, Created: %s)", 
		c.Version, c.CreatedAt.Format(time.RFC3339))
}
`;
      return code;
    }
  },
  rust: {
    extension: '.rs',
    mimeType: 'text/rust',
    formatter: (list: List) => {
      const componentName = list.name.replace(/\s+/g, '');
      const now = new Date().toISOString();
      
      let code = `//! ${componentName}.rs
//! 
//! Rust structs for ${list.name} component
//! Created: ${now.split('T')[0]}
//! Version: 1.0.0

`;
      
      if (list.originalText) {
        code += `/// ${list.originalText.split('\n').join('\n/// ')}
`;
      }
      
      // Generate structs for each subcomponent
      list.items.forEach(item => {
        const structName = item.title.replace(/\s+/g, '');
        code += `/// ${item.content || 'A component section'}
#[derive(Debug, Clone, PartialEq)]
pub struct ${structName} {
`;
        if (item.subItems && item.subItems.length) {
          item.subItems.forEach(subItem => {
            const fieldName = subItem.title.replace(/\s+/g, '').toLowerCase();
            code += `    /// ${subItem.content || 'No description available'}
    pub ${fieldName}: String,
`;
          });
        } else {
          code += '    // Add required fields here\n';
        }
        code += `}

impl ${structName} {
    /// Creates a new instance of ${structName}
    pub fn new() -> Self {
        Self {
`;
        if (item.subItems && item.subItems.length) {
          item.subItems.forEach(subItem => {
            const fieldName = subItem.title.replace(/\s+/g, '').toLowerCase();
            code += `            ${fieldName}: String::new(),
`;
          });
        }
        code += `        }
    }
}

`;
      });
      
      // Generate the main struct
      code += `/// ${componentName} represents the main component
#[derive(Debug)]
pub struct ${componentName} {
`;
      list.items.forEach(item => {
        const fieldName = item.title.replace(/\s+/g, '').toLowerCase();
        const structName = item.title.replace(/\s+/g, '');
        code += `    /// ${item.content || 'No description available'}
    pub ${fieldName}: ${structName},
`;
      });
      code += `    /// Component metadata
    pub created_at: String,
    pub version: String,
}

impl ${componentName} {
    /// Creates a new instance of ${componentName}
    pub fn new() -> Self {
        Self {
`;
      list.items.forEach(item => {
        const fieldName = item.title.replace(/\s+/g, '').toLowerCase();
        const structName = item.title.replace(/\s+/g, '');
        code += `            ${fieldName}: ${structName}::new(),
`;
      });
      code += `            created_at: String::from("${now}"),
            version: String::from("1.0.0"),
        }
    }
}

/// Example usage in main function
fn main() {
    let component = ${componentName}::new();
    println!("Created ${componentName}: {:?}", component);
}
`;
      return code;
    }
  },
  text: {
    extension: '.txt',
    mimeType: 'text/plain',
    formatter: (list: List) => {
      const componentName = list.name;
      const now = new Date().toISOString().split('T')[0];
      
      let text = `===============================================
${componentName.toUpperCase()} COMPONENT SPECIFICATION
===============================================
Created: ${now}
Version: 1.0.0

`;
      
      if (list.originalText) {
        text += `Description:
--------------
${list.originalText}

`;
      }
      
      text += `Component Structure:
-------------------
`;
      
      list.items.forEach(item => {
        text += `\n* ${item.title.toUpperCase()}\n`;
        text += `  ${'-'.repeat(item.title.length)}\n`;
        if (item.content) {
          text += `  Description: ${item.content}\n`;
        }
        if (item.subItems?.length) {
          text += `\n  Sub-Components:\n`;
          item.subItems.forEach(subItem => {
            text += `  • ${subItem.title}\n`;
            if (subItem.content) {
              text += `    Details: ${subItem.content}\n`;
            }
          });
        }
        text += '\n';
      });
      
      text += `===============================================
End of ${componentName} Specification
===============================================`;
      return text;
    }
  },
  html: {
    extension: '.html',
    mimeType: 'text/html',
    formatter: (list: List) => {
      const componentName = list.name.replace(/\s+/g, '');
      const now = new Date().toISOString();
      
      let code = `<!DOCTYPE html>
<!--
  File: ${componentName}.html
  Description: HTML template for ${list.name} component
  Created: ${now.split('T')[0]}
  Version: 1.0.0
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${list.name} Component</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .component-container {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .component-header {
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
    .sub-component {
      margin: 10px 0;
      padding: 10px;
      background-color: #fff;
      border: 1px solid #eee;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <!-- ${list.originalText || `Main container for ${list.name} component`} -->
  <div class="component-container">
    <header class="component-header">
      <h1>${list.name} Component</h1>
    </header>
`;
      
      list.items.forEach(item => {
        const sectionClass = item.title.replace(/\s+/g, '-').toLowerCase();
        code += `    
    <!-- ${item.content || `Section for ${item.title}`} -->
    <section class="section ${sectionClass}">
      <h2>${item.title}</h2>
`;
        if (item.subItems?.length) {
          item.subItems.forEach(subItem => {
            const subComponentClass = subItem.title.replace(/\s+/g, '-').toLowerCase();
            code += `      
      <!-- ${subItem.content || `Sub-component for ${subItem.title}`} -->
      <div class="sub-component ${subComponentClass}">
        <h3>${subItem.title}</h3>
        <p>[${subItem.title} content will go here]</p>
      </div>
`;
          });
        }
        code += `    </section>
`;
      });
      
      code += `  </div>

  <script>
    // JavaScript functionality can be added here
    document.addEventListener('DOMContentLoaded', () => {
      console.log('${componentName} component loaded');
    });
  </script>
</body>
</html>`;
      return code;
    }
  },
  assistant: {
    extension: '.md',
    mimeType: 'text/markdown',
    formatter: (list: List) => {
      const componentName = list.name.replace(/\s+/g, '');
      const now = new Date().toISOString();
      const dateFormatted = now.split('T')[0];
      
      // Start with a markdown document - this will be the manifest
      let md = `# ${list.name} Component Manifest
> Generated on ${dateFormatted} • Version 1.0.0

## Usage Instructions

### For Designers
When creating your component lists in the app:
1. Use descriptive, literal titles for your components (e.g., "User Registration Form" instead of "Cool Signup")
2. The first list you create serves as the component manifest - each item represents a separate component
3. For each component, describe its purpose clearly to help developers implement it correctly
4. Be specific with field names and descriptions to ensure proper implementation

### For Developers
This manifest contains specifications for multiple components and their required fields. The structure:
- The main list represents all components to be implemented
- Each component has its own TypeScript interface and React implementation
- Field specifications include descriptions to guide implementation

## Project Overview

${list.originalText || `This manifest contains specifications for the ${list.name} project.`}

## Instructions for AI Assistants

This file contains specifications for multiple components/page forms to be implemented.
Each component is listed in the manifest below and has its own dedicated section with implementations.

### Component Manifest

This project consists of the following components:
${list.items.map((item, index) => `${index + 1}. **${item.title}** - ${item.content || 'No description available'}`).join('\n')}

---

`;

      // Treat each item in the main list as a separate component
      list.items.forEach((componentItem, componentIndex) => {
        const singleComponentName = componentItem.title.replace(/\s+/g, '');
        
        md += `## ${componentItem.title} Component

> Component ${componentIndex + 1} of ${list.items.length}

### Description

${componentItem.content || 'No description provided for this component.'}

### Field Specifications

${componentItem.subItems && componentItem.subItems.length > 0 
  ? componentItem.subItems.map(field => `- **${field.title}**: ${field.content || 'No description available'}`).join('\n')
  : 'No fields specified for this component.'}

### TypeScript Interface \`${singleComponentName}.ts\`

\`\`\`typescript
/**
 * @file ${singleComponentName}.ts
 * @description TypeScript interface for ${componentItem.title} component
 * @created ${dateFormatted}
 * @version 1.0.0
 */

export interface ${singleComponentName}Props {
${componentItem.subItems && componentItem.subItems.length > 0 
  ? componentItem.subItems.map(field => {
      const fieldName = field.title.replace(/\s+/g, '').toLowerCase();
      return `  /**
   * ${field.content || 'No description available'}
   */
  ${fieldName}: string;
`;
    }).join('')
  : '  // No fields specified for this component\n'}
}
\`\`\`

### React Form Component \`${singleComponentName}Form.tsx\`

\`\`\`tsx
/**
 * @file ${singleComponentName}Form.tsx
 * @description React form component for ${componentItem.title}
 * @created ${dateFormatted}
 * @version 1.0.0
 */

import React, { useState } from 'react';

// Form state interface
interface ${singleComponentName}FormData {
${componentItem.subItems && componentItem.subItems.length > 0 
  ? componentItem.subItems.map(field => {
      const fieldName = field.title.replace(/\s+/g, '').toLowerCase();
      return `  /**
   * ${field.content || 'No description available'}
   */
  ${fieldName}: string;
`;
    }).join('')
  : '  // No fields specified for this component\n'}
}

export const ${singleComponentName}Form: React.FC = () => {
  // Initialize form state with default values
  const [formData, setFormData] = useState<${singleComponentName}FormData>({
${componentItem.subItems && componentItem.subItems.length > 0 
  ? componentItem.subItems.map(field => {
      const fieldName = field.title.replace(/\s+/g, '').toLowerCase();
      return `    ${fieldName}: '',`;
    }).join('\n')
  : '    // No fields to initialize'}
  });

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    // Add your submission logic here
  };

  return (
    <form onSubmit={handleSubmit} className="${singleComponentName.toLowerCase()}-form">
      <h2>${componentItem.title}</h2>
      
${componentItem.subItems && componentItem.subItems.length > 0 
  ? componentItem.subItems.map(field => {
      const fieldName = field.title.replace(/\s+/g, '').toLowerCase();
      return `      <div className="form-field">
        <label htmlFor="${fieldName}">${field.title}</label>
        <input
          id="${fieldName}"
          type="text"
          value={formData.${fieldName}}
          onChange={(e) => handleChange('${fieldName}', e.target.value)}
          placeholder="Enter ${field.title.toLowerCase()}"
        />
      </div>`;
    }).join('\n')
  : '      {/* No fields specified for this form */}'}
      
      <div className="form-actions">
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};
\`\`\`

${componentIndex < list.items.length - 1 ? '---\n\n' : ''}`;
      });

      // Add integration guidance at the end
      md += `
## Implementation Notes for AI Assistants

### Structure of Components

1. The manifest above outlines the complete list of forms/components in this project
2. Each component section includes:
   - Component description
   - Field specifications (the form inputs)
   - TypeScript interface for type checking
   - React form component implementation
   
### Implementation Process

1. Create a separate file for each component above
2. Implement each form following the structure provided
3. Connect the forms to your data management system
4. Apply your project's styling conventions

### Field Type Suggestions

${list.items.map(componentItem => {
  return `- **${componentItem.title}** component:${(componentItem.subItems || []).map(field => `
  - \`${field.title}\`: text input (or appropriate input type based on field name)`).join('')}`;
}).join('\n')}

`;

      return md;
    }
  },
}; 