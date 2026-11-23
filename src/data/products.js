
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

// GET All Products
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/api/products`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.error ||
        errorData.message ||
        `Server Error: ${response.status}`
      );
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('❌ Error fetching products:', error);

    throw error;
  }
};

// GET Discounted Products
export const getDiscountedProducts = async () => {
  try {
    const allProducts = await getProducts();

    return allProducts
      .filter(p => p.discount && p.discount > 0)
      .slice(0, 6);

  } catch (error) {
    console.error('❌ Error fetching discounted products:', error);

    throw error;
  }
};

// Default Products
export const products = [];

// Hero Slider
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

// Categories
export const categories = [
  'الكل',
  'إلكترونيات',
  'ملابس',
  'إكسسوارات',
  'ميكب',
  'ادوات منزلية',
  'أخرى'
];
