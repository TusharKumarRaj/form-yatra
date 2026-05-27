// ─────────────────────────────────────────────────────────────────
// Shared FormYatra design system — import this in every page
// ─────────────────────────────────────────────────────────────────

// ── Base palette (shared across all themes) ───────────────────────
export const BASE = {
    ink:  "#0f1f18",   // dark text on gold/accent buttons
    gold: "#e8a020",   // amber accent — consistent across all cities
};

// ── Per-city theme palettes ───────────────────────────────────────
export const themes = {
    // Landing page — Jaipur (forest green, already implemented)
    jaipur: {
        bg:        "#143d27",
        nav:       "#1d5c3a",
        panel:     "#1d5c3a",
        border:    "#e8a020",
        cream:     "#f5f0e0",
        softCream: "#fdf5e4",
        darkText:  "#0f2a1c",
        patternFill:   "%231d5c3a",
        patternStroke: "%23e8a020",
    },

    // Sign-in — Goa (warm coastal teal + sandy cream)
    goa: {
        bg:        "#0e3444",   // deep ocean teal page bg
        nav:       "#1a5068",   // SAME as panel — unified frame
        panel:     "#1a5068",   // mid-ocean blue-teal
        border:    "#f0a030",   // sunset orange-gold
        cream:     "#fdf3e3",
        softCream: "#fff8f0",
        darkText:  "#0a2230",
        patternFill:   "%231a5068",  // matches nav + panel
        patternStroke: "%23f0a030",
    },

    // Sign-up — Kerala (rich red-ochre + jungle green)
    kerala: {
        bg:        "#2a1a0e",   // deep jungle dusk page bg
        nav:       "#3d2510",   // SAME as panel — unified frame
        panel:     "#3d2510",
        border:    "#e8a020",
        cream:     "#fdf3e3",
        softCream: "#fff8f2",
        darkText:  "#1a0e06",
        patternFill:   "%233d2510",  // matches nav + panel
        patternStroke: "%23e8a020",
    },

    // Dashboard — Mumbai (charcoal blue, metro energy)
    mumbai: {
        bg:        "#0f1c2e",
        nav:       "#162845",
        panel:     "#162845",
        border:    "#e8a020",
        cream:     "#e8edf5",
        softCream: "#f4f7fc",
        darkText:  "#0a1220",
        patternFill:   "%23162845",
        patternStroke: "%23e8a020",
    },
    // Public Form — Bangalore (Deep plum/purple with bright orange)
    bangalore: {
        bg:        "#1a0b26",
        nav:       "#2a143d",
        panel:     "#2a143d",
        border:    "#f07030",
        cream:     "#fdf5f9",
        softCream: "#fff0f7",
        darkText:  "#15091f",
        patternFill:   "%232a143d",
        patternStroke: "%23f07030",
    },
} as const;

export type ThemeKey = keyof typeof themes;

// ── Pattern tile size ─────────────────────────────────────────────
export const PATTERN_TILE = 40;

export function getFolkPatternSvg(fill: string, stroke: string) {
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='${fill}'/%3E%3Cpolygon points='20,4 36,20 20,36 4,20' fill='none' stroke='${stroke}' stroke-width='1.5'/%3E%3Ccircle cx='20' cy='20' r='2.5' fill='${stroke}'/%3E%3C/svg%3E")`;
}
