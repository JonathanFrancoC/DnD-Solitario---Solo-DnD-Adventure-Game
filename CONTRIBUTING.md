# Contributing to D&D Solitario

Thank you for your interest in contributing to D&D Solitario! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic knowledge of React and Electron
- Understanding of D&D 5e rules (helpful but not required)

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/yourusername/dnd-solitario.git
cd dnd-solitario

# Install dependencies
npm install

# Start development server
npm run dev
```

## Code Style Guidelines

### Language Usage
- **User Interface**: Spanish (español)
- **Code Comments**: English
- **Documentation**: English
- **Console Logs**: Spanish with English translations

### Example:
```javascript
// This is a comment in English
console.log('Cargando datos de la campaña...'); // Loading campaign data

const handleCharacterCreation = () => {
  // Function logic here
};
```

### File Structure
- Use descriptive file and folder names
- Group related components in folders
- Keep utility functions in `src/utils/`
- Store game data in `src/data/`

### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use context for global state management
- Follow the existing component structure

## Contribution Areas

### High Priority
- **AI Integration**: Improve AI responses and context awareness
- **Combat System**: Enhance combat mechanics and UI
- **Character Progression**: Level up system and advancement
- **Spell System**: Complete spell database and management

### Medium Priority
- **UI/UX Improvements**: Better user experience
- **Performance Optimization**: Faster loading and responsiveness
- **Save System**: Enhanced data persistence
- **Multi-language Support**: Additional language options

### Low Priority
- **Additional Content**: New races, classes, or backgrounds
- **Advanced Features**: Complex game mechanics
- **Integration**: Third-party tool compatibility

## Pull Request Process

### Before Submitting
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes following the code style guidelines
4. **Test** your changes thoroughly
5. **Update** documentation if needed

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] No console errors
- [ ] UI/UX verified

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Additional Notes
Any additional information about the changes
```

### Review Process
1. **Automated Checks**: CI/CD pipeline validation
2. **Code Review**: Maintainer review of code quality
3. **Testing**: Verification of functionality
4. **Approval**: Merge after approval

## Bug Reports

### Before Reporting
1. Check existing issues
2. Test with latest version
3. Gather relevant information

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Node.js version: [e.g., 18.17.0]
- Application version: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

## Feature Requests

### Before Requesting
1. Check existing feature requests
2. Consider the project scope
3. Provide detailed description

### Feature Request Template
```markdown
## Feature Description
Clear description of the requested feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Any other relevant information
```

## Development Guidelines

### AI Integration
- Test with both OpenAI and Ollama
- Ensure proper error handling
- Maintain context awareness
- Follow prompt engineering best practices

### UI Components
- Use consistent styling
- Implement responsive design
- Follow accessibility guidelines
- Test on different screen sizes

### Data Management
- Validate input data
- Handle errors gracefully
- Maintain data integrity
- Use proper file structure

### Performance
- Optimize for large datasets
- Minimize re-renders
- Use proper memoization
- Monitor memory usage

## Code Review Checklist

### For Contributors
- [ ] Code follows style guidelines
- [ ] Comments are in English
- [ ] User-facing text is in Spanish
- [ ] No console errors
- [ ] Proper error handling
- [ ] Tests pass (if applicable)

### For Reviewers
- [ ] Code quality and style
- [ ] Functionality verification
- [ ] Performance considerations
- [ ] Security implications
- [ ] Documentation updates

## Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism
- Focus on what's best for the community

### Be Collaborative
- Help others when possible
- Share knowledge and experience
- Work together toward common goals
- Give credit where due

### Be Professional
- Keep discussions on-topic
- Use clear and concise communication
- Follow the project's code of conduct
- Maintain a positive attitude

## Getting Help

### Resources
- **Documentation**: Check the README and Wiki
- **Issues**: Search existing issues for solutions
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our Discord server (if available)

### Contact
- **Maintainers**: @yourusername
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community acknowledgments

Thank you for contributing to D&D Solitario! Your efforts help make this project better for everyone.
