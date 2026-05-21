export type Product = {
  slug: string;
  title: string;
  price: number;
  description?: string;
  sizes?: string[];
  tags?: string[];
  sold?: boolean;
  image?: string;
  stripePriceId?: string; // set in Stripe dashboard → Products → copy price ID (price_xxx)
};

export const products: Product[] = [
  {
    slug: "tee-black",
    title: "tee, black",
    price: 48,
    description: "we kept thinking about hands and vision.",
    sizes: ["s", "m", "l", "xl"],
    tags: ["wearable", "art"],
  },
  {
    slug: "tee-white",
    title: "tee, white",
    price: 48,
    description: "same idea, other way around.",
    sizes: ["s", "m", "l", "xl"],
    tags: ["wearable", "art"],
  },
  {
    slug: "cap",
    title: "cap",
    price: 36,
    description: "one size.",
    sizes: ["os"],
    tags: ["wearable"],
  },
  {
    slug: "tote",
    title: "tote",
    price: 28,
    description: "carry things.",
    sizes: ["os"],
    tags: ["wearable"],
    sold: true,
  },
];

export const tags = ["all", "wearable", "reading", "science", "art", "listening"];
