import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-background-surface border border-border-subtle rounded-2xl shadow-floating overflow-hidden animate-slide-up sm:my-8">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gray-50/50 dark:bg-zinc-900/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-zinc-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default Modal;
