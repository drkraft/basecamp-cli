#!/usr/bin/env node
import {
  archiveProject,
  archiveRecording,
  completeTodo,
  createCard,
  createColumn,
  createComment,
  createDocument,
  createMessage,
  createProject,
  createScheduleEntry,
  createTodo,
  createTodoList,
  createTodolistGroup,
  createUpload,
  createVault,
  createWebhook,
  deleteCard,
  deleteColumn,
  deleteComment,
  deleteScheduleEntry,
  deleteWebhook,
  getAuthorization,
  getCampfireLines,
  getCard,
  getCardTable,
  getComment,
  getCurrentAccountId,
  getDocument,
  getMe,
  getMessage,
  getPerson,
  getProject,
  getSchedule,
  getSubscriptions,
  getTodo,
  getTokens,
  getUpload,
  getVault,
  getWebhook,
  isAuthenticated,
  listCampfires,
  listCards,
  listComments,
  listDocuments,
  listEvents,
  listMessages,
  listPeople,
  listProjects,
  listRecordings,
  listScheduleEntries,
  listTodoLists,
  listTodolistGroups,
  listTodos,
  listUploads,
  listVaults,
  listWebhooks,
  logout,
  moveCard,
  search,
  sendCampfireLine,
  setClientConfig,
  setCurrentAccountId,
  startOAuthFlow,
  subscribe,
  testWebhook,
  trashRecording,
  unarchiveRecording,
  uncompleteTodo,
  unsubscribe,
  updateCard,
  updateColumn,
  updateComment,
  updateDocument,
  updateScheduleEntry,
  updateTodo,
  updateUpload,
  updateVault,
  updateWebhook
} from "./chunk-OGBXAZAX.js";

// src/index.ts
import { Command as Command18 } from "commander";

// src/commands/auth.ts
import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
function createAuthCommands() {
  const auth = new Command("auth").description("Manage authentication");
  auth.command("login").description("Login to Basecamp via OAuth").action(async () => {
    try {
      if (isAuthenticated()) {
        console.log(chalk.yellow('Already authenticated. Use "basecamp auth logout" to logout first.'));
        return;
      }
      console.log(chalk.blue("Starting OAuth flow..."));
      await startOAuthFlow();
      console.log(chalk.green("\u2713 Successfully authenticated!"));
      const authorization = await getAuthorization();
      console.log(chalk.dim(`
Logged in as: ${authorization.identity.first_name} ${authorization.identity.last_name}`));
      if (authorization.accounts.length > 0) {
        console.log(chalk.dim("\nAvailable accounts:"));
        authorization.accounts.filter((a) => a.product === "bc3").forEach((a) => {
          console.log(chalk.dim(`  ${a.id}: ${a.name}`));
        });
        const bc3Account = authorization.accounts.find((a) => a.product === "bc3");
        if (bc3Account) {
          setCurrentAccountId(bc3Account.id);
          console.log(chalk.green(`
\u2713 Auto-selected account: ${bc3Account.name} (${bc3Account.id})`));
        }
      }
    } catch (error) {
      console.error(chalk.red("Login failed:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  auth.command("logout").description("Logout from Basecamp").action(() => {
    logout();
    console.log(chalk.green("\u2713 Successfully logged out"));
  });
  auth.command("status").description("Show authentication status").action(async () => {
    if (!isAuthenticated()) {
      console.log(chalk.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const authorization = await getAuthorization();
      const tokens = getTokens();
      const currentAccountId = getCurrentAccountId();
      console.log(chalk.green("\u2713 Authenticated"));
      console.log(chalk.dim(`User: ${authorization.identity.first_name} ${authorization.identity.last_name}`));
      console.log(chalk.dim(`Email: ${authorization.identity.email_address}`));
      console.log(chalk.dim(`Current Account ID: ${currentAccountId || "Not set"}`));
      if (tokens?.expires_at) {
        const expiresIn = Math.round((tokens.expires_at - Date.now()) / 1e3 / 60);
        console.log(chalk.dim(`Token expires in: ${expiresIn} minutes`));
      }
    } catch (error) {
      console.error(chalk.red("Failed to get status:"), error instanceof Error ? error.message : error);
    }
  });
  auth.command("configure").description("Configure OAuth client settings (client ID and redirect URI only)").requiredOption("--client-id <id>", "OAuth Client ID").option("--redirect-uri <uri>", "OAuth Redirect URI", "http://localhost:9292/callback").action((options) => {
    setClientConfig(options.clientId, options.redirectUri);
    console.log(chalk.green("\u2713 OAuth client configuration saved"));
    console.log(chalk.yellow("\nIMPORTANT: For security, the client secret is NOT stored in the config file."));
    console.log(chalk.yellow('You must set it via environment variable before running "basecamp auth login":'));
    console.log(chalk.cyan('\n  export BASECAMP_CLIENT_SECRET="your-client-secret"\n'));
    console.log(chalk.dim("Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.) for persistence."));
  });
  return auth;
}
function createAccountsCommand() {
  const accounts = new Command("accounts").description("List available Basecamp accounts").action(async () => {
    if (!isAuthenticated()) {
      console.log(chalk.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const authorization = await getAuthorization();
      const currentAccountId = getCurrentAccountId();
      const bc3Accounts = authorization.accounts.filter((a) => a.product === "bc3");
      if (bc3Accounts.length === 0) {
        console.log(chalk.yellow("No Basecamp 3 accounts found."));
        return;
      }
      const table = new Table({
        head: ["ID", "Name", "Current"],
        colWidths: [15, 40, 10]
      });
      bc3Accounts.forEach((account) => {
        table.push([
          account.id,
          account.name,
          account.id === currentAccountId ? chalk.green("\u2713") : ""
        ]);
      });
      console.log(table.toString());
    } catch (error) {
      console.error(chalk.red("Failed to list accounts:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return accounts;
}
function createAccountCommand() {
  const account = new Command("account").description("Manage current account");
  account.command("set <id>").description("Set current Basecamp account").action(async (id) => {
    try {
      const accountId = parseInt(id, 10);
      if (isNaN(accountId)) {
        console.error(chalk.red("Invalid account ID"));
        process.exit(1);
      }
      const authorization = await getAuthorization();
      const account2 = authorization.accounts.find((a) => a.id === accountId);
      if (!account2) {
        console.error(chalk.red(`Account ${accountId} not found`));
        process.exit(1);
      }
      if (account2.product !== "bc3") {
        console.error(chalk.red("This account is not a Basecamp 3 account"));
        process.exit(1);
      }
      setCurrentAccountId(accountId);
      console.log(chalk.green(`\u2713 Switched to account: ${account2.name} (${accountId})`));
    } catch (error) {
      console.error(chalk.red("Failed to set account:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  account.command("current").description("Show current account").action(async () => {
    const currentAccountId = getCurrentAccountId();
    if (!currentAccountId) {
      console.log(chalk.yellow('No account selected. Run "basecamp account set <id>" to select one.'));
      return;
    }
    try {
      const authorization = await getAuthorization();
      const account2 = authorization.accounts.find((a) => a.id === currentAccountId);
      if (account2) {
        console.log(`Current account: ${account2.name} (${account2.id})`);
      } else {
        console.log(`Current account ID: ${currentAccountId}`);
      }
    } catch (error) {
      console.log(`Current account ID: ${currentAccountId}`);
    }
  });
  return account;
}

// src/commands/projects.ts
import { Command as Command2 } from "commander";
import chalk2 from "chalk";
import Table2 from "cli-table3";
function createProjectsCommands() {
  const projects = new Command2("projects").description("Manage Basecamp projects");
  projects.command("list").description("List all projects").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk2.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectList = await listProjects();
      if (options.format === "json") {
        console.log(JSON.stringify(projectList, null, 2));
        return;
      }
      if (projectList.length === 0) {
        console.log(chalk2.yellow("No projects found."));
        return;
      }
      const table = new Table2({
        head: ["ID", "Name", "Status", "Description"],
        colWidths: [12, 30, 12, 40],
        wordWrap: true
      });
      projectList.forEach((project) => {
        table.push([
          project.id,
          project.name,
          project.status,
          project.description?.substring(0, 37) + (project.description?.length > 37 ? "..." : "") || "-"
        ]);
      });
      console.log(table.toString());
      console.log(chalk2.dim(`
Total: ${projectList.length} projects`));
    } catch (error) {
      console.error(chalk2.red("Failed to list projects:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  projects.command("get <id>").description("Get project details").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk2.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(id, 10);
      if (isNaN(projectId)) {
        console.error(chalk2.red("Invalid ID: must be a number"));
        process.exit(1);
      }
      const project = await getProject(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(project, null, 2));
        return;
      }
      console.log(chalk2.bold(project.name));
      console.log(chalk2.dim(`ID: ${project.id}`));
      console.log(chalk2.dim(`Status: ${project.status}`));
      console.log(chalk2.dim(`Purpose: ${project.purpose || "-"}`));
      console.log(chalk2.dim(`Description: ${project.description || "-"}`));
      console.log(chalk2.dim(`Created: ${new Date(project.created_at).toLocaleDateString()}`));
      console.log(chalk2.dim(`URL: ${project.app_url}`));
      console.log(chalk2.dim("\nEnabled tools:"));
      project.dock.filter((d) => d.enabled).forEach((d) => {
        console.log(chalk2.dim(`  - ${d.title} (${d.name})`));
      });
    } catch (error) {
      console.error(chalk2.red("Failed to get project:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  projects.command("create").description("Create a new project").requiredOption("-n, --name <name>", "Project name").option("-d, --description <description>", "Project description").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk2.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const project = await createProject(options.name, options.description);
      if (options.format === "json") {
        console.log(JSON.stringify(project, null, 2));
        return;
      }
      console.log(chalk2.green("\u2713 Project created"));
      console.log(chalk2.dim(`ID: ${project.id}`));
      console.log(chalk2.dim(`Name: ${project.name}`));
      console.log(chalk2.dim(`URL: ${project.app_url}`));
    } catch (error) {
      console.error(chalk2.red("Failed to create project:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  projects.command("archive <id>").description("Archive a project").action(async (id) => {
    if (!isAuthenticated()) {
      console.log(chalk2.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(id, 10);
      if (isNaN(projectId)) {
        console.error(chalk2.red("Invalid ID: must be a number"));
        process.exit(1);
      }
      await archiveProject(projectId);
      console.log(chalk2.green(`\u2713 Project ${projectId} archived`));
    } catch (error) {
      console.error(chalk2.red("Failed to archive project:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return projects;
}

// src/commands/todos.ts
import { Command as Command3 } from "commander";
import chalk3 from "chalk";
import Table3 from "cli-table3";
function createTodoListsCommands() {
  const todolists = new Command3("todolists").description("Manage to-do lists");
  todolists.command("list").description("List to-do lists in a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const lists = await listTodoLists(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(lists, null, 2));
        return;
      }
      if (lists.length === 0) {
        console.log(chalk3.yellow("No to-do lists found."));
        return;
      }
      const table = new Table3({
        head: ["ID", "Name", "Progress", "Description"],
        colWidths: [12, 25, 15, 35],
        wordWrap: true
      });
      lists.forEach((list) => {
        table.push([
          list.id,
          list.name,
          list.completed_ratio || "0/0",
          list.description?.substring(0, 32) + (list.description?.length > 32 ? "..." : "") || "-"
        ]);
      });
      console.log(table.toString());
      console.log(chalk3.dim(`
Total: ${lists.length} lists`));
    } catch (error) {
      console.error(chalk3.red("Failed to list to-do lists:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todolists.command("create").description("Create a to-do list").requiredOption("-p, --project <id>", "Project ID").requiredOption("-n, --name <name>", "List name").option("-d, --description <description>", "List description").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const list = await createTodoList(projectId, options.name, options.description);
      if (options.format === "json") {
        console.log(JSON.stringify(list, null, 2));
        return;
      }
      console.log(chalk3.green("\u2713 To-do list created"));
      console.log(chalk3.dim(`ID: ${list.id}`));
      console.log(chalk3.dim(`Name: ${list.name}`));
    } catch (error) {
      console.error(chalk3.red("Failed to create to-do list:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todolists.command("delete <id>").description("Delete (trash) a to-do list").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const listId = parseInt(id, 10);
      if (isNaN(listId)) {
        console.error(chalk3.red("Invalid to-do list ID: must be a number"));
        process.exit(1);
      }
      await trashRecording(projectId, listId);
      console.log(chalk3.green(`\u2713 To-do list ${listId} moved to trash`));
    } catch (error) {
      console.error(chalk3.red("Failed to delete to-do list:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return todolists;
}
function createTodosCommands() {
  const todos = new Command3("todos").description("Manage to-dos");
  todos.command("list").description("List to-dos in a to-do list").requiredOption("-p, --project <id>", "Project ID").requiredOption("-l, --list <id>", "To-do list ID").option("--completed", "Show completed to-dos").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const listId = parseInt(options.list, 10);
      if (isNaN(listId)) {
        console.error(chalk3.red("Invalid list ID: must be a number"));
        process.exit(1);
      }
      const todoList = await listTodos(projectId, listId, options.completed);
      if (options.format === "json") {
        console.log(JSON.stringify(todoList, null, 2));
        return;
      }
      if (todoList.length === 0) {
        console.log(chalk3.yellow("No to-dos found."));
        return;
      }
      const table = new Table3({
        head: ["ID", "Status", "Content", "Due", "Assignees"],
        colWidths: [12, 10, 35, 12, 20],
        wordWrap: true
      });
      todoList.forEach((todo) => {
        table.push([
          todo.id,
          todo.completed ? chalk3.green("\u2713") : chalk3.dim("\u25CB"),
          todo.content.substring(0, 32) + (todo.content.length > 32 ? "..." : ""),
          todo.due_on || "-",
          todo.assignees?.map((a) => a.name).join(", ") || "-"
        ]);
      });
      console.log(table.toString());
      console.log(chalk3.dim(`
Total: ${todoList.length} to-dos`));
    } catch (error) {
      console.error(chalk3.red("Failed to list to-dos:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("get <id>").description("Get to-do details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk3.red("Invalid todo ID: must be a number"));
        process.exit(1);
      }
      const todo = await getTodo(projectId, todoId);
      if (options.format === "json") {
        console.log(JSON.stringify(todo, null, 2));
        return;
      }
      console.log(chalk3.bold(todo.content));
      console.log(chalk3.dim(`ID: ${todo.id}`));
      console.log(chalk3.dim(`Status: ${todo.completed ? "Completed" : "Pending"}`));
      console.log(chalk3.dim(`Description: ${todo.description || "-"}`));
      console.log(chalk3.dim(`Due: ${todo.due_on || "-"}`));
      console.log(chalk3.dim(`Starts: ${todo.starts_on || "-"}`));
      console.log(chalk3.dim(`Assignees: ${todo.assignees?.map((a) => a.name).join(", ") || "-"}`));
      console.log(chalk3.dim(`Comments: ${todo.comments_count}`));
      console.log(chalk3.dim(`URL: ${todo.app_url}`));
    } catch (error) {
      console.error(chalk3.red("Failed to get to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("create").description("Create a to-do").requiredOption("-p, --project <id>", "Project ID").requiredOption("-l, --list <id>", "To-do list ID").requiredOption("-c, --content <content>", "To-do content").option("-d, --description <description>", "To-do description").option("--due <date>", "Due date (YYYY-MM-DD)").option("--starts <date>", "Start date (YYYY-MM-DD)").option("--assignees <ids>", "Comma-separated assignee IDs").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const listId = parseInt(options.list, 10);
      if (isNaN(listId)) {
        console.error(chalk3.red("Invalid list ID: must be a number"));
        process.exit(1);
      }
      const todoOptions = {};
      if (options.description) todoOptions.description = options.description;
      if (options.due) todoOptions.due_on = options.due;
      if (options.starts) todoOptions.starts_on = options.starts;
      if (options.assignees) {
        todoOptions.assignee_ids = options.assignees.split(",").map((id) => parseInt(id.trim(), 10));
      }
      const todo = await createTodo(projectId, listId, options.content, todoOptions);
      if (options.format === "json") {
        console.log(JSON.stringify(todo, null, 2));
        return;
      }
      console.log(chalk3.green("\u2713 To-do created"));
      console.log(chalk3.dim(`ID: ${todo.id}`));
      console.log(chalk3.dim(`Content: ${todo.content}`));
    } catch (error) {
      console.error(chalk3.red("Failed to create to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("update <id>").description("Update a to-do").requiredOption("-p, --project <id>", "Project ID").option("-c, --content <content>", "New content").option("-d, --description <description>", "New description").option("--due <date>", "Due date (YYYY-MM-DD)").option("--starts <date>", "Start date (YYYY-MM-DD)").option("--assignees <ids>", "Comma-separated assignee IDs").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk3.red("Invalid todo ID: must be a number"));
        process.exit(1);
      }
      const updates = {};
      if (options.content) updates.content = options.content;
      if (options.description) updates.description = options.description;
      if (options.due) updates.due_on = options.due;
      if (options.starts) updates.starts_on = options.starts;
      if (options.assignees) {
        updates.assignee_ids = options.assignees.split(",").map((id2) => parseInt(id2.trim(), 10));
      }
      const todo = await updateTodo(projectId, todoId, updates);
      if (options.format === "json") {
        console.log(JSON.stringify(todo, null, 2));
        return;
      }
      console.log(chalk3.green("\u2713 To-do updated"));
      console.log(chalk3.dim(`ID: ${todo.id}`));
      console.log(chalk3.dim(`Content: ${todo.content}`));
    } catch (error) {
      console.error(chalk3.red("Failed to update to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("complete <id>").description("Mark a to-do as complete").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk3.red("Invalid todo ID: must be a number"));
        process.exit(1);
      }
      await completeTodo(projectId, todoId);
      console.log(chalk3.green(`\u2713 To-do ${todoId} completed`));
    } catch (error) {
      console.error(chalk3.red("Failed to complete to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("uncomplete <id>").description("Mark a to-do as incomplete").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk3.red("Invalid todo ID: must be a number"));
        process.exit(1);
      }
      await uncompleteTodo(projectId, todoId);
      console.log(chalk3.green(`\u2713 To-do ${todoId} marked as incomplete`));
    } catch (error) {
      console.error(chalk3.red("Failed to uncomplete to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("delete <id>").description("Delete (trash) a to-do").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk3.red("Invalid todo ID: must be a number"));
        process.exit(1);
      }
      await trashRecording(projectId, todoId);
      console.log(chalk3.green(`\u2713 To-do ${todoId} moved to trash`));
    } catch (error) {
      console.error(chalk3.red("Failed to delete to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return todos;
}
function createTodoGroupsCommands() {
  const todogroups = new Command3("todogroups").description("Manage to-do list groups");
  todogroups.command("list").description("List to-do groups in a to-do list").requiredOption("-p, --project <id>", "Project ID").requiredOption("-l, --list <id>", "To-do list ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const listId = parseInt(options.list, 10);
      if (isNaN(listId)) {
        console.error(chalk3.red("Invalid list ID: must be a number"));
        process.exit(1);
      }
      const groups = await listTodolistGroups(projectId, listId);
      if (options.format === "json") {
        console.log(JSON.stringify(groups, null, 2));
        return;
      }
      if (groups.length === 0) {
        console.log(chalk3.yellow("No to-do groups found."));
        return;
      }
      const table = new Table3({
        head: ["ID", "Name", "Progress", "Position"],
        colWidths: [12, 25, 15, 12],
        wordWrap: true
      });
      groups.forEach((group) => {
        table.push([
          group.id,
          group.name,
          group.completed_ratio || "0/0",
          group.position
        ]);
      });
      console.log(table.toString());
      console.log(chalk3.dim(`
Total: ${groups.length} groups`));
    } catch (error) {
      console.error(chalk3.red("Failed to list to-do groups:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todogroups.command("create").description("Create a to-do group").requiredOption("-p, --project <id>", "Project ID").requiredOption("-l, --list <id>", "To-do list ID").requiredOption("-n, --name <name>", "Group name").option("--color <color>", "Group color (white|red|orange|yellow|green|blue|aqua|purple|gray|pink|brown)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk3.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk3.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const listId = parseInt(options.list, 10);
      if (isNaN(listId)) {
        console.error(chalk3.red("Invalid list ID: must be a number"));
        process.exit(1);
      }
      const group = await createTodolistGroup(projectId, listId, options.name, options.color);
      if (options.format === "json") {
        console.log(JSON.stringify(group, null, 2));
        return;
      }
      console.log(chalk3.green("\u2713 To-do group created"));
      console.log(chalk3.dim(`ID: ${group.id}`));
      console.log(chalk3.dim(`Name: ${group.name}`));
      console.log(chalk3.dim(`Position: ${group.position}`));
    } catch (error) {
      console.error(chalk3.red("Failed to create to-do group:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return todogroups;
}

// src/commands/messages.ts
import { Command as Command4 } from "commander";
import chalk4 from "chalk";
import Table4 from "cli-table3";
function createMessagesCommands() {
  const messages = new Command4("messages").description("Manage messages");
  messages.command("list").description("List messages in a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk4.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk4.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const messageList = await listMessages(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(messageList, null, 2));
        return;
      }
      if (messageList.length === 0) {
        console.log(chalk4.yellow("No messages found."));
        return;
      }
      const table = new Table4({
        head: ["ID", "Subject", "Author", "Date", "Comments"],
        colWidths: [12, 35, 20, 12, 10],
        wordWrap: true
      });
      messageList.forEach((msg) => {
        table.push([
          msg.id,
          msg.subject.substring(0, 32) + (msg.subject.length > 32 ? "..." : ""),
          msg.creator?.name || "-",
          new Date(msg.created_at).toLocaleDateString(),
          msg.comments_count
        ]);
      });
      console.log(table.toString());
      console.log(chalk4.dim(`
Total: ${messageList.length} messages`));
    } catch (error) {
      console.error(chalk4.red("Failed to list messages:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  messages.command("get <id>").description("Get message details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk4.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk4.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const messageId = parseInt(id, 10);
      if (isNaN(messageId)) {
        console.error(chalk4.red("Invalid message ID: must be a number"));
        process.exit(1);
      }
      const message = await getMessage(projectId, messageId);
      if (options.format === "json") {
        console.log(JSON.stringify(message, null, 2));
        return;
      }
      console.log(chalk4.bold(message.subject));
      console.log(chalk4.dim(`ID: ${message.id}`));
      console.log(chalk4.dim(`Author: ${message.creator?.name || "-"}`));
      console.log(chalk4.dim(`Created: ${new Date(message.created_at).toLocaleString()}`));
      console.log(chalk4.dim(`Comments: ${message.comments_count}`));
      console.log(chalk4.dim(`URL: ${message.app_url}`));
      console.log(chalk4.dim("\nContent:"));
      console.log(message.content || "-");
    } catch (error) {
      console.error(chalk4.red("Failed to get message:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  messages.command("create").description("Create a message").requiredOption("-p, --project <id>", "Project ID").requiredOption("-s, --subject <subject>", "Message subject").option("-c, --content <content>", "Message content (HTML)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk4.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk4.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const message = await createMessage(projectId, options.subject, options.content);
      if (options.format === "json") {
        console.log(JSON.stringify(message, null, 2));
        return;
      }
      console.log(chalk4.green("\u2713 Message created"));
      console.log(chalk4.dim(`ID: ${message.id}`));
      console.log(chalk4.dim(`Subject: ${message.subject}`));
      console.log(chalk4.dim(`URL: ${message.app_url}`));
    } catch (error) {
      console.error(chalk4.red("Failed to create message:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return messages;
}

// src/commands/campfires.ts
import { Command as Command5 } from "commander";
import chalk5 from "chalk";
import Table5 from "cli-table3";
function createCampfiresCommands() {
  const campfires = new Command5("campfires").description("Manage campfires (chat)");
  campfires.command("list").description("List campfires in a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk5.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk5.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const campfireList = await listCampfires(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(campfireList, null, 2));
        return;
      }
      if (campfireList.length === 0) {
        console.log(chalk5.yellow("No campfires found."));
        return;
      }
      const table = new Table5({
        head: ["ID", "Title", "Topic"],
        colWidths: [12, 30, 40],
        wordWrap: true
      });
      campfireList.forEach((campfire) => {
        table.push([
          campfire.id,
          campfire.title || "Campfire",
          campfire.topic || "-"
        ]);
      });
      console.log(table.toString());
    } catch (error) {
      console.error(chalk5.red("Failed to list campfires:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  campfires.command("lines").description("Get recent campfire messages").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --campfire <id>", "Campfire ID").option("-n, --limit <number>", "Number of lines to show", "20").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk5.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk5.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const campfireId = parseInt(options.campfire, 10);
      if (isNaN(campfireId)) {
        console.error(chalk5.red("Invalid campfire ID: must be a number"));
        process.exit(1);
      }
      const limit = parseInt(options.limit, 10);
      if (isNaN(limit)) {
        console.error(chalk5.red("Invalid limit: must be a number"));
        process.exit(1);
      }
      const lines = await getCampfireLines(projectId, campfireId);
      if (options.format === "json") {
        console.log(JSON.stringify(lines, null, 2));
        return;
      }
      if (lines.length === 0) {
        console.log(chalk5.yellow("No messages found."));
        return;
      }
      const displayLines = lines.slice(-limit);
      displayLines.forEach((line) => {
        const time = new Date(line.created_at).toLocaleTimeString();
        const author = line.creator?.name || "Unknown";
        console.log(chalk5.dim(`[${time}]`) + ` ${chalk5.blue(author)}: ${line.content}`);
      });
      console.log(chalk5.dim(`
Showing ${displayLines.length} of ${lines.length} messages`));
    } catch (error) {
      console.error(chalk5.red("Failed to get campfire lines:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  campfires.command("send").description("Send a message to a campfire").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --campfire <id>", "Campfire ID").requiredOption("-m, --message <message>", "Message content").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk5.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk5.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const campfireId = parseInt(options.campfire, 10);
      if (isNaN(campfireId)) {
        console.error(chalk5.red("Invalid campfire ID: must be a number"));
        process.exit(1);
      }
      const line = await sendCampfireLine(projectId, campfireId, options.message);
      if (options.format === "json") {
        console.log(JSON.stringify(line, null, 2));
        return;
      }
      console.log(chalk5.green("\u2713 Message sent"));
    } catch (error) {
      console.error(chalk5.red("Failed to send message:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return campfires;
}

// src/commands/people.ts
import { Command as Command6 } from "commander";
import chalk6 from "chalk";
import Table6 from "cli-table3";
function createPeopleCommands() {
  const people = new Command6("people").description("Manage people");
  people.command("list").description("List people").option("-p, --project <id>", "Project ID (optional, lists all if omitted)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk6.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      let projectId = void 0;
      if (options.project) {
        projectId = parseInt(options.project, 10);
        if (isNaN(projectId)) {
          console.error(chalk6.red("Invalid project ID: must be a number"));
          process.exit(1);
        }
      }
      const peopleList = await listPeople(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(peopleList, null, 2));
        return;
      }
      if (peopleList.length === 0) {
        console.log(chalk6.yellow("No people found."));
        return;
      }
      const table = new Table6({
        head: ["ID", "Name", "Email", "Title", "Role"],
        colWidths: [12, 25, 30, 20, 12],
        wordWrap: true
      });
      peopleList.forEach((person) => {
        let role = "";
        if (person.owner) role = "Owner";
        else if (person.admin) role = "Admin";
        else if (person.client) role = "Client";
        else role = "Member";
        table.push([
          person.id,
          person.name,
          person.email_address,
          person.title || "-",
          role
        ]);
      });
      console.log(table.toString());
      console.log(chalk6.dim(`
Total: ${peopleList.length} people`));
    } catch (error) {
      console.error(chalk6.red("Failed to list people:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  people.command("get <id>").description("Get person details").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk6.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const personId = parseInt(id, 10);
      if (isNaN(personId)) {
        console.error(chalk6.red("Invalid ID: must be a number"));
        process.exit(1);
      }
      const person = await getPerson(personId);
      if (options.format === "json") {
        console.log(JSON.stringify(person, null, 2));
        return;
      }
      console.log(chalk6.bold(person.name));
      console.log(chalk6.dim(`ID: ${person.id}`));
      console.log(chalk6.dim(`Email: ${person.email_address}`));
      console.log(chalk6.dim(`Title: ${person.title || "-"}`));
      console.log(chalk6.dim(`Bio: ${person.bio || "-"}`));
      console.log(chalk6.dim(`Location: ${person.location || "-"}`));
      console.log(chalk6.dim(`Time Zone: ${person.time_zone}`));
      console.log(chalk6.dim(`Company: ${person.company?.name || "-"}`));
      let role = "";
      if (person.owner) role = "Owner";
      else if (person.admin) role = "Admin";
      else if (person.client) role = "Client";
      else role = "Member";
      console.log(chalk6.dim(`Role: ${role}`));
    } catch (error) {
      console.error(chalk6.red("Failed to get person:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  people.command("me").description("Get your profile").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk6.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const person = await getMe();
      if (options.format === "json") {
        console.log(JSON.stringify(person, null, 2));
        return;
      }
      console.log(chalk6.bold(person.name));
      console.log(chalk6.dim(`ID: ${person.id}`));
      console.log(chalk6.dim(`Email: ${person.email_address}`));
      console.log(chalk6.dim(`Title: ${person.title || "-"}`));
      console.log(chalk6.dim(`Bio: ${person.bio || "-"}`));
      console.log(chalk6.dim(`Location: ${person.location || "-"}`));
      console.log(chalk6.dim(`Time Zone: ${person.time_zone}`));
      console.log(chalk6.dim(`Company: ${person.company?.name || "-"}`));
    } catch (error) {
      console.error(chalk6.red("Failed to get profile:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return people;
}

// src/commands/comments.ts
import { Command as Command7 } from "commander";
import chalk7 from "chalk";
import Table7 from "cli-table3";
function createCommentsCommands() {
  const comments = new Command7("comments").description("Manage comments on recordings (todos, messages, etc.)");
  comments.command("list").description("List comments on a recording").requiredOption("-p, --project <id>", "Project ID").requiredOption("-r, --recording <id>", "Recording ID (todo, message, etc.)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk7.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk7.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(options.recording, 10);
      if (isNaN(recordingId)) {
        console.error(chalk7.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      const commentsList = await listComments(projectId, recordingId);
      if (options.format === "json") {
        console.log(JSON.stringify(commentsList, null, 2));
        return;
      }
      if (commentsList.length === 0) {
        console.log(chalk7.yellow("No comments found."));
        return;
      }
      const table = new Table7({
        head: ["ID", "Creator", "Content", "Created"],
        colWidths: [12, 20, 40, 20],
        wordWrap: true
      });
      commentsList.forEach((comment) => {
        table.push([
          comment.id,
          comment.creator?.name || "-",
          comment.content.substring(0, 37) + (comment.content.length > 37 ? "..." : ""),
          new Date(comment.created_at).toLocaleDateString()
        ]);
      });
      console.log(table.toString());
      console.log(chalk7.dim(`
Total: ${commentsList.length} comments`));
    } catch (error) {
      console.error(chalk7.red("Failed to list comments:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  comments.command("get <id>").description("Get comment details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk7.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk7.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) {
        console.error(chalk7.red("Invalid comment ID: must be a number"));
        process.exit(1);
      }
      const comment = await getComment(projectId, commentId);
      if (options.format === "json") {
        console.log(JSON.stringify(comment, null, 2));
        return;
      }
      console.log(chalk7.bold("Comment"));
      console.log(chalk7.dim(`ID: ${comment.id}`));
      console.log(chalk7.dim(`Creator: ${comment.creator?.name || "-"}`));
      console.log(chalk7.dim(`Created: ${new Date(comment.created_at).toLocaleString()}`));
      console.log(chalk7.dim(`Updated: ${new Date(comment.updated_at).toLocaleString()}`));
      console.log(chalk7.dim(`Content:
${comment.content}`));
      console.log(chalk7.dim(`URL: ${comment.app_url}`));
    } catch (error) {
      console.error(chalk7.red("Failed to get comment:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  comments.command("create").description("Create a comment on a recording").requiredOption("-p, --project <id>", "Project ID").requiredOption("-r, --recording <id>", "Recording ID (todo, message, etc.)").requiredOption("-c, --content <content>", "Comment content").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk7.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk7.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(options.recording, 10);
      if (isNaN(recordingId)) {
        console.error(chalk7.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      const comment = await createComment(projectId, recordingId, options.content);
      if (options.format === "json") {
        console.log(JSON.stringify(comment, null, 2));
        return;
      }
      console.log(chalk7.green("\u2713 Comment created"));
      console.log(chalk7.dim(`ID: ${comment.id}`));
      console.log(chalk7.dim(`Content: ${comment.content.substring(0, 50)}${comment.content.length > 50 ? "..." : ""}`));
    } catch (error) {
      console.error(chalk7.red("Failed to create comment:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  comments.command("update <id>").description("Update a comment").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --content <content>", "New comment content").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk7.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk7.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) {
        console.error(chalk7.red("Invalid comment ID: must be a number"));
        process.exit(1);
      }
      const comment = await updateComment(projectId, commentId, options.content);
      if (options.format === "json") {
        console.log(JSON.stringify(comment, null, 2));
        return;
      }
      console.log(chalk7.green("\u2713 Comment updated"));
      console.log(chalk7.dim(`ID: ${comment.id}`));
      console.log(chalk7.dim(`Content: ${comment.content.substring(0, 50)}${comment.content.length > 50 ? "..." : ""}`));
    } catch (error) {
      console.error(chalk7.red("Failed to update comment:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  comments.command("delete <id>").description("Delete a comment").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk7.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk7.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) {
        console.error(chalk7.red("Invalid comment ID: must be a number"));
        process.exit(1);
      }
      await deleteComment(projectId, commentId);
      console.log(chalk7.green(`\u2713 Comment ${commentId} deleted`));
    } catch (error) {
      console.error(chalk7.red("Failed to delete comment:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return comments;
}

// src/commands/schedules.ts
import { Command as Command8 } from "commander";
import chalk8 from "chalk";
import Table8 from "cli-table3";
function createSchedulesCommands() {
  const schedules = new Command8("schedules").description("Manage schedules and schedule entries");
  schedules.command("get").description("Get schedule info for a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk8.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk8.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const schedule = await getSchedule(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(schedule, null, 2));
        return;
      }
      console.log(chalk8.bold(schedule.title));
      console.log(chalk8.dim(`ID: ${schedule.id}`));
      console.log(chalk8.dim(`Status: ${schedule.status}`));
      console.log(chalk8.dim(`Entries: ${schedule.entries_count}`));
      console.log(chalk8.dim(`Include due assignments: ${schedule.include_due_assignments}`));
      console.log(chalk8.dim(`Created: ${new Date(schedule.created_at).toLocaleDateString()}`));
      console.log(chalk8.dim(`URL: ${schedule.app_url}`));
    } catch (error) {
      console.error(chalk8.red("Failed to get schedule:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  schedules.command("entries").description("List schedule entries in a project").requiredOption("-p, --project <id>", "Project ID").option("--status <status>", "Filter by status (upcoming|past)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk8.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk8.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const entries = await listScheduleEntries(projectId, options.status);
      if (options.format === "json") {
        console.log(JSON.stringify(entries, null, 2));
        return;
      }
      if (entries.length === 0) {
        console.log(chalk8.yellow("No schedule entries found."));
        return;
      }
      const table = new Table8({
        head: ["ID", "Summary", "Start", "End", "All Day", "Participants"],
        colWidths: [12, 25, 20, 20, 10, 20],
        wordWrap: true
      });
      entries.forEach((entry) => {
        const startDate = new Date(entry.starts_at).toLocaleDateString();
        const endDate = entry.ends_at ? new Date(entry.ends_at).toLocaleDateString() : "-";
        const participants = entry.participants?.map((p) => p.name).join(", ") || "-";
        table.push([
          entry.id,
          entry.summary.substring(0, 22) + (entry.summary.length > 22 ? "..." : ""),
          startDate,
          endDate,
          entry.all_day ? "Yes" : "No",
          participants.substring(0, 18) + (participants.length > 18 ? "..." : "")
        ]);
      });
      console.log(table.toString());
      console.log(chalk8.dim(`
Total: ${entries.length} entries`));
    } catch (error) {
      console.error(chalk8.red("Failed to list schedule entries:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  schedules.command("create-entry").description("Create a schedule entry").requiredOption("-p, --project <id>", "Project ID").requiredOption("-s, --summary <summary>", "Event summary").requiredOption("--starts-at <datetime>", "Start date/time (ISO 8601)").option("--ends-at <datetime>", "End date/time (ISO 8601)").option("-d, --description <description>", "Event description").option("--all-day", "Mark as all-day event").option("--participants <ids>", "Comma-separated participant IDs").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk8.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk8.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const entryOptions = {};
      if (options.description) entryOptions.description = options.description;
      if (options.endsAt) entryOptions.endsAt = options.endsAt;
      if (options.allDay) entryOptions.allDay = true;
      if (options.participants) {
        entryOptions.participantIds = options.participants.split(",").map((id) => parseInt(id.trim(), 10));
      }
      const entry = await createScheduleEntry(projectId, options.summary, options.startsAt, entryOptions);
      if (options.format === "json") {
        console.log(JSON.stringify(entry, null, 2));
        return;
      }
      console.log(chalk8.green("\u2713 Schedule entry created"));
      console.log(chalk8.dim(`ID: ${entry.id}`));
      console.log(chalk8.dim(`Summary: ${entry.summary}`));
      console.log(chalk8.dim(`Start: ${new Date(entry.starts_at).toLocaleString()}`));
    } catch (error) {
      console.error(chalk8.red("Failed to create schedule entry:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  schedules.command("update-entry <id>").description("Update a schedule entry").requiredOption("-p, --project <id>", "Project ID").option("-s, --summary <summary>", "New summary").option("-d, --description <description>", "New description").option("--starts-at <datetime>", "New start date/time (ISO 8601)").option("--ends-at <datetime>", "New end date/time (ISO 8601)").option("--all-day", "Mark as all-day event").option("--participants <ids>", "Comma-separated participant IDs").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk8.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk8.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const entryId = parseInt(id, 10);
      if (isNaN(entryId)) {
        console.error(chalk8.red("Invalid entry ID: must be a number"));
        process.exit(1);
      }
      const updates = {};
      if (options.summary) updates.summary = options.summary;
      if (options.description) updates.description = options.description;
      if (options.startsAt) updates.starts_at = options.startsAt;
      if (options.endsAt) updates.ends_at = options.endsAt;
      if (options.allDay) updates.all_day = true;
      if (options.participants) {
        updates.participant_ids = options.participants.split(",").map((pid) => parseInt(pid.trim(), 10));
      }
      const entry = await updateScheduleEntry(projectId, entryId, updates);
      if (options.format === "json") {
        console.log(JSON.stringify(entry, null, 2));
        return;
      }
      console.log(chalk8.green("\u2713 Schedule entry updated"));
      console.log(chalk8.dim(`ID: ${entry.id}`));
      console.log(chalk8.dim(`Summary: ${entry.summary}`));
    } catch (error) {
      console.error(chalk8.red("Failed to update schedule entry:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  schedules.command("delete-entry <id>").description("Delete a schedule entry").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk8.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk8.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const entryId = parseInt(id, 10);
      if (isNaN(entryId)) {
        console.error(chalk8.red("Invalid entry ID: must be a number"));
        process.exit(1);
      }
      await deleteScheduleEntry(projectId, entryId);
      console.log(chalk8.green(`\u2713 Schedule entry ${entryId} deleted`));
    } catch (error) {
      console.error(chalk8.red("Failed to delete schedule entry:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return schedules;
}

// src/commands/search.ts
import { Command as Command9 } from "commander";
import chalk9 from "chalk";
import Table9 from "cli-table3";
function createSearchCommand() {
  const searchCmd = new Command9("search").description("Search across all Basecamp content").argument("<query>", "Search query").option("-t, --type <type>", "Filter by content type (Todo, Message, Document, etc.)").option("-p, --project <id>", "Filter by project ID").option("-c, --creator <id>", "Filter by creator ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (query, options) => {
    if (!isAuthenticated()) {
      console.log(chalk9.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const searchOptions = {};
      if (options.type) searchOptions.type = options.type;
      if (options.project) {
        const projectId = parseInt(options.project, 10);
        if (isNaN(projectId)) {
          console.error(chalk9.red("Invalid project ID: must be a number"));
          process.exit(1);
        }
        searchOptions.bucket_id = projectId;
      }
      if (options.creator) {
        const creatorId = parseInt(options.creator, 10);
        if (isNaN(creatorId)) {
          console.error(chalk9.red("Invalid creator ID: must be a number"));
          process.exit(1);
        }
        searchOptions.creator_id = creatorId;
      }
      const results = await search(query, searchOptions);
      if (options.format === "json") {
        console.log(JSON.stringify(results, null, 2));
        return;
      }
      if (results.length === 0) {
        console.log(chalk9.yellow("No results found."));
        return;
      }
      const table = new Table9({
        head: ["ID", "Type", "Title", "Project", "Creator"],
        colWidths: [12, 15, 35, 20, 20],
        wordWrap: true
      });
      results.forEach((result) => {
        table.push([
          result.id,
          result.type,
          result.title.substring(0, 32) + (result.title.length > 32 ? "..." : ""),
          result.bucket.name.substring(0, 18) + (result.bucket.name.length > 18 ? "..." : ""),
          result.creator.name.substring(0, 18) + (result.creator.name.length > 18 ? "..." : "")
        ]);
      });
      console.log(table.toString());
      console.log(chalk9.dim(`
Total: ${results.length} results`));
    } catch (error) {
      console.error(chalk9.red("Search failed:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return searchCmd;
}

// src/commands/cardtables.ts
import { Command as Command10 } from "commander";
import chalk10 from "chalk";
import Table10 from "cli-table3";
function createCardTablesCommands() {
  const cardtables = new Command10("cardtables").description("Manage card tables (Kanban boards)");
  cardtables.command("get").description("Get card table (Kanban board) for a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const cardTable = await getCardTable(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(cardTable, null, 2));
        return;
      }
      console.log(chalk10.bold(cardTable.title));
      console.log(chalk10.dim(`ID: ${cardTable.id}`));
      console.log(chalk10.dim(`Status: ${cardTable.status}`));
      console.log(chalk10.dim(`Created: ${new Date(cardTable.created_at).toLocaleDateString()}`));
      console.log(chalk10.dim(`URL: ${cardTable.app_url}`));
      if (cardTable.lists && cardTable.lists.length > 0) {
        console.log(chalk10.bold("\nColumns:"));
        const table = new Table10({
          head: ["ID", "Title", "Type", "Cards", "Color"],
          colWidths: [12, 25, 20, 10, 12],
          wordWrap: true
        });
        cardTable.lists.forEach((column) => {
          table.push([
            column.id,
            column.title,
            column.type.replace("Kanban::", ""),
            column.cards_count,
            column.color || "-"
          ]);
        });
        console.log(table.toString());
      }
    } catch (error) {
      console.error(chalk10.red("Failed to get card table:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("columns").description("List columns in a card table").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const cardTable = await getCardTable(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(cardTable.lists, null, 2));
        return;
      }
      if (!cardTable.lists || cardTable.lists.length === 0) {
        console.log(chalk10.yellow("No columns found."));
        return;
      }
      const table = new Table10({
        head: ["ID", "Title", "Type", "Cards", "Color", "Position"],
        colWidths: [12, 25, 20, 10, 12, 10],
        wordWrap: true
      });
      cardTable.lists.forEach((column) => {
        table.push([
          column.id,
          column.title,
          column.type.replace("Kanban::", ""),
          column.cards_count,
          column.color || "-",
          column.position !== void 0 ? column.position : "-"
        ]);
      });
      console.log(table.toString());
      console.log(chalk10.dim(`
Total: ${cardTable.lists.length} columns`));
    } catch (error) {
      console.error(chalk10.red("Failed to list columns:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("create-column").description("Create a new column in a card table").requiredOption("-p, --project <id>", "Project ID").requiredOption("-t, --title <title>", "Column title").option("-d, --description <description>", "Column description").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const column = await createColumn(projectId, options.title, options.description);
      if (options.format === "json") {
        console.log(JSON.stringify(column, null, 2));
        return;
      }
      console.log(chalk10.green("\u2713 Column created"));
      console.log(chalk10.dim(`ID: ${column.id}`));
      console.log(chalk10.dim(`Title: ${column.title}`));
    } catch (error) {
      console.error(chalk10.red("Failed to create column:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("update-column <id>").description("Update a column").requiredOption("-p, --project <id>", "Project ID").option("-t, --title <title>", "New title").option("-d, --description <description>", "New description").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const columnId = parseInt(id, 10);
      if (isNaN(columnId)) {
        console.error(chalk10.red("Invalid column ID: must be a number"));
        process.exit(1);
      }
      const updates = {};
      if (options.title) updates.title = options.title;
      if (options.description) updates.description = options.description;
      const column = await updateColumn(projectId, columnId, updates);
      if (options.format === "json") {
        console.log(JSON.stringify(column, null, 2));
        return;
      }
      console.log(chalk10.green("\u2713 Column updated"));
      console.log(chalk10.dim(`ID: ${column.id}`));
      console.log(chalk10.dim(`Title: ${column.title}`));
    } catch (error) {
      console.error(chalk10.red("Failed to update column:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("delete-column <id>").description("Delete a column").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const columnId = parseInt(id, 10);
      if (isNaN(columnId)) {
        console.error(chalk10.red("Invalid column ID: must be a number"));
        process.exit(1);
      }
      await deleteColumn(projectId, columnId);
      console.log(chalk10.green(`\u2713 Column ${columnId} deleted`));
    } catch (error) {
      console.error(chalk10.red("Failed to delete column:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("cards").description("List cards in a column").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --column <id>", "Column ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const columnId = parseInt(options.column, 10);
      if (isNaN(columnId)) {
        console.error(chalk10.red("Invalid column ID: must be a number"));
        process.exit(1);
      }
      const cards = await listCards(projectId, columnId);
      if (options.format === "json") {
        console.log(JSON.stringify(cards, null, 2));
        return;
      }
      if (cards.length === 0) {
        console.log(chalk10.yellow("No cards found."));
        return;
      }
      const table = new Table10({
        head: ["ID", "Title", "Due", "Assignees", "Position"],
        colWidths: [12, 35, 12, 25, 10],
        wordWrap: true
      });
      cards.forEach((card) => {
        table.push([
          card.id,
          card.title.substring(0, 32) + (card.title.length > 32 ? "..." : ""),
          card.due_on || "-",
          card.assignees?.map((a) => a.name).join(", ") || "-",
          card.position
        ]);
      });
      console.log(table.toString());
      console.log(chalk10.dim(`
Total: ${cards.length} cards`));
    } catch (error) {
      console.error(chalk10.red("Failed to list cards:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("get-card <id>").description("Get card details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const cardId = parseInt(id, 10);
      if (isNaN(cardId)) {
        console.error(chalk10.red("Invalid card ID: must be a number"));
        process.exit(1);
      }
      const card = await getCard(projectId, cardId);
      if (options.format === "json") {
        console.log(JSON.stringify(card, null, 2));
        return;
      }
      console.log(chalk10.bold(card.title));
      console.log(chalk10.dim(`ID: ${card.id}`));
      console.log(chalk10.dim(`Status: ${card.completed ? "Completed" : "Active"}`));
      console.log(chalk10.dim(`Content: ${card.content || "-"}`));
      console.log(chalk10.dim(`Description: ${card.description || "-"}`));
      console.log(chalk10.dim(`Due: ${card.due_on || "-"}`));
      console.log(chalk10.dim(`Assignees: ${card.assignees?.map((a) => a.name).join(", ") || "-"}`));
      console.log(chalk10.dim(`Comments: ${card.comments_count}`));
      console.log(chalk10.dim(`URL: ${card.app_url}`));
    } catch (error) {
      console.error(chalk10.red("Failed to get card:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("create-card").description("Create a new card").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --column <id>", "Column ID").requiredOption("-t, --title <title>", "Card title").option("--content <content>", "Card content").option("--due <date>", "Due date (YYYY-MM-DD)").option("--assignees <ids>", "Comma-separated assignee IDs").option("--notify", "Notify assignees").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const columnId = parseInt(options.column, 10);
      if (isNaN(columnId)) {
        console.error(chalk10.red("Invalid column ID: must be a number"));
        process.exit(1);
      }
      const cardOptions = {};
      if (options.content) cardOptions.content = options.content;
      if (options.due) cardOptions.due_on = options.due;
      if (options.assignees) {
        cardOptions.assignee_ids = options.assignees.split(",").map((id) => parseInt(id.trim(), 10));
      }
      if (options.notify) cardOptions.notify = true;
      const card = await createCard(projectId, columnId, options.title, cardOptions);
      if (options.format === "json") {
        console.log(JSON.stringify(card, null, 2));
        return;
      }
      console.log(chalk10.green("\u2713 Card created"));
      console.log(chalk10.dim(`ID: ${card.id}`));
      console.log(chalk10.dim(`Title: ${card.title}`));
    } catch (error) {
      console.error(chalk10.red("Failed to create card:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("update-card <id>").description("Update a card").requiredOption("-p, --project <id>", "Project ID").option("-t, --title <title>", "New title").option("--content <content>", "New content").option("--due <date>", "Due date (YYYY-MM-DD)").option("--assignees <ids>", "Comma-separated assignee IDs").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const cardId = parseInt(id, 10);
      if (isNaN(cardId)) {
        console.error(chalk10.red("Invalid card ID: must be a number"));
        process.exit(1);
      }
      const updates = {};
      if (options.title) updates.title = options.title;
      if (options.content) updates.content = options.content;
      if (options.due) updates.due_on = options.due;
      if (options.assignees) {
        updates.assignee_ids = options.assignees.split(",").map((id2) => parseInt(id2.trim(), 10));
      }
      const card = await updateCard(projectId, cardId, updates);
      if (options.format === "json") {
        console.log(JSON.stringify(card, null, 2));
        return;
      }
      console.log(chalk10.green("\u2713 Card updated"));
      console.log(chalk10.dim(`ID: ${card.id}`));
      console.log(chalk10.dim(`Title: ${card.title}`));
    } catch (error) {
      console.error(chalk10.red("Failed to update card:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("move-card <id>").description("Move a card to a different column").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --column <id>", "Target column ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const cardId = parseInt(id, 10);
      if (isNaN(cardId)) {
        console.error(chalk10.red("Invalid card ID: must be a number"));
        process.exit(1);
      }
      const columnId = parseInt(options.column, 10);
      if (isNaN(columnId)) {
        console.error(chalk10.red("Invalid column ID: must be a number"));
        process.exit(1);
      }
      await moveCard(projectId, cardId, columnId);
      console.log(chalk10.green(`\u2713 Card ${cardId} moved to column ${columnId}`));
    } catch (error) {
      console.error(chalk10.red("Failed to move card:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  cardtables.command("delete-card <id>").description("Delete a card").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk10.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk10.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const cardId = parseInt(id, 10);
      if (isNaN(cardId)) {
        console.error(chalk10.red("Invalid card ID: must be a number"));
        process.exit(1);
      }
      await deleteCard(projectId, cardId);
      console.log(chalk10.green(`\u2713 Card ${cardId} deleted`));
    } catch (error) {
      console.error(chalk10.red("Failed to delete card:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return cardtables;
}

// src/commands/vaults.ts
import { Command as Command11 } from "commander";
import chalk11 from "chalk";
import Table11 from "cli-table3";
function createVaultsCommands() {
  const vaults = new Command11("vaults").description("Manage vaults (file folders)");
  vaults.command("list").description("List vaults in a project").requiredOption("-p, --project <id>", "Project ID").option("-V, --vault <id>", "Parent vault ID (optional, defaults to primary vault)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk11.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk11.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const vaultId = options.vault ? parseInt(options.vault, 10) : void 0;
      if (options.vault && isNaN(vaultId)) {
        console.error(chalk11.red("Invalid vault ID: must be a number"));
        process.exit(1);
      }
      const vaultsList = await listVaults(projectId, vaultId);
      if (options.format === "json") {
        console.log(JSON.stringify(vaultsList, null, 2));
        return;
      }
      if (vaultsList.length === 0) {
        console.log(chalk11.yellow("No vaults found."));
        return;
      }
      const table = new Table11({
        head: ["ID", "Title", "Documents", "Uploads", "Vaults", "Position"],
        colWidths: [12, 30, 12, 12, 12, 10],
        wordWrap: true
      });
      vaultsList.forEach((vault) => {
        table.push([
          vault.id,
          vault.title,
          vault.documents_count,
          vault.uploads_count,
          vault.vaults_count,
          vault.position
        ]);
      });
      console.log(table.toString());
      console.log(chalk11.dim(`
Total: ${vaultsList.length} vaults`));
    } catch (error) {
      console.error(chalk11.red("Failed to list vaults:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  vaults.command("get <id>").description("Get vault details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk11.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk11.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const vaultId = parseInt(id, 10);
      if (isNaN(vaultId)) {
        console.error(chalk11.red("Invalid vault ID: must be a number"));
        process.exit(1);
      }
      const vault = await getVault(projectId, vaultId);
      if (options.format === "json") {
        console.log(JSON.stringify(vault, null, 2));
        return;
      }
      console.log(chalk11.bold(vault.title));
      console.log(chalk11.dim(`ID: ${vault.id}`));
      console.log(chalk11.dim(`Status: ${vault.status}`));
      console.log(chalk11.dim(`Position: ${vault.position}`));
      console.log(chalk11.dim(`Documents: ${vault.documents_count}`));
      console.log(chalk11.dim(`Uploads: ${vault.uploads_count}`));
      console.log(chalk11.dim(`Child Vaults: ${vault.vaults_count}`));
      console.log(chalk11.dim(`Created: ${vault.created_at}`));
      console.log(chalk11.dim(`Updated: ${vault.updated_at}`));
      console.log(chalk11.dim(`URL: ${vault.app_url}`));
    } catch (error) {
      console.error(chalk11.red("Failed to get vault:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  vaults.command("create").description("Create a vault (folder)").requiredOption("-p, --project <id>", "Project ID").requiredOption("-V, --vault <id>", "Parent vault ID").requiredOption("-t, --title <title>", "Vault title").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk11.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk11.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const vaultId = parseInt(options.vault, 10);
      if (isNaN(vaultId)) {
        console.error(chalk11.red("Invalid vault ID: must be a number"));
        process.exit(1);
      }
      const vault = await createVault(projectId, vaultId, options.title);
      if (options.format === "json") {
        console.log(JSON.stringify(vault, null, 2));
        return;
      }
      console.log(chalk11.green("\u2713 Vault created"));
      console.log(chalk11.dim(`ID: ${vault.id}`));
      console.log(chalk11.dim(`Title: ${vault.title}`));
    } catch (error) {
      console.error(chalk11.red("Failed to create vault:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  vaults.command("update <id>").description("Update a vault").requiredOption("-p, --project <id>", "Project ID").requiredOption("-t, --title <title>", "New vault title").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk11.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk11.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const vaultId = parseInt(id, 10);
      if (isNaN(vaultId)) {
        console.error(chalk11.red("Invalid vault ID: must be a number"));
        process.exit(1);
      }
      const vault = await updateVault(projectId, vaultId, options.title);
      if (options.format === "json") {
        console.log(JSON.stringify(vault, null, 2));
        return;
      }
      console.log(chalk11.green("\u2713 Vault updated"));
      console.log(chalk11.dim(`ID: ${vault.id}`));
      console.log(chalk11.dim(`Title: ${vault.title}`));
    } catch (error) {
      console.error(chalk11.red("Failed to update vault:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return vaults;
}

// src/commands/documents.ts
import { Command as Command12 } from "commander";
import chalk12 from "chalk";
import Table12 from "cli-table3";
function createDocumentsCommands() {
  const documents = new Command12("documents").description("Manage documents (text files)");
  documents.command("list").description("List documents in a vault").requiredOption("-p, --project <id>", "Project ID").requiredOption("-v, --vault <id>", "Vault ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk12.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk12.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const vaultId = parseInt(options.vault, 10);
      if (isNaN(vaultId)) {
        console.error(chalk12.red("Invalid vault ID: must be a number"));
        process.exit(1);
      }
      const documentsList = await listDocuments(projectId, vaultId);
      if (options.format === "json") {
        console.log(JSON.stringify(documentsList, null, 2));
        return;
      }
      if (documentsList.length === 0) {
        console.log(chalk12.yellow("No documents found."));
        return;
      }
      const table = new Table12({
        head: ["ID", "Title", "Comments", "Position", "Created"],
        colWidths: [12, 35, 10, 10, 20],
        wordWrap: true
      });
      documentsList.forEach((doc) => {
        table.push([
          doc.id,
          doc.title.substring(0, 32) + (doc.title.length > 32 ? "..." : ""),
          doc.comments_count,
          doc.position,
          new Date(doc.created_at).toLocaleDateString()
        ]);
      });
      console.log(table.toString());
      console.log(chalk12.dim(`
Total: ${documentsList.length} documents`));
    } catch (error) {
      console.error(chalk12.red("Failed to list documents:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  documents.command("get <id>").description("Get document details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk12.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk12.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const documentId = parseInt(id, 10);
      if (isNaN(documentId)) {
        console.error(chalk12.red("Invalid document ID: must be a number"));
        process.exit(1);
      }
      const document = await getDocument(projectId, documentId);
      if (options.format === "json") {
        console.log(JSON.stringify(document, null, 2));
        return;
      }
      console.log(chalk12.bold(document.title));
      console.log(chalk12.dim(`ID: ${document.id}`));
      console.log(chalk12.dim(`Status: ${document.status}`));
      console.log(chalk12.dim(`Position: ${document.position}`));
      console.log(chalk12.dim(`Comments: ${document.comments_count}`));
      console.log(chalk12.dim(`Created: ${document.created_at}`));
      console.log(chalk12.dim(`Updated: ${document.updated_at}`));
      console.log(chalk12.dim(`URL: ${document.app_url}`));
      console.log("\n" + chalk12.bold("Content:"));
      console.log(document.content);
    } catch (error) {
      console.error(chalk12.red("Failed to get document:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  documents.command("create").description("Create a document").requiredOption("-p, --project <id>", "Project ID").requiredOption("-v, --vault <id>", "Vault ID").requiredOption("-t, --title <title>", "Document title").requiredOption("-c, --content <content>", "Document content (HTML)").option("-s, --status <status>", "Status (active|draft)", "active").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk12.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk12.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const vaultId = parseInt(options.vault, 10);
      if (isNaN(vaultId)) {
        console.error(chalk12.red("Invalid vault ID: must be a number"));
        process.exit(1);
      }
      const document = await createDocument(
        projectId,
        vaultId,
        options.title,
        options.content,
        options.status
      );
      if (options.format === "json") {
        console.log(JSON.stringify(document, null, 2));
        return;
      }
      console.log(chalk12.green("\u2713 Document created"));
      console.log(chalk12.dim(`ID: ${document.id}`));
      console.log(chalk12.dim(`Title: ${document.title}`));
    } catch (error) {
      console.error(chalk12.red("Failed to create document:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  documents.command("update <id>").description("Update a document").requiredOption("-p, --project <id>", "Project ID").option("-t, --title <title>", "New document title").option("-c, --content <content>", "New document content (HTML)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk12.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk12.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const documentId = parseInt(id, 10);
      if (isNaN(documentId)) {
        console.error(chalk12.red("Invalid document ID: must be a number"));
        process.exit(1);
      }
      const updates = {};
      if (options.title) updates.title = options.title;
      if (options.content) updates.content = options.content;
      if (Object.keys(updates).length === 0) {
        console.error(chalk12.red("No updates provided. Use --title or --content"));
        process.exit(1);
      }
      const document = await updateDocument(projectId, documentId, updates);
      if (options.format === "json") {
        console.log(JSON.stringify(document, null, 2));
        return;
      }
      console.log(chalk12.green("\u2713 Document updated"));
      console.log(chalk12.dim(`ID: ${document.id}`));
      console.log(chalk12.dim(`Title: ${document.title}`));
    } catch (error) {
      console.error(chalk12.red("Failed to update document:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return documents;
}

// src/commands/uploads.ts
import { Command as Command13 } from "commander";
import chalk13 from "chalk";
import Table13 from "cli-table3";
function createUploadsCommands() {
  const uploads = new Command13("uploads").description("Manage uploads (binary files)");
  uploads.command("list").description("List uploads in a vault").requiredOption("-p, --project <id>", "Project ID").requiredOption("-v, --vault <id>", "Vault ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk13.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk13.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const vaultId = parseInt(options.vault, 10);
      if (isNaN(vaultId)) {
        console.error(chalk13.red("Invalid vault ID: must be a number"));
        process.exit(1);
      }
      const uploadsList = await listUploads(projectId, vaultId);
      if (options.format === "json") {
        console.log(JSON.stringify(uploadsList, null, 2));
        return;
      }
      if (uploadsList.length === 0) {
        console.log(chalk13.yellow("No uploads found."));
        return;
      }
      const table = new Table13({
        head: ["ID", "Filename", "Type", "Size", "Comments", "Created"],
        colWidths: [12, 30, 15, 12, 10, 20],
        wordWrap: true
      });
      uploadsList.forEach((upload) => {
        const sizeKB = (upload.byte_size / 1024).toFixed(2);
        table.push([
          upload.id,
          upload.filename.substring(0, 27) + (upload.filename.length > 27 ? "..." : ""),
          upload.content_type,
          `${sizeKB} KB`,
          upload.comments_count,
          new Date(upload.created_at).toLocaleDateString()
        ]);
      });
      console.log(table.toString());
      console.log(chalk13.dim(`
Total: ${uploadsList.length} uploads`));
    } catch (error) {
      console.error(chalk13.red("Failed to list uploads:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  uploads.command("get <id>").description("Get upload details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk13.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk13.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const uploadId = parseInt(id, 10);
      if (isNaN(uploadId)) {
        console.error(chalk13.red("Invalid upload ID: must be a number"));
        process.exit(1);
      }
      const upload = await getUpload(projectId, uploadId);
      if (options.format === "json") {
        console.log(JSON.stringify(upload, null, 2));
        return;
      }
      console.log(chalk13.bold(upload.title));
      console.log(chalk13.dim(`ID: ${upload.id}`));
      console.log(chalk13.dim(`Filename: ${upload.filename}`));
      console.log(chalk13.dim(`Content Type: ${upload.content_type}`));
      console.log(chalk13.dim(`Size: ${(upload.byte_size / 1024).toFixed(2)} KB`));
      if (upload.width && upload.height) {
        console.log(chalk13.dim(`Dimensions: ${upload.width}x${upload.height}`));
      }
      console.log(chalk13.dim(`Status: ${upload.status}`));
      console.log(chalk13.dim(`Position: ${upload.position}`));
      console.log(chalk13.dim(`Comments: ${upload.comments_count}`));
      console.log(chalk13.dim(`Created: ${upload.created_at}`));
      console.log(chalk13.dim(`Updated: ${upload.updated_at}`));
      console.log(chalk13.dim(`Download URL: ${upload.download_url}`));
      console.log(chalk13.dim(`App URL: ${upload.app_url}`));
      if (upload.description) {
        console.log("\n" + chalk13.bold("Description:"));
        console.log(upload.description);
      }
    } catch (error) {
      console.error(chalk13.red("Failed to get upload:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  uploads.command("create").description("Create an upload (requires attachable_sgid from attachment API)").requiredOption("-p, --project <id>", "Project ID").requiredOption("-v, --vault <id>", "Vault ID").requiredOption("-a, --attachable-sgid <sgid>", "Attachable SGID from attachment upload").option("-d, --description <description>", "Upload description (HTML)").option("-n, --name <name>", "Base name (filename without extension)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk13.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk13.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const vaultId = parseInt(options.vault, 10);
      if (isNaN(vaultId)) {
        console.error(chalk13.red("Invalid vault ID: must be a number"));
        process.exit(1);
      }
      const uploadOptions = {};
      if (options.description) uploadOptions.description = options.description;
      if (options.name) uploadOptions.base_name = options.name;
      const upload = await createUpload(
        projectId,
        vaultId,
        options.attachableSgid,
        uploadOptions
      );
      if (options.format === "json") {
        console.log(JSON.stringify(upload, null, 2));
        return;
      }
      console.log(chalk13.green("\u2713 Upload created"));
      console.log(chalk13.dim(`ID: ${upload.id}`));
      console.log(chalk13.dim(`Filename: ${upload.filename}`));
    } catch (error) {
      console.error(chalk13.red("Failed to create upload:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  uploads.command("update <id>").description("Update an upload").requiredOption("-p, --project <id>", "Project ID").option("-d, --description <description>", "New upload description (HTML)").option("-n, --name <name>", "New base name (filename without extension)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk13.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk13.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const uploadId = parseInt(id, 10);
      if (isNaN(uploadId)) {
        console.error(chalk13.red("Invalid upload ID: must be a number"));
        process.exit(1);
      }
      const updates = {};
      if (options.description) updates.description = options.description;
      if (options.name) updates.base_name = options.name;
      if (Object.keys(updates).length === 0) {
        console.error(chalk13.red("No updates provided. Use --description or --name"));
        process.exit(1);
      }
      const upload = await updateUpload(projectId, uploadId, updates);
      if (options.format === "json") {
        console.log(JSON.stringify(upload, null, 2));
        return;
      }
      console.log(chalk13.green("\u2713 Upload updated"));
      console.log(chalk13.dim(`ID: ${upload.id}`));
      console.log(chalk13.dim(`Filename: ${upload.filename}`));
    } catch (error) {
      console.error(chalk13.red("Failed to update upload:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return uploads;
}

// src/commands/webhooks.ts
import { Command as Command14 } from "commander";
import chalk14 from "chalk";
import Table14 from "cli-table3";
function createWebhooksCommands() {
  const webhooks = new Command14("webhooks").description("Manage webhooks for project notifications");
  webhooks.command("list").description("List webhooks in a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk14.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk14.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const webhookList = await listWebhooks(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(webhookList, null, 2));
        return;
      }
      if (webhookList.length === 0) {
        console.log(chalk14.yellow("No webhooks found."));
        return;
      }
      const table = new Table14({
        head: ["ID", "Status", "Payload URL", "Types"],
        colWidths: [15, 10, 40, 30],
        wordWrap: true
      });
      webhookList.forEach((webhook) => {
        table.push([
          webhook.id,
          webhook.active ? chalk14.green("\u2713 Active") : chalk14.dim("\u25CB Inactive"),
          webhook.payload_url.substring(0, 37) + (webhook.payload_url.length > 37 ? "..." : ""),
          webhook.types.join(", ").substring(0, 27) + (webhook.types.join(", ").length > 27 ? "..." : "")
        ]);
      });
      console.log(table.toString());
      console.log(chalk14.dim(`
Total: ${webhookList.length} webhooks`));
    } catch (error) {
      console.error(chalk14.red("Failed to list webhooks:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  webhooks.command("get <id>").description("Get webhook details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk14.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk14.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const webhookId = parseInt(id, 10);
      if (isNaN(webhookId)) {
        console.error(chalk14.red("Invalid webhook ID: must be a number"));
        process.exit(1);
      }
      const webhook = await getWebhook(projectId, webhookId);
      if (options.format === "json") {
        console.log(JSON.stringify(webhook, null, 2));
        return;
      }
      console.log(chalk14.bold(`Webhook ${webhook.id}`));
      console.log(chalk14.dim(`Status: ${webhook.active ? "Active" : "Inactive"}`));
      console.log(chalk14.dim(`Payload URL: ${webhook.payload_url}`));
      console.log(chalk14.dim(`Types: ${webhook.types.join(", ")}`));
      console.log(chalk14.dim(`Created: ${webhook.created_at}`));
      console.log(chalk14.dim(`Updated: ${webhook.updated_at}`));
      console.log(chalk14.dim(`URL: ${webhook.url}`));
      console.log(chalk14.dim(`App URL: ${webhook.app_url}`));
      if (webhook.recent_deliveries && webhook.recent_deliveries.length > 0) {
        console.log(chalk14.bold("\nRecent Deliveries:"));
        webhook.recent_deliveries.slice(0, 5).forEach((delivery, index) => {
          console.log(chalk14.dim(`  ${index + 1}. ${delivery.created_at} - Response: ${delivery.response.code} ${delivery.response.message}`));
        });
      }
    } catch (error) {
      console.error(chalk14.red("Failed to get webhook:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  webhooks.command("create").description("Create a webhook").requiredOption("-p, --project <id>", "Project ID").requiredOption("--payload-url <url>", "Webhook payload URL (must be HTTPS)").option("--types <types>", "Comma-separated event types (default: all)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk14.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk14.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      if (!options.payloadUrl.startsWith("https://")) {
        console.error(chalk14.red("Payload URL must be HTTPS"));
        process.exit(1);
      }
      const types = options.types ? options.types.split(",").map((t) => t.trim()) : void 0;
      const webhook = await createWebhook(projectId, options.payloadUrl, types);
      if (options.format === "json") {
        console.log(JSON.stringify(webhook, null, 2));
        return;
      }
      console.log(chalk14.green("\u2713 Webhook created"));
      console.log(chalk14.dim(`ID: ${webhook.id}`));
      console.log(chalk14.dim(`Payload URL: ${webhook.payload_url}`));
      console.log(chalk14.dim(`Types: ${webhook.types.join(", ")}`));
    } catch (error) {
      console.error(chalk14.red("Failed to create webhook:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  webhooks.command("update <id>").description("Update a webhook").requiredOption("-p, --project <id>", "Project ID").option("--payload-url <url>", "New webhook payload URL (must be HTTPS)").option("--types <types>", "Comma-separated event types").option("--active <active>", "Activate/deactivate webhook (true|false)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk14.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk14.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const webhookId = parseInt(id, 10);
      if (isNaN(webhookId)) {
        console.error(chalk14.red("Invalid webhook ID: must be a number"));
        process.exit(1);
      }
      const updates = {};
      if (options.payloadUrl) {
        if (!options.payloadUrl.startsWith("https://")) {
          console.error(chalk14.red("Payload URL must be HTTPS"));
          process.exit(1);
        }
        updates.payload_url = options.payloadUrl;
      }
      if (options.types) {
        updates.types = options.types.split(",").map((t) => t.trim());
      }
      if (options.active !== void 0) {
        updates.active = options.active === "true";
      }
      const webhook = await updateWebhook(projectId, webhookId, updates);
      if (options.format === "json") {
        console.log(JSON.stringify(webhook, null, 2));
        return;
      }
      console.log(chalk14.green("\u2713 Webhook updated"));
      console.log(chalk14.dim(`ID: ${webhook.id}`));
      console.log(chalk14.dim(`Status: ${webhook.active ? "Active" : "Inactive"}`));
      console.log(chalk14.dim(`Payload URL: ${webhook.payload_url}`));
      console.log(chalk14.dim(`Types: ${webhook.types.join(", ")}`));
    } catch (error) {
      console.error(chalk14.red("Failed to update webhook:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  webhooks.command("delete <id>").description("Delete a webhook").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk14.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk14.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const webhookId = parseInt(id, 10);
      if (isNaN(webhookId)) {
        console.error(chalk14.red("Invalid webhook ID: must be a number"));
        process.exit(1);
      }
      await deleteWebhook(projectId, webhookId);
      console.log(chalk14.green(`\u2713 Webhook ${webhookId} deleted`));
    } catch (error) {
      console.error(chalk14.red("Failed to delete webhook:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  webhooks.command("test <id>").description("Send a test payload to a webhook").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk14.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk14.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const webhookId = parseInt(id, 10);
      if (isNaN(webhookId)) {
        console.error(chalk14.red("Invalid webhook ID: must be a number"));
        process.exit(1);
      }
      await testWebhook(projectId, webhookId);
      console.log(chalk14.green(`\u2713 Test payload sent to webhook ${webhookId}`));
    } catch (error) {
      console.error(chalk14.red("Failed to test webhook:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return webhooks;
}

// src/commands/recordings.ts
import { Command as Command15 } from "commander";
import chalk15 from "chalk";
import Table15 from "cli-table3";
function createRecordingsCommands() {
  const recordings = new Command15("recordings").description("Manage recordings (cross-project content)");
  recordings.command("list").description("List recordings by type across projects").requiredOption("-t, --type <type>", "Recording type (Todo, Message, Document, Upload, Comment, etc.)").option("-b, --bucket <ids>", "Comma-separated project IDs (default: all)").option("-s, --status <status>", "Status filter (active|archived|trashed)", "active").option("--sort <field>", "Sort by (created_at|updated_at)", "created_at").option("--direction <dir>", "Sort direction (asc|desc)", "desc").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk15.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const bucketIds = options.bucket ? options.bucket.split(",").map((id) => parseInt(id.trim(), 10)) : void 0;
      const recordings2 = await listRecordings(options.type, {
        bucket: bucketIds,
        status: options.status,
        sort: options.sort,
        direction: options.direction
      });
      if (options.format === "json") {
        console.log(JSON.stringify(recordings2, null, 2));
        return;
      }
      if (recordings2.length === 0) {
        console.log(chalk15.yellow(`No ${options.type} recordings found.`));
        return;
      }
      const table = new Table15({
        head: ["ID", "Type", "Title", "Project", "Created", "Status"],
        colWidths: [12, 15, 30, 15, 12, 10],
        wordWrap: true
      });
      recordings2.forEach((rec) => {
        table.push([
          rec.id,
          rec.type,
          rec.title?.substring(0, 28) + (rec.title?.length > 28 ? "..." : "") || "-",
          rec.bucket?.name || "-",
          rec.created_at?.substring(0, 10) || "-",
          rec.status || "-"
        ]);
      });
      console.log(table.toString());
      console.log(chalk15.dim(`
Total: ${recordings2.length} recordings`));
    } catch (error) {
      console.error(chalk15.red("Failed to list recordings:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  recordings.command("archive <id>").description("Archive a recording").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk15.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk15.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(id, 10);
      if (isNaN(recordingId)) {
        console.error(chalk15.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      await archiveRecording(projectId, recordingId);
      console.log(chalk15.green(`\u2713 Recording ${recordingId} archived`));
    } catch (error) {
      console.error(chalk15.red("Failed to archive recording:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  recordings.command("unarchive <id>").description("Unarchive a recording").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk15.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk15.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(id, 10);
      if (isNaN(recordingId)) {
        console.error(chalk15.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      await unarchiveRecording(projectId, recordingId);
      console.log(chalk15.green(`\u2713 Recording ${recordingId} unarchived`));
    } catch (error) {
      console.error(chalk15.red("Failed to unarchive recording:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  recordings.command("trash <id>").description("Move a recording to trash").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk15.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk15.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(id, 10);
      if (isNaN(recordingId)) {
        console.error(chalk15.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      await trashRecording(projectId, recordingId);
      console.log(chalk15.green(`\u2713 Recording ${recordingId} moved to trash`));
    } catch (error) {
      console.error(chalk15.red("Failed to trash recording:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return recordings;
}

// src/commands/events.ts
import { Command as Command16 } from "commander";
import chalk16 from "chalk";
import Table16 from "cli-table3";
function createEventsCommands() {
  const events = new Command16("events").description("View activity feed and events");
  events.command("list").description("List events for a recording").requiredOption("-p, --project <id>", "Project ID").requiredOption("-r, --recording <id>", "Recording ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk16.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk16.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(options.recording, 10);
      if (isNaN(recordingId)) {
        console.error(chalk16.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      const eventList = await listEvents(projectId, recordingId);
      if (options.format === "json") {
        console.log(JSON.stringify(eventList, null, 2));
        return;
      }
      if (eventList.length === 0) {
        console.log(chalk16.yellow("No events found."));
        return;
      }
      const table = new Table16({
        head: ["ID", "Action", "Creator", "Created At"],
        colWidths: [12, 20, 25, 20],
        wordWrap: true
      });
      eventList.forEach((event) => {
        table.push([
          event.id,
          event.action,
          event.creator?.name || "-",
          event.created_at?.substring(0, 19) || "-"
        ]);
      });
      console.log(table.toString());
      console.log(chalk16.dim(`
Total: ${eventList.length} events`));
    } catch (error) {
      console.error(chalk16.red("Failed to list events:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return events;
}

// src/commands/subscriptions.ts
import { Command as Command17 } from "commander";
import chalk17 from "chalk";
import Table17 from "cli-table3";
function createSubscriptionsCommands() {
  const subscriptions = new Command17("subscriptions").description("Manage subscriptions to recordings");
  subscriptions.command("list").description("List subscribers for a recording").requiredOption("-p, --project <id>", "Project ID").requiredOption("-r, --recording <id>", "Recording ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk17.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk17.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(options.recording, 10);
      if (isNaN(recordingId)) {
        console.error(chalk17.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      const subs = await getSubscriptions(projectId, recordingId);
      if (options.format === "json") {
        console.log(JSON.stringify(subs, null, 2));
        return;
      }
      if (subs.subscribers.length === 0) {
        console.log(chalk17.yellow("No subscribers found."));
        return;
      }
      const table = new Table17({
        head: ["ID", "Name", "Email", "Title"],
        colWidths: [12, 25, 30, 25],
        wordWrap: true
      });
      subs.subscribers.forEach((subscriber) => {
        table.push([
          subscriber.id,
          subscriber.name,
          subscriber.email_address,
          subscriber.title || "-"
        ]);
      });
      console.log(table.toString());
      console.log(chalk17.dim(`
Total: ${subs.subscribers.length} subscribers`));
      console.log(chalk17.dim(`You are ${subs.subscribed ? "subscribed" : "not subscribed"}`));
    } catch (error) {
      console.error(chalk17.red("Failed to list subscriptions:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  subscriptions.command("subscribe").description("Subscribe to a recording").requiredOption("-p, --project <id>", "Project ID").requiredOption("-r, --recording <id>", "Recording ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk17.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk17.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(options.recording, 10);
      if (isNaN(recordingId)) {
        console.error(chalk17.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      const subs = await subscribe(projectId, recordingId);
      if (options.format === "json") {
        console.log(JSON.stringify(subs, null, 2));
        return;
      }
      console.log(chalk17.green("\u2713 Subscribed to recording"));
      console.log(chalk17.dim(`Total subscribers: ${subs.count}`));
    } catch (error) {
      console.error(chalk17.red("Failed to subscribe:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  subscriptions.command("unsubscribe").description("Unsubscribe from a recording").requiredOption("-p, --project <id>", "Project ID").requiredOption("-r, --recording <id>", "Recording ID").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk17.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk17.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(options.recording, 10);
      if (isNaN(recordingId)) {
        console.error(chalk17.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      await unsubscribe(projectId, recordingId);
      console.log(chalk17.green("\u2713 Unsubscribed from recording"));
    } catch (error) {
      console.error(chalk17.red("Failed to unsubscribe:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return subscriptions;
}

// src/index.ts
var program = new Command18();
program.name("basecamp").description("CLI for managing Basecamp 4 projects, to-dos, messages, and more").version("2.0.0").option("-v, --verbose", "Enable verbose output for debugging");
program.addCommand(createAuthCommands());
program.addCommand(createAccountsCommand());
program.addCommand(createAccountCommand());
program.addCommand(createProjectsCommands());
program.addCommand(createTodoListsCommands());
program.addCommand(createTodosCommands());
program.addCommand(createTodoGroupsCommands());
program.addCommand(createMessagesCommands());
program.addCommand(createCampfiresCommands());
program.addCommand(createPeopleCommands());
program.addCommand(createCommentsCommands());
program.addCommand(createSchedulesCommands());
program.addCommand(createSearchCommand());
program.addCommand(createCardTablesCommands());
program.addCommand(createVaultsCommands());
program.addCommand(createDocumentsCommands());
program.addCommand(createUploadsCommands());
program.addCommand(createWebhooksCommands());
program.addCommand(createRecordingsCommands());
program.addCommand(createEventsCommands());
program.addCommand(createSubscriptionsCommands());
program.parse();
