"use client";

import React, { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ColorsContainer } from '../components/colors/ColorsContainer';
import { SizesContainer } from '../components/sizes/SizesContainer';
import { Palette, Ruler } from 'lucide-react';
import { Pagination } from '@/components/ui';

type TabKey = 'colors' | 'sizes';

export const SystemVariablesContainer: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialTab = (searchParams.get('tab') as TabKey) || 'colors';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const handlePaginationChange = useCallback((page: number, pageSize: number, totalItems: number) => {
    setPaginationInfo({ page, pageSize, totalItems });
  }, []);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    {
      key: 'colors' as TabKey,
      label: 'Colors',
      icon: Palette,
      description: 'Manage product color variants'
    },
    {
      key: 'sizes' as TabKey,
      label: 'Sizes',
      icon: Ruler,
      description: 'Manage product size options'
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent">
            System Variables
          </h1>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-gray-600">Manage global system variables for your products</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <nav className="flex space-x-1 p-2" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    group relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-white text-black shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="text-sm font-semibold">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'sizes' ? (
            <SizesContainer 
              externalPage={currentPage}
              onPaginationChange={handlePaginationChange} 
            />
          ) : (
            <ColorsContainer 
              externalPage={currentPage}
              onPaginationChange={handlePaginationChange} 
            />
          )}
        </div>
      </div>

      {/* Pagination - Outside the card */}
      {paginationInfo.totalItems > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={paginationInfo.page}
            totalItems={paginationInfo.totalItems}
            pageSize={paginationInfo.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  );
};
