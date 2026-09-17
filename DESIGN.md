---
name: Obsidian Noir
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#e6bdb8'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#ac8884'
  outline-variant: '#5c403c'
  surface-tint: '#ffb4ab'
  primary: '#ffb4ab'
  on-primary: '#690005'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#bf0715'
  secondary: '#ffb4ab'
  on-secondary: '#690005'
  secondary-container: '#a0010d'
  on-secondary-container: '#ffa99f'
  tertiary: '#ffb3ad'
  on-tertiary: '#65080d'
  tertiary-container: '#bf4c47'
  on-tertiary-container: '#fff6f5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000b'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#852221'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display:
    fontFamily: Playfair Display
    fontSize: 4.5rem
    fontWeight: '600'
    lineHeight: '1.05'
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Playfair Display
    fontSize: 2.75rem
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 3rem
    fontWeight: '500'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 2rem
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 2rem
    fontWeight: '500'
    lineHeight: '1.25'
    letterSpacing: 0em
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 1.5rem
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: 0.01em
  title:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '300'
    lineHeight: '1.7'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.15em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.2em
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a dark gothic luxury editorial style, merging classic high-contrast drama with architectural, technical precision. It caters to avant-garde portfolios, luxury creative studios, and high-end artisanal craftsmanship that demand an uncompromising, brooding presence. 

The emotional signature is austere, mysterious, and authoritative. Visuals rely on absolute darkness, razor-sharp geometric discipline, and deliberate moments of intense blood crimson illumination. The interface rejects soft or casual conventions in favor of monumental typographic scale, editorial framing, and surgical precision.

## Colors

The palette is rooted in an abyss of obsidian and pitch blacks, accented with precise strikes of blood crimson and balanced by cool ash-silver typography.

- **Primary (`#dc2626`)**: The primary blood crimson accent. Used for critical interactive triggers, glowing active states, focal borders, and high-impact editorial motifs.
- **Secondary (`#b91c1c`)**: Deep arterial crimson. Used for secondary highlights, hovered boundaries, and gradient anchor points.
- **Tertiary (`#7f1d1d`)**: Subdued dried-blood burgundy. Used for low-contrast structural accents, subtle glowing underlays, and active surface fills.
- **Neutral (`#0a0a0c`)**: Obsidian base. Serves as the deep canvas upon which layers of `#050505` (void black) and `#121216` (elevated obsidian) build planar depth.
- **Typography & Details**: Primary text uses pale silver (`#e4e4e7`), secondary text transitions to muted ash gray (`#a1a1aa`), and borders sit in low-key charcoal-smoke tones (`#27272a`) with crimson edge highlights.

## Typography

Typography stages a deliberate tension between the poetic, high-contrast serif flourishes of Playfair Display and the clinical, structural clarity of Inter.

- **Headlines (Playfair Display)**: Set with classical luxury and dramatic vertical emphasis. Used for heroic portfolio intros, project titles, and monumental pull quotes. Tighter letter spacing on display scales evokes traditional editorial titling.
- **Body & Captions (Inter)**: Built for neutral, high-legibility storytelling across dense descriptions, metadata, and technical lists. Set predominantly at light and regular weights with generous leading to maintain breathing room against pitch-black backgrounds.
- **Labels & Overlines (Inter)**: Set strictly uppercase with wide tracking (`0.15em` to `0.2em`) to function as precision architectural markers across the dark space.

## Layout & Spacing

The layout adopts an architectural grid system that emphasizes sweeping horizontal frames, disciplined vertical columns, and distinct planar divisions.

- **Grid Architecture**: 12 columns on desktop (`margin: 3rem`, `gutter: 1.5rem`), transitioning to 6 columns on tablet and 4 columns on mobile (`margin: 1.25rem`, `gutter: 1rem`).
- **Framing & Rhythms**: Containers sit flush with explicit hairline borders rather than floating islands. Layouts rely on structural hairline dividers (`1px solid #1f1f24`) to section portfolio categories, project case studies, and editorial galleries.
- **Content Flow**: Asymmetrical spans are encouraged (e.g., an 8-column wide image paired with a 4-column column of metadata and narrative prose) to sustain an editorial gallery cadence.

## Elevation & Depth

Visual hierarchy is forged through layered dark glass surfaces, razor-sharp hairline borders, and localized crimson rim backlights.

- **Surface Tiers**:
  - **Ground (Base)**: `#050505` to `#0a0a0c` solid obsidian.
  - **Tier 1 (Panels & Cards)**: Semi-translucent obsidian glass (`rgba(10, 10, 12, 0.75)`) with an integrated backdrop blur (`blur(16px)`).
  - **Tier 2 (Overlays & Drawers)**: High-density obsidian (`rgba(18, 18, 22, 0.85)`) with `blur(24px)`.
- **Rim Lighting & Borders**: Elevation avoids muddy, diffuse drop shadows. Instead, depth is defined by:
  - Micro-thin borders: `1px solid rgba(255, 255, 255, 0.07)`.
  - Crimson Rim Glow: Focused elements feature top-edge or accent-side borders (`1px solid #dc2626`) paired with directional outer glow (`box-shadow: 0 0 24px -4px rgba(220, 38, 38, 0.35)`).
  - Active states cast a blood-tinted ambient halo (`0 8px 32px rgba(220, 38, 38, 0.2)`).

## Shapes

The shape system is strictly non-rounded (`0px` border-radius universally). Every card, dialog, interactive button, input, and media viewport maintains absolute 90-degree corners. 

This absolute square geometry echoes brutalist stonework, fine-art black mats, and architectural monoliths. Interactive transitions must maintain this crisp edge, avoiding any pill shapes, rounded chips, or soft circular outlines.

## Components

### Buttons
- **Primary**: Solid crimson fill (`#dc2626`), sharp corners (`0px`), text in pure ash white (`#ffffff`) using `label-md` tracking. Hover state increases brightness to `#ef4444` and casts a focused neon aura (`box-shadow: 0 0 20px rgba(220, 38, 38, 0.5)`).
- **Secondary / Ghost**: Obsidian glass background (`rgba(10, 10, 12, 0.8)`), bounded by a `1px` border in `#27272a`. Hover transitions the border to `#dc2626` and introduces an internal crimson rim highlight along the upper border edge.
- **Editorial Text Button**: Underlined with a crimson hairline `1px` rule displaced by `4px`. On hover, the line expands horizontally with high-velocity easing.

### Cards & Exhibition Frames
- Rendered in dark translucent glass (`rgba(12, 12, 15, 0.7)`) backed by a structural `1px` border (`#1c1c21`).
- Media images inside cards are desaturated to near monochrome by default, blooming into full tonal contrast with a subtle crimson gradient overlay (`linear-gradient(to top, rgba(10, 10, 12, 0.95), transparent)`) on hover.
- Top rim contains an optional `1px` directional highlight in `#dc2626` on active or featured items.

### Chips & Metadata Tags
- Monolithic rectangular badges (`0px` radius) with `space-xs` vertical and `space-sm` horizontal padding.
- Surface: `#121216` border with `1px solid #27272a`. Typography: `label-sm` in `#a1a1aa`.
- Active state: `#1c0707` background, `#dc2626` border, `#fca5a5` text.

### Input Fields
- Flush bottom-bordered or clean rectangular boxed fields in `#0a0a0c`.
- Inactive border: `1px solid #27272a`. Typography: `body-md` in `#e4e4e7`. Placeholder text in `#52525b`.
- Focus state: Border turns `#dc2626`, accompanied by an internal edge glow (`box-shadow: inset 0 -1px 0 0 #dc2626`).

### Checkboxes & Radio Controls
- Geometric square indicators (`0px` radius).
- Unchecked: `1px solid #3f3f46` over `#050505`.
- Checked: `#dc2626` border with a centered, razor-sharp solid crimson square core. Radios also employ inner square insets instead of circles.

### Lists & Case Indexes
- Dividers between list items use hairline rules (`1px solid #1a1a1e`).
- Hovering an index entry expands a left crimson border anchor (`2px solid #dc2626`) and triggers an ambient crimson wash across the background (`linear-gradient(90deg, rgba(220, 38, 38, 0.08) 0%, transparent 100%)`).