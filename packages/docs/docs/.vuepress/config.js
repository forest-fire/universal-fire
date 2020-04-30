module.exports = {
  plugins: {
    '@vuepress/pwa': {
      serviceWorker: true,
      updatePopup: {
        message: 'New Universal Fire content is available',
        buttonText: 'Refresh'
      }
    },
    '@vuepress/back-to-top': true,
    '@vuepress/last-updated': true,
    '@vuepress/medium-zoom': true,
    autometa: {
      site: {
        name: 'UniversalFire'
      },
      canonical_base: 'https://universal-fire.net',
      author: {
        name: 'Ken Snyder',
        twitter: 'yankeeinlondon'
      }
    }
  },
  title: 'Universal Fire',
  description:
    'A consistent and elegant API for all Firebase APIs (with a view toward mocking)',
  head: [
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
    ],
    ['meta', { name: 'application-name', content: 'Universal Fire' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      {
        name: 'msapplication-TileImage',
        content: '/icons/universal-fire-logo-32.png'
      }
    ],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }][
      ('meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' })
    ],
    [
      'link',
      {
        rel: 'favicon',
        href: '/icons/universal-fire-logo-32.png',
        type: 'image/png',
        sizes: '16x16'
      }
    ],
    [
      'link',
      {
        rel: 'favicon',
        href: '/icons/universal-fire-logo-32.png',
        type: 'image/png',
        sizes: '32x32'
      }
    ],
    [
      'link',
      {
        rel: 'favicon',
        href: '/icons/universal-fire-logo-48.png',
        type: 'image/png',
        sizes: '48x48'
      }
    ],
    [
      'link',
      { rel: 'icon', href: '/icons/universal-fire-logo-32.png', sizes: '32x32' }
    ],
    [
      'link',
      { rel: 'icon', href: '/icons/universal-fire-logo-48.png', sizes: '48x48' }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/icons/universal-fire-logo-57.png',
        sizes: '57x57'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/icons/universal-fire-logo-72.png',
        sizes: '72x72'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/icons/universal-fire-logo-76.png',
        sizes: '76x76'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/icons/universal-fire-logo-114.png',
        sizes: '114x114'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/icons/universal-fire-logo-120.png',
        sizes: '120x120'
      }
    ],
    [
      {
        rel: 'icon',
        href: '/icons/universal-fire-logo-144.png',
        sizes: '144x144'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/icons/universal-fire-logo-152.png',
        sizes: '152x152'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/icons/universal-fire-logo-180.png',
        sizes: '180x180'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        href: '/icons/universal-fire-logo-192.png',
        sizes: '192x192'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        href: '/icons/universal-fire-logo-225.png',
        sizes: '225x225'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        href: '/icons/universal-fire-logo-512.png',
        sizes: '512x512'
      }
    ],
    ['link', { rel: 'manifest', href: 'manifest.json' }],
    [
      'link',
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/universal-fire-logo-192.png',
        sizes: '192x192'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-startup-image',
        href: 'icons/apple_splash_2048.png',
        sizes: '2048x2732'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-startup-image',
        href: 'icons/apple_splash_1668.png',
        sizes: '1668x2224'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-startup-image',
        href: 'icons/apple_splash_1536.png',
        sizes: '1536x2048'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-startup-image',
        href: 'icons/apple_splash_1125.png',
        sizes: '1125x2436'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-startup-image',
        href: 'icons/apple_splash_1242.png',
        sizes: '1242x2208'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-startup-image',
        href: 'icons/apple_splash_750.png',
        sizes: '750x1334'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-startup-image',
        href: 'icons/apple_splash_640.png',
        sizes: '640x1136'
      }
    ],

    [
      'link',
      { rel: 'apple-touch-icon', href: 'touch-icon-iphone', sizes: '120x120' }
    ],
    [
      'link',
      { rel: 'apple-touch-icon', sizes: '152x152', href: 'touch-icon-ipad' }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: 'touch-icon-iphone-retina'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '167x167',
        href: 'touch-icon-ipad-retina'
      }
    ]
  ],
  themeConfig: {
    repo: 'forest-fire/abstracted-admin',
    editLinks: true,
    docsDir: 'docs',
    nav: [
      {
        text: 'Read',
        link: '/read/'
      },
      {
        text: 'Write',
        link: '/write/'
      },
      {
        text: 'Query',
        link: '/query/'
      },
      {
        text: 'Events',
        link: '/events/'
      },
      {
        text: 'Mock',
        link: '/mocking/'
      }
    ],
    sidebar: 'auto'
  }
};
