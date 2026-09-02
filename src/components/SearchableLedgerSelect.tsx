import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Building2, Wallet, Layers, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { LedgerAccount } from '../types';

interface SearchableLedgerSelectProps {
  id?: string;
  ledgers: LedgerAccount[];
  value: string;
  onChange: (ledgerId: string) => void;
  placeholder?: string;
  filterFn?: (ledger: LedgerAccount) => boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  badgeType?: 'DR' | 'CR' | 'NONE';
}

export const SearchableLedgerSelect: React.FC<SearchableLedgerSelectProps> = ({
  id,
  ledgers,
  value,
  onChange,
  placeholder = 'Type ledger name or code...',
  filterFn,
  disabled = false,
  className = '',
  autoFocus = false,
  badgeType = 'NONE',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter ledgers by optional custom filter first
  const eligibleLedgers = useMemo(() => {
    return filterFn ? ledgers.filter(filterFn) : ledgers;
  }, [ledgers, filterFn]);

  // Selected ledger object
  const selectedLedger = useMemo(() => {
    return ledgers.find((l) => l.id === value);
  }, [ledgers, value]);

  // Filtered by user typing query
  const filteredLedgers = useMemo(() => {
    if (!query.trim()) return eligibleLedgers;
    const q = query.toLowerCase().trim();
    return eligibleLedgers.filter((l) => {
      const codeMatch = l.code?.toLowerCase().includes(q);
      const nameMatch = l.name.toLowerCase().includes(q);
      const tierMatch = l.tier2?.toLowerCase().includes(q);
      const groupMatch = l.majorGroup?.toLowerCase().includes(q);
      return codeMatch || nameMatch || tierMatch || groupMatch;
    });
  }, [eligibleLedgers, query]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredLedgers.length]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < filteredLedgers.length - 1 ? prev + 1 : 0));
        scrollHighlightedIntoView(highlightedIndex + 1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredLedgers.length - 1));
        scrollHighlightedIntoView(highlightedIndex - 1);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredLedgers[highlightedIndex]) {
        selectLedger(filteredLedgers[highlightedIndex]);
      } else if (!isOpen) {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'Tab') {
      if (isOpen && filteredLedgers[highlightedIndex]) {
        selectLedger(filteredLedgers[highlightedIndex]);
      }
      setIsOpen(false);
    }
  };

  const scrollHighlightedIntoView = (index: number) => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const selectLedger = (ledger: LedgerAccount) => {
    onChange(ledger.id);
    setQuery('');
    setIsOpen(false);
  };

  const handleOpenDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger & Search Bar Input */}
      <div
        onClick={handleOpenDropdown}
        className={`relative flex items-center justify-between w-full px-2.5 py-1.5 text-xs bg-white border rounded-lg transition-all cursor-text shadow-2xs ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-75' : ''}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          
          {isOpen ? (
            <input
              ref={inputRef}
              id={id}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={selectedLedger ? `${selectedLedger.code} - ${selectedLedger.name}` : placeholder}
              className="w-full bg-transparent border-none p-0 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-0"
              autoFocus={autoFocus || isOpen}
            />
          ) : selectedLedger ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
              <span className="font-mono font-bold text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                {selectedLedger.code}
              </span>
              <span className="font-bold text-slate-900 truncate">
                {selectedLedger.name}
              </span>
              {selectedLedger.currentBalance !== undefined && (
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline shrink-0">
                  (Rs {Math.abs(selectedLedger.currentBalance).toLocaleString()})
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {badgeType !== 'NONE' && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                badgeType === 'DR'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {badgeType}
            </span>
          )}

          {selectedLedger && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear selection"
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </div>

      {/* Floating Typeahead Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Quick Counter / Helper header */}
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>
              {filteredLedgers.length} ledger{filteredLedgers.length === 1 ? '' : 's'} available
            </span>
            <span className="text-slate-400">↑↓ to navigate, Enter to select</span>
          </div>

          <ul ref={listRef} className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredLedgers.length === 0 ? (
              <li className="p-3 text-xs text-center text-slate-400">
                No matching ledger found for "{query}"
              </li>
            ) : (
              filteredLedgers.map((l, index) => {
                const isSelected = l.id === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={l.id}
                    onClick={() => selectLedger(l)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-950 font-bold'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {l.code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 truncate">
                          {highlightMatch(l.name, query)}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                          <span>{l.majorGroup}</span>
                          <span>•</span>
                          <span>{l.tier2?.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {l.currentBalance !== undefined && (
                        <span className="font-mono text-[11px] text-slate-600">
                          Rs {(l.currentBalance || 0).toLocaleString()}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper function to highlight typed matching query substring
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (index === -1) return text;
  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);
  return (
    <>
      {before}
      <span className="bg-amber-200 text-amber-950 rounded-xs px-0.5 font-bold">{match}</span>
      {after}
    </>
  );
}
