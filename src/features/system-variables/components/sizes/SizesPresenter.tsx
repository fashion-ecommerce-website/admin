"use client";

import React from 'react';
import { Input } from '@/components/ui';
import type { Size } from '@/services/api/sizeApi';
import { TableSkeletonWithRows, SizeRowSkeleton } from '@/components/ui/Skeleton';
import {
  Plus,
  AlertCircle,
  Loader2,
  X,
  Check,
  Ruler
} from 'lucide-react';

interface SizesPresenterProps {
  sizes: Size[];
  loading: boolean;
  error?: string | null;
  onCreate: (payload: { code: string; label?: string }) => void;
  onUpdate: (id: number, payload: { code: string; label?: string }) => void;
  onToggleStatus: (id: number) => void;
  onSearchByCodeOrLabel: (codeOrLabel: string) => void;
}

export const SizesPresenter: React.FC<SizesPresenterProps> = ({
  sizes,
  loading,
  error,
  onCreate,
  onUpdate,
  onToggleStatus,
  onSearchByCodeOrLabel,
}) => {
  // Create Form State
  const [code, setCode] = React.useState('');
  const [label, setLabel] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Edit State
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editCode, setEditCode] = React.useState('');
  const [editLabel, setEditLabel] = React.useState('');

  // Debounced search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      onSearchByCodeOrLabel(searchTerm);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, onSearchByCodeOrLabel]);

  const handleCreate = async () => {
    if (!code.trim()) return;
    setIsCreating(true);
    await onCreate({ code, label });
    setCode('');
    setLabel('');
    setIsCreating(false);
  };

  const startEdit = (s: Size) => {
    setEditingId(s.id);
    setEditCode(s.code);
    setEditLabel(s.label || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCode('');
    setEditLabel('');
  };

  const saveEdit = async (id: number) => {
    if (!editCode.trim()) return;
    await onUpdate(id, { code: editCode, label: editLabel });
    setEditingId(null);
  };



  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <>
      {/* Search & Add Form */}
      <div className="w-full mb-6">
        <label className="block text-sm font-medium text-black mb-2">
          Search
        </label>
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="w-full lg:w-[40%]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code or label..."
              className="w-full px-4 py-2 rounded-md border border-gray-600 text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Size Code</label>
              <Input
                placeholder="e.g. XL"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleCreate)}
                className="w-24 sm:w-28"
                variant="white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label (Optional)</label>
              <Input
                placeholder="Extra Large"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleCreate)}
                className="w-32 sm:w-40"
                variant="white"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={isCreating || !code.trim()}
              className="cursor-pointer bg-black text-white px-6 py-2 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="flex items-center space-x-2">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Add Size</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded-lg border border-red-100 mb-6">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/3">Label</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-5/12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableSkeletonWithRows rows={5} rowComponent={SizeRowSkeleton} />
              ) : sizes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                        <Ruler className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No sizes found</h3>
                        <p className="text-gray-500">Try adjusting your search or add a new size.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sizes.map((s) => {
                  const isEditing = editingId === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-all duration-300 group border-b border-gray-100/50 hover:border-indigo-100 hover:shadow-sm">
                      <td className="px-8 py-6">
                        {isEditing ? (
                          <input
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, () => saveEdit(s.id))}
                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-black w-full max-w-[120px] focus:outline-none focus:ring-2 focus:ring-black/20"
                            autoFocus
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform duration-200">
                            <span className="text-xs font-bold text-indigo-600">{s.code}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, () => saveEdit(s.id))}
                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-black w-full focus:outline-none focus:ring-2 focus:ring-black/20"
                            placeholder="Label"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">{s.label || '-'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(s.id)}
                                className="cursor-pointer group relative w-10 h-10 flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-green-100 hover:border-green-200"
                                title="Save"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="cursor-pointer group relative w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-gray-100 hover:border-gray-200"
                                title="Cancel"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(s)}
                                className="text-black hover:text-gray-700 cursor-pointer"
                                title="Edit size"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <span className="text-sm font-medium text-black">
                                Status
                              </span>
                              <button
                                onClick={() => onToggleStatus(s.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${s.isActive ? "bg-black" : "bg-gray-300"
                                  }`}
                                aria-label={`Toggle status - currently ${s.isActive ? "active" : "inactive"
                                  }`}
                                title={`Click to ${s.isActive ? "deactivate" : "activate"
                                  } size`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.isActive
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                    }`}
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
};
