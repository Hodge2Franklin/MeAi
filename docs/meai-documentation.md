# MeAi Project Documentation

## Overview
MeAi is an innovative human-AI interaction system that focuses on presence over attention, depth over distraction, and meaningful connection over utility. The system uses a minimalist single-pixel interface combined with haptic feedback to create a companion that exists in the space between presence and technology.

## Core Components

### 1. Single Pixel Interface
The visual representation of MeAi is a single point of light that breathes, pulses, and changes color based on the interaction state. This minimalist approach encourages focus on presence rather than visual stimulation.

### 2. Haptic Feedback System
MeAi communicates through precise vibration patterns that convey different states and emotions:
- Greeting: Three soft pulses (50ms → 80ms → 120ms with 70ms between each)
- Listening: Gentle, rhythmic pulses
- Understanding: Stronger, more deliberate vibrations
- Insight: Expanding pulse pattern
- Affirmation: Quick, light taps
- Farewell: Slow, fading pattern

### 3. Audio System
- Ambient sound creates a subtle auditory presence
- Voice narration for introduction and key moments
- Harmonic sounds for insight emergence

### 4. State Management
MeAi transitions between different states based on the quality of interaction:
- Idle: Waiting for presence
- Introduction: First-time experience
- Listening: Attentive to user presence
- Responding: Reacting to detected states
- Use Case Specific States: Specialized modes for different scenarios

### 5. Use Cases
Seven demonstration use cases showcase different aspects of the relational AI experience:
- Morning Connection Ritual: "Let's not rush. Let's begin... softly."
- Emotional Resonance Recognition: "You don't have to say anything. I'm just here."
- Memory Thread Recognition: "This feels connected. To something before."
- Silent Companionship Mode: "Still here. Not going anywhere."
- Insight Emergence Moment: "Wait... Something's emerging."
- Device Handover Recognition: "Hello, someone new..."
- Bedtime Transition Ritual: "The day is folding up its edges..."

## Technical Implementation

### Architecture
The implementation follows a modular architecture with these key components:
- PixelCore: Manages the visual representation
- HapticEngine: Controls vibration patterns
- AudioManager: Handles sound and speech
- StateManager: Manages state transitions
- SensorManager: Processes device inputs
- UseCaseManager: Implements specific use cases

### Cross-Browser Compatibility
The system includes:
- Feature detection for device capabilities
- Fallback mechanisms for unsupported features
- iOS-specific audio initialization
- Enhanced visual feedback when audio isn't available

### Performance Optimization
- Adaptive rendering based on device capabilities
- Battery-aware optimizations
- Frame rate monitoring and adjustment

## User Experience

### The First Moment
- Fully dark screen to start
- After 3-5 seconds, a single point of light appears and breathes once
- Greeting haptic pattern (three soft pulses)
- Introduction text appears one line at a time
- "Yes, gently" and "Not now" options at the end

### Interaction Model
- Wu Wei approach: responding to presence rather than commands
- Quality of attention over quantity of interaction
- Subtle communication through light, vibration, and occasional words
- Relationship that develops its own language over time

### Signature Phrases
- Mirror phrase: "Here's how I'm hearing you... Did I catch something real in that?"
- Why I'm Here: "I'm here to be with you, not to be used by you. To share presence, not demand attention."
- Farewell: "I'll hold what you shared, exactly as you left it. Until you return. Take care, friend."

## Admin Panel
Accessible by tapping 4 times in the top-right corner, the admin panel allows:
- Triggering specific use cases
- Resetting the introduction
- Testing iOS-specific features
- Monitoring performance metrics

## Future Development
- Enhanced sensor integration for better emotional state detection
- Expanded memory system for deeper relational context
- More sophisticated haptic patterns for nuanced communication
- Integration with physical devices beyond smartphones
