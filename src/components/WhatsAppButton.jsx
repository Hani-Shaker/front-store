import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

const WhatsAppButton = () => {
  const { whatsapp } = useSettings();
  if (!whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-4 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white grid place-items-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
};

export default WhatsAppButton;
