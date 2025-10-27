'use client';

import { useState } from 'react';

interface KPISliderProps {
  label: string;
  initialValue: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}

export default function KPISlider({
  label,
  initialValue,
  min,
  max,
  unit,
  onChange,
}: KPISliderProps) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-sm text-gray-600">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-chibic-primary"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}


