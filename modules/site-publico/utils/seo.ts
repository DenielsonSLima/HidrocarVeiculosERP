/**
 * Utilitário de SEO para o site público.
 * Define meta tags dinâmicas (<title>, description, og:*) e JSON-LD para cada página.
 */

interface SEOParams {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

interface VehicleJsonLdParams {
  name: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color?: string;
  price: number;
  image?: string;
  url: string;
  description: string;
  sellerName: string;
  sellerPhone?: string;
}

function getOrCreateMeta(name: string, isOg = false): HTMLMetaElement {
  const attr = isOg ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  return el;
}

export function setSEO({ title, description, image, url }: SEOParams) {
  // Title
  document.title = title;

  // Meta description
  getOrCreateMeta('description').content = description;

  // Open Graph
  getOrCreateMeta('og:title', true).content = title;
  getOrCreateMeta('og:description', true).content = description;
  getOrCreateMeta('og:type', true).content = 'website';

  if (image) {
    getOrCreateMeta('og:image', true).content = image;
  }

  if (url) {
    getOrCreateMeta('og:url', true).content = url;

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  // Twitter Card
  getOrCreateMeta('twitter:card').content = image ? 'summary_large_image' : 'summary';
  getOrCreateMeta('twitter:title').content = title;
  getOrCreateMeta('twitter:description').content = description;
  if (image) {
    getOrCreateMeta('twitter:image').content = image;
  }
}

/**
 * Injeta JSON-LD (Schema.org) estruturado para um veículo.
 * Facilita que o Google exiba rich snippets com preço, ano, marca, etc.
 */
export function setVehicleJsonLd(params: VehicleJsonLdParams) {
  // Remove JSON-LD anterior se existir
  removeJsonLd();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: params.name,
    brand: {
      '@type': 'Brand',
      name: params.brand,
    },
    model: params.model,
    vehicleModelDate: String(params.year),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: params.mileage,
      unitCode: 'KMT',
    },
    fuelType: params.fuelType,
    vehicleTransmission: params.transmission,
    ...(params.color && { color: params.color }),
    ...(params.image && { image: params.image }),
    url: params.url,
    description: params.description,
    offers: {
      '@type': 'Offer',
      price: params.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'AutoDealer',
        name: params.sellerName,
        ...(params.sellerPhone && { telephone: params.sellerPhone }),
      },
    },
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'seo-json-ld';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

/**
 * Injeta JSON-LD genérico para a página da loja (AutoDealer).
 */
export function setDealerJsonLd(params: {
  name: string;
  description: string;
  url: string;
  phone?: string;
  address?: { street?: string; city?: string; state?: string; zip?: string };
  image?: string;
}) {
  removeJsonLd();

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.phone && { telephone: params.phone }),
    ...(params.image && { image: params.image }),
  };

  if (params.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(params.address.street && { streetAddress: params.address.street }),
      ...(params.address.city && { addressLocality: params.address.city }),
      ...(params.address.state && { addressRegion: params.address.state }),
      ...(params.address.zip && { postalCode: params.address.zip }),
      addressCountry: 'BR',
    };
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'seo-json-ld';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

/**
 * Remove o JSON-LD injetado anteriormente.
 */
export function removeJsonLd() {
  const existing = document.getElementById('seo-json-ld');
  if (existing) existing.remove();
}
