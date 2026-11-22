import React, { useState } from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';
import { ClothingCategory } from '../../types';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ClothingCategory | string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose, category }) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  const isTrousersOrDenim = category === 'Denim' || category === 'Trousers';

  const chartDataInches = isTrousersOrDenim ? [
    { size: '28', waist: '28 - 29', hip: '36 - 37', inseam: '32', thigh: '21' },
    { size: '30', waist: '30 - 31', hip: '38 - 39', inseam: '32', thigh: '22' },
    { size: '32', waist: '32 - 33', hip: '40 - 41', inseam: '32.5', thigh: '23' },
    { size: '34', waist: '34 - 35', hip: '42 - 43', inseam: '33', thigh: '24' },
    { size: '36', waist: '36 - 37', hip: '44 - 45', inseam: '33', thigh: '25' },
    { size: '38', waist: '38 - 39', hip: '46 - 47', inseam: '33.5', thigh: '26' },
  ] : [
    { size: 'S', chest: '36 - 38', length: '27.5', shoulder: '17.0', sleeve: '24.5' },
    { size: 'M', chest: '39 - 41', length: '28.5', shoulder: '17.8', sleeve: '25.0' },
    { size: 'L', chest: '42 - 44', length: '29.5', shoulder: '18.5', sleeve: '25.5' },
    { size: 'XL', chest: '45 - 47', length: '30.5', shoulder: '19.2', sleeve: '26.0' },
    { size: 'XXL', chest: '48 - 50', length: '31.5', shoulder: '20.0', sleeve: '26.5' },
  ];

  const chartDataCm = isTrousersOrDenim ? [
    { size: '28', waist: '71 - 74', hip: '91 - 94', inseam: '81', thigh: '53' },
    { size: '30', waist: '76 - 79', hip: '96 - 99', inseam: '81', thigh: '56' },
    { size: '32', waist: '81 - 84', hip: '101 - 104', inseam: '83', thigh: '58' },
    { size: '34', waist: '86 - 89', hip: '106 - 109', inseam: '84', thigh: '61' },
    { size: '36', waist: '91 - 94', hip: '111 - 114', inseam: '84', thigh: '63' },
    { size: '38', waist: '96 - 99', hip: '116 - 119', inseam: '85', thigh: '66' },
  ] : [
    { size: 'S', chest: '91 - 96', length: '70', shoulder: '43', sleeve: '62' },
    { size: 'M', chest: '99 - 104', length: '72', shoulder: '45', sleeve: '63.5' },
    { size: 'L', chest: '107 - 112', length: '75', shoulder: '47', sleeve: '65' },
    { size: 'XL', chest: '114 - 119', length: '77', shoulder: '49', sleeve: '66' },
    { size: 'XXL', chest: '122 - 127', length: '80', shoulder: '51', sleeve: '67' },
  ];

  const activeData = unit === 'in' ? chartDataInches : chartDataCm;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 sm:p-7 text-[#18181B] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF7135]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {category} Size Guide & Fit Chart
              </h3>
              <p className="text-xs text-gray-500">Standard Indian & International Wholesale Sizing</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Measurement Unit:</span>
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs">
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                unit === 'in' ? 'bg-white shadow text-[#FF7135]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                unit === 'cm' ? 'bg-white shadow text-[#FF7135]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase font-mono tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 font-bold text-gray-900">Size</th>
                {isTrousersOrDenim ? (
                  <>
                    <th className="py-3 px-3">Waist</th>
                    <th className="py-3 px-3">Hip</th>
                    <th className="py-3 px-3">Inseam</th>
                    <th className="py-3 px-3">Thigh</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-3">Chest</th>
                    <th className="py-3 px-3">Length</th>
                    <th className="py-3 px-3">Shoulder</th>
                    <th className="py-3 px-3">Sleeve</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeData.map((row: any) => (
                <tr key={row.size} className="hover:bg-orange-50/30 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-gray-900 bg-gray-50/50">
                    <span className="px-2 py-0.5 rounded bg-gray-100 font-mono">{row.size}</span>
                  </td>
                  {isTrousersOrDenim ? (
                    <>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{row.waist} {unit}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{row.hip} {unit}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{row.inseam} {unit}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{row.thigh} {unit}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{row.chest} {unit}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{row.length} {unit}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{row.shoulder} {unit}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{row.sleeve} {unit}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Guide Tip */}
        <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/50 text-xs text-gray-700 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#FF7135] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-gray-900">Measuring Tip:</strong> For wholesale bulk buying, size measurements follow standard regular retail fitting with pre-shrunk combed yarns. Allow a tolerance of +/- 0.5 {unit}.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wider uppercase transition-colors"
        >
          Got It, Close Guide
        </button>
      </div>
    </div>
  );
};
