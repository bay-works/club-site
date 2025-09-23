import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { SpringTween } from '../utilities/SpringTween';
import { WordmarkLogo } from './WordmarkLogo';

const MENU_LINKS = [
    { href: '/showcase', label: 'Showcase' },
    { href: '/members', label: 'Members' },
];

export const Header: FC = () => {
    const scrollTween = useRef(SpringTween.create(0));
    const effectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollTween.current.setup({ mass: 1, tension: 170, friction: 26 });
        let tweenedToHidden = window.scrollY < 10;
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const shouldBeHidden = scrollY < 10;
            if (shouldBeHidden === tweenedToHidden) return;
            if (shouldBeHidden) scrollTween.current.run(0);
            else scrollTween.current.run(1);
            tweenedToHidden = shouldBeHidden;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        const onUpdate = scrollTween.current.onUpdate((value) => {
            if (!effectRef.current) return;
            effectRef.current.style.setProperty(
                '--tw-gradient-from',
                `color-mix(in oklab, var(--color-surface) ${value * 100}%, transparent)`,
            );
        });
        scrollTween.current.run(tweenedToHidden ? 0 : 1);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            scrollTween.current.offUpdate(onUpdate);
        };
    }, []);

    return (
        <header className="fixed top-0 z-50 w-full flex justify-center transition-all duration-300 px-4 md:px-8 py-4">
            <div
                className="absolute w-full top-0 left-0 -z-10 h-32 bg-gradient-to-b to-transparent pointer-events-none"
                ref={effectRef}
            />
            <div className="w-full max-w-6xl flex items-center">
                <a
                    href="/"
                    className="text-2xl font-bold text-on-surface-variant hover:text-on-surface transition-all"
                >
                    <WordmarkLogo className="h-8" />
                </a>
                <div className="flex-grow" />
                <nav className="flex gap-4">
                    {MENU_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-on-surface-variant hover:text-on-surface transition-all"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>
    );
};
