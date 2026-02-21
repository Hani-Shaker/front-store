export const products = [
  {
    id: '1',
    name: 'حقيبة يد جلدية فاخرة',
    price: 450,
    originalPrice: 600,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    category: 'حقائب',
    colors: ['#8B4513', '#000000', '#D2691E'],
    stock: 15,
    badge: 'sale',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'ساعة يد كلاسيكية',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
    category: 'ساعات',
    colors: ['#C0C0C0', '#FFD700'],
    stock: 8,
    badge: 'bestseller',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'نظارة شمسية أنيقة',
    price: 280,
    originalPrice: 350,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    category: 'نظارات',
    colors: ['#000000', '#8B4513'],
    stock: 22,
    badge: 'sale',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'قميص قطني مريح',
    price: 180,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
    category: 'ملابس',
    colors: ['#FFFFFF', '#000080', '#808080'],
    stock: 30,
    badge: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'سوار فضي مطعم',
    price: 320,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
    category: 'مجوهرات',
    colors: ['#C0C0C0', '#FFD700'],
    stock: 12,
    badge: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'حذاء رياضي عصري',
    price: 520,
    originalPrice: 680,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'أحذية',
    colors: ['#FF0000', '#000000', '#FFFFFF'],
    stock: 18,
    badge: 'sale',
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'قبعة صيفية أنيقة',
    price: 95,
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop',
    category: 'اكسسوارات',
    colors: ['#F5DEB3', '#000000'],
    stock: 40,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    name: 'محفظة جلدية رجالية',
    price: 220,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop',
    category: 'اكسسوارات',
    colors: ['#000000', '#8B4513'],
    stock: 25,
    badge: 'bestseller',
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'فستان سهرة أنيق',
    price: 890,
    originalPrice: 1100,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    category: 'ملابس',
    colors: ['#000000', '#800020', '#000080'],
    stock: 5,
    badge: 'sale',
    createdAt: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'عقد ذهبي ناعم',
    price: 750,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    category: 'مجوهرات',
    colors: ['#FFD700'],
    stock: 7,
    badge: 'bestseller',
    createdAt: new Date().toISOString(),
  },
  {
    id: '11',
    name: 'جاكيت جلد كلاسيكي',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    category: 'ملابس',
    colors: ['#000000', '#8B4513'],
    stock: 10,
    badge: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: '12',
    name: 'حزام جلد إيطالي',
    price: 180,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'اكسسوارات',
    colors: ['#000000', '#8B4513', '#D2691E'],
    stock: 35,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const categories = [
  'الكل', 'ملابس', 'حقائب', 'أحذية', 'ساعات', 'نظارات', 'مجوهرات', 'اكسسوارات',
];

export function getDiscountedProducts() {
  return products.filter((p) => p.originalPrice && p.originalPrice > p.price);
}

export function getNewProducts() {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = products.filter((p) => new Date(p.createdAt).getTime() > oneDayAgo);
  return recent.length > 0 ? recent : products.slice(0, 6);
}

export function getSliderProducts() {
  return products.filter((p) => p.badge === 'bestseller' || p.badge === 'new').slice(0, 5);
}
