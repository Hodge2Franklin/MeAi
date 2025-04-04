# User Guide for MeAI

This guide provides step-by-step instructions for using the MeAI application, designed specifically for non-programmers.

## Getting Started

### Opening the Application

1. Navigate to the `src` folder in this repository
2. Open the `index.html` file in a modern web browser (Chrome, Firefox, Safari, or Edge)
3. Allow microphone access when prompted (if you want to use voice input)
4. The application will load with a welcome message

### First-Time Setup

When you first open MeAI, you'll see an onboarding guide that will walk you through:
- How to interact with MeAI
- How to control ambient sound
- How to use voice input
- How to adjust settings

You can access this guide again at any time by clicking the "Help" button.

## Basic Interaction

### Text Conversation

1. Type your message in the input field at the bottom of the screen
2. Click the "Send" button or press Enter
3. MeAI will respond with text and voice
4. Your conversation history will be displayed in the main area

### Voice Conversation

1. Click the microphone button (🎤)
2. Speak your message clearly
3. The microphone will automatically stop recording when you finish speaking
4. MeAI will respond with text and voice

## Controls and Settings

### Ambient Sound

- **Toggle Button**: Turn ambient sound on or off
- **Volume Slider**: Adjust the volume of the ambient sound
- **Current Soundscape**: The status display shows which soundscape is currently playing

The ambient sound will change styles intermittently, creating a dynamic audio environment.

### Voice Settings

- **Test Voice Button**: Play a sample voice message
- **Volume Slider**: Adjust the volume of MeAI's voice
- **Voice Status**: The status display shows the current state of the voice system

### Help and Information

- **Help Button**: Access the onboarding guide
- **Status Display**: Shows the current state of ambient sound and voice systems

## Visual Elements

### The Pixel

The central pixel represents MeAI and changes based on the emotional context of your conversation:

- **Joy**: Bright, bouncy movements
- **Reflective**: Slow, gentle pulsing
- **Curious**: Quick, inquisitive movements
- **Excited**: Rapid, energetic movements
- **Empathetic**: Warm, responsive movements
- **Calm**: Slow, steady pulsing
- **Neutral**: Standard, balanced movements

### Background

The background responds to the conversation and changes over time:
- Colors shift based on emotional context
- Elements move and evolve during your interaction
- Subtle animations create an immersive environment

## Advanced Features

### Conversation Memory

MeAI remembers your previous interactions and uses this memory to:
- Maintain context throughout your conversation
- Reference past topics when relevant
- Understand your preferences over time
- Provide more personalized responses

### Emotional Intelligence

MeAI can:
- Detect emotions in your messages
- Respond with appropriate emotional tone
- Show empathy and understanding
- Adapt its responses based on your emotional patterns

### Natural Conversation

MeAI creates natural-feeling conversation through:
- Dynamic response timing based on message complexity
- Contextual follow-up questions
- Smooth topic transitions
- Natural language variations
- Conversational repair when misunderstandings occur

## Troubleshooting

### Sound Issues

If ambient sound or voice isn't working:
1. Check that your device's sound is turned on and volume is up
2. Make sure you've allowed the browser to play audio
3. Try toggling the ambient sound off and on again
4. Click the Test Voice button to check voice synthesis

### Microphone Issues

If voice input isn't working:
1. Make sure you've allowed microphone access in your browser
2. Check that your microphone is properly connected and working
3. Try using text input instead

### Performance Issues

If the application seems slow:
1. Close other browser tabs and applications
2. Refresh the page
3. Try using a different browser

## Customization Without Coding

You can make basic customizations without programming knowledge:

### Changing Welcome Message

1. Open `src/index.html` in a text editor
2. Find the line containing `const welcomeMessage = "Hello, I'm MeAI..."`
3. Change the text between the quotation marks
4. Save the file and refresh the application

### Adjusting Animation Speed

1. Open `src/visual/pixel-animation-system.js` in a text editor
2. Find the section with animation settings (look for comments)
3. Modify the values to adjust animation speed
4. Save the file and refresh the application

### Changing Colors

1. Open `src/styles.css` in a text editor
2. Look for color codes (like #123456)
3. Replace them with your preferred colors
4. Save the file and refresh the application

## Getting Help

If you encounter issues or need assistance:

1. Check this user guide and the technical documentation
2. Look for comments in the code (lines starting with //)
3. When working with an AI assistant, reference this repository and follow the thread persistence instructions

Remember to follow the thread persistence instructions in `guides/thread_persistence_instructions.md` to maintain continuity between conversations and ensure you never lose your work.
