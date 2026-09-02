import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { adToBs, bsToAd } from '../utils/nepaliCalendar';

interface DualDatePickerProps {
  dateBS: string;
  dateAD: string;
  onChange: (bs: string, ad: string) => void;
  label?: string;
  showCycleIndicator?: boolean;
}

export const DualDatePicker: React.FC<DualDatePickerProps> = ({
  dateBS,
  dateAD,
  onChange,
  label = 'Transaction Date',
  showCycleIndicator = true,
}) => {
  const [localBS, setLocalBS] = useState(dateBS || '2081-01-25');
  const [localAD, setLocalAD] = useState(dateAD || '2024-05-07');

  useEffect(() => {
    if (dateBS) setLocalBS(dateBS);
    if (dateAD) setLocalAD(dateAD);
  }, [dateBS, dateAD]);

  const handleBSChange = (newBS: string) => {
    setLocalBS(newBS);
    if (/^\d{4}-\d{2}-\d{2}$/.test(newBS)) {
      try {
        const { adString } = bsToAd(newBS);
        setLocalAD(adString);
        onChange(newBS, adString);
      } catch {
        onChange(newBS, localAD);
      }
    } else {
      onChange(newBS, localAD);
    }
  };

  const handleADChange = (newAD: string) => {
    setLocalAD(newAD);
    if (newAD) {
      try {
        const { bsString } = adToBs(new Date(newAD));
        setLocalBS(bsString);
        onChange(bsString, newAD);
      } catch {
        onChange(localBS, newAD);
      }
    }
  };

  const dayParts = localBS.split('-').map(Number);
  const bsDay = dayParts[2] || 1;
  const isCollectionPhase = bsDay <= 25;

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            {label} (Dual BS / AD)
          </label>
          {showCycleIndicator && (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isCollectionPhase
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isCollectionPhase ? '● Day 1-25: Saving Collection' : '● Day 26+: Meeting & Admin'}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* BS Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
              BS
            </span>
          </div>
          <input
            type="text"
            placeholder="YYYY-MM-DD (e.g. 2081-01-25)"
            value={localBS}
            onChange={(e) => handleBSChange(e.target.value)}
            className="w-full pl-12 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-mono"
          />
        </div>

        {/* AD Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              AD
            </span>
          </div>
          <input
            type="date"
            value={localAD}
            onChange={(e) => handleADChange(e.target.value)}
            className="w-full pl-12 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
