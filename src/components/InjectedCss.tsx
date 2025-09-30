import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import type { OklchColor } from '../utilities/OklchColor';
import { SpringTween } from '../utilities/SpringTween';
import {
    type ColorScheme,
    type ColorSchemeKeys,
    deserializeColorScheme,
    type SerializedColorScheme,
} from '../utilities/theme';

type TweenableColorTheme = Record<ColorSchemeKeys, SpringTween<OklchColor>>;

const cammelCaseToKebabCase = (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

interface InjectedCssProps {
    theme: {
        light: SerializedColorScheme;
        dark: SerializedColorScheme;
    };
}

export const InjectedCss: FC<InjectedCssProps> = ({ theme }) => {
    const deserializedTheme = useMemo<{
        light: ColorScheme;
        dark: ColorScheme;
    }>(() => {
        return {
            light: deserializeColorScheme(theme.light),
            dark: deserializeColorScheme(theme.dark),
        };
    }, [theme]);
    const memoized = useMemo(() => {
        const parts = [':root{'];
        for (const [key, value] of Object.entries(deserializedTheme.dark)) {
            parts.push(
                `--injected-color-${cammelCaseToKebabCase(key)}:${value.stringify()};`,
            );
        }
        parts.push('}');
        parts.push('@media(prefers-color-scheme:light){:root{');
        for (const [key, value] of Object.entries(deserializedTheme.light)) {
            parts.push(
                `--injected-color-${cammelCaseToKebabCase(key)}:${value.stringify()};`,
            );
        }
        parts.push('}}');
        return parts.join('');
    }, [deserializedTheme]);
    const [pageLoaded, setPageLoaded] = useState(false);
    const isDarkMode = useRef<boolean>(true);

    useEffect(() => {
        setPageLoaded(true);

        const query = window.matchMedia('(prefers-color-scheme: dark)');
        isDarkMode.current = query.matches;

        const initalTheme = isDarkMode.current
            ? deserializedTheme.dark
            : deserializedTheme.light;
        const springProperties = {
            mass: 1,
            tension: 280,
            friction: 30,
        } as const;
        const tweenableTheme: TweenableColorTheme = {} as TweenableColorTheme;
        const updates: Record<ColorSchemeKeys, [number, number]> = {} as Record<
            ColorSchemeKeys,
            [number, number]
        >;
        for (const [key_, value] of Object.entries(initalTheme)) {
            const key = key_ as ColorSchemeKeys;
            tweenableTheme[key] = SpringTween.create(value);
            tweenableTheme[key].setup(springProperties);
            const onUpdate = tweenableTheme[key].onUpdate((value) => {
                document.documentElement.style.setProperty(
                    `--injected-color-${cammelCaseToKebabCase(key_)}`,
                    value.stringify(),
                );
            });
            const onFinish = tweenableTheme[key].onFinish(() => {
                document.documentElement.style.setProperty(
                    `--injected-color-${cammelCaseToKebabCase(key_)}`,
                    (isDarkMode.current
                        ? deserializedTheme.dark
                        : deserializedTheme.light)[key].stringify(),
                );
            });
            updates[key] = [onUpdate, onFinish];
        }

        for (const [key, _value] of Object.entries(updates)) {
            document.documentElement.style.setProperty(
                `--injected-color-${cammelCaseToKebabCase(key)}`,
                (isDarkMode.current
                    ? deserializedTheme.dark
                    : deserializedTheme.light)[
                    key as ColorSchemeKeys
                ].stringify(),
            );
        }

        // Listen for color scheme changes
        const onColorSchemeChange = (event: MediaQueryListEvent) => {
            const newTheme = event.matches
                ? deserializedTheme.dark
                : deserializedTheme.light;
            isDarkMode.current = event.matches;
            for (const [key, value] of Object.entries(newTheme)) {
                const key_ = key as ColorSchemeKeys;
                tweenableTheme[key_].run(value);
            }
        };

        query.addEventListener('change', onColorSchemeChange);

        return () => {
            for (const [key, value] of Object.entries(updates)) {
                const key_ = key as ColorSchemeKeys;
                tweenableTheme[key_].offUpdate(value[0]);
                tweenableTheme[key_].offFinish(value[1]);
            }
            query.removeEventListener('change', onColorSchemeChange);
        };
    }, [deserializedTheme]);
    if (pageLoaded) return null;

    const base64EncodedCss = btoa(memoized);

    return (
        <link
            rel="stylesheet"
            href={`data:text/css;base64,${base64EncodedCss}`}
            type="text/css"
        />
    );
};
