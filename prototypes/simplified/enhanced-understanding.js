// Enhanced understanding capabilities for MeAi
// This file will be used to implement more advanced voice recognition features

// Context awareness - maintain conversation state
class ConversationContext {
  constructor() {
    this.history = [];
    this.currentTopic = null;
    this.userName = null;
    this.lastQuery = null;
    this.lastResponse = null;
    this.sessionStartTime = new Date();
    this.emotionalState = "neutral"; // neutral, positive, negative
    this.confidenceLevel = 0.5; // 0-1 scale
  }
  
  addInteraction(query, response, confidence = 0.5) {
    this.history.push({
      query: query,
      response: response,
      timestamp: new Date(),
      confidence: confidence
    });
    
    this.lastQuery = query;
    this.lastResponse = response;
    this.confidenceLevel = confidence;
    
    // Limit history size
    if (this.history.length > 10) {
      this.history.shift();
    }
    
    return this;
  }
  
  setTopic(topic) {
    this.currentTopic = topic;
    return this;
  }
  
  setUserName(name) {
    this.userName = name;
    return this;
  }
  
  setEmotionalState(state) {
    this.emotionalState = state;
    return this;
  }
  
  getLastQuery() {
    return this.lastQuery;
  }
  
  getLastResponse() {
    return this.lastResponse;
  }
  
  getSessionDuration() {
    return (new Date() - this.sessionStartTime) / 1000; // in seconds
  }
  
  isFollowUpQuestion(query) {
    const followUpIndicators = [
      "what about", "and", "also", "what else", "why", "how", "when", "where", 
      "who", "which", "can you", "could you", "would you", "will you"
    ];
    
    // Check if query starts with a follow-up indicator
    for (const indicator of followUpIndicators) {
      if (query.toLowerCase().startsWith(indicator)) {
        return true;
      }
    }
    
    // Check for pronouns that might refer to previous context
    const pronouns = [
      "it", "that", "this", "they", "them", "those", "these", "their", "its"
    ];
    
    const words = query.toLowerCase().split(/\s+/);
    for (const pronoun of pronouns) {
      if (words.includes(pronoun)) {
        return true;
      }
    }
    
    return false;
  }
  
  getRelevantHistory(query) {
    // Simple implementation - return last 3 interactions
    return this.history.slice(-3);
  }
}

// Natural language processing utilities
class NLPProcessor {
  constructor() {
    // Define common synonyms and related terms
    this.synonyms = {
      // Greetings
      "hello": ["hi", "hey", "howdy", "greetings", "good morning", "good afternoon", "good evening"],
      
      // Help
      "help": ["assist", "support", "aid", "guide", "what can you do", "capabilities", "features"],
      
      // Schedule
      "schedule": ["calendar", "agenda", "plan", "appointment", "meeting", "event", "reminder", "remind me"],
      
      // Weather
      "weather": ["temperature", "forecast", "rain", "sunny", "cloudy", "storm", "humidity", "climate"],
      
      // Time
      "time": ["clock", "hour", "minute", "date", "day", "today", "tomorrow", "yesterday"],
      
      // Personal
      "feeling": ["how are you", "how do you feel", "are you ok", "are you good", "what's up"],
      
      // Gratitude
      "thanks": ["thank you", "appreciate", "grateful", "thankful"],
      
      // Farewell
      "goodbye": ["bye", "see you", "farewell", "later", "good night"]
    };
    
    // Define entities for recognition
    this.entities = {
      time: [
        "morning", "afternoon", "evening", "night", "today", "tomorrow", "yesterday",
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
        "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
      ],
      person: [
        "i", "me", "my", "mine", "you", "your", "yours", "we", "us", "our", "ours", "they", "them", "their", "theirs"
      ]
    };
    
    // Define intents with example phrases
    this.intents = {
      greeting: [
        "hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "hi there", "hello there"
      ],
      help: [
        "help me", "what can you do", "how do you work", "what are your features", "show me what you can do",
        "i need help", "assist me", "help", "support"
      ],
      schedule: [
        "what's on my schedule", "check my calendar", "any meetings today", "upcoming events",
        "schedule a meeting", "add to calendar", "remind me about", "set a reminder"
      ],
      weather: [
        "what's the weather", "is it going to rain", "temperature today", "weather forecast",
        "will it be sunny", "do i need an umbrella", "how hot is it"
      ],
      time: [
        "what time is it", "what's the date", "what day is it", "tell me the time", "current time",
        "today's date", "what's today"
      ],
      personal: [
        "how are you", "how are you feeling", "what's up", "how's it going", "are you ok",
        "tell me about yourself", "who are you"
      ],
      thanks: [
        "thank you", "thanks", "appreciate it", "thanks a lot", "thank you so much", "grateful"
      ],
      goodbye: [
        "goodbye", "bye", "see you later", "good night", "farewell", "bye bye", "have to go"
      ],
      emotional_support: [
        "i'm sad", "feeling down", "had a bad day", "feeling stressed", "anxious", "worried",
        "feeling happy", "great news", "excited", "feeling good"
      ],
      factual: [
        "who is", "what is", "where is", "when did", "why is", "how does", "tell me about",
        "explain", "define", "describe"
      ]
    };
  }
  
  // Determine the intent of a query
  classifyIntent(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check each intent
    let bestMatch = {
      intent: "unknown",
      confidence: 0
    };
    
    for (const [intent, examples] of Object.entries(this.intents)) {
      const score = this.calculateIntentScore(normalizedQuery, examples);
      
      if (score > bestMatch.confidence) {
        bestMatch = {
          intent: intent,
          confidence: score
        };
      }
    }
    
    return bestMatch;
  }
  
  // Calculate how well a query matches an intent
  calculateIntentScore(query, examples) {
    let maxScore = 0;
    
    // Check direct matches with examples
    for (const example of examples) {
      if (query.includes(example)) {
        // Direct substring match
        const matchRatio = example.length / query.length;
        const score = 0.5 + (0.5 * matchRatio); // Between 0.5 and 1.0
        maxScore = Math.max(maxScore, score);
      }
    }
    
    // If no direct match, check word overlap
    if (maxScore === 0) {
      const queryWords = query.split(/\s+/);
      
      for (const example of examples) {
        const exampleWords = example.split(/\s+/);
        let matchingWords = 0;
        
        for (const word of queryWords) {
          if (exampleWords.includes(word)) {
            matchingWords++;
          }
        }
        
        if (matchingWords > 0) {
          const overlapScore = matchingWords / Math.max(queryWords.length, exampleWords.length);
          maxScore = Math.max(maxScore, overlapScore * 0.7); // Scale to max 0.7 for word overlap
        }
      }
    }
    
    // Check synonyms
    for (const [key, synonymList] of Object.entries(this.synonyms)) {
      for (const synonym of synonymList) {
        if (query.includes(synonym)) {
          // Check if this synonym is relevant to the current intent
          for (const example of examples) {
            if (example.includes(key) || example.includes(synonym)) {
              const matchRatio = synonym.length / query.length;
              const score = 0.4 + (0.3 * matchRatio); // Between 0.4 and 0.7
              maxScore = Math.max(maxScore, score);
            }
          }
        }
      }
    }
    
    return maxScore;
  }
  
  // Extract entities from a query
  extractEntities(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);
    const entities = {};
    
    // Check for time entities
    const timeEntities = words.filter(word => this.entities.time.includes(word));
    if (timeEntities.length > 0) {
      entities.time = timeEntities;
    }
    
    // Check for person entities
    const personEntities = words.filter(word => this.entities.person.includes(word));
    if (personEntities.length > 0) {
      entities.person = personEntities;
    }
    
    // Extract potential names (capitalized words)
    const nameRegex = /\b[A-Z][a-z]+\b/g;
    const potentialNames = query.match(nameRegex);
    if (potentialNames && potentialNames.length > 0) {
      entities.potentialNames = potentialNames;
    }
    
    return entities;
  }
  
  // Check if query contains a specific entity type
  hasEntityType(query, entityType) {
    const entities = this.extractEntities(query);
    return entities[entityType] !== undefined;
  }
  
  // Get sentiment of a query (very basic implementation)
  getSentiment(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    const positiveWords = [
      "good", "great", "excellent", "amazing", "wonderful", "happy", "glad", "pleased",
      "love", "like", "enjoy", "fantastic", "awesome", "positive", "beautiful", "perfect",
      "thank", "thanks", "appreciate", "excited", "joy", "delighted"
    ];
    
    const negativeWords = [
      "bad", "terrible", "awful", "horrible", "sad", "unhappy", "disappointed", "upset",
      "hate", "dislike", "annoyed", "angry", "negative", "ugly", "wrong", "problem",
      "issue", "trouble", "worried", "anxious", "stressed", "depressed", "sorry"
    ];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    const words = normalizedQuery.split(/\s+/);
    
    for (const word of words) {
      if (positiveWords.includes(word)) {
        positiveScore++;
      }
      if (negativeWords.includes(word)) {
        negativeScore++;
      }
    }
    
    if (positiveScore > negativeScore) {
      return {
        sentiment: "positive",
        score: positiveScore / words.length
      };
    } else if (negativeScore > positiveScore) {
      return {
        sentiment: "negative",
        score: negativeScore / words.length
      };
    } else {
      return {
        sentiment: "neutral",
        score: 0
      };
    }
  }
}

// Enhanced response generator
class ResponseGenerator {
  constructor(context, nlp) {
    this.context = context;
    this.nlp = nlp;
    
    // Define response templates
    this.responseTemplates = {
      greeting: [
        "Hi there! How can I help you today?",
        "Hello! It's great to hear from you. What can I do for you?",
        "Hey! I'm here and ready to assist. What do you need?"
      ],
      greeting_with_name: [
        "Hi {name}! How can I help you today?",
        "Hello {name}! It's great to hear from you. What can I do for you?",
        "Hey {name}! I'm here and ready to assist. What do you need?"
      ],
      greeting_morning: [
        "Good morning! How can I help you start your day?",
        "Morning! What can I help you with today?",
        "Good morning! Ready to help you with whatever you need today."
      ],
      greeting_afternoon: [
        "Good afternoon! How can I help you today?",
        "Hi there! Hope your day is going well. What can I do for you?",
        "Good afternoon! What can I help you with?"
      ],
      greeting_evening: [
        "Good evening! How can I help you tonight?",
        "Evening! What can I do for you?",
        "Good evening! How can I assist you?"
      ],
      help: [
        "I can help you keep track of important information, prepare for meetings, or remember details about people in your life. What would you like help with?",
        "I'm here to make your day easier. I can remind you of important events, help you prepare for meetings, or keep track of details. What do you need today?",
        "I'd be happy to help! I can remember important information, assist with scheduling, or keep track of details about people in your life. What can I do for you?"
      ],
      schedule: [
        "I'd be happy to help with your schedule. What would you like to know about today?",
        "Let me check your schedule for you. What specific information are you looking for?",
        "I can help you manage your schedule. What would you like me to do?"
      ],
      schedule_add: [
        "I'll add that to your schedule. When would you like me to schedule it?",
        "I can add that for you. What date and time works best?",
        "I'd be happy to add that to your calendar. When should I schedule it?"
      ],
      weather: [
        "I'd be happy to check the weather for you. Which location are you interested in?",
        "Let me look up the weather forecast. Where are you located?",
        "I can help with weather information. Which city would you like to know about?"
      ],
      time: [
        "It's currently {time}.",
        "The time right now is {time}.",
        "It's {time} right now."
      ],
      date: [
        "Today is {date}.",
        "It's {date} today.",
        "The date today is {date}."
      ],
      personal: [
        "I'm doing well, thanks for asking! How are you today?",
        "I'm here and ready to help! How are you doing?",
        "I'm great! More importantly, how are you feeling today?"
      ],
      thanks: [
        "You're welcome! I'm happy I could help.",
        "Anytime! That's what I'm here for.",
        "No problem at all. Is there anything else you need?"
      ],
      goodbye: [
        "Goodbye! Feel free to chat anytime you need assistance.",
        "Talk to you later! I'll be here when you need me.",
        "Have a great day! I'll be here when you want to chat again."
      ],
      emotional_support_positive: [
        "That's wonderful to hear! I'm really happy for you.",
        "That's great news! Thanks for sharing that with me.",
        "I'm so glad to hear that! That's really positive."
      ],
      emotional_support_negative: [
        "I'm sorry to hear that. Is there anything I can do to help?",
        "That sounds difficult. I'm here to listen if you want to talk more about it.",
        "I understand that must be hard. Is there something specific I can help with?"
      ],
      factual: [
        "That's an interesting question. While I don't have all the answers, I'd be happy to help you find information about that.",
        "Great question! I don't have that specific information, but I can help you look it up.",
        "I'd need to learn more about that. Is there a specific aspect you're curious about?"
      ],
      unknown: [
        "I'm not sure I understood that. Could you rephrase?",
        "I didn't quite catch that. Can you say it differently?",
        "I'm still learning. Could you try asking in another way?"
      ],
      follow_up: [
        "Regarding our previous conversation, {response}",
        "Following up on what we were discussing, {response}",
        "To continue our conversation, {response}"
      ]
    };
  }
  
  // Generate a response based on intent and context
  generateResponse(query) {
    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();
    
    // Classify intent
    const intentResult = this.nlp.classifyIntent(normalizedQuery);
    const intent = intentResult.intent;
    const confidence = intentResult.confidence;
    
    // Extract entities
    const entities = this.nlp.extractEntities(normalizedQuery);
    
    // Get sentiment
    const sentiment = this.nlp.getSentiment(normalizedQuery);
    
    // Check if this is a follow-up question
    const isFollowUp = this.context.isFollowUpQuestion(normalizedQuery);
    
    // Update context emotional state based on sentiment
    this.context.setEmotionalState(sentiment.sentiment);
    
    // Generate appropriate response
    let response;
    
    if (isFollowUp && this.context.lastResponse) {
      // Handle follow-up by referencing previous context
      const baseResponse = this.generateBaseResponse(intent, entities, sentiment);
      response = this.getRandomTemplate("follow_up").replace("{response}", baseResponse);
    } else {
      // Generate normal response
      response = this.generateBaseResponse(intent, entities, sentiment);
    }
    
    // Update conversation context
    this.context.addInteraction(normalizedQuery, response, confidence);
    
    // Extract potential name if present and not already set
    if (entities.potentialNames && !this.context.userName) {
      this.context.setUserName(entities.potentialNames[0]);
    }
    
    // Set current topic based on intent
    this.context.setTopic(intent);
    
    return {
      response: response,
      intent: intent,
      confidence: confidence,
      sentiment: sentiment.sentiment
    };
  }
  
  // Generate base response without follow-up context
  generateBaseResponse(intent, entities, sentiment) {
    let response;
    
    switch (intent) {
      case "greeting":
        // Check time of day
        const hour = new Date().getHours();
        if (hour < 12) {
          response = this.getRandomTemplate("greeting_morning");
        } else if (hour < 18) {
          response = this.getRandomTemplate("greeting_afternoon");
        } else {
          response = this.getRandomTemplate("greeting_evening");
        }
        
        // Personalize if we know the user's name
        if (this.context.userName) {
          response = response.replace("Good morning!", `Good morning, ${this.context.userName}!`)
                            .replace("Morning!", `Morning, ${this.context.userName}!`)
                            .replace("Good afternoon!", `Good afternoon, ${this.context.userName}!`)
                            .replace("Hi there!", `Hi ${this.context.userName}!`)
                            .replace("Good evening!", `Good evening, ${this.context.userName}!`)
                            .replace("Evening!", `Evening, ${this.context.userName}!`);
        }
        break;
        
      case "help":
        response = this.getRandomTemplate("help");
        break;
        
      case "schedule":
        // Check if adding to schedule or querying
        if (normalizedQuery.includes("add") || normalizedQuery.includes("schedule") || 
            normalizedQuery.includes("set up") || normalizedQuery.includes("create")) {
          response = this.getRandomTemplate("schedule_add");
        } else {
          response = this.getRandomTemplate("schedule");
        }
        break;
        
      case "weather":
        response = this.getRandomTemplate("weather");
        break;
        
      case "time":
        if (normalizedQuery.includes("date") || normalizedQuery.includes("day") || 
            normalizedQuery.includes("month") || normalizedQuery.includes("year")) {
          const today = new Date();
          const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          const dateString = today.toLocaleDateString('en-US', options);
          response = this.getRandomTemplate("date").replace("{date}", dateString);
        } else {
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
          response = this.getRandomTemplate("time").replace("{time}", timeString);
        }
        break;
        
      case "personal":
        response = this.getRandomTemplate("personal");
        break;
        
      case "thanks":
        response = this.getRandomTemplate("thanks");
        break;
        
      case "goodbye":
        response = this.getRandomTemplate("goodbye");
        break;
        
      case "emotional_support":
        if (sentiment.sentiment === "positive") {
          response = this.getRandomTemplate("emotional_support_positive");
        } else {
          response = this.getRandomTemplate("emotional_support_negative");
        }
        break;
        
      case "factual":
        response = this.getRandomTemplate("factual");
        break;
        
      default:
        response = this.getRandomTemplate("unknown");
    }
    
    return response;
  }
  
  // Get a random template from a category
  getRandomTemplate(category) {
    const templates = this.responseTemplates[category];
    if (!templates || templates.length === 0) {
      return "I'm not sure how to respond to that.";
    }
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }
}

// Export the classes for use in the main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ConversationContext,
    NLPProcessor,
    ResponseGenerator
  };
}
