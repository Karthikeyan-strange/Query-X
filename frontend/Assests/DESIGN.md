---
name: Logistics Core
colors:
  surface: '#faf9f7'
  surface-dim: '#dbdad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#504441'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f2f1ef'
  outline: '#827470'
  outline-variant: '#d4c3be'
  surface-tint: '#78564d'
  primary: '#1b0703'
  on-primary: '#ffffff'
  primary-container: '#351c15'
  on-primary-container: '#a78177'
  inverse-primary: '#e8bdb1'
  secondary: '#7d5700'
  on-secondary: '#ffffff'
  secondary-container: '#fdb300'
  on-secondary-container: '#694900'
  tertiary: '#00100e'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b2724'
  on-tertiary-container: '#738f8b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#e8bdb1'
  on-primary-fixed: '#2d150e'
  on-primary-fixed-variant: '#5e3f37'
  secondary-fixed: '#ffdeab'
  secondary-fixed-dim: '#ffba30'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5f4100'
  tertiary-fixed: '#cbe9e3'
  tertiary-fixed-dim: '#afccc7'
  on-tertiary-fixed: '#03201d'
  on-tertiary-fixed-variant: '#314c48'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
  ups-gold-bright: '#FFC400'
  success-teal: '#0A8080'
  surface-white: '#FFFFFF'
  text-primary: '#351C15'
  text-secondary: '#595959'
typography:
  display-lg:
    fontFamily: Roboto
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Roboto
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Roboto
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Roboto
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Roboto
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Roboto
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Roboto
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Roboto
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is built upon the pillars of reliability, efficiency, and industrial precision. It reflects a brand that moves the world’s commerce, prioritizing clarity and functional authority over decorative flair. The aesthetic is **Corporate Modern with a hint of Industrial Minimalism**, utilizing structured layouts and high-contrast color pairings to evoke a sense of trust and logistical excellence.

The visual language communicates speed through organized density and stability through a "heavy" grounded color palette. Every element serves a utilitarian purpose, ensuring that complex shipping and tracking data remain accessible and professional.

## Colors

The palette is anchored by the iconic "UPS Brown" (#351C15), which serves as the primary driver for brand recognition, navigation backgrounds, and primary typography. This is balanced by "UPS Gold" (#FFB500), used strategically for primary actions, status alerts, and highlighting critical path information.

- **Primary (Brown):** Used for headers, footers, and high-emphasis containers.
- **Secondary (Gold):** Reserved for call-to-action buttons and interactive highlights.
- **Neutral (Warm Gray):** A soft off-white used for secondary section backgrounds to reduce eye strain compared to pure white.
- **Success (Teal):** Used specifically for "Delivered" statuses and positive logistical confirmations.

## Typography

This design system utilizes **Roboto** for its mechanical yet friendly geometric forms, which align perfectly with the logistical nature of the brand. 

- **Weight Usage:** Bold (700) is used for headers and primary labels to convey authority. Medium (500) is used for sub-navigation and button text. Regular (400) is used for all body copy and instructional text.
- **Hierarchy:** Maintain a strict vertical rhythm. Large display sizes should be reserved for hero sections (e.g., tracking numbers or marketing headlines). 
- **Readability:** Given the data-heavy nature of logistics, line heights are kept generous (1.5x for body) to ensure tracking numbers and addresses are easily scannable.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain a professional, structured appearance, transitioning to a fluid model for mobile devices.

- **Grid:** A 12-column grid is used for desktop (1280px max-width). 
- **Rhythm:** An 8px base unit governs all spacing. Vertical margins between sections should typically be 48px or 64px to allow the "UPS Brown" elements room to breathe.
- **Breakpoints:**
  - Mobile: < 600px (1-column, 16px margins)
  - Tablet: 600px - 1024px (6-column, 24px margins)
  - Desktop: > 1024px (12-column, 40px margins)

## Elevation & Depth

To maintain a grounded and "established" feel, this design system avoids heavy shadows or floating elements. Depth is achieved through **Tonal Layering** and **Low-Contrast Outlines**.

- **Surfaces:** Main content sits on #FFFFFF. Secondary widgets or sidebars use #F2F1EF.
- **Borders:** Use 1px solid strokes in a light gray (#D1D1D1) for card containers. 
- **Shadows:** Only used for "floating" components like dropdown menus or modals. When used, they must be extremely subtle: `0px 4px 12px rgba(53, 28, 21, 0.08)`.
- **Active State:** Interactive elements should use a slight inner shadow or a color shift rather than a lift effect to emphasize stability.

## Shapes

The shape language is **Soft (0.25rem)**, leaning toward the sharper side of the spectrum. This reinforces the "box" and "container" metaphors central to shipping while preventing the UI from feeling overly aggressive or dated.

- **Primary Buttons:** 4px (Soft) corner radius.
- **Input Fields:** 4px corner radius with a 1px border.
- **Cards:** 8px (rounded-lg) for larger dashboard containers to distinguish them from smaller UI widgets.
- **Icons:** Use square-capped strokes rather than rounded terminals to match the systematic aesthetic.

## Components

- **Buttons:** Primary buttons are UPS Gold (#FFB500) with UPS Brown text for maximum visibility. Secondary buttons are UPS Brown with White text. Ghost buttons use a Brown 1px border.
- **Input Fields:** Use a clear label-above-input pattern. Active states should use a 2px UPS Brown border.
- **Tracking Progress Bar:** A custom component using Success Teal (#0A8080) for completed stages and UPS Gold for the "In-Progress" stage.
- **Chips:** Used for package status (e.g., "In Transit", "Delayed"). They should have a neutral background with a bolded UPS Brown label.
- **Cards:** Minimal padding (24px). Header sections of cards should often have a subtle #F2F1EF background to separate them from the card body.
- **Logistics Icons:** Custom iconography for "Warehouse," "Ship," "Track," and "Plane" should utilize consistent 2px stroke weights.