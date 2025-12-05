'use client';

import React, { useRef } from 'react';
import Papa from 'papaparse';
import { CustomDropdown } from '../../../components/ui/CustomDropdown';

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

interface EditForm {
  title: string;
  category: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  imageUrls: string[];
}

interface ProductDetail {
  productTitle?: string;
  title?: string;
  description?: string;
  category?: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  imageUrls?: string[];
  isError?: boolean;
  error?: boolean;
  errorMessage?: string;
}

interface ProductGroup {
  productTitle?: string;
  description?: string;
  category?: string;
  productDetails?: ProductDetail[];
}

interface UploadedZipFile {
  name: string;
  size: number;
  file: File;
}

interface ImportCSVPresenterProps {
  uploadedFile: UploadedFile | null;
  uploadedZips: UploadedZipFile[];
  previewData: ProductGroup[];
  previewLoading: boolean;
  error: string | null;
  isEditOpen: boolean;
  editForm: EditForm;
  newImageUrl: string;
  allowedColors: string[];
  allowedSizes: string[];
  allowedCategories: string[];
  onFileChange: (file: File) => void;
  onZipFilesChange: (files: File[]) => void;
  onRemoveZip: (index: number) => void;
  onStartPreview: () => void;
  onDeleteProduct: (idx: number) => void;
  onEditProduct: (idx: number) => void;
  onSave: () => void;
  onBack: () => void;
  onCloseEditModal: () => void;
  onRemoveImage: (idx: number) => void;
  onAddImageUrl: () => void;
  onImageFileUpload: (files: File[]) => void;
  onSaveEdit: () => void;
  onEditFormChange: (form: EditForm) => void;
  onNewImageUrlChange: (url: string) => void;
}

const ImportCSVPresenter: React.FC<ImportCSVPresenterProps> = ({
  uploadedFile,
  uploadedZips,
  previewData,
  previewLoading,
  error,
  isEditOpen,
  editForm,
  newImageUrl,
  allowedColors,
  allowedSizes,
  allowedCategories,
  onFileChange,
  onZipFilesChange,
  onRemoveZip,
  onStartPreview,
  onDeleteProduct,
  onEditProduct,
  onSave,
  onBack,
  onCloseEditModal,
  onRemoveImage,
  onAddImageUrl,
  onImageFileUpload,
  onSaveEdit,
  onEditFormChange,
  onNewImageUrlChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const expectedHeaders = [
    'Product Title', 'Description', 'Category', 'Color', 'IMG', 'Size', 'Quantity', 'Price'
  ];

  const downloadTemplate = () => {
    const headers = expectedHeaders;
    const csvContent = Papa.unparse([headers], {
      delimiter: ';',
      quotes: false,
      newline: '\r\n'
    });

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const allDetails = previewData.flatMap((group) => {
    const details = group.productDetails || [];
    return details.map((detail) => ({
      ...detail,
      isError: detail.error || detail.isError,
      productTitle: detail.productTitle ?? group.productTitle ?? detail.title ?? '',
      description: detail.description ?? group.description ?? '',
      category: detail.category ?? group.category ?? '',
    }));
  });

  const totalProducts = allDetails.length;
  const errorProducts = allDetails.filter((detail) => detail.isError).length;

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-white to-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-white/90 shadow-sm">
        <button onClick={onBack} className="text-black px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition font-medium flex items-center gap-2 shadow-sm cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Import Products from CSV</h1>
      </div>

      <div className="flex flex-1 flex-row gap-4 p-4 w-full items-start">
        {/* Left: Upload */}
        <div className="w-[240px] flex-shrink-0 bg-white rounded-2xl shadow-xl p-3 flex flex-col items-center border border-gray-200 self-start">
          {/* CSV Upload */}
          <div className="w-full mb-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-1">1. Upload CSV File</h3>
            <label htmlFor="csv-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-2 cursor-pointer hover:border-black transition-colors bg-white w-full min-h-[60px] group">
              <span className="text-xl text-gray-400 group-hover:text-black select-none">📄</span>
              <span className="font-medium text-gray-700 text-center text-xs">Select CSV</span>
              <input
                id="csv-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileChange(file);
                  e.target.value = '';
                }}
              />
            </label>
            {uploadedFile && (
              <div className="mt-2 w-full flex items-center justify-between bg-green-50 rounded-lg p-2 border border-green-200">
                <span className="text-sm font-medium text-green-800 truncate max-w-[180px]">✓ {uploadedFile.name}</span>
                <span className="text-xs text-green-600">{(uploadedFile.size / 1024).toFixed(0)} KB</span>
              </div>
            )}
          </div>

          {/* ZIP Upload */}
          <div className="w-full mb-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-1">2. Upload ZIP Files</h3>
            <label htmlFor="zip-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-2 cursor-pointer hover:border-black transition-colors bg-white w-full min-h-[60px] group">
              <span className="text-xl text-gray-400 group-hover:text-black select-none">📦</span>
              <span className="font-medium text-gray-700 text-center text-xs">Select ZIPs</span>
              <input
                id="zip-upload"
                ref={zipInputRef}
                type="file"
                accept=".zip"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) onZipFilesChange(files);
                  e.target.value = '';
                }}
              />
            </label>
            {uploadedZips.length > 0 && (
              <div className="mt-1 w-full space-y-1 max-h-[100px] overflow-y-auto">
                {uploadedZips.map((zip, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-blue-50 rounded p-1.5 border border-blue-200">
                    <span className="text-xs font-medium text-blue-800 truncate max-w-[120px]">📦 {zip.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600">{(zip.size / 1024).toFixed(0)} KB</span>
                      <button
                        type="button"
                        onClick={() => onRemoveZip(idx)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Button */}
          <button
            type="button"
            className="w-full px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-900 text-xs font-semibold shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onStartPreview}
            disabled={!uploadedFile || uploadedZips.length === 0 || previewLoading}
          >
            {previewLoading ? (
              <span className="flex items-center justify-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : (
              'Preview Import'
            )}
          </button>

          <button
            type="button"
            className="mt-2 w-full px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-50 text-xs border border-gray-300 font-medium cursor-pointer"
            onClick={downloadTemplate}
          >
            Download Template
          </button>
          
          {error && <div className="mt-2 text-red-600 text-xs w-full text-center">{error}</div>}
        </div>

        {/* Right: Preview */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl p-4 flex flex-col border border-gray-200 min-w-0 relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-black">Preview Products</h2>
              {totalProducts > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    Total: {totalProducts}
                  </span>
                  {errorProducts > 0 && (
                    <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-sm font-semibold">
                      Errors: {errorProducts}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              className="px-6 py-2 rounded-xl bg-black hover:bg-gray-900 text-white font-bold shadow-lg transition text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ position: 'relative', zIndex: 2 }}
              disabled={allDetails.length === 0 || previewLoading}
              onClick={onSave}
            >
              <svg className="w-5 h-5 inline-block mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Save All
            </button>
          </div>

          {previewLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[180px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
              <span className="text-gray-600 mt-2">Loading preview...</span>
            </div>
          ) : allDetails.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[560px] text-gray-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/file.svg" alt="No data" className="w-10 h-10 mb-2 opacity-70" />
              <span className="text-base">No preview data. Please upload a CSV file.</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-lg border border-gray-100 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">Image</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Product Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Color</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Size</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allDetails.map((row, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        {row.imageUrls && row.imageUrls.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={row.imageUrls[0]} 
                            alt="Prd" 
                            className="w-10 h-10 object-cover rounded border border-gray-200" 
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
                        )}
                      </td>
     
                      <td className={`px-4 py-3 max-w-[200px] truncate ${row.isError ? 'text-red-500' : 'text-black'}`} title={row.productTitle || row.title}>{row.productTitle || row.title || ''}</td>
                      <td className={`px-4 py-3 ${row.isError ? 'text-red-500' : 'text-black'}`}>{row.category || ''}</td>
                      <td className={`px-4 py-3 ${row.isError ? 'text-red-500' : 'text-black'}`}>{row.color || ''}</td>
                      <td className={`px-4 py-3 ${row.isError ? 'text-red-500' : 'text-black'}`}>{row.size || ''}</td>
                      <td className={`px-4 py-3 ${row.isError ? 'text-red-500' : 'text-black'}`}>{row.price}</td>
                      <td className={`px-4 py-3 ${row.isError ? 'text-red-500' : 'text-black'}`}>{row.quantity}</td>
                      <td className="px-4 py-3">
                        {row.isError ? (
                          <div className="group relative inline-block">
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 border border-red-200 cursor-help font-medium">
                              Error
                            </span>
                            <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                              {row.errorMessage || 'Unknown error'}
                              <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200 font-medium">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditProduct(idx)}
                            className="text-sm px-3 py-1 border border-black rounded text-black bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteProduct(idx)}
                            className="text-sm px-3 py-1 border border-black text-black rounded bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border-2 border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4">Edit Row</h3>

            {/* Image Gallery */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Product Images</label>

              {editForm.imageUrls && editForm.imageUrls.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 mb-3 pt-2 px-1">
                  {editForm.imageUrls.map((url, idx: number) => (
                    <div key={idx} className="relative group flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Product ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        className="absolute top-0 -right-1 w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold cursor-pointer shadow-md opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => onNewImageUrlChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onAddImageUrl()}
                    placeholder="Enter image URL"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                  />
                  <button
                    type="button"
                    onClick={onAddImageUrl}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 text-sm font-medium cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                <div>
                  <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer text-sm font-medium border border-gray-300">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        onImageFileUpload(files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="ml-2 text-xs text-gray-500">Multiple images supported</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => onEditFormChange({ ...editForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <CustomDropdown
                  value={editForm.category}
                  onChange={(value) => onEditFormChange({ ...editForm, category: value })}
                  options={allowedCategories.map(c => ({ value: c, label: c }))}
                  placeholder="Select category"
                  borderRadius="rounded-lg"
                  padding="px-3 py-2"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Color</label>
                  <CustomDropdown
                    value={editForm.color}
                    onChange={(value) => onEditFormChange({ ...editForm, color: value })}
                    options={allowedColors.map(c => ({ value: c, label: c }))}
                    placeholder="Select color"
                    borderRadius="rounded-lg"
                    padding="px-3 py-2"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Size</label>
                  <CustomDropdown
                    value={editForm.size}
                    onChange={(value) => onEditFormChange({ ...editForm, size: value })}
                    options={allowedSizes.map(s => ({ value: s, label: s }))}
                    placeholder="Select size"
                    borderRadius="rounded-lg"
                    padding="px-3 py-2"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => onEditFormChange({ ...editForm, price: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => onEditFormChange({ ...editForm, quantity: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={onCloseEditModal} className="px-4 py-2 rounded-lg border border-gray-300 text-black bg-white hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={onSaveEdit} className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportCSVPresenter;
