# Bundle Optimization Guide

This document outlines the strategies implemented to optimize bundle sizes and deployment process in the Monkey-One application.

## Recent Deployment Optimizations (March 2025)

The following optimizations were recently implemented to address build warnings, security issues, and performance bottlenecks:

### Security Enhancements

1. **Calculator Tool Safety**: Replaced unsafe use of `eval` in the calculator tool with a safer mathematics expression evaluator pattern that uses restricted contexts and function arguments.

   - Modified: `/src/lib/ai/streaming.ts`
   - Benefit: Prevents code injection attacks while maintaining functionality

2. **Input Sanitization**: Added proper sanitization for user inputs that could potentially contain malicious code.
   - Example: Mathematical expressions are now filtered to only allow expected characters
   - Benefit: Reduces the attack surface for code injection

### Build Process Optimizations

1. **Vite Build Configuration**: Enhanced the Vite build configuration to optimize chunk sizes and improve loading performance.

   - Modified: `/vite.config.ts`
   - Changes:
     - Increased chunk size warning limit to 1200KB
     - Added React optimization configurations
     - Improved visualization settings for production builds

2. **Code Splitting**: Implemented better code splitting for dynamic imports to reduce initial load times.

   - Modified: `/src/routes.tsx`
   - Changes:
     - Updated lazy-loading pattern to properly handle various module export formats
     - Grouped related components into logical chunks

3. **Vercel Deployment**: Fixed duplicate build issues in Vercel deployment.

   - Modified: `/vercel.json`, `/package.json`
   - Changes:
     - Ensured build command only runs once
     - Set proper command chaining for verification

4. **Environment Management**: Added appropriate conditional environment handling for development vs production.
   - Modified: `/package.json`
   - Changes:
     - Husky Git hooks now only run in development environments
     - Proper handling of environment variables

## Original Bundle Size Improvements

The application was previously optimized to reduce large JavaScript chunks and improve loading performance. The main strategies implemented were:

### 1. Granular Code Splitting

- Implemented advanced manual chunking in `vite.config.ts` to separate dependencies based on their usage patterns:
  - Core framework libraries (React, React DOM, React Router)
  - UI component libraries (Radix UI components)
  - AI/ML libraries (TensorFlow, Transformers)
  - Utilities and state management
  - Feature-specific modules (agents, chat, tools)

### 2. Dynamic Imports

- Added dynamic imports with React.lazy for various components:
  - Authentication providers
  - UI Components like Sidebar and LoadingOverlay
  - Feature components that aren't needed on initial load

### 3. Config Optimizations

- Set appropriate bundling options:
  - Targeted modern browsers (ES2020)
  - Limited asset inlining to 10KB
  - Enabled code compression (gzip and brotli)
  - Optimized code generation with modern JS features
  - Enhanced tree-shaking and duplicate detection

### 4. Lazy Loading Framework

- Created `loadableChunks.ts` to provide an organized way to lazy-load dependencies
- Implemented route-based preloading to fetch chunks based on user navigation

## Bundle Analysis

Used Rollup Visualizer to identify large dependencies and determine optimal splitting strategies. The stats.html file provides a treemap visualization of bundle sizes.

## Future Optimization Strategies

### For Immediate Implementation

1. **AI Library Splitting**: Move large AI libraries into separate dynamic chunks that load only when needed:

   - `@tensorflow/tfjs` and related packages
   - `@xenova/transformers`
   - `@huggingface/inference`

2. **Tree-Shaking Improvements**: Review imports of large libraries to ensure only needed functions are imported:

   ```javascript
   // Avoid:
   import * as TensorFlow from '@tensorflow/tfjs'

   // Prefer:
   import { specificFunction } from '@tensorflow/tfjs/specificModule'
   ```

3. **Performance Monitoring**: Add regular bundle analysis to CI/CD pipeline to catch size increases early:
   ```json
   "scripts": {
     "analyze": "vite build --mode analyze"
   }
   ```

### Medium-Term Improvements

1. **Implement Import on Visibility**: Defer loading components until they're in or near the viewport

2. **Dynamic Feature Flags**: Conditionally load features based on user permissions or preferences

3. **Progressive Enhancement**: Provide basic functionality first, then enhance with additional features as resources load

4. **Server Components**: Consider moving more logic to the server where applicable

5. **Bundle Differential Loading**: Deliver different bundle sets based on browser capabilities

### Long-Term Architecture Improvements

1. **Service Worker Implementation**: Add a service worker for:

   - Offline access to core functionality
   - Caching of static assets
   - Background prefetching of likely-needed resources

2. **Module Federation**: Consider Webpack Module Federation or similar approaches to load components independently

3. **Web Vitals Optimization**: Dedicated focus on optimizing Core Web Vitals:
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

## Monitoring and Analysis

### Current Monitoring Approach

Regularly review bundle sizes with:

```bash
npm run build
```

The visualizer will generate `stats.html` which can be opened to analyze bundle composition and identify new optimization opportunities.

### Enhanced Monitoring Recommendations

1. **Automated Bundle Analysis**: Add bundle size checking to CI/CD pipeline:

   ```bash
   # Example using budgets in a CI script
   npm run build
   npx bundlesize
   ```

2. **Web Vitals Tracking**: Implement tracking for Core Web Vitals:

   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

3. **Error Rate Monitoring**: Track JavaScript errors in relation to deployment changes

4. **Chunk Loading Analysis**: Monitor which chunks are loaded most frequently and prioritize their optimization

5. **Performance Dashboards**: Create dashboards in monitoring tools to track long-term trends in load times and bundle sizes

## Benchmarks

| Metric              | Before March 2025 | After March 2025 | Improvement |
| ------------------- | ----------------- | ---------------- | ----------- |
| Main Chunk Size     | 1,376.67 KB       | To be measured   | -           |
| Initial Load Time   | Not measured      | To be measured   | -           |
| Time to Interactive | Not measured      | To be measured   | -           |
| Build Time          | ~2 minutes        | To be measured   | -           |

---

_Last updated: March 2025_
