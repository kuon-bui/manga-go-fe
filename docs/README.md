# Documentation

Welcome to the Manga Go Frontend documentation! This directory contains comprehensive guides for developing and maintaining the project.

## 📚 Available Documentation

### [CODING_CONVENTIONS.md](./CODING_CONVENTIONS.md)
**Essential coding standards and style guidelines**
- File and component naming conventions
- TypeScript usage and type safety
- Code formatting with Prettier
- ESLint rules and best practices
- Import organization
- Error handling patterns

**Read this if you:**
- Are new to the project
- Need to understand naming conventions
- Want to know how to format code
- Need to understand TypeScript patterns used in the project

---

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Complete overview of project structure and architectural decisions**
- Technology stack explanation
- Folder structure and organization
- Server vs Client Components
- Routing with Next.js App Router
- Data flow patterns
- Styling architecture with Tailwind CSS
- Performance considerations

**Read this if you:**
- Want to understand the overall project structure
- Need to know where to place new files
- Want to understand how data flows through the app
- Need to understand Server Components vs Client Components
- Are working on routing or navigation

---

### [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md)
**In-depth guide for developing React components**
- Component types (UI, Layout, Feature)
- Component structure templates
- Props design best practices
- Styling with Tailwind CSS
- Accessibility guidelines
- Performance optimization
- Common patterns (loading states, compound components)

**Read this if you:**
- Are creating new components
- Need component structure templates
- Want to understand the variant pattern
- Need accessibility guidelines
- Want to optimize component performance
- Need examples of common component patterns

---

### [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
**Complete guide to state management with Zustand**
- When to use Zustand vs local state
- Store structure and organization
- Middleware usage (devtools, persist)
- Performance optimization with selectors
- Common patterns (auth, settings, pagination)
- Testing stores
- Debugging with Redux DevTools

**Read this if you:**
- Are working with global state
- Need to create a new Zustand store
- Want to understand middleware configuration
- Need to optimize re-renders
- Are implementing authentication or settings
- Need to debug state changes

---

## 🚀 Quick Start Guide

### For New Developers

1. **Start with [CODING_CONVENTIONS.md](./CODING_CONVENTIONS.md)**
   - Learn naming conventions
   - Understand code formatting rules
   - Set up your IDE with Prettier and ESLint

2. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)**
   - Understand the project structure
   - Learn about the technology stack
   - Understand Server vs Client Components

3. **Reference [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) when building**
   - Use component templates
   - Follow best practices
   - Ensure accessibility

4. **Check [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for state**
   - Decide between local state and Zustand
   - Follow store patterns
   - Optimize performance

### For Specific Tasks

| Task | Documentation |
|------|---------------|
| Creating a new page | [ARCHITECTURE.md](./ARCHITECTURE.md) - Routing section |
| Creating a UI component | [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) - UI Components |
| Adding global state | [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Store Structure |
| Styling a component | [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) - Styling section |
| Implementing dark mode | [ARCHITECTURE.md](./ARCHITECTURE.md) - Dark Mode section |
| Handling authentication | [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Auth Store pattern |
| Adding TypeScript types | [CODING_CONVENTIONS.md](./CODING_CONVENTIONS.md) - TypeScript section |
| Making components accessible | [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) - Accessibility |
| Optimizing performance | [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) - Performance |

## 🛠️ Development Workflow

### Before Writing Code

1. ✅ Read relevant documentation sections
2. ✅ Understand existing patterns in the codebase
3. ✅ Check for similar existing implementations
4. ✅ Plan your file structure

### While Writing Code

1. ✅ Follow naming conventions (kebab-case files, PascalCase components)
2. ✅ Use TypeScript types for all props and functions
3. ✅ Use `@/` imports for internal modules
4. ✅ Include dark mode styles
5. ✅ Make components responsive
6. ✅ Add accessibility attributes

### Before Committing

1. ✅ Run `npm run format` (Prettier)
2. ✅ Run `npm run lint` (ESLint)
3. ✅ Test your changes manually
4. ✅ Check responsive design
5. ✅ Verify dark mode works
6. ✅ Ensure accessibility

## 📖 Documentation Standards

### When to Update Documentation

Update documentation when you:
- Add new architectural patterns
- Introduce new libraries or tools
- Change existing conventions
- Discover important best practices
- Create reusable patterns

### How to Update Documentation

1. Keep documentation concise and practical
2. Include code examples
3. Use ✅/❌ for good/bad examples
4. Update the table of contents
5. Link between related documents
6. Keep examples up-to-date with the codebase

## 🔍 Finding Information

### Use the Search Function

Each documentation file has a table of contents. Use your editor's search (Ctrl/Cmd+F) to quickly find:
- Specific conventions (e.g., "naming", "imports")
- Code patterns (e.g., "useState", "forwardRef")
- Configuration (e.g., "prettier", "eslint")
- Examples (e.g., "authentication", "pagination")

### Cross-References

Documentation files reference each other:
- **CODING_CONVENTIONS.md** → References TypeScript patterns
- **ARCHITECTURE.md** → Links to component guidelines
- **COMPONENT_GUIDELINES.md** → References state management
- **STATE_MANAGEMENT.md** → Links to architecture patterns

## 🤝 Contributing to Documentation

### Improving Documentation

Found something unclear? Want to add examples?

1. Keep the existing structure and format
2. Follow the writing style of existing docs
3. Add practical examples
4. Keep explanations concise
5. Update cross-references if needed

### Documentation Checklist

Before submitting documentation changes:

- [ ] Content is accurate and tested
- [ ] Examples use current codebase patterns
- [ ] Code examples are properly formatted
- [ ] Table of contents is updated
- [ ] Cross-references are correct
- [ ] No typos or grammatical errors
- [ ] Follows existing formatting style

## 📚 External Resources

### Framework & Libraries
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

### Best Practices
- [React Patterns](https://react.dev/learn)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

### Tools
- [Prettier](https://prettier.io/docs/en/index.html)
- [ESLint](https://eslint.org/docs/latest/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

## 💡 Tips for Success

1. **Read Before Coding**: Spend 10 minutes reading docs before starting a task
2. **Use Templates**: Copy templates from [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md)
3. **Check Examples**: Look at existing code that follows these patterns
4. **Ask Questions**: If documentation is unclear, ask and help improve it
5. **Stay Consistent**: When in doubt, match existing patterns in the codebase

---

**Last Updated:** 2026-03-30

**Maintained By:** Manga Go Frontend Team

**Questions?** Open an issue or contact the team.
