import type { ProductPricing } from '../types/product';

// Verificados por npm run typecheck; não são testes de execução.
// @ts-expect-error quote não aceita valor numérico
const numericQuote: ProductPricing = { type: 'quote', amountInCents: 1500 };
// @ts-expect-error quote também não aceita undefined explícito
const undefinedQuote: ProductPricing = {
  type: 'quote',
  amountInCents: undefined,
};
// @ts-expect-error fixed exige centavos
const missingFixed: ProductPricing = { type: 'fixed' };
// @ts-expect-error starting_at exige centavos
const missingStarting: ProductPricing = { type: 'starting_at' };
// @ts-expect-error modalidade fora do contrato
const extraMode: ProductPricing = { type: 'free' };

void [numericQuote, undefinedQuote, missingFixed, missingStarting, extraMode];
