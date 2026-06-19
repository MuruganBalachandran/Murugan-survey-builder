// region imports
import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/common";
import type { OffCanvasProps } from "@/types";
import { SIZE_CLASSES } from "@/utils/constants";
// endregion

// region component
export const OffCanvas = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "lg",
  zIndex = 60,
}: OffCanvasProps) => {
  // region effects

  // lock body scroll and register Escape handler while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // endregion

  if (!isOpen || typeof document === "undefined") return null;

  // region render
  return createPortal(
    <div className="fixed inset-0" style={{ zIndex }}>
      {/* backdrop — clicking closes the drawer */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-2xl",
          "animate-in slide-in-from-right duration-200",
          SIZE_CLASSES.OFFCANVAS[size],
        )}
      >
        {/* drawer header with optional description and close button */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close drawer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {/* optional sticky footer for action buttons */}
        {footer && (
          <div className="border-t border-gray-200 px-6 py-4">{footer}</div>
        )}
      </aside>
    </div>,
    document.body,
  );
  // endregion
};
// endregion
