import { RefreshCw, WifiOff } from 'lucide-react';

const ErrorState = ({ message = 'تعذر تحميل البيانات', onRetry }) => (
  <div className="text-center py-20">
    <WifiOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
    <p className="text-lg font-bold text-foreground mb-1">{message}</p>
    <p className="text-sm text-muted-foreground mb-5">تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">
        <RefreshCw className="w-4 h-4" /> إعادة المحاولة
      </button>
    )}
  </div>
);

export default ErrorState;
