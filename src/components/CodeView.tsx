import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  SelectChangeEvent,
  Button,
  Menu,
  Typography,
  Chip,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import { List, ListItem } from '../types';
import JSZip from 'jszip';
import { EXPORT_FORMATS } from '../utils/storage';

// Custom syntax highlighting theme
const customTheme = `
  code[class*="language-"],
  pre[class*="language-"] {
    color: #e3e3e3;
    background: none;
    font-family: 'JetBrains Mono', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
    tab-size: 2;
    hyphens: none;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6a9955;
  }

  .token.punctuation {
    color: #d4d4d4;
  }

  .token.property,
  .token.keyword,
  .token.tag {
    color: #569cd6;
  }

  .token.class-name {
    color: #4ec9b0;
  }

  .token.string,
  .token.attr-value {
    color: #ce9178;
  }

  .token.boolean,
  .token.number {
    color: #b5cea8;
  }

  .token.selector,
  .token.attr-name,
  .token.function {
    color: #dcdcaa;
  }

  .token.operator {
    color: #d4d4d4;
  }

  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #9cdcfe;
  }

  .token.regex,
  .token.important {
    color: #d16969;
  }
`;

type CodeFormat = 
  | 'typescript' 
  | 'javascript' 
  | 'python' 
  | 'json' 
  | 'html' 
  | 'jsx'
  | 'tsx'
  | 'scss'
  | 'css'
  | 'java'
  | 'kotlin'
  | 'swift'
  | 'go'
  | 'rust'
  | 'assistant';

interface CodeViewProps {
  list: List;
  color: string;
}

const formatters: Record<CodeFormat, (list: List) => string> = {
  typescript: (list: List) => {
    let code = `// ${list.name} Component Types\n\n`;
    code += `interface ${list.name.replace(/\s+/g, '')}Props {\n`;
    list.items.forEach(item => {
      code += `  /** ${item.content || ''} */\n`;
      code += `  ${item.title.toLowerCase()}: {\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `    /** ${subItem.content || ''} */\n`;
          code += `    ${subItem.title.toLowerCase()}: string;\n`;
        });
      }
      code += '  };\n';
    });
    code += '}\n\n';
    code += `export const ${list.name.replace(/\s+/g, '')}: React.FC<${list.name.replace(/\s+/g, '')}Props> = () => {\n`;
    code += '  return (\n    <div>\n      {/* Implementation */}\n    </div>\n  );\n};';
    return code;
  },

  javascript: (list: List) => {
    let code = `// ${list.name} Component\n\n`;
    code += `class ${list.name.replace(/\s+/g, '')} {\n`;
    list.items.forEach(item => {
      code += `  // ${item.content || ''}\n`;
      code += `  ${item.title.toLowerCase()} = {\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `    // ${subItem.content || ''}\n`;
          code += `    ${subItem.title.toLowerCase()}: '',\n`;
        });
      }
      code += '  };\n\n';
    });
    code += '}\n\n';
    code += `export default ${list.name.replace(/\s+/g, '')};`;
    return code;
  },

  python: (list: List) => {
    let code = `# ${list.name} Class\n\n`;
    code += `class ${list.name.replace(/\s+/g, '')}:\n`;
    code += '    """';
    if (list.originalText) {
      code += `\n    ${list.originalText.split('\n').join('\n    ')}`;
    }
    code += '\n    """\n\n';
    code += '    def __init__(self):\n';
    list.items.forEach(item => {
      code += `        # ${item.content || ''}\n`;
      code += `        self.${item.title.toLowerCase().replace(/\s+/g, '_')} = {\n`;
      if (item.subItems?.length) {
        item.subItems.forEach(subItem => {
          code += `            # ${subItem.content || ''}\n`;
          code += `            '${subItem.title.toLowerCase()}': None,\n`;
        });
      }
      code += '        }\n\n';
    });
    return code;
  },

  json: (list: List) => {
    const obj: any = {
      name: list.name,
      description: list.originalText || '',
      items: list.items.map(item => ({
        title: item.title,
        description: item.content || '',
        subItems: item.subItems?.map(subItem => ({
          title: subItem.title,
          description: subItem.content || '',
        })) || [],
      })),
    };
    return JSON.stringify(obj, null, 2);
  },

  html: (list: List) => {
    let code = `<!-- ${list.name} Component Template -->\n`;
    code += '<div class="component">\n';
    code += `  <h2>${list.name}</h2>\n`;
    if (list.originalText) {
      code += `  <!-- ${list.originalText} -->\n`;
    }
    list.items.forEach(item => {
      code += '  <section class="item">\n';
      code += `    <h3>${item.title}</h3>\n`;
      if (item.content) {
        code += `    <!-- ${item.content} -->\n`;
      }
      if (item.subItems?.length) {
        code += '    <div class="sub-items">\n';
        item.subItems.forEach(subItem => {
          code += '      <div class="sub-item">\n';
          code += `        <h4>${subItem.title}</h4>\n`;
          if (subItem.content) {
            code += `        <!-- ${subItem.content} -->\n`;
          }
          code += '      </div>\n';
        });
        code += '    </div>\n';
      }
      code += '  </section>\n';
    });
    code += '</div>';
    return code;
  },

  jsx: (list: List) => {
    let code = `// ${list.name} JSX Component\n\n`;
    code += `import React from 'react';\n\n`;
    code += `const ${list.name.replace(/\s+/g, '')} = () => {\n`;
    code += '  return (\n';
    code += '    <div className="component">\n';
    list.items.forEach(item => {
      code += `      {/* ${item.content || ''} */}\n`;
      code += `      <div className="${item.title.toLowerCase()}">\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `        {/* ${subItem.content || ''} */}\n`;
          code += `        <div className="${subItem.title.toLowerCase()}">\n`;
          code += '        </div>\n';
        });
      }
      code += '      </div>\n';
    });
    code += '    </div>\n';
    code += '  );\n};\n\n';
    code += `export default ${list.name.replace(/\s+/g, '')};`;
    return code;
  },

  tsx: (list: List) => {
    let code = `// ${list.name} TSX Component\n\n`;
    code += `import React from 'react';\n\n`;
    code += `interface ${list.name.replace(/\s+/g, '')}Props {\n`;
    list.items.forEach(item => {
      code += `  /** ${item.content || ''} */\n`;
      code += `  ${item.title.toLowerCase()}: {\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `    /** ${subItem.content || ''} */\n`;
          code += `    ${subItem.title.toLowerCase()}: string;\n`;
        });
      }
      code += '  };\n';
    });
    code += '}\n\n';
    code += `const ${list.name.replace(/\s+/g, '')}: React.FC<${list.name.replace(/\s+/g, '')}Props> = () => {\n`;
    code += '  return (\n';
    code += '    <div className="component">\n';
    list.items.forEach(item => {
      code += `      {/* ${item.content || ''} */}\n`;
      code += `      <div className="${item.title.toLowerCase()}">\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `        {/* ${subItem.content || ''} */}\n`;
          code += `        <div className="${subItem.title.toLowerCase()}">\n`;
          code += '        </div>\n';
        });
      }
      code += '      </div>\n';
    });
    code += '    </div>\n';
    code += '  );\n};\n\n';
    code += `export default ${list.name.replace(/\s+/g, '')};`;
    return code;
  },

  scss: (list: List) => {
    let code = `// ${list.name} Styles\n\n`;
    code += '.component {\n';
    list.items.forEach(item => {
      code += `  // ${item.content || ''}\n`;
      code += `  .${item.title.toLowerCase()} {\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `    // ${subItem.content || ''}\n`;
          code += `    .${subItem.title.toLowerCase()} {\n`;
          code += '    }\n';
        });
      }
      code += '  }\n\n';
    });
    code += '}';
    return code;
  },

  css: (list: List) => {
    let code = `/* ${list.name} Styles */\n\n`;
    code += '.component {\n}\n\n';
    list.items.forEach(item => {
      code += `/* ${item.content || ''} */\n`;
      code += `.component .${item.title.toLowerCase()} {\n}\n\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `/* ${subItem.content || ''} */\n`;
          code += `.component .${item.title.toLowerCase()} .${subItem.title.toLowerCase()} {\n}\n`;
        });
      }
    });
    return code;
  },

  java: (list: List) => {
    let code = `// ${list.name} Class\n\n`;
    code += `public class ${list.name.replace(/\s+/g, '')} {\n`;
    list.items.forEach(item => {
      code += `    // ${item.content || ''}\n`;
      code += `    private final class ${item.title.replace(/\s+/g, '')} {\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `        // ${subItem.content || ''}\n`;
          code += `        private String ${subItem.title.toLowerCase()};\n`;
        });
      }
      code += '    }\n\n';
    });
    code += '}';
    return code;
  },

  kotlin: (list: List) => {
    let code = `// ${list.name} Class\n\n`;
    code += `data class ${list.name.replace(/\s+/g, '')}(\n`;
    list.items.forEach((item, index) => {
      code += `    // ${item.content || ''}\n`;
      code += `    val ${item.title.toLowerCase()}: ${item.title.replace(/\s+/g, '')}Data${index < list.items.length - 1 ? ',' : ''}\n`;
    });
    code += ') {\n\n';
    list.items.forEach((item, index) => {
      code += `    data class ${item.title.replace(/\s+/g, '')}Data(\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems?.forEach((subItem, subIndex) => {
          code += `        // ${subItem.content || ''}\n`;
          code += `        val ${subItem.title.toLowerCase()}: String${subIndex < item.subItems!.length - 1 ? ',' : ''}\n`;
        });
      }
      code += '    )\n\n';
    });
    code += '}';
    return code;
  },

  swift: (list: List) => {
    let code = `// ${list.name} Class\n\n`;
    code += `struct ${list.name.replace(/\s+/g, '')} {\n`;
    list.items.forEach(item => {
      code += `    // ${item.content || ''}\n`;
      code += `    struct ${item.title.replace(/\s+/g, '')} {\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `        // ${subItem.content || ''}\n`;
          code += `        var ${subItem.title.toLowerCase()}: String\n`;
        });
      }
      code += '    }\n\n';
    });
    code += '}';
    return code;
  },

  go: (list: List) => {
    let code = `// ${list.name} Types\n\n`;
    code += `package main\n\n`;
    code += `type ${list.name.replace(/\s+/g, '')} struct {\n`;
    list.items.forEach(item => {
      code += `    // ${item.content || ''}\n`;
      code += `    ${item.title.replace(/\s+/g, '')} struct {\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `        // ${subItem.content || ''}\n`;
          code += `        ${subItem.title.replace(/\s+/g, '')} string\n`;
        });
      }
      code += '    }\n';
    });
    code += '}';
    return code;
  },

  rust: (list: List) => {
    let code = `// ${list.name} Types\n\n`;
    code += `#[derive(Debug)]\n`;
    code += `struct ${list.name.replace(/\s+/g, '')} {\n`;
    list.items.forEach(item => {
      code += `    // ${item.content || ''}\n`;
      code += `    ${item.title.toLowerCase()}: ${item.title.replace(/\s+/g, '')}Data,\n`;
    });
    code += '}\n\n';
    list.items.forEach(item => {
      code += `#[derive(Debug)]\n`;
      code += `struct ${item.title.replace(/\s+/g, '')}Data {\n`;
      if (item.subItems && item.subItems.length) {
        item.subItems.forEach(subItem => {
          code += `    // ${subItem.content || ''}\n`;
          code += `    ${subItem.title.toLowerCase()}: String,\n`;
        });
      }
      code += '}\n\n';
    });
    return code;
  },

  assistant: (list: List) => {
    let code = `# ${list.name} Component\n\n`;
    code += `## ${list.name}\n\n`;
    code += `### Description\n\n`;
    if (list.originalText) {
      code += `${list.originalText}\n\n`;
    }
    code += `### Implementation\n\n`;
    list.items.forEach(item => {
      code += `#### ${item.title}\n\n`;
      if (item.content) {
        code += `${item.content}\n\n`;
      }
      if (item.subItems && item.subItems.length) {
        code += '##### Sub-items\n\n';
        item.subItems.forEach(subItem => {
          code += `###### ${subItem.title}\n\n`;
          if (subItem.content) {
            code += `${subItem.content}\n\n`;
          }
        });
      }
    });
    return code;
  },
};

export const CodeView: React.FC<CodeViewProps> = ({ list, color }) => {
  const [format, setFormat] = useState<keyof typeof EXPORT_FORMATS>('assistant');
  const [code, setCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Add custom theme to document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customTheme;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const newCode = EXPORT_FORMATS[format].formatter(list);
    setCode(newCode);
    
    // Use a slight delay to ensure the DOM is updated before highlighting
    setTimeout(() => {
    Prism.highlightAll();
    }, 100);
  }, [list, format]);

  const handleFormatChange = (event: SelectChangeEvent<keyof typeof EXPORT_FORMATS>) => {
    setFormat(event.target.value as keyof typeof EXPORT_FORMATS);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Get extension for current format
  const getExtension = (format: string) => {
    return EXPORT_FORMATS[format]?.extension || '.txt';
  };

  // Handle showing an info tooltip about the AI Assistant format
  const renderFormatHelp = () => {
    if (format === 'assistant') {
      return (
        <Chip 
          icon={<AIIcon fontSize="small" />}
          label="AI Assistant Format" 
          size="small"
          color="primary"
          sx={{ 
            ml: 2,
            backgroundColor: 'rgba(138, 43, 226, 0.1)',
            color: '#8A2BE2',
            borderColor: '#8A2BE2',
            '& .MuiChip-icon': {
              color: '#8A2BE2',
            }
          }}
        />
      );
    }
    return null;
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Format</InputLabel>
          <Select
            value={format}
            label="Format"
            onChange={handleFormatChange}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: color,
              },
            }}
          >
              <MenuItem value="assistant" sx={{ fontWeight: 'bold' }}>
                ASSISTANT (.md) 
              </MenuItem>
              <MenuItem disabled sx={{ opacity: 0.7, pointerEvents: 'none' }}>
                ────────────────
              </MenuItem>
              {Object.entries(EXPORT_FORMATS)
                .filter(([key]) => key !== 'assistant')
                .map(([key, { extension }]) => (
              <MenuItem key={key} value={key}>
                {key.toUpperCase()} ({extension})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
          {renderFormatHelp()}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Copy code to clipboard" placement="top">
            <IconButton
              size="small"
              onClick={handleCopyCode}
              sx={{ color: copySuccess ? 'success.main' : color }}
            >
              <CopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {format === 'assistant' && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(138, 43, 226, 0.05)', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#8A2BE2', mb: 1 }}>
            AI Assistant-Ready Format
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            This format creates a markdown file with multiple implementations in different languages, designed specifically for AI assistants.
          </Typography>
          <Typography variant="body2">
            It includes clear instructions, code blocks for multiple languages, and integration guidelines that help AI assistants understand and use your component definitions.
          </Typography>
        </Box>
      )}

      {/* File extension badge */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <Box 
          component="span" 
          sx={{ 
            display: 'inline-block',
            backgroundColor: 'rgba(0,0,0,0.7)', 
            color: '#fff', 
            px: 1, 
            py: 0.5, 
            borderRadius: '4px 4px 0 0',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
          }}
        >
          {list.name.replace(/\s+/g, '')}{getExtension(format)}
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: '#1e1e1e',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          maxHeight: format === 'assistant' ? '800px' : '600px',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <pre className={`language-${format === 'assistant' ? 'markdown' : String(format)}`}>
          <code>{code}</code>
        </pre>
      </Paper>
      
      {/* Features explanation */}
      <Box sx={{ mt: 2, px: 1 }}>
        {format === 'assistant' ? (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              • Generates multiple implementation examples in one file
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              • Includes clear instructions for AI assistants
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              • Ready-to-use with code editors that have AI assistants
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              • Standardized code with proper documentation and headers
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              • Export formats support metadata and version information
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              • Generated code follows language-specific best practices
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}; 