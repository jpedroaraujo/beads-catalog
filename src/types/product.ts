export type ProductPricing =
  | { readonly type: 'fixed'; readonly amountInCents: number }
  | { readonly type: 'starting_at'; readonly amountInCents: number }
  | { readonly type: 'quote'; readonly amountInCents?: never };

export interface ProductImage {
  readonly src: string;
  readonly alt: string;
}

export interface ProductDimensions {
  readonly width: number;
  readonly height: number;
  readonly depth?: number;
  readonly unit: 'cm';
}

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly categoryId: string;
  readonly images: readonly ProductImage[];
  readonly pricing: ProductPricing;
  readonly dimensions?: ProductDimensions;
  readonly customizable: boolean;
  readonly available: boolean;
}
