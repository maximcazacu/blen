# blen. design system

The lowercase wordmark uses drawn geometric paths with a blue final dot. It scales without font dependencies. Use `public/blen.svg` on light surfaces and `public/blen-light.svg` on dark surfaces. The compact tile and favicon use the same b and dot. The sharing image is rendered at 1200 × 630.

| Role | Value |
| --- | --- |
| Page | Warm off-white `#F7F7F3` |
| Text and dark panels | Charcoal `#171A24` |
| Supporting text | Cool grey `#545C6D` |
| Action accent | Blue `#4055D6` |
| Surfaces and dividers | White `#FFFFFF` and cool grey `#D8DCE6` |

Instrument Sans supplies display and UI type with Romanian diacritics. The bundled fonts carry their SIL Open Font License files in `public/fonts`. Shared typography, spacing, form controls and feedback colors live in `src/app/theme.css`. `src/app/blen.css` defines the marketing layout and navigation. Existing visual examples retain semantic status colors where they help distinguish workflow states.

The hero diagram is an interactive explanation. Its buttons select a stage and update the note below, with no simulated external execution. The existing workflow examples and incidental transitions respect reduced-motion preferences. At smaller widths the marketing layout stacks, and the navigation uses a keyboard-accessible menu.
