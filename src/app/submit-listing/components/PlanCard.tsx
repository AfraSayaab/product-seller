import React from "react";
import { Check, X } from "lucide-react";

interface Feature {
  label: string;
  available: boolean;
}

interface PlanCardProps {
  id: string;
  title: string;
  price: string;
  duration?: string;
  packageUrl: string;  // <- new
  features: Feature[];
  popular?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  price,
  duration,
  packageUrl,
  features,
  popular,
}) => {
  return (
    <div
      className={`relative rounded-3xl border p-8 space-y-6 transition
        ${
          popular
            ? "border-pink-500 shadow-lg scale-[1.02]"
            : "border-gray-200"
        }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pink-500 px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-semibold text-black">{title}</h2>
        <div className="text-3xl font-bold text-black">
          {price}
          {duration && (
            <span className="text-sm font-medium text-gray-500">
              {duration}
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            {feature.available ? (
              <Check className="h-5 w-5 text-pink-500" />
            ) : (
              <X className="h-5 w-5 text-gray-400" />
            )}
            <span
              className={
                feature.available
                  ? "text-gray-700"
                  : "text-gray-400"
              }
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={packageUrl}
        className={`block text-center rounded-full px-6 py-3 font-medium transition
          ${
            popular
              ? "bg-pink-500 text-white hover:bg-pink-600"
              : "border border-gray-300 text-black hover:bg-gray-100"
          }`}
      >
        Select This Plan
      </a>
    </div>
  );
};

export default PlanCard;
