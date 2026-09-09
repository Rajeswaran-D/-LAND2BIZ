'use client';

import React, { useState } from 'react';
import { Store, Search, MapPin, ArrowUpRight } from 'lucide-react';

export interface CompetitorItem {
  id: string;
  name: string;
  category: 'agri' | 'processing' | 'retail' | 'services' | 'dairy';
  categoryLabel: string;
  distance: string;
  impactLabel: string;
  impactColor: string;
  shortDesc: string;
}

const COMPETITORS_DATA: CompetitorItem[] = [
  {
    id: '1',
    name: 'Sharma General Store',
    category: 'retail',
    categoryLabel: 'Retail & Grocery',
    distance: '350 m',
    impactLabel: 'Traffic Hub',
    impactColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shortDesc: 'Daily kirana and grocery footfall.',
  },
  {
    id: '2',
    name: 'Kisan Agri Traders',
    category: 'agri',
    categoryLabel: 'Agri & Farming',
    distance: '450 m',
    impactLabel: 'Partner Hub',
    impactColor: 'bg-blue-50 text-blue-700 border-blue-200',
    shortDesc: 'Seeds and crop protection supply.',
  },
  {
    id: '3',
    name: 'Rampur Hardware & Steel',
    category: 'retail',
    categoryLabel: 'Hardware & Materials',
    distance: '800 m',
    impactLabel: 'Building Supplier',
    impactColor: 'bg-slate-100 text-slate-700 border-slate-200',
    shortDesc: 'Cement, steel, and piping materials.',
  },
  {
    id: '4',
    name: 'Greenland Bio-Organics',
    category: 'agri',
    categoryLabel: 'Agri & Farming',
    distance: '1.2 km',
    impactLabel: 'Eco Supplier',
    impactColor: 'bg-blue-50 text-blue-700 border-blue-200',
    shortDesc: 'Organic fertilizers and compost.',
  },
  {
    id: '5',
    name: 'Verma Dairy Center',
    category: 'dairy',
    categoryLabel: 'Dairy & Livestock',
    distance: '1.8 km',
    impactLabel: 'Direct Competitor',
    impactColor: 'bg-amber-50 text-amber-800 border-amber-200',
    shortDesc: 'Local milk chilling and collection.',
  },
  {
    id: '6',
    name: 'Jai Hind Pulse & Rice Mill',
    category: 'processing',
    categoryLabel: 'Processing & Mills',
    distance: '2.1 km',
    impactLabel: 'Grain Hub',
    impactColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shortDesc: 'Grain milling and bulk processing.',
  },
  {
    id: '7',
    name: 'Apex Commercial Auto Care',
    category: 'services',
    categoryLabel: 'Services & Auto',
    distance: '2.4 km',
    impactLabel: 'Vehicle Repairs',
    impactColor: 'bg-slate-100 text-slate-700 border-slate-200',
    shortDesc: 'Tractor and truck mechanics.',
  },
  {
    id: '8',
    name: 'Kashi Medical & Diagnostics',
    category: 'services',
    categoryLabel: 'Healthcare',
    distance: '2.7 km',
    impactLabel: 'Essential Service',
    impactColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shortDesc: 'Pharmacy and basic clinic.',
  },
  {
    id: '9',
    name: 'Kashi Poultry & Feeds',
    category: 'agri',
    categoryLabel: 'Agri & Livestock',
    distance: '3.1 km',
    impactLabel: 'Feed Supplier',
    impactColor: 'bg-blue-50 text-blue-700 border-blue-200',
    shortDesc: 'Cattle and poultry feed depot.',
  },
  {
    id: '10',
    name: 'Surya Solar & Electricals',
    category: 'services',
    categoryLabel: 'Solar & Power',
    distance: '3.8 km',
    impactLabel: 'Solar Partner',
    impactColor: 'bg-blue-50 text-blue-700 border-blue-200',
    shortDesc: 'Solar pump and grid installations.',
  },
  {
    id: '11',
    name: 'Highway Fuel Station & Dhaba',
    category: 'services',
    categoryLabel: 'Fuel & Highway',
    distance: '4.1 km',
    impactLabel: 'Traffic Hub',
    impactColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shortDesc: 'Petrol pump with truck parking.',
  },
  {
    id: '12',
    name: 'Shree Ram Cold Storage',
    category: 'processing',
    categoryLabel: 'Cold Storage',
    distance: '4.8 km',
    impactLabel: 'Direct Competitor',
    impactColor: 'bg-amber-50 text-amber-800 border-amber-200',
    shortDesc: 'Potato and agri cold storage.',
  },
  {
    id: '13',
    name: 'Sardar Heavy Machinery',
    category: 'services',
    categoryLabel: 'Machinery',
    distance: '5.2 km',
    impactLabel: 'Spares Supplier',
    impactColor: 'bg-slate-100 text-slate-700 border-slate-200',
    shortDesc: 'Gensets, pumps, and spare parts.',
  },
  {
    id: '14',
    name: 'Durga Flour & Spice Mill',
    category: 'processing',
    categoryLabel: 'Processing',
    distance: '6.5 km',
    impactLabel: 'Competitor',
    impactColor: 'bg-amber-50 text-amber-800 border-amber-200',
    shortDesc: 'Flour and spice grinding unit.',
  },
  {
    id: '15',
    name: 'Weekly Farmer Market Ground',
    category: 'retail',
    categoryLabel: 'Farmer Market',
    distance: '8.0 km',
    impactLabel: 'Major Market',
    impactColor: 'bg-purple-50 text-purple-700 border-purple-200',
    shortDesc: 'Twice-weekly village haat market.',
  },
];

export const NearbyCompetitorsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: `All Shops (${COMPETITORS_DATA.length})` },
    { id: 'agri', label: 'Agri & Farming' },
    { id: 'processing', label: 'Processing & Storage' },
    { id: 'retail', label: 'Retail & Hardware' },
    { id: 'services', label: 'Services & Solar' },
  ];

  const filteredItems = COMPETITORS_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'agri' && item.category === 'agri') ||
      (selectedCategory === 'processing' && item.category === 'processing') ||
      (selectedCategory === 'retail' && (item.category === 'retail' || item.category === 'dairy')) ||
      (selectedCategory === 'services' && item.category === 'services');

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 lg:p-8 mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Store className="w-3.5 h-3.5" /> Surroundings Check
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            15 Nearby Shops & Businesses
          </h2>
        </div>

        {/* Minimal Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter shops..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Clean & Sleek Shop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-gray-200/90 bg-white hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">
                  {item.categoryLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md flex-shrink-0">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  {item.distance}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{item.shortDesc}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
              <span className={`font-semibold px-2 py-0.5 rounded border ${item.impactColor}`}>
                {item.impactLabel}
              </span>
              <span className="text-gray-400 hover:text-gray-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
