# Elite Vet Website

## Overview

Elite Vet is a professional veterinary clinic website built with React, Express, and PostgreSQL. The application serves as a digital presence for a veterinary practice, providing information about services, team members, and facilitating contact with potential clients. The design emphasizes a compassionate, trustworthy experience that reassures pet owners while showcasing clinical excellence through clean, professional design patterns inspired by healthcare and modern service platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** Radix UI primitives with shadcn/ui component library
- **Animations:** Framer Motion for interactive elements and transitions
- **State Management:** TanStack Query (React Query) for server state
- **Form Handling:** React Hook Form with Zod validation

**Design System:**
- Custom color palette based on brand guidelines (Primary Purple: #7760a8, Neutral Gray: #9d9ea0, Off-White: #fbfbfb)
- Typography: Rubik (headings/UI), Poppins (body text), with support for Arabic (FF Shamel Sans)
- Consistent spacing primitives using Tailwind units (4, 6, 8, 12, 16, 20, 24, 32)
- Responsive grid strategy with mobile-first approach

**Key Features:**
- Animated backgrounds (paw prints, bones, ECG heartbeat animations) using SVG and Framer Motion
- Image carousel/slider for hero section using Embla Carousel
- Floating social media menu with drag-and-drop functionality
- Background music player with user controls
- Form validation and submission handling
- Responsive design for mobile, tablet, and desktop

**Component Structure:**
- Page components (`/pages`) - Route-level components
- UI components (`/components/ui`) - Reusable shadcn/ui primitives
- Feature components (`/components`) - Business logic components (Header, Footer, sections)
- Example components (`/components/examples`) - Component documentation/showcase
- **PageLayout** (`/components/PageLayout.tsx`) - Shared layout wrapper for all pages

**CRITICAL: Page Layout Pattern & Fixed Positioning**
- All page components MUST use the `PageLayout` component wrapper
- **ALL fixed-position elements (Header, FloatingSocialMenu, BackgroundMusic) MUST be rendered at the TRUE root level in App.tsx**
- NEVER nest fixed-position elements inside page containers - this breaks mobile browser positioning
- 
**App.tsx Root Structure:**
  1. AnimatedServicesBackground (global background)
  2. Header (fixed, z-[200]) - rendered at root, not in PageLayout
  3. BackgroundMusic (fixed, z-150) - rendered at root
  4. FloatingSocialMenu (fixed, z-[150]) - rendered at root
  5. Router (page content using PageLayout)

**PageLayout Structure (for page content only):**
  1. PetBackground (z-[1]) - animated background layer
  2. Content wrapper (z-10) containing:
     - Main content inside `<main className="relative pt-20">`
     - Footer component
  3. This wrapper elevates content above PetBackground

**Z-Index Hierarchy (all at root stacking context):**
- Header: z-[200] - Always on top
- FloatingSocialMenu: z-[150] - Below header, above content
- BackgroundMusic: z-150 - Below header, above content
- Page content wrapper: z-10 - Above background
- PetBackground: z-[1] - Bottom layer

**Why This Architecture:**
- Fixed elements at root level prevent mobile browser bugs (Samsung, iOS Safari)
- No parent transforms/positions can affect fixed positioning
- Consistent behavior across all devices and browsers
- Header/icons stay visible during scroll on all mobile devices

**CRITICAL: Horizontal Overflow Prevention Pattern**
- NEVER apply `overflow-x: hidden` to `html` or `body` - this breaks iOS momentum scroll and masks root cause
- Framer Motion animations with `translateX` (x: ±50) or `scale > 1` can push content beyond 100vw
- ALWAYS wrap animated content in `overflow-x-hidden` containers at the section content level

**Correct Pattern:**
```tsx
<section className="py-12...">  {/* No overflow constraint at section level */}
  <div className="max-w-7xl mx-auto overflow-x-hidden">  {/* Clips child animations */}
    <motion.div initial={{ x: -50 }} animate={{ x: 0 }}>  {/* Clipped by parent */}
      ...
    </motion.div>
  </div>
</section>
```

**Implementation:**
- IntroSection: Content container clips x: ±50 animations
- ServicesSection: Content container clips vertical animations (no hover:scale-105)
- ContentWithMediaSection: Content container clips x: ±50 animations (propagates to About page)
- WhyChooseSection, TeamSection, PartnersSection, ContactSection: Content containers clip vertical animations
- Image scale animations: Wrapped in separate `overflow-hidden` containers

**Mobile Browser Behavior:**
- When body width exceeds 100vw, Android browsers reposition fixed elements off-screen
- Symptom: Header toggle, social icons, music button disappear/shift during scroll
- Solution: Prevent horizontal overflow at content level while keeping global scroll intact

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database ORM:** Drizzle ORM
- **Session Management:** Connect-pg-simple for PostgreSQL session store
- **Build Tool:** ESBuild for production bundling

**Architecture Pattern:**
- RESTful API design (all routes prefixed with `/api`)
- Memory storage implementation (`MemStorage`) with interface (`IStorage`) for future database integration
- Middleware for request logging, JSON parsing, and raw body capture
- Separation of concerns: routes, storage layer, and database configuration

**Request/Response Flow:**
1. Express middleware processes incoming requests
2. Routes handle API endpoints and delegate to storage layer
3. Storage layer abstracts data operations (currently in-memory, ready for database)
4. Responses logged with timing information for monitoring

**Development Features:**
- Vite integration for hot module replacement in development
- Custom error handling and logging
- Development plugins (cartographer, dev banner, runtime error overlay)

### Data Storage

**Database:**
- **Provider:** Neon (PostgreSQL serverless)
- **ORM:** Drizzle ORM with type-safe schema definitions
- **Migration Strategy:** Drizzle Kit for schema management (`drizzle.config.ts`)
- **Connection:** WebSocket-based connection using @neondatabase/serverless

**Schema Design:**
- Users table with UUID primary keys, username/password fields
- Schema validation using Drizzle-Zod for runtime type checking
- Shared schema definitions between client and server (`/shared/schema.ts`)

**Current Implementation:**
- In-memory storage (`MemStorage`) for development/testing
- Database schema defined and ready for migration
- Storage interface designed for easy swap to database-backed implementation

### Build & Deployment

**Development:**
- Vite dev server with HMR for client
- tsx for running TypeScript server with watch mode
- Separate client and server processes

**Production:**
- Vite builds client to `dist/public`
- ESBuild bundles server to `dist/index.js`
- Static file serving from Express
- Environment-based configuration (NODE_ENV)

**Build Commands:**
- `dev`: Development mode with tsx
- `build`: Production build (client + server)
- `start`: Production server
- `db:push`: Push schema changes to database

## External Dependencies

### Third-Party Services

**Database:**
- Neon PostgreSQL (serverless PostgreSQL with WebSocket support)
- Connection pooling via @neondatabase/serverless

### APIs & Libraries

**UI & Styling:**
- Radix UI - Unstyled, accessible component primitives
- Tailwind CSS - Utility-first CSS framework
- Framer Motion - Animation library
- shadcn/ui - Pre-built component library

**Forms & Validation:**
- React Hook Form - Form state management
- Zod - Schema validation
- @hookform/resolvers - Integration between React Hook Form and Zod

**Data Fetching:**
- TanStack Query - Server state management and caching

**Carousel:**
- Embla Carousel - Lightweight carousel library with autoplay plugin

**Development Tools:**
- Vite development plugins (runtime-error-modal, cartographer, dev-banner)

**Icons:**
- Lucide React - Icon library
- React Icons (fa6) - Font Awesome 6 icons for social media

### Asset Management

**Static Assets:**
- Images stored in `/attached_assets` directory
- Logo, hero images, and service images
- Background music file
- Vite alias `@assets` for asset imports

**Font Loading:**
- Google Fonts CDN for Rubik and Poppins
- Preconnect optimization for font loading performance