#!/usr/bin/env node

import { Command } from 'commander';
import { createAuthCommands, createAccountsCommand, createAccountCommand } from './commands/auth.js';
import { createProjectsCommands } from './commands/projects.js';
import { createTodoListsCommands, createTodosCommands } from './commands/todos.js';
import { createMessagesCommands } from './commands/messages.js';
import { createCampfiresCommands } from './commands/campfires.js';
import { createPeopleCommands } from './commands/people.js';
import { createCommentsCommands } from './commands/comments.js';
import { createVaultsCommands } from './commands/vaults.js';
import { createDocumentsCommands } from './commands/documents.js';
import { createUploadsCommands } from './commands/uploads.js';

const program = new Command();

program
  .name('basecamp')
  .description('CLI for managing Basecamp 4 projects, to-dos, messages, and campfires')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose output for debugging');

// Auth commands
program.addCommand(createAuthCommands());
program.addCommand(createAccountsCommand());
program.addCommand(createAccountCommand());

// Resource commands
program.addCommand(createProjectsCommands());
program.addCommand(createTodoListsCommands());
program.addCommand(createTodosCommands());
program.addCommand(createMessagesCommands());
program.addCommand(createCampfiresCommands());
program.addCommand(createPeopleCommands());
program.addCommand(createCommentsCommands());
program.addCommand(createVaultsCommands());
program.addCommand(createDocumentsCommands());
program.addCommand(createUploadsCommands());

program.parse();
