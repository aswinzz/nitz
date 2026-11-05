# NITZ EDITS — portfolio boilerplate

Vite + vanilla JS + GSAP + Lenis. Everything on the page is rendered from a single config file.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in /dist (deploy anywhere: Netlify, Vercel, GitHub Pages)
```

## Updating content
**Edit only [`src/config/site.config.js`](src/config/site.config.js).**

| Section | Config key | What you can change |
| --- | --- | --- |
| Colours | `theme` | yellow bg, paper colours, card, loader colours |
| Loader | `loader` | cycling words, minimum duration, on/off |
| Nav | `nav` | left / right links (`href: '#id'` scrolls smoothly) |
| Hero | `hero` | typed title, extra typed phrases, bio, stat (number + suffix + label), circle image + size |
| Notebook | `notebook` | cover text, intro page, contents title, outro page, **`works[]`** |
| Contact | `contact` | heading, email, socials, footer |

### Adding a work

Add an object to `notebook.works`. Each work becomes a two-page spread (details on the left, thumbnail on the right) and an entry on the contents page. Page count, flips and the counter update on their own.

```js
{
  title: 'My New Edit',
  category: 'YouTube · Long-form',
  client: 'Client',
  year: '2026',
  role: 'Edit, colour',
  stat: '3M views',          // optional
  description: 'Short paragraph…',
  thumbnail: '/works/my-new-edit.jpg', // put the file in /public/works
  video: 'https://youtu.be/XXXXXXXXXXX', // optional: YouTube, Vimeo or /works/clip.mp4
  note: 'handwritten note',  // optional
}
```

Images in `/public` are referenced from the site root (`/public/works/a.jpg` → `/works/a.jpg`). The SVGs in `public/works` and `public/images` are placeholders. Replace them with real thumbnails and a real hero image.

## Where each animation lives

| Effect | Reference | File |
| --- | --- | --- |
| Word-cycling loader with 0→100 counter, then a wipe up | mathis-biabiany.fr | `src/modules/loader.js` |
| Title typed and deleted on a loop, image circle following the cursor, masked text reveals, stat count-up | everline studio | `src/modules/hero.js` |
| 3D notebook: cover opens, pages turn with shading, contents jump through pages, arrows / keys / swipe. Under 768px it shows one page at a time and slides between pages | kyoosangchoi.com | `src/modules/notebook.js` |
| Contact card rises in on scroll, tilts toward the cursor, click copies the email | kyoosangchoi.com + Figma | `src/modules/contact.js` |
| Video lightbox | — | `src/modules/lightbox.js` |

Layout values come from the Figma frames (1440 px design). In CSS, `--u` equals one Figma pixel at the current viewport width.
