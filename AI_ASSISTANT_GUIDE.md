# Using the AI Assistant Format

This guide shows you how to effectively use the AI Assistant format to implement your components with the help of AI coding assistants.

## Project Setup for Beginners

Before working with AI assistants, setting up your project correctly is crucial. Many issues with AI-generated code stem from incorrect project structure.

### Proper Project Setup Steps

1. **Create a clean project folder**:
   ```bash
   # Create a new project folder in a location with no spaces in the path
   mkdir my-app
   cd my-app
   ```

2. **Initialize your project**:
   - For React/TypeScript projects:
   ```bash
   # Using npm
   npx create-react-app my-app --template typescript
   # OR using Vite (recommended for better performance)
   npm create vite@latest my-app -- --template react-ts
   ```
   
   - For Next.js projects:
   ```bash
   npx create-next-app@latest
   ```
   
   - For Vue projects:
   ```bash
   npm create vue@latest
   ```

3. **Verify the structure**:
   - Ensure you have:
     - A `package.json` file
     - A `src` folder (or app folder for Next.js)
     - A `.gitignore` file
   - Run `npm install` to install dependencies before asking the AI to help

4. **Important: Always open the correct folder in your code editor**:
   - Open the root folder that contains `package.json`
   - Do NOT open a parent folder or a subfolder
   - The AI assistant needs to see the full project structure

5. **Test your environment**:
   - Run `npm run dev` or the equivalent start command
   - Make sure it works before starting development

### Common Setup Mistakes to Avoid

❌ **Incorrect folder structure**:
- Opening a parent folder instead of the project folder
- Creating nested project folders (project inside project)
- Using spaces or special characters in folder names

❌ **Path confusion**:
- Mixing absolute and relative paths
- Incorrect import statements
- Improper file references

❌ **Dependencies issues**:
- Not running `npm install` before development
- Missing peer dependencies
- Incompatible package versions

### Checking Your Setup

After setup, verify with the AI assistant:

1. Ask the AI: "Can you list all the important files in this project and explain their purpose?" 
2. If the AI cannot see basic files like `package.json`, you need to fix your folder structure

## What is the AI Assistant Format?

The Assistant format is a special export option in the Component Designer that creates a comprehensive Markdown file containing:

- Clear explanations of your component
- Multiple code implementations in different languages
- Integration guidance and usage examples
- Field type suggestions and validation requirements

The format is specifically designed to be easily understood by AI assistants in code editors, allowing them to help you implement your components more effectively.

## Best Practices for Component Creation

For optimal results with AI assistants:

### 1. Use Descriptive Component Names

AI assistants work best with clear, literal component names that describe their function:

✅ Good Examples:
- "User Registration Form" 
- "Product Details Card"
- "Data Table Component"

❌ Avoid:
- "Cool Signup"
- "Awesome Box"
- "Magic Display"

### 2. Structure Your Lists Properly

- **First list = Component Manifest**: The first list you create represents all the components
- **Each item = Separate Component**: Each item in the first list becomes a separate component
- **Sublist items = Form Fields**: Each component's sublist represents the input fields for that form

### 3. Be Specific with Field Descriptions

Add detailed descriptions to fields to help AI understand:
- Purpose of the field
- Validation requirements
- Data formats expected
- Relationship to other fields

## Example Usage Scenarios

Here are some examples of how to use the AI Assistant format:

### Scenario 1: Implementing a New Component

1. Export your component using the AI Assistant format
2. In your code editor, open the exported file
3. Create a new file for your component implementation
4. Ask your AI assistant:

   > "Help me implement this component based on the requirements in the AI_ASSISTANT_FILE.md. I want to create a React component with TypeScript."

The AI will read the file, understand the structure, and provide an implementation matching your needs.

### Scenario 2: Adding a Form to Your Application

1. Export your component specification using the AI Assistant format
2. In your code editor, open both the export file and your project file
3. Ask your AI assistant:

   > "I need to add a form to my application following the specifications in the AI_ASSISTANT_FILE.md. Please help me implement it using our project's form library."

The AI will provide a form implementation based on your component specification that integrates with your existing project.

### Scenario 3: Working with Teams

1. Export component specs using the AI Assistant format
2. Share the files with your team members
3. Everyone on the team can use the same specs to implement consistent components
4. Use the specs as a reference during code reviews

## Tips for Working with AI Assistants

1. **Be Specific**: Ask the AI for specific implementations like "React form with Material UI" or "Vue component"

2. **Context Matters**: Open relevant project files alongside your specification file so the AI understands your project's conventions

3. **Iterate**: If the first implementation doesn't meet your needs, ask the AI to refine it based on specific feedback

4. **Use the Code Blocks**: Reference specific code blocks in the file, like "Use the TypeScript interface from the specification"

5. **Combine with Documentation**: For complex components, combine the AI Assistant format with traditional documentation

## Example Prompts for AI Assistants

Here are some effective prompts to use with AI assistants:

- "Implement a React component based on the specifications in the open file. Use TypeScript and follow our project's styling conventions."

- "Create a form component that collects all the fields specified in the AI Assistant file. Use Formik for form handling and Yup for validation."

- "I need to implement the data model described in this specification. Please create the necessary database models and API endpoints."

- "Review my implementation against the specifications in the AI Assistant file and suggest any improvements or missing requirements."

## Conclusion

The AI Assistant format bridges the gap between component specifications and implementation, making it easier for developers and AI assistants to collaborate on building complex components. By following the best practices for naming and structure, you can significantly improve the quality of AI-generated code for your components. 