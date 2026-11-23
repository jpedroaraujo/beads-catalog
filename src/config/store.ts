interface StoreConfig {
  readonly name: string;
  readonly logoSrc: string;
  readonly description: string;
  readonly whatsappNumber: string;
  readonly demonstrationMode: boolean;
}

export const store = {
  name: 'Cecília Roldan',
  logoSrc: '/images/beads-mark.svg',
  description: 'Pequenas criações, feitas com tempo, cor e carinho.',
  whatsappNumber: '',
  demonstrationMode: false,
} as const satisfies StoreConfig;
