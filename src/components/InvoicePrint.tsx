import React from 'react';
import './InvoicePrint.css';

interface InvoiceData {
  id: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  staffName: string;
  recordType?: string;
  branchName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

interface InvoicePrintProps {
  data: InvoiceData;
  onClose: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ data, onClose }) => {
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to print the invoice');
      return;
    }
    
    // Generate HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice_${data.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.2;
            background: white;
            padding: 15px;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
          }
          
          .company-info h1 {
            font-size: 18px;
            margin-bottom: 3px;
          }
          
          .company-info p {
            font-size: 8px;
            margin: 1px 0;
          }
          
          .invoice-title h2 {
            font-size: 20px;
            margin-bottom: 3px;
          }
          
          .invoice-number {
            font-size: 12px;
          }
          
          .invoice-info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          
          .customer-info h3 {
            font-size: 12px;
            margin-bottom: 3px;
          }
          
          .customer-name {
            font-size: 10px;
          }
          
          .customer-info p,
          .date-info p {
            font-size: 8px;
            margin: 1px 0;
          }
          
          .items-section {
            margin-bottom: 10px;
          }
          
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          
          .invoice-table th,
          .invoice-table td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: left;
            font-size: 8px;
          }
          
          .invoice-table th {
            font-size: 8px;
            padding: 3px;
            background-color: #f8f9fa;
          }
          
          .item-no {
            width: 30px;
          }
          
          .item-qty {
            width: 50px;
          }
          
          .item-price {
            width: 70px;
          }
          
          .item-total {
            width: 70px;
            text-align: right;
            font-weight: bold;
          }
          
          .totals-section {
            margin-bottom: 10px;
          }
          
          .totals-container {
            width: 180px;
            padding: 8px;
            border: 1px solid #ddd;
            margin-left: auto;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            margin-bottom: 3px;
          }
          
          .grand-total {
            font-size: 12px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 3px;
            margin-top: 3px;
          }
          
          .invoice-footer {
            margin-top: 10px;
            border-top: 1px solid #ddd;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .payment-info p {
            font-size: 8px;
            margin: 1px 0;
          }
          
          .signature-box {
            width: 120px;
            text-align: center;
          }
          
          .signature-box p {
            font-size: 8px;
            margin: 1px 0;
          }
          
          .signature-box p:first-child {
            margin-bottom: 3px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
          }
          
          @page {
            margin: 8mm;
            size: A4;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <h1>29 JEWELLERY</h1>
            <p>No. (123), Street Name, Township</p>
            <p>Yangon, Myanmar | Phone: +95 9 123 456 789</p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <p class="invoice-number">Invoice #: ${data.id}</p>
            <p>Date: ${data.date}</p>
            ${data.recordType ? `<p>Type: ${data.recordType}</p>` : ''}
            ${data.branchName ? `<p>Branch: ${data.branchName}</p>` : ''}
          </div>
        </div>

        <div class="invoice-info-section">
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p class="customer-name">${data.customerName}</p>
            <p>Address: ${data.customerAddress || 'Customer Address'}</p>
            <p>Phone: ${data.customerPhone || 'Customer Phone'}</p>
          </div>
          <div class="date-info">
            <p><strong>Sales Person:</strong> ${data.staffName}</p>
            <p><strong>Payment:</strong> Cash</p>
          </div>
        </div>

        <div class="items-section">
          <table class="invoice-table">
            <thead>
              <tr>
                <th class="item-no">No.</th>
                <th class="item-desc">Description</th>
                <th class="item-qty">Qty</th>
                <th class="item-price">Unit Price</th>
                <th class="item-total">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item, index) => `
                <tr>
                  <td class="item-no">${index + 1}</td>
                  <td class="item-desc">${item.name}</td>
                  <td class="item-qty">${item.quantity}</td>
                  <td class="item-price">$${item.price.toFixed(2)}</td>
                  <td class="item-total">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="totals-section">
          <div class="totals-container">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax (5%):</span>
              <span>$${data.tax.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <strong>TOTAL:</strong>
              <strong>$${data.total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div class="invoice-footer">
          <div class="payment-info">
            <p><strong>Payment Terms:</strong> Due on receipt</p>
            <p><strong>Thank you for your business!</strong></p>
          </div>
          <div class="signature-box">
            <p>_________________________</p>
            <p>Authorized Signature</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      // Ask user how many copies to print
      const copies = prompt('How many copies would you like to print?', '1');
      const numCopies = parseInt(copies || '1') || 1;
      
      if (numCopies > 0) {
        printWindow.print();
        printWindow.close();
        
        // Print additional copies if needed
        for (let i = 1; i < numCopies; i++) {
          setTimeout(() => {
            const additionalPrintWindow = window.open('', '_blank');
            if (additionalPrintWindow) {
              additionalPrintWindow.document.write(printContent);
              additionalPrintWindow.document.close();
              additionalPrintWindow.onload = () => {
                additionalPrintWindow.print();
                additionalPrintWindow.close();
              };
            }
          }, i * 1000);
        }
      }
    };
  };

  return (
    <div className="invoice-wrapper">
      <div className="invoice-print-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="company-info">
            <h1>29 JEWELLERY</h1>
            <p>No. (123), Street Name, Township</p>
            <p>Yangon, Myanmar | Phone: +95 9 123 456 789</p>
          </div>
          <div className="invoice-title">
            <h2>INVOICE</h2>
            <p className="invoice-number">Invoice #: {data.id}</p>
            <p>Date: {data.date}</p>
            {data.recordType && <p>Type: {data.recordType}</p>}
            {data.branchName && <p>Branch: {data.branchName}</p>}
          </div>
        </div>

        {/* Customer & Date Info */}
        <div className="invoice-info-section">
          <div className="customer-info">
            <h3>Bill To:</h3>
            <p className="customer-name">{data.customerName}</p>
            <p>Address: {data.customerAddress || 'Customer Address'}</p>
            <p>Phone: {data.customerPhone || 'Customer Phone'}</p>
          </div>
          <div className="date-info">
            <p><strong>Sales Person:</strong> {data.staffName}</p>
            <p><strong>Payment:</strong> Cash</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-section">
          <table className="invoice-table">
            <thead>
              <tr>
                <th className="item-no">No.</th>
                <th className="item-desc">Description</th>
                <th className="item-qty">Qty</th>
                <th className="item-price">Unit Price</th>
                <th className="item-total">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td className="item-no">{index + 1}</td>
                  <td className="item-desc">{item.name}</td>
                  <td className="item-qty">{item.quantity}</td>
                  <td className="item-price">${item.price.toFixed(2)}</td>
                  <td className="item-total">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="totals-section">
          <div className="totals-container">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${data.subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax (5%):</span>
              <span>${data.tax.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <strong>TOTAL:</strong>
              <strong>${data.total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-content">
            <div className="payment-info">
              <p><strong>Payment Terms:</strong> Due on receipt</p>
              <p><strong>Thank you for your business!</strong></p>
            </div>
            <div className="signature-section">
              <div className="signature-box">
                <p>_________________________</p>
                <p>Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Actions (Hidden when printing) */}
      <div className="print-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          ✏️ Edit
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          🖨️ Print Invoice
        </button>
        <button className="btn btn-outline" onClick={onClose}>
          ❌ Close
        </button>
      </div>
    </div>
  );
};

export default InvoicePrint;
