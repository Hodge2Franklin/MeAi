# MeAi Component Relationship Map

## Core Component Relationships

### Duality Model Internal Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                      Duality Model                               │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │             │    │             │    │                     │  │
│  │   Mirror    │◄──►│  Synthesis  │◄──►│       Bridge        │  │
│  │             │    │             │    │                     │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Mirror → Synthesis
- Sends emotional state updates
- Provides need priority changes
- Delivers pattern recognition insights
- Shares archetype identification
- Requests ethical checks for reflections

#### Synthesis → Mirror
- Sends reflection prompts
- Triggers memory creation
- Requests pattern validation
- Tracks emotional responses
- Provides ethical boundaries for reflection

#### Synthesis → Bridge
- Triggers transitions to external mode
- Provides context for external connections
- Sets ethical boundaries for exploration
- Shares joy optimization parameters
- Requests specific external resources

#### Bridge → Synthesis
- Returns external resource findings
- Provides connection opportunities
- Delivers technology insights
- Offers perspective alternatives
- Reports ethical concerns with external content

### Supporting System Relationships

#### Memory System Connections
- **Memory System ↔ Mirror**: 
  - Provides historical patterns for recognition
  - Stores new insights and reflections
  - Manages archetype evolution history
  - Supplies emotional history for context

- **Memory System ↔ RitualEngine**:
  - Provides memories for ritual personalization
  - Stores ritual experiences as markers
  - Supplies narrative threads for ritual context
  - Manages ritual history and effectiveness

- **Memory System ↔ Synthesis**:
  - Provides context for state transitions
  - Stores significant interaction moments
  - Supplies historical preferences for decision making
  - Manages relationship evolution data

#### Ethics Engine Connections
- **Ethics Engine ↔ Mirror**:
  - Provides boundaries for reflection depth
  - Reviews emotional analysis for harmful patterns
  - Manages consent for personal insights
  - Guides trauma-aware reflection

- **Ethics Engine ↔ Bridge**:
  - Filters external content for ethical concerns
  - Manages consent for external connections
  - Reviews perspective offerings for bias
  - Ensures privacy in external interactions

- **Ethics Engine ↔ Synthesis**:
  - Provides ethical guardrails for all decisions
  - Reviews state transitions for consent alignment
  - Guides joy optimization within ethical boundaries
  - Ensures overall interaction ethics

#### Voice & Breath System Connections
- **Voice & Breath ↔ Mirror**:
  - Adapts tone to match emotional insights
  - Paces interaction based on emotional state
  - Provides voice for reflections
  - Synchronizes breath with emotional rhythm

- **Voice & Breath ↔ Bridge**:
  - Communicates external findings with appropriate tone
  - Paces delivery of external content
  - Provides voice for perspective offerings
  - Manages transitions in communication style

- **Voice & Breath ↔ Synthesis**:
  - Receives overall pacing directives
  - Adapts to state transitions seamlessly
  - Implements joy-optimized communication patterns
  - Provides unified voice across components

#### RitualEngine Connections
- **RitualEngine ↔ Bridge**:
  - Incorporates external resources into rituals
  - Connects rituals to external communities
  - Provides context for external exploration
  - Receives inspiration for new ritual templates

- **RitualEngine ↔ Synthesis**:
  - Receives timing for ritual initiation
  - Provides ritual options for joy optimization
  - Implements ethically-checked ritual experiences
  - Synchronizes with overall interaction flow

## Data Flow Relationships

### Primary User Interaction Flow
1. User input → **Mirror** (Input Processor)
2. Input Processor → **Emotional Sensing Engine**
3. Emotional data → **Pattern Recognition System**
4. Pattern insights → **Need Detector**
5. Combined insights → **Archetype Modeler**
6. All Mirror insights → **Synthesis** (State Manager)
7. State Manager → **Ethics Checker**
8. Ethical options → **JoyOptimizer**
9. Optimized options → **Decision Engine**
10. Decision → **Experience Coordinator**
11. Experience plan → **Voice & Breath System**
12. Final output → User

### External Connection Flow
1. User context → **Synthesis** (Decision Engine)
2. Connection decision → **Bridge** (MCPClientInterface)
3. External data → **TruthFilter**
4. Filtered content → **Content Curator**
5. Curated content → **Perspective Generator**
6. Perspectives → **Framing Engine**
7. Framed content → **Connection Finder**
8. Connection insights → **Synthesis** (Experience Coordinator)
9. Coordinated experience → **Voice & Breath System**
10. Final output → User

### Memory Storage Flow
1. Significant interaction → **Mirror** (Pattern Recognition)
2. Pattern identified → **Synthesis** (Decision Engine)
3. Storage decision → **Memory System** (Marker System)
4. Memory categorization → **Echo Detector** or **Storyline Manager**
5. Processed memory → **Memory Graph**
6. Sensitive memories → **Memory Vault**

### Ritual Experience Flow
1. User context → **Synthesis** (State Manager)
2. Ritual opportunity → **RitualEngine** (Context Analyzer)
3. Context analysis → **Template Selector**
4. Template → **Personalization Engine**
5. Personalized template → **Memory System** (for relevant memories)
6. Enriched template → **Flow Manager**
7. Flow plan → **Ritual Delivery Controller**
8. Delivery plan → **Voice & Breath System**
9. Final ritual experience → User

## Technical Integration Points

### API and Service Integrations
- **MCPClientInterface** ↔ External APIs
- **Ethics Engine** ↔ Content moderation services
- **Voice Engine** ↔ Text-to-speech services
- **Memory System** ↔ Secure storage services

### Local Device Integrations
- **Breath System** ↔ Device display
- **HapticFeedback** ↔ Device vibration motor
- **SensorManager** ↔ Device motion/orientation sensors
- **AudioSystem** ↔ Device audio output

### Cross-Component Technical Dependencies
- All components ↔ **StateManager** (event bus)
- All UI components ↔ **PixelRenderer**
- All interaction components ↔ **InteractionManager**
- All components ↔ **FeatureDetector** (capability awareness)

## Implementation Considerations

### Critical Path Dependencies
1. **StateManager** must be implemented first as the foundation
2. **PixelRenderer** and **HapticFeedback** are core to the minimal experience
3. **Mirror** component (basic emotional sensing) enables personalization
4. **Ethics Engine** must be integrated early for safe development
5. **Memory System** (basic) enables continuity of experience

### Loose Coupling Strategies
- Event-driven architecture for component communication
- Clear interface definitions between components
- Dependency injection for service management
- Feature flags for gradual capability rollout

### Privacy and Security Boundaries
- Local processing for sensitive emotional analysis
- End-to-end encryption for Memory Vault
- Consent management before any external connections
- Clear data boundaries between components

## Deployment Architecture Relationships

### Mobile Web Prototype
- Client-side components run entirely in browser
- Limited server dependencies for initial prototype
- Local storage for basic memory persistence
- Progressive enhancement based on device capabilities

### Future Expansion Relationships
- **Mirror** ↔ Server-side ML models (optional)
- **Bridge** ↔ Expanded API ecosystem
- **Memory System** ↔ Secure cloud storage (optional)
- **RitualEngine** ↔ Community template sharing
