# 01 - Core Architecture

## Purpose
This document defines the core architectural principles, technology stack, and data flow.

## Project Architecture (Feature-based)
**IMPORTANT**: This project uses **feature-based architecture**. All code must follow this structure:

- **Features** (`src/features/`): Each feature is self-contained with its own:
  - `components/` - Feature-specific components
  - `hooks/` - Feature-specific custom hooks
  - `services/` - Feature-specific API services
  - `types/` - Feature-specific TypeScript types/interfaces
  - `index.ts` - Feature exports (barrel export)
- **Components** (`src/components/`): Shared/reusable components organized by category:
  - `common/` - Common UI components (Button, Input, Modal, etc.)
  - `layout/` - Layout components (Header, Sidebar, etc.)
  - `auth/` - Authentication-related components
- **Never break feature boundaries**: Each feature should be independent and self-contained.
- **Use barrel exports**: Always export through `index.ts` files for clean imports.

## Core Principles
1.  **Low Friction**: Users should be able to explore the system even without clicking the "Login" button (Anonymous Auth).
2.  **Persistence**: Game state, chat history, and scores are never lost.
3.  **Micro-App Modularity**: Each game is an independent module.
4.  **Offline-First**: PWA capabilities for offline play and synchronization.

## Tech Stack & Decisions
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Next.js 15 (CSR) | Latest features, high performance. |
| **State Mgmt** | Zustand + nuqs | Simple global state and URL state management. |
| **Backend** | .NET 8/9 Web API | High-performance business logic. |
| **Realtime** | SignalR | For low-latency synchronization. |
| **Database** | PostgreSQL + Redis | Relational data + fast state caching. |

## Data Flow Principles
1. **Read**: `UI` -> `TanStack Query (Cache)` -> `API` -> `DB`
2. **Write**: `UI` -> `Optimistic Update` -> `API` -> `DB` -> `Realtime Event`
3. **Realtime**: `SignalR Hub` -> `Client Listener` -> `Zustand Store Update`
