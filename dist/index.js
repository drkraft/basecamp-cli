#!/usr/bin/env node

// src/index.ts
import { Command as Command9 } from "commander";

// src/commands/auth.ts
import { Command } from "commander";
import chalk2 from "chalk";
import Table from "cli-table3";

// src/lib/auth.ts
import crypto2 from "crypto";
import http from "http";
import { URL } from "url";
import open from "open";
import got from "got";
import chalk from "chalk";

// src/lib/config.ts
import Conf from "conf";
import crypto from "crypto";
import os from "os";
function getEncryptionKey() {
  const machineId = `${os.hostname()}-${os.userInfo().username}-basecamp-cli-tokens`;
  return crypto.createHash("sha256").update(machineId).digest();
}
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
function decrypt(text) {
  try {
    const [ivHex, encrypted] = text.split(":");
    if (!ivHex || !encrypted) {
      throw new Error("Invalid encrypted format");
    }
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getEncryptionKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return text;
  }
}
function isEncrypted(text) {
  if (!text) return false;
  const parts = text.split(":");
  return parts.length === 2 && parts[0].length === 32 && /^[0-9a-f]+$/i.test(parts[0]);
}
var config = new Conf({
  projectName: "basecamp-cli",
  schema: {
    tokens: {
      type: "object",
      properties: {
        access_token: { type: "string" },
        refresh_token: { type: "string" },
        expires_at: { type: "number" }
      }
    },
    currentAccountId: { type: "number" },
    clientId: { type: "string" },
    redirectUri: { type: "string" }
    // Note: clientSecret is intentionally NOT stored in config for security.
    // It must be provided via BASECAMP_CLIENT_SECRET environment variable.
  }
});
function getTokens() {
  const storedTokens = config.get("tokens");
  if (!storedTokens) return void 0;
  if (!storedTokens.access_token || !storedTokens.refresh_token) {
    return void 0;
  }
  const access_token = isEncrypted(storedTokens.access_token) ? decrypt(storedTokens.access_token) : storedTokens.access_token;
  const refresh_token = isEncrypted(storedTokens.refresh_token) ? decrypt(storedTokens.refresh_token) : storedTokens.refresh_token;
  return {
    access_token,
    refresh_token,
    expires_at: storedTokens.expires_at
  };
}
function setTokens(tokens) {
  const encryptedTokens = {
    access_token: tokens.access_token ? encrypt(tokens.access_token) : void 0,
    refresh_token: tokens.refresh_token ? encrypt(tokens.refresh_token) : void 0,
    expires_at: tokens.expires_at
  };
  config.set("tokens", encryptedTokens);
}
function clearTokens() {
  config.delete("tokens");
}
function getCurrentAccountId() {
  return config.get("currentAccountId");
}
function setCurrentAccountId(accountId) {
  config.set("currentAccountId", accountId);
}
function getClientCredentials() {
  const clientSecret = process.env.BASECAMP_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error(
      'BASECAMP_CLIENT_SECRET environment variable is not set.\n\nFor security, the client secret must be provided via environment variable.\nSet it using:\n  export BASECAMP_CLIENT_SECRET="your-client-secret"\n\nOr add it to your shell profile (~/.bashrc, ~/.zshrc, etc.)'
    );
  }
  return {
    clientId: config.get("clientId") || process.env.BASECAMP_CLIENT_ID,
    clientSecret,
    redirectUri: config.get("redirectUri") || process.env.BASECAMP_REDIRECT_URI || "http://localhost:9292/callback"
  };
}
function setClientConfig(clientId, redirectUri) {
  config.set("clientId", clientId);
  if (redirectUri) {
    config.set("redirectUri", redirectUri);
  }
}
function isAuthenticated() {
  const tokens = getTokens();
  return !!tokens?.access_token;
}
function isTokenExpired() {
  const tokens = getTokens();
  if (!tokens?.expires_at) return true;
  return Date.now() >= tokens.expires_at - 6e4;
}

// src/lib/auth.ts
var OAUTH_BASE = "https://launchpad.37signals.com";
var pendingOAuthState = null;
function generateRandomString(length) {
  return crypto2.randomBytes(length).toString("base64url");
}
function generateCodeVerifier() {
  return generateRandomString(32);
}
function generateCodeChallenge(verifier) {
  return crypto2.createHash("sha256").update(verifier).digest("base64url");
}
function generateState() {
  return generateRandomString(32);
}
async function startOAuthFlow() {
  const { clientId, clientSecret, redirectUri } = getClientCredentials();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing OAuth credentials. Please set BASECAMP_CLIENT_ID and BASECAMP_CLIENT_SECRET environment variables,\nor run: basecamp auth configure --client-id <id> --client-secret <secret>"
    );
  }
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();
  pendingOAuthState = {
    state,
    codeVerifier
  };
  const parsedUri = new URL(redirectUri);
  const port = parseInt(parsedUri.port) || 9292;
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      if (url.pathname === "/callback") {
        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<html><body><h1>Authentication Failed</h1><p>You can close this window.</p></body></html>");
          server.close();
          pendingOAuthState = null;
          reject(new Error(`OAuth error: ${error}`));
          return;
        }
        if (!returnedState || !pendingOAuthState || returnedState !== pendingOAuthState.state) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<html><body><h1>Authentication Failed</h1><p>Invalid state parameter. Possible CSRF attack.</p></body></html>");
          server.close();
          pendingOAuthState = null;
          reject(new Error("OAuth error: State mismatch - possible CSRF attack"));
          return;
        }
        if (code) {
          try {
            const tokens = await exchangeCodeForTokens(
              code,
              clientId,
              clientSecret,
              redirectUri,
              pendingOAuthState.codeVerifier
            );
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("<html><body><h1>Authentication Successful!</h1><p>You can close this window and return to the CLI.</p></body></html>");
            server.close();
            pendingOAuthState = null;
            resolve(tokens);
          } catch (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("<html><body><h1>Token Exchange Failed</h1><p>Please try again.</p></body></html>");
            server.close();
            pendingOAuthState = null;
            reject(err);
          }
        }
      }
    });
    server.listen(port, () => {
      const authParams = new URLSearchParams({
        type: "web_server",
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
      });
      const authUrl = `${OAUTH_BASE}/authorization/new?${authParams.toString()}`;
      console.log(chalk.blue("Opening browser for authentication..."));
      console.log(chalk.dim(`If browser doesn't open, visit: ${authUrl}`));
      open(authUrl);
    });
    server.on("error", (err) => {
      pendingOAuthState = null;
      reject(new Error(`Failed to start OAuth callback server: ${err.message}`));
    });
    setTimeout(() => {
      server.close();
      pendingOAuthState = null;
      reject(new Error("Authentication timed out"));
    }, 5 * 60 * 1e3);
  });
}
async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri, codeVerifier) {
  const response = await got.post(`${OAUTH_BASE}/authorization/token`, {
    searchParams: {
      type: "web_server",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      code_verifier: codeVerifier
    }
  }).json();
  const tokens = {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expires_at: Date.now() + response.expires_in * 1e3
  };
  setTokens(tokens);
  return tokens;
}
async function refreshTokens() {
  const { clientId, clientSecret, redirectUri } = getClientCredentials();
  const currentTokens = getTokens();
  if (!currentTokens?.refresh_token) {
    throw new Error("No refresh token available. Please login again.");
  }
  if (!clientId || !clientSecret) {
    throw new Error("Missing OAuth credentials");
  }
  const response = await got.post(`${OAUTH_BASE}/authorization/token`, {
    searchParams: {
      type: "refresh",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: currentTokens.refresh_token
    }
  }).json();
  const tokens = {
    access_token: response.access_token,
    refresh_token: currentTokens.refresh_token,
    expires_at: Date.now() + response.expires_in * 1e3
  };
  setTokens(tokens);
  return tokens;
}
async function getValidAccessToken() {
  const tokens = getTokens();
  if (!tokens?.access_token) {
    throw new Error("Not authenticated. Please run: basecamp auth login");
  }
  if (isTokenExpired()) {
    console.log(chalk.dim("Token expired, refreshing..."));
    const newTokens = await refreshTokens();
    return newTokens.access_token;
  }
  return tokens.access_token;
}
async function getAuthorization() {
  const accessToken = await getValidAccessToken();
  const response = await got.get(`${OAUTH_BASE}/authorization.json`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "User-Agent": "Basecamp CLI (emredoganer@github.com)"
    }
  }).json();
  return response;
}
function logout() {
  clearTokens();
}

// src/commands/auth.ts
function createAuthCommands() {
  const auth = new Command("auth").description("Manage authentication");
  auth.command("login").description("Login to Basecamp via OAuth").action(async () => {
    try {
      if (isAuthenticated()) {
        console.log(chalk2.yellow('Already authenticated. Use "basecamp auth logout" to logout first.'));
        return;
      }
      console.log(chalk2.blue("Starting OAuth flow..."));
      await startOAuthFlow();
      console.log(chalk2.green("\u2713 Successfully authenticated!"));
      const authorization = await getAuthorization();
      console.log(chalk2.dim(`
Logged in as: ${authorization.identity.first_name} ${authorization.identity.last_name}`));
      if (authorization.accounts.length > 0) {
        console.log(chalk2.dim("\nAvailable accounts:"));
        authorization.accounts.filter((a) => a.product === "bc3").forEach((a) => {
          console.log(chalk2.dim(`  ${a.id}: ${a.name}`));
        });
        const bc3Account = authorization.accounts.find((a) => a.product === "bc3");
        if (bc3Account) {
          setCurrentAccountId(bc3Account.id);
          console.log(chalk2.green(`
\u2713 Auto-selected account: ${bc3Account.name} (${bc3Account.id})`));
        }
      }
    } catch (error) {
      console.error(chalk2.red("Login failed:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  auth.command("logout").description("Logout from Basecamp").action(() => {
    logout();
    console.log(chalk2.green("\u2713 Successfully logged out"));
  });
  auth.command("status").description("Show authentication status").action(async () => {
    if (!isAuthenticated()) {
      console.log(chalk2.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const authorization = await getAuthorization();
      const tokens = getTokens();
      const currentAccountId = getCurrentAccountId();
      console.log(chalk2.green("\u2713 Authenticated"));
      console.log(chalk2.dim(`User: ${authorization.identity.first_name} ${authorization.identity.last_name}`));
      console.log(chalk2.dim(`Email: ${authorization.identity.email_address}`));
      console.log(chalk2.dim(`Current Account ID: ${currentAccountId || "Not set"}`));
      if (tokens?.expires_at) {
        const expiresIn = Math.round((tokens.expires_at - Date.now()) / 1e3 / 60);
        console.log(chalk2.dim(`Token expires in: ${expiresIn} minutes`));
      }
    } catch (error) {
      console.error(chalk2.red("Failed to get status:"), error instanceof Error ? error.message : error);
    }
  });
  auth.command("configure").description("Configure OAuth client settings (client ID and redirect URI only)").requiredOption("--client-id <id>", "OAuth Client ID").option("--redirect-uri <uri>", "OAuth Redirect URI", "http://localhost:9292/callback").action((options) => {
    setClientConfig(options.clientId, options.redirectUri);
    console.log(chalk2.green("\u2713 OAuth client configuration saved"));
    console.log(chalk2.yellow("\nIMPORTANT: For security, the client secret is NOT stored in the config file."));
    console.log(chalk2.yellow('You must set it via environment variable before running "basecamp auth login":'));
    console.log(chalk2.cyan('\n  export BASECAMP_CLIENT_SECRET="your-client-secret"\n'));
    console.log(chalk2.dim("Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.) for persistence."));
  });
  return auth;
}
function createAccountsCommand() {
  const accounts = new Command("accounts").description("List available Basecamp accounts").action(async () => {
    if (!isAuthenticated()) {
      console.log(chalk2.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const authorization = await getAuthorization();
      const currentAccountId = getCurrentAccountId();
      const bc3Accounts = authorization.accounts.filter((a) => a.product === "bc3");
      if (bc3Accounts.length === 0) {
        console.log(chalk2.yellow("No Basecamp 3 accounts found."));
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
          account.id === currentAccountId ? chalk2.green("\u2713") : ""
        ]);
      });
      console.log(table.toString());
    } catch (error) {
      console.error(chalk2.red("Failed to list accounts:"), error instanceof Error ? error.message : error);
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
        console.error(chalk2.red("Invalid account ID"));
        process.exit(1);
      }
      const authorization = await getAuthorization();
      const account2 = authorization.accounts.find((a) => a.id === accountId);
      if (!account2) {
        console.error(chalk2.red(`Account ${accountId} not found`));
        process.exit(1);
      }
      if (account2.product !== "bc3") {
        console.error(chalk2.red("This account is not a Basecamp 3 account"));
        process.exit(1);
      }
      setCurrentAccountId(accountId);
      console.log(chalk2.green(`\u2713 Switched to account: ${account2.name} (${accountId})`));
    } catch (error) {
      console.error(chalk2.red("Failed to set account:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  account.command("current").description("Show current account").action(async () => {
    const currentAccountId = getCurrentAccountId();
    if (!currentAccountId) {
      console.log(chalk2.yellow('No account selected. Run "basecamp account set <id>" to select one.'));
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
import chalk4 from "chalk";
import Table2 from "cli-table3";

// src/lib/api.ts
import got2, { HTTPError } from "got";
import chalk3 from "chalk";
var USER_AGENT = "@drkraft/basecamp-cli (contact@drkraft.com)";
function parseNextLink(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}
async function fetchAllPages(client, url, options) {
  const allResults = [];
  let nextUrl = url;
  while (nextUrl) {
    const response = await client.get(nextUrl, options);
    const items = response.body;
    allResults.push(...items);
    const linkHeader = response.headers.link;
    nextUrl = parseNextLink(linkHeader);
  }
  return allResults;
}
function getRetryConfig() {
  return {
    limit: 3,
    methods: ["GET", "HEAD", "PUT", "DELETE", "OPTIONS", "TRACE", "POST"],
    statusCodes: [429, 500, 502, 503, 504],
    errorCodes: [],
    calculateDelay: ({ attemptCount }) => {
      return Math.pow(2, attemptCount - 1) * 1e3;
    }
  };
}
function getRetryAfterDelay(response) {
  const retryAfter = response.headers["retry-after"];
  if (!retryAfter) return void 0;
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1e3;
  }
  const retryDate = new Date(retryAfter);
  if (!isNaN(retryDate.getTime())) {
    return Math.max(0, retryDate.getTime() - Date.now());
  }
  return void 0;
}
async function createClient() {
  const accessToken = await getValidAccessToken();
  const accountId = getCurrentAccountId();
  if (!accountId) {
    throw new Error("No account selected. Please run: basecamp account set <id>");
  }
  return got2.extend({
    prefixUrl: `https://3.basecampapi.com/${accountId}/`,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json"
    },
    responseType: "json",
    retry: getRetryConfig(),
    hooks: {
      beforeRetry: [
        ({ response, retryCount }) => {
          if (response && response.statusCode === 429) {
            const retryAfter = getRetryAfterDelay(response);
            if (retryAfter !== void 0) {
              console.error(chalk3.yellow(`Rate limited. Retrying after ${Math.ceil(retryAfter / 1e3)}s (attempt ${retryCount})`));
            } else {
              console.error(chalk3.yellow(`Rate limited. Retrying with exponential backoff (attempt ${retryCount})`));
            }
          } else if (response && [500, 502, 503, 504].includes(response.statusCode)) {
            console.error(chalk3.yellow(`Server error (${response.statusCode}). Retrying with exponential backoff (attempt ${retryCount})`));
          }
        }
      ],
      beforeError: [
        (error) => {
          if (error instanceof HTTPError) {
            const { response } = error;
            if (response.statusCode === 429) {
              console.error(chalk3.red("Rate limited. Max retries exceeded. Please wait and try again."));
            } else if (response.statusCode === 401) {
              console.error(chalk3.red("Authentication failed. Please run: basecamp auth login"));
            } else if (response.statusCode === 404) {
              console.error(chalk3.red("Resource not found."));
            } else if ([500, 502, 503, 504].includes(response.statusCode)) {
              console.error(chalk3.red(`Server error (${response.statusCode}). Max retries exceeded.`));
            }
          }
          return error;
        }
      ]
    }
  });
}
async function listProjects() {
  const client = await createClient();
  return fetchAllPages(client, "projects.json");
}
async function getProject(projectId) {
  const client = await createClient();
  const response = await client.get(`projects/${projectId}.json`).json();
  return response;
}
async function createProject(name, description) {
  const client = await createClient();
  const response = await client.post("projects.json", {
    json: { name, description }
  }).json();
  return response;
}
async function archiveProject(projectId) {
  const client = await createClient();
  await client.put(`projects/${projectId}.json`, {
    json: { status: "archived" }
  });
}
async function listTodoLists(projectId) {
  const client = await createClient();
  const project = await getProject(projectId);
  const todosetDock = project.dock.find((d) => d.name === "todoset");
  if (!todosetDock) {
    throw new Error("To-do lists not enabled for this project");
  }
  const todosetId = todosetDock.id;
  return fetchAllPages(client, `buckets/${projectId}/todosets/${todosetId}/todolists.json`);
}
async function createTodoList(projectId, name, description) {
  const client = await createClient();
  const project = await getProject(projectId);
  const todosetDock = project.dock.find((d) => d.name === "todoset");
  if (!todosetDock) {
    throw new Error("To-do lists not enabled for this project");
  }
  const todosetId = todosetDock.id;
  const response = await client.post(`buckets/${projectId}/todosets/${todosetId}/todolists.json`, {
    json: { name, description }
  }).json();
  return response;
}
async function listTodos(projectId, todolistId, completed) {
  const client = await createClient();
  const params = completed !== void 0 ? `?completed=${completed}` : "";
  return fetchAllPages(client, `buckets/${projectId}/todolists/${todolistId}/todos.json${params}`);
}
async function getTodo(projectId, todoId) {
  const client = await createClient();
  const response = await client.get(`buckets/${projectId}/todos/${todoId}.json`).json();
  return response;
}
async function createTodo(projectId, todolistId, content, options) {
  const client = await createClient();
  const response = await client.post(`buckets/${projectId}/todolists/${todolistId}/todos.json`, {
    json: { content, ...options }
  }).json();
  return response;
}
async function updateTodo(projectId, todoId, updates) {
  const client = await createClient();
  const response = await client.put(`buckets/${projectId}/todos/${todoId}.json`, {
    json: updates
  }).json();
  return response;
}
async function completeTodo(projectId, todoId) {
  const client = await createClient();
  await client.post(`buckets/${projectId}/todos/${todoId}/completion.json`);
}
async function uncompleteTodo(projectId, todoId) {
  const client = await createClient();
  await client.delete(`buckets/${projectId}/todos/${todoId}/completion.json`);
}
async function listMessages(projectId) {
  const client = await createClient();
  const project = await getProject(projectId);
  const messageboardDock = project.dock.find((d) => d.name === "message_board");
  if (!messageboardDock) {
    throw new Error("Message board not enabled for this project");
  }
  const messageboardId = messageboardDock.id;
  return fetchAllPages(client, `buckets/${projectId}/message_boards/${messageboardId}/messages.json`);
}
async function getMessage(projectId, messageId) {
  const client = await createClient();
  const response = await client.get(`buckets/${projectId}/messages/${messageId}.json`).json();
  return response;
}
async function createMessage(projectId, subject, content) {
  const client = await createClient();
  const project = await getProject(projectId);
  const messageboardDock = project.dock.find((d) => d.name === "message_board");
  if (!messageboardDock) {
    throw new Error("Message board not enabled for this project");
  }
  const messageboardId = messageboardDock.id;
  const response = await client.post(`buckets/${projectId}/message_boards/${messageboardId}/messages.json`, {
    json: { subject, content }
  }).json();
  return response;
}
async function listCampfires(projectId) {
  const client = await createClient();
  const project = await getProject(projectId);
  const campfireDock = project.dock.find((d) => d.name === "chat");
  if (!campfireDock) {
    throw new Error("Campfire not enabled for this project");
  }
  const response = await client.get(`buckets/${projectId}/chats/${campfireDock.id}.json`).json();
  return [response];
}
async function getCampfireLines(projectId, campfireId) {
  const client = await createClient();
  return fetchAllPages(client, `buckets/${projectId}/chats/${campfireId}/lines.json`);
}
async function sendCampfireLine(projectId, campfireId, content) {
  const client = await createClient();
  const response = await client.post(`buckets/${projectId}/chats/${campfireId}/lines.json`, {
    json: { content }
  }).json();
  return response;
}
async function listPeople(projectId) {
  const client = await createClient();
  const url = projectId ? `projects/${projectId}/people.json` : "people.json";
  return fetchAllPages(client, url);
}
async function getPerson(personId) {
  const client = await createClient();
  const response = await client.get(`people/${personId}.json`).json();
  return response;
}
async function getMe() {
  const client = await createClient();
  const response = await client.get("my/profile.json").json();
  return response;
}
async function listComments(projectId, recordingId) {
  const client = await createClient();
  return fetchAllPages(client, `buckets/${projectId}/recordings/${recordingId}/comments.json`);
}
async function getComment(projectId, commentId) {
  const client = await createClient();
  const response = await client.get(`buckets/${projectId}/comments/${commentId}.json`).json();
  return response;
}
async function createComment(projectId, recordingId, content) {
  const client = await createClient();
  const response = await client.post(`buckets/${projectId}/recordings/${recordingId}/comments.json`, {
    json: { content }
  }).json();
  return response;
}
async function updateComment(projectId, commentId, content) {
  const client = await createClient();
  const response = await client.put(`buckets/${projectId}/comments/${commentId}.json`, {
    json: { content }
  }).json();
  return response;
}
async function deleteComment(projectId, commentId) {
  const client = await createClient();
  await client.delete(`buckets/${projectId}/comments/${commentId}.json`);
}
async function getSchedule(projectId) {
  const client = await createClient();
  const project = await getProject(projectId);
  const scheduleDock = project.dock.find((d) => d.name === "schedule");
  if (!scheduleDock) {
    throw new Error("Schedule not enabled for this project");
  }
  const scheduleId = scheduleDock.id;
  const response = await client.get(`buckets/${projectId}/schedules/${scheduleId}.json`).json();
  return response;
}
async function listScheduleEntries(projectId, status) {
  const client = await createClient();
  const project = await getProject(projectId);
  const scheduleDock = project.dock.find((d) => d.name === "schedule");
  if (!scheduleDock) {
    throw new Error("Schedule not enabled for this project");
  }
  const scheduleId = scheduleDock.id;
  const params = status ? `?status=${status}` : "";
  return fetchAllPages(client, `buckets/${projectId}/schedules/${scheduleId}/entries.json${params}`);
}
async function createScheduleEntry(projectId, summary, startsAt, options) {
  const client = await createClient();
  const project = await getProject(projectId);
  const scheduleDock = project.dock.find((d) => d.name === "schedule");
  if (!scheduleDock) {
    throw new Error("Schedule not enabled for this project");
  }
  const scheduleId = scheduleDock.id;
  const payload = {
    summary,
    starts_at: startsAt
  };
  if (options?.description) payload.description = options.description;
  if (options?.endsAt) payload.ends_at = options.endsAt;
  if (options?.allDay !== void 0) payload.all_day = options.allDay;
  if (options?.participantIds) payload.participant_ids = options.participantIds;
  const response = await client.post(`buckets/${projectId}/schedules/${scheduleId}/entries.json`, {
    json: payload
  }).json();
  return response;
}
async function updateScheduleEntry(projectId, entryId, updates) {
  const client = await createClient();
  const response = await client.put(`buckets/${projectId}/schedule_entries/${entryId}.json`, {
    json: updates
  }).json();
  return response;
}
async function deleteScheduleEntry(projectId, entryId) {
  const client = await createClient();
  await client.delete(`buckets/${projectId}/schedule_entries/${entryId}.json`);
}

// src/commands/projects.ts
function createProjectsCommands() {
  const projects = new Command2("projects").description("Manage Basecamp projects");
  projects.command("list").description("List all projects").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk4.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectList = await listProjects();
      if (options.format === "json") {
        console.log(JSON.stringify(projectList, null, 2));
        return;
      }
      if (projectList.length === 0) {
        console.log(chalk4.yellow("No projects found."));
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
      console.log(chalk4.dim(`
Total: ${projectList.length} projects`));
    } catch (error) {
      console.error(chalk4.red("Failed to list projects:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  projects.command("get <id>").description("Get project details").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk4.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(id, 10);
      if (isNaN(projectId)) {
        console.error(chalk4.red("Invalid ID: must be a number"));
        process.exit(1);
      }
      const project = await getProject(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(project, null, 2));
        return;
      }
      console.log(chalk4.bold(project.name));
      console.log(chalk4.dim(`ID: ${project.id}`));
      console.log(chalk4.dim(`Status: ${project.status}`));
      console.log(chalk4.dim(`Purpose: ${project.purpose || "-"}`));
      console.log(chalk4.dim(`Description: ${project.description || "-"}`));
      console.log(chalk4.dim(`Created: ${new Date(project.created_at).toLocaleDateString()}`));
      console.log(chalk4.dim(`URL: ${project.app_url}`));
      console.log(chalk4.dim("\nEnabled tools:"));
      project.dock.filter((d) => d.enabled).forEach((d) => {
        console.log(chalk4.dim(`  - ${d.title} (${d.name})`));
      });
    } catch (error) {
      console.error(chalk4.red("Failed to get project:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  projects.command("create").description("Create a new project").requiredOption("-n, --name <name>", "Project name").option("-d, --description <description>", "Project description").option("--json", "Output as JSON").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk4.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const project = await createProject(options.name, options.description);
      if (options.json) {
        console.log(JSON.stringify(project, null, 2));
        return;
      }
      console.log(chalk4.green("\u2713 Project created"));
      console.log(chalk4.dim(`ID: ${project.id}`));
      console.log(chalk4.dim(`Name: ${project.name}`));
      console.log(chalk4.dim(`URL: ${project.app_url}`));
    } catch (error) {
      console.error(chalk4.red("Failed to create project:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  projects.command("archive <id>").description("Archive a project").action(async (id) => {
    if (!isAuthenticated()) {
      console.log(chalk4.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(id, 10);
      if (isNaN(projectId)) {
        console.error(chalk4.red("Invalid ID: must be a number"));
        process.exit(1);
      }
      await archiveProject(projectId);
      console.log(chalk4.green(`\u2713 Project ${projectId} archived`));
    } catch (error) {
      console.error(chalk4.red("Failed to archive project:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return projects;
}

// src/commands/todos.ts
import { Command as Command3 } from "commander";
import chalk5 from "chalk";
import Table3 from "cli-table3";
function createTodoListsCommands() {
  const todolists = new Command3("todolists").description("Manage to-do lists");
  todolists.command("list").description("List to-do lists in a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
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
      const lists = await listTodoLists(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(lists, null, 2));
        return;
      }
      if (lists.length === 0) {
        console.log(chalk5.yellow("No to-do lists found."));
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
      console.log(chalk5.dim(`
Total: ${lists.length} lists`));
    } catch (error) {
      console.error(chalk5.red("Failed to list to-do lists:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todolists.command("create").description("Create a to-do list").requiredOption("-p, --project <id>", "Project ID").requiredOption("-n, --name <name>", "List name").option("-d, --description <description>", "List description").option("--json", "Output as JSON").action(async (options) => {
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
      const list = await createTodoList(projectId, options.name, options.description);
      if (options.json) {
        console.log(JSON.stringify(list, null, 2));
        return;
      }
      console.log(chalk5.green("\u2713 To-do list created"));
      console.log(chalk5.dim(`ID: ${list.id}`));
      console.log(chalk5.dim(`Name: ${list.name}`));
    } catch (error) {
      console.error(chalk5.red("Failed to create to-do list:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return todolists;
}
function createTodosCommands() {
  const todos = new Command3("todos").description("Manage to-dos");
  todos.command("list").description("List to-dos in a to-do list").requiredOption("-p, --project <id>", "Project ID").requiredOption("-l, --list <id>", "To-do list ID").option("--completed", "Show completed to-dos").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
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
      const listId = parseInt(options.list, 10);
      if (isNaN(listId)) {
        console.error(chalk5.red("Invalid list ID: must be a number"));
        process.exit(1);
      }
      const todoList = await listTodos(projectId, listId, options.completed);
      if (options.format === "json") {
        console.log(JSON.stringify(todoList, null, 2));
        return;
      }
      if (todoList.length === 0) {
        console.log(chalk5.yellow("No to-dos found."));
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
          todo.completed ? chalk5.green("\u2713") : chalk5.dim("\u25CB"),
          todo.content.substring(0, 32) + (todo.content.length > 32 ? "..." : ""),
          todo.due_on || "-",
          todo.assignees?.map((a) => a.name).join(", ") || "-"
        ]);
      });
      console.log(table.toString());
      console.log(chalk5.dim(`
Total: ${todoList.length} to-dos`));
    } catch (error) {
      console.error(chalk5.red("Failed to list to-dos:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("get <id>").description("Get to-do details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
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
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk5.red("Invalid todo ID: must be a number"));
        process.exit(1);
      }
      const todo = await getTodo(projectId, todoId);
      if (options.format === "json") {
        console.log(JSON.stringify(todo, null, 2));
        return;
      }
      console.log(chalk5.bold(todo.content));
      console.log(chalk5.dim(`ID: ${todo.id}`));
      console.log(chalk5.dim(`Status: ${todo.completed ? "Completed" : "Pending"}`));
      console.log(chalk5.dim(`Description: ${todo.description || "-"}`));
      console.log(chalk5.dim(`Due: ${todo.due_on || "-"}`));
      console.log(chalk5.dim(`Starts: ${todo.starts_on || "-"}`));
      console.log(chalk5.dim(`Assignees: ${todo.assignees?.map((a) => a.name).join(", ") || "-"}`));
      console.log(chalk5.dim(`Comments: ${todo.comments_count}`));
      console.log(chalk5.dim(`URL: ${todo.app_url}`));
    } catch (error) {
      console.error(chalk5.red("Failed to get to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("create").description("Create a to-do").requiredOption("-p, --project <id>", "Project ID").requiredOption("-l, --list <id>", "To-do list ID").requiredOption("-c, --content <content>", "To-do content").option("-d, --description <description>", "To-do description").option("--due <date>", "Due date (YYYY-MM-DD)").option("--starts <date>", "Start date (YYYY-MM-DD)").option("--assignees <ids>", "Comma-separated assignee IDs").option("--json", "Output as JSON").action(async (options) => {
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
      const listId = parseInt(options.list, 10);
      if (isNaN(listId)) {
        console.error(chalk5.red("Invalid list ID: must be a number"));
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
      if (options.json) {
        console.log(JSON.stringify(todo, null, 2));
        return;
      }
      console.log(chalk5.green("\u2713 To-do created"));
      console.log(chalk5.dim(`ID: ${todo.id}`));
      console.log(chalk5.dim(`Content: ${todo.content}`));
    } catch (error) {
      console.error(chalk5.red("Failed to create to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("update <id>").description("Update a to-do").requiredOption("-p, --project <id>", "Project ID").option("-c, --content <content>", "New content").option("-d, --description <description>", "New description").option("--due <date>", "Due date (YYYY-MM-DD)").option("--starts <date>", "Start date (YYYY-MM-DD)").option("--assignees <ids>", "Comma-separated assignee IDs").option("--json", "Output as JSON").action(async (id, options) => {
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
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk5.red("Invalid todo ID: must be a number"));
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
      if (options.json) {
        console.log(JSON.stringify(todo, null, 2));
        return;
      }
      console.log(chalk5.green("\u2713 To-do updated"));
      console.log(chalk5.dim(`ID: ${todo.id}`));
      console.log(chalk5.dim(`Content: ${todo.content}`));
    } catch (error) {
      console.error(chalk5.red("Failed to update to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("complete <id>").description("Mark a to-do as complete").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
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
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk5.red("Invalid todo ID: must be a number"));
        process.exit(1);
      }
      await completeTodo(projectId, todoId);
      console.log(chalk5.green(`\u2713 To-do ${todoId} completed`));
    } catch (error) {
      console.error(chalk5.red("Failed to complete to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  todos.command("uncomplete <id>").description("Mark a to-do as incomplete").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
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
      const todoId = parseInt(id, 10);
      if (isNaN(todoId)) {
        console.error(chalk5.red("Invalid todo ID: must be a number"));
        process.exit(1);
      }
      await uncompleteTodo(projectId, todoId);
      console.log(chalk5.green(`\u2713 To-do ${todoId} marked as incomplete`));
    } catch (error) {
      console.error(chalk5.red("Failed to uncomplete to-do:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return todos;
}

// src/commands/messages.ts
import { Command as Command4 } from "commander";
import chalk6 from "chalk";
import Table4 from "cli-table3";
function createMessagesCommands() {
  const messages = new Command4("messages").description("Manage messages");
  messages.command("list").description("List messages in a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk6.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk6.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const messageList = await listMessages(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(messageList, null, 2));
        return;
      }
      if (messageList.length === 0) {
        console.log(chalk6.yellow("No messages found."));
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
      console.log(chalk6.dim(`
Total: ${messageList.length} messages`));
    } catch (error) {
      console.error(chalk6.red("Failed to list messages:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  messages.command("get <id>").description("Get message details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk6.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk6.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const messageId = parseInt(id, 10);
      if (isNaN(messageId)) {
        console.error(chalk6.red("Invalid message ID: must be a number"));
        process.exit(1);
      }
      const message = await getMessage(projectId, messageId);
      if (options.format === "json") {
        console.log(JSON.stringify(message, null, 2));
        return;
      }
      console.log(chalk6.bold(message.subject));
      console.log(chalk6.dim(`ID: ${message.id}`));
      console.log(chalk6.dim(`Author: ${message.creator?.name || "-"}`));
      console.log(chalk6.dim(`Created: ${new Date(message.created_at).toLocaleString()}`));
      console.log(chalk6.dim(`Comments: ${message.comments_count}`));
      console.log(chalk6.dim(`URL: ${message.app_url}`));
      console.log(chalk6.dim("\nContent:"));
      console.log(message.content || "-");
    } catch (error) {
      console.error(chalk6.red("Failed to get message:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  messages.command("create").description("Create a message").requiredOption("-p, --project <id>", "Project ID").requiredOption("-s, --subject <subject>", "Message subject").option("-c, --content <content>", "Message content (HTML)").option("--json", "Output as JSON").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk6.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk6.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const message = await createMessage(projectId, options.subject, options.content);
      if (options.json) {
        console.log(JSON.stringify(message, null, 2));
        return;
      }
      console.log(chalk6.green("\u2713 Message created"));
      console.log(chalk6.dim(`ID: ${message.id}`));
      console.log(chalk6.dim(`Subject: ${message.subject}`));
      console.log(chalk6.dim(`URL: ${message.app_url}`));
    } catch (error) {
      console.error(chalk6.red("Failed to create message:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return messages;
}

// src/commands/campfires.ts
import { Command as Command5 } from "commander";
import chalk7 from "chalk";
import Table5 from "cli-table3";
function createCampfiresCommands() {
  const campfires = new Command5("campfires").description("Manage campfires (chat)");
  campfires.command("list").description("List campfires in a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
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
      const campfireList = await listCampfires(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(campfireList, null, 2));
        return;
      }
      if (campfireList.length === 0) {
        console.log(chalk7.yellow("No campfires found."));
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
      console.error(chalk7.red("Failed to list campfires:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  campfires.command("lines").description("Get recent campfire messages").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --campfire <id>", "Campfire ID").option("-n, --limit <number>", "Number of lines to show", "20").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
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
      const campfireId = parseInt(options.campfire, 10);
      if (isNaN(campfireId)) {
        console.error(chalk7.red("Invalid campfire ID: must be a number"));
        process.exit(1);
      }
      const limit = parseInt(options.limit, 10);
      if (isNaN(limit)) {
        console.error(chalk7.red("Invalid limit: must be a number"));
        process.exit(1);
      }
      const lines = await getCampfireLines(projectId, campfireId);
      if (options.format === "json") {
        console.log(JSON.stringify(lines, null, 2));
        return;
      }
      if (lines.length === 0) {
        console.log(chalk7.yellow("No messages found."));
        return;
      }
      const displayLines = lines.slice(-limit);
      displayLines.forEach((line) => {
        const time = new Date(line.created_at).toLocaleTimeString();
        const author = line.creator?.name || "Unknown";
        console.log(chalk7.dim(`[${time}]`) + ` ${chalk7.blue(author)}: ${line.content}`);
      });
      console.log(chalk7.dim(`
Showing ${displayLines.length} of ${lines.length} messages`));
    } catch (error) {
      console.error(chalk7.red("Failed to get campfire lines:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  campfires.command("send").description("Send a message to a campfire").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --campfire <id>", "Campfire ID").requiredOption("-m, --message <message>", "Message content").option("--json", "Output as JSON").action(async (options) => {
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
      const campfireId = parseInt(options.campfire, 10);
      if (isNaN(campfireId)) {
        console.error(chalk7.red("Invalid campfire ID: must be a number"));
        process.exit(1);
      }
      const line = await sendCampfireLine(projectId, campfireId, options.message);
      if (options.json) {
        console.log(JSON.stringify(line, null, 2));
        return;
      }
      console.log(chalk7.green("\u2713 Message sent"));
    } catch (error) {
      console.error(chalk7.red("Failed to send message:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return campfires;
}

// src/commands/people.ts
import { Command as Command6 } from "commander";
import chalk8 from "chalk";
import Table6 from "cli-table3";
function createPeopleCommands() {
  const people = new Command6("people").description("Manage people");
  people.command("list").description("List people").option("-p, --project <id>", "Project ID (optional, lists all if omitted)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk8.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      let projectId = void 0;
      if (options.project) {
        projectId = parseInt(options.project, 10);
        if (isNaN(projectId)) {
          console.error(chalk8.red("Invalid project ID: must be a number"));
          process.exit(1);
        }
      }
      const peopleList = await listPeople(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(peopleList, null, 2));
        return;
      }
      if (peopleList.length === 0) {
        console.log(chalk8.yellow("No people found."));
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
      console.log(chalk8.dim(`
Total: ${peopleList.length} people`));
    } catch (error) {
      console.error(chalk8.red("Failed to list people:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  people.command("get <id>").description("Get person details").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk8.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const personId = parseInt(id, 10);
      if (isNaN(personId)) {
        console.error(chalk8.red("Invalid ID: must be a number"));
        process.exit(1);
      }
      const person = await getPerson(personId);
      if (options.format === "json") {
        console.log(JSON.stringify(person, null, 2));
        return;
      }
      console.log(chalk8.bold(person.name));
      console.log(chalk8.dim(`ID: ${person.id}`));
      console.log(chalk8.dim(`Email: ${person.email_address}`));
      console.log(chalk8.dim(`Title: ${person.title || "-"}`));
      console.log(chalk8.dim(`Bio: ${person.bio || "-"}`));
      console.log(chalk8.dim(`Location: ${person.location || "-"}`));
      console.log(chalk8.dim(`Time Zone: ${person.time_zone}`));
      console.log(chalk8.dim(`Company: ${person.company?.name || "-"}`));
      let role = "";
      if (person.owner) role = "Owner";
      else if (person.admin) role = "Admin";
      else if (person.client) role = "Client";
      else role = "Member";
      console.log(chalk8.dim(`Role: ${role}`));
    } catch (error) {
      console.error(chalk8.red("Failed to get person:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  people.command("me").description("Get your profile").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk8.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const person = await getMe();
      if (options.format === "json") {
        console.log(JSON.stringify(person, null, 2));
        return;
      }
      console.log(chalk8.bold(person.name));
      console.log(chalk8.dim(`ID: ${person.id}`));
      console.log(chalk8.dim(`Email: ${person.email_address}`));
      console.log(chalk8.dim(`Title: ${person.title || "-"}`));
      console.log(chalk8.dim(`Bio: ${person.bio || "-"}`));
      console.log(chalk8.dim(`Location: ${person.location || "-"}`));
      console.log(chalk8.dim(`Time Zone: ${person.time_zone}`));
      console.log(chalk8.dim(`Company: ${person.company?.name || "-"}`));
    } catch (error) {
      console.error(chalk8.red("Failed to get profile:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return people;
}

// src/commands/comments.ts
import { Command as Command7 } from "commander";
import chalk9 from "chalk";
import Table7 from "cli-table3";
function createCommentsCommands() {
  const comments = new Command7("comments").description("Manage comments on recordings (todos, messages, etc.)");
  comments.command("list").description("List comments on a recording").requiredOption("-p, --project <id>", "Project ID").requiredOption("-r, --recording <id>", "Recording ID (todo, message, etc.)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk9.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk9.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(options.recording, 10);
      if (isNaN(recordingId)) {
        console.error(chalk9.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      const commentsList = await listComments(projectId, recordingId);
      if (options.format === "json") {
        console.log(JSON.stringify(commentsList, null, 2));
        return;
      }
      if (commentsList.length === 0) {
        console.log(chalk9.yellow("No comments found."));
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
      console.log(chalk9.dim(`
Total: ${commentsList.length} comments`));
    } catch (error) {
      console.error(chalk9.red("Failed to list comments:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  comments.command("get <id>").description("Get comment details").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk9.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk9.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) {
        console.error(chalk9.red("Invalid comment ID: must be a number"));
        process.exit(1);
      }
      const comment = await getComment(projectId, commentId);
      if (options.format === "json") {
        console.log(JSON.stringify(comment, null, 2));
        return;
      }
      console.log(chalk9.bold("Comment"));
      console.log(chalk9.dim(`ID: ${comment.id}`));
      console.log(chalk9.dim(`Creator: ${comment.creator?.name || "-"}`));
      console.log(chalk9.dim(`Created: ${new Date(comment.created_at).toLocaleString()}`));
      console.log(chalk9.dim(`Updated: ${new Date(comment.updated_at).toLocaleString()}`));
      console.log(chalk9.dim(`Content:
${comment.content}`));
      console.log(chalk9.dim(`URL: ${comment.app_url}`));
    } catch (error) {
      console.error(chalk9.red("Failed to get comment:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  comments.command("create").description("Create a comment on a recording").requiredOption("-p, --project <id>", "Project ID").requiredOption("-r, --recording <id>", "Recording ID (todo, message, etc.)").requiredOption("-c, --content <content>", "Comment content").option("--json", "Output as JSON").action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk9.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk9.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const recordingId = parseInt(options.recording, 10);
      if (isNaN(recordingId)) {
        console.error(chalk9.red("Invalid recording ID: must be a number"));
        process.exit(1);
      }
      const comment = await createComment(projectId, recordingId, options.content);
      if (options.json) {
        console.log(JSON.stringify(comment, null, 2));
        return;
      }
      console.log(chalk9.green("\u2713 Comment created"));
      console.log(chalk9.dim(`ID: ${comment.id}`));
      console.log(chalk9.dim(`Content: ${comment.content.substring(0, 50)}${comment.content.length > 50 ? "..." : ""}`));
    } catch (error) {
      console.error(chalk9.red("Failed to create comment:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  comments.command("update <id>").description("Update a comment").requiredOption("-p, --project <id>", "Project ID").requiredOption("-c, --content <content>", "New comment content").option("--json", "Output as JSON").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk9.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk9.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) {
        console.error(chalk9.red("Invalid comment ID: must be a number"));
        process.exit(1);
      }
      const comment = await updateComment(projectId, commentId, options.content);
      if (options.json) {
        console.log(JSON.stringify(comment, null, 2));
        return;
      }
      console.log(chalk9.green("\u2713 Comment updated"));
      console.log(chalk9.dim(`ID: ${comment.id}`));
      console.log(chalk9.dim(`Content: ${comment.content.substring(0, 50)}${comment.content.length > 50 ? "..." : ""}`));
    } catch (error) {
      console.error(chalk9.red("Failed to update comment:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  comments.command("delete <id>").description("Delete a comment").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
    if (!isAuthenticated()) {
      console.log(chalk9.yellow('Not authenticated. Run "basecamp auth login" to login.'));
      return;
    }
    try {
      const projectId = parseInt(options.project, 10);
      if (isNaN(projectId)) {
        console.error(chalk9.red("Invalid project ID: must be a number"));
        process.exit(1);
      }
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) {
        console.error(chalk9.red("Invalid comment ID: must be a number"));
        process.exit(1);
      }
      await deleteComment(projectId, commentId);
      console.log(chalk9.green(`\u2713 Comment ${commentId} deleted`));
    } catch (error) {
      console.error(chalk9.red("Failed to delete comment:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return comments;
}

// src/commands/schedules.ts
import { Command as Command8 } from "commander";
import chalk10 from "chalk";
import Table8 from "cli-table3";
function createSchedulesCommands() {
  const schedules = new Command8("schedules").description("Manage schedules and schedule entries");
  schedules.command("get").description("Get schedule info for a project").requiredOption("-p, --project <id>", "Project ID").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
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
      const schedule = await getSchedule(projectId);
      if (options.format === "json") {
        console.log(JSON.stringify(schedule, null, 2));
        return;
      }
      console.log(chalk10.bold(schedule.title));
      console.log(chalk10.dim(`ID: ${schedule.id}`));
      console.log(chalk10.dim(`Status: ${schedule.status}`));
      console.log(chalk10.dim(`Entries: ${schedule.entries_count}`));
      console.log(chalk10.dim(`Include due assignments: ${schedule.include_due_assignments}`));
      console.log(chalk10.dim(`Created: ${new Date(schedule.created_at).toLocaleDateString()}`));
      console.log(chalk10.dim(`URL: ${schedule.app_url}`));
    } catch (error) {
      console.error(chalk10.red("Failed to get schedule:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  schedules.command("entries").description("List schedule entries in a project").requiredOption("-p, --project <id>", "Project ID").option("--status <status>", "Filter by status (active|archived|trashed)").option("-f, --format <format>", "Output format (table|json)", "table").action(async (options) => {
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
      const entries = await listScheduleEntries(projectId, options.status);
      if (options.format === "json") {
        console.log(JSON.stringify(entries, null, 2));
        return;
      }
      if (entries.length === 0) {
        console.log(chalk10.yellow("No schedule entries found."));
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
      console.log(chalk10.dim(`
Total: ${entries.length} entries`));
    } catch (error) {
      console.error(chalk10.red("Failed to list schedule entries:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  schedules.command("create-entry").description("Create a schedule entry").requiredOption("-p, --project <id>", "Project ID").requiredOption("-s, --summary <summary>", "Event summary").requiredOption("--starts-at <datetime>", "Start date/time (ISO 8601)").option("--ends-at <datetime>", "End date/time (ISO 8601)").option("-d, --description <description>", "Event description").option("--all-day", "Mark as all-day event").option("--participants <ids>", "Comma-separated participant IDs").option("--json", "Output as JSON").action(async (options) => {
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
      const entryOptions = {};
      if (options.description) entryOptions.description = options.description;
      if (options.endsAt) entryOptions.endsAt = options.endsAt;
      if (options.allDay) entryOptions.allDay = true;
      if (options.participants) {
        entryOptions.participantIds = options.participants.split(",").map((id) => parseInt(id.trim(), 10));
      }
      const entry = await createScheduleEntry(projectId, options.summary, options.startsAt, entryOptions);
      if (options.json) {
        console.log(JSON.stringify(entry, null, 2));
        return;
      }
      console.log(chalk10.green("\u2713 Schedule entry created"));
      console.log(chalk10.dim(`ID: ${entry.id}`));
      console.log(chalk10.dim(`Summary: ${entry.summary}`));
      console.log(chalk10.dim(`Start: ${new Date(entry.starts_at).toLocaleString()}`));
    } catch (error) {
      console.error(chalk10.red("Failed to create schedule entry:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  schedules.command("update-entry <id>").description("Update a schedule entry").requiredOption("-p, --project <id>", "Project ID").option("-s, --summary <summary>", "New summary").option("-d, --description <description>", "New description").option("--starts-at <datetime>", "New start date/time (ISO 8601)").option("--ends-at <datetime>", "New end date/time (ISO 8601)").option("--all-day", "Mark as all-day event").option("--participants <ids>", "Comma-separated participant IDs").option("--json", "Output as JSON").action(async (id, options) => {
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
      const entryId = parseInt(id, 10);
      if (isNaN(entryId)) {
        console.error(chalk10.red("Invalid entry ID: must be a number"));
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
      if (options.json) {
        console.log(JSON.stringify(entry, null, 2));
        return;
      }
      console.log(chalk10.green("\u2713 Schedule entry updated"));
      console.log(chalk10.dim(`ID: ${entry.id}`));
      console.log(chalk10.dim(`Summary: ${entry.summary}`));
    } catch (error) {
      console.error(chalk10.red("Failed to update schedule entry:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  schedules.command("delete-entry <id>").description("Delete a schedule entry").requiredOption("-p, --project <id>", "Project ID").action(async (id, options) => {
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
      const entryId = parseInt(id, 10);
      if (isNaN(entryId)) {
        console.error(chalk10.red("Invalid entry ID: must be a number"));
        process.exit(1);
      }
      await deleteScheduleEntry(projectId, entryId);
      console.log(chalk10.green(`\u2713 Schedule entry ${entryId} deleted`));
    } catch (error) {
      console.error(chalk10.red("Failed to delete schedule entry:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
  return schedules;
}

// src/index.ts
var program = new Command9();
program.name("basecamp").description("CLI for managing Basecamp 4 projects, to-dos, messages, and campfires").version("1.0.0").option("-v, --verbose", "Enable verbose output for debugging");
program.addCommand(createAuthCommands());
program.addCommand(createAccountsCommand());
program.addCommand(createAccountCommand());
program.addCommand(createProjectsCommands());
program.addCommand(createTodoListsCommands());
program.addCommand(createTodosCommands());
program.addCommand(createMessagesCommands());
program.addCommand(createCampfiresCommands());
program.addCommand(createPeopleCommands());
program.addCommand(createCommentsCommands());
program.addCommand(createSchedulesCommands());
program.parse();
