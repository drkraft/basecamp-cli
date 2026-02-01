---
name: basecamp-cli
description: Complete CLI and MCP server for Basecamp 4. Manage projects, todos, messages, kanban boards, schedules, documents, and more. Use when you need to interact with Basecamp from the terminal or integrate Basecamp operations into AI workflows.
mcp: true
---

# Basecamp CLI

Full-featured CLI and MCP server for Basecamp 4 API.

## Features

- **18 command groups** covering all Basecamp 4 domains
- **43 MCP tools** for AI assistant integration
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
| Projects | list_projects, get_project, create_project |
| Todos | list_todolists, list_todos, create_todo, complete_todo, update_todo, delete_todo, delete_todolist |
| Messages | list_messages, get_message, create_message |
| Comments | list_comments, create_comment |
| Documents | list_documents, create_document |
| Schedules | list_schedule_entries, create_schedule_entry |
| Card Tables | get_card_table, list_cards, create_card |
| Search | search |
| + more | 43 tools total |

## CLI Commands

```bash
basecamp projects list
basecamp todos list --project <id> --list <list-id>
basecamp todos create --project <id> --list <list-id> --content "Task"
basecamp todos delete <id> --project <id>
basecamp todolists delete <id> --project <id>
basecamp cardtables cards --project <id> --column <col-id>
basecamp search "keyword"
```

## Links

- [Full Documentation](https://github.com/drkraft/basecamp-cli)
- [Basecamp API](https://github.com/basecamp/bc3-api)
