export const CATEGORIES = ['إلكترونيات', 'ملابس', 'إكسسوارات', 'ميكب', 'ادوات منزلية', 'أخرى', 'عام'];

export const CATEGORY_ICONS = {
  'إلكترونيات': '🎧',
  'ملابس': '👗',
  'إكسسوارات': '💍',
  'ميكب': '💄',
  'ادوات منزلية': '🏠',
  'أخرى': '✨',
  'عام': '🛍️',
};

export const BADGES = [
  { value: '', label: 'بدون' },
  { value: 'new', label: 'جديد' },
  { value: 'bestseller', label: 'الأكثر مبيعاً' },
  { value: 'sale', label: 'خصم' },
];

export const ORDER_STATUS = {
  pending: { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'تم التأكيد', cls: 'bg-sky-100 text-sky-800' },
  shipped: { label: 'تم الشحن', cls: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'تم التسليم', cls: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'ملغي', cls: 'bg-red-100 text-red-800' },
};

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#efeae1"/><text x="50%" y="50%" fill="#a39b8c" font-family="Arial" font-size="20" text-anchor="middle" dominant-baseline="middle">لا توجد صورة</text></svg>'
  );

export const formatPrice = (n) => `${Number(n || 0).toLocaleString('en-US')} ج.م`;

// يصغّر ويحسّن صور Cloudinary تلقائياً (أسرع تحميل)
export const optimize = (url, w = 700) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/[^/]*(f_auto|w_\d+)/.test(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
};

// ينظّف المنتج القادم من الـ API لشكل موحّد
export const normalizeProduct = (p) => {
  const variants = (Array.isArray(p.variants) ? p.variants : [])
    .filter((v) => v && v.color)
    .map((v) => ({ color: v.color, images: (v.images || []).filter(Boolean) }));
  const images = (p.images || []).filter(Boolean);
  const gallery = images.length ? images : p.image ? [p.image] : [];
  const colors = variants.length ? variants.map((v) => v.color) : (p.colors || []).filter(Boolean);
  return {
    id: p._id || p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price) || 0,
    image: gallery[0] || '',
    images: gallery,
    variants,
    category: p.category || 'عام',
    stock: p.stock || 0,
    colors, // ممكن تبقى فاضية = منتج من غير ألوان
    originalPrice: p.originalPrice || null,
    badge: p.badge || null,
    createdAt: p.createdAt,
  };
};

// صور المنتج حسب اللون المختار (لو اللون ملوش صور بنرجع الصور الأساسية)
export const getImages = (product, color) => {
  const v = color ? product.variants?.find((x) => x.color === color) : null;
  if (v?.images?.length) return v.images;
  if (product.images?.length) return product.images;
  return product.image ? [product.image] : [];
};
