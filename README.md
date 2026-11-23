# Elma Market — Corporate Website

Corporate website for **Elma Market**, a regional grocery chain operating in Hatay, Türkiye since 2013 with branches in Karağaç, Arsuz and Belen.

The site presents the company, its store network, sustainability approach and press coverage, and introduces **Elma Express**, the company's upcoming grocery delivery app. It is a static, dependency-free front end: no framework, no build step, no runtime libraries.

**Live:** https://elmamarket.yarenelif1188.workers.dev

---

## Elma Express — in development

I am currently developing **Elma Express**, a native mobile grocery ordering and delivery app for Elma Market customers. It will be available on the **App Store** and **Google Play** soon.

Planned capabilities:

- Browsing the full product catalogue (8,000+ SKUs) by category
- Basket management and checkout with cash-on-delivery or in-app payment
- App-exclusive weekly promotions
- Live order tracking from store to door

Until the release, the website shows the app in a *coming soon* state: store buttons are disabled and the device previews open an informational dialog instead of redirecting. Switching the site to the released state is a one-line change (see [Configuration](#configuration)).

---

## Features

- **Hero with background video** — muted, looping, slowed-down video behind a rotating three-slide carousel, with a pause control and a poster fallback.
- **Animated store illustration** — a self-contained SVG scene of the Belen branch (clouds, garlands, traffic, a walking shopper) animated purely with CSS keyframes inside the SVG.
- **Accessible tabs** for vision, mission and values (`role="tablist"`, `aria-selected`, arrow-key navigation).
- **Elma Express showcase** — three CSS-built device mockups (categories, home screen, live tracking) plus feature list and store links.
- **Press section** with a lightbox gallery for photo sets and an embedded YouTube player (privacy-enhanced `youtube-nocookie.com` domain), loaded only on demand.
- **Embedded Google Map** with a directions deep link.
- **Scroll reveal and animated counters** via `IntersectionObserver`.
- **Responsive layout** down to 360 px with an off-canvas mobile navigation.
- **Motion-safe** — every animation, including those inside the SVG illustration, respects `prefers-reduced-motion`; the hero video starts paused for those users.
- **Progressive enhancement** — content stays visible if JavaScript is unavailable; reveal effects are scoped behind a `.js` class.

## Tech stack

| Layer      | Choice                                                                 |
|------------|------------------------------------------------------------------------|
| Markup     | Semantic HTML5                                                         |
| Styling    | Plain CSS with custom properties (design tokens), BEM-style naming     |
| Scripting  | Vanilla JavaScript (ES2020), no dependencies                           |
| Icons      | Single external SVG sprite referenced with `<use>`                     |
| Typography | Plus Jakarta Sans via Google Fonts, with a system font fallback stack  |
| Hosting    | Cloudflare Workers static assets (any static host works)               |

## Project structure

```
.
├── README.md
└── elma-market-site
    ├── index.html
    └── assets
        ├── css
        │   └── main.css            # Design tokens, base styles, components, breakpoints
        ├── js
        │   └── main.js             # Feature initialisers, loaded with defer
        ├── img
        │   ├── brand/              # Logo variants (horizontal, light, mark)
        │   ├── illustrations/      # Animated SVG store scene
        │   ├── press/              # Press coverage photos
        │   ├── icons.svg           # SVG icon sprite
        │   └── hero-poster.jpg     # Video poster frame
        └── video
            └── hero.mp4            # 720p H.264, audio stripped
```

## Getting started

No installation or build is required. Because the icon sprite and SVG illustration are loaded as external resources, serve the folder over HTTP instead of opening `index.html` from the file system.

```bash
cd elma-market-site
python3 -m http.server 8000
```

Then open http://localhost:8000.

Any other static server works equally well, for example `npx serve .`.

## Configuration

Runtime options live in the `config` object at the top of `elma-market-site/assets/js/main.js`:

```js
const config = {
  appReleased: false,
  appStoreUrls: {
    ios: "https://apps.apple.com/tr/app/elma-express/idXXXXXXXXX",
    android: "https://play.google.com/store/apps/details?id=com.elmamarket.express",
  },
  slideInterval: 6000,
  counterDuration: 1600,
  heroPlaybackRate: 0.85,
};
```

When Elma Express ships:

1. Replace the placeholder store URLs in `appStoreUrls`.
2. Set `appReleased` to `true`. Store buttons become live links, and tapping a device preview sends iOS and Android visitors straight to the matching store.
3. Update the "Çok yakında" copy in `elma-market-site/index.html`.

Brand colours, radii, shadows and spacing are defined as custom properties in the `:root` block of `elma-market-site/assets/css/main.css`.

## JavaScript architecture

`main.js` is organised as small, single-purpose initialisers that are called once at the end of the file:

| Function              | Responsibility                                                   |
|-----------------------|------------------------------------------------------------------|
| `initHeader`          | Sticky header state and off-canvas mobile navigation             |
| `initHeroSlider`      | Carousel with autoplay, dots and arrow controls                  |
| `initHeroVideo`       | Playback rate and pause/play toggle                              |
| `initTabs`            | ARIA tab pattern with keyboard support                           |
| `initRevealOnScroll`  | `IntersectionObserver` reveal effects and number counters        |
| `initAppLinks`        | Coming-soon / released behaviour for store links and previews    |
| `initLightbox`        | Photo gallery and on-demand YouTube embed                        |
| `initFooterYear`      | Keeps the copyright year current                                 |

## Deployment

The site is deployed as static assets on Cloudflare Workers. To publish a new version, upload the contents of `elma-market-site` (`index.html` and the `assets` folder) through **Workers & Pages → New deployment** in the Cloudflare dashboard. The same files can be served from any static host such as GitHub Pages or Netlify.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari (desktop and mobile). The site relies on CSS custom properties, `aspect-ratio`, `clip-path` and `IntersectionObserver`; older browsers fall back to static content.

## Content and media

Press photos and the linked video belong to their respective publishers (İskenderun Org, Söz Gazetesi); each item is credited and links to the original article. Logos and brand assets © Elma Market. All rights reserved.
