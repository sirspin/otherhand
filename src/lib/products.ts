export type Product = {
  slug: string;
  title: string;
  price: number;
  currency?: string;
  sold?: boolean;
  image?: string;
  sizes?: string[];
  category?: string;
};

export const products: Product[] = [
  {
    slug: "offhand-tee-black",
    title: "Tee — Black",
    price: 48,
    sizes: ["S", "M", "L", "XL"],
    category: "Apparel",
  },
  {
    slug: "offhand-tee-white",
    title: "Tee — White",
    price: 48,
    sizes: ["S", "M", "L", "XL"],
    category: "Apparel",
  },
  {
    slug: "offhand-cap",
    title: "Cap",
    price: 36,
    sizes: ["OS"],
    category: "Accessories",
  },
  {
    slug: "offhand-tote",
    title: "Tote",
    price: 28,
    sizes: ["OS"],
    sold: true,
    category: "Accessories",
  },
];

export const categories = ["All", "Apparel", "Accessories"];
