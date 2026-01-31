# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-31

### Changed
- **BREAKING**: Rebranded package from `@emredoganer/basecamp-cli` to `@drkraft/basecamp-cli`
- **BREAKING**: Updated User-Agent header from `Basecamp CLI (emredoganer@github.com)` to `@drkraft/basecamp-cli (contact@drkraft.com)`
- Updated author metadata to `drkraft`
- Updated repository URL to `github.com/drkraft/basecamp-cli`

### Migration Guide
If you were using `@emredoganer/basecamp-cli`, update your installation:

```bash
npm uninstall -g @emredoganer/basecamp-cli
npm install -g @drkraft/basecamp-cli
```

Or in package.json:
```json
{
  "dependencies": {
    "@drkraft/basecamp-cli": "^2.0.0"
  }
}
```

All CLI commands and functionality remain unchanged. This is purely a namespace and metadata update.

## [1.0.0] - 2024-XX-XX

### Added
- Initial release of Basecamp CLI
- OAuth authentication support
- Project management commands
- To-do list and to-do management
- Message board support
- Campfire (chat) support
- People management
- JSON output format support
