// CLEAN TEST FLOW - 4 NODES
// Simple flow to test the system without complications

export const TEST_FLOW = {
  name: 'Clean Test Flow - 4 Nodes',
  description: 'Simple test flow with Input -> Research -> Content -> Output',
  type: 'full',
  nodes: [
    {
      id: 'input-1',
      type: 'input',
      position: { x: 100, y: 200 },
      data: {
        label: 'Test Input',
        description: 'Simple input for testing',
        aiEnabled: false,
        selectedModels: [],
        inputFields: [
          { 
            id: 1, 
            name: 'topic', 
            type: 'text', 
            required: true, 
            variable: 'topic', 
            placeholder: 'Enter your topic' 
          },
          { 
            id: 2, 
            name: 'word_count', 
            type: 'select', 
            required: true, 
            variable: 'word_count', 
            options: ['1000', '2000', '3000', '5000'] 
          }
        ]
      }
    },
    {
      id: 'research-1',
      type: 'process',
      role: 'researcher',
      position: { x: 400, y: 200 },
      data: {
        label: 'Research Node',
        description: 'Gathers information about the topic',
        aiEnabled: true,
        selectedModels: ['OPENA-01-first:gpt-4o'],
        systemPrompt: "You are a research specialist. Gather comprehensive information about the given topic.",
        userPrompt: "Research the topic: {topic}. Provide detailed information and insights."
      }
    },
    {
      id: 'content-1',
      type: 'process',
      role: 'content_writer',
      position: { x: 700, y: 200 },
      data: {
        label: 'Content Writer',
        description: 'Writes content based on research',
        aiEnabled: true,
        selectedModels: ['OPENA-01-first:gpt-4o'],
        systemPrompt: "You are a professional content writer. Create engaging, well-structured content.",
        userPrompt: "Based on the research: {research_data}, write {word_count} words of content about {topic}."
      }
    },
    {
      id: 'output-1',
      type: 'output',
      position: { x: 1000, y: 200 },
      data: {
        label: 'Final Output',
        description: 'Formats and delivers the final content',
        aiEnabled: false,
        selectedModels: [],
        outputFormat: 'text'
      }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'input-1',
      target: 'research-1',
      type: 'smoothstep'
    },
    {
      id: 'edge-2',
      source: 'research-1',
      target: 'content-1',
      type: 'smoothstep'
    },
    {
      id: 'edge-3',
      source: 'content-1',
      target: 'output-1',
      type: 'smoothstep'
    }
  ]
}
