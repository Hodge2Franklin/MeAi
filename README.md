# MeAI - Your Relational AI Companion

Welcome to the MeAI project! This repository contains an enhanced AI companion that creates an immersive and emotionally intelligent conversational experience.

## For Non-Programmers

This README is designed specifically for non-programmers to help you navigate and understand the MeAI project.

### What is MeAI?

MeAI is a relational AI companion that:
- Responds to your messages with emotionally intelligent conversation
- Creates an ambient audio environment that changes over time
- Displays visual elements that reflect the emotional state of the conversation
- Remembers previous interactions to create a more personalized experience

### Repository Structure

This repository is organized in a user-friendly way:

- **`src/`** - Contains all the source code
  - **`src/audio/`** - Audio system components
  - **`src/visual/`** - Visual system components
  - **`src/conversation/`** - Conversation system components
  - **`src/index.html`** - The main application file

- **`docs/`** - Contains detailed technical documentation
  - **`docs/technical_documentation.md`** - Comprehensive documentation of all features

- **`guides/`** - Contains user guides and instructions
  - **`guides/thread_persistence_instructions.md`** - Instructions for maintaining continuity between conversations
  - **`guides/user_guide.md`** - Guide for using the MeAI application

- **`backups/`** - Contains backup files of all components

### How to Use MeAI

1. **Running the Application**:
   - Open the `src/index.html` file in a modern web browser (Chrome, Firefox, Safari, or Edge)
   - Allow microphone access if you want to use voice input

2. **Interacting with MeAI**:
   - Type messages in the input field and press Send
   - Or click the microphone button to speak your message
   - MeAI will respond with text and voice

3. **Controls**:
   - Toggle ambient sound on/off with the dedicated button
   - Adjust ambient sound volume with the slider
   - Test voice synthesis with the Test Voice button
   - Adjust voice volume with the slider
   - Access help and onboarding with the Help button

### Making Changes Without Coding

As a non-programmer, you can still customize certain aspects of MeAI:

1. **Changing Text Content**:
   - Open the `src/index.html` file in a text editor
   - Look for text between quotation marks (") to modify welcome messages and instructions

2. **Adjusting Settings**:
   - In `src/index.html`, find the "Initialize all systems" section
   - You can modify values like volume settings and animation speeds

3. **Visual Appearance**:
   - Basic color and layout changes can be made in `src/styles.css`
   - Look for color codes (like #123456) and change them to your preferred colors

### Maintaining Your Work

To ensure you never lose your work:

1. **Follow the Thread Persistence Instructions**:
   - See `guides/thread_persistence_instructions.md` for detailed guidance
   - This is crucial for maintaining continuity between conversations

2. **Regular Backups**:
   - Copy the entire repository to a safe location periodically
   - Or use the backup system described in the thread persistence instructions

3. **Document Your Changes**:
   - Keep notes about any modifications you make
   - Update the documentation when you make significant changes

### Getting Help

If you encounter issues or need assistance:

1. **Check the Documentation**:
   - Most questions are answered in the technical documentation
   - User guides provide step-by-step instructions for common tasks

2. **Look for Comments**:
   - The code contains helpful comments (lines starting with //)
   - These explain what different parts do in non-technical language

3. **Ask for Help**:
   - When working with an AI assistant, reference this repository
   - Follow the thread persistence instructions to maintain context

## Technical Overview

For those interested in the technical details, MeAI includes:

- Dynamic ambient sound system with multiple soundscapes
- Pixel animation with emotional states
- Dynamic background system with responsive elements
- Conversation memory system with short-term and long-term storage
- Emotional intelligence framework
- Natural conversation flow with contextual responses
- Interface animations and transitions

## Future Enhancements

Potential areas for future development include:

- Advanced personalization with user profiles
- Expanded conversation capabilities
- Additional sensory experiences
- Accessibility improvements
- Performance optimizations

---

Thank you for using MeAI! We hope it provides a meaningful and engaging experience.
