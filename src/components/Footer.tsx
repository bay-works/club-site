import type { FC } from 'react';

const FOOTER = [
    {
        name: 'social',
        links: [
            { name: 'Github', href: 'https://github.com/bay-works/' },
            {
                name: 'Discord (members only)',
                href: 'https://discord.gg/C4vd3KZCRW',
            },
            { name: 'Youtube', href: 'https://www.youtube.com/@bay-works' },
            { name: 'X', href: 'https://twitter.com/baydotworks' },
        ],
    },
    {
        name: 'resources',
        links: [
            { name: 'showcase', href: '/showcase' },
            { name: 'members', href: '/members' },
            { name: 'code of conduct', href: '/code-of-conduct' },
        ],
    },
    {
        name: 'other',
        links: [
            { name: 'email', href: 'mailto:contact@bay.works' },
            {
                name: 'edit website',
                href: 'https://github.com/bay-works/club-site',
            },
        ],
    },
] as const;

export const Footer: FC = () => {
    return (
        <footer className="w-full flex justify-center bg-gradient-to-b from-transparent to-black/40 p-8">
            <div className="w-full max-w-4xl flex flex-col gap-8 text-on-surface-variant">
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {FOOTER.map((section) => (
                        <div key={section.name} className="flex flex-col gap-2">
                            <h2 className="font-semibold text-on-surface text-lg">
                                {section.name}
                            </h2>
                            <div className="flex flex-col gap-1">
                                {section.links.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        target={
                                            link.href.startsWith('http')
                                                ? '_blank'
                                                : undefined
                                        }
                                        rel={
                                            link.href.startsWith('http')
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                        className="text-on-surface-variant hover:underline"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-on-surface-variant text-sm">
                    &copy; {new Date().getFullYear()} bay.works. All rights
                    reserved
                </div>
            </div>
        </footer>
    );
};
