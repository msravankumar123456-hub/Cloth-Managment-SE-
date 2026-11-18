import React from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { X, Printer, Download, CheckCircle2, FileText, Building2 } from 'lucide-react';

interface InvoicesViewProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ invoice, onClose }) => {
  const { showToast } = useApp();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast(`Invoice ${invoice.invoiceNumber} downloaded as PDF (Sample).`, 'success');
  };

  const cgst = Math.round(invoice.gstAmount / 2);
  const sgst = invoice.gstAmount - cgst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-[#17181C] border border-white/15 shadow-2xl shadow-black/95 text-[#F5F5F5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#141519] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FF7135]" />
            <span className="text-xs font-mono text-white font-semibold">
              Tax Invoice — {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-xs text-[#D4D4D8] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF7135] text-white text-xs font-medium hover:bg-[#FF5C1B] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-[#A1A1AA]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-7 space-y-6 max-h-[82vh] overflow-y-auto bg-[#101114]">
          
          {/* Top Mill & Consignee Details */}
          <div className="flex justify-between items-start pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <span className="text-[#FF7135]">Loopmex</span>
                <span className="text-xs font-mono font-normal text-[#71717A]">Mill Direct Ltd.</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1 leading-relaxed">
                Apparel Manufacturing Cluster, SIPCOT Textile Park<br />
                Tirupur, Tamil Nadu — 641652<br />
                GSTIN: 33AAACT9812M1Z0 | HSN Chapter 61 & 62
              </p>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                {invoice.status.toUpperCase()}
              </span>
              <div className="text-xs font-mono text-white mt-2 font-bold">{invoice.invoiceNumber}</div>
              <div className="text-[11px] text-[#71717A] mt-0.5">Date: {invoice.date}</div>
              <div className="text-[11px] text-[#71717A]">Order Ref: {invoice.orderNumber}</div>
            </div>
          </div>

          {/* Billed To */}
          <div className="p-4 rounded-xl bg-[#17181C] border border-white/[0.06] text-xs">
            <span className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider">Billed To Consignee:</span>
            <div className="font-bold text-white text-sm mt-1">{invoice.retailerStore}</div>
            <div className="text-[#A1A1AA] mt-0.5">Contact: {invoice.retailerName}</div>
            <div className="text-[#71717A] font-mono mt-0.5">Buyer GSTIN: {invoice.retailerGst}</div>
          </div>

          {/* Line Items Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#17181C] text-[#A1A1AA] font-mono text-[11px] border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Description of Goods</th>
                  <th className="py-2.5 px-3 text-center">HSN</th>
                  <th className="py-2.5 px-3 text-center">Qty (Pcs)</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr>
                  <td className="py-3 px-3 text-white font-medium">
                    Wholesale Garments Assorted Carton Run
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-[#A1A1AA]">6205 / 6109</td>
                  <td className="py-3 px-3 text-center font-mono text-white font-bold">{invoice.totalPieces}</td>
                  <td className="py-3 px-3 text-right font-mono text-white">₹{invoice.subtotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* GST Calculation & Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Taxable Amount</span>
                <span className="font-mono text-white">₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>CGST (2.5%)</span>
                <span className="font-mono text-white">₹{cgst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>SGST (2.5%)</span>
                <span className="font-mono text-white">₹{sgst.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                <span>Invoice Total (INR)</span>
                <span className="text-[#FF7135] text-base">₹{invoice.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signoff declaration */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#71717A]">
            <span>Digitally certified under Indian GST Act. E-Waybill auto-linked.</span>
            <span className="font-mono text-[#D4D4D8]">Loopmex Mill Operations</span>
          </div>

        </div>
      </div>
    </div>
  );
};
