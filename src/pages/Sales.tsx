import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saleAnalyticsAPI } from '../services/api';
import '../styles/Sales.css';

interface Sale {
  id: number;
  month: number;
  branch_id: number;
  branch_name?: string;
  date: string;
  item_code?: string;
  item_categories?: string;
  quantity?: number;
  dia_qty?: number;
  gem_qty?: number;
  total_weight?: number;
  gold_weight?: number;
  gem_weight?: number;
  density?: string;
  gold_price?: number;
  k?: number;
  p?: number;
  y?: number;
  w_gram?: number;
  gold_value?: number;
  kyattar?: number;
  round_kyattar?: number;
  loss_k?: number;
  loss_p?: number;
  loss_y?: number;
  loss_gram?: number;
  loss_value?: number;
  total_gold_value?: number;
  dia_gem_value?: number;
  total_value?: number;
  sale_voucher_amount?: number;
  different_amount?: number;
  stamp?: number;
  total_amount?: number;
  invoice_number?: string;
  customer_name?: string;
  nrc_no?: string;
  phone_no?: string;
  address?: string;
  transcation_type?: string;
  employee_id?: number;
  employee_name?: string;
  remark?: string;
  sale_status_id?: number;
  sale_status_name?: string;
  real_to_payment_amount?: number;
  prefix?: string;
  on_off?: 'online' | 'offline';
  change?: number;
  return?: number;
  gs_date?: string;
  dia_and_gem?: 'diamond' | 'gem';
  status?: 'new' | 'return';
  charges_and_other?: number;
  cashier_id?: number;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saleStatuses, setSaleStatuses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    sale_status_id: '',
    date_from: '',
    date_to: '',
    item_code: '',
    invoice_number: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  
  useEffect(() => {
    fetchSales();
    fetchSaleStatuses();
    fetchBranches();
    fetchEmployees();
  }, []);

  const fetchSaleStatuses = async () => {
    try {
      // Temporary hardcoded sale statuses due to API issue
      const hardcodedStatuses = [
        { id: 1, name: 'Dia RC' },
        { id: 2, name: 'G RC' },
        { id: 3, name: 'PT RC' },
        { id: 4, name: 'Dia Sale' },
        { id: 5, name: 'G Sale' },
        { id: 6, name: 'PT Sale' },
      ];
      setSaleStatuses(hardcodedStatuses);
      
      // Try to fetch from API (will fail but won't break the app)
      const response = await saleAnalyticsAPI.getSaleStatuses();
      const result = response.data;
      if (result.success) {
        setSaleStatuses(result.data || hardcodedStatuses);
      }
    } catch (error) {
      console.log('Using hardcoded sale statuses due to API error');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await saleAnalyticsAPI.getBranches();
      const result = response.data;
      if (result.success) {
        setBranches(result.data || []);
        console.log('Branches loaded:', result.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Get branch_id from localStorage or use default branch 1
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const branchId = userData.branch_id || 1;
      console.log('Fetching employees for branch:', branchId);
      
      const response = await saleAnalyticsAPI.getEmployees(branchId);
      const result = response.data;
      if (result.success) {
        setEmployees(result.data || []);
        console.log('Employees loaded:', result.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      
      // Get logged-in user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const loggedInUserId = userData.id || userData.staff_id || userData.employee_id;
      
      const filterParams: any = {};
      if (filters.sale_status_id) filterParams.sale_status_id = parseInt(filters.sale_status_id);
      if (filters.date_from) filterParams.date_from = filters.date_from;
      if (filters.date_to) filterParams.date_to = filters.date_to;
      if (filters.item_code) filterParams.item_code = filters.item_code;
      if (filters.invoice_number) filterParams.invoice_number = filters.invoice_number;
      if (loggedInUserId) filterParams.cashier_id = loggedInUserId;
      
      console.log('Fetching sales with filters:', filterParams);
      console.log('Logged-in user ID:', loggedInUserId);
      
      const response = await saleAnalyticsAPI.getRecords(filterParams);
      const result = response.data;
      if (result.success) {
        const allSales = result.data.data || [];
        
        // Additional client-side filtering if needed (as backup)
        const filteredSales = loggedInUserId 
          ? allSales.filter((sale: Sale) => sale.cashier_id === loggedInUserId)
          : allSales;
          
        setSales(filteredSales);
        console.log(`Filtered ${filteredSales.length} records for cashier_id: ${loggedInUserId}`);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSalesWithFilters();
  };

  
  const handleEdit = async (id: number) => {
    try {
      const response = await saleAnalyticsAPI.getRecordById(id);
      const result = response.data;
      if (result.success) {
        setSelectedSale(result.data);
        setIsEditMode(true);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedSale?.id) {
        console.error('No sale selected for update');
        return;
      }

      // Validate required fields
      const requiredFields = ['branch_id', 'date'];
      const missingFields = requiredFields.filter(field => !(selectedSale as any)[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        alert('Please fill in all required fields');
        return;
      }

      // Clean the data - remove undefined/null values and non-table columns
      const cleanData: any = {};
      const tableColumns = [
        'id', 'year', 'month', 'branch_id', 'date', 'item_code', 'item_categories',
        'quantity', 'dia_qty', 'gem_qty', 'total_weight', 'gold_weight', 'gem_weight',
        'density', 'gold_price', 'k', 'p', 'y', 'w_gram', 'gold_value', 'kyattar',
        'round_kyattar', 'loss_k', 'loss_p', 'loss_y', 'loss_gram', 'loss_value',
        'total_gold_value', 'dia_gem_value', 'charges_and_other', 'total_value',
        'sale_voucher_amount', 'different_amount', 'stamp', 'total_amount',
        'invoice_number', 'customer_name', 'nrc_no', 'phone_no', 'address',
        'transcation_type', 'status', 'prefix', 'on_off', 'employee_id', 'gs_date',
        'change', 'return', 'dia_and_gem', 'remark', 'real_to_payment_amount',
        'column1', 'column2', 'sale_status_id', 'item_type_id', 'item_group_id',
        'created_at', 'updated_at', 'cashier_id'
      ];
      
      Object.keys(selectedSale).forEach(key => {
        const value = (selectedSale as any)[key];
        if (value !== undefined && value !== null && tableColumns.includes(key)) {
          cleanData[key] = value;
        }
      });

      console.log('Updating with data:', cleanData);

      const response = await saleAnalyticsAPI.updateRecord(selectedSale.id, cleanData);
      const result = response.data;
      
      if (result.success) {
        console.log('Sale updated successfully');
        handleCloseModal();
        fetchSales(); // Refresh the sales list
      } else {
        console.error('Update failed:', result.message);
        alert('Update failed: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Error updating sale: ' + (error as any).message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSale(null);
    setIsEditMode(false);
  };

  const handlePrint = (sale: Sale) => {
    console.log('Print button clicked for sale:', sale);
    
    // Create print data from sale record
    const printData = {
      id: sale.id.toString(),
      customerName: sale.customer_name || 'N/A',
      items: [
        {
          name: sale.item_code || 'Item',
          quantity: sale.quantity || 1,
          price: parseFloat(String(sale.total_value)) || 0,
          total: parseFloat(String(sale.total_value)) || 0
        }
      ],
      subtotal: parseFloat(String(sale.total_value)) || 0,
      tax: (parseFloat(String(sale.total_value)) || 0) * 0.05,
      total: (parseFloat(String(sale.total_value)) || 0) * 1.05,
      date: sale.date ? new Date(sale.date).toLocaleDateString() : new Date().toLocaleDateString(),
      staffName: sale.employee_name || 'N/A',
      recordType: sale.sale_status_name || 'Sale Record',
      branchName: sale.branch_name || 'N/A',
      customerPhone: sale.phone_no || undefined,
      customerAddress: sale.address || undefined
    };

    // Create a new window for printing
    console.log('Creating print window...');
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      console.error('Failed to open print window');
      alert('Please allow popups to print the invoice');
      return;
    }
    
    console.log('Print window created successfully');
    
    // Generate HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice_${printData.id}</title>
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
            font-size: 9px;
            margin: 1px 0;
          }
          
          .items-section {
            margin-bottom: 10px;
          }
          
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
          }
          
          .invoice-table th,
          .invoice-table td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: left;
          }
          
          .invoice-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .item-no {
            width: 30px;
            text-align: center;
          }
          
          .item-desc {
            width: 120px;
          }
          
          .item-qty {
            width: 40px;
            text-align: center;
          }
          
          .item-price {
            width: 60px;
            text-align: right;
          }
          
          .item-total {
            width: 60px;
            text-align: right;
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
            <p class="invoice-number">Invoice #: ${printData.id}</p>
            <p>Date: ${printData.date}</p>
            ${printData.recordType ? `<p>Type: ${printData.recordType}</p>` : ''}
            ${printData.branchName ? `<p>Branch: ${printData.branchName}</p>` : ''}
          </div>
        </div>

        <div class="invoice-info-section">
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p class="customer-name">${printData.customerName}</p>
            <p>Address: ${printData.customerAddress || 'Customer Address'}</p>
            <p>Phone: ${printData.customerPhone || 'Customer Phone'}</p>
          </div>
          <div class="date-info">
            <p><strong>Sales Person:</strong> ${printData.staffName}</p>
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
              ${printData.items.map((item, index) => `
                <tr>
                  <td class="item-no">${index + 1}</td>
                  <td class="item-desc">${item.name}</td>
                  <td class="item-qty">${item.quantity}</td>
                  <td class="item-price">$${(parseFloat(String(item.price)) || 0).toFixed(2)}</td>
                  <td class="item-total">$${(parseFloat(String(item.total)) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="totals-section">
          <div class="totals-container">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${(parseFloat(String(printData.subtotal)) || 0).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax (5%):</span>
              <span>$${(parseFloat(String(printData.tax)) || 0).toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <strong>TOTAL:</strong>
              <strong>$${(parseFloat(String(printData.total)) || 0).toFixed(2)}</strong>
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
      console.log('Print window loaded, triggering print...');
      printWindow.print();
      printWindow.close();
    };
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  
  // Get logged-in user info for display
  const getLoggedInUserInfo = () => {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    return {
      id: userData.id || userData.staff_id || userData.employee_id,
      name: userData.name || userData.staff_name || userData.employee_name || 'Unknown User'
    };
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name && employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  // Handle employee selection
  const handleEmployeeSelect = (employee: any) => {
    if (selectedSale) {
      setSelectedSale({...selectedSale, employee_id: employee.id, employee_name: employee.name});
    }
    setShowEmployeeDropdown(false);
    setEmployeeSearchTerm('');
  };

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer for auto-filtering
    const timer = setTimeout(() => {
      fetchSalesWithFilters(newFilters);
    }, 500); // 500ms delay for typing
    
    setDebounceTimer(timer);
  };

  const fetchSalesWithFilters = async (currentFilters = filters) => {
    try {
      setLoading(true);
      
      // Get logged-in user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const loggedInUserId = userData.id || userData.staff_id || userData.employee_id;
      
      const filterParams: any = {};
      if (currentFilters.sale_status_id) filterParams.sale_status_id = parseInt(currentFilters.sale_status_id);
      if (currentFilters.date_from) filterParams.date_from = currentFilters.date_from;
      if (currentFilters.date_to) filterParams.date_to = currentFilters.date_to;
      if (currentFilters.item_code) filterParams.item_code = currentFilters.item_code;
      if (currentFilters.invoice_number) filterParams.invoice_number = currentFilters.invoice_number;
      if (loggedInUserId) filterParams.cashier_id = loggedInUserId;
      
      console.log('Applying filters:', filterParams);
      console.log('Logged-in user ID:', loggedInUserId);
      
      const response = await saleAnalyticsAPI.getRecords(filterParams);
      const result = response.data;
      if (result.success) {
        const allSales = result.data.data || [];
        
        // Additional client-side filtering if needed (as backup)
        const filteredSales = loggedInUserId 
          ? allSales.filter((sale: Sale) => sale.cashier_id === loggedInUserId)
          : allSales;
          
        setSales(filteredSales);
        console.log(`Filtered ${filteredSales.length} records for cashier_id: ${loggedInUserId}`);
      }
    } catch (error) {
      console.error('Error fetching filtered sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      sale_status_id: '',
      date_from: '',
      date_to: '',
      item_code: '',
      invoice_number: '',
    });
    // Fetch all data after clearing filters
    setTimeout(() => {
      fetchSales();
    }, 100);
  };

  const handleRowSelect = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const exportToExcel = () => {
    const exportData = sales.map(sale => ({
      'လ': sale.month || '',
      'ဆိုင်ခွဲအမှတ်': sale.branch_name || '',
      'ရက်စွဲ': sale.date || '',
      'ပစ္စည်း ကုတ်အမှတ်': sale.item_code || '',
      'ပစ္စည်းအမျိုးအစား': sale.item_categories || '',
      'အရေအတွက်': sale.quantity || '',
      'စိန်ပွင့်ရေ': sale.dia_qty || '',
      'ကျောက်ပွင့်ရေ': sale.gem_qty || '',
      'စုစုပေါင်း အလေးချိန်': sale.total_weight || '',
      'ရွှေချိန်': sale.gold_weight || '',
      'ကျောက်ချိန်': sale.gem_weight || '',
      'ပဲရည်': sale.density || '',
      'ရွှေဈေးနူန်း': sale.gold_price || '',
      'အထည် ဂရမ်': sale.w_gram || '',
      'ကျပ်': sale.k || '',
      'ပဲ': sale.p || '',
      'ရွေး': sale.y || '',
      'ရွှေ တန်ဖိုး': sale.gold_value || '',
      'ကျပ်သား': sale.kyattar || '',
      'Round Kyattar': sale.round_kyattar || '',
      'အလျော့ ကျပ်': sale.loss_k || '',
      'အလျော့ ပဲ': sale.loss_p || '',
      'အလျော့ ရွေး': sale.loss_y || '',
      'အလျော့ ဂရမ်': sale.loss_gram || '',
      'အလျော့ တန်ဖိုး': sale.loss_value || '',
      'ရွှေတန်ဖိုး စုစုပေါင်း': sale.total_gold_value || '',
      'စိန်/ကျောက် တန်ဖိုး': sale.dia_gem_value || '',
      'စုစုပေါင်း ပစ္စည်းတန်ဖိုး': sale.total_value || '',
      'Purchase Voucher Amount': sale.sale_voucher_amount || '',
      'Different Amount': sale.different_amount || '',
      'Stamp': sale.stamp || '',
      'Total Amount': sale.total_amount || '',
      'ပြေစာအမှတ်': sale.invoice_number || '',
      'ဝယ်ယူသူအမည်': sale.customer_name || '',
      'မှတ်ပုံတင်အမှတ်': sale.nrc_no || '',
      'ဖုန်းနံပါတ်': sale.phone_no || '',
      'လိပ်စာ': sale.address || '',
      'Type': sale.transcation_type || '',
      'On/Off': sale.on_off || '',
      'Change': sale.change || '',
      'Return': sale.return || '',
      'GS Date': sale.gs_date || '',
      'Dia and Gem': sale.dia_and_gem || '',
      'အခြေအနေ': sale.status || '',
      'Real to Payment Amount': sale.real_to_payment_amount || '',
      'Sale Name': sale.employee_name || '',
      'မှတ်ချက်': sale.remark || '',
      'Sale Status': sale.sale_status_name || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Records');
    XLSX.writeFile(wb, `Sales_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h1>Sales List</h1>
      </div>

      <div className="sales-filters">
        <div className="filter-header">
          <h3>စစ်ထုတ်ရန် (Filters)</h3>
          <div className="filter-indicators">
            {(() => {
              const userInfo = getLoggedInUserInfo();
              return userInfo.id ? (
                <span className="cashier-indicator">
                  👤 {userInfo.name} (ID: {userInfo.id})
                </span>
              ) : null;
            })()}
            {hasActiveFilters && (
              <span className="filter-indicator">
                🔍 Filters Active ({Object.values(filters).filter(v => v !== '').length})
              </span>
            )}
          </div>
        </div>
        <div className="filter-row">
          <select
            value={filters.sale_status_id}
            onChange={(e) => handleFilterChange('sale_status_id', e.target.value)}
          >
            <option value="">All Sale Status</option>
            {saleStatuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
          
          <input
            type="date"
            placeholder="From Date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
          />
          
          <input
            type="date"
            placeholder="To Date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
          />
          
          <input
            type="text"
            placeholder="Item Code"
            value={filters.item_code}
            onChange={(e) => handleFilterChange('item_code', e.target.value)}
          />
          
         
        </div>
         <div className="filter-rows"> 
             <input
            type="text"
            placeholder="Invoice Number"
            value={filters.invoice_number}
            onChange={(e) => handleFilterChange('invoice_number', e.target.value)}
          />
          
          <button onClick={handleSearch} className="btn-filter">စစ်ထုတ်ရန်</button>
          <button onClick={handleClearFilters} className="btn-clear">ရှင်းလင်းရန်</button>

         </div>
      </div>

      <div className="sales-table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3>စာရင်းများ (Records)</h3>
            <div style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {(() => {
                const userInfo = getLoggedInUserInfo();
                return userInfo.id ? (
                  <span>Showing {sales.length} records for {userInfo.name}</span>
                ) : (
                  <span>{hasActiveFilters ? `Showing ${sales.length} filtered records` : `Showing ${sales.length} records`}</span>
                );
              })()}
            </div>
          </div>
          <button onClick={exportToExcel} className="btn-primary" style={{ padding: '10px 20px' }}>
            📊 Export to Excel
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="sales-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Select</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>လ</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ဆိုင်ခွဲအမှတ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ရက်စွဲ</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ပစ္စည်း ကုတ်အမှတ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ပစ္စည်းအမျိုးအစား</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>အရေအတွက်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>စိန်ပွင့်ရေ</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ကျောက်ပွင့်ရေ</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>စုစုပေါင်း အလေးချိန်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ရွှေချိန်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ကျောက်ချိန်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ပဲရည်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ရွှေဈေးနူန်း</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>အထည် ဂရမ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ကျပ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ပဲ</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ရွေး</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ရွှေ တန်ဖိုး</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ကျပ်သား</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Round Kyattar</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>အလျော့ ကျပ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>အလျော့ ပဲ</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>အလျော့ ရွေး</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>အလျော့ ဂရမ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>အလျော့ တန်ဖိုး</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ရွှေတန်ဖိုး စုစုပေါင်း</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>စိန်/ကျောက် တန်ဖိုး</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>စုစုပေါင်း ပစ္စည်းတန်ဖိုး</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Purchase Voucher Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Different Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Stamp</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ပြေစာအမှတ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ဝယ်ယူသူအမည်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>မှတ်ပုံတင်အမှတ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>ဖုန်းနံပါတ်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>လိပ်စာ</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Type</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>On/Off</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Change</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Return</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>GS Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Dia and Gem</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>အခြေအနေ</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Real to Payment Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Sale Name</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>မှတ်ချက်</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Sale Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>လုပ်ဆောင်ချက်များ</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={50} style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd' }}>
                      No sales records found
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr 
                      key={sale.id}
                      style={{ 
                        backgroundColor: selectedRows.has(sale.id) ? '#e3f2fd' : 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(sale.id)}
                          onChange={() => handleRowSelect(sale.id)}
                        />
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.month || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.branch_name || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.date ? new Date(sale.date).toLocaleDateString('en-GB') : '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.item_code || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.item_categories || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.quantity || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.dia_qty || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.gem_qty || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.total_weight || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.gold_weight || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.gem_weight || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.density || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.gold_price || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.w_gram || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.k || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.p || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.y || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.gold_value || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.kyattar || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.round_kyattar || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.loss_k || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.loss_p || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.loss_y || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.loss_gram || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.loss_value || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.total_gold_value || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.dia_gem_value || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.total_value || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.sale_voucher_amount || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.different_amount || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.stamp || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.total_amount?.toLocaleString() || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.invoice_number || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.customer_name || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.nrc_no || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.phone_no || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.address || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.transcation_type || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.on_off || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.change || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.return || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.gs_date || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.dia_and_gem || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        <span className={`status-badge status-${sale.status}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.real_to_payment_amount || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.employee_name || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.remark || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sale.sale_status_name || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleEdit(sale.id); }} title="Edit">✏️</button>
                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); console.log('Print button clicked'); handlePrint(sale); }} title="Print">🖨️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedSale && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Sale Record' : 'Sale Record Details'}</h2>
              <small style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>
                Tab ID: {selectedSale?.sale_status_id} | Status: {selectedSale?.sale_status_name}
              </small>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {isEditMode ? (
                <div className="edit-form">
                  <div className="form-grid">
                    {/* Common Fields for All Tabs */}
                    <div className="form-group">
                      <label>လ (Month):</label>
                      <select value={selectedSale.month || ''} onChange={(e) => setSelectedSale({...selectedSale, month: parseInt(e.target.value) || 0})}>
                        <option value="">Select Month</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>ပစ္စည်း ကုတ်အမှတ် (Item Code):</label>
                      <input type="text" value={selectedSale.item_code || ''} onChange={(e) => setSelectedSale({...selectedSale, item_code: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>အရေအတွက် (Quantity):</label>
                      <input type="number" value={selectedSale.quantity || ''} onChange={(e) => setSelectedSale({...selectedSale, quantity: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="form-group">
                      <label>စုစုပေါင်း အလေးချိန် (Total Weight):</label>
                      <input type="number" step="0.01" value={selectedSale.total_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, total_weight: parseFloat(e.target.value) || 0})} />
                    </div>

                    {/* Dia RC Tab Specific Fields */}
                    {(() => {
                      console.log('Debug - Sale Status ID:', selectedSale?.sale_status_id);
                      console.log('Debug - Selected Sale:', selectedSale);
                      return selectedSale.sale_status_id === 1;
                    })() && (
                      <>
                        <div className="form-group">
                          <label>ဆိုင်ခွဲအမှတ် (Branch ID):</label>
                          <select value={selectedSale.branch_id || ''} onChange={(e) => setSelectedSale({...selectedSale, branch_id: parseInt(e.target.value) || 0})}>
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name} (ID: {branch.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ရက်စွဲ (Date):</label>
                          <input type="date" value={selectedSale.date ? new Date(selectedSale.date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ပစ္စည်းအမျိုးအစား (Item Categories):</label>
                          <input type="text" value={selectedSale.item_categories || ''} onChange={(e) => setSelectedSale({...selectedSale, item_categories: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>စုစုပေါင်း အလေးချိန် (Total Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.total_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, total_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျောက်ချိန် (Gem Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gem_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gem_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲရည် (Density):</label>
                          <input type="text" value={selectedSale.density || ''} onChange={(e) => setSelectedSale({...selectedSale, density: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အထည် ဂရမ် (W Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.w_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, w_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ် (K):</label>
                          <input type="number" step="0.01" value={selectedSale.k || ''} onChange={(e) => setSelectedSale({...selectedSale, k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲ (P):</label>
                          <input type="number" step="0.01" value={selectedSale.p || ''} onChange={(e) => setSelectedSale({...selectedSale, p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွေး (Y):</label>
                          <input type="number" step="0.01" value={selectedSale.y || ''} onChange={(e) => setSelectedSale({...selectedSale, y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုး (Gold Value):</label>
                          <input type="number" value={selectedSale.gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ်သား (Kyattar):</label>
                          <input type="number" step="0.01" value={selectedSale.kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Round Kyattar:</label>
                          <input type="number" step="0.01" value={selectedSale.round_kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, round_kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ဂရမ် (Loss Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ကျပ် (Loss K):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_k || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ပဲ (Loss P):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_p || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ရွေး (Loss Y):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_y || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့တန်ဖိုး (Loss Value):</label>
                          <input type="number" value={selectedSale.loss_value || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုးစုစုပေါင်း (Total Gold Value):</label>
                          <input type="number" value={selectedSale.total_gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စိန်/ကျောက် တန်ဖိုး (Dia/Gem Value):</label>
                          <input type="number" value={selectedSale.dia_gem_value || ''} onChange={(e) => setSelectedSale({...selectedSale, dia_gem_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value):</label>
                          <input type="number" value={selectedSale.total_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Purchase Voucher Amount:</label>
                          <input type="number" value={selectedSale.sale_voucher_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, sale_voucher_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Different Amount:</label>
                          <input type="number" value={selectedSale.different_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, different_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Stamp:</label>
                          <input type="number" value={selectedSale.stamp || ''} onChange={(e) => setSelectedSale({...selectedSale, stamp: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Total Amount (Voucher+Stamp):</label>
                          <input type="number" value={selectedSale.total_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, total_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပြေစာအမှတ် (Invoice Number):</label>
                          <input type="text" value={selectedSale.invoice_number || ''} onChange={(e) => setSelectedSale({...selectedSale, invoice_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                          <input type="text" value={selectedSale.nrc_no || ''} onChange={(e) => setSelectedSale({...selectedSale, nrc_no: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>လိပ်စာ (Address):</label>
                          <input type="text" value={selectedSale.address || ''} onChange={(e) => setSelectedSale({...selectedSale, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Type (Transaction Type):</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Name (Employee):</label>
                          <div className="searchable-dropdown">
                            <input
                              type="text"
                              placeholder="Search employee..."
                              value={employeeSearchTerm || selectedSale.employee_name || ''}
                              onChange={(e) => {
                                setEmployeeSearchTerm(e.target.value);
                                setShowEmployeeDropdown(true);
                              }}
                              onFocus={() => setShowEmployeeDropdown(true)}
                              onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                              className="employee-search-input"
                            />
                            {showEmployeeDropdown && (
                              <div className="employee-dropdown-list">
                                {filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      className="employee-option"
                                      onMouseDown={() => handleEmployeeSelect(employee)}
                                    >
                                      {employee.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="employee-option no-results">
                                    No employees found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* G RC Tab Specific Fields */}
                    {selectedSale.sale_status_id === 2 && (
                      <>
                        <div className="form-group">
                          <label>ဆိုင်ခွဲအမှတ် (Branch ID):</label>
                          <select value={selectedSale.branch_id || ''} onChange={(e) => setSelectedSale({...selectedSale, branch_id: parseInt(e.target.value) || 0})}>
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name} (ID: {branch.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ရက်စွဲ (Date):</label>
                          <input type="date" value={selectedSale.date ? new Date(selectedSale.date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ပစ္စည်းအမျိုးအစား (Item Categories):</label>
                          <input type="text" value={selectedSale.item_categories || ''} onChange={(e) => setSelectedSale({...selectedSale, item_categories: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲရည် (Density):</label>
                          <input type="text" value={selectedSale.density || ''} onChange={(e) => setSelectedSale({...selectedSale, density: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ် (K):</label>
                          <input type="number" step="0.01" value={selectedSale.k || ''} onChange={(e) => setSelectedSale({...selectedSale, k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲ (P):</label>
                          <input type="number" step="0.01" value={selectedSale.p || ''} onChange={(e) => setSelectedSale({...selectedSale, p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွေး (Y):</label>
                          <input type="number" step="0.01" value={selectedSale.y || ''} onChange={(e) => setSelectedSale({...selectedSale, y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုး (Gold Value):</label>
                          <input type="number" value={selectedSale.gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ်သား (Kyattar):</label>
                          <input type="number" step="0.01" value={selectedSale.kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Round Kyattar:</label>
                          <input type="number" step="0.01" value={selectedSale.round_kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, round_kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ကျပ် (Loss K):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_k || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ပဲ (Loss P):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_p || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ရွေး (Loss Y):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_y || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ဂရမ် (Loss Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့တန်ဖိုး (Loss Value):</label>
                          <input type="number" value={selectedSale.loss_value || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုးစုစုပေါင်း (Total Gold Value):</label>
                          <input type="number" value={selectedSale.total_gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>လက်ခ/အခြား (Charges & Other):</label>
                          <input type="number" value={selectedSale.charges_and_other || ''} onChange={(e) => setSelectedSale({...selectedSale, charges_and_other: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value):</label>
                          <input type="number" value={selectedSale.total_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Voucher Amount:</label>
                          <input type="number" value={selectedSale.sale_voucher_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, sale_voucher_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Different Amount:</label>
                          <input type="number" value={selectedSale.different_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, different_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပြေစာအမှတ် (Invoice Number):</label>
                          <input type="text" value={selectedSale.invoice_number || ''} onChange={(e) => setSelectedSale({...selectedSale, invoice_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                          <input type="text" value={selectedSale.nrc_no || ''} onChange={(e) => setSelectedSale({...selectedSale, nrc_no: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>လိပ်စာ (Address):</label>
                          <input type="text" value={selectedSale.address || ''} onChange={(e) => setSelectedSale({...selectedSale, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Type (Transaction Type):</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Name (Employee):</label>
                          <div className="searchable-dropdown">
                            <input
                              type="text"
                              placeholder="Search employee..."
                              value={employeeSearchTerm || selectedSale.employee_name || ''}
                              onChange={(e) => {
                                setEmployeeSearchTerm(e.target.value);
                                setShowEmployeeDropdown(true);
                              }}
                              onFocus={() => setShowEmployeeDropdown(true)}
                              onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                              className="employee-search-input"
                            />
                            {showEmployeeDropdown && (
                              <div className="employee-dropdown-list">
                                {filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      className="employee-option"
                                      onMouseDown={() => handleEmployeeSelect(employee)}
                                    >
                                      {employee.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="employee-option no-results">
                                    No employees found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="form-group full-width">
                          <label>မှတ်ချက် (Remark):</label>
                          <input type="text" value={selectedSale.remark || ''} onChange={(e) => setSelectedSale({...selectedSale, remark: e.target.value})} />
                        </div>
                      </>
                    )}

                    {/* Dia Sale Tab Specific Fields */}
                    {selectedSale.sale_status_id === 4 && (
                      <>
                        <div className="form-group">
                          <label>ဆိုင်ခွဲအမှတ် (Branch ID):</label>
                          <select value={selectedSale.branch_id || ''} onChange={(e) => setSelectedSale({...selectedSale, branch_id: parseInt(e.target.value) || 0})}>
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name} (ID: {branch.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ရက်စွဲ (Date):</label>
                          <input type="date" value={selectedSale.date ? new Date(selectedSale.date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ပစ္စည်းအမျိုးအစား (Item Categories):</label>
                          <input type="text" value={selectedSale.item_categories || ''} onChange={(e) => setSelectedSale({...selectedSale, item_categories: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>စိန်ပွင့်ရေ (Diamond Qty):</label>
                          <input type="number" value={selectedSale.dia_qty || ''} onChange={(e) => setSelectedSale({...selectedSale, dia_qty: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျောက်ပွင့်ရေ (Gem Qty):</label>
                          <input type="number" value={selectedSale.gem_qty || ''} onChange={(e) => setSelectedSale({...selectedSale, gem_qty: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စုစုပေါင်း အလေးချိန် (Total Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.total_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, total_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျောက်ချိန် (Gem Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gem_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gem_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲရည် (Density):</label>
                          <input type="text" value={selectedSale.density || ''} onChange={(e) => setSelectedSale({...selectedSale, density: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အထည် ဂရမ် (W Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.w_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, w_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ် (K):</label>
                          <input type="number" step="0.01" value={selectedSale.k || ''} onChange={(e) => setSelectedSale({...selectedSale, k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲ (P):</label>
                          <input type="number" step="0.01" value={selectedSale.p || ''} onChange={(e) => setSelectedSale({...selectedSale, p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွေး (Y):</label>
                          <input type="number" step="0.01" value={selectedSale.y || ''} onChange={(e) => setSelectedSale({...selectedSale, y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုး (Gold Value):</label>
                          <input type="number" value={selectedSale.gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ်သား (Kyattar):</label>
                          <input type="number" step="0.01" value={selectedSale.kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Round Kyattar:</label>
                          <input type="number" step="0.01" value={selectedSale.round_kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, round_kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ဂရမ် (Loss Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ကျပ် (Loss K):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_k || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ပဲ (Loss P):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_p || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ရွေး (Loss Y):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_y || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့တန်ဖိုး (Loss Value):</label>
                          <input type="number" value={selectedSale.loss_value || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုးစုစုပေါင်း (Total Gold Value):</label>
                          <input type="number" value={selectedSale.total_gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စိန်/ကျောက် တန်ဖိုး (Dia/Gem Value):</label>
                          <input type="number" value={selectedSale.dia_gem_value || ''} onChange={(e) => setSelectedSale({...selectedSale, dia_gem_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value):</label>
                          <input type="number" value={selectedSale.total_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Voucher Amount:</label>
                          <input type="number" value={selectedSale.sale_voucher_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, sale_voucher_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Different Amount:</label>
                          <input type="number" value={selectedSale.different_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, different_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Stamp:</label>
                          <input type="number" value={selectedSale.stamp || ''} onChange={(e) => setSelectedSale({...selectedSale, stamp: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Total Amount (Voucher+Stamp):</label>
                          <input type="number" value={selectedSale.total_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, total_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပြေစာအမှတ် (Invoice Number):</label>
                          <input type="text" value={selectedSale.invoice_number || ''} onChange={(e) => setSelectedSale({...selectedSale, invoice_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                          <input type="text" value={selectedSale.nrc_no || ''} onChange={(e) => setSelectedSale({...selectedSale, nrc_no: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>လိပ်စာ (Address):</label>
                          <input type="text" value={selectedSale.address || ''} onChange={(e) => setSelectedSale({...selectedSale, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Transaction Type:</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Prefix:</label>
                          <input type="text" value={selectedSale.prefix || ''} onChange={(e) => setSelectedSale({...selectedSale, prefix: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Name (Employee):</label>
                          <div className="searchable-dropdown">
                            <input
                              type="text"
                              placeholder="Search employee..."
                              value={employeeSearchTerm || selectedSale.employee_name || ''}
                              onChange={(e) => {
                                setEmployeeSearchTerm(e.target.value);
                                setShowEmployeeDropdown(true);
                              }}
                              onFocus={() => setShowEmployeeDropdown(true)}
                              onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                              className="employee-search-input"
                            />
                            {showEmployeeDropdown && (
                              <div className="employee-dropdown-list">
                                {filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      className="employee-option"
                                      onMouseDown={() => handleEmployeeSelect(employee)}
                                    >
                                      {employee.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="employee-option no-results">
                                    No employees found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="form-group">
                          <label>On/Off:</label>
                          <select value={selectedSale.on_off || ''} onChange={(e) => setSelectedSale({...selectedSale, on_off: e.target.value as 'online' | 'offline'})}>
                            <option value="">Select</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Change (%):</label>
                          <input type="number" step="0.01" value={selectedSale.change || ''} onChange={(e) => setSelectedSale({...selectedSale, change: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Return (%):</label>
                          <input type="number" step="0.01" value={selectedSale.return || ''} onChange={(e) => setSelectedSale({...selectedSale, return: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Goldsmith Date:</label>
                          <input type="date" value={selectedSale.gs_date ? new Date(selectedSale.gs_date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, gs_date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Dia & Gem:</label>
                          <select value={selectedSale.dia_and_gem || ''} onChange={(e) => setSelectedSale({...selectedSale, dia_and_gem: e.target.value as 'diamond' | 'gem'})}>
                            <option value="">Select</option>
                            <option value="diamond">Diamond</option>
                            <option value="gem">Gem</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>New/Return:</label>
                          <select value={selectedSale.status || ''} onChange={(e) => setSelectedSale({...selectedSale, status: e.target.value as 'new' | 'return'})}>
                            <option value="">Select</option>
                            <option value="new">New</option>
                            <option value="return">Return</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Ready to Sale Amount:</label>
                          <input type="number" value={selectedSale.real_to_payment_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, real_to_payment_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                      </>
                    )}

                    {/* Original Dia Sale Tab (ID: 2) */}
                    {selectedSale.sale_status_id === 2 && (
                      <>
                        <div className="form-group">
                          <label>ဆိုင်ခွဲအမှတ် (Branch ID):</label>
                          <select value={selectedSale.branch_id || ''} onChange={(e) => setSelectedSale({...selectedSale, branch_id: parseInt(e.target.value) || 0})}>
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name} (ID: {branch.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ရက်စွဲ (Date):</label>
                          <input type="date" value={selectedSale.date ? new Date(selectedSale.date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ပစ္စည်းအမျိုးအစား (Item Categories):</label>
                          <input type="text" value={selectedSale.item_categories || ''} onChange={(e) => setSelectedSale({...selectedSale, item_categories: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>စိန်ပွင့်ရေ (Dia Qty):</label>
                          <input type="number" value={selectedSale.dia_qty || ''} onChange={(e) => setSelectedSale({...selectedSale, dia_qty: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျောက်ပွင့်ရေ (Gem Qty):</label>
                          <input type="number" value={selectedSale.gem_qty || ''} onChange={(e) => setSelectedSale({...selectedSale, gem_qty: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျောက်ချိန် (Gem Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gem_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gem_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲရည် (Density):</label>
                          <input type="text" value={selectedSale.density || ''} onChange={(e) => setSelectedSale({...selectedSale, density: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ် (K):</label>
                          <input type="number" step="0.01" value={selectedSale.k || ''} onChange={(e) => setSelectedSale({...selectedSale, k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲ (P):</label>
                          <input type="number" step="0.01" value={selectedSale.p || ''} onChange={(e) => setSelectedSale({...selectedSale, p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွေး (Y):</label>
                          <input type="number" step="0.01" value={selectedSale.y || ''} onChange={(e) => setSelectedSale({...selectedSale, y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အထည်ဂရမ် (W Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.w_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, w_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုး (Gold Value):</label>
                          <input type="number" value={selectedSale.gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ်သား (Kyattar):</label>
                          <input type="number" step="0.01" value={selectedSale.kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Round Kyattar:</label>
                          <input type="number" step="0.01" value={selectedSale.round_kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, round_kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ဂရမ် (Loss Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့တန်ဖိုး (Loss Value):</label>
                          <input type="number" value={selectedSale.loss_value || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုးစုစုပေါင်း (Total Gold Value):</label>
                          <input type="number" value={selectedSale.total_gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စိန်/ကျောက်တန်ဖိုး (Dia Gem Value):</label>
                          <input type="number" value={selectedSale.dia_gem_value || ''} onChange={(e) => setSelectedSale({...selectedSale, dia_gem_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စုစုပေါင်းတန်ဖိုး (Total Value):</label>
                          <input type="number" value={selectedSale.total_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Voucher Amount:</label>
                          <input type="number" value={selectedSale.sale_voucher_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, sale_voucher_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Different Amount:</label>
                          <input type="number" value={selectedSale.different_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, different_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Stamp:</label>
                          <input type="number" value={selectedSale.stamp || ''} onChange={(e) => setSelectedSale({...selectedSale, stamp: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Total Amount:</label>
                          <input type="number" value={selectedSale.total_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, total_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပြေစာအမှတ် (Invoice Number):</label>
                          <input type="text" value={selectedSale.invoice_number || ''} onChange={(e) => setSelectedSale({...selectedSale, invoice_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                          <input type="text" value={selectedSale.nrc_no || ''} onChange={(e) => setSelectedSale({...selectedSale, nrc_no: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>လိပ်စာ (Address):</label>
                          <input type="text" value={selectedSale.address || ''} onChange={(e) => setSelectedSale({...selectedSale, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>အမျိုးအစား (Transaction Type):</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Prefix:</label>
                          <input type="text" value={selectedSale.prefix || ''} onChange={(e) => setSelectedSale({...selectedSale, prefix: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Online/Offline:</label>
                          <select value={selectedSale.on_off || ''} onChange={(e) => setSelectedSale({...selectedSale, on_off: e.target.value as 'online' | 'offline'})}>
                            <option value="">Select</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Change %:</label>
                          <input type="number" step="0.01" value={selectedSale.change || ''} onChange={(e) => setSelectedSale({...selectedSale, change: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Return %:</label>
                          <input type="number" step="0.01" value={selectedSale.return || ''} onChange={(e) => setSelectedSale({...selectedSale, return: parseFloat(e.target.value) || 0})} />
                        </div>
                        {/* <div className="form-group">
                          <label>Goldsmith Date:</label>
                          <input type="date" value={selectedSale.gs_date ? new Date(selectedSale.gs_date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, gs_date: e.target.value})} />
                        </div> */}
                        <div className="form-group">
                          <label>Diamond/Gem:</label>
                          <select value={selectedSale.dia_and_gem || ''} onChange={(e) => setSelectedSale({...selectedSale, dia_and_gem: e.target.value as 'diamond' | 'gem'})}>
                            <option value="">Select</option>
                            <option value="diamond">Diamond</option>
                            <option value="gem">Gem</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Status (New/Return):</label>
                          <select value={selectedSale.status || ''} onChange={(e) => setSelectedSale({...selectedSale, status: e.target.value as 'new' | 'return'})}>
                            <option value="">Select</option>
                            <option value="new">New</option>
                            <option value="return">Return</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Real to Payment Amount:</label>
                          <input type="number" value={selectedSale.real_to_payment_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, real_to_payment_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Name (Employee):</label>
                          <div className="searchable-dropdown">
                            <input
                              type="text"
                              placeholder="Search employee..."
                              value={employeeSearchTerm || selectedSale.employee_name || ''}
                              onChange={(e) => {
                                setEmployeeSearchTerm(e.target.value);
                                setShowEmployeeDropdown(true);
                              }}
                              onFocus={() => setShowEmployeeDropdown(true)}
                              onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                              className="employee-search-input"
                            />
                            {showEmployeeDropdown && (
                              <div className="employee-dropdown-list">
                                {filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      className="employee-option"
                                      onMouseDown={() => handleEmployeeSelect(employee)}
                                    >
                                      {employee.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="employee-option no-results">
                                    No employees found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* G Sale Tab Specific Fields */}
                    {selectedSale.sale_status_id === 3 && (
                      <>
                        <div className="form-group">
                          <label>ဆိုင်ခွဲအမှတ် (Branch ID):</label>
                          <select value={selectedSale.branch_id || ''} onChange={(e) => setSelectedSale({...selectedSale, branch_id: parseInt(e.target.value) || 0})}>
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name} (ID: {branch.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ရက်စွဲ (Date):</label>
                          <input type="date" value={selectedSale.date ? new Date(selectedSale.date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ပစ္စည်းအမျိုးအစား (Item Categories):</label>
                          <input type="text" value={selectedSale.item_categories || ''} onChange={(e) => setSelectedSale({...selectedSale, item_categories: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျောက်ချိန် (Gem Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gem_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gem_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲရည် (Density):</label>
                          <input type="text" value={selectedSale.density || ''} onChange={(e) => setSelectedSale({...selectedSale, density: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ် (K):</label>
                          <input type="number" step="0.01" value={selectedSale.k || ''} onChange={(e) => setSelectedSale({...selectedSale, k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲ (P):</label>
                          <input type="number" step="0.01" value={selectedSale.p || ''} onChange={(e) => setSelectedSale({...selectedSale, p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွေး (Y):</label>
                          <input type="number" step="0.01" value={selectedSale.y || ''} onChange={(e) => setSelectedSale({...selectedSale, y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုး (Gold Value):</label>
                          <input type="number" value={selectedSale.gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ်သား (Kyattar):</label>
                          <input type="number" step="0.01" value={selectedSale.kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Round Kyattar:</label>
                          <input type="number" step="0.01" value={selectedSale.round_kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, round_kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ကျပ် (Loss K):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_k || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ပဲ (Loss P):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_p || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ရွေး (Loss Y):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_y || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ဂရမ် (Loss Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့တန်ဖိုး (Loss Value):</label>
                          <input type="number" value={selectedSale.loss_value || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုးစုစုပေါင်း (Total Gold Value):</label>
                          <input type="number" value={selectedSale.total_gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Purchase Voucher Amount:</label>
                          <input type="number" value={selectedSale.sale_voucher_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, sale_voucher_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Different Amount:</label>
                          <input type="number" value={selectedSale.different_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, different_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပြေစာအမှတ် (Invoice Number):</label>
                          <input type="text" value={selectedSale.invoice_number || ''} onChange={(e) => setSelectedSale({...selectedSale, invoice_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                          <input type="text" value={selectedSale.nrc_no || ''} onChange={(e) => setSelectedSale({...selectedSale, nrc_no: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>လိပ်စာ (Address):</label>
                          <input type="text" value={selectedSale.address || ''} onChange={(e) => setSelectedSale({...selectedSale, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Type:</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Name (Employee):</label>
                          <div className="searchable-dropdown">
                            <input
                              type="text"
                              placeholder="Search employee..."
                              value={employeeSearchTerm || selectedSale.employee_name || ''}
                              onChange={(e) => {
                                setEmployeeSearchTerm(e.target.value);
                                setShowEmployeeDropdown(true);
                              }}
                              onFocus={() => setShowEmployeeDropdown(true)}
                              onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                              className="employee-search-input"
                            />
                            {showEmployeeDropdown && (
                              <div className="employee-dropdown-list">
                                {filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      className="employee-option"
                                      onMouseDown={() => handleEmployeeSelect(employee)}
                                    >
                                      {employee.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="employee-option no-results">
                                    No employees found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* G Sale Tab 5 Specific Fields */}
                    {selectedSale.sale_status_id === 5 && (
                      <>
                        <div className="form-group">
                          <label>ဆိုင်ခွဲအမှတ် (Branch ID):</label>
                          <select value={selectedSale.branch_id || ''} onChange={(e) => setSelectedSale({...selectedSale, branch_id: parseInt(e.target.value) || 0})}>
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name} (ID: {branch.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ရက်စွဲ (Date):</label>
                          <input type="date" value={selectedSale.date ? new Date(selectedSale.date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ပစ္စည်းအမျိုးအစား (Item Categories):</label>
                          <input type="text" value={selectedSale.item_categories || ''} onChange={(e) => setSelectedSale({...selectedSale, item_categories: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲရည် (Density):</label>
                          <input type="text" value={selectedSale.density || ''} onChange={(e) => setSelectedSale({...selectedSale, density: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အထည် ဂရမ် (W Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.w_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, w_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ် (K):</label>
                          <input type="number" step="0.01" value={selectedSale.k || ''} onChange={(e) => setSelectedSale({...selectedSale, k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲ (P):</label>
                          <input type="number" step="0.01" value={selectedSale.p || ''} onChange={(e) => setSelectedSale({...selectedSale, p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွေး (Y):</label>
                          <input type="number" step="0.01" value={selectedSale.y || ''} onChange={(e) => setSelectedSale({...selectedSale, y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုး (Gold Value):</label>
                          <input type="number" value={selectedSale.gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ်သား (Kyattar):</label>
                          <input type="number" step="0.01" value={selectedSale.kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Round Kyattar:</label>
                          <input type="number" step="0.01" value={selectedSale.round_kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, round_kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ဂရမ် (Loss Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ကျပ် (Loss K):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_k || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ပဲ (Loss P):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_p || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ရွေး (Loss Y):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_y || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့တန်ဖိုး (Loss Value):</label>
                          <input type="number" value={selectedSale.loss_value || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုးစုစုပေါင်း (Total Gold Value):</label>
                          <input type="number" value={selectedSale.total_gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>လက်ခ/အခြား (Charges & Other):</label>
                          <input type="number" value={selectedSale.charges_and_other || ''} onChange={(e) => setSelectedSale({...selectedSale, charges_and_other: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value):</label>
                          <input type="number" value={selectedSale.total_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Voucher Amount:</label>
                          <input type="number" value={selectedSale.sale_voucher_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, sale_voucher_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Different Amount:</label>
                          <input type="number" value={selectedSale.different_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, different_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Stamp:</label>
                          <input type="number" value={selectedSale.stamp || ''} onChange={(e) => setSelectedSale({...selectedSale, stamp: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Total Amount (Voucher+Stamp):</label>
                          <input type="number" value={selectedSale.total_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, total_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပြေစာအမှတ် (Invoice Number):</label>
                          <input type="text" value={selectedSale.invoice_number || ''} onChange={(e) => setSelectedSale({...selectedSale, invoice_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                          <input type="text" value={selectedSale.nrc_no || ''} onChange={(e) => setSelectedSale({...selectedSale, nrc_no: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>လိပ်စာ (Address):</label>
                          <input type="text" value={selectedSale.address || ''} onChange={(e) => setSelectedSale({...selectedSale, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Status (New/Return):</label>
                          <select value={selectedSale.status || ''} onChange={(e) => setSelectedSale({...selectedSale, status: e.target.value as 'new' | 'return'})}>
                            <option value="">Select</option>
                            <option value="new">New</option>
                            <option value="return">Return</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Transaction Type:</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Prefix:</label>
                          <input type="text" value={selectedSale.prefix || ''} onChange={(e) => setSelectedSale({...selectedSale, prefix: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Name (Employee):</label>
                          <div className="searchable-dropdown">
                            <input
                              type="text"
                              placeholder="Search employee..."
                              value={employeeSearchTerm || selectedSale.employee_name || ''}
                              onChange={(e) => {
                                setEmployeeSearchTerm(e.target.value);
                                setShowEmployeeDropdown(true);
                              }}
                              onFocus={() => setShowEmployeeDropdown(true)}
                              onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                              className="employee-search-input"
                            />
                            {showEmployeeDropdown && (
                              <div className="employee-dropdown-list">
                                {filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      className="employee-option"
                                      onMouseDown={() => handleEmployeeSelect(employee)}
                                    >
                                      {employee.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="employee-option no-results">
                                    No employees found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="form-group">
                          <label>On/Off:</label>
                          <select value={selectedSale.on_off || ''} onChange={(e) => setSelectedSale({...selectedSale, on_off: e.target.value as 'online' | 'offline'})}>
                            <option value="">Select</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Goldsmith Date:</label>
                          <input type="date" value={selectedSale.gs_date ? new Date(selectedSale.gs_date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, gs_date: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>မှတ်ချက် (Remark):</label>
                          <input type="text" value={selectedSale.remark || ''} onChange={(e) => setSelectedSale({...selectedSale, remark: e.target.value})} />
                        </div>
                      </>
                    )}

                    {/* PT Sale Tab Specific Fields */}
                    {selectedSale.sale_status_id === 6 && (
                      <>
                        <div className="form-group">
                          <label>ဆိုင်ခွဲအမှတ် (Branch ID):</label>
                          <select value={selectedSale.branch_id || ''} onChange={(e) => setSelectedSale({...selectedSale, branch_id: parseInt(e.target.value) || 0})}>
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name} (ID: {branch.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ရက်စွဲ (Date):</label>
                          <input type="date" value={selectedSale.date ? new Date(selectedSale.date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ပစ္စည်းအမျိုးအစား (Item Categories):</label>
                          <input type="text" value={selectedSale.item_categories || ''} onChange={(e) => setSelectedSale({...selectedSale, item_categories: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျောက်ချိန် (Gem Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gem_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gem_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲရည် (Density):</label>
                          <input type="text" value={selectedSale.density || ''} onChange={(e) => setSelectedSale({...selectedSale, density: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အထည် ဂရမ် (W Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.w_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, w_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ် (K):</label>
                          <input type="number" step="0.01" value={selectedSale.k || ''} onChange={(e) => setSelectedSale({...selectedSale, k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပဲ (P):</label>
                          <input type="number" step="0.01" value={selectedSale.p || ''} onChange={(e) => setSelectedSale({...selectedSale, p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွေး (Y):</label>
                          <input type="number" step="0.01" value={selectedSale.y || ''} onChange={(e) => setSelectedSale({...selectedSale, y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုး (Gold Value):</label>
                          <input type="number" value={selectedSale.gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ကျပ်သား (Kyattar):</label>
                          <input type="number" step="0.01" value={selectedSale.kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Round Kyattar:</label>
                          <input type="number" step="0.01" value={selectedSale.round_kyattar || ''} onChange={(e) => setSelectedSale({...selectedSale, round_kyattar: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ဂရမ် (Loss Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ကျပ် (Loss K):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_k || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_k: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ပဲ (Loss P):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_p || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_p: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့ ရွေး (Loss Y):</label>
                          <input type="number" step="0.01" value={selectedSale.loss_y || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_y: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အလျော့တန်ဖိုး (Loss Value):</label>
                          <input type="number" value={selectedSale.loss_value || ''} onChange={(e) => setSelectedSale({...selectedSale, loss_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေတန်ဖိုးစုစုပေါင်း (Total Gold Value):</label>
                          <input type="number" value={selectedSale.total_gold_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_gold_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value):</label>
                          <input type="number" value={selectedSale.total_value || ''} onChange={(e) => setSelectedSale({...selectedSale, total_value: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Voucher Amount:</label>
                          <input type="number" value={selectedSale.sale_voucher_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, sale_voucher_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Different Amount:</label>
                          <input type="number" value={selectedSale.different_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, different_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Stamp:</label>
                          <input type="number" value={selectedSale.stamp || ''} onChange={(e) => setSelectedSale({...selectedSale, stamp: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Total Amount (Voucher+Stamp):</label>
                          <input type="number" value={selectedSale.total_amount || ''} onChange={(e) => setSelectedSale({...selectedSale, total_amount: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပြေစာအမှတ် (Invoice Number):</label>
                          <input type="text" value={selectedSale.invoice_number || ''} onChange={(e) => setSelectedSale({...selectedSale, invoice_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                          <input type="text" value={selectedSale.nrc_no || ''} onChange={(e) => setSelectedSale({...selectedSale, nrc_no: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>လိပ်စာ (Address):</label>
                          <input type="text" value={selectedSale.address || ''} onChange={(e) => setSelectedSale({...selectedSale, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Status (New/Return):</label>
                          <select value={selectedSale.status || ''} onChange={(e) => setSelectedSale({...selectedSale, status: e.target.value as 'new' | 'return'})}>
                            <option value="">Select</option>
                            <option value="new">New</option>
                            <option value="return">Return</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Transaction Type:</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Prefix:</label>
                          <input type="text" value={selectedSale.prefix || ''} onChange={(e) => setSelectedSale({...selectedSale, prefix: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Sale Name (Employee):</label>
                          <div className="searchable-dropdown">
                            <input
                              type="text"
                              placeholder="Search employee..."
                              value={employeeSearchTerm || selectedSale.employee_name || ''}
                              onChange={(e) => {
                                setEmployeeSearchTerm(e.target.value);
                                setShowEmployeeDropdown(true);
                              }}
                              onFocus={() => setShowEmployeeDropdown(true)}
                              onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                              className="employee-search-input"
                            />
                            {showEmployeeDropdown && (
                              <div className="employee-dropdown-list">
                                {filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      className="employee-option"
                                      onMouseDown={() => handleEmployeeSelect(employee)}
                                    >
                                      {employee.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="employee-option no-results">
                                    No employees found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="form-group">
                          <label>On/Off:</label>
                          <select value={selectedSale.on_off || ''} onChange={(e) => setSelectedSale({...selectedSale, on_off: e.target.value as 'online' | 'offline'})}>
                            <option value="">Select</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Change (%):</label>
                          <input type="number" step="0.01" value={selectedSale.change || ''} onChange={(e) => setSelectedSale({...selectedSale, change: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Return (%):</label>
                          <input type="number" step="0.01" value={selectedSale.return || ''} onChange={(e) => setSelectedSale({...selectedSale, return: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Goldsmith Date:</label>
                          <input type="date" value={selectedSale.gs_date ? new Date(selectedSale.gs_date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, gs_date: e.target.value})} />
                        </div>
                      </>
                    )}

                    {/* G RC Tab Specific Fields */}
                    {selectedSale.sale_status_id === 4 && (
                      <>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ပြေစာအမှတ် (Invoice Number):</label>
                          <input type="text" value={selectedSale.invoice_number || ''} onChange={(e) => setSelectedSale({...selectedSale, invoice_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                          <input type="text" value={selectedSale.nrc_no || ''} onChange={(e) => setSelectedSale({...selectedSale, nrc_no: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                          <label>လိပ်စာ (Address):</label>
                          <input type="text" value={selectedSale.address || ''} onChange={(e) => setSelectedSale({...selectedSale, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>အမျိုးအစား (Transaction Type):</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                      </>
                    )}

                    {/* PT Sale Tab Specific Fields */}
                    {selectedSale.sale_status_id === 5 && (
                      <>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အထည်ဂရမ် (W Gram):</label>
                          <input type="number" step="0.01" value={selectedSale.w_gram || ''} onChange={(e) => setSelectedSale({...selectedSale, w_gram: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Prefix:</label>
                          <input type="text" value={selectedSale.prefix || ''} onChange={(e) => setSelectedSale({...selectedSale, prefix: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Online/Offline:</label>
                          <select value={selectedSale.on_off || ''} onChange={(e) => setSelectedSale({...selectedSale, on_off: e.target.value as 'online' | 'offline'})}>
                            <option value="">Select</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Change %:</label>
                          <input type="number" step="0.01" value={selectedSale.change || ''} onChange={(e) => setSelectedSale({...selectedSale, change: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Return %:</label>
                          <input type="number" step="0.01" value={selectedSale.return || ''} onChange={(e) => setSelectedSale({...selectedSale, return: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>Goldsmith Date:</label>
                          <input type="date" value={selectedSale.gs_date ? new Date(selectedSale.gs_date).toISOString().split('T')[0] : ''} onChange={(e) => setSelectedSale({...selectedSale, gs_date: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Status (New/Return):</label>
                          <select value={selectedSale.status || ''} onChange={(e) => setSelectedSale({...selectedSale, status: e.target.value as 'new' | 'return'})}>
                            <option value="">Select</option>
                            <option value="new">New</option>
                            <option value="return">Return</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                          <input type="text" value={selectedSale.customer_name || ''} onChange={(e) => setSelectedSale({...selectedSale, customer_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>ဖုန်းနံပါတ် (Phone No):</label>
                          <input type="text" value={selectedSale.phone_no || ''} onChange={(e) => setSelectedSale({...selectedSale, phone_no: e.target.value})} />
                        </div>
                      </>
                    )}

                    {/* PT RC Tab Specific Fields */}
                    {selectedSale.sale_status_id === 6 && (
                      <>
                        <div className="form-group">
                          <label>ရွှေချိန် (Gold Weight):</label>
                          <input type="number" step="0.01" value={selectedSale.gold_weight || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_weight: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>ရွှေဈေးနူန်း (Gold Price):</label>
                          <input type="number" value={selectedSale.gold_price || ''} onChange={(e) => setSelectedSale({...selectedSale, gold_price: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div className="form-group">
                          <label>အမျိုးအစား (Transaction Type):</label>
                          <input type="text" value={selectedSale.transcation_type || ''} onChange={(e) => setSelectedSale({...selectedSale, transcation_type: e.target.value})} />
                        </div>
                      </>
                    )}

                    <div className="form-group full-width">
                      <label>မှတ်ချက် (Remark):</label>
                      <textarea value={selectedSale.remark || ''} onChange={(e) => setSelectedSale({...selectedSale, remark: e.target.value})} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>လ (Month):</label>
                    <span>{selectedSale.month || '-'}</span>
                  </div>
                <div className="detail-item">
                  <label>ဆိုင်ခွဲအမှတ် (Branch):</label>
                  <span>{selectedSale.branch_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ရက်စွဲ (Date):</label>
                  <span>{selectedSale.date ? new Date(selectedSale.date).toLocaleDateString('en-GB') : '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ပစ္စည်း ကုတ်အမှတ် (Item Code):</label>
                  <span>{selectedSale.item_code || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ပစ္စည်းအမျိုးအစား (Item Categories):</label>
                  <span>{selectedSale.item_categories || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>အရေအတွက် (Quantity):</label>
                  <span>{selectedSale.quantity || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>စိန်ပွင့်ရေ (Dia Qty):</label>
                  <span>{selectedSale.dia_qty || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ကျောက်ပွင့်ရေ (Gem Qty):</label>
                  <span>{selectedSale.gem_qty || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>စုစုပေါင်း အလေးချိန် (Total Weight):</label>
                  <span>{selectedSale.total_weight || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ရွှေချိန် (Gold Weight):</label>
                  <span>{selectedSale.gold_weight || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ကျောက်ချိန် (Gem Weight):</label>
                  <span>{selectedSale.gem_weight || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ပဲရည် (Density):</label>
                  <span>{selectedSale.density || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ရွှေဈေးနူန်း (Gold Price):</label>
                  <span>{selectedSale.gold_price || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ကျပ် (K):</label>
                  <span>{selectedSale.k || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ပဲ (P):</label>
                  <span>{selectedSale.p || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ရွေး (Y):</label>
                  <span>{selectedSale.y || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>အထည် ဂရမ် (W Gram):</label>
                  <span>{selectedSale.w_gram || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ရွှေ တန်ဖိုး (Gold Value):</label>
                  <span>{selectedSale.gold_value || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ကျပ်သား (Kyattar):</label>
                  <span>{selectedSale.kyattar || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Round Kyattar:</label>
                  <span>{selectedSale.round_kyattar || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>အလျော့ ကျပ် (Loss K):</label>
                  <span>{selectedSale.loss_k || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>အလျော့ ပဲ (Loss P):</label>
                  <span>{selectedSale.loss_p || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>အလျော့ ရွေး (Loss Y):</label>
                  <span>{selectedSale.loss_y || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>အလျော့ ဂရမ် (Loss Gram):</label>
                  <span>{selectedSale.loss_gram || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>အလျော့ တန်ဖိုး (Loss Value):</label>
                  <span>{selectedSale.loss_value || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ရွှေတန်ဖိုး စုစုပေါင်း (Total Gold Value):</label>
                  <span>{selectedSale.total_gold_value || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>စိန်/ကျောက် တန်ဖိုး (Dia/Gem Value):</label>
                  <span>{selectedSale.dia_gem_value || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value):</label>
                  <span>{selectedSale.total_value || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Sale Voucher Amount:</label>
                  <span>{selectedSale.sale_voucher_amount || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Different Amount:</label>
                  <span>{selectedSale.different_amount || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Stamp:</label>
                  <span>{selectedSale.stamp || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Total Amount:</label>
                  <span>{selectedSale.total_amount?.toLocaleString() || 0} K</span>
                </div>
                <div className="detail-item">
                  <label>ပြေစာအမှတ် (Invoice Number):</label>
                  <span>{selectedSale.invoice_number || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ဝယ်ယူသူအမည် (Customer Name):</label>
                  <span>{selectedSale.customer_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>မှတ်ပုံတင်အမှတ် (NRC No):</label>
                  <span>{selectedSale.nrc_no || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>ဖုန်းနံပါတ် (Phone No):</label>
                  <span>{selectedSale.phone_no || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>လိပ်စာ (Address):</label>
                  <span>{selectedSale.address || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Type (Transaction Type):</label>
                  <span>{selectedSale.transcation_type || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>On/Off:</label>
                  <span>{selectedSale.on_off || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Change (%):</label>
                  <span>{selectedSale.change || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Return (%):</label>
                  <span>{selectedSale.return || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Goldsmith Date:</label>
                  <span>{selectedSale.gs_date ? new Date(selectedSale.gs_date).toLocaleDateString('en-GB') : '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Dia & Gem:</label>
                  <span>{selectedSale.dia_and_gem || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Status (New/Return):</label>
                  <span className={`status-badge status-${selectedSale.status}`}>
                    {selectedSale.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Ready to Sale Amount:</label>
                  <span>{selectedSale.real_to_payment_amount || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Sale Status:</label>
                  <span>{selectedSale.sale_status_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Employee:</label>
                  <span>{selectedSale.employee_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>မှတ်ချက် (Remark):</label>
                  <span>{selectedSale.remark || '-'}</span>
                </div>
              </div>
              )}
            </div>
            <div className="modal-footer">
              {isEditMode ? (
                <>
                  <button className="btn-primary" onClick={handleUpdate}>Update</button>
                  <button className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                </>
              ) : (
                <button className="btn-secondary" onClick={handleCloseModal}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
