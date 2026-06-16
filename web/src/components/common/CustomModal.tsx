// region imports
import { Button } from "@/components/ui/Button";
import type { CustomModalProps } from "@/types";
import { getModalVariantStyles } from "@/utils/common";
// endregion

// region helpers

// fallback info icon used when no custom icon is provided
const DefaultIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

// endregion

// region component
export const CustomModal = ({
  isOpen,
  title,
  description,
  variant = "default",
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  children,
  icon,
  zIndex = 80,
}: CustomModalProps) => {
  if (!isOpen) return null;

  const variantStyles = getModalVariantStyles(variant);

  // region handlers

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Modal confirm error:", error);
    }
  };

  // endregion

  // region render
  return (
    <>
      {/* backdrop — clicking closes the modal */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        style={{ zIndex: zIndex - 1 }}
        onClick={onClose}
        role="presentation"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex }}>
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white shadow-lg animate-fade-in">
          {/* modal header — icon, title, description, close button */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className={variantStyles.iconBg}>
                {icon ?? (
                  <DefaultIcon
                    className={`h-6 w-6 ${variantStyles.iconColor}`}
                  />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-gray-600">{description}</p>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Close modal"
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
          </div>

          {/* optional slot content */}
          {children && <div className="px-6 py-4">{children}</div>}

          {/* modal footer — cancel and confirm actions */}
          <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-6">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="secondary"
              fullWidth
              className="bg-gray-100 !text-gray-700 !border-none !shadow-none"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              isLoading={isLoading}
              disabled={isLoading}
              className={`w-full ${variantStyles.confirmButtonClass} text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50`}
              fullWidth
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
  // endregion
};
// endregion
