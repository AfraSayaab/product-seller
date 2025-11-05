"use client";

import * as React from "react";
import { X } from "lucide-react";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export default function CustomModal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
}: CustomModalProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Handle open/close animations with optimized performance
  React.useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      
      // Start animation immediately without blocking
      requestAnimationFrame(() => {
        setIsVisible(true);
        // Use small delay to ensure smooth animation
        setTimeout(() => setIsAnimating(true), 10);
      });

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Allow body scroll when modal closes
      document.body.style.overflow = "";
      
      setIsAnimating(false);
      const timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 200); // Match animation duration
      
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Close on overlay click
  const handleOverlayClick = React.useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  if (!isVisible && !open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ease-out ${
        isAnimating
          ? "bg-black/60 backdrop-blur-md opacity-100"
          : "bg-black/0 backdrop-blur-0 opacity-0"
      }`}
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-out ${
          isAnimating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content with smooth scrolling */}
        <div className="overflow-y-auto max-h-[calc(95vh-8rem)] sm:max-h-[calc(90vh-8rem)] p-5 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}

