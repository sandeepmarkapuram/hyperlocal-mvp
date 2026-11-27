export type StoreCategory = 'Kirana' | 'Bakery' | 'Fresh Produce';

export interface Store {
  id: string;
  name: string;
  category: StoreCategory;
  distance: string;
  deliveryTime: string;
  rating: number;
  address: string;
  image: string;
  tags: string[];
}

export interface Item {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  inStock: boolean;
}

export type OrderStatus = 'received' | 'accepted' | 'packed' | 'out-for-delivery' | 'delivered';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMode: 'upi' | 'cod';
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  // Supabase auth user who placed the order (undefined for guest orders).
  userId?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  qty: number;
  image: string;
}

export const STORES: Store[] = [
  {
    id: 's1',
    name: 'RR Nagar Kirana',
    category: 'Kirana',
    distance: '1.2 km',
    deliveryTime: '20 mins',
    rating: 4.7,
    address: '2nd Block, RR Nagar, Bengaluru - 560098',
    image: '🏪',
    tags: ['Staples', 'Snacks', 'Beverages', 'Dairy'],
  },
  {
    id: 's2',
    name: 'Sweet Corner Bakery',
    category: 'Bakery',
    distance: '0.8 km',
    deliveryTime: '25 mins',
    rating: 4.5,
    address: 'Main Road, RR Nagar, Bengaluru - 560098',
    image: '🥐',
    tags: ['Cakes', 'Bread', 'Puffs', 'Cookies'],
  },
  {
    id: 's3',
    name: 'Fresh Basket Produce',
    category: 'Fresh Produce',
    distance: '1.5 km',
    deliveryTime: '30 mins',
    rating: 4.8,
    address: '5th Block, RR Nagar, Bengaluru - 560098',
    image: '🍎',
    tags: ['Vegetables', 'Fruits', 'Dairy'],
  },
];

export const ITEMS: Item[] = [
  // RR Nagar Kirana (s1)
  { id: 'i1', storeId: 's1', name: 'Basmati Rice', category: 'Staples', price: 549, unit: '5 kg', image: '🍚', inStock: true },
  { id: 'i2', storeId: 's1', name: 'Toor Dal', category: 'Staples', price: 105, unit: '1 kg', image: '🌰', inStock: true },
  { id: 'i3', storeId: 's1', name: 'Sunflower Oil', category: 'Staples', price: 159, unit: '1 L', image: '🛢️', inStock: true },
  { id: 'i4', storeId: 's1', name: 'Wheat Flour (Aata)', category: 'Staples', price: 45, unit: '1 kg', image: '🌾', inStock: true },
  { id: 'i5', storeId: 's1', name: 'Tea Powder', category: 'Beverages', price: 110, unit: '250 g', image: '☕', inStock: true },
  { id: 'i6', storeId: 's1', name: 'Marie Biscuits', category: 'Snacks', price: 30, unit: 'pack', image: '🍪', inStock: true },
  // Sweet Corner Bakery (s2)
  { id: 'i7', storeId: 's2', name: 'Croissant', category: 'Bakery', price: 45, unit: 'each', image: '🥐', inStock: true },
  { id: 'i8', storeId: 's2', name: 'Brown Bread', category: 'Bakery', price: 40, unit: 'loaf', image: '🍞', inStock: true },
  { id: 'i9', storeId: 's2', name: 'Chocolate Cake', category: 'Bakery', price: 350, unit: '500 g', image: '🍰', inStock: true },
  { id: 'i10', storeId: 's2', name: 'Veg Puff', category: 'Bakery', price: 25, unit: 'each', image: '🥟', inStock: true },
  { id: 'i11', storeId: 's2', name: 'Assorted Cookie Box', category: 'Bakery', price: 120, unit: 'box', image: '🍪', inStock: true },
  // Fresh Basket Produce (s3)
  { id: 'i12', storeId: 's3', name: 'Tomatoes', category: 'Produce', price: 40, unit: '1 kg', image: '🍅', inStock: true },
  { id: 'i13', storeId: 's3', name: 'Onions', category: 'Produce', price: 30, unit: '1 kg', image: '🧅', inStock: true },
  { id: 'i14', storeId: 's3', name: 'Bananas', category: 'Produce', price: 60, unit: 'dozen', image: '🍌', inStock: true },
  { id: 'i15', storeId: 's3', name: 'Toned Milk', category: 'Dairy', price: 62, unit: '1 L', image: '🥛', inStock: true },
  { id: 'i16', storeId: 's3', name: 'Fresh Paneer', category: 'Dairy', price: 90, unit: '200 g', image: '🧀', inStock: true },
  { id: 'i17', storeId: 's3', name: 'Coriander', category: 'Produce', price: 15, unit: 'bunch', image: '🌿', inStock: true },
];

export const CATEGORIES: StoreCategory[] = ['Kirana', 'Bakery', 'Fresh Produce'];

export function findStore(id: string) {
  return STORES.find((s) => s.id === id);
}

export function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);
}