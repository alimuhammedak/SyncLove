# 03 - React Frontend & PWA (React 19 & Next.js 15)

## Purpose
To develop a high-performance client-side dashboard using the latest React and Next.js features.

## Project Context
**IMPORTANT**: This is a dashboard application with **NO server-side rendering (SSR)**. All pages are client-side rendered (CSR).
- All pages and layouts use `'use client'` directive.
- Focus on client-side performance and Web Vitals.

## React 19 & Next.js 15 Best Practices
1. **State Management**:
   - Use `useActionState` instead of `useFormState`.
   - Use enhanced `useFormStatus` (data, method, action).
   - Use `nuqs` for URL state management.
2. **Async Request APIs**:
   - Use `useParams` and `useSearchParams` hooks for routing data.
3. **Component Architecture**:
   - Implement proper error boundaries.
   - Use `Suspense` for async operations.

## PWA Configuration (vite-plugin-pwa / next-pwa)
Ensure PWA manifest and service worker are configured for offline support.

## Styling
- **Tailwind CSS**: Utility-first approach.
- **Shadcn UI / Radix UI**: Accessible component primitives.
- **Framer Motion**: Smooth transitions and micro-animations.
