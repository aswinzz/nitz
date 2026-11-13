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
  },

  /*
   * RGB dial colour picker in the header (happening.studio style).
   * Visitors drag the R / G / B dials to recolour the page background;
   * text switches to white automatically when the colour gets dark.
   * The starting colour is theme.bg. remember: keep a visitor's pick on reload.
   */
  colorPicker: {
    enabled: true,
    remember: true,
    hint: 'spin me!', // little handwritten note by the dials, hidden after the first turn ('' = none)
  },

  /* ── 1. NAV ─────────────────────────────────────────────── */
  nav: {
    left: [], // e.g. [{ label: 'Home', href: '#home' }] — shown before the colour picker
    right: [
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'Contact', href: '#contact' },
    ],
  },

  /* ── 2. HERO / HEADER (everline style) ─────────────────── */
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

    // Slot-machine counter. Each visitor gets a random number between
    // slot.min and slot.max on their first visit and keeps it for good
    // (saved in their browser): reloads and lever pulls always land on it.
    // remember: false → start on `value`, and each pull shows a random number.
    stat: {
      value: 256,
      suffix: 'M+',
      label: 'Views',
      slot: { min: 250, max: 280, hint: 'pull me!', remember: true },
    },

    // Wallpaper revealed in a soft spot (with a fading trail) under the cursor.
    revealImage: '/images/xp-hills.svg',
    revealSize: 0.11, // spot radius as a fraction of viewport width (0.11 ≈ 158px at 1440)
    revealWobble: 0.16, // how free-form the shape is: 0 = perfect circle, 0.3 = very blobby
    revealTrail: 0.7, // seconds the smear behind the cursor lasts (0 = no trail)
  },

  /* ── 3. NOTEBOOK / PORTFOLIO (kyoosang style) ───────────── */
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

  /* ── 4. CONTACT (kyoosang style card) ──────────────────── */
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

    /*
     * Balls that bounce around behind the contact card.
     * Drag & throw them. Add/remove freely (3–5 looks best).
     * bg / ink are optional colours.
     */
    balls: [
      { text: 'Hire me!', bg: '#000000', ink: '#f0e42a' },
      { text: 'Will edit for food', bg: '#ff5a36', ink: '#000000' },
      { text: 'Unemployed & cutting', bg: '#ffffff', ink: '#000000' },
      { text: 'My mom says I’m talented', bg: '#2f6bff', ink: '#ffffff' },
    ],
  },
};
