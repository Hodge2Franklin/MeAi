/**
 * Memory Visualization System
 * 
 * This module provides visualization capabilities for the long-term memory system,
 * allowing users to explore and understand the AI's memory structure.
 */

class MemoryVisualization {
    constructor() {
        // Dependencies
        this.eventSystem = window.eventSystem;
        this.longTermMemorySystem = window.longTermMemorySystem;
        
        // Visualization container
        this.container = null;
        
        // Visualization state
        this.currentVisualization = null;
        this.visualizationData = null;
        this.visualizationOptions = {
            type: 'topics',
            filter: {},
            colorScheme: 'default'
        };
        
        // Color schemes
        this.colorSchemes = {
            default: {
                background: '#f5f5f5',
                text: '#333333',
                accent: '#3a86ff',
                highlight: '#ff006e',
                lowImportance: '#8ecae6',
                mediumImportance: '#219ebc',
                highImportance: '#023047',
                user: '#38b000',
                ai: '#9d4edd'
            },
            dark: {
                background: '#121212',
                text: '#e0e0e0',
                accent: '#bb86fc',
                highlight: '#03dac6',
                lowImportance: '#4a5859',
                mediumImportance: '#7b8788',
                highImportance: '#a5c9ca',
                user: '#81b29a',
                ai: '#f28482'
            },
            pastel: {
                background: '#f8edeb',
                text: '#5e6472',
                accent: '#fec5bb',
                highlight: '#ffd7ba',
                lowImportance: '#e8e8e4',
                mediumImportance: '#d8e2dc',
                highImportance: '#ece4db',
                user: '#9a8c98',
                ai: '#c9ada7'
            }
        };
        
        // Initialize
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for memory visualization data
        this.eventSystem.subscribe('memory-visualization-data', (data) => {
            this.visualizationData = data.data;
            
            if (data.error) {
                this.showError(data.error);
                return;
            }
            
            this.renderVisualization(data.type, data.data);
        });
        
        // Listen for visualization requests
        this.eventSystem.subscribe('request-memory-visualization', (data) => {
            this.visualizationOptions.type = data.type || 'topics';
            this.visualizationOptions.filter = data.filter || {};
            
            this.requestVisualization();
        });
        
        // Listen for color scheme changes
        this.eventSystem.subscribe('change-visualization-color-scheme', (data) => {
            this.setColorScheme(data.scheme);
        });
    }
    
    /**
     * Initialize the visualization container
     * @param {HTMLElement} container - Container element for visualizations
     */
    initialize(container) {
        this.container = container;
        
        // Create visualization controls
        this.createControls();
        
        console.log('Memory Visualization System initialized');
    }
    
    /**
     * Create visualization controls
     */
    createControls() {
        if (!this.container) return;
        
        // Create control panel
        const controlPanel = document.createElement('div');
        controlPanel.className = 'memory-visualization-controls';
        this.container.appendChild(controlPanel);
        
        // Create visualization type selector
        const typeSelector = document.createElement('select');
        typeSelector.className = 'visualization-type-selector';
        
        const visualizationTypes = [
            { value: 'topics', label: 'Topics' },
            { value: 'timeline', label: 'Timeline' },
            { value: 'relationships', label: 'Relationships' },
            { value: 'facts', label: 'Facts' },
            { value: 'importance', label: 'Importance Distribution' }
        ];
        
        visualizationTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.label;
            typeSelector.appendChild(option);
        });
        
        typeSelector.value = this.visualizationOptions.type;
        
        typeSelector.addEventListener('change', () => {
            this.visualizationOptions.type = typeSelector.value;
            this.requestVisualization();
        });
        
        // Create color scheme selector
        const schemeSelector = document.createElement('select');
        schemeSelector.className = 'color-scheme-selector';
        
        Object.keys(this.colorSchemes).forEach(scheme => {
            const option = document.createElement('option');
            option.value = scheme;
            option.textContent = scheme.charAt(0).toUpperCase() + scheme.slice(1);
            schemeSelector.appendChild(option);
        });
        
        schemeSelector.addEventListener('change', () => {
            this.setColorScheme(schemeSelector.value);
        });
        
        // Create filter controls (will be updated based on visualization type)
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        
        // Add controls to panel
        const typeSelectorLabel = document.createElement('label');
        typeSelectorLabel.textContent = 'Visualization Type:';
        typeSelectorLabel.appendChild(typeSelector);
        
        const schemeSelectorLabel = document.createElement('label');
        schemeSelectorLabel.textContent = 'Color Scheme:';
        schemeSelectorLabel.appendChild(schemeSelector);
        
        controlPanel.appendChild(typeSelectorLabel);
        controlPanel.appendChild(schemeSelectorLabel);
        controlPanel.appendChild(filterContainer);
        
        // Create visualization container
        const visualizationContainer = document.createElement('div');
        visualizationContainer.className = 'visualization-container';
        this.container.appendChild(visualizationContainer);
        
        // Store references
        this.controlPanel = controlPanel;
        this.filterContainer = filterContainer;
        this.visualizationContainer = visualizationContainer;
        
        // Update filter controls for initial visualization type
        this.updateFilterControls();
    }
    
    /**
     * Update filter controls based on current visualization type
     */
    updateFilterControls() {
        if (!this.filterContainer) return;
        
        // Clear existing controls
        this.filterContainer.innerHTML = '';
        
        // Create type-specific filter controls
        switch (this.visualizationOptions.type) {
            case 'topics':
                this.createTopicFilterControls();
                break;
            case 'timeline':
                this.createTimelineFilterControls();
                break;
            case 'relationships':
                this.createRelationshipFilterControls();
                break;
            case 'facts':
                this.createFactFilterControls();
                break;
            case 'importance':
                // No specific filters for importance distribution
                break;
        }
        
        // Add apply button
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply Filters';
        applyButton.className = 'apply-filters-button';
        applyButton.addEventListener('click', () => {
            this.requestVisualization();
        });
        
        this.filterContainer.appendChild(applyButton);
    }
    
    /**
     * Create filter controls for topic visualization
     */
    createTopicFilterControls() {
        // Minimum frequency filter
        const minFrequencyInput = document.createElement('input');
        minFrequencyInput.type = 'number';
        minFrequencyInput.min = '1';
        minFrequencyInput.value = this.visualizationOptions.filter.minFrequency || '1';
        minFrequencyInput.addEventListener('change', () => {
            this.visualizationOptions.filter.minFrequency = parseInt(minFrequencyInput.value, 10);
        });
        
        const minFrequencyLabel = document.createElement('label');
        minFrequencyLabel.textContent = 'Min Frequency:';
        minFrequencyLabel.appendChild(minFrequencyInput);
        
        // Minimum importance filter
        const minImportanceInput = document.createElement('input');
        minImportanceInput.type = 'range';
        minImportanceInput.min = '0';
        minImportanceInput.max = '1';
        minImportanceInput.step = '0.1';
        minImportanceInput.value = this.visualizationOptions.filter.minImportance || '0';
        minImportanceInput.addEventListener('change', () => {
            this.visualizationOptions.filter.minImportance = parseFloat(minImportanceInput.value);
        });
        
        const minImportanceLabel = document.createElement('label');
        minImportanceLabel.textContent = 'Min Importance:';
        minImportanceLabel.appendChild(minImportanceInput);
        
        // Sort by selector
        const sortBySelect = document.createElement('select');
        
        const frequencyOption = document.createElement('option');
        frequencyOption.value = 'frequency';
        frequencyOption.textContent = 'Frequency';
        
        const importanceOption = document.createElement('option');
        importanceOption.value = 'importance';
        importanceOption.textContent = 'Importance';
        
        sortBySelect.appendChild(frequencyOption);
        sortBySelect.appendChild(importanceOption);
        
        sortBySelect.value = this.visualizationOptions.filter.sortBy || 'frequency';
        sortBySelect.addEventListener('change', () => {
            this.visualizationOptions.filter.sortBy = sortBySelect.value;
        });
        
        const sortByLabel = document.createElement('label');
        sortByLabel.textContent = 'Sort By:';
        sortByLabel.appendChild(sortBySelect);
        
        // Limit results
        const limitInput = document.createElement('input');
        limitInput.type = 'number';
        limitInput.min = '1';
        limitInput.max = '50';
        limitInput.value = this.visualizationOptions.filter.limit || '10';
        limitInput.addEventListener('change', () => {
            this.visualizationOptions.filter.limit = parseInt(limitInput.value, 10);
        });
        
        const limitLabel = document.createElement('label');
        limitLabel.textContent = 'Limit Results:';
        limitLabel.appendChild(limitInput);
        
        // Add controls to container
        this.filterContainer.appendChild(minFrequencyLabel);
        this.filterContainer.appendChild(minImportanceLabel);
        this.filterContainer.appendChild(sortByLabel);
        this.filterContainer.appendChild(limitLabel);
    }
    
    /**
     * Create filter controls for timeline visualization
     */
    createTimelineFilterControls() {
        // Topic filter
        const topicInput = document.createElement('input');
        topicInput.type = 'text';
        topicInput.value = this.visualizationOptions.filter.topic || '';
        topicInput.placeholder = 'All topics';
        topicInput.addEventListener('change', () => {
            this.visualizationOptions.filter.topic = topicInput.value || null;
        });
        
        const topicLabel = document.createElement('label');
        topicLabel.textContent = 'Topic:';
        topicLabel.appendChild(topicInput);
        
        // Minimum importance filter
        const minImportanceInput = document.createElement('input');
        minImportanceInput.type = 'range';
        minImportanceInput.min = '0';
        minImportanceInput.max = '1';
        minImportanceInput.step = '0.1';
        minImportanceInput.value = this.visualizationOptions.filter.minImportance || '0';
        minImportanceInput.addEventListener('change', () => {
            this.visualizationOptions.filter.minImportance = parseFloat(minImportanceInput.value);
        });
        
        const minImportanceLabel = document.createElement('label');
        minImportanceLabel.textContent = 'Min Importance:';
        minImportanceLabel.appendChild(minImportanceInput);
        
        // Time range filter
        const startTimeInput = document.createElement('input');
        startTimeInput.type = 'datetime-local';
        if (this.visualizationOptions.filter.timeRange && this.visualizationOptions.filter.timeRange.start) {
            const startDate = new Date(this.visualizationOptions.filter.timeRange.start);
            startTimeInput.value = startDate.toISOString().slice(0, 16);
        }
        startTimeInput.addEventListener('change', () => {
            if (!this.visualizationOptions.filter.timeRange) {
                this.visualizationOptions.filter.timeRange = {};
            }
            this.visualizationOptions.filter.timeRange.start = startTimeInput.value ? new Date(startTimeInput.value).getTime() : null;
        });
        
        const startTimeLabel = document.createElement('label');
        startTimeLabel.textContent = 'Start Time:';
        startTimeLabel.appendChild(startTimeInput);
        
        const endTimeInput = document.createElement('input');
        endTimeInput.type = 'datetime-local';
        if (this.visualizationOptions.filter.timeRange && this.visualizationOptions.filter.timeRange.end) {
            const endDate = new Date(this.visualizationOptions.filter.timeRange.end);
            endTimeInput.value = endDate.toISOString().slice(0, 16);
        }
        endTimeInput.addEventListener('change', () => {
            if (!this.visualizationOptions.filter.timeRange) {
                this.visualizationOptions.filter.timeRange = {};
            }
            this.visualizationOptions.filter.timeRange.end = endTimeInput.value ? new Date(endTimeInput.value).getTime() : null;
        });
        
        const endTimeLabel = document.createElement('label');
        endTimeLabel.textContent = 'End Time:';
        endTimeLabel.appendChild(endTimeInput);
        
        // Limit results
        const limitInput = document.createElement('input');
        limitInput.type = 'number';
        limitInput.min = '1';
        limitInput.max = '100';
        limitInput.value = this.visualizationOptions.filter.limit || '50';
        limitInput.addEventListener('change', () => {
            this.visualizationOptions.filter.limit = parseInt(limitInput.value, 10);
        });
        
        const limitLabel = document.createElement('label');
        limitLabel.textContent = 'Limit Results:';
        limitLabel.appendChild(limitInput);
        
        // Add controls to container
        this.filterContainer.appendChild(topicLabel);
        this.filterContainer.appendChild(minImportanceLabel);
        this.filterContainer.appendChild(startTimeLabel);
        this.filterContainer.appendChild(endTimeLabel);
        this.filterContainer.appendChild(limitLabel);
    }
    
    /**
     * Create filter controls for relationship visualization
     */
    createRelationshipFilterControls() {
        // Relationship type filter
        const typeSelect = document.createElement('select');
        
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All Types';
        typeSelect.appendChild(allOption);
        
        const relationshipTypes = [
            'friend', 'family', 'mom', 'dad', 'sister', 'brother', 
            'wife', 'husband', 'partner', 'son', 'daughter', 
            'boss', 'coworker', 'colleague'
        ];
        
        relationshipTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeSelect.appendChild(option);
        });
        
        typeSelect.value = this.visualizationOptions.filter.type || '';
        typeSelect.addEventListener('change', () => {
            this.visualizationOptions.filter.type = typeSelect.value || null;
        });
        
        const typeLabel = document.createElement('label');
        typeLabel.textContent = 'Relationship Type:';
        typeLabel.appendChild(typeSelect);
        
        // Minimum importance filter
        const minImportanceInput = document.createElement('input');
        minImportanceInput.type = 'range';
        minImportanceInput.min = '0';
        minImportanceInput.max = '1';
        minImportanceInput.step = '0.1';
        minImportanceInput.value = this.visualizationOptions.filter.minImportance || '0';
        minImportanceInput.addEventListener('change', () => {
            this.visualizationOptions.filter.minImportance = parseFloat(minImportanceInput.value);
        });
        
        const minImportanceLabel = document.createElement('label');
        minImportanceLabel.textContent = 'Min Importance:';
        minImportanceLabel.appendChild(minImportanceInput);
        
        // Minimum mentions filter
        const minMentionsInput = document.createElement('input');
        minMentionsInput.type = 'number';
        minMentionsInput.min = '1';
        minMentionsInput.value = this.visualizationOptions.filter.minMentions || '1';
        minMentionsInput.addEventListener('change', () => {
            this.visualizationOptions.filter.minMentions = parseInt(minMentionsInput.value, 10);
        });
        
        const minMentionsLabel = document.createElement('label');
        minMentionsLabel.textContent = 'Min Mentions:';
        minMentionsLabel.appendChild(minMentionsInput);
        
        // Sort by selector
        const sortBySelect = document.createElement('select');
        
        const mentionsOption = document.createElement('option');
        mentionsOption.value = 'mentions';
        mentionsOption.textContent = 'Mention Count';
        
        const importanceOption = document.createElement('option');
        importanceOption.value = 'importance';
        importanceOption.textContent = 'Importance';
        
        sortBySelect.appendChild(mentionsOption);
        sortBySelect.appendChild(importanceOption);
        
        sortBySelect.value = this.visualizationOptions.filter.sortBy || 'mentions';
        sortBySelect.addEventListener('change', () => {
            this.visualizationOptions.filter.sortBy = sortBySelect.value;
        });
        
        const sortByLabel = document.createElement('label');
        sortByLabel.textContent = 'Sort By:';
        sortByLabel.appendChild(sortBySelect);
        
        // Add controls to container
        this.filterContainer.appendChild(typeLabel);
        this.filterContainer.appendChild(minImportanceLabel);
        this.filterContainer.appendChild(minMentionsLabel);
        this.filterContainer.appendChild(sortByLabel);
    }
    
    /**
     * Create filter controls for fact visualization
     */
    createFactFilterControls() {
        // Category filter
        const categorySelect = document.createElement('select');
        
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All Categories';
        categorySelect.appendChild(allOption);
        
        const factCategories = [
            'personal', 'preferences', 'general', 'work', 'education', 'health'
        ];
        
        factCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySelect.appendChild(option);
        });
        
        categorySelect.value = this.visualizationOptions.filter.category || '';
        categorySelect.addEventListener('change', () => {
            this.visualizationOptions.filter.category = categorySelect.value || null;
        });
        
        const categoryLabel = document.createElement('label');
        categoryLabel.textContent = 'Category:';
        categoryLabel.appendChild(categorySelect);
        
        // Minimum importance filter
        const minImportanceInput = document.createElement('input');
        minImportanceInput.type = 'range';
        minImportanceInput.min = '0';
        minImportanceInput.max = '1';
        minImportanceInput.step = '0.1';
        minImportanceInput.value = this.visualizationOptions.filter.minImportance || '0';
        minImportanceInput.addEventListener('change', () => {
            this.visualizationOptions.filter.minImportance = parseFloat(minImportanceInput.value);
        });
        
        const minImportanceLabel = document.createElement('label');
        minImportanceLabel.textContent = 'Min Importance:';
        minImportanceLabel.appendChild(minImportanceInput);
        
        // Sort by selector
        const sortBySelect = document.createElement('select');
        
        const importanceOption = document.createElement('option');
        importanceOption.value = 'importance';
        importanceOption.textContent = 'Importance';
        
        const timestampOption = document.createElement('option');
        timestampOption.value = 'timestamp';
        timestampOption.textContent = 'Most Recent';
        
        sortBySelect.appendChild(importanceOption);
        sortBySelect.appendChild(timestampOption);
        
        sortBySelect.value = this.visualizationOptions.filter.sortBy || 'importance';
        sortBySelect.addEventListener('change', () => {
            this.visualizationOptions.filter.sortBy = sortBySelect.value;
        });
        
        const sortByLabel = document.createElement('label');
        sortByLabel.textContent = 'Sort By:';
        sortByLabel.appendChild(sortBySelect);
        
        // Add controls to container
        this.filterContainer.appendChild(categoryLabel);
        this.filterContainer.appendChild(minImportanceLabel);
        this.filterContainer.appendChild(sortByLabel);
    }
    
    /**
     * Request visualization data from the memory system
     */
    requestVisualization() {
        // Update filter controls if visualization type has changed
        if (this.currentVisualization !== this.visualizationOptions.type) {
            this.updateFilterControls();
            this.currentVisualization = this.visualizationOptions.type;
        }
        
        // Request visualization data
        this.eventSystem.publish('request-memory-visualization', {
            type: this.visualizationOptions.type,
            filter: this.visualizationOptions.filter
        });
    }
    
    /**
     * Render visualization based on data
     * @param {string} type - Visualization type
     * @param {Object} data - Visualization data
     */
    renderVisualization(type, data) {
        if (!this.visualizationContainer) return;
        
        // Clear previous visualization
        this.visualizationContainer.innerHTML = '';
        
        // Render based on type
        switch (type) {
            case 'topics':
                this.renderTopicVisualization(data);
                break;
            case 'timeline':
                this.renderTimelineVisualization(data);
                break;
            case 'relationships':
                this.renderRelationshipVisualization(data);
                break;
            case 'facts':
                this.renderFactVisualization(data);
                break;
            case 'importance':
                this.renderImportanceVisualization(data);
                break;
            default:
                this.showError(`Unknown visualization type: ${type}`);
        }
    }
    
    /**
     * Render topic visualization
     * @param {Object} data - Topic visualization data
     */
    renderTopicVisualization(data) {
        if (!data.topics || data.topics.length === 0) {
            this.showMessage('No topics found matching the criteria.');
            return;
        }
        
        // Create topic chart
        const chartContainer = document.createElement('div');
        chartContainer.className = 'topic-chart-container';
        
        // Create chart header
        const header = document.createElement('h3');
        header.textContent = `Topics (${data.topics.length})`;
        chartContainer.appendChild(header);
        
        // Create chart
        const chart = document.createElement('div');
        chart.className = 'topic-chart';
        
        // Find maximum frequency for scaling
        const maxFrequency = Math.max(...data.topics.map(topic => topic.frequency));
        
        // Create bars for each topic
        data.topics.forEach(topic => {
            const topicBar = document.createElement('div');
            topicBar.className = 'topic-bar';
            
            // Calculate bar width based on frequency
            const barWidth = (topic.frequency / maxFrequency) * 100;
            
            // Create bar label
            const label = document.createElement('div');
            label.className = 'topic-label';
            label.textContent = topic.name;
            
            // Create bar
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = `${barWidth}%`;
            
            // Set bar color based on importance
            if (topic.importance >= 0.7) {
                bar.style.backgroundColor = this.getColor('highImportance');
            } else if (topic.importance >= 0.4) {
                bar.style.backgroundColor = this.getColor('mediumImportance');
            } else {
                bar.style.backgroundColor = this.getColor('lowImportance');
            }
            
            // Create frequency label
            const frequency = document.createElement('div');
            frequency.className = 'topic-frequency';
            frequency.textContent = topic.frequency;
            
            // Add tooltip with additional information
            topicBar.title = `Name: ${topic.name}
Frequency: ${topic.frequency}
Importance: ${topic.importance.toFixed(2)}
First Discussed: ${new Date(topic.firstDiscussed).toLocaleString()}
Last Discussed: ${new Date(topic.lastDiscussed).toLocaleString()}`;
            
            // Assemble bar
            topicBar.appendChild(label);
            topicBar.appendChild(bar);
            topicBar.appendChild(frequency);
            
            chart.appendChild(topicBar);
        });
        
        chartContainer.appendChild(chart);
        this.visualizationContainer.appendChild(chartContainer);
    }
    
    /**
     * Render timeline visualization
     * @param {Object} data - Timeline visualization data
     */
    renderTimelineVisualization(data) {
        if (!data.timeline || data.timeline.length === 0) {
            this.showMessage('No conversation history found matching the criteria.');
            return;
        }
        
        // Create timeline container
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'timeline-container';
        
        // Create timeline header
        const header = document.createElement('h3');
        header.textContent = `Conversation Timeline (${data.timeline.length} messages)`;
        timelineContainer.appendChild(header);
        
        // Create timeline
        const timeline = document.createElement('div');
        timeline.className = 'timeline';
        
        // Group messages by date
        const messagesByDate = {};
        
        data.timeline.forEach(message => {
            const date = new Date(message.timestamp);
            const dateString = date.toLocaleDateString();
            
            if (!messagesByDate[dateString]) {
                messagesByDate[dateString] = [];
            }
            
            messagesByDate[dateString].push(message);
        });
        
        // Create timeline entries for each date
        Object.keys(messagesByDate).forEach(dateString => {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            
            // Create date header
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.textContent = dateString;
            dateGroup.appendChild(dateHeader);
            
            // Create messages for this date
            messagesByDate[dateString].forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.className = `message ${message.isUser ? 'user-message' : 'ai-message'}`;
                
                // Set border color based on importance
                if (message.importance >= 0.7) {
                    messageElement.style.borderLeftColor = this.getColor('highImportance');
                } else if (message.importance >= 0.4) {
                    messageElement.style.borderLeftColor = this.getColor('mediumImportance');
                } else {
                    messageElement.style.borderLeftColor = this.getColor('lowImportance');
                }
                
                // Create message header
                const messageHeader = document.createElement('div');
                messageHeader.className = 'message-header';
                
                const sender = document.createElement('span');
                sender.className = 'sender';
                sender.textContent = message.isUser ? 'User' : 'AI';
                sender.style.color = message.isUser ? this.getColor('user') : this.getColor('ai');
                
                const time = document.createElement('span');
                time.className = 'time';
                time.textContent = new Date(message.timestamp).toLocaleTimeString();
                
                const topic = document.createElement('span');
                topic.className = 'topic';
                topic.textContent = message.topic;
                
                messageHeader.appendChild(sender);
                messageHeader.appendChild(time);
                messageHeader.appendChild(topic);
                
                // Create message content
                const content = document.createElement('div');
                content.className = 'message-content';
                content.textContent = message.message;
                
                // Assemble message
                messageElement.appendChild(messageHeader);
                messageElement.appendChild(content);
                
                // Add tooltip with additional information
                messageElement.title = `ID: ${message.id}
Sender: ${message.isUser ? 'User' : 'AI'}
Time: ${new Date(message.timestamp).toLocaleString()}
Topic: ${message.topic}
Importance: ${message.importance.toFixed(2)}`;
                
                dateGroup.appendChild(messageElement);
            });
            
            timeline.appendChild(dateGroup);
        });
        
        timelineContainer.appendChild(timeline);
        this.visualizationContainer.appendChild(timelineContainer);
    }
    
    /**
     * Render relationship visualization
     * @param {Object} data - Relationship visualization data
     */
    renderRelationshipVisualization(data) {
        if (!data.relationships || data.relationships.length === 0) {
            this.showMessage('No relationships found matching the criteria.');
            return;
        }
        
        // Create relationship container
        const relationshipContainer = document.createElement('div');
        relationshipContainer.className = 'relationship-container';
        
        // Create relationship header
        const header = document.createElement('h3');
        header.textContent = `Relationships (${data.relationships.length})`;
        relationshipContainer.appendChild(header);
        
        // Create relationship network visualization
        const networkContainer = document.createElement('div');
        networkContainer.className = 'network-container';
        
        // Create center node (user)
        const userNode = document.createElement('div');
        userNode.className = 'user-node';
        userNode.textContent = 'User';
        networkContainer.appendChild(userNode);
        
        // Create relationship nodes
        data.relationships.forEach((relationship, index) => {
            const node = document.createElement('div');
            node.className = 'relationship-node';
            
            // Position node in a circle around the user node
            const angle = (index / data.relationships.length) * 2 * Math.PI;
            const radius = 150; // pixels
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            node.style.left = `calc(50% + ${x}px)`;
            node.style.top = `calc(50% + ${y}px)`;
            
            // Set node color based on relationship type
            const typeColors = {
                friend: '#4cc9f0',
                family: '#4361ee',
                mom: '#3a0ca3',
                dad: '#3a0ca3',
                sister: '#7209b7',
                brother: '#7209b7',
                wife: '#f72585',
                husband: '#f72585',
                partner: '#f72585',
                son: '#560bad',
                daughter: '#560bad',
                boss: '#4cc9f0',
                coworker: '#4cc9f0',
                colleague: '#4cc9f0'
            };
            
            const color = typeColors[relationship.type] || this.getColor('accent');
            node.style.backgroundColor = color;
            
            // Set node size based on importance
            const baseSize = 40; // pixels
            const sizeMultiplier = 0.5 + (relationship.importance * 0.5);
            const size = baseSize * sizeMultiplier;
            
            node.style.width = `${size}px`;
            node.style.height = `${size}px`;
            
            // Create node label
            const label = document.createElement('div');
            label.className = 'node-label';
            label.textContent = relationship.name;
            
            // Create node content
            const content = document.createElement('div');
            content.className = 'node-content';
            content.textContent = relationship.type;
            
            // Add tooltip with additional information
            node.title = `Name: ${relationship.name}
Type: ${relationship.type}
Importance: ${relationship.importance.toFixed(2)}
Mentions: ${relationship.mentionCount}
First Mentioned: ${new Date(relationship.firstMentioned).toLocaleString()}
Last Mentioned: ${new Date(relationship.lastMentioned).toLocaleString()}`;
            
            // Create connection line
            const connection = document.createElement('div');
            connection.className = 'connection-line';
            
            // Calculate line length and angle
            const lineLength = Math.sqrt(x * x + y * y);
            const lineAngle = Math.atan2(y, x) * (180 / Math.PI);
            
            connection.style.width = `${lineLength}px`;
            connection.style.transform = `rotate(${lineAngle}deg)`;
            connection.style.left = '50%';
            connection.style.top = '50%';
            
            // Set line thickness based on mention count
            const maxMentions = Math.max(...data.relationships.map(rel => rel.mentionCount));
            const minThickness = 1;
            const maxThickness = 5;
            const thickness = minThickness + ((relationship.mentionCount / maxMentions) * (maxThickness - minThickness));
            
            connection.style.height = `${thickness}px`;
            
            // Assemble node
            node.appendChild(content);
            networkContainer.appendChild(connection);
            networkContainer.appendChild(node);
            networkContainer.appendChild(label);
        });
        
        relationshipContainer.appendChild(networkContainer);
        
        // Create relationship list
        const relationshipList = document.createElement('div');
        relationshipList.className = 'relationship-list';
        
        // Group relationships by type
        const relationshipsByType = {};
        
        data.relationships.forEach(relationship => {
            if (!relationshipsByType[relationship.type]) {
                relationshipsByType[relationship.type] = [];
            }
            
            relationshipsByType[relationship.type].push(relationship);
        });
        
        // Create list entries for each type
        Object.keys(relationshipsByType).sort().forEach(type => {
            const typeGroup = document.createElement('div');
            typeGroup.className = 'type-group';
            
            // Create type header
            const typeHeader = document.createElement('div');
            typeHeader.className = 'type-header';
            typeHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeGroup.appendChild(typeHeader);
            
            // Create relationships for this type
            relationshipsByType[type].forEach(relationship => {
                const relationshipElement = document.createElement('div');
                relationshipElement.className = 'relationship-item';
                
                // Set border color based on importance
                if (relationship.importance >= 0.7) {
                    relationshipElement.style.borderLeftColor = this.getColor('highImportance');
                } else if (relationship.importance >= 0.4) {
                    relationshipElement.style.borderLeftColor = this.getColor('mediumImportance');
                } else {
                    relationshipElement.style.borderLeftColor = this.getColor('lowImportance');
                }
                
                // Create relationship name
                const name = document.createElement('div');
                name.className = 'relationship-name';
                name.textContent = relationship.name;
                
                // Create relationship details
                const details = document.createElement('div');
                details.className = 'relationship-details';
                details.textContent = `Mentions: ${relationship.mentionCount}, Importance: ${relationship.importance.toFixed(2)}`;
                
                // Assemble relationship item
                relationshipElement.appendChild(name);
                relationshipElement.appendChild(details);
                
                typeGroup.appendChild(relationshipElement);
            });
            
            relationshipList.appendChild(typeGroup);
        });
        
        relationshipContainer.appendChild(relationshipList);
        this.visualizationContainer.appendChild(relationshipContainer);
    }
    
    /**
     * Render fact visualization
     * @param {Object} data - Fact visualization data
     */
    renderFactVisualization(data) {
        if (!data.facts || data.facts.length === 0) {
            this.showMessage('No facts found matching the criteria.');
            return;
        }
        
        // Create fact container
        const factContainer = document.createElement('div');
        factContainer.className = 'fact-container';
        
        // Create fact header
        const header = document.createElement('h3');
        header.textContent = `Facts (${data.facts.length})`;
        factContainer.appendChild(header);
        
        // Group facts by category
        const factsByCategory = {};
        
        data.facts.forEach(fact => {
            if (!factsByCategory[fact.category]) {
                factsByCategory[fact.category] = [];
            }
            
            factsByCategory[fact.category].push(fact);
        });
        
        // Create fact list for each category
        Object.keys(factsByCategory).sort().forEach(category => {
            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'category-group';
            
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryGroup.appendChild(categoryHeader);
            
            // Create facts for this category
            factsByCategory[category].forEach(fact => {
                const factElement = document.createElement('div');
                factElement.className = 'fact-item';
                
                // Set border color based on importance
                if (fact.importance >= 0.7) {
                    factElement.style.borderLeftColor = this.getColor('highImportance');
                } else if (fact.importance >= 0.4) {
                    factElement.style.borderLeftColor = this.getColor('mediumImportance');
                } else {
                    factElement.style.borderLeftColor = this.getColor('lowImportance');
                }
                
                // Create fact key
                const key = document.createElement('div');
                key.className = 'fact-key';
                key.textContent = fact.key.replace(/_/g, ' ');
                
                // Create fact value
                const value = document.createElement('div');
                value.className = 'fact-value';
                value.textContent = fact.value;
                
                // Create fact details
                const details = document.createElement('div');
                details.className = 'fact-details';
                
                const importance = document.createElement('span');
                importance.className = 'fact-importance';
                importance.textContent = `Importance: ${fact.importance.toFixed(2)}`;
                
                const timestamp = document.createElement('span');
                timestamp.className = 'fact-timestamp';
                timestamp.textContent = `Updated: ${new Date(fact.timestamp).toLocaleString()}`;
                
                details.appendChild(importance);
                details.appendChild(timestamp);
                
                // Assemble fact item
                factElement.appendChild(key);
                factElement.appendChild(value);
                factElement.appendChild(details);
                
                // Add tooltip with additional information
                factElement.title = `Key: ${fact.key}
Value: ${fact.value}
Category: ${fact.category}
Importance: ${fact.importance.toFixed(2)}
Last Updated: ${new Date(fact.timestamp).toLocaleString()}
Update Count: ${fact.updateCount}`;
                
                categoryGroup.appendChild(factElement);
            });
            
            factContainer.appendChild(categoryGroup);
        });
        
        this.visualizationContainer.appendChild(factContainer);
    }
    
    /**
     * Render importance distribution visualization
     * @param {Object} data - Importance distribution data
     */
    renderImportanceVisualization(data) {
        if (!data.distribution || data.distribution.length === 0) {
            this.showMessage('No importance distribution data available.');
            return;
        }
        
        // Create importance container
        const importanceContainer = document.createElement('div');
        importanceContainer.className = 'importance-container';
        
        // Create importance header
        const header = document.createElement('h3');
        header.textContent = 'Memory Importance Distribution';
        importanceContainer.appendChild(header);
        
        // Create distribution chart
        const chartContainer = document.createElement('div');
        chartContainer.className = 'distribution-chart-container';
        
        // Create chart
        const chart = document.createElement('div');
        chart.className = 'distribution-chart';
        
        // Create bars for each importance range
        data.distribution.forEach(range => {
            const rangeBar = document.createElement('div');
            rangeBar.className = 'range-bar';
            
            // Create bar label
            const label = document.createElement('div');
            label.className = 'range-label';
            label.textContent = range.range;
            
            // Create stacked bar
            const stackedBar = document.createElement('div');
            stackedBar.className = 'stacked-bar';
            
            // Calculate total for percentage
            const total = data.totals.total;
            
            // Create segments for each memory type
            const types = [
                { key: 'facts', label: 'Facts', color: '#4cc9f0' },
                { key: 'conversations', label: 'Conversations', color: '#4361ee' },
                { key: 'preferences', label: 'Preferences', color: '#3a0ca3' },
                { key: 'relationships', label: 'Relationships', color: '#7209b7' }
            ];
            
            types.forEach(type => {
                if (range[type.key] > 0) {
                    const segment = document.createElement('div');
                    segment.className = 'bar-segment';
                    segment.style.backgroundColor = type.color;
                    
                    // Calculate segment width as percentage of total
                    const width = (range[type.key] / total) * 100;
                    segment.style.width = `${width}%`;
                    
                    // Add tooltip
                    segment.title = `${type.label}: ${range[type.key]} (${(width).toFixed(1)}%)`;
                    
                    stackedBar.appendChild(segment);
                }
            });
            
            // Create count label
            const count = document.createElement('div');
            count.className = 'range-count';
            count.textContent = range.total;
            
            // Assemble bar
            rangeBar.appendChild(label);
            rangeBar.appendChild(stackedBar);
            rangeBar.appendChild(count);
            
            chart.appendChild(rangeBar);
        });
        
        chartContainer.appendChild(chart);
        
        // Create legend
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        
        const legendItems = [
            { label: 'Facts', color: '#4cc9f0', count: data.totals.facts },
            { label: 'Conversations', color: '#4361ee', count: data.totals.conversations },
            { label: 'Preferences', color: '#3a0ca3', count: data.totals.preferences },
            { label: 'Relationships', color: '#7209b7', count: data.totals.relationships }
        ];
        
        legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = item.color;
            
            const label = document.createElement('span');
            label.textContent = `${item.label} (${item.count})`;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            
            legend.appendChild(legendItem);
        });
        
        chartContainer.appendChild(legend);
        importanceContainer.appendChild(chartContainer);
        
        // Create summary
        const summary = document.createElement('div');
        summary.className = 'importance-summary';
        summary.textContent = `Total memory items: ${data.totals.total}`;
        
        importanceContainer.appendChild(summary);
        this.visualizationContainer.appendChild(importanceContainer);
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'visualization-error';
        errorElement.textContent = message;
        
        this.visualizationContainer.appendChild(errorElement);
    }
    
    /**
     * Show message
     * @param {string} message - Message to display
     */
    showMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'visualization-message';
        messageElement.textContent = message;
        
        this.visualizationContainer.appendChild(messageElement);
    }
    
    /**
     * Set color scheme
     * @param {string} scheme - Color scheme name
     */
    setColorScheme(scheme) {
        if (this.colorSchemes[scheme]) {
            this.visualizationOptions.colorScheme = scheme;
            
            // Re-render current visualization if data is available
            if (this.visualizationData) {
                this.renderVisualization(this.visualizationOptions.type, this.visualizationData);
            }
            
            // Publish color scheme change event
            this.eventSystem.publish('visualization-color-scheme-changed', {
                scheme: scheme
            });
        }
    }
    
    /**
     * Get color from current color scheme
     * @param {string} colorName - Name of the color
     * @returns {string} Color value
     */
    getColor(colorName) {
        const scheme = this.colorSchemes[this.visualizationOptions.colorScheme] || this.colorSchemes.default;
        return scheme[colorName] || '#cccccc';
    }
}

// Export the class
export default MemoryVisualization;
