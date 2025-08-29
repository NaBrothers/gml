import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          border: 'border-yellow-200'
        };
      case 'info':
        return {
          icon: 'text-blue-500',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200'
        };
      default:
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* 对话框 */}
      <div className={`relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border ${styles.border} p-6 mx-4 max-w-md w-full transform transition-all duration-200 scale-100`}>
        {/* 关闭按钮 */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 图标和标题 */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-full bg-gray-50 ${styles.icon}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        {/* 消息内容 */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* 按钮组 */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;