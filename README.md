# Phoenix Scientific Publication Center

## Overview
The Phoenix Scientific Publication Center is a comprehensive platform for managing scientific publications, from submission to publication. This application provides a responsive design that works seamlessly across all device sizes.

## Responsive Design Features

### Breakpoint System
We've implemented a comprehensive 6-breakpoint system:
- **xs (Extra Small)**: 0px - 479px (Mobile phones)
- **sm (Small)**: 480px - 767px (Large mobile phones)
- **md (Medium)**: 768px - 1023px (Tablets)
- **lg (Large)**: 1024px - 1279px (Small desktops/laptops)
- **xl (Extra Large)**: 1280px - 1535px (Desktops)
- **2xl (2X Large)**: 1536px+ (Large desktops)

### Key Responsive Components

#### Grid System
- Responsive grid layouts using CSS Grid and Flexbox
- Components automatically adjust column count based on screen size
- Custom grid classes for each breakpoint

#### Typography
- Font sizes scale appropriately across devices
- Headings and body text optimized for readability on all screen sizes

#### Buttons
- Touch-friendly minimum sizes (44px) for mobile devices
- Proper spacing and padding adjustments for different screen sizes

#### Form Elements
- Input fields, selects, and textareas have appropriate heights for touch interaction
- Labels and form elements stack vertically on mobile for better usability

#### Tables
- Horizontal scrolling on small screens to accommodate wide tables
- Adjusted padding and font sizes for better mobile readability

#### Cards
- Flexible card layouts that stack on mobile and arrange in grids on larger screens
- Appropriate padding and margins for each device size

### Development
To run the application locally:
```bash
npm install
npm run dev
```

The application will be available at http://localhost:5173

### Technologies Used
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Responsive CSS for custom breakpoints
- React Router for navigation

### Responsive CSS Implementation
The responsive design is implemented through:
1. `src/responsive.css` - Main responsive stylesheet with all breakpoint definitions
2. `tailwind.config.js` - Tailwind configuration with custom breakpoints and theme
3. `postcss.config.js` - PostCSS configuration for Tailwind processing
4. Custom CSS classes for admin components with responsive behavior

For detailed information about the responsive design implementation, see [RESPONSIVE_DESIGN_SUMMARY.md](RESPONSIVE_DESIGN_SUMMARY.md).