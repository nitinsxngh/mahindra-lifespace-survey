export interface AmenitySeed {
  name: string;
  description: string;
  rate: number;
  remark: string;
  image: string;
  order: number;
}

export const AMENITIES: AmenitySeed[] = [
  {
    name: "My Screen",
    description: "Premium home cinema setup with large display and surround audio.",
    rate: 250,
    remark: "Per Hour",
    image: "/images/image-1.png",
    order: 1,
  },
  {
    name: "My Stage",
    description: "Spacious dance and performance studio with mirrors and barres.",
    rate: 250,
    remark: "Per Hour",
    image: "/images/image-3.png",
    order: 2,
  },
  {
    name: "My Guest",
    description: "Comfortable twin guest room with modern furnishings and decor.",
    rate: 2000,
    remark: "Per Day",
    image: "/images/image-2.png",
    order: 3,
  },
  {
    name: "My Linen",
    description: "Professional laundry facility with wash, dry, fold, and press.",
    rate: 150,
    remark: "Per Hour",
    image: "/images/image-4.png",
    order: 4,
  },
];
