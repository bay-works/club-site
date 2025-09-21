import { OklchColor } from './OklchColor';

export const COLOR_SCHEME_KEYS = [
    'primary',
    'onPrimary',
    'primaryContainer',
    'onPrimaryContainer',
    'secondary',
    'onSecondary',
    'secondaryContainer',
    'onSecondaryContainer',
    'surface',
    'onSurface',
    'onSurfaceVariant',
    'outline',
    'outlineVariant',
    'shadow',
] as const;

export type ColorSchemeKeys = (typeof COLOR_SCHEME_KEYS)[number];

export type ColorScheme = {
    [key in ColorSchemeKeys]: OklchColor;
};

const lightScheme: ColorScheme = {
    primary: OklchColor.fromHex('#226488'),
    onPrimary: OklchColor.fromHex('#ffffff'),
    primaryContainer: OklchColor.fromHex('#c7e7ff'),
    onPrimaryContainer: OklchColor.fromHex('#004c6c'),
    secondary: OklchColor.fromHex('#4f616e'),
    onSecondary: OklchColor.fromHex('#ffffff'),
    secondaryContainer: OklchColor.fromHex('#d2e5f5'),
    onSecondaryContainer: OklchColor.fromHex('#374955'),
    surface: OklchColor.fromHex('#f6fafe'),
    onSurface: OklchColor.fromHex('#181c20'),
    onSurfaceVariant: OklchColor.fromHex('#41484d'),
    outline: OklchColor.fromHex('#71787e'),
    outlineVariant: OklchColor.fromHex('#c1c7ce'),
    shadow: OklchColor.fromHex('#000000'),
};

const darkScheme: ColorScheme = {
    primary: OklchColor.fromHex('#93cdf6'),
    onPrimary: OklchColor.fromHex('#00344c'),
    primaryContainer: OklchColor.fromHex('#004c6c'),
    onPrimaryContainer: OklchColor.fromHex('#c7e7ff'),
    secondary: OklchColor.fromHex('#b6c9d8'),
    onSecondary: OklchColor.fromHex('#21323e'),
    secondaryContainer: OklchColor.fromHex('#374955'),
    onSecondaryContainer: OklchColor.fromHex('#d2e5f5'),
    surface: OklchColor.fromHex('#101417'),
    onSurface: OklchColor.fromHex('#dfe3e7'),
    onSurfaceVariant: OklchColor.fromHex('#c1c7ce'),
    outline: OklchColor.fromHex('#8b9198'),
    outlineVariant: OklchColor.fromHex('#41484d'),
    shadow: OklchColor.fromHex('#000000'),
};

export const theme = {
    colors: {
        light: lightScheme,
        dark: darkScheme,
    },
} as const;
