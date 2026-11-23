import { useSettings } from '../../context/SettingsContext.jsx';
import { formatPrice } from '../../lib/constants.js';

const AnnouncementBar = () => {
  const { announcement, freeShippingThreshold } = useSettings();
  const text = announcement || (freeShippingThreshold > 0 ? `🚚 شحن مجاني للطلبات فوق ${formatPrice(freeShippingThreshold)}` : '');
  if (!text) return null;
  return (
    <div className="bg-gradient-hero text-primary-foreground text-center text-xs sm:text-sm font-semibold py-2 px-4">
      {text}
    </div>
  );
};

export default AnnouncementBar;
