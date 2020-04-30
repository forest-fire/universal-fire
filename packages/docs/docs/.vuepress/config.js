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
        name: 'Universal Fire',
        twitter: 'https://twitter.com/inocangroup',
        og: 'https://www.facebook.com/inocangroup'
      },
      canonical_base: 'https://universal-fire.net',
      author: {
        name: 'Ken Snyder',
        twitter: 'https://twitter.com/yankeeinlondon'
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
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    [
      'meta',
      {
        name: 'msapplication-TileImage',
        content: '/icons/universal-fire-logo-32.png'
      }
    ],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
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
      'link',
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
    ]
  ],
  themeConfig: {
    repo: 'forest-fire/universal-fire',
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
