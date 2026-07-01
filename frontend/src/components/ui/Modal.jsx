import React from "react";
import Button from "./Button";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = "Confirm",
  onConfirm,
  type = "info"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="bg-card-bg border border-border-custom rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          {title && (
            <h3 className="text-lg font-semibold text-text-main mb-2">
              {title}
            </h3>
          )}
          <div className="text-sm text-text-sec">
            {children}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950/40 border-t border-border-custom">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant={type === "danger" ? "danger" : "primary"} 
            size="sm" 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
