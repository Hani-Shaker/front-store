import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService.js';
import { normalizeProduct } from '../lib/constants.js';

export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await productService.getAll();
      return (Array.isArray(data) ? data : []).map(normalizeProduct);
    },
    staleTime: 60_000,
  });
