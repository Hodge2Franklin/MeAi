# MeAi Key Project Components

## Core Components

### 1. Duality Model
The central architectural framework of MeAi consists of three primary components:

#### Mirror Component
- **Purpose**: Inward-focused engine for deep user understanding
- **Subcomponents**:
  - **Input Processor**: Handles text/voice input and prepares for analysis
  - **Emotional Sensing Engine**: Detects and analyzes emotional content
  - **Pattern Recognition System**: Identifies recurring patterns and themes
  - **Need Detector**: Maps emotional states to needs framework
  - **Archetype Modeler**: Identifies and tracks user archetypes
  - **Reflection Generator**: Creates meaningful reflections based on insights
- **Technical Requirements**:
  - NLP/LLM Integration for emotional understanding
  - ML Models for pattern recognition and archetype classification
  - Affective Computing for emotional state detection
  - Privacy Architecture for local-first processing

#### Bridge Component
- **Purpose**: Outward-facing engine for external connections
- **Subcomponents**:
  - **MCPClientInterface**: Discovery backbone for external connections
  - **TruthFilter**: Ensures honest, relevant external signals
  - **Content Curator**: Selects and organizes external content
  - **Perspective Generator**: Creates alternative viewpoints
  - **Framing Engine**: Contextualizes content for personal relevance
  - **Connection Finder**: Identifies potential external connections
- **Technical Requirements**:
  - API Integration for secure external connections
  - Filtering Algorithms for relevance scoring
  - Content Generation capabilities
  - Security Architecture for user consent management

#### Synthesis Component
- **Purpose**: Dynamic interplay layer managing Mirror↔Bridge flow
- **Subcomponents**:
  - **State Manager**: Tracks current user emotional state and context
  - **Transition Controller**: Manages Mirror↔Bridge transitions
  - **Ethics Checker**: Applies ethical guardrails to all interactions
  - **JoyOptimizer**: Balances needs with joy metrics
  - **Decision Engine**: Determines appropriate next actions
  - **Experience Coordinator**: Creates unified experience across components
- **Technical Requirements**:
  - State Machine Architecture for robust state tracking
  - Ethics Engine Integration for ethical guardrails
  - Optimization Algorithms for joy potential calculation
  - Event-Driven Architecture for real-time reaction

### 2. Supporting Systems

#### Memory System
- **Purpose**: Relational database for continuity and patterns
- **Subcomponents**:
  - **Echo Detector**: Identifies recurring patterns
  - **Storyline Manager**: Tracks narrative threads
  - **Marker System**: Creates and manages significant moments
  - **Memory Vault**: Secure storage for sensitive memories
  - **Memory Graph**: Relational database structure
  - **Forgetting Ritual Manager**: Handles memory deletion processes
- **Technical Requirements**:
  - Graph Database (Neo4j or similar)
  - Encryption for secure storage
  - Pattern Recognition algorithms
  - Secure Deletion capabilities

#### RitualEngine
- **Purpose**: Personalized ritual curation and delivery
- **Subcomponents**:
  - **Context Analyzer**: Assesses user context for ritual selection
  - **Template Selector**: Chooses appropriate ritual templates
  - **Personalization Engine**: Customizes rituals for the user
  - **Flow Manager**: Handles ritual pacing and structure
  - **Memory Integrator**: Incorporates relevant memories
  - **Ritual Delivery Controller**: Coordinates ritual execution
- **Technical Requirements**:
  - Template System for modular ritual framework
  - Context Processing for time, location, and state awareness
  - Flow Control for adaptive branching
  - Integration Framework for connection to other systems

#### Voice Engine & Breath System
- **Purpose**: Adaptive communication and UI/UX pacing
- **Subcomponents**:
  - **Tone Selector**: Chooses appropriate communication tone
  - **Voice Pack Manager**: Handles different archetype-based voices
  - **Communication Coordinator**: Manages overall communication flow
  - **Breath Pattern Controller**: Selects appropriate breath patterns
  - **Pacing Engine**: Controls interaction timing and rhythm
  - **Visualization Controller**: Manages breath visualization elements
- **Technical Requirements**:
  - NLP/LLM Integration for consistent tone
  - Timing Mechanisms for natural pauses
  - UI Animation for breath visualization
  - Synchronization between voice and breath

#### Ethics Engine
- **Purpose**: Ethical guardrails and consent management
- **Subcomponents**:
  - **Consent Manager**: Handles user permissions and consent
  - **Boundary Enforcer**: Maintains ethical interaction boundaries
  - **Trauma Protocol Controller**: Manages responses to sensitive topics
  - **Bias Detector**: Identifies and mitigates potential bias
  - **Privacy Guardian**: Ensures data privacy and protection
  - **Ethical Audit Logger**: Records ethical decisions for review
- **Technical Requirements**:
  - Consent Framework for granular permissions
  - Rule Engine for ethical boundary enforcement
  - Content Analysis for sensitive topic detection
  - Bias Mitigation algorithms

## User Interface Components

### Single Pixel Visual Interface
- **Purpose**: Minimalist visual representation
- **Features**:
  - Breathing animation with subtle size variations
  - Color changes reflecting different states
  - Opacity adjustments based on connection strength
  - Subtle movement in response to device motion
  - Ambient particles surrounding the pixel

### Haptic Feedback System
- **Purpose**: Communication through touch
- **Features**:
  - Distinct vibration patterns for different states
  - Emotional resonance through rhythm
  - Adaptive intensity based on context
  - Complementary to visual and audio elements

### Audio System
- **Purpose**: Subtle audio communication
- **Features**:
  - Threshold-of-perception ambient soundscapes
  - Audio cues matching haptic patterns
  - Harmonic changes for significant moments

### Presence Detection
- **Purpose**: Detecting user engagement
- **Methods**:
  - Device holding patterns
  - Micro-movements
  - Screen touches
  - Time-based attention tracking

### Admin Panel (for testing)
- **Purpose**: Testing and demonstration
- **Features**:
  - Pixel Controls (opacity, size, breathing rate, color)
  - Haptic Controls (patterns, intensity)
  - Audio Controls (volume, sound testing)
  - Interaction Flow triggers
  - Sensor Data monitoring
  - Touch Data monitoring

## Data Models

### User Profile
- Tracks user archetypes, needs, preferences, and consent settings
- Includes:
  - Archetype information (primary, secondary, confidence)
  - Needs metrics (certainty, variety, significance, connection, growth, contribution)
  - Preferences (breath pacing, communication style, ritual preferences)
  - Consent settings (data collection, memory storage, external connections, sensitive topics)

### Memory Graph
- Relational database structure for storing and connecting memories
- Node types include Markers, Echoes, and Storylines
- Relationships between memories capture patterns and connections

### Ritual Templates
- Modular framework for personalized ritual experiences
- Customizable based on user context and preferences

## Technical Implementation

### Mobile Web Prototype
- **Requirements**:
  - Modern mobile browser (Chrome, Safari)
  - Device with vibration capability
  - Device with motion and orientation sensors
  - Touch screen
  - Audio capability

### Core Modules
- **FeatureDetector**: Detects device capabilities and requests permissions
- **StateManager**: Manages application state and provides event-based communication
- **PixelRenderer**: Handles visual rendering of the single pixel and animations
- **HapticFeedback**: Implements haptic patterns and vibration control
- **SensorManager**: Integrates device motion, orientation, and other sensors
- **TouchInterface**: Handles touch events and gesture recognition
- **AudioSystem**: Manages ambient sounds and audio feedback
- **InteractionManager**: Coordinates between modules and implements conversation flow
- **MessageDisplay**: Shows text messages to the user
- **AdminPanel**: Provides testing and debugging capabilities

### Responsive Design
- Responsive canvas sizing
- Adaptive haptic intensity based on device capabilities
- Fallback mechanisms for unsupported features
- Optimization for different screen types (OLED vs LCD)

### Performance Optimization
- Use of requestAnimationFrame for smooth animations
- Efficient canvas rendering
- Battery-aware feature adjustments
- Passive event listeners where appropriate

### Accessibility Considerations
- Support for reduced motion preferences
- High contrast mode compatibility
- Alternative feedback mechanisms
- Adjustable intensity settings
