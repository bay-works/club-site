import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export interface ClubMember<Id = number> {
    id: Id;
    firstName: string;
    lastInitial: string;
    pronouns: string;
    role: string;
    theme: string;
    bio: string;
    profilePhoto: () => Promise<{ default: ImageMetadata }>;
    content: () => Promise<{ default: AstroComponentFactory }>;
}

type ClubMembersMap = {
    [K in number]: ClubMember<K>;
};

export const clubMembers = {
    '0': {
        id: 0,
        firstName: 'josh',
        lastInitial: 'b',
        pronouns: 'he/him',
        role: 'co-leader',
        theme: '#11140e',
        bio: 'josh is a high school student and the co-leader of bay.works.',
        profilePhoto: () => import('./0/profile.jpeg'),
        content: () => import('./0/content.astro'),
    },
    '1': {
        id: 1,
        firstName: 'andrew',
        lastInitial: 'y',
        pronouns: 'he/him',
        role: 'leader',
        theme: '#2238ff',
        bio: 'andrew is a high school senior and the leader of bay.works.',
        profilePhoto: () => import('./1/profile.jpeg'),
        content: () => import('./1/content.astro'),
    },
    '2': {
        id: 2,
        firstName: 'koko',
        lastInitial: 'h',
        pronouns: 'travis/scott',
        role: 'secretary',
        theme: '#eacde0ff',
        bio: 'koko is a highschooler and secretary.',
        profilePhoto: () => import('./2/profile.jpeg'),
        content: () => import('./2/content.astro'),
    },
    // Insert your member info below!
} satisfies ClubMembersMap;
