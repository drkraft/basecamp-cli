import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as api from '../../lib/api.js';

/**
 * Tool definition with handler
 */
interface ToolWithHandler extends Tool {
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * All MCP tools for Basecamp CLI
 */
const tools: ToolWithHandler[] = [
  // ============ PROJECTS (3) ============
  {
    name: 'basecamp_list_projects',
    description: 'List all Basecamp projects in the current account',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async () => api.listProjects(),
  },
  {
    name: 'basecamp_get_project',
    description: 'Get details of a specific Basecamp project including its dock (tools)',
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
    handler: async (args) => api.getProject(args.projectId as number),
  },
  {
    name: 'basecamp_create_project',
    description: 'Create a new Basecamp project',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the project',
        },
        description: {
          type: 'string',
          description: 'Optional description of the project',
        },
      },
      required: ['name'],
    },
    handler: async (args) => api.createProject(args.name as string, args.description as string | undefined),
  },

  // ============ TODO LISTS (2) ============
  {
    name: 'basecamp_list_todolists',
    description: 'List all to-do lists in a project',
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
    handler: async (args) => api.listTodoLists(args.projectId as number),
  },
  {
    name: 'basecamp_get_todolist',
    description: 'Get details of a specific to-do list',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        todolistId: {
          type: 'number',
          description: 'The ID of the to-do list',
        },
      },
      required: ['projectId', 'todolistId'],
    },
    handler: async (args) => api.getTodoList(args.projectId as number, args.todolistId as number),
  },

  // ============ TODOS (6) ============
  {
    name: 'basecamp_list_todos',
    description: 'List to-dos in a to-do list. Can filter by completion status.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        todolistId: {
          type: 'number',
          description: 'The ID of the to-do list',
        },
        completed: {
          type: 'boolean',
          description: 'Filter by completion status (true for completed, false for incomplete)',
        },
      },
      required: ['projectId', 'todolistId'],
    },
    handler: async (args) => api.listTodos(
      args.projectId as number,
      args.todolistId as number,
      args.completed as boolean | undefined
    ),
  },
  {
    name: 'basecamp_get_todo',
    description: 'Get details of a specific to-do item',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        todoId: {
          type: 'number',
          description: 'The ID of the to-do',
        },
      },
      required: ['projectId', 'todoId'],
    },
    handler: async (args) => api.getTodo(args.projectId as number, args.todoId as number),
  },
  {
    name: 'basecamp_create_todo',
    description: 'Create a new to-do in a to-do list',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        todolistId: {
          type: 'number',
          description: 'The ID of the to-do list',
        },
        content: {
          type: 'string',
          description: 'The content/title of the to-do',
        },
        description: {
          type: 'string',
          description: 'Optional detailed description (HTML allowed)',
        },
        assigneeIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of person IDs to assign',
        },
        dueOn: {
          type: 'string',
          description: 'Due date in YYYY-MM-DD format',
        },
        startsOn: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
      },
      required: ['projectId', 'todolistId', 'content'],
    },
    handler: async (args) => api.createTodo(
      args.projectId as number,
      args.todolistId as number,
      args.content as string,
      {
        description: args.description as string | undefined,
        assignee_ids: args.assigneeIds as number[] | undefined,
        due_on: args.dueOn as string | undefined,
        starts_on: args.startsOn as string | undefined,
      }
    ),
  },
  {
    name: 'basecamp_update_todo',
    description: 'Update an existing to-do item',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        todoId: {
          type: 'number',
          description: 'The ID of the to-do',
        },
        content: {
          type: 'string',
          description: 'New content/title of the to-do',
        },
        description: {
          type: 'string',
          description: 'New description (HTML allowed)',
        },
        assigneeIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of person IDs to assign',
        },
        dueOn: {
          type: 'string',
          description: 'Due date in YYYY-MM-DD format (use null to clear)',
        },
        startsOn: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (use null to clear)',
        },
      },
      required: ['projectId', 'todoId'],
    },
    handler: async (args) => api.updateTodo(
      args.projectId as number,
      args.todoId as number,
      {
        content: args.content as string | undefined,
        description: args.description as string | undefined,
        assignee_ids: args.assigneeIds as number[] | undefined,
        due_on: args.dueOn as string | null | undefined,
        starts_on: args.startsOn as string | null | undefined,
      }
    ),
  },
  {
    name: 'basecamp_complete_todo',
    description: 'Mark a to-do as complete',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        todoId: {
          type: 'number',
          description: 'The ID of the to-do',
        },
      },
      required: ['projectId', 'todoId'],
    },
    handler: async (args) => {
      await api.completeTodo(args.projectId as number, args.todoId as number);
      return { success: true, message: 'To-do marked as complete' };
    },
  },
  {
    name: 'basecamp_uncomplete_todo',
    description: 'Mark a to-do as incomplete',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        todoId: {
          type: 'number',
          description: 'The ID of the to-do',
        },
      },
      required: ['projectId', 'todoId'],
    },
    handler: async (args) => {
      await api.uncompleteTodo(args.projectId as number, args.todoId as number);
      return { success: true, message: 'To-do marked as incomplete' };
    },
  },

  // ============ MESSAGES (3) ============
  {
    name: 'basecamp_list_messages',
    description: 'List all messages in a project message board',
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
    handler: async (args) => api.listMessages(args.projectId as number),
  },
  {
    name: 'basecamp_get_message',
    description: 'Get details of a specific message',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        messageId: {
          type: 'number',
          description: 'The ID of the message',
        },
      },
      required: ['projectId', 'messageId'],
    },
    handler: async (args) => api.getMessage(args.projectId as number, args.messageId as number),
  },
  {
    name: 'basecamp_create_message',
    description: 'Create a new message in the project message board',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        subject: {
          type: 'string',
          description: 'Subject line of the message',
        },
        content: {
          type: 'string',
          description: 'HTML content of the message body',
        },
      },
      required: ['projectId', 'subject'],
    },
    handler: async (args) => api.createMessage(
      args.projectId as number,
      args.subject as string,
      args.content as string | undefined
    ),
  },

  // ============ PEOPLE (3) ============
  {
    name: 'basecamp_list_people',
    description: 'List all people in the account or in a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'Optional project ID to filter people by project',
        },
      },
      required: [],
    },
    handler: async (args) => api.listPeople(args.projectId as number | undefined),
  },
  {
    name: 'basecamp_get_person',
    description: 'Get details of a specific person',
    inputSchema: {
      type: 'object',
      properties: {
        personId: {
          type: 'number',
          description: 'The ID of the person',
        },
      },
      required: ['personId'],
    },
    handler: async (args) => api.getPerson(args.personId as number),
  },
  {
    name: 'basecamp_get_me',
    description: 'Get the current authenticated user profile',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async () => api.getMe(),
  },

  // ============ COMMENTS (3) ============
  {
    name: 'basecamp_list_comments',
    description: 'List comments on a recording (to-do, message, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        recordingId: {
          type: 'number',
          description: 'The ID of the recording (to-do, message, etc.)',
        },
      },
      required: ['projectId', 'recordingId'],
    },
    handler: async (args) => api.listComments(args.projectId as number, args.recordingId as number),
  },
  {
    name: 'basecamp_get_comment',
    description: 'Get details of a specific comment',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        commentId: {
          type: 'number',
          description: 'The ID of the comment',
        },
      },
      required: ['projectId', 'commentId'],
    },
    handler: async (args) => api.getComment(args.projectId as number, args.commentId as number),
  },
  {
    name: 'basecamp_create_comment',
    description: 'Add a comment to a recording (to-do, message, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        recordingId: {
          type: 'number',
          description: 'The ID of the recording to comment on',
        },
        content: {
          type: 'string',
          description: 'HTML content of the comment',
        },
      },
      required: ['projectId', 'recordingId', 'content'],
    },
    handler: async (args) => api.createComment(
      args.projectId as number,
      args.recordingId as number,
      args.content as string
    ),
  },

  // ============ VAULTS (2) ============
  {
    name: 'basecamp_list_vaults',
    description: 'List vaults (folders) in a project or within a parent vault',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        parentVaultId: {
          type: 'number',
          description: 'Optional parent vault ID to list child vaults',
        },
      },
      required: ['projectId'],
    },
    handler: async (args) => api.listVaults(args.projectId as number, args.parentVaultId as number | undefined),
  },
  {
    name: 'basecamp_get_vault',
    description: 'Get details of a specific vault',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        vaultId: {
          type: 'number',
          description: 'The ID of the vault',
        },
      },
      required: ['projectId', 'vaultId'],
    },
    handler: async (args) => api.getVault(args.projectId as number, args.vaultId as number),
  },

  // ============ DOCUMENTS (4) ============
  {
    name: 'basecamp_list_documents',
    description: 'List documents in a vault',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        vaultId: {
          type: 'number',
          description: 'The ID of the vault',
        },
      },
      required: ['projectId', 'vaultId'],
    },
    handler: async (args) => api.listDocuments(args.projectId as number, args.vaultId as number),
  },
  {
    name: 'basecamp_get_document',
    description: 'Get details of a specific document',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        documentId: {
          type: 'number',
          description: 'The ID of the document',
        },
      },
      required: ['projectId', 'documentId'],
    },
    handler: async (args) => api.getDocument(args.projectId as number, args.documentId as number),
  },
  {
    name: 'basecamp_create_document',
    description: 'Create a new document in a vault',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        vaultId: {
          type: 'number',
          description: 'The ID of the vault',
        },
        title: {
          type: 'string',
          description: 'Title of the document',
        },
        content: {
          type: 'string',
          description: 'HTML content of the document',
        },
        status: {
          type: 'string',
          description: 'Optional status (draft or published)',
        },
      },
      required: ['projectId', 'vaultId', 'title', 'content'],
    },
    handler: async (args) => api.createDocument(
      args.projectId as number,
      args.vaultId as number,
      args.title as string,
      args.content as string,
      args.status as string | undefined
    ),
  },
  {
    name: 'basecamp_update_document',
    description: 'Update an existing document',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        documentId: {
          type: 'number',
          description: 'The ID of the document',
        },
        title: {
          type: 'string',
          description: 'New title of the document',
        },
        content: {
          type: 'string',
          description: 'New HTML content of the document',
        },
      },
      required: ['projectId', 'documentId'],
    },
    handler: async (args) => api.updateDocument(
      args.projectId as number,
      args.documentId as number,
      {
        title: args.title as string | undefined,
        content: args.content as string | undefined,
      }
    ),
  },

  // ============ SCHEDULES (3) ============
  {
    name: 'basecamp_list_schedule_entries',
    description: 'List schedule entries (events) in a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        status: {
          type: 'string',
          description: 'Filter by status (upcoming, past)',
        },
      },
      required: ['projectId'],
    },
    handler: async (args) => api.listScheduleEntries(args.projectId as number, args.status as string | undefined),
  },
  {
    name: 'basecamp_get_schedule_entry',
    description: 'Get details of a specific schedule entry',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        entryId: {
          type: 'number',
          description: 'The ID of the schedule entry',
        },
      },
      required: ['projectId', 'entryId'],
    },
    handler: async (args) => api.getScheduleEntry(args.projectId as number, args.entryId as number),
  },
  {
    name: 'basecamp_create_schedule_entry',
    description: 'Create a new schedule entry (event)',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        summary: {
          type: 'string',
          description: 'Title/summary of the event',
        },
        startsAt: {
          type: 'string',
          description: 'Start date/time in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)',
        },
        description: {
          type: 'string',
          description: 'Optional HTML description',
        },
        endsAt: {
          type: 'string',
          description: 'End date/time in ISO 8601 format',
        },
        allDay: {
          type: 'boolean',
          description: 'Whether this is an all-day event',
        },
        participantIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of person IDs to add as participants',
        },
      },
      required: ['projectId', 'summary', 'startsAt'],
    },
    handler: async (args) => api.createScheduleEntry(
      args.projectId as number,
      args.summary as string,
      args.startsAt as string,
      {
        description: args.description as string | undefined,
        endsAt: args.endsAt as string | undefined,
        allDay: args.allDay as boolean | undefined,
        participantIds: args.participantIds as number[] | undefined,
      }
    ),
  },

  // ============ CARD TABLES / KANBAN (4) ============
  {
    name: 'basecamp_get_card_table',
    description: 'Get the card table (kanban board) for a project, including all columns',
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
    handler: async (args) => api.getCardTable(args.projectId as number),
  },
  {
    name: 'basecamp_get_column',
    description: 'Get details of a specific card table column',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        columnId: {
          type: 'number',
          description: 'The ID of the column',
        },
      },
      required: ['projectId', 'columnId'],
    },
    handler: async (args) => api.getColumn(args.projectId as number, args.columnId as number),
  },
  {
    name: 'basecamp_list_cards',
    description: 'List cards in a card table column',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        columnId: {
          type: 'number',
          description: 'The ID of the column',
        },
      },
      required: ['projectId', 'columnId'],
    },
    handler: async (args) => api.listCards(args.projectId as number, args.columnId as number),
  },
  {
    name: 'basecamp_create_card',
    description: 'Create a new card in a card table column',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        columnId: {
          type: 'number',
          description: 'The ID of the column',
        },
        title: {
          type: 'string',
          description: 'Title of the card',
        },
        content: {
          type: 'string',
          description: 'Optional HTML content/description',
        },
        dueOn: {
          type: 'string',
          description: 'Due date in YYYY-MM-DD format',
        },
        assigneeIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of person IDs to assign',
        },
      },
      required: ['projectId', 'columnId', 'title'],
    },
    handler: async (args) => api.createCard(
      args.projectId as number,
      args.columnId as number,
      args.title as string,
      {
        content: args.content as string | undefined,
        due_on: args.dueOn as string | undefined,
        assignee_ids: args.assigneeIds as number[] | undefined,
      }
    ),
  },

  // ============ SEARCH (1) ============
  {
    name: 'basecamp_search',
    description: 'Search across all content in Basecamp (to-dos, messages, documents, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string',
        },
        type: {
          type: 'string',
          description: 'Filter by content type (Todo, Message, Document, Upload, Comment, etc.)',
        },
        bucketId: {
          type: 'number',
          description: 'Filter by project ID',
        },
        creatorId: {
          type: 'number',
          description: 'Filter by creator person ID',
        },
        excludeChat: {
          type: 'boolean',
          description: 'Exclude chat/campfire results',
        },
      },
      required: ['query'],
    },
    handler: async (args) => api.search(
      args.query as string,
      {
        type: args.type as string | undefined,
        bucket_id: args.bucketId as number | undefined,
        creator_id: args.creatorId as number | undefined,
        exclude_chat: args.excludeChat as boolean | undefined,
      }
    ),
  },

  // ============ RECORDINGS (2) ============
  {
    name: 'basecamp_list_recordings',
    description: 'List recordings across projects by type (Todo, Message, Document, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Recording type (Todo, Message, Document, Upload, Comment, etc.)',
        },
        bucket: {
          type: 'string',
          description: 'Project ID(s) to filter by (comma-separated for multiple)',
        },
        status: {
          type: 'string',
          enum: ['active', 'archived', 'trashed'],
          description: 'Filter by status',
        },
        sort: {
          type: 'string',
          enum: ['created_at', 'updated_at'],
          description: 'Sort field',
        },
        direction: {
          type: 'string',
          enum: ['asc', 'desc'],
          description: 'Sort direction',
        },
      },
      required: ['type'],
    },
    handler: async (args) => api.listRecordings(
      args.type as string,
      {
        bucket: args.bucket as string | undefined,
        status: args.status as 'active' | 'archived' | 'trashed' | undefined,
        sort: args.sort as 'created_at' | 'updated_at' | undefined,
        direction: args.direction as 'asc' | 'desc' | undefined,
      }
    ),
  },
  {
    name: 'basecamp_archive_recording',
    description: 'Archive a recording (to-do, message, document, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        recordingId: {
          type: 'number',
          description: 'The ID of the recording to archive',
        },
      },
      required: ['projectId', 'recordingId'],
    },
    handler: async (args) => {
      await api.archiveRecording(args.projectId as number, args.recordingId as number);
      return { success: true, message: 'Recording archived' };
    },
  },

  // ============ SUBSCRIPTIONS (2) ============
  {
    name: 'basecamp_list_subscriptions',
    description: 'Get subscription info for a recording (who is subscribed)',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        recordingId: {
          type: 'number',
          description: 'The ID of the recording',
        },
      },
      required: ['projectId', 'recordingId'],
    },
    handler: async (args) => api.getSubscriptions(args.projectId as number, args.recordingId as number),
  },
  {
    name: 'basecamp_subscribe',
    description: 'Subscribe the current user to a recording',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        recordingId: {
          type: 'number',
          description: 'The ID of the recording to subscribe to',
        },
      },
      required: ['projectId', 'recordingId'],
    },
    handler: async (args) => api.subscribe(args.projectId as number, args.recordingId as number),
  },

  // ============ CAMPFIRES (3) ============
  {
    name: 'basecamp_list_campfires',
    description: 'List campfires (chat rooms) in a project',
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
    handler: async (args) => api.listCampfires(args.projectId as number),
  },
  {
    name: 'basecamp_get_campfire_lines',
    description: 'Get chat lines (messages) from a campfire',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        campfireId: {
          type: 'number',
          description: 'The ID of the campfire',
        },
      },
      required: ['projectId', 'campfireId'],
    },
    handler: async (args) => api.getCampfireLines(args.projectId as number, args.campfireId as number),
  },
  {
    name: 'basecamp_send_campfire_line',
    description: 'Send a message to a campfire (chat)',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'number',
          description: 'The ID of the project',
        },
        campfireId: {
          type: 'number',
          description: 'The ID of the campfire',
        },
        content: {
          type: 'string',
          description: 'The message content',
        },
      },
      required: ['projectId', 'campfireId', 'content'],
    },
    handler: async (args) => api.sendCampfireLine(
      args.projectId as number,
      args.campfireId as number,
      args.content as string
    ),
  },
];

/**
 * Get all available MCP tools (without handlers for listing)
 */
export async function getTools(): Promise<Tool[]> {
  return tools.map(({ handler, ...tool }) => tool);
}

/**
 * Get a tool by name with its handler
 */
export function getToolHandler(name: string): ToolWithHandler | undefined {
  return tools.find((t) => t.name === name);
}

/**
 * Execute a tool by name with arguments
 */
export async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const tool = getToolHandler(name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return tool.handler(args);
}
