"use client";

import React from 'react';
import { Input, Switch, Pagination } from '@/components/ui';
import type { Color } from '@/services/api/colorApi';
import { CustomDropdown } from '@/components/ui';
import { ColorRowSkeleton, TableSkeletonWithRows } from '@/components/ui/Skeleton';
import {
    Plus,
    Search,
    AlertCircle,
    Loader2,
    Pencil,
    X,
    Check,
    Palette
} from 'lucide-react';

interface ColorsPresenterProps {
    colors: Color[];
    loading: boolean;
    error?: string | null;
    page: number;
    pageSize: number;
    totalItems: number;
    onCreate: (payload: { name: string; hexCode?: string }) => void;
    onUpdate: (id: number, payload: { name: string; hexCode?: string }) => void;
    onToggleStatus: (id: number) => void;
    onSearchByName: (name: string) => void;
    onChangePage: (page: number) => void;
    onChangePageSize: (size: number) => void;
}

export const ColorsPresenter: React.FC<ColorsPresenterProps> = ({
    colors,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    onCreate,
    onUpdate,
    onToggleStatus,
    onSearchByName,
    onChangePage,
    onChangePageSize,
}) => {
    // Create Form State
    const [name, setName] = React.useState('');
    const [hexCode, setHexCode] = React.useState('');
    const [isCreating, setIsCreating] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [validationError, setValidationError] = React.useState('');

    // Edit State
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editName, setEditName] = React.useState('');
    const [editHexCode, setEditHexCode] = React.useState('');
    const [editValidationError, setEditValidationError] = React.useState('');

    // Debounced search
    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    React.useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            onSearchByName(searchTerm);
        }, 300);
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, onSearchByName]);

    const validateHexCode = (hex: string): boolean => {
        if (!hex) return true; // Optional field
        const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(hex);
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setValidationError('Color name is required');
            return;
        }
        
        if (hexCode && !validateHexCode(hexCode)) {
            setValidationError('Invalid hex code format (e.g., #FF5733 or FF5733)');
            return;
        }

        setValidationError('');
        setIsCreating(true);
        await onCreate({ name, hexCode: hexCode ? (hexCode.startsWith('#') ? hexCode : `#${hexCode}`) : undefined });
        setName('');
        setHexCode('');
        setIsCreating(false);
    };

    const startEdit = (c: Color) => {
        setEditingId(c.id);
        setEditName(c.name);
        setEditHexCode(c.hexCode || '');
        setEditValidationError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditHexCode('');
        setEditValidationError('');
    };

    const saveEdit = async (id: number) => {
        if (!editName.trim()) {
            setEditValidationError('Color name is required');
            return;
        }
        
        if (editHexCode && !validateHexCode(editHexCode)) {
            setEditValidationError('Invalid hex code format');
            return;
        }

        setEditValidationError('');
        await onUpdate(id, { name: editName, hexCode: editHexCode ? (editHexCode.startsWith('#') ? editHexCode : `#${editHexCode}`) : undefined });
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
                            placeholder="Search by color name..."
                            className="w-full px-4 py-2 rounded-md border border-gray-600 text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Color Name</label>
                            <Input
                                placeholder="e.g. Red"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, handleCreate)}
                                className="w-32 sm:w-40"
                                variant="white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Hex Code</label>
                            <div className="relative flex items-center">
                                <div
                                    className="absolute left-2 w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                                    style={{ backgroundColor: hexCode || '#ffffff' }}
                                />
                                <Input
                                    placeholder="#000000"
                                    value={hexCode}
                                    onChange={(e) => setHexCode(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, handleCreate)}
                                    className="pl-8 w-28 sm:w-32"
                                    variant="white"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !name.trim()}
                            className="cursor-pointer bg-black text-white px-6 py-2 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <div className="flex items-center space-x-2">
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                <span>Add Color</span>
                            </div>
                        </button>
                    </div>
                </div>
                {validationError && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationError}</span>
                    </div>
                )}
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
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/5">Color</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">Hex Code</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <TableSkeletonWithRows rows={5} rowComponent={ColorRowSkeleton} />
                            ) : colors.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Palette className="w-12 h-12 text-gray-400" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No colors found</h3>
                                                <p className="text-gray-500">Try adjusting your search or add a new color.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                colors.map((c) => {
                                    const isEditing = editingId === c.id;
                                    return (
                                        <React.Fragment key={c.id}>
                                        <tr className="hover:bg-gray-50/50 transition-all duration-300 group border-b border-gray-100/50 hover:border-indigo-100 hover:shadow-sm">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                                                        style={{ backgroundColor: (isEditing ? editHexCode : c.hexCode) || '#ffffff' }}
                                                    />
                                                    {isEditing ? (
                                                        <input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            onKeyPress={(e) => handleKeyPress(e, () => saveEdit(c.id))}
                                                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-black w-full focus:outline-none focus:ring-2 focus:ring-black/20"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    {isEditing ? (
                                                        <input
                                                            value={editHexCode?.replace('#', '') || ''}
                                                            onChange={(e) => setEditHexCode(e.target.value ? `#${e.target.value.replace('#', '')}` : '')}
                                                            onKeyPress={(e) => handleKeyPress(e, () => saveEdit(c.id))}
                                                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-black w-28 font-mono focus:outline-none focus:ring-2 focus:ring-black/20"
                                                            placeholder="000000"
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-600 font-mono">
                                                            {c.hexCode || '-'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={() => saveEdit(c.id)}
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
                                                                onClick={() => startEdit(c)}
                                                                className="text-black hover:text-gray-700 cursor-pointer"
                                                                title="Edit color"
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
                                                                onClick={() => onToggleStatus(c.id)}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${c.isActive ? "bg-black" : "bg-gray-300"
                                                                    }`}
                                                                aria-label={`Toggle status - currently ${c.isActive ? "active" : "inactive"
                                                                    }`}
                                                                title={`Click to ${c.isActive ? "deactivate" : "activate"
                                                                    } color`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${c.isActive
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
                                        {isEditing && editValidationError && (
                                            <tr>
                                                <td colSpan={3} className="px-8 py-2 bg-red-50">
                                                    <div className="flex items-center gap-2 text-red-600 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{editValidationError}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </React.Fragment>
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
