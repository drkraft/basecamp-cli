import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Get all available MCP tools
 * This is the central registry for all Basecamp CLI tools
 */
export async function getTools(): Promise<Tool[]> {
  return [
    {
      name: 'basecamp_list_projects',
      description: 'List all Basecamp projects',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'basecamp_get_project',
      description: 'Get details of a specific Basecamp project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'number',
            description: 'The ID of the project',
          },
        },
        required: ['projectId'],
      },
    },
  ];
}
