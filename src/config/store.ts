interface StoreConfig {
  readonly name: string;
  readonly logoSrc: string;
  readonly description: string;
  readonly whatsappNumber: string;
  readonly demonstrationMode: boolean;
}

// Identidade provisória. Configure somente informações comerciais aprovadas.
export const store = {
  name: 'Ateliê de beads',
  logoSrc: '/images/beads-mark.svg',
  description: 'Pequenas criações, feitas com tempo, cor e carinho.',
  whatsappNumber: '',
  demonstrationMode: true,
} as const satisfies StoreConfig;
