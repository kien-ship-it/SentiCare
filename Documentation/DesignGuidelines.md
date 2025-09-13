Of course. Here is a design guideline distilled from the style of the provided UI, adapted to use your specified color palette.

This design system is clean, professional, and data-focused. It leverages generous whitespace, soft-edged containers, and a clear visual hierarchy to create a user experience that feels both modern and intuitive. The style prioritizes clarity and effortless navigation.

### Color Palette

The provided palette is a high-contrast combination of deep blues and vibrant yellows. We will adapt the light-themed UI into a striking dark mode, using the blues for backgrounds and the yellows as powerful accents for calls-to-action and key data points.

| Color | Hex | Role |
| :--- | :--- | :--- |
| | `#000814` | **Primary Background:** The darkest shade, used for the main app background to create depth. |
| | `#001d3d` | **Secondary Background:** Used for primary containers and cards to lift them off the main background. |
| | `#003566` | **Interactive / Accent:** Used for secondary buttons, hover states, and subtle highlights. |
| | `#ffc300` | **Primary Accent:** The main call-to-action color. Used for primary buttons, active states, and important data visualization. |
| | `#ffd60a` | **Secondary Accent:** Used for highlights, tags, and secondary data points to add visual interest. |
| | `#FFFFFF` | **Primary Text:** (Added for legibility) Used for all primary headings and body text. |
| | `#CED4DA` | **Secondary Text:** (Added for legibility) A light gray for subtitles, helper text, and disabled states. |

---

### Typography

The typography is clean and modern, using a sans-serif font to ensure readability. A clear hierarchy is established through variations in weight and size.

**Font Family:** Poppins (or a similar geometric sans-serif like Inter or Gilroy)

| Element | Font Weight | Font Size | Color | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | Bold | 28px | `#FFFFFF` | **Income Tracker** |
| **Heading 2** | SemiBold | 20px | `#FFFFFF` | **Your Recent Projects** |
| **Large Data** | SemiBold | 36px | `#FFFFFF` | **+20%** |
| **Body / Title** | Medium | 16px | `#FFFFFF` | Randy Gouse |
| **Body (Small)** | Regular | 14px | `#CED4DA` | This project involves implementing... |
| **Label / Tag** | Medium | 12px | `#000814` | Senior |
| **Button** | SemiBold | 16px | `#000814` | Upgrade now |

---

### Layout & Spacing

The layout is built on a foundation of ample whitespace, creating a calm and organized interface. A consistent spacing system based on an 8px grid should be used.

*   **Base Unit:** 8px
*   **Container Padding:** 24px (3x base unit)
*   **Gaps Between Cards:** 24px (3x base unit)
*   **Intra-element Spacing:** 16px (2x base unit) for spacing between titles and content within a card.
*   **Small Gaps:** 8px (1x base unit) for spacing between tags or icons and their text.

---

### Components

Key UI elements are defined by soft corners, subtle depth, and clear states.

#### **Cards**

The primary containers for content. They sit on the main background, creating a layered effect.

*   **Background Color:** `#001d3d`
*   **Border Radius:** 16px
*   **Box Shadow:** None (depth is created by the background color difference)
*   **Padding:** 24px

#### **Buttons**

*   **Primary Button:** Used for main actions like "Upgrade now."
    *   **Background:** `#ffc300`
    *   **Text Color:** `#000814`
    *   **Border Radius:** 12px
    *   **Padding:** 12px 24px
    *   **Hover State:** Slightly desaturated background (`#e6b000`) or a subtle scale-up transform.

*   **Icon Button:** For simple actions like adding a connection.
    *   **Background:** `rgba(255, 255, 255, 0.1)` or `#003566`
    *   **Icon Color:** `#FFFFFF`
    *   **Border Radius:** 50% (circular)
    *   **Hover State:** Background becomes `#003566`.

#### **Tags & Badges**

Used to display status or categories (e.g., "Paid", "Senior").

*   **Background:** `#ffc300` or `#ffd60a`
*   **Text Color:** `#000814`
*   **Border Radius:** 8px
*   **Padding:** 4px 12px
*   **Font Size:** 12px

#### **Inputs**

*   **Search Bar:**
    *   **Background:** `#001d3d`
    *   **Border:** 1px solid `#003566`
    *   **Text Color:** `#FFFFFF`
    *   **Placeholder Text Color:** `#CED4DA`
    *   **Border Radius:** 12px

#### **Data Visualization**

Charts should be minimal and easy to read.

*   **Chart Lines/Grid:** A faint, light gray (`#CED4DA` with low opacity)
*   **Data Points (Inactive):** `#003566`
*   **Data Points (Active/Selected):** `#ffc300`
*   **Bar Chart Colors:** Use variations of the accent colors (`#ffc300`, `#ffd60a`) to represent different data sets.

---

### Iconography

Icons should be minimalist and consistent. A line-art style is preferred to maintain the clean aesthetic.

*   **Style:** Outlined / Line-based
*   **Recommended Set:** Feather Icons, Phosphor Icons, or Material Symbols (Outlined).
*   **Color:** `#CED4DA` for standard icons, `#FFFFFF` for active or emphasized icons.
*   **Size:** 20px-24px.

---

## Main Dashboard (Senticare)

This section translates the requirements into a concrete layout spec, component breakdown, and implementation notes. Use the Donezo template only as visual inspiration; follow Senticare colors, spacing, and component rules above.

### High-level Layout
*  **Top-left:** Senticare wordmark/logo inside a rounded container.
*  **Left column (below logo):** A vertical menu inside the same rounded container with two items:
     *  Home (house icon)
     *  Analytics (chart/graph icon)
*  **Top-right:** A rounded profile container spanning toward center-left containing:
     *  Rightmost: circular user avatar.
     *  To the left of avatar: user name (row 1) and phone number (row 2).
     *  Immediately to the left of the name/phone block: a bell icon inside a circular icon button.
*  **Main content area:** Reserved for floor map, patient cards, or analytics panels. Not covered in this spec.

### Page Grid
*  **Outer max width:** 1440px; centered with `margin: 0 auto;` and `padding: 24px`.
*  **Grid:** CSS grid with two columns: `sidebar 280px | content 1fr`.
*  **Row 1:** Header row for the profile container (spans the content column), height 88px.
*  **Row 2+:** Scrollable main content.

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ [Sidebar (logo + nav) 280px] | [Top-right Profile Card spanning →]       │
├───────────────────────────────────────────────────────────────────────────┤
│ [Sidebar (nav)]               | [Main content area]                       │
└───────────────────────────────────────────────────────────────────────────┘
```

### Containers & Tokens
*  **Sidebar container:**
     *  Background: `#001d3d`
     *  Radius: 16px (outer), 12px for internal elements
     *  Padding: 24px
     *  Gap between logo and menu: 24px
*  **Profile container (header card):**
     *  Background: `#001d3d`
     *  Radius: 16px
     *  Height: 88px; Padding: 16px 24px
     *  Layout: horizontal flex, items centered, content aligned to right edge
*  **Avatar:** 44px circle; fallback initials; 2px border `#003566` on dark bg
*  **Bell icon button:** 36px circle; background `rgba(255,255,255,0.08)`; icon color `#CED4DA`; hover background `#003566`
*  **Text block:**
     *  Name: 16px, Medium, `#FFFFFF`
     *  Phone: 14px, Regular, `#CED4DA`

### Navigation (vertical)
*  Item height: 44px; icon 24px; text 16px
*  Active state: left accent bar 4px in `#ffc300`; text `#FFFFFF`; container bg `rgba(255,255,255,0.06)`; radius 12px
*  Hover: background `rgba(255,255,255,0.04)`; icon/text `#FFFFFF`

### Responsive Behavior
*  ≥1200px: layout as defined.
*  992–1199px: sidebar width reduces to 240px.
*  768–991px: collapse menu labels; show icons only (56px wide rail). Tooltip on hover.
*  <768px: sidebar becomes a slide-in drawer; profile card stacks name/phone under avatar; bell remains to the left.

### Suggested React Structure
*  `senticare/src/components/layout/Sidebar.jsx`
     *  `Logo` (uses app mark or text)
     *  `NavItem` x2: Home, Analytics
*  `senticare/src/components/layout/ProfileHeader.jsx`
     *  `IconButton` (bell)
     *  `UserMeta` (name + phone)
     *  `Avatar`
*  `senticare/src/pages/Dashboard.jsx` — composes `Sidebar`, `ProfileHeader`, and main content children.

### Example CSS Variables
Place in `:root` or a theme file and reference across components.
```css
:root {
  --bg-app: #000814;
  --bg-card: #001d3d;
  --bg-accent: #003566;
  --text-primary: #ffffff;
  --text-secondary: #ced4da;
  --accent-primary: #ffc300;
  --accent-secondary: #ffd60a;
  --radius-lg: 16px;
  --radius-md: 12px;
  --space-1: 8px;   /* 1x */
  --space-2: 16px;  /* 2x */
  --space-3: 24px;  /* 3x */
}
```

### Accessibility
*  All interactive elements must have visible focus (`outline: 2px solid #ffd60a` on focus).
*  Nav items are reachable via keyboard (arrow keys) and have `aria-current="page"` when active.
*  Bell icon has `aria-label="Notifications"` and `role="button"`.
*  Avatar includes `alt` text; if initials used, include `aria-label` with user name.

### Data & Placeholders
*  If user data is unavailable, show a skeleton state in the profile container and default menu icons.
*  Phone format E.164 or localized; truncate with ellipsis if overflow.

### Deliverables Checklist
*  Sidebar with logo + two items inside rounded container
*  Profile header with bell, name, phone, avatar (rightmost)
*  Responsive states as specified
*  Tokens and colors from this guideline only