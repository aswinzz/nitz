/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONFIG — edit this file to update everything on the site.
 *  No other file needs to change for normal content updates.
 *
 *  Images/videos: drop files in /public (e.g. /public/works/my-edit.jpg)
 *  and reference them as "/works/my-edit.jpg".
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  /* <title> and meta description */
  meta: {
    title: 'NITZ EDITS — Video Editor',
    description:
      'Nitz is a video editor specializing in YouTube content, short-form and ads.',
  },

  /* Colours & fonts. Changing these re-themes the whole site. */
  theme: {
    bg: '#f0e42a', // yellow from the Figma
    ink: '#000000',
    paper: '#f4f1e8', // notebook left pages
    paperDark: '#141414', // notebook right pages
    card: '#d9d9d9', // contact card
    loaderBg: '#f0ece4',
    loaderInk: '#111111',
  },

  /* ── 1. LOADER (mathis-biabiany style) ─────────────────── */
  loader: {
    enabled: true,
    // Words cycle top-left while the counter runs 0 → 100.
    words: ['Nitz Edits', 'video editor', 'youtube', 'short-form', 'ads', 'stories that hold'],
    // Minimum time (ms) the loader is shown, even if assets load faster.
    minDuration: 2600,
  },

  /* ── 2. NAV ─────────────────────────────────────────────── */
  nav: {
    left: [{ label: 'Home', href: '#home' }],
    right: [
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'Contact', href: '#contact' },
    ],
  },

  /* ── 3. HERO / HEADER (everline style) ─────────────────── */
  hero: {
    // Typed, deleted and re-typed on a loop.
    title: 'NITZ EDITS',
    // Optional extra phrases the typewriter cycles through after the title.
    // Leave empty [] to only loop the title.
    typeLoop: [],
    typeSpeed: 110, // ms per character
    deleteSpeed: 55,
    holdTime: 2600, // ms the full word stays before deleting

    bio: 'I’m NITZ, a video editor specializing in YouTube content, short-form and ads. I focus on delivering polished, high-quality videos on schedule. From first cut to final export, my edits have helped creators and brands reach',

    stat: {
      value: 256, // counted up from 0
      suffix: 'M+',
      label: 'Views',
    },

    // Image revealed inside the circle that follows the cursor.
    revealImage: '/images/hero-reveal.svg',
    revealSize: 0.27, // circle radius as a fraction of viewport width
  },

  /* ── 4. NOTEBOOK / PORTFOLIO (kyoosang style) ───────────── */
  notebook: {
    cover: {
      title: 'PORTFOLIO',
      subtitle: 'selected edits',
      hint: 'click to open',
      year: '2020 — 2026',
    },
    // First spread after opening the cover.
    intro: {
      heading: 'hi!',
      body: [
        'I’m Nitz — I cut stories for creators and brands.',
        'Long-form YouTube, short-form vertical, and ads that convert.',
      ],
      signature: 'Nitz',
    },
    indexTitle: 'Contents',
    // Last left page.
    outro: {
      heading: 'that’s a wrap.',
      body: 'More edits available on request.',
      cta: { label: 'Let’s create together →', href: '#contact' },
    },

    /**
     * One work = one two-page spread.
     * left page  → details
     * right page → thumbnail (click opens video if `video` is set)
     *
     * video: YouTube / Vimeo URL, or a local mp4 path ("/works/reel.mp4").
     */
    works: [
      {
        title: 'Creator Documentary',
        category: 'YouTube · Long-form',
        client: 'Channel Name',
        year: '2026',
        role: 'Edit, colour, sound design',
        stat: '12M views',
        description:
          'A 24-minute story-driven documentary built from 40 hours of raw footage. Pacing, retention hooks and a custom sound bed.',
        thumbnail: '/works/work-1.svg',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        note: 'retention ↑ 38%',
      },
      {
        title: 'Brand Launch Ad',
        category: 'Ads · 30s / 15s / 6s',
        client: 'Brand Name',
        year: '2025',
        role: 'Edit, motion graphics',
        stat: '4.1M impressions',
        description:
          'A launch campaign cut into three lengths for paid social. Kinetic type, punchy rhythm and versioned CTAs.',
        thumbnail: '/works/work-2.svg',
        video: '',
        note: 'CTR 2.4x',
      },
      {
        title: 'Shorts Series',
        category: 'Short-form · Vertical',
        client: 'Creator Name',
        year: '2025',
        role: 'Edit, captions, SFX',
        stat: '90M views',
        description:
          'A recurring vertical series edited for the first 2 seconds. Dynamic captions, jump cuts and loop-friendly endings.',
        thumbnail: '/works/work-3.svg',
        video: '',
        note: '120+ episodes',
      },
      {
        title: 'Podcast Clips',
        category: 'YouTube · Clips',
        client: 'Podcast Name',
        year: '2024',
        role: 'Edit, multicam, captions',
        stat: '30M views',
        description:
          'Multicam podcast episodes turned into high-retention clips with b-roll, zooms and subtitle styling.',
        thumbnail: '/works/work-4.svg',
        video: '',
        note: 'weekly',
      },
    ],
  },

  /* ── 5. CONTACT (kyoosang style card) ──────────────────── */
  contact: {
    heading: 'Let’s create together!!!',
    label: 'Contact',
    email: 'nithin4403@gmail.com',
    copiedText: 'Copied!',
    socials: [
      { label: 'Instagram', href: 'https://instagram.com/' },
      { label: 'YouTube', href: 'https://youtube.com/' },
      { label: 'Behance', href: 'https://behance.net/' },
    ],
    footer: '© {year} Nitz Edits',
  },
};
