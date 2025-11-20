"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiClient } from '../../../services/api/baseApi';
import Papa from 'papaparse';

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

const ImportCSVPage: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Allowed values provided by DB for Color and Size
  const allowedColors = ['black', 'white', 'dark blue', 'red', 'pink', 'orange', 'mint', 'brown', 'yellow'];
  const allowedSizes = ['S', 'M', 'L', 'XL', 'F'];
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);
  const [editForm, setEditForm] = useState<{ title: string; category: string; color: string; size: string; price: number; quantity: number }>({
    title: '',
    category: '',
    color: '',
    size: '',
    price: 0,
    quantity: 0,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({ name: file.name, size: file.size, file });
      // Normalize CSV before preview
      normalizeCsvFile(file)
        .then((normalizedFile) => handlePreview(normalizedFile))
        .catch((err) => setError(err.message || 'Failed to normalize CSV'));
    }
  };

  const handlePreview = async (file: File | Blob) => {
    setPreviewLoading(true);
    setError(null);
    setPreviewData([]);
    try {
      const formData = new FormData();
      // If Blob, wrap into File so backend receives a filename
      const toSend = file instanceof File ? file : new File([file], uploadedFile?.name || 'import.csv', { type: 'text/csv' });
      formData.append('file', toSend);
      const res = await adminApiClient.post<any[]>('/products/import/preview', formData as unknown as FormData);
      if (!res.success) throw new Error(res.message || 'Failed to preview CSV');
      setPreviewData(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Fetch active categories for dropdown
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await adminApiClient.get<any[]>("/categories/active-tree");
        if (!res.success || !res.data) return;
        const names: string[] = [];
        const walk = (nodes: any[]) => {
          for (const n of nodes || []) {
            if (n && typeof n.name === 'string') names.push(n.name);
            if (Array.isArray(n?.children) && n.children.length) walk(n.children);
          }
        };
        walk(res.data as any[]);
        const unique = Array.from(new Set(names));
        unique.sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
        if (mounted) setAllowedCategories(unique);
      } catch (e) {
        // Silently ignore fetch errors; dropdown will just be empty
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteProduct = (idx: number) => {
    setPreviewData((prev) => {
      // Map flattened index to group/detail indices
      let currentIndex = 0;
      const newGroups = prev.map((group: any) => {
        const details = group.productDetails || [];
        const updatedDetails = details.filter((_: any, dIdx: number) => {
          const match = currentIndex === idx;
          currentIndex += 1;
          return !match; // remove matched detail
        });
        return { ...group, productDetails: updatedDetails };
      }).filter((g: any) => (g.productDetails || []).length > 0); // drop empty groups
      return newGroups;
    });
  };

  // TODO: Implement edit logic
  const handleEditProduct = (idx: number) => {
    // Find flattened row
    let currentIndex = 0;
    let found: any | null = null;
    let foundGroup: any | null = null;
    for (const group of previewData) {
      const details = group.productDetails || [];
      for (const row of details) {
        if (currentIndex === idx) {
          found = row;
          foundGroup = group;
          break;
        }
        currentIndex += 1;
      }
      if (found) break;
    }
    if (!found) return;
    setEditingIndex(idx);
    setEditForm({
      title: found.productTitle ?? found.title ?? foundGroup?.productTitle ?? foundGroup?.title ?? '',
      category: found.category ?? foundGroup?.category ?? '',
      color: found.color ?? '',
      size: found.size ?? '',
      price: Number(found.price ?? 0),
      quantity: Number(found.quantity ?? 0),
    });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingIndex(null);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    // Basic validation
    if (!editForm.title || !editForm.color || !editForm.size) {
      setError('Please fill Title, Color, Size.');
      return;
    }
    if (isNaN(editForm.price) || editForm.price < 0 || isNaN(editForm.quantity) || editForm.quantity < 0) {
      setError('Price and Quantity must be non-negative numbers.');
      return;
    }
    setError(null);
    setPreviewData((prev) => {
      let currentIndex = 0;
      return prev.map((group: any) => {
        const details = group.productDetails || [];
        let touchedThisGroup = false;
        const updatedDetails = details.map((row: any) => {
          const isTarget = currentIndex === editingIndex;
          currentIndex += 1;
          if (!isTarget) return row;
          // Update fields; keep original keys (productTitle/title)
          const next: any = { ...row };
          if ('productTitle' in next) {
            next.productTitle = editForm.title;
          } else {
            next.title = editForm.title;
          }
          next.category = editForm.category;
          next.color = editForm.color;
          next.size = editForm.size;
          next.price = editForm.price;
          next.quantity = editForm.quantity;
          touchedThisGroup = true;
          return next;
        });
        // If the edited row belongs to this group, also update group-level title for consistency in preview
        const updatedGroup = touchedThisGroup ? { ...group, productTitle: editForm.title, category: editForm.category } : group;
        return { ...updatedGroup, productDetails: updatedDetails };
      });
    });
    closeEditModal();
  };

  const handleSave = async () => {
    setError(null);
    try {
      const res = await adminApiClient.post<{ imported: number; failed?: number }>('/products/import/save', previewData);
      if (!res.success) throw new Error(res.message || 'Failed to save products');
      // Optionally: show success, redirect, etc.
      router.push('/products');
    } catch (err: any) {
      setError(err.message || 'Save failed');
    }
  };

  // ===== CSV normalization helpers (FE-only, no BE changes) =====
  const expectedHeaders = [
    'Product Title', 'Description', 'Category', 'Color', 'IMG', 'Size', 'Quantity', 'Price'
  ];

  const aliasMap: Record<string, string> = {
    // Product Title
    producttitle: 'Product Title', title: 'Product Title', productname: 'Product Title', product_name: 'Product Title', name: 'Product Title',
    // Description
    description: 'Description', desc: 'Description',
    // Category
    category: 'Category', categories: 'Category', cate: 'Category',
    // Color
    color: 'Color', colour: 'Color',
    // IMG
    img: 'IMG', image: 'IMG', images: 'IMG', imageurl: 'IMG', image_urls: 'IMG', image_links: 'IMG', image_link: 'IMG',
    // Size
    size: 'Size', sizecode: 'Size', size_code: 'Size',
    // Quantity
    quantity: 'Quantity', qty: 'Quantity', stock: 'Quantity',
    // Price
    price: 'Price', unitprice: 'Price', unit_price: 'Price', cost: 'Price',
  };

  const normalizeKey = (s: string) => s.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_\-]+/g, '');

  const detectDelimiterFromHeader = (text: string): string => {
    const firstLine = text.split(/\r?\n/)[0] || '';
    const header = firstLine.replace(/^\uFEFF/, '');
    const score = (delim: string) => (header.match(new RegExp(`${delim}(?=(?:[^"]*"[^"]*")*[^"]*$)`, 'g')) || []).length;
    const candidates = [ ';', ',', '\t' ];
    let best = ';'; let bestScore = -1;
    for (const c of candidates) {
      const sc = score(c);
      if (sc > bestScore) { bestScore = sc; best = c; }
    }
    return bestScore <= 0 ? ';' : best;
  };

  const normalizeCsvFile = async (file: File): Promise<Blob> => {
    const text = await file.text();
    const delimiter = detectDelimiterFromHeader(text);
    // Parse with header auto and skip empty lines
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, delimiter: delimiter === '\t' ? '\t' : delimiter });
    if (parsed.errors && parsed.errors.length) {
      throw new Error('Invalid CSV: ' + parsed.errors[0].message);
    }
    const rows: any[] = Array.isArray(parsed.data) ? parsed.data : [];
    if (!rows.length) throw new Error('CSV has no data');

    // Build canonical rows with expected headers
    const normalizedRows = rows.map((row: any) => {
      const out: Record<string, any> = {};
      // Map each key via alias
      for (const [key, value] of Object.entries(row)) {
        const norm = normalizeKey(String(key));
        const canonical = aliasMap[norm];
        if (canonical) out[canonical] = value as any;
      }
      return out;
    });

    // Validate required headers presence
    const missingHeaders = expectedHeaders.filter(h => !normalizedRows.some(r => Object.prototype.hasOwnProperty.call(r, h)) && !Object.prototype.hasOwnProperty.call(normalizedRows[0] || {}, h));
    if (missingHeaders.length) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}. Please fix CSV headers.`);
    }

    // Ensure numbers are strings or numbers properly
    const fixedRows = normalizedRows.map(r => ({
      'Product Title': r['Product Title'] ?? '',
      'Description': r['Description'] ?? '',
      'Category': r['Category'] ?? '',
      'Color': r['Color'] ?? '',
      'IMG': r['IMG'] ?? '',
      'Size': r['Size'] ?? '',
      'Quantity': r['Quantity'] ?? '',
      'Price': r['Price'] ?? '',
    }));

    // Unparse to semicolon-delimited CSV for backend
    const csvOut = Papa.unparse(fixedRows, { delimiter: ';', quotes: true, newline: '\r\n' });
    return new Blob([csvOut], { type: 'text/csv' });
  };

  // ===== CSV template download =====
  const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = '/product_import_sample.csv';
    a.download = 'product_import_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Flatten previewData for table, carry group-level fields to each detail row
  const allDetails = previewData.flatMap((group: any) => {
    const details = group.productDetails || [];
    return details.map((detail: any) => ({
      ...detail,
      productTitle: detail.productTitle ?? group.productTitle ?? detail.title ?? '',
      description: detail.description ?? group.description ?? '',
      category: detail.category ?? group.category ?? '',
    }));
  });

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-white to-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-white/90 shadow-sm">
        <button onClick={() => router.push('/products')} className="text-black px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition font-medium flex items-center gap-2 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Import Products from CSV</h1>
      </div>
      <div className="flex flex-1 flex-row gap-6 p-6 w-full items-start justify-center">
        {/* Left: Upload */}
        <div className="w-[270px] flex-shrink-0 bg-white rounded-3xl shadow-2xl p-5 flex flex-col items-center border-2 border-gray-200 self-start">
          <label htmlFor="csv-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-2xl p-7 cursor-pointer hover:border-black transition-colors bg-white w-full min-h-[160px] group">
            <span className="text-4xl text-gray-400 mb-2 group-hover:text-black select-none">+</span>
            <span className="font-medium text-gray-700 mb-1 text-center text-base">Drag & drop or select a CSV file</span>
            <span className="text-xs text-gray-400">Accepted: .csv only</span>
            <input
              id="csv-upload"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 text-sm border border-gray-800 font-semibold shadow"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse CSV File
            </button>
          </label>
          <button
            type="button"
            className="mt-3 w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-50 text-sm border border-gray-300 font-semibold shadow"
            onClick={downloadTemplate}
          >
            Download CSV Template (standard headers)
          </button>
          {uploadedFile && (
            <div className="mt-4 w-full flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{uploadedFile.name}</span>
              <span className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(0)} KB</span>
            </div>
          )}
          {error && <div className="mt-4 text-red-600 text-sm w-full text-center">{error}</div>}
        </div>
        {/* Right: Preview */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl p-7 flex flex-col border-2 border-gray-200 min-w-0 relative">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-black">Preview Products</h2>
            <button
              className="px-6 py-2 rounded-xl bg-black hover:bg-gray-900 text-white font-bold shadow-lg transition text-base"
              style={{ position: 'relative', zIndex: 2 }}
              disabled={allDetails.length === 0 || previewLoading}
              onClick={handleSave}
            >
              <svg className="w-5 h-5 inline-block mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Save All
            </button>
          </div>
          {previewLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[180px]">
              <svg className="animate-spin h-8 w-8 text-black mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-gray-600 mt-2">Loading preview...</span>
            </div>
          ) : allDetails.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[560px] text-gray-500">
              <img src="/file.svg" alt="No data" className="w-10 h-10 mb-2 opacity-70" />
              <span className="text-base">No preview data. Please upload a CSV file.</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-lg border border-gray-100 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
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
                  {allDetails.map((row: any, idx: number) => (
                    <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 transition ${row.isError ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 text-black max-w-[200px] truncate">{row.productTitle || row.title || ''}</td>
                      <td className="px-4 py-3 text-black">{row.category || ''}</td>
                      <td className="px-4 py-3 text-black">{row.color || ''}</td>
                      <td className="px-4 py-3 text-black">{row.size || ''}</td>
                      <td className="px-4 py-3 text-black">{row.price}</td>
                      <td className="px-4 py-3 text-black">{row.quantity}</td>
                      <td className="px-4 py-3">
                        {row.isError ? (
                          <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 border border-red-200">{row.errorMessage || 'Error'}</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleEditProduct(idx)} className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow">Edit</button>
                        <button onClick={() => handleDeleteProduct(idx)} className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow">Delete</button>
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
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white"
                  >
                    <option value="" disabled>Select category</option>
                    {allowedCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Color</label>
                  <select
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white"
                  >
                    <option value="" disabled>Select color</option>
                    {allowedColors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Size</label>
                  <select
                    value={editForm.size}
                    onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white"
                  >
                    <option value="" disabled>Select size</option>
                    {allowedSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeEditModal} className="px-4 py-2 rounded-lg border border-gray-300 text-black bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportCSVPage;
