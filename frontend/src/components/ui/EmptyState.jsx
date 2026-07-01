import React from "react";
import Button from "./Button";
import Card from "./Card";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onActionClick
}) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-10 sm:p-14 max-w-xl mx-auto border-dashed border-2 border-border-custom bg-slate-950/20">
      {Icon && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-border-custom text-text-sec mb-4 shadow-sm shadow-slate-950">
          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-text-main mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-text-sec max-w-xs sm:max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onActionClick && (
        <Button variant="secondary" size="sm" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </Card>
  );
}
