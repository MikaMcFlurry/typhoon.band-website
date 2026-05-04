/* Typhoon — single source of truth for all content
   Aligned with brief: Song, GalleryItem, Show, BandMember, NewsItem
   Each entity carries id, sortOrder, visibility — backend-ready */

window.TYPHOON_DATA = {
  band: {
    name: 'Typhoon',
    location: 'Istanbul, Türkiye',
    email: 'info@typhoonband.com',
    bookingEmail: 'booking@typhoonband.com',
    phone: '+90 532 123 45 67',
    instagram: '#',
    youtube: '#',
    spotify: '#',
    facebook: '#'
  },

  featuredSong: {
    id: 'song-find-a-way',
    sortOrder: 0,
    visibility: 'public',
    title: 'Find A Way',
    artist: 'Typhoon',
    duration: '4:12',
    durationSec: 252,
    releaseTag: 'Aktueller Release · Single',
    cover: 'assets/hero-collage.jpeg',
    src: ''  // local mp3 path goes here when wired up
  },

  songs: [
    { id: 's1', sortOrder: 1, visibility: 'public', title: 'Find A Way',     duration: '4:12', src: '' },
    { id: 's2', sortOrder: 2, visibility: 'public', title: 'Anadolu Groove', duration: '3:48', src: '' },
    { id: 's3', sortOrder: 3, visibility: 'public', title: 'Sıcak Rüzgâr',   duration: '4:36', src: '' },
    { id: 's4', sortOrder: 4, visibility: 'public', title: 'Boğaz Funk',     duration: '3:21', src: '' },
    { id: 's5', sortOrder: 5, visibility: 'public', title: 'Geceyarısı',     duration: '5:02', src: '' },
    { id: 's6', sortOrder: 6, visibility: 'public', title: 'Yol Sürüyor',    duration: '4:18', src: '' }
  ],

  shows: [
    { id: 'sh1', sortOrder: 1, visibility: 'public', day: '24', month: 'MAI', year: '2025',
      venue: 'Zorlu PSM Studio',  city: 'Istanbul, TR',           time: '20:30', ticketUrl: '#' },
    { id: 'sh2', sortOrder: 2, visibility: 'public', day: '07', month: 'JUN', year: '2025',
      venue: 'Kulturfabrik',      city: 'Esch-sur-Alzette, LU',   time: '21:00', ticketUrl: '#' },
    { id: 'sh3', sortOrder: 3, visibility: 'public', day: '21', month: 'JUN', year: '2025',
      venue: 'Jolly Joker Ankara',city: 'Ankara, TR',             time: '22:00', ticketUrl: '#' },
    { id: 'sh4', sortOrder: 4, visibility: 'public', day: '12', month: 'JUL', year: '2025',
      venue: 'Harbiye Açıkhava',  city: 'Istanbul, TR',           time: '21:30', ticketUrl: '#' }
  ],

  members: [
    { id: 'm1', sortOrder: 1, visibility: 'public', name: 'Taner Yücel',    role: 'Vocals / Keys', photo: 'assets/members/typhoon-vocals.jpeg' },
    { id: 'm2', sortOrder: 2, visibility: 'public', name: 'Ali Can',         role: 'Trombone',      photo: 'assets/members/mika-trombone.jpeg' },
    { id: 'm3', sortOrder: 3, visibility: 'public', name: 'Selim Sarı',      role: 'Sax',           photo: 'assets/members/schack-sax.jpeg' },
    { id: 'm4', sortOrder: 4, visibility: 'public', name: 'Murat Öztürk',    role: 'Trumpet',       photo: 'assets/members/hardy-trumpet.jpeg' },
    { id: 'm5', sortOrder: 5, visibility: 'public', name: 'Emil Yılmaz',     role: 'Guitar',        photo: 'assets/members/bugra-guitar.jpeg' },
    { id: 'm6', sortOrder: 6, visibility: 'public', name: 'Cenk Mercan',     role: 'Bass',          photo: 'assets/members/stefan-bass.jpeg' },
    { id: 'm7', sortOrder: 7, visibility: 'public', name: 'Burak Gürpınar',  role: 'Drums',         photo: 'assets/members/tom-drums.jpeg' }
  ],

  gallery: [
    { id: 'g1', sortOrder: 1, visibility: 'public', kind: 'image', src: 'assets/singer-stage.jpeg',          alt: 'Sänger auf der Bühne' },
    { id: 'g2', sortOrder: 2, visibility: 'public', kind: 'video', src: 'assets/members/mika-trombone.jpeg', alt: 'Posaune live' },
    { id: 'g3', sortOrder: 3, visibility: 'public', kind: 'image', src: 'assets/members/schack-sax.jpeg',     alt: 'Saxophon' },
    { id: 'g4', sortOrder: 4, visibility: 'public', kind: 'image', src: 'assets/members/hardy-trumpet.jpeg',  alt: 'Trompete' },
    { id: 'g5', sortOrder: 5, visibility: 'public', kind: 'image', src: 'assets/trombone-festival.jpeg',      alt: 'Festival' },
    { id: 'g6', sortOrder: 6, visibility: 'public', kind: 'video', src: 'assets/trombone-fan.jpeg',           alt: 'Fans' },
    { id: 'g7', sortOrder: 7, visibility: 'public', kind: 'image', src: 'assets/typhoon-singer.jpeg',         alt: 'Sänger' }
  ],

  news: [
    { id: 'n1', sortOrder: 1, visibility: 'public',
      tag: 'Release', title: '„Find A Way" ist da!',
      excerpt: 'Unser neuer Song ist ab sofort auf allen Plattformen verfügbar. Hört rein und teilt den Groove.',
      date: '12. Mai 2024', dateISO: '2024-05-12',
      thumb: 'assets/hero-collage.jpeg' },
    { id: 'n2', sortOrder: 2, visibility: 'public',
      tag: 'Studio', title: 'Zurück im Studio',
      excerpt: 'Neue Sounds, neue Grooves. Wir arbeiten an frischer Musik — bleibt gespannt.',
      date: '02. Mai 2024', dateISO: '2024-05-02',
      thumb: 'assets/members/schack-sax.jpeg' },
    { id: 'n3', sortOrder: 3, visibility: 'public',
      tag: 'Kommende Shows', title: 'Sommer 2024 — Live!',
      excerpt: 'Wir freuen uns auf einige sensationelle Nächte mit euch. Checkt unsere Termine und seid dabei!',
      date: '28. April 2024', dateISO: '2024-04-28',
      thumb: 'assets/trombone-festival.jpeg' }
  ]
};
