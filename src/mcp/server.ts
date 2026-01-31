import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getTools } from './tools/index.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: '@drkraft/basecamp-cli',
      version: '2.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool handlers
  setupToolHandlers(server);

  return server;
}

/**
 * Setup tool-related request handlers
 */
function setupToolHandlers(server: Server): void {
  // Handle tools/list request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = await getTools();
    return { tools };
  });

  // Handle tools/call request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tools = await getTools();
    
    const tool = tools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Tool execution will be implemented in the next phase
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: `Tool ${name} called with arguments: ${JSON.stringify(args)}`,
        },
      ],
    };
  });
}

/**
 * Start the MCP server with stdio transport
 */
export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  
  // Log to stderr so it doesn't interfere with JSON-RPC on stdout
  console.error('Basecamp MCP server running on stdio');
}
