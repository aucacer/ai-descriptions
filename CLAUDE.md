# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered eBay product description generator built with Next.js 15, React 18, and TypeScript. The application helps users create professional, SEO-optimized product descriptions for eBay listings using OpenAI's API.

## Key Commands

```bash
# Development
npm run dev        # Start development server on http://localhost:3000

# Build & Production
npm run build      # Build production bundle
npm run start      # Start production server

# Code Quality
npm run lint       # Run ESLint for code linting
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with custom component library
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **AI Integration**: OpenAI API (GPT models) with Bing Web Search for product research

### Core Services

1. **AI Service** (`lib/ai-service.ts`): Manages AI providers and description generation
   - Supports multiple AI providers (OpenAI, Mock)
   - Product research with web scraping capabilities
   - Color palette generation from product data

2. **eBay Assistant** (`lib/ebay-assistant.ts`): Unified fast generation system
   - Uses OpenAI's Chat Completions API with optimized single-pass generation
   - Generates descriptions in under 10 seconds using gpt-4o-mini model
   - Built-in style code database for popular sneakers
   - **Product Support**: Pokemon TCG, Sneakers (all brands), Electronics, Gaming, General products
   - Automatic corrections: Pokemon ETBs = 9 packs, sneaker style codes
   - Contextual "Happy Shopping!" messages based on product type
   - No external API calls or multi-step research for maximum speed
   - Implemented on both main page and test-api page
   - Generation time tracked in debug output

### API Routes

- `/api/generate-description`: Main endpoint for AI description generation
- `/api/research-product`: Deprecated - functionality moved to generate-description
- `/api/generate-colors`: Color palette generation endpoint

### Environment Variables

Required for full functionality:
```
OPENAI_API_KEY=your_key_here       # Required: OpenAI API for description generation
OPENAI_MODEL=gpt-4o-mini          # Optional: Model selection (default: gpt-4o-mini)
```

Note: BING_KEY is no longer needed as the enhanced version uses OpenAI's capabilities directly for product research.

## Important Notes

- **Build Configuration**: TypeScript and ESLint errors are ignored during builds (`next.config.mjs`)
- **API Keys**: The app requires OpenAI API key for full functionality. Without it, only mock descriptions are generated
- **Product Research**: The enhanced eBay assistant uses OpenAI's knowledge base directly for accurate product information without external APIs
- **State Management**: Uses React hooks and local component state (no global state management)

## Component Structure

All UI components are in `components/ui/` following shadcn/ui patterns:
- Use existing components from the library when building features
- Components use Radix UI primitives with Tailwind styling
- Follow existing patterns for consistency

## Path Aliases

Uses `@/*` alias for imports pointing to the project root.