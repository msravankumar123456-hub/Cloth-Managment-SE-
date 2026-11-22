import { Invoice } from '../types';

export const generateInvoiceHTML = (invoice: Invoice): string => {
  const cgst = Math.round(invoice.gstAmount / 2);
  const sgst = invoice.gstAmount - cgst;
  const grandTotal = invoice.grandTotal;
  const issueDate = invoice.date || new Date().toISOString().split('T')[0];
  const dueDate = invoice.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoice.invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 30px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 32px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #FF7135;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #FF7135;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      color: #6b7280;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .mill-address {
      font-size: 11px;
      color: #4b5563;
      margin-top: 6px;
      line-height: 1.4;
    }
    .invoice-badge {
      text-align: right;
    }
    .status-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: bold;
      font-family: monospace;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      text-transform: uppercase;
    }
    .invoice-number {
      font-size: 16px;
      font-weight: bold;
      font-family: monospace;
      color: #111827;
      margin-top: 8px;
    }
    .invoice-date {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
    .consignee-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .section-label {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      color: #6b7280;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .consignee-name {
      font-size: 14px;
      font-weight: bold;
      color: #111827;
    }
    .table-container {
      margin-bottom: 24px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: #f9fafb;
      padding: 10px 14px;
      font-size: 11px;
      font-weight: bold;
      color: #4b5563;
      text-transform: uppercase;
      font-family: monospace;
      border-bottom: 1px solid #e5e7eb;
    }
    td {
      padding: 12px 14px;
      font-size: 12px;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-box {
      width: 280px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;
      color: #4b5563;
    }
    .totals-grand {
      display: flex;
      justify-content: space-between;
      padding: 10px 0 4px 0;
      margin-top: 6px;
      border-top: 2px solid #111827;
      font-size: 16px;
      font-weight: 900;
      color: #111827;
    }
    .totals-grand span:last-child {
      color: #FF7135;
      font-family: monospace;
    }
    .signoff {
      border-top: 1px dashed #d1d5db;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #6b7280;
    }
    .stamp-box {
      text-align: right;
    }
    .stamp-tag {
      display: inline-block;
      border: 1px solid #FF7135;
      color: #FF7135;
      padding: 4px 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }
    @media print {
      body { padding: 0; }
      .invoice-card { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <h1 class="brand-title">LOOPMEX</h1>
        <div class="brand-sub">Apparel Mills Direct • Tax Invoice</div>
        <div class="mill-address">
          Manufacturing Cluster, SIPCOT Textile Complex<br>
          Tirupur, Tamil Nadu — 641652, India<br>
          <strong>GSTIN:</strong> 33AAACT9812M1Z0 | <strong>State Code:</strong> 33
        </div>
      </div>
      <div class="invoice-badge">
        <span class="status-pill">${invoice.status || 'PAID'}</span>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
        <div class="invoice-date">Date: <strong>${issueDate}</strong></div>
        <div class="invoice-date">Order Ref: <strong>${invoice.orderNumber}</strong></div>
      </div>
    </div>

    <div class="consignee-section">
      <div>
        <div class="section-label">Billed To Consignee / Retailer:</div>
        <div class="consignee-name">${invoice.retailerStore}</div>
        <div>Contact: <strong>${invoice.retailerName}</strong></div>
        <div>GSTIN: <span style="font-family:monospace; font-weight:bold;">${invoice.retailerGst || '33AAAAA0000A1Z5'}</span></div>
      </div>
      <div>
        <div class="section-label">Dispatch & Logistics:</div>
        <div>Carrier: <strong>Delhivery B2B Surface Freight</strong></div>
        <div>Due Date: <strong>${dueDate}</strong></div>
        <div>Place of Supply: <strong>Tamil Nadu (Code 33)</strong></div>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description of Goods</th>
            <th class="text-center">HSN/SAC</th>
            <th class="text-center">Quantity (Pcs)</th>
            <th class="text-right">Unit Rate (₹)</th>
            <th class="text-right">Taxable Value (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              <strong>Wholesale Garments Assorted Carton Run</strong><br>
              <span style="color:#6b7280; font-size:11px;">Standard commercial packaging (50-pc lots)</span>
            </td>
            <td class="text-center" style="font-family:monospace;">6205 / 6109</td>
            <td class="text-center" style="font-weight:bold; font-family:monospace;">${invoice.totalPieces}</td>
            <td class="text-right" style="font-family:monospace;">₹${Math.round(invoice.subtotal / (invoice.totalPieces || 1)).toLocaleString()}</td>
            <td class="text-right" style="font-weight:bold; font-family:monospace;">₹${invoice.subtotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="totals-area">
      <div class="totals-box">
        <div class="totals-row">
          <span>Taxable Subtotal:</span>
          <span style="font-family:monospace; font-weight:bold;">₹${invoice.subtotal.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>CGST (2.5%):</span>
          <span style="font-family:monospace;">₹${cgst.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>SGST (2.5%):</span>
          <span style="font-family:monospace;">₹${sgst.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>Freight / Shipping:</span>
          <span style="color:#059669; font-weight:bold;">Included (Mill Paid)</span>
        </div>
        <div class="totals-grand">
          <span>Invoice Total:</span>
          <span>₹${grandTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="signoff">
      <div>
        <strong>Declaration:</strong> Certified that all details are true and correct under Indian GST laws.<br>
        This is a digitally generated wholesale tax invoice.
      </div>
      <div class="stamp-box">
        <div class="stamp-tag">Digitally Certified</div>
        <div style="font-size:10px; color:#4b5563; margin-top:2px;">For Loopmex Apparel Mills Ltd.</div>
      </div>
    </div>
  </div>

  <script>
    // Auto-trigger print dialog if opened in standalone tab
    if (window.location.search.includes('print=1')) {
      window.onload = function() { window.print(); };
    }
  </script>
</body>
</html>`;
};

// Downloads the actual HTML invoice file to the laptop
export const downloadInvoiceFile = (invoice: Invoice): void => {
  try {
    const html = generateInvoiceHTML(invoice);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.invoiceNumber || 'INV'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download error:', err);
  }
};

// Opens printable invoice window directly
export const printInvoice = (invoice: Invoice): void => {
  try {
    const html = generateInvoiceHTML(invoice);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    } else {
      // Fallback: download file
      downloadInvoiceFile(invoice);
    }
  } catch (err) {
    console.error('Print error:', err);
    downloadInvoiceFile(invoice);
  }
};
