import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';

export const DEFAULT_SETTINGS = {
  storeName: 'Mero Store',
  tagline: 'أزياء وإكسسوارات بأحدث الصيحات',
  phone: '01036463602',
  whatsapp: '201036463602',
  email: 'lolostore112@gmail.com',
  address: 'مصر - الفيوم',
  instagram: '',
  facebook: '',
  deliveryFee: 50,
  freeShippingThreshold: 0,
  announcement: '',
};

const SettingsContext = createContext(DEFAULT_SETTINGS);

export const SettingsProvider = ({ children }) => {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api('/api/settings'),
    staleTime: 5 * 60_000,
    retry: 1,
  });
  return <SettingsContext.Provider value={{ ...DEFAULT_SETTINGS, ...(data || {}) }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
