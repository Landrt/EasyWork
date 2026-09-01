---
name: Editorial Professional
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#494740'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#7a776f'
  outline-variant: '#cac6bd'
  surface-tint: '#605e5a'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b18'
  on-primary-container: '#86837f'
  inverse-primary: '#cac6c1'
  secondary: '#006d41'
  on-secondary: '#ffffff'
  secondary-container: '#9af6bc'
  on-secondary-container: '#097346'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f1b14'
  on-tertiary-container: '#898379'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6e2dd'
  primary-fixed-dim: '#cac6c1'
  on-primary-fixed: '#1c1b18'
  on-primary-fixed-variant: '#484743'
  secondary-fixed: '#9af6bc'
  secondary-fixed-dim: '#7fd9a2'
  on-secondary-fixed: '#002110'
  on-secondary-fixed-variant: '#00522f'
  tertiary-fixed: '#eae1d5'
  tertiary-fixed-dim: '#cdc5ba'
  on-tertiary-fixed: '#1f1b14'
  on-tertiary-fixed-variant: '#4b463d'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
  ink: '#1C1B18'
  success-green: '#127749'
  parchment-border: '#E5E1D8'
  clay-accent: '#B8B1A5'
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Fraunces
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Fraunces
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  max-width: 1280px
---

## Brand & Style

The brand identity is built on the concept of "Editorial Professionalism." It moves away from generic SaaS aesthetics—avoiding tech-blue gradients and playful emojis—to establish a tone of serious, expert authority. The goal is to evoke the feeling of a high-end broadsheet newspaper or a bespoke legal brief: trustworthy, meticulous, and definitive.

The design style is a blend of **Minimalism** and **Modern Corporate**, focusing on high-quality typography and intentional whitespace. It prioritizes clarity and density of information (essential for ATS optimization) without sacrificing the premium, tactile feel of a physical document. Every element exists to provide "proof of value," ensuring the candidate feels their career history is being handled with the gravity it deserves.

## Colors

The palette is anchored in warm, organic tones to distinguish the product from cold, sterile competitors. 

- **Primary (Warm Deep Ink):** Used for primary typography, main action buttons, and structural headers. It provides a softer, more sophisticated contrast than pure black.
- **Secondary (Deep Green):** Reserved strictly for "Success Signals." This includes high ATS scores, verified data points, and completion states. By limiting its use, we ensure the color carries significant psychological weight.
- **Background (Warm Off-White):** A "Parchment" base that reduces eye strain and mimics the feel of premium stationery.
- **Accents (Clay/Parchment):** These low-saturation tones are used for structural division, such as card borders and inactive progress segments, maintaining a cohesive, editorial look.

## Typography

The typography strategy relies on a sharp contrast between **Fraunces** (Editorial Serif) and **IBM Plex Sans** (Technical Humanist).

- **Fraunces** is used for storytelling elements: page titles, section headers, and brand moments. It conveys heritage and intellect.
- **IBM Plex Sans** is the workhorse for data entry, CV content, and UI controls. Its technical precision reflects the "ATS-optimized" nature of the product, suggesting that the software is as efficient as it is sophisticated.
- **Usage Note:** Maintain tight tracking on display headlines to emphasize the "Editorial" character. Ensure line lengths for body text do not exceed 70 characters to maintain readability during long CV editing sessions.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the core application to ensure the CV preview remains the centerpiece of the experience.

- **Grid:** A 12-column grid system is used for the Dashboard and Profile Review pages. 
- **The Editor Layout:** Uses a three-pane structural approach on desktop: 
  1. Left (3 cols): Navigation/Structure
  2. Center (6 cols): Document Preview (Fixed width to match A4/Letter ratios)
  3. Right (3 cols): AI Insights/Suggestions.
- **Spacing Rhythm:** Based on a 4px baseline. Use generous vertical spacing (64px+) between major sections on the landing page, but tighter, functional spacing (12px-16px) within the CV Editor to maximize information density.

## Elevation & Depth

To maintain the "Editorial Professional" aesthetic, this design system avoids heavy shadows and floating elements. 

- **Tonal Layers:** Depth is created through surface color shifts (e.g., using a slightly darker parchment tone for the sidebars against the main off-white canvas).
- **Low-Contrast Outlines:** Instead of shadows, use 1px solid borders in `#E5E1D8` (Parchment Border) to define cards and sections. 
- **Interaction Depth:** When an element is active or hovered, transition the border color to `#B8B1A5` (Clay) or add a very subtle 2px "Pressed" inner shadow to simulate a tactile, paper-like quality. 
- **Modals:** Use a high-blur backdrop (8px) with a semi-transparent Deep Ink overlay (opacity 40%) to focus attention without introducing "glowy" modern effects.

## Shapes

The shape language is "Soft" yet disciplined. While contemporary SaaS often uses hyper-rounded "pill" shapes, this design system uses a conservative **4px (0.25rem)** base radius. This reflects professional documents—not quite sharp and aggressive, but not overly casual or "bubbly." 

Large containers like Modals or Main Cards use the `rounded-lg` (8px) setting to provide a hint of modern approachability.

## Components

- **Buttons:** 
  - **Primary:** High-contrast Deep Ink background with Off-White text. Minimum height 44px. Square-ish (4px radius).
  - **Secondary:** Transparent background with a 1px Clay border. 
  - **Success:** Deep Green background, reserved for final submission or "Accept Suggestion" actions.
- **Cards:** No shadows. Defined by 1px borders in `#E5E1D8`. Use a 16px internal padding as standard.
- **Input Fields:** Use a "minimalist desk" approach. 1px bottom border by default, transitioning to a full 1px Deep Ink border on focus. Labels must be `label-sm` (uppercase) for a professional, form-like feel.
- **Progress Bars:** Implement as elegant, 2px thin lines. The "filled" portion uses Deep Ink for general progress and Deep Green once a section is "ATS-optimized."
- **AI Suggestions:** Styled as "Editor's Notes." Use a light clay background with `caption` typography to differentiate AI-generated thoughts from the user's actual data.
- **Checkboxes/Radios:** Custom-styled to be sharp and precise; use Deep Ink for the checked state, never blue.