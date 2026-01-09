import { AlertCircle, CheckCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg flex items-center justify-between shadow-lg`}>
      <div className="flex items-center space-x-2">
        <Icon size={20} />
        <span>{message}</span>
      </div>
      <button onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;
