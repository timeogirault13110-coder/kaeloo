import React from 'react';
import { Star } from 'lucide-react';

const Stars = ({ value = 0, size = 12, showValue = false, className = '' }) => {
  const rounded = Math.round(value * 2) / 2; // half-star precision
  const items = [1, 2, 3, 4, 5];
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {items.map((i) => {
          const filled = rounded >= i;
          const half = !filled && rounded + 0.5 >= i;
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                className="absolute inset-0 text-neutral-300"
                style={{ width: size, height: size }}
                strokeWidth={1.5}
              />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? size / 2 : size, height: size }}
                >
                  <Star
                    className="text-yellow-500 fill-yellow-500"
                    style={{ width: size, height: size }}
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs text-neutral-600 ml-1">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default Stars;
