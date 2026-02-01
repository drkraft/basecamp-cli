---
name: basecamp-cli
description: Complete CLI and MCP server for Basecamp 4. Manage projects, todos, messages, kanban boards, schedules, documents, and more. Use when you need to interact with Basecamp from the terminal or integrate Basecamp operations into AI workflows.
mcp: true
---

# Basecamp CLI

Full-featured CLI and MCP server for Basecamp 4 API.

## Features

- **18 command groups** covering all Basecamp 4 domains
- **44 MCP tools** for AI assistant integration
- Automatic pagination and retry with backoff
- OAuth 2.0 authentication

## Install

```bash
npm i -g @drkraft/basecamp-cli
```

## Auth

1. Create OAuth app at https://launchpad.37signals.com/integrations
2. Configure:
```bash
basecamp auth configure --client-id <id> --redirect-uri http://localhost:9292/callback
export BASECAMP_CLIENT_SECRET="<secret>"
basecamp auth login
```

## MCP Usage

Add to your MCP config:
```json
{
  "mcpServers": {
    "basecamp": {
      "command": "basecamp-mcp"
    }
  }
}
```

## Available MCP Tools

| Category | Tools |
|----------|-------|
| Projects | basecamp_list_projects, basecamp_get_project, basecamp_create_project |
| Todos | basecamp_list_todolists, basecamp_list_todos, basecamp_create_todo, basecamp_complete_todo, basecamp_update_todo, basecamp_delete_todo, basecamp_delete_todolist, basecamp_move_todo |
| Messages | basecamp_list_messages, basecamp_get_message, basecamp_create_message |
| Comments | basecamp_list_comments, basecamp_create_comment |
| Documents | basecamp_list_documents, basecamp_create_document |
| Schedules | basecamp_list_schedule_entries, basecamp_create_schedule_entry |
| Card Tables | basecamp_get_card_table, basecamp_list_cards, basecamp_create_card |
| Search | basecamp_search |
| + more | 44 tools total |

## CLI Commands

```bash
basecamp projects list
basecamp todos list --project <id> --list <list-id>
basecamp todos create --project <id> --list <list-id> --content "Task"
basecamp todos delete <id> --project <id>
basecamp todos move <id> --project <id> --list <target-list-id>
basecamp todolists delete <id> --project <id>
basecamp cardtables cards --project <id> --column <col-id>
basecamp search "keyword"
```

## Links

- [Full Documentation](https://github.com/drkraft/basecamp-cli)
- [Basecamp API](https://github.com/basecamp/bc3-api)
