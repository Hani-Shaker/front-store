const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getDiscountedProducts = async () => {
  try {
    const allProducts = await getProducts();
    return allProducts.filter(p => p.discount && p.discount > 0).slice(0, 6);
  } catch (error) {
    console.error('Error fetching discounted products:', error);
    return [];
  }
};

// بيانات افتراضية للـ Slider في البداية
export const products = [];

// صور للـ Hero Slider (اختياري)
export const heroSlides = [
  {
    id: 1,
    title: 'أفضل العروض',
    description: 'اكتشف منتجاتنا الجديدة',
    image: 'https://via.placeholder.com/1200x400?text=Slide+1',
    link: '/products'
  },
  {
    id: 2,
    title: 'تخفيضات كبيرة',
    description: 'احصل على خصومات تصل إلى 50%',
    image: 'https://via.placeholder.com/1200x400?text=Slide+2',
    link: '/products'
  },
  {
    id: 3,
    title: 'منتجات حصرية',
    description: 'تسوق من أفضل الماركات',
    image: 'https://via.placeholder.com/1200x400?text=Slide+3',
    link: '/products'
  }
];

export const categories = ['الكل', 'إلكترونيات', 'ملابس', 'إكسسوارات', 'أثاث'];