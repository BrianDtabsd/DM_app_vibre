# App Idea Prompt Template for AI Assistants

Use this template to communicate your app idea to AI coding assistants. Fill in each section with details about your app, then share this with your AI assistant.

## Basic App Information

```
App Name: [Enter a clear, descriptive name]

App Type: [Web app, mobile app, desktop app, etc.]

Primary Purpose: [Describe in 1-2 sentences what your app does]

Target Users: [Who will use this app?]

Similar Apps: [List 2-3 apps that are similar to your idea]
```

## Technical Requirements

```
Frontend Framework: [React, Vue, Angular, Next.js, etc. or "Need recommendation"]

Backend Needs: [API only, full database, serverless, etc. or "Need recommendation"]

Authentication: [Yes/No, and what type - email, social, etc.]

Responsive Design: [Mobile-first, desktop-first, both equally]

Deployment Target: [Web hosting, app store, local only, etc.]
```

## Features and Pages

List the main pages/screens and their key features:

```
1. [Page/Screen Name]: (e.g., Home Page, User Profile, Settings)
   - Purpose: [What this page/screen is for]
   - Key Elements:
     * [Element 1] - [Brief description]
     * [Element 2] - [Brief description]
     * [Element 3] - [Brief description]

2. [Page/Screen Name]:
   - Purpose: [What this page/screen is for]
   - Key Elements:
     * [Element 1] - [Brief description]
     * [Element 2] - [Brief description]
     * [Element 3] - [Brief description]

(Add more pages as needed)
```

## Data Model

Describe the main data types your app will use:

```
1. [Data Type Name]: (e.g., User, Product, Post)
   - Properties:
     * [Property 1]: [Type] - [Description]
     * [Property 2]: [Type] - [Description]
     * [Property 3]: [Type] - [Description]

2. [Data Type Name]:
   - Properties:
     * [Property 1]: [Type] - [Description]
     * [Property 2]: [Type] - [Description]
     * [Property 3]: [Type] - [Description]

(Add more data types as needed)
```

## Design Preferences

```
Color Scheme: [Primary colors, theme reference, or "Need recommendation"]

Design Style: [Minimal, Material Design, Custom, etc.]

Important UI Elements:
1. [Element] - [Specific requirements if any]
2. [Element] - [Specific requirements if any]

Inspiration Links: [Links to designs/sites you like]
```

## Development Priorities

List your priorities in order of importance:

```
1. [First priority] (e.g., "Working prototype even if basic")
2. [Second priority] (e.g., "Clean, organized code")
3. [Third priority] (e.g., "Mobile responsiveness")
```

## Project Constraints

```
Timeline: [Urgent, relaxed, specific deadline]

Technical Skill Level: [Beginner, some experience, etc.]

Must-Have Libraries/Tools: [Any specific requirements]

Limitations: [Any known constraints - budget, technical, etc.]
```

## Instructions for the AI Assistant

```
Starting Point: [New project from scratch, continue from current state, etc.]

Project Structure: [Follow the standard structure from AI_ASSISTANT_GUIDE.md]

Code Style: [Preferences for comments, naming conventions, etc.]

Documentation Needs: [Level of documentation you need]
```

## Example Project Request

Here's a completed example to help you fill out the template:

```
App Name: TaskFlow

App Type: Web application

Primary Purpose: A task management app for small teams to track project progress with visual kanban boards.

Target Users: Small business teams, freelancers working together on projects

Similar Apps: Trello, Asana (simpler version), Monday.com (basic features only)

Frontend Framework: React with TypeScript

Backend Needs: Firebase for database and authentication

Authentication: Yes - Email and Google login

Responsive Design: Both desktop and mobile, but prioritize desktop experience

Deployment Target: Web hosting with custom domain later

Pages/Screens:
1. Dashboard:
   - Purpose: Overview of all projects and recent activity
   - Key Elements:
     * Project cards - Shows project name, progress, and due date
     * Activity feed - Recent updates across all projects
     * Quick add button - Create new project or task quickly

2. Kanban Board:
   - Purpose: Visual task management for a specific project
   - Key Elements:
     * Column structure - To Do, In Progress, Review, Complete
     * Task cards - Draggable between columns
     * Filtering options - By assignee, label, due date

3. User Profile:
   - Purpose: Manage user settings and view assigned tasks
   - Key Elements:
     * Profile information - Name, photo, role
     * Tasks assigned - List of tasks assigned to user
     * Settings - Notification preferences, theme options

Data Model:
1. User:
   - Properties:
     * id: String - Unique identifier
     * name: String - User's full name
     * email: String - User's email address
     * photoURL: String - Profile picture link
     * role: String - User role (Admin, Member)

2. Project:
   - Properties:
     * id: String - Unique identifier
     * name: String - Project name
     * description: String - Project description
     * createdBy: Reference - User who created the project
     * members: Array - List of user references
     * createdAt: Date - Creation timestamp
     * dueDate: Date - Project deadline

3. Task:
   - Properties:
     * id: String - Unique identifier
     * title: String - Task title
     * description: String - Task details
     * status: String - Current column (To Do, In Progress, etc.)
     * assignedTo: Reference - User assigned to the task
     * projectId: Reference - Project the task belongs to
     * priority: String - Priority level (Low, Medium, High)
     * dueDate: Date - Task deadline

Design Preferences:
Color Scheme: Blue and white primary colors, with accent colors for priorities

Design Style: Clean, minimal interface similar to Trello but more professional

Important UI Elements:
1. Task cards - Should be compact but information-rich
2. Drag and drop - Smooth experience for moving tasks
3. Color coding - Visual indicators for priority levels

Development Priorities:
1. Working kanban functionality with drag-and-drop
2. User authentication and basic profile management
3. Mobile responsiveness for checking tasks on the go

Project Constraints:
Timeline: Need a basic working version within 2 weeks
Technical Skill Level: Beginner with basic React knowledge
Limitations: Limited knowledge of backend development, prefer managed solutions

Instructions for AI Assistant:
Starting Point: New project from scratch
Project Structure: Follow standard React application structure
Code Style: Well-commented code with explanations for a beginner
Documentation Needs: Include README with setup instructions and basic user guide
```

---

## How to Use This Template

1. **Copy this entire template** into a text editor
2. **Fill in each section** with details about your app idea
3. **Remove the instructions** and example if desired
4. **Share with your AI assistant** at the beginning of your project
5. **Reference this filled template** whenever restarting conversations with the AI

This comprehensive brief helps AI assistants understand your vision and generate appropriate code that matches your expectations.

## Tips for Better Results

- **Be specific** about what you want, but open to suggestions where you're unsure
- **Prioritize features** clearly so the AI focuses on what matters most
- **Include visual references** when possible (describe or link to similar designs)
- **Update this document** as your project evolves 