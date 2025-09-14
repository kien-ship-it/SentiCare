Of course. Here is a design guideline distilled from the style of the provided UI, adapted to use your specified color palette.

This design system is clean, professional, and data-focused. It leverages generous whitespace, soft-edged containers, and a clear visual hierarchy to create a user experience that feels both modern and intuitive. The style prioritizes clarity and effortless navigation.

### Color Palette

The provided palette is a high-contrast combination of clean whites and vibrant yellows. We'll use a bright white base with the yellows as powerful accents for calls-to-action and key data points.

| Color | Hex | Role |
| :--- | :--- | :--- |
| | `#FFFFFF` | **Primary Background:** Pure white used for the main app background to create a clean, bright interface. |
| | `#F8F9FA` | **Secondary Background:** Slightly off-white used for primary containers and cards to create subtle depth. |
| | `#E9ECEF` | **Interactive / Accent:** Used for secondary buttons, hover states, and subtle highlights. |
| | `#ffc300` | **Primary Accent:** The main call-to-action color. Used for primary buttons, active states, and important data visualization. |
| | `#ffd60a` | **Secondary Accent:** Used for highlights, tags, and secondary data points to add visual interest. |
| | `#212529` | **Primary Text:** Dark gray for all primary headings and body text for maximum readability. |
| | `#6C757D` | **Secondary Text:** A medium gray for subtitles, helper text, and disabled states. |

---

### Typography

The typography is clean and modern, using a sans-serif font to ensure readability. A clear hierarchy is established through variations in weight and size.

**Font Family:** Poppins (or a similar geometric sans-serif like Inter or Gilroy)

| Element | Font Weight | Font Size | Color | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | Bold | 28px | `#212529` | **Income Tracker** |
| **Heading 2** | SemiBold | 20px | `#212529` | **Your Recent Projects** |
| **Large Data** | SemiBold | 36px | `#212529` | **+20%** |
| **Body / Title** | Medium | 16px | `#212529` | Randy Gouse |
| **Body (Small)** | Regular | 14px | `#6C757D` | This project involves implementing... |
| **Label / Tag** | Medium | 12px | `#FFFFFF` | Senior |
| **Button** | SemiBold | 16px | `#212529` | Upgrade now |

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

The primary containers for content. They sit on the main background, creating a subtle layered effect.

*   **Background Color:** `#FFFFFF`
*   **Border:** 1px solid `#E9ECEF`
*   **Border Radius:** 16px
*   **Box Shadow:** 0 4px 20px rgba(0, 0, 0, 0.05)
*   **Padding:** 24px

#### **Buttons**

*   **Primary Button:** Used for main actions like "Upgrade now."
    *   **Background:** `#ffc300`
    *   **Text Color:** `#212529`
    *   **Border Radius:** 12px
    *   **Padding:** 12px 24px
    *   **Hover State:** Slightly desaturated background (`#e6b000`) or a subtle scale-up transform.
*   **Icon Button:** For simple actions like adding a connection.
    *   **Background:** `#F8F9FA`
    *   **Icon Color:** `#6C757D`
    *   **Border:** 1px solid `#E9ECEF`
    *   **Border Radius:** 50% (circular)
    *   **Hover State:** Background becomes `#E9ECEF`.

#### **Tags & Badges**

Used to display status or categories (e.g., "Paid", "Senior").

*   **Background:** `#ffc300` or `#ffd60a`
*   **Text Color:** `#212529`
*   **Border Radius:** 8px
*   **Padding:** 4px 12px
*   **Font Size:** 12px
*   **Border:** 1px solid rgba(0, 0, 0, 0.1)

#### **Inputs**

*   **Search Bar:**
    *   **Background:** `#FFFFFF`
    *   **Border:** 1px solid `#E9ECEF`
    *   **Text Color:** `#212529`
    *   **Placeholder Text Color:** `#6C757D`
    *   **Border Radius:** 12px
    *   **Focus State:** Border color `#ffc300`, box shadow with yellow tint

#### **Data Visualization**

Charts should be minimal and easy to read.

*   **Chart Background:** `#FFFFFF`
*   **Chart Lines/Grid:** A light gray (`#E9ECEF`)
*   **Data Points (Inactive):** `#6C757D`
*   **Data Points (Active/Selected):** `#ffc300`
*   **Bar Chart Colors:** Use variations of the accent colors (`#ffc300`, `#ffd60a`) to represent different data sets.
*   **Axis Labels:** `#6C757D`
*   **Legend Text:** `#212529`

---

### Iconography

Icons should be minimalist and consistent. A line-art style is preferred to maintain the clean aesthetic.

*   **Style:** Outlined / Line-based
*   **Recommended Set:** Feather Icons, Phosphor Icons, or Material Symbols (Outlined).
*   **Color:** `#6C757D` for standard icons, `#212529` for active or emphasized icons.
*   **Size:** 20px-24px.
*   **Hover State:** `#ffc300` for interactive icons

---

## Main Dashboard (Senticare)

This section translates the requirements into a concrete layout spec, component breakdown, and implementation notes. Use the Donezo template only as visual inspiration; follow Senticare colors, spacing, and component rules above.

### High-level Layout

*   **Top Row (Header):** A conceptual row containing three main components horizontally arranged.
    *   **Top-left:** Senticare wordmark/logo inside a rounded container.
    *   **Top-center:** A container displaying camera status (e.g., "12/15 Cameras Online").
    *   **Top-right:** A rounded profile container with a bell icon, user name, and phone number.
*   **Left Column (overlay):** A vertical menu inside a rounded container, floating on top of the main content area.
    *   Home (house icon)
    *   Analytics (chart/graph icon)
*   **Right Column (overlay):** A floating "Quick Analytics" container on the right side, also on top of the main content.
*   **Main Content Area (background):** The base layer, reserved for the floor map, patient cards, etc.

### Page Grid

*   **Outer max width:** 1440px; centered with `margin: 0 auto;` and `padding: 24px`.
*   **Grid:** CSS grid with two columns: `sidebar 280px | content 1fr`.
*   **Row 1:** Header row for the profile container (spans the content column), height 88px.
*   **Row 2+:** Scrollable main content.

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ [Sidebar (logo + nav) 280px] | [Top-right Profile Card spanning →]       │
├───────────────────────────────────────────────────────────────────────────┤
│ [Sidebar (nav)]               | [Main content area]                       │
└───────────────────────────────────────────────────────────────────────────┘
```

### ASCII Wireframe

This wireframe illustrates the updated layout with the new header and floating side panel.

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐   ┌──────────────────────────┐                      ┌───────────────────────────────────────────┐ │
│ │  Senticare   │   │ [ 📷 12/15 Cams Online ] │                      │ [ 🔔 ] [ 🧑 Totok Michael / 555-123-456 ]   │ │
│ └──────────────┘   └──────────────────────────┘                      └───────────────────────────────────────────┘ │
│ ┌──────────────┐ ┌────────────────────────────────────────────────────────────────────────────────┐ ┌────────────┐ │
│ │ MENU         │ │                                                                                │ │ Quick      │ │
│ │ • Home       │ │                                                                                │ │ Analytics  │ │
│ │ • Analytics  │ │                                                                                │ │ • Alerts: 2│ │
│ │              │ │                                                                                │ │ • Occupancy│ │
│ │              │ │      [c]                                                                       │ │   87%      │ │
│ │              │ │                  FLOOR PLAN AREA (BACKGROUND)                                    │ │            │ │
│ │              │ │                                                                                │ │            │ │
│ │              │ │                                                                                │ │            │ │
│ │              │ │                                     [c]                                        │ │            │ │
│ │              │ │                                                                                │ │            │ │
│ │              │ │                                                                                │ │            │ │
│ │              │ │   [c]                                                                          │ │            │ │
│ │              │ │                                                                                │ │            │ │
│ │              │ │                                                                                │ │            │ │
│ └──────────────┘ │                                                                                │ └────────────┘ │
│                  └────────────────────────────────────────────────────────────────────────────────┘                │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [ Floor 3 — Patients: A, B, C ]                                                                                │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Containers & Tokens

*   **Sidebar container:**
    *   Background: `#ffffff`
    *   Border: 1px solid `#e9ecef`
    *   Box Shadow: var(--shadow-sm)
    *   Radius: 16px (outer), 12px for internal elements
    *   Padding: 24px
    *   Gap between logo and menu: 24px
*   **Profile container (header card):**
    *   Background: `#ffffff`
    *   Border: 1px solid `#e9ecef`
    *   Box Shadow: var(--shadow-sm)
    *   Radius: 16px
    *   Height: 88px; Padding: 16px 24px
    *   Layout: horizontal flex, items centered, content aligned to right edge
*   **Avatar:** 44px circle; fallback initials; 2px border `#003566` on dark bg
*   **Bell icon button:** 36px circle; background `#f8f9fa`; icon color `#6c757d`; border: 1px solid `#e9ecef`; hover background `#e9ecef`
*   **Text block:**
    *   Name: 16px, Medium, `#212529`
    *   Phone: 14px, Regular, `#6c757d`
*   **Camera Status container:**
    *   Background: `#ffffff`
    *   Border: 1px solid `#e9ecef`
    *   Box Shadow: var(--shadow-sm)
    *   Radius: 16px
    *   Padding: 16px 24px
    *   Text: 14px, Medium, `#6c757d`
    *   Icon: 20px, `#6c757d`
*   **Quick Analytics container (floating):**
    *   Background: `rgba(255, 255, 255, 0.9)`
    *   Border: 1px solid `#e9ecef`
    *   Box Shadow: var(--shadow-md)
    *   Backdrop Filter: `blur(8px)`
    *   Radius: 16px
    *   Padding: 24px

### Interactivity

*   **Floor Plan:**
    *   The main floor plan area will be an interactive canvas.
    *   Users can zoom in and out using mouse wheel or pinch gestures.
    *   Users can pan the view by clicking and dragging.
*   **Camera Indicators `[c]`:**
    *   These are represented as small, non-intrusive icons or boxes on the floor plan.
    *   On `hover`, a floating container (popover/tooltip) will appear near the indicator.
    *   This container will display key data for that camera: e.g., Camera ID, Status (Online/Offline), current patient in view, and a thumbnail of the live feed.
    *   The floating container will follow the style of a standard Card (`background: #001d3d`, `radius: 16px`, etc.) but with a smaller footprint.

### Navigation (vertical)

*   Item height: 44px; icon 24px; text 16px
*   Active state: left accent bar 4px in `#ffc300`; text `#FFFFFF`; container bg `rgba(255,255,255,0.06)`; radius 12px
*   Hover: background `rgba(255,255,255,0.04)`; icon/text `#FFFFFF`

### Responsive Behavior

*   ≥1200px: layout as defined.
*   992–1199px: sidebar width reduces to 240px.
*   768–991px: collapse menu labels; show icons only (56px wide rail). Tooltip on hover.
*   <768px: sidebar becomes a slide-in drawer; profile card stacks name/phone under avatar; bell remains to the left.

### Suggested React Structure

*   `senticare/src/components/layout/Sidebar.jsx`
    *   `Logo` (uses app mark or text)
    *   `NavItem` x2: Home, Analytics
*   `senticare/src/components/layout/ProfileHeader.jsx`
    *   `IconButton` (bell)
    *   `UserMeta` (name + phone)
    *   `Avatar`
*   `senticare/src/pages/Dashboard.jsx` — composes `Sidebar`, `ProfileHeader`, and main content children.

### Example CSS Variables

Place in `:root` or a theme file and reference across components.

```css
:root {
  --bg-app: #ffffff;
  --bg-card: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-accent: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --accent-primary: #ffc300;
  --accent-secondary: #ffd60a;
  --border-color: #e9ecef;
  --radius-lg: 16px;
  --radius-md: 12px;
  --space-1: 8px;   /* 1x */
  --space-2: 16px;  /* 2x */
  --space-3: 24px;  /* 3x */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

### Accessibility

*   All interactive elements must have visible focus (`outline: 2px solid #ffd60a` on focus).
*   Nav items are reachable via keyboard (arrow keys) and have `aria-current="page"` when active.
*   Bell icon has `aria-label="Notifications"` and `role="button"`.
*   Avatar includes `alt` text; if initials used, include `aria-label` with user name.

### Data & Placeholders

*   If user data is unavailable, show a skeleton state in the profile container and default menu icons.
*   Phone format E.164 or localized; truncate with ellipsis if overflow.

### Deliverables Checklist

*   Sidebar with logo + two items inside rounded container
*   Profile header with bell, name, phone, avatar (rightmost)
*   Responsive states as specified
*   Tokens and colors from this guideline only