---
name: basecamp-cli
description: CLI and MCP server for Basecamp 4. Use when you need to interact with Basecamp projects, todos, messages, schedules, kanban cards, documents, or campfires. Provides 44 MCP tools for AI-driven project management workflows.
mcp: true
metadata: {"openclaw":{"emoji":"🏕️","homepage":"https://github.com/drkraft/basecamp-cli","primaryEnv":"BASECAMP_CLIENT_SECRET","requires":{"bins":["basecamp-mcp"],"env":["BASECAMP_CLIENT_SECRET"]},"install":[{"id":"npm","kind":"node","package":"@drkraft/basecamp-cli","bins":["basecamp","basecamp-mcp"],"label":"Install @drkraft/basecamp-cli (npm)","global":true}]}}
---

# Basecamp CLI

Full-featured CLI and MCP server for Basecamp 4 API.

## Features

- **18 CLI command groups** covering all Basecamp 4 domains
- **44 MCP tools** for AI assistant integration
- Automatic pagination and retry with exponential backoff
- OAuth 2.0 authentication with PKCE

## Installation

```bash
npm install -g @drkraft/basecamp-cli
```

## Authentication Setup

1. Create an OAuth app at https://launchpad.37signals.com/integrations
   - Set redirect URI to `http://localhost:9292/callback`
2. Configure credentials:
```bash
basecamp auth configure --client-id <your-client-id>
export BASECAMP_CLIENT_SECRET="<your-client-secret>"
```
3. Login:
```bash
basecamp auth login
```

## MCP Server Configuration

Add to your MCP config (e.g., `~/.config/claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "basecamp": {
      "command": "basecamp-mcp",
      "env": {
        "BASECAMP_CLIENT_SECRET": "<your-client-secret>"
      }
    }
  }
}
```

## Available MCP Tools (44)

| Category | Tools |
|----------|-------|
| Projects | `basecamp_list_projects`, `basecamp_get_project`, `basecamp_create_project` |
| Todo Lists | `basecamp_list_todolists`, `basecamp_get_todolist` |
| Todos | `basecamp_list_todos`, `basecamp_get_todo`, `basecamp_create_todo`, `basecamp_update_todo`, `basecamp_complete_todo`, `basecamp_uncomplete_todo`, `basecamp_delete_todo`, `basecamp_delete_todolist`, `basecamp_move_todo` |
| Messages | `basecamp_list_messages`, `basecamp_get_message`, `basecamp_create_message` |
| People | `basecamp_list_people`, `basecamp_get_person`, `basecamp_get_me` |
| Comments | `basecamp_list_comments`, `basecamp_get_comment`, `basecamp_create_comment` |
| Vaults | `basecamp_list_vaults`, `basecamp_get_vault` |
| Documents | `basecamp_list_documents`, `basecamp_get_document`, `basecamp_create_document`, `basecamp_update_document` |
| Schedules | `basecamp_list_schedule_entries`, `basecamp_get_schedule_entry`, `basecamp_create_schedule_entry` |
| Card Tables | `basecamp_get_card_table`, `basecamp_get_column`, `basecamp_list_cards`, `basecamp_create_card` |
| Search | `basecamp_search` |
| Recordings | `basecamp_list_recordings`, `basecamp_archive_recording` |
| Subscriptions | `basecamp_list_subscriptions`, `basecamp_subscribe` |
| Campfires | `basecamp_list_campfires`, `basecamp_get_campfire_lines`, `basecamp_send_campfire_line` |

## CLI Quick Reference

```bash
# Projects
basecamp projects list
basecamp projects get <id>

# Todos
basecamp todolists list --project <id>
basecamp todos list --project <id> --list <list-id>
basecamp todos create --project <id> --list <list-id> --content "Task"
basecamp todos complete <id> --project <id>
basecamp todos delete <id> --project <id>
basecamp todos move <id> --project <id> --list <target-list-id>

# Messages
basecamp messages list --project <id>
basecamp messages create --project <id> --subject "Title" --content "<p>Body</p>"

# Kanban
basecamp cardtables get --project <id>
basecamp cardtables cards --project <id> --column <col-id>
basecamp cardtables create-card --project <id> --column <col-id> --title "Card"

# Search
basecamp search "keyword"
basecamp search "keyword" --type Todo --project <id>
```

All commands support `--format json` for JSON output.

## Links

- [Full Documentation](https://github.com/drkraft/basecamp-cli)
- [npm Package](https://www.npmjs.com/package/@drkraft/basecamp-cli)
- [Basecamp API Reference](https://github.com/basecamp/bc3-api)
