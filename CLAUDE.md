# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Moca is a Rocket League overlay application for VTuber tournaments, specifically designed for GracesBlaze. It provides real-time match overlays with player statistics, scores, and team information integrated with Google Sheets and Google Drive for asset management.

## Development Commands

### Main Application

```bash
bun run dev          # Development with hot reload
bun run build        # Production build  
bun run check        # TypeScript type checking
bun run pack         # Package as executable
bun run dist         # Create distributable
bun run fmt          # format
```

## Architecture Overview

The application is an Electron desktop app that serves as both a control interface and overlay generation system.

### Core Communication Pattern

```
Rocket League Game → UDP (port 12345) → WebSocket Server (port 8001) → Browser Overlays
```

### Key Modules

- **Main Process** (`src/main.ts`): Orchestrates all services via the `Moca` class
- **Socket Communication** (`src/api/socketComm.ts`): WebSocket and UDP server handling
- **Google Integration**:
  - `src/api/spread.ts`: Google Sheets integration for team data
  - `src/api/gdrive.ts`: Google Drive asset management
- **Match Logic** (`src/api/setPointModule.ts`): Score tracking and match state
- **Authentication** (`src/api/new_start.ts`): Google API credential management

### Overlay System

HTML overlays in `graphics/` use WebSocket for real-time updates:

- `matching.html`: Main match overlay (boost, scores, players)
- `nextMatch.html`: Match lineup display
- `stats.html`: Post-match statistics

Browser source endpoints:

- `/boost` - Main match overlay
- `/stats` - Statistics overlay
- `/score` - Score display only
- `/playerName` - Player names
- `/nextMatch` - Next match info

## Google Services Integration

The application requires Google Sheets and Drive API access:

- Credentials stored in `./env/credential.json`
- Configuration in `./env/config.json`
- Service account authentication for Sheets
- OAuth2 for Drive access

## State Management

- **Electron**: IPC handlers for file operations and API calls
- **Overlays**: Direct WebSocket communication for real-time updates

## Development Notes

- 開発環境はLinuxではなく，Windowsでbuildとdevelopmentを行う．
- よってすべてのコマンドはWindowsのコマンドを使用する.
- Uses bun as package manager
- TypeScript with strict type checking enabled
- ESLint configuration for code quality
- Webpack for Electron app bundling
- TailwindCSS for styling
- class / interface / type / enum / decorator / type parameters / component functions in TSX / JSXElement type parameterは`UpperCamelCase`
- variable / parameter / function / method / property / module aliasは`lowerCamelCase`
- global constant values, including enum valuesは`CONSTANT_CASE`で記術する．

## File Structure Context

- `graphics/`: HTML overlay files and assets
- `src/api/`: Core API and service modules
- `src/web/`: React components for Electron UI
- Asset management through Google Drive integration for player images and videos

## アプリケーション

- 認証
  - `credential.json`からGoogle Service Accountの認証を行う

## Language Preference

- このレポジトリでは日本語で話して

## Memory

- Claude Codeのユーザーの入力待ちや，処理が終わった場合にpowershell.exe -Command '[System.Media.SystemSounds]::Hand.Play()'を実行する
