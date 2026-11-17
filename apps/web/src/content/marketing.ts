/**
 * All copy for the marketing pages. Sections in src/components/marketing render this data
 * and hold no sentences of their own, so wording changes never touch layout code.
 *
 * Copy rules (docs/rules/03-frontend.md): describe only what the product does, no invented
 * numbers, customers or quotes.
 */

export const HERO = {
  eyebrow: 'AI portfolio builder',
  titleLead: 'Your career,',
  titleAccent: 'written well.',
  description:
    'Give Folix your details once, by form, CV or a short interview. Get a written, designed and editable portfolio at your own URL, in minutes.',
  primaryCta: 'Build my portfolio',
  secondaryCta: 'See how it works',
  footnote: 'Free to start. Your edits are never overwritten.',
} as const;

export const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Principles', href: '#principles' },
] as const;

export type IntakePathIcon = 'form' | 'upload' | 'interview';

export const INTAKE = {
  eyebrow: 'Three ways in',
  title: 'Start from whatever you already have.',
  description: 'Every path ends in the same place: one master profile of facts about your work.',
  paths: [
    {
      icon: 'form',
      name: 'Quick form',
      time: 'About 5 minutes',
      description: 'Name, role, experience, projects and links. The fastest route when you know what to say.',
    },
    {
      icon: 'upload',
      name: 'CV upload',
      time: 'About 2 minutes',
      description:
        'Drop in a PDF or DOCX. Folix extracts the details and shows them to you to confirm before anything is written.',
    },
    {
      icon: 'interview',
      name: 'AI interview',
      time: '8 to 12 questions',
      description:
        'Short questions with follow-ups when an answer is vague, so outcomes and your own role make it onto the page.',
    },
  ],
} as const satisfies {
  eyebrow: string;
  title: string;
  description: string;
  paths: readonly { icon: IntakePathIcon; name: string; time: string; description: string }[];
};

export const STEPS = {
  eyebrow: 'How it works',
  title: 'From raw details to a live site in five steps.',
  items: [
    {
      name: 'Intake',
      description: 'Share your details by form, CV or interview. All three build the same profile.',
    },
    {
      name: 'Gap check',
      description: 'Folix lists what is thin or missing, such as a project with no outcome. Answer or skip.',
    },
    {
      name: 'Generate',
      description: 'Headline, bio, project write-ups and experience bullets stream into a live preview.',
    },
    {
      name: 'Edit',
      description: 'Edit text in place, reorder or hide sections, switch template, or ask for a rewrite.',
    },
    {
      name: 'Publish',
      description: 'Claim your URL and publish. The public page changes only when you press Publish.',
    },
  ],
} as const;

export type FeatureIcon = 'caseStudy' | 'audiences' | 'templates' | 'rewrite' | 'share' | 'analytics';

export const FEATURES = {
  eyebrow: 'Why Folix',
  title: 'Most builders parse a CV into a template and stop.',
  description: 'Folix competes on the quality of the writing, and on what one profile can produce.',
  items: [
    {
      icon: 'caseStudy',
      name: 'Case studies, not bullet lists',
      description:
        'Each project is written as problem, what you did, result and stack. The shape hiring managers actually read.',
      isWide: true,
    },
    {
      icon: 'audiences',
      name: 'One profile, two audiences',
      description:
        'Publish a second portfolio from the same facts, written for a different role, such as frontend engineer and freelance.',
      isWide: false,
    },
    {
      icon: 'templates',
      name: 'Switch templates, keep every edit',
      description: 'Content is stored separately from design, so a new look never costs you your wording.',
      isWide: false,
    },
    {
      icon: 'rewrite',
      name: 'Rewrite one section at a time',
      description:
        'Ask for shorter, more formal or more technical. Compare the result, then accept or discard it.',
      isWide: false,
    },
    {
      icon: 'share',
      name: 'Share-ready by default',
      description: 'A social preview image, search metadata and structured data come with every portfolio.',
      isWide: false,
    },
    {
      icon: 'analytics',
      name: 'See what gets read',
      description: 'Views, referrers and which project links were clicked, without setting anything up.',
      isWide: true,
    },
  ],
} as const satisfies {
  eyebrow: string;
  title: string;
  description: string;
  items: readonly { icon: FeatureIcon; name: string; description: string; isWide: boolean }[];
};

export const PRINCIPLES = {
  eyebrow: 'Two rules we do not break',
  items: [
    {
      title: 'The AI never invents facts.',
      description:
        'It rewrites, structures and sharpens what you gave it. Where detail is missing, such as an outcome or a number, it asks you or marks a gap for you to fill.',
    },
    {
      title: 'Your edits always win.',
      description:
        'Anything you have edited is locked against regeneration until you unlock it. Switching template or asking for a rewrite never touches it.',
    },
  ],
} as const;

export const FINAL_CTA = {
  title: 'Your work deserves better than a bullet list.',
  description: 'Give Folix your details once and see the first draft in minutes.',
  cta: 'Build my portfolio',
} as const;

export const FOOTER = {
  blurb: 'Portfolios that are written, not just formatted.',
} as const;

/** The sample person shown in the hero preview. Fictional, used only as an illustration. */
export const PREVIEW_SAMPLE = {
  url: 'folix/maya',
  name: 'Maya Okafor',
  headline: 'Frontend engineer who makes slow products feel instant.',
  interviewQuestion: 'What changed because of that project?',
  interviewAnswer: 'Checkout loaded in 1.1s instead of 3.8s, and drop-off fell by a fifth.',
  project: {
    label: 'Case study',
    title: 'Rebuilding checkout for speed',
    sections: [
      { label: 'Problem', text: 'A 3.8s checkout was losing mobile buyers.' },
      { label: 'What I did', text: 'Moved rendering to the server and cut the bundle by 60%.' },
      { label: 'Result', text: 'Load time down to 1.1s. Drop-off down 20%.' },
    ],
    stack: ['React', 'Next.js', 'TypeScript'],
  },
} as const;
