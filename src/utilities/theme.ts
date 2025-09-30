import {
    argbFromHex,
    type Scheme,
    themeFromSourceColor,
} from '@material/material-color-utilities';
import { OklchColor, type SerializedOklchColor } from './OklchColor';

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

export type SerializedColorScheme = {
    [key in ColorSchemeKeys]: SerializedOklchColor;
};

export const serializeColorScheme = (
    scheme: ColorScheme,
): SerializedColorScheme => {
    const serialized: Partial<SerializedColorScheme> = {};
    for (const key of COLOR_SCHEME_KEYS) {
        serialized[key] = scheme[key].toSerialized();
    }
    return serialized as SerializedColorScheme;
};

export const deserializeColorScheme = (
    scheme: SerializedColorScheme,
): ColorScheme => {
    const deserialized: Partial<ColorScheme> = {};
    for (const key of COLOR_SCHEME_KEYS) {
        deserialized[key] = OklchColor.fromSerialized(scheme[key]);
    }
    return deserialized as ColorScheme;
};

const materialSchemeToColorScheme = (materialScheme: Scheme): ColorScheme => {
    return {
        primary: OklchColor.fromInt(materialScheme.primary),
        onPrimary: OklchColor.fromInt(materialScheme.onPrimary),
        primaryContainer: OklchColor.fromInt(materialScheme.primaryContainer),
        onPrimaryContainer: OklchColor.fromInt(
            materialScheme.onPrimaryContainer,
        ),
        secondary: OklchColor.fromInt(materialScheme.secondary),
        onSecondary: OklchColor.fromInt(materialScheme.onSecondary),
        secondaryContainer: OklchColor.fromInt(
            materialScheme.secondaryContainer,
        ),
        onSecondaryContainer: OklchColor.fromInt(
            materialScheme.onSecondaryContainer,
        ),
        surface: OklchColor.fromInt(materialScheme.surface),
        onSurface: OklchColor.fromInt(materialScheme.onSurface),
        onSurfaceVariant: OklchColor.fromInt(materialScheme.onSurfaceVariant),
        outline: OklchColor.fromInt(materialScheme.outline),
        outlineVariant: OklchColor.fromInt(materialScheme.outlineVariant),
        shadow: OklchColor.fromInt(materialScheme.shadow),
    };
};

export const createThemeFromColor = (
    color: string,
): {
    dark: ColorScheme;
    light: ColorScheme;
} => {
    const argb = argbFromHex(color);
    const theme = themeFromSourceColor(argb);
    return {
        light: materialSchemeToColorScheme(theme.schemes.light),
        dark: materialSchemeToColorScheme(theme.schemes.dark),
    };
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

export const defaultTheme = {
    light: serializeColorScheme(lightScheme),
    dark: serializeColorScheme(darkScheme),
} as const;
