import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { saleAnalyticsAPI } from '../services/api';
import '../styles/Sales.css';

interface Sale {
  id: number;
  month?: number;
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
  total_amount: number;
  invoice_number?: string;
  customer_name?: string;
  nrc_no?: string;
  phone_no?: string;
  address?: string;
  transcation_type?: string;
  on_off?: string;
  change?: number;
  return?: number;
  gs_date?: string;
  dia_and_gem?: string;
  status: string;
  real_to_payment_amount?: number;
  remark?: string;
  sale_status_id?: number;
  sale_status_name?: string;
  employee_name?: string;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saleStatuses, setSaleStatuses] = useState<any[]>([]);
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
  const { t } = useTranslation();

  useEffect(() => {
    fetchSales();
    fetchSaleStatuses();
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

  const fetchSales = async () => {
    try {
      setLoading(true);
      
      const filterParams: any = {};
      if (filters.sale_status_id) filterParams.sale_status_id = parseInt(filters.sale_status_id);
      if (filters.date_from) filterParams.date_from = filters.date_from;
      if (filters.date_to) filterParams.date_to = filters.date_to;
      if (filters.item_code) filterParams.item_code = filters.item_code;
      if (filters.invoice_number) filterParams.invoice_number = filters.invoice_number;
      
      const response = await saleAnalyticsAPI.getRecords(filterParams);
      const result = response.data;
      if (result.success) {
        setSales(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSales();
  };

  const handleShow = async (id: number) => {
    try {
      const response = await saleAnalyticsAPI.getRecordById(id);
      const result = response.data;
      if (result.success) {
        setSelectedSale(result.data);
        setIsEditMode(false);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
    }
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

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSale(null);
    setIsEditMode(false);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      sale_status_id: '',
      date_from: '',
      date_to: '',
      item_code: '',
      invoice_number: '',
    });
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
          <h3>စာရင်းများ (Records)</h3>
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
                        <button className="btn-icon" onClick={() => handleShow(sale.id)} title="View">👁️</button>
                        <button className="btn-icon" onClick={() => handleEdit(sale.id)} title="Edit">✏️</button>
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
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
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
                <div className="detail-item full-width">
                  <label>မှတ်ချက် (Remark):</label>
                  <span>{selectedSale.remark || '-'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
