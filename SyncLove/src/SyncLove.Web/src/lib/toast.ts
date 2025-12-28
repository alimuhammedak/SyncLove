/**
 * Toast notification utilities using react-hot-toast.
 * Provides consistent styling and easy-to-use functions.
 */
import toast from 'react-hot-toast';

/**
 * Show a success toast notification.
 */
export const showSuccess = (message: string) => {
    toast.success(message, {
        style: {
            background: 'rgba(34, 197, 94, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 20px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: 'rgba(34, 197, 94, 0.9)',
        },
    });
};

/**
 * Show an error toast notification.
 */
export const showError = (message: string) => {
    toast.error(message, {
        style: {
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 20px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: 'rgba(239, 68, 68, 0.9)',
        },
    });
};

/**
 * Show an info toast notification.
 */
export const showInfo = (message: string) => {
    toast(message, {
        icon: 'ℹ️',
        style: {
            background: 'rgba(59, 130, 246, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 20px',
        },
    });
};

/**
 * Show a loading toast and return the toast ID for later dismissal.
 */
export const showLoading = (message: string): string => {
    return toast.loading(message, {
        style: {
            background: 'rgba(107, 114, 128, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 20px',
        },
    });
};

/**
 * Dismiss a specific toast by ID.
 */
export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};

export default toast;
