import React, { useState, useEffect } from 'react';
import { saleAnalyticsAPI } from '../services/api';
import '../styles/SaleStatus.css';

type SaleTab = 'dia-rc' | 'g-rc' | 'pt-rc' | 'dia-sale' | 'g-sale' | 'pt-sale';

// Utility function to convert grams to K, P, Y
const convertGramToKPY = (grams: number) => {
  const GRAM_PER_KYAT = 16.329;
  const PE_PER_KYAT = 16;
  const YWAY_PER_PE = 8;
  
  const totalKyat = grams / GRAM_PER_KYAT;
  const k = Math.floor(totalKyat);
  const remainderKyat = totalKyat - k;
  
  const totalPe = remainderKyat * PE_PER_KYAT;
  const p = Math.floor(totalPe);
  const remainderPe = totalPe - p;
  
  const y = Math.round(remainderPe * YWAY_PER_PE * 100) / 100;
  
  return { k, p, y };
};

// Utility function to convert K, P, Y to grams (reverse conversion)
const convertKPYToGram = (k: number, p: number, y: number) => {
  const GRAM_PER_KYAT = 16.329;
  const PE_PER_KYAT = 16;
  const YWAY_PER_PE = 8;
  
  // Convert everything to Kyat first
  const totalKyat = k + (p / PE_PER_KYAT) + (y / (PE_PER_KYAT * YWAY_PER_PE));
  
  // Convert Kyat to grams
  const grams = totalKyat * GRAM_PER_KYAT;
  
  return Math.round(grams * 100) / 100; // Round to 2 decimal places
};

const SaleStatus: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SaleTab>('dia-rc');

  const tabs = [
    { id: 'dia-rc', label: 'Dia RC', fullName: 'စိန်/ကျောက် အထည်အဝယ်စာရင်း' },
    { id: 'g-rc', label: 'G RC', fullName: 'ရွှေ အထည်အဝယ်စာရင်း' },
    { id: 'pt-rc', label: 'PT RC', fullName: 'ပလတ်တီနမ် အထည်အဝယ်စာရင်း' },
    { id: 'dia-sale', label: 'Dia Sale', fullName: 'စိန်/ကျောက် အထည်အရောင်းစာရင်း' },
    { id: 'g-sale', label: 'G Sale', fullName: 'ရွှေ အထည်အရောင်းစာရင်း' },
    { id: 'pt-sale', label: 'PT Sale', fullName: 'ပလတ်တီနမ် အထည်အရောင်းစာရင်း' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dia-rc':
        return <DiaRCForm />;
      case 'g-rc':
        return <GRCForm />;
      case 'pt-rc':
        return <PTRCForm />;
      case 'dia-sale':
        return <DiaSaleForm />;
      case 'g-sale':
        return <GSaleForm />;
      case 'pt-sale':
        return <PTSaleForm />;
      default:
        return null;
    }
  };

  return (
    <div className="sale-status-container">
      <h1>Sale Status</h1>

      <div className="tabs-container">
        <div className="tabs-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as SaleTab)}
            >
              <div className="tab-label">{tab.label}</div>
              <div className="tab-subtitle">{tab.fullName}</div>
            </button>
          ))}
        </div>

        <div className="tab-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};

// Dia RC Form Component
const DiaRCForm: React.FC = () => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    branch_id: '',
    date: new Date().toISOString().split('T')[0],
    item_code: '',
    item_categories: '',
    quantity: '',
    total_weight: '',
    gold_weight: '',
    gem_weight: '',
    density: '',
    gold_price: '',
    k: '',
    p: '',
    y: '',
    gold_value: '',
    kyattar: '',
    round_kyattar: '',
    loss_k: '',
    loss_p: '',
    loss_y: '',
    loss_gram: '',
    loss_value: '',
    total_gold_value: '',
    dia_gem_value: '',
    total_value: '',
    sale_voucher_amount: '',
    different_amount: '',
    stamp: '',
    total_amount: '',
    invoice_number: '',
    customer_name: '',
    nrc_no: '',
    phone_no: '',
    address: '',
    transcation_type: '',
    employee_id: '',
    remark: '',
    sale_status_id: '1', // Dia RC tab ID
    w_gram: '',
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchEmployees();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await saleAnalyticsAPI.getBranches();
      const data = response.data;
      setBranches(data.data || []);
      
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.branch_id) {
          setFormData(prev => ({ ...prev, branch_id: user.branch_id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await saleAnalyticsAPI.getEmployees(user.branch_id);
        const data = response.data;
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleWGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        w_gram: value,
        k: k.toString(),
        p: p.toString(),
        y: y.toString(),
      });
    } else {
      setFormData({ 
        ...formData, 
        w_gram: value,
        k: '0',
        p: '0',
        y: '0',
      });
    }
  };

  const handleKPYChange = (field: 'k' | 'p' | 'y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.k) || 0;
    const p = parseFloat(newFormData.p) || 0;
    const y = parseFloat(newFormData.y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({
        ...newFormData,
        w_gram: grams.toString(),
      });
    } else {
      setFormData({
        ...newFormData,
        w_gram: '0',
      });
    }
  };

  const handleLossGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        loss_gram: value,
        loss_k: k.toString(),
        loss_p: p.toString(),
        loss_y: y.toString(),
      });
    } else {
      setFormData({ 
        ...formData, 
        loss_gram: value,
        loss_k: '0',
        loss_p: '0',
        loss_y: '0',
      });
    }
  };

  const handleLossKPYChange = (field: 'loss_k' | 'loss_p' | 'loss_y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.loss_k) || 0;
    const p = parseFloat(newFormData.loss_p) || 0;
    const y = parseFloat(newFormData.loss_y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({
        ...newFormData,
        loss_gram: grams.toString(),
      });
    } else {
      setFormData({
        ...newFormData,
        loss_gram: '0',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const sanitizedData = {
        ...formData,
        quantity: formData.quantity || 0,
        total_weight: formData.total_weight || 0,
        gold_weight: formData.gold_weight || 0,
        gem_weight: formData.gem_weight || 0,
        density: formData.density || 0,
        gold_price: formData.gold_price || 0,
        k: formData.k || 0,
        p: formData.p || 0,
        y: formData.y || 0,
        gold_value: formData.gold_value || 0,
        kyattar: formData.kyattar || 0,
        round_kyattar: formData.round_kyattar || 0,
        loss_k: formData.loss_k || 0,
        loss_p: formData.loss_p || 0,
        loss_y: formData.loss_y || 0,
        loss_gram: formData.loss_gram || 0,
        loss_value: formData.loss_value || 0,
        total_gold_value: formData.total_gold_value || 0,
        dia_gem_value: formData.dia_gem_value || 0,
        total_value: formData.total_value || 0,
        sale_voucher_amount: formData.sale_voucher_amount || 0,
        different_amount: formData.different_amount || 0,
        stamp: formData.stamp || 0,
        total_amount: formData.total_amount || 0,
      };
      
      const response = await saleAnalyticsAPI.createRecord(sanitizedData);
      
      const result = response.data;
      
      if (result.success) {
        alert('Record created successfully!');
        setFormData({
          month: new Date().getMonth() + 1,
          branch_id: formData.branch_id,
          date: new Date().toISOString().split('T')[0],
          item_code: '',
          item_categories: '',
          quantity: '',
          total_weight: '',
          gold_weight: '',
          gem_weight: '',
          density: '',
          gold_price: '',
          k: '',
          p: '',
          y: '',
          gold_value: '',
          kyattar: '',
          round_kyattar: '',
          loss_k: '',
          loss_p: '',
          loss_y: '',
          loss_gram: '',
          loss_value: '',
          total_gold_value: '',
          dia_gem_value: '',
          total_value: '',
          sale_voucher_amount: '',
          different_amount: '',
          stamp: '',
          total_amount: '',
          invoice_number: '',
          customer_name: '',
          nrc_no: '',
          phone_no: '',
          address: '',
          transcation_type: '',
          employee_id: '',
          remark: '',
          sale_status_id: '1',
          w_gram: '',
        });
      } else {
        alert(result.message || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const months = [
    { value: 1, label: 'January - ဇန်နဝါရီ' },
    { value: 2, label: 'February - ဖေဖော်ဝါရီ' },
    { value: 3, label: 'March - မတ်' },
    { value: 4, label: 'April - ဧပြီ' },
    { value: 5, label: 'May - မေ' },
    { value: 6, label: 'June - ဇွန်' },
    { value: 7, label: 'July - ဇူလိုင်' },
    { value: 8, label: 'August - ဩဂုတ်' },
    { value: 9, label: 'September - စက်တင်ဘာ' },
    { value: 10, label: 'October - အောက်တိုဘာ' },
    { value: 11, label: 'November - နိုဝင်ဘာ' },
    { value: 12, label: 'December - ဒီဇင်ဘာ' },
  ];

  return (
    <div className="form-container">
      <h2>စိန်/ကျောက် အထည်အဝယ်စာရင်း (Diamond/Stone Receive)</h2>
      <form className="sale-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>လ (Month) <span className="required">*</span></label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
              required
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ဆိုင်ခွဲအမှတ် (Branch) <span className="required">*</span></label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              required
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ရက်စွဲ (Date) <span className="required">*</span></label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <small className="date-display">Display: {formatDate(formData.date)}</small>
          </div>

          <div className="form-group">
            <label>ပစ္စည်း ကုတ်အမှတ် (Item Code)</label>
            <input
              type="text"
              value={formData.item_code}
              onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ပစ္စည်းအမျိုးအစား (Item Categories)</label>
            <input
              type="text"
              value={formData.item_categories}
              onChange={(e) => setFormData({ ...formData, item_categories: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>အရေအတွက် (Quantity) <span className="required">*</span></label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>စုစုပေါင်း အလေးချိန် (Total Weight)</label>
            <input
              type="number"
              step="0.01"
              value={formData.total_weight}
              onChange={(e) => setFormData({ ...formData, total_weight: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ရွှေချိန် (Gold Weight)</label>
            <input
              type="number"
              step="0.01"
              value={formData.gold_weight}
              onChange={(e) => setFormData({ ...formData, gold_weight: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ကျောက်ချိန် (Gem Weight)</label>
            <input
              type="number"
              step="0.01"
              value={formData.gem_weight}
              onChange={(e) => setFormData({ ...formData, gem_weight: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ပဲရည် (Density)</label>
            <input
              type="text"
              value={formData.density}
              onChange={(e) => setFormData({ ...formData, density: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ရွှေဈေးနူန်း (Gold Price)</label>
            <input
              type="number"
              value={formData.gold_price}
              onChange={(e) => setFormData({ ...formData, gold_price: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>အထည် ဂရမ် (W Gram)</label>
            <input
              type="number"
              step="0.01"
              value={formData.w_gram}
              onChange={(e) => handleWGramChange(e.target.value)}
              placeholder="Enter grams to auto-calculate K, P, Y"
            />
          </div>

          <div className="form-group">
            <label>ကျပ် (K)</label>
            <input
              type="number"
              step="0.01"
              value={formData.k}
              onChange={(e) => handleKPYChange('k', e.target.value)}
              placeholder="Enter K to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>ပဲ (P)</label>
            <input
              type="number"
              step="0.01"
              value={formData.p}
              onChange={(e) => handleKPYChange('p', e.target.value)}
              placeholder="Enter P to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>ရွေး (Y)</label>
            <input
              type="number"
              step="0.01"
              value={formData.y}
              onChange={(e) => handleKPYChange('y', e.target.value)}
              placeholder="Enter Y to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>ရွှေ တန်ဖိုး (Gold Value)</label>
            <input
              type="number"
              value={formData.gold_value}
              onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ကျပ်သား (Kyattar)</label>
            <input
              type="number"
              step="0.01"
              value={formData.kyattar}
              onChange={(e) => setFormData({ ...formData, kyattar: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Round Kyattar</label>
            <input
              type="number"
              step="0.01"
              value={formData.round_kyattar}
              onChange={(e) => setFormData({ ...formData, round_kyattar: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>အလျော့ ဂရမ် (Loss Gram)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_gram}
              onChange={(e) => handleLossGramChange(e.target.value)}
              placeholder="Enter grams to auto-calculate Loss K, P, Y"
            />
          </div>

          <div className="form-group">
            <label>အလျော့ ကျပ် (Loss K)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_k}
              onChange={(e) => handleLossKPYChange('loss_k', e.target.value)}
              placeholder="Enter Loss K to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>အလျော့ ပဲ (Loss P)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_p}
              onChange={(e) => handleLossKPYChange('loss_p', e.target.value)}
              placeholder="Enter Loss P to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>အလျော့ ရွေး (Loss Y)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_y}
              onChange={(e) => handleLossKPYChange('loss_y', e.target.value)}
              placeholder="Enter Loss Y to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>အလျော့ တန်ဖိုး (Loss Value)</label>
            <input
              type="number"
              value={formData.loss_value}
              onChange={(e) => setFormData({ ...formData, loss_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ရွှေတန်ဖိုး စုစုပေါင်း (Total Gold Value)</label>
            <input
              type="number"
              value={formData.total_gold_value}
              onChange={(e) => setFormData({ ...formData, total_gold_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>စိန်/ကျောက် တန်ဖိုး (Dia/Gem Value)</label>
            <input
              type="number"
              value={formData.dia_gem_value}
              onChange={(e) => setFormData({ ...formData, dia_gem_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value)</label>
            <input
              type="number"
              value={formData.total_value}
              onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Purchase Voucher Amount</label>
            <input
              type="number"
              value={formData.sale_voucher_amount}
              onChange={(e) => setFormData({ ...formData, sale_voucher_amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Different Amount</label>
            <input
              type="number"
              value={formData.different_amount}
              onChange={(e) => setFormData({ ...formData, different_amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Stamp</label>
            <input
              type="number"
              value={formData.stamp}
              onChange={(e) => setFormData({ ...formData, stamp: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Total Amount (Voucher+Stamp)</label>
            <input
              type="number"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ပြေစာအမှတ် (Invoice Number)</label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ဝယ်ယူသူအမည် (Customer Name)</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>မှတ်ပုံတင်အမှတ် (NRC No)</label>
            <input
              type="text"
              value={formData.nrc_no}
              onChange={(e) => setFormData({ ...formData, nrc_no: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ဖုန်းနံပါတ် (Phone No)</label>
            <input
              type="text"
              value={formData.phone_no}
              onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>လိပ်စာ (Address)</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Type (Transaction Type)</label>
            <input
              type="text"
              value={formData.transcation_type}
              onChange={(e) => setFormData({ ...formData, transcation_type: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Sale Name (Employee)</label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label>မှတ်ချက် (Remark)</label>
            <textarea
              rows={3}
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

const GRCForm: React.FC = () => {
  const [formData, setFormData] = useState({
    month: '',
    branch_id: '',
    date: new Date().toISOString().split('T')[0],
    item_code: '',
    item_categories: '',
    quantity: '',
    gold_weight: '',
    density: '',
    gold_price: '',
    k: '',
    p: '',
    y: '',
    gold_value: '',
    kyattar: '',
    round_kyattar: '',
    loss_k: '',
    loss_p: '',
    loss_y: '',
    loss_gram: '',
    loss_value: '',
    total_gold_value: '',
    charges_and_other: '',
    total_value: '',
    sale_voucher_amount: '',
    different_amount: '',
    invoice_number: '',
    customer_name: '',
    nrc_no: '',
    phone_no: '',
    address: '',
    transcation_type: '',
    employee_id: '',
    remark: '',
    sale_status_id: '2', // G RC tab ID
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchEmployees();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await saleAnalyticsAPI.getBranches();
      const data = response.data;
      setBranches(data.data || []);
      
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.branch_id) {
          setFormData(prev => ({ ...prev, branch_id: user.branch_id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await saleAnalyticsAPI.getEmployees(user.branch_id);
        const data = response.data;
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleKPYChange = (field: 'k' | 'p' | 'y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.k) || 0;
    const p = parseFloat(newFormData.p) || 0;
    const y = parseFloat(newFormData.y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({
        ...newFormData,
        gold_weight: grams.toString(),
      });
    } else {
      setFormData({
        ...newFormData,
        gold_weight: '0',
      });
    }
  };

  const handleLossKPYChange = (field: 'loss_k' | 'loss_p' | 'loss_y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.loss_k) || 0;
    const p = parseFloat(newFormData.loss_p) || 0;
    const y = parseFloat(newFormData.loss_y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({
        ...newFormData,
        loss_gram: grams.toString(),
      });
    } else {
      setFormData({
        ...newFormData,
        loss_gram: '0',
      });
    }
  };

  const handleGoldWeightChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        gold_weight: value,
        k: k.toString(),
        p: p.toString(),
        y: y.toString(),
      });
    } else {
      setFormData({ 
        ...formData, 
        gold_weight: value,
        k: '0',
        p: '0',
        y: '0',
      });
    }
  };

  const handleLossGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        loss_gram: value,
        loss_k: k.toString(),
        loss_p: p.toString(),
        loss_y: y.toString(),
      });
    } else {
      setFormData({ 
        ...formData, 
        loss_gram: value,
        loss_k: '0',
        loss_p: '0',
        loss_y: '0',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const sanitizedData = {
        ...formData,
        quantity: formData.quantity || 0,
        gold_weight: formData.gold_weight || 0,
        gold_price: formData.gold_price || 0,
        k: formData.k || 0,
        p: formData.p || 0,
        y: formData.y || 0,
        gold_value: formData.gold_value || 0,
        kyattar: formData.kyattar || 0,
        round_kyattar: formData.round_kyattar || 0,
        loss_k: formData.loss_k || 0,
        loss_p: formData.loss_p || 0,
        loss_y: formData.loss_y || 0,
        loss_gram: formData.loss_gram || 0,
        loss_value: formData.loss_value || 0,
        total_gold_value: formData.total_gold_value || 0,
        charges_and_other: formData.charges_and_other || 0,
        total_value: formData.total_value || 0,
        sale_voucher_amount: formData.sale_voucher_amount || 0,
        different_amount: formData.different_amount || 0,
      };

      const response = await saleAnalyticsAPI.createRecord(sanitizedData);

      if (response.data.success) {
        alert('G RC data saved successfully!');
        window.location.reload();
      } else {
        alert('Error saving data: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>ရွှေ အထည်အဝယ်စာရင်း (Gold Receive)</h2>
      <form onSubmit={handleSubmit} className="sale-form">
        <div className="form-grid">
          <div className="form-group">
            <label>လ (Month) <span className="required">*</span></label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              required
            >
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
            <label>ဆိုင်ခွဲအမှတ် (Branch) <span className="required">*</span></label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ရက်စွဲ (Date) <span className="required">*</span></label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>ပစ္စည်း ကုတ်အမှတ် (Item Code)</label>
            <input
              type="text"
              value={formData.item_code}
              onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ပစ္စည်းအမျိုးအစား (Item Categories)</label>
            <input
              type="text"
              value={formData.item_categories}
              onChange={(e) => setFormData({ ...formData, item_categories: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>အရေအတွက် (Quantity) <span className="required">*</span></label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>ရွှေချိန် (Gold Weight)</label>
            <input
              type="number"
              step="0.01"
              value={formData.gold_weight}
              onChange={(e) => handleGoldWeightChange(e.target.value)}
              placeholder="Enter grams to auto-calculate K, P, Y"
            />
          </div>

          <div className="form-group">
            <label>ပဲရည် (Density)</label>
            <input
              type="text"
              value={formData.density}
              onChange={(e) => setFormData({ ...formData, density: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ရွှေဈေးနူန်း (Gold Price)</label>
            <input
              type="number"
              value={formData.gold_price}
              onChange={(e) => setFormData({ ...formData, gold_price: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ကျပ် (K)</label>
            <input
              type="number"
              step="0.01"
              value={formData.k}
              onChange={(e) => handleKPYChange('k', e.target.value)}
              placeholder="Enter K to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>ပဲ (P)</label>
            <input
              type="number"
              step="0.01"
              value={formData.p}
              onChange={(e) => handleKPYChange('p', e.target.value)}
              placeholder="Enter P to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>ရွေး (Y)</label>
            <input
              type="number"
              step="0.01"
              value={formData.y}
              onChange={(e) => handleKPYChange('y', e.target.value)}
              placeholder="Enter Y to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>ရွှေ တန်ဖိုး (Gold Value)</label>
            <input
              type="number"
              value={formData.gold_value}
              onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ကျပ်သား (Kyattar)</label>
            <input
              type="number"
              step="0.01"
              value={formData.kyattar}
              onChange={(e) => setFormData({ ...formData, kyattar: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Round Kyattar</label>
            <input
              type="number"
              step="0.01"
              value={formData.round_kyattar}
              onChange={(e) => setFormData({ ...formData, round_kyattar: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>အလျော့ ကျပ် (Loss K)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_k}
              onChange={(e) => handleLossKPYChange('loss_k', e.target.value)}
              placeholder="Enter Loss K to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>အလျော့ ပဲ (Loss P)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_p}
              onChange={(e) => handleLossKPYChange('loss_p', e.target.value)}
              placeholder="Enter Loss P to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>အလျော့ ရွေး (Loss Y)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_y}
              onChange={(e) => handleLossKPYChange('loss_y', e.target.value)}
              placeholder="Enter Loss Y to auto-calculate grams"
            />
          </div>

          <div className="form-group">
            <label>အလျော့ ဂရမ် (Loss Gram)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_gram}
              onChange={(e) => handleLossGramChange(e.target.value)}
              placeholder="Enter grams to auto-calculate Loss K, P, Y"
            />
          </div>

          <div className="form-group">
            <label>အလျော့ တန်ဖိုး (Loss Value)</label>
            <input
              type="number"
              value={formData.loss_value}
              onChange={(e) => setFormData({ ...formData, loss_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ရွှေတန်ဖိုး စုစုပေါင်း (Total Gold Value)</label>
            <input
              type="number"
              value={formData.total_gold_value}
              onChange={(e) => setFormData({ ...formData, total_gold_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>လက်ခ/အခြား (Charges & Other)</label>
            <input
              type="number"
              value={formData.charges_and_other}
              onChange={(e) => setFormData({ ...formData, charges_and_other: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value)</label>
            <input
              type="number"
              value={formData.total_value}
              onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Sale Voucher Amount</label>
            <input
              type="number"
              value={formData.sale_voucher_amount}
              onChange={(e) => setFormData({ ...formData, sale_voucher_amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Different Amount</label>
            <input
              type="number"
              value={formData.different_amount}
              onChange={(e) => setFormData({ ...formData, different_amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ပြေစာအမှတ် (Invoice Number)</label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ဝယ်ယူသူအမည် (Customer Name)</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>မှတ်ပုံတင်အမှတ် (NRC No)</label>
            <input
              type="text"
              value={formData.nrc_no}
              onChange={(e) => setFormData({ ...formData, nrc_no: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ဖုန်းနံပါတ် (Phone No)</label>
            <input
              type="text"
              value={formData.phone_no}
              onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>လိပ်စာ (Address)</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Type (Transaction Type)</label>
            <input
              type="text"
              value={formData.transcation_type}
              onChange={(e) => setFormData({ ...formData, transcation_type: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Sale Name (Employee)</label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>မှတ်ချက် (Remark)</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save G RC Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PTRCForm: React.FC = () => {
  const [formData, setFormData] = useState({
    month: '',
    branch_id: '',
    date: new Date().toISOString().split('T')[0],
    item_code: '',
    item_categories: '',
    quantity: '',
    gold_weight: '',
    gem_weight: '',
    density: '',
    gold_price: '',
    k: '',
    p: '',
    y: '',
    gold_value: '',
    kyattar: '',
    round_kyattar: '',
    loss_k: '',
    loss_p: '',
    loss_y: '',
    loss_gram: '',
    loss_value: '',
    total_gold_value: '',
    sale_voucher_amount: '',
    different_amount: '',
    invoice_number: '',
    customer_name: '',
    nrc_no: '',
    phone_no: '',
    address: '',
    transcation_type: '',
    employee_id: '',
    remark: '',
    sale_status_id: '3', // PT RC tab ID
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchEmployees();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await saleAnalyticsAPI.getBranches();
      const data = response.data;
      setBranches(data.data || []);
      
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.branch_id) {
          setFormData(prev => ({ ...prev, branch_id: user.branch_id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await saleAnalyticsAPI.getEmployees(user.branch_id);
        const data = response.data;
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleKPYChange = (field: 'k' | 'p' | 'y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.k) || 0;
    const p = parseFloat(newFormData.p) || 0;
    const y = parseFloat(newFormData.y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({ ...newFormData, gold_weight: grams.toString() });
    } else {
      setFormData({ ...newFormData, gold_weight: '0' });
    }
  };

  const handleLossKPYChange = (field: 'loss_k' | 'loss_p' | 'loss_y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.loss_k) || 0;
    const p = parseFloat(newFormData.loss_p) || 0;
    const y = parseFloat(newFormData.loss_y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({ ...newFormData, loss_gram: grams.toString() });
    } else {
      setFormData({ ...newFormData, loss_gram: '0' });
    }
  };

  const handleGoldWeightChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        gold_weight: value,
        k: k.toString(),
        p: p.toString(),
        y: y.toString(),
      });
    } else {
      setFormData({ ...formData, gold_weight: value, k: '0', p: '0', y: '0' });
    }
  };

  const handleLossGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        loss_gram: value,
        loss_k: k.toString(),
        loss_p: p.toString(),
        loss_y: y.toString(),
      });
    } else {
      setFormData({ ...formData, loss_gram: value, loss_k: '0', loss_p: '0', loss_y: '0' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const sanitizedData = {
        ...formData,
        quantity: formData.quantity || 0,
        gold_weight: formData.gold_weight || 0,
        gem_weight: formData.gem_weight || 0,
        gold_price: formData.gold_price || 0,
        k: formData.k || 0,
        p: formData.p || 0,
        y: formData.y || 0,
        gold_value: formData.gold_value || 0,
        kyattar: formData.kyattar || 0,
        round_kyattar: formData.round_kyattar || 0,
        loss_k: formData.loss_k || 0,
        loss_p: formData.loss_p || 0,
        loss_y: formData.loss_y || 0,
        loss_gram: formData.loss_gram || 0,
        loss_value: formData.loss_value || 0,
        total_gold_value: formData.total_gold_value || 0,
        sale_voucher_amount: formData.sale_voucher_amount || 0,
        different_amount: formData.different_amount || 0,
      };

      const response = await saleAnalyticsAPI.createRecord(sanitizedData);

      if (response.data.success) {
        alert('PT RC data saved successfully!');
        window.location.reload();
      } else {
        alert('Error saving data: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>ပလတ်တီနမ် အထည်အဝယ်စာရင်း (Platinum Receive)</h2>
      <form onSubmit={handleSubmit} className="sale-form">
        <div className="form-grid">
          <div className="form-group">
            <label>လ (Month) <span className="required">*</span></label>
            <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required>
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
            <label>ဆိုင်ခွဲအမှတ် (Branch) <span className="required">*</span></label>
            <select value={formData.branch_id} onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })} required>
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ရက်စွဲ (Date) <span className="required">*</span></label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>ပစ္စည်း ကုတ်အမှတ် (Item Code)</label>
            <input type="text" value={formData.item_code} onChange={(e) => setFormData({ ...formData, item_code: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပစ္စည်းအမျိုးအစား (Item Categories)</label>
            <input type="text" value={formData.item_categories} onChange={(e) => setFormData({ ...formData, item_categories: e.target.value })} />
          </div>

          <div className="form-group">
            <label>အရေအတွက် (Quantity) <span className="required">*</span></label>
            <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>ရွှေချိန် (Gold Weight)</label>
            <input type="number" step="0.01" value={formData.gold_weight} onChange={(e) => handleGoldWeightChange(e.target.value)} placeholder="Enter grams" />
          </div>

          <div className="form-group">
            <label>ကျောက်ချိန် (Gem Weight)</label>
            <input type="number" step="0.01" value={formData.gem_weight} onChange={(e) => setFormData({ ...formData, gem_weight: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပဲရည် (Density)</label>
            <input type="text" value={formData.density} onChange={(e) => setFormData({ ...formData, density: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ရွှေဈေးနူန်း (Gold Price)</label>
            <input type="number" value={formData.gold_price} onChange={(e) => setFormData({ ...formData, gold_price: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ကျပ် (K)</label>
            <input type="number" step="0.01" value={formData.k} onChange={(e) => handleKPYChange('k', e.target.value)} />
          </div>

          <div className="form-group">
            <label>ပဲ (P)</label>
            <input type="number" step="0.01" value={formData.p} onChange={(e) => handleKPYChange('p', e.target.value)} />
          </div>

          <div className="form-group">
            <label>ရွေး (Y)</label>
            <input type="number" step="0.01" value={formData.y} onChange={(e) => handleKPYChange('y', e.target.value)} />
          </div>

          <div className="form-group">
            <label>ရွှေ တန်ဖိုး (Gold Value)</label>
            <input type="number" value={formData.gold_value} onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ကျပ်သား (Kyattar)</label>
            <input type="number" step="0.01" value={formData.kyattar} onChange={(e) => setFormData({ ...formData, kyattar: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Round Kyattar</label>
            <input type="number" step="0.01" value={formData.round_kyattar} onChange={(e) => setFormData({ ...formData, round_kyattar: e.target.value })} />
          </div>

          <div className="form-group">
            <label>အလျော့ ကျပ် (Loss K)</label>
            <input type="number" step="0.01" value={formData.loss_k} onChange={(e) => handleLossKPYChange('loss_k', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ ပဲ (Loss P)</label>
            <input type="number" step="0.01" value={formData.loss_p} onChange={(e) => handleLossKPYChange('loss_p', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ ရွေး (Loss Y)</label>
            <input type="number" step="0.01" value={formData.loss_y} onChange={(e) => handleLossKPYChange('loss_y', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ ဂရမ် (Loss Gram)</label>
            <input type="number" step="0.01" value={formData.loss_gram} onChange={(e) => handleLossGramChange(e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ တန်ဖိုး (Loss Value)</label>
            <input type="number" value={formData.loss_value} onChange={(e) => setFormData({ ...formData, loss_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ရွှေတန်ဖိုး စုစုပေါင်း (Total Gold Value)</label>
            <input type="number" value={formData.total_gold_value} onChange={(e) => setFormData({ ...formData, total_gold_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Purchase Voucher Amount</label>
            <input type="number" value={formData.sale_voucher_amount} onChange={(e) => setFormData({ ...formData, sale_voucher_amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Different Amount</label>
            <input type="number" value={formData.different_amount} onChange={(e) => setFormData({ ...formData, different_amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပြေစာအမှတ် (Invoice Number)</label>
            <input type="text" value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ဝယ်ယူသူအမည် (Customer Name)</label>
            <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} />
          </div>

          <div className="form-group">
            <label>မှတ်ပုံတင်အမှတ် (NRC No)</label>
            <input type="text" value={formData.nrc_no} onChange={(e) => setFormData({ ...formData, nrc_no: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ဖုန်းနံပါတ် (Phone No)</label>
            <input type="text" value={formData.phone_no} onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })} />
          </div>

          <div className="form-group">
            <label>လိပ်စာ (Address)</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Type</label>
            <input type="text" value={formData.transcation_type} onChange={(e) => setFormData({ ...formData, transcation_type: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Sale Name</label>
            <select value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>မှတ်ချက် (Remark)</label>
            <textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} rows={3} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save PT RC Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

const DiaSaleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    branch_id: '',
    date: new Date().toISOString().split('T')[0],
    item_code: '',
    item_categories: '',
    quantity: '',
    dia_qty: '',
    gem_qty: '',
    total_weight: '',
    gold_weight: '',
    gem_weight: '',
    density: '',
    gold_price: '',
    k: '',
    p: '',
    y: '',
    w_gram: '',
    gold_value: '',
    kyattar: '',
    round_kyattar: '',
    loss_k: '',
    loss_p: '',
    loss_y: '',
    loss_gram: '',
    loss_value: '',
    total_gold_value: '',
    dia_gem_value: '',
    total_value: '',
    sale_voucher_amount: '',
    different_amount: '',
    stamp: '',
    total_amount: '',
    invoice_number: '',
    customer_name: '',
    nrc_no: '',
    phone_no: '',
    address: '',
    transcation_type: '',
    prefix: '',
    employee_id: '',
    on_off: 'online',
    change: '',
    return: '',
    gs_date: '',
    dia_and_gem: 'diamond',
    status: 'new',
    real_to_payment_amount: '',
    remark: '',
    sale_status_id: '4', // Dia Sale tab ID
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchEmployees();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await saleAnalyticsAPI.getBranches();
      const data = response.data;
      setBranches(data.data || []);
      
      // Set default branch from logged-in user
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.branch_id) {
          setFormData(prev => ({ ...prev, branch_id: user.branch_id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await saleAnalyticsAPI.getEmployees(user.branch_id);
        const data = response.data;
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleWGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        w_gram: value,
        k: k.toString(),
        p: p.toString(),
        y: y.toString(),
      });
    } else {
      setFormData({ 
        ...formData, 
        w_gram: value,
        k: '0',
        p: '0',
        y: '0',
      });
    }
  };

  const handleLossGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        loss_gram: value,
        loss_k: k.toString(),
        loss_p: p.toString(),
        loss_y: y.toString(),
      });
    } else {
      setFormData({ 
        ...formData, 
        loss_gram: value,
        loss_k: '0',
        loss_p: '0',
        loss_y: '0',
      });
    }
  };

  const handleKPYChange = (field: 'k' | 'p' | 'y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.k) || 0;
    const p = parseFloat(newFormData.p) || 0;
    const y = parseFloat(newFormData.y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({
        ...newFormData,
        w_gram: grams.toString(),
      });
    } else {
      setFormData({
        ...newFormData,
        w_gram: '0',
      });
    }
  };

  const handleLossKPYChange = (field: 'loss_k' | 'loss_p' | 'loss_y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.loss_k) || 0;
    const p = parseFloat(newFormData.loss_p) || 0;
    const y = parseFloat(newFormData.loss_y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({
        ...newFormData,
        loss_gram: grams.toString(),
      });
    } else {
      setFormData({
        ...newFormData,
        loss_gram: '0',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Sanitize form data - convert empty strings to 0 for numeric fields
      const sanitizedData = {
        ...formData,
        quantity: formData.quantity || 0,
        dia_qty: formData.dia_qty || 0,
        gem_qty: formData.gem_qty || 0,
        total_weight: formData.total_weight || 0,
        gold_weight: formData.gold_weight || 0,
        gem_weight: formData.gem_weight || 0,
        density: formData.density || 0,
        gold_price: formData.gold_price || 0,
        k: formData.k || 0,
        p: formData.p || 0,
        y: formData.y || 0,
        w_gram: formData.w_gram || 0,
        gold_value: formData.gold_value || 0,
        kyattar: formData.kyattar || 0,
        round_kyattar: formData.round_kyattar || 0,
        loss_k: formData.loss_k || 0,
        loss_p: formData.loss_p || 0,
        loss_y: formData.loss_y || 0,
        loss_gram: formData.loss_gram || 0,
        loss_value: formData.loss_value || 0,
        total_gold_value: formData.total_gold_value || 0,
        dia_gem_value: formData.dia_gem_value || 0,
        total_value: formData.total_value || 0,
        sale_voucher_amount: formData.sale_voucher_amount || 0,
        different_amount: formData.different_amount || 0,
        stamp: formData.stamp || 0,
        total_amount: formData.total_amount || 0,
        change: formData.change || 0,
        return: formData.return || 0,
        real_to_payment_amount: formData.real_to_payment_amount || 0,
      };
      
      const response = await saleAnalyticsAPI.createRecord(sanitizedData);
      
      const result = response.data;
      
      if (result.success) {
        alert('Sale record created successfully!');
        // Reset form
        window.location.reload();
      } else {
        alert(result.message || 'Failed to create sale record');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const months = [
    { value: 1, label: 'January - ဇန်နဝါရီ' },
    { value: 2, label: 'February - ဖေဖော်ဝါရီ' },
    { value: 3, label: 'March - မတ်' },
    { value: 4, label: 'April - ဧပြီ' },
    { value: 5, label: 'May - မေ' },
    { value: 6, label: 'June - ဇွန်' },
    { value: 7, label: 'July - ဇူလိုင်' },
    { value: 8, label: 'August - ဩဂုတ်' },
    { value: 9, label: 'September - စက်တင်ဘာ' },
    { value: 10, label: 'October - အောက်တိုဘာ' },
    { value: 11, label: 'November - နိုဝင်ဘာ' },
    { value: 12, label: 'December - ဒီဇင်ဘာ' },
  ];

  return (
    <div className="form-container">
      <h2>စိန်/ကျောက် အထည်အရောင်းစာရင်း (Diamond/Stone Sale)</h2>
      
      <form onSubmit={handleSubmit} className="sale-form">
        <div className="form-grid">
          {/* Month */}
          <div className="form-group">
            <label>လ (Month) <span className="required">*</span></label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
              required
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="form-group">
            <label>ဆိုင်ခွဲအမှတ် (Branch) <span className="required">*</span></label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label>ရက်စွဲ (Date) <span className="required">*</span></label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <small className="date-display">Display: {formatDate(formData.date)}</small>
          </div>

          {/* Item Code */}
          <div className="form-group">
            <label>ပစ္စည်း ကုတ်အမှတ် (Item Code)</label>
            <input
              type="text"
              value={formData.item_code}
              onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
            />
          </div>

          {/* Item Categories */}
          <div className="form-group">
            <label>ပစ္စည်းအမျိုးအစား (Item Categories)</label>
            <input
              type="text"
              value={formData.item_categories}
              onChange={(e) => setFormData({ ...formData, item_categories: e.target.value })}
            />
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>အရေအတွက် (Quantity) <span className="required">*</span></label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          {/* Diamond Quantity */}
          <div className="form-group">
            <label>စိန်ပွင့်ရေ (Diamond Qty)</label>
            <input
              type="number"
              value={formData.dia_qty}
              onChange={(e) => setFormData({ ...formData, dia_qty: e.target.value })}
            />
          </div>

          {/* Gem Quantity */}
          <div className="form-group">
            <label>ကျောက်ပွင့်ရေ (Gem Qty)</label>
            <input
              type="number"
              value={formData.gem_qty}
              onChange={(e) => setFormData({ ...formData, gem_qty: e.target.value })}
            />
          </div>

          {/* Total Weight */}
          <div className="form-group">
            <label>စုစုပေါင်း အလေးချိန် (Total Weight)</label>
            <input
              type="number"
              step="0.01"
              value={formData.total_weight}
              onChange={(e) => setFormData({ ...formData, total_weight: e.target.value })}
            />
          </div>

          {/* Gold Weight */}
          <div className="form-group">
            <label>ရွှေချိန် (Gold Weight)</label>
            <input
              type="number"
              step="0.01"
              value={formData.gold_weight}
              onChange={(e) => setFormData({ ...formData, gold_weight: e.target.value })}
            />
          </div>

          {/* Gem Weight */}
          <div className="form-group">
            <label>ကျောက်ချိန် (Gem Weight)</label>
            <input
              type="number"
              step="0.01"
              value={formData.gem_weight}
              onChange={(e) => setFormData({ ...formData, gem_weight: e.target.value })}
            />
          </div>

          {/* Density */}
          <div className="form-group">
            <label>ပဲရည် (Density)</label>
            <input
              type="text"
              value={formData.density}
              onChange={(e) => setFormData({ ...formData, density: e.target.value })}
            />
          </div>

          {/* Gold Price */}
          <div className="form-group">
            <label>ရွှေဈေးနူန်း (Gold Price)</label>
            <input
              type="number"
              value={formData.gold_price}
              onChange={(e) => setFormData({ ...formData, gold_price: e.target.value })}
            />
          </div>

          {/* W Gram */}
          <div className="form-group">
            <label>အထည် ဂရမ် (W Gram)</label>
            <input
              type="number"
              step="0.01"
              value={formData.w_gram}
              onChange={(e) => handleWGramChange(e.target.value)}
              placeholder="Enter grams to auto-calculate K, P, Y"
            />
          </div>

          {/* K (Kyat) */}
          <div className="form-group">
            <label>ကျပ် (K)</label>
            <input
              type="number"
              step="0.01"
              value={formData.k}
              onChange={(e) => handleKPYChange('k', e.target.value)}
              placeholder="Enter K to auto-calculate grams"
            />
          </div>

          {/* P (Pae) */}
          <div className="form-group">
            <label>ပဲ (P)</label>
            <input
              type="number"
              step="0.01"
              value={formData.p}
              onChange={(e) => handleKPYChange('p', e.target.value)}
              placeholder="Enter P to auto-calculate grams"
            />
          </div>

          {/* Y (Yway) */}
          <div className="form-group">
            <label>ရွေး (Y)</label>
            <input
              type="number"
              step="0.01"
              value={formData.y}
              onChange={(e) => handleKPYChange('y', e.target.value)}
              placeholder="Enter Y to auto-calculate grams"
            />
          </div>

          {/* Gold Value */}
          <div className="form-group">
            <label>ရွှေ တန်ဖိုး (Gold Value)</label>
            <input
              type="number"
              value={formData.gold_value}
              onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })}
            />
          </div>

          {/* Kyattar */}
          <div className="form-group">
            <label>ကျပ်သား (Kyattar)</label>
            <input
              type="number"
              step="0.01"
              value={formData.kyattar}
              onChange={(e) => setFormData({ ...formData, kyattar: e.target.value })}
            />
          </div>

          {/* Round Kyattar */}
          <div className="form-group">
            <label>Round Kyattar</label>
            <input
              type="number"
              step="0.01"
              value={formData.round_kyattar}
              onChange={(e) => setFormData({ ...formData, round_kyattar: e.target.value })}
            />
          </div>

          {/* Loss Gram */}
          <div className="form-group">
            <label>အလျော့ ဂရမ် (Loss Gram)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_gram}
              onChange={(e) => handleLossGramChange(e.target.value)}
              placeholder="Enter grams to auto-calculate Loss K, P, Y"
            />
          </div>

          {/* Loss K */}
          <div className="form-group">
            <label>အလျော့ ကျပ် (Loss K)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_k}
              onChange={(e) => handleLossKPYChange('loss_k', e.target.value)}
              placeholder="Enter Loss K to auto-calculate grams"
            />
          </div>

          {/* Loss P */}
          <div className="form-group">
            <label>အလျော့ ပဲ (Loss P)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_p}
              onChange={(e) => handleLossKPYChange('loss_p', e.target.value)}
              placeholder="Enter Loss P to auto-calculate grams"
            />
          </div>

          {/* Loss Y */}
          <div className="form-group">
            <label>အလျော့ ရွေး (Loss Y)</label>
            <input
              type="number"
              step="0.01"
              value={formData.loss_y}
              onChange={(e) => handleLossKPYChange('loss_y', e.target.value)}
              placeholder="Enter Loss Y to auto-calculate grams"
            />
          </div>

          {/* Loss Value */}
          <div className="form-group">
            <label>အလျော့ တန်ဖိုး (Loss Value)</label>
            <input
              type="number"
              value={formData.loss_value}
              onChange={(e) => setFormData({ ...formData, loss_value: e.target.value })}
            />
          </div>

          {/* Total Gold Value */}
          <div className="form-group">
            <label>ရွှေတန်ဖိုး စုစုပေါင်း (Total Gold Value)</label>
            <input
              type="number"
              value={formData.total_gold_value}
              onChange={(e) => setFormData({ ...formData, total_gold_value: e.target.value })}
            />
          </div>

          {/* Diamond/Gem Value */}
          <div className="form-group">
            <label>စိန်/ကျောက် တန်ဖိုး (Dia/Gem Value)</label>
            <input
              type="number"
              value={formData.dia_gem_value}
              onChange={(e) => setFormData({ ...formData, dia_gem_value: e.target.value })}
            />
          </div>

          {/* Total Value */}
          <div className="form-group">
            <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value)</label>
            <input
              type="number"
              value={formData.total_value}
              onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
            />
          </div>

          {/* Sale Voucher Amount */}
          <div className="form-group">
            <label>Sale Voucher Amount</label>
            <input
              type="number"
              value={formData.sale_voucher_amount}
              onChange={(e) => setFormData({ ...formData, sale_voucher_amount: e.target.value })}
            />
          </div>

          {/* Different Amount */}
          <div className="form-group">
            <label>Different Amount</label>
            <input
              type="number"
              value={formData.different_amount}
              onChange={(e) => setFormData({ ...formData, different_amount: e.target.value })}
            />
          </div>

          {/* Stamp */}
          <div className="form-group">
            <label>Stamp</label>
            <input
              type="number"
              value={formData.stamp}
              onChange={(e) => setFormData({ ...formData, stamp: e.target.value })}
            />
          </div>

          {/* Total Amount */}
          <div className="form-group">
            <label>Total Amount (Voucher+Stamp)</label>
            <input
              type="number"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
            />
          </div>

          {/* Invoice Number */}
          <div className="form-group">
            <label>ပြေစာအမှတ် (Invoice Number)</label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            />
          </div>

          {/* Customer Name */}
          <div className="form-group">
            <label>ဝယ်ယူသူအမည် (Customer Name)</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            />
          </div>

          {/* NRC No */}
          <div className="form-group">
            <label>မှတ်ပုံတင်အမှတ် (NRC No)</label>
            <input
              type="text"
              value={formData.nrc_no}
              onChange={(e) => setFormData({ ...formData, nrc_no: e.target.value })}
            />
          </div>

          {/* Phone No */}
          <div className="form-group">
            <label>ဖုန်းနံပါတ် (Phone No)</label>
            <input
              type="text"
              value={formData.phone_no}
              onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
            />
          </div>

          {/* Address */}
          <div className="form-group full-width">
            <label>လိပ်စာ (Address)</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Transaction Type */}
          <div className="form-group">
            <label>Transaction Type</label>
            <input
              type="text"
              value={formData.transcation_type}
              onChange={(e) => setFormData({ ...formData, transcation_type: e.target.value })}
            />
          </div>

          {/* Prefix */}
          <div className="form-group">
            <label>Prefix</label>
            <input
              type="text"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
            />
          </div>

          {/* Employee (Sale Name) */}
          <div className="form-group">
            <label>Sale Name</label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* On/Off */}
          <div className="form-group">
            <label>On/Off</label>
            <select
              value={formData.on_off}
              onChange={(e) => setFormData({ ...formData, on_off: e.target.value })}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Change % */}
          <div className="form-group">
            <label>Change (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.change}
              onChange={(e) => setFormData({ ...formData, change: e.target.value })}
            />
          </div>

          {/* Return % */}
          <div className="form-group">
            <label>Return (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.return}
              onChange={(e) => setFormData({ ...formData, return: e.target.value })}
            />
          </div>

          {/* Goldsmith Date */}
          <div className="form-group">
            <label>Goldsmith Date</label>
            <input
              type="date"
              value={formData.gs_date}
              onChange={(e) => setFormData({ ...formData, gs_date: e.target.value })}
            />
          </div>

          {/* Dia & Gem */}
          <div className="form-group">
            <label>Dia & Gem</label>
            <select
              value={formData.dia_and_gem}
              onChange={(e) => setFormData({ ...formData, dia_and_gem: e.target.value })}
            >
              <option value="diamond">Diamond</option>
              <option value="gem">Gem</option>
            </select>
          </div>

          {/* Status New/Return */}
          <div className="form-group">
            <label>New/Return</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="new">New</option>
              <option value="return">Return</option>
            </select>
          </div>

          {/* Ready to Payment Amount */}
          <div className="form-group">
            <label>Ready to Sale Amount</label>
            <input
              type="number"
              value={formData.real_to_payment_amount}
              onChange={(e) => setFormData({ ...formData, real_to_payment_amount: e.target.value })}
            />
          </div>

          {/* Remark */}
          <div className="form-group full-width">
            <label>မှတ်ချက် (Remark)</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Sale Record'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const GSaleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    month: '',
    branch_id: '',
    date: new Date().toISOString().split('T')[0],
    item_code: '',
    item_categories: '',
    quantity: '',
    gold_weight: '',
    density: '',
    gold_price: '',
    k: '',
    p: '',
    y: '',
    w_gram: '',
    gold_value: '',
    kyattar: '',
    round_kyattar: '',
    loss_k: '',
    loss_p: '',
    loss_y: '',
    loss_gram: '',
    loss_value: '',
    total_gold_value: '',
    charges_and_other: '',
    total_value: '',
    sale_voucher_amount: '',
    different_amount: '',
    stamp: '',
    total_amount: '',
    invoice_number: '',
    customer_name: '',
    nrc_no: '',
    phone_no: '',
    address: '',
    status: 'new',
    transcation_type: '',
    prefix: '',
    employee_id: '',
    on_off: 'online',
    gs_date: '',
    remark: '',
    sale_status_id: '5', // G Sale tab ID
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchEmployees();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await saleAnalyticsAPI.getBranches();
      const data = response.data;
      setBranches(data.data || []);
      
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.branch_id) {
          setFormData(prev => ({ ...prev, branch_id: user.branch_id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await saleAnalyticsAPI.getEmployees(user.branch_id);
        const data = response.data;
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleWGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        w_gram: value,
        k: k.toString(),
        p: p.toString(),
        y: y.toString(),
      });
    } else {
      setFormData({ ...formData, w_gram: value, k: '0', p: '0', y: '0' });
    }
  };

  const handleKPYChange = (field: 'k' | 'p' | 'y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.k) || 0;
    const p = parseFloat(newFormData.p) || 0;
    const y = parseFloat(newFormData.y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({ ...newFormData, w_gram: grams.toString() });
    } else {
      setFormData({ ...newFormData, w_gram: '0' });
    }
  };

  const handleLossGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        loss_gram: value,
        loss_k: k.toString(),
        loss_p: p.toString(),
        loss_y: y.toString(),
      });
    } else {
      setFormData({ ...formData, loss_gram: value, loss_k: '0', loss_p: '0', loss_y: '0' });
    }
  };

  const handleLossKPYChange = (field: 'loss_k' | 'loss_p' | 'loss_y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.loss_k) || 0;
    const p = parseFloat(newFormData.loss_p) || 0;
    const y = parseFloat(newFormData.loss_y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({ ...newFormData, loss_gram: grams.toString() });
    } else {
      setFormData({ ...newFormData, loss_gram: '0' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const sanitizedData = {
        ...formData,
        quantity: formData.quantity || 0,
        gold_weight: formData.gold_weight || 0,
        gold_price: formData.gold_price || 0,
        k: formData.k || 0,
        p: formData.p || 0,
        y: formData.y || 0,
        w_gram: formData.w_gram || 0,
        gold_value: formData.gold_value || 0,
        kyattar: formData.kyattar || 0,
        round_kyattar: formData.round_kyattar || 0,
        loss_k: formData.loss_k || 0,
        loss_p: formData.loss_p || 0,
        loss_y: formData.loss_y || 0,
        loss_gram: formData.loss_gram || 0,
        loss_value: formData.loss_value || 0,
        total_gold_value: formData.total_gold_value || 0,
        charges_and_other: formData.charges_and_other || 0,
        total_value: formData.total_value || 0,
        sale_voucher_amount: formData.sale_voucher_amount || 0,
        different_amount: formData.different_amount || 0,
        stamp: formData.stamp || 0,
        total_amount: formData.total_amount || 0,
      };

      const response = await saleAnalyticsAPI.createRecord(sanitizedData);

      if (response.data.success) {
        alert('G Sale data saved successfully!');
        window.location.reload();
      } else {
        alert('Error saving data: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>ရွှေ အထည်အရောင်းစာရင်း (Gold Sale)</h2>
      <form onSubmit={handleSubmit} className="sale-form">
        <div className="form-grid">
          <div className="form-group">
            <label>လ (Month) <span className="required">*</span></label>
            <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required>
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
            <label>ဆိုင်ခွဲအမှတ် (Branch) <span className="required">*</span></label>
            <select value={formData.branch_id} onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })} required>
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ရက်စွဲ (Date) <span className="required">*</span></label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>ပစ္စည်း ကုတ်အမှတ် (Item Code)</label>
            <input type="text" value={formData.item_code} onChange={(e) => setFormData({ ...formData, item_code: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပစ္စည်းအမျိုးအစား (Item Categories)</label>
            <input type="text" value={formData.item_categories} onChange={(e) => setFormData({ ...formData, item_categories: e.target.value })} />
          </div>

          <div className="form-group">
            <label>အရေအတွက် (Quantity) <span className="required">*</span></label>
            <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>ရွှေချိန် (Gold Weight)</label>
            <input type="number" step="0.01" value={formData.gold_weight} onChange={(e) => setFormData({ ...formData, gold_weight: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပဲရည် (Density)</label>
            <input type="text" value={formData.density} onChange={(e) => setFormData({ ...formData, density: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ရွှေဈေးနူန်း (Gold Price)</label>
            <input type="number" value={formData.gold_price} onChange={(e) => setFormData({ ...formData, gold_price: e.target.value })} />
          </div>

          <div className="form-group">
            <label>အထည် ဂရမ် (W Gram)</label>
            <input type="number" step="0.01" value={formData.w_gram} onChange={(e) => handleWGramChange(e.target.value)} placeholder="Enter grams" />
          </div>

          <div className="form-group">
            <label>ကျပ် (K)</label>
            <input type="number" step="0.01" value={formData.k} onChange={(e) => handleKPYChange('k', e.target.value)} placeholder="Enter K" />
          </div>

          <div className="form-group">
            <label>ပဲ (P)</label>
            <input type="number" step="0.01" value={formData.p} onChange={(e) => handleKPYChange('p', e.target.value)} placeholder="Enter P" />
          </div>

          <div className="form-group">
            <label>ရွေး (Y)</label>
            <input type="number" step="0.01" value={formData.y} onChange={(e) => handleKPYChange('y', e.target.value)} placeholder="Enter Y" />
          </div>

          <div className="form-group">
            <label>ရွှေ တန်ဖိုး (Gold Value)</label>
            <input type="number" value={formData.gold_value} onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ကျပ်သား (Kyattar)</label>
            <input type="number" step="0.01" value={formData.kyattar} onChange={(e) => setFormData({ ...formData, kyattar: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Round Kyattar</label>
            <input type="number" step="0.01" value={formData.round_kyattar} onChange={(e) => setFormData({ ...formData, round_kyattar: e.target.value })} />
          </div>

          <div className="form-group">
            <label>အလျော့ ဂရမ် (Loss Gram)</label>
            <input type="number" step="0.01" value={formData.loss_gram} onChange={(e) => handleLossGramChange(e.target.value)} placeholder="Enter grams" />
          </div>

          <div className="form-group">
            <label>အလျော့ ကျပ် (Loss K)</label>
            <input type="number" step="0.01" value={formData.loss_k} onChange={(e) => handleLossKPYChange('loss_k', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ ပဲ (Loss P)</label>
            <input type="number" step="0.01" value={formData.loss_p} onChange={(e) => handleLossKPYChange('loss_p', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ ရွေး (Loss Y)</label>
            <input type="number" step="0.01" value={formData.loss_y} onChange={(e) => handleLossKPYChange('loss_y', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ တန်ဖိုး (Loss Value)</label>
            <input type="number" value={formData.loss_value} onChange={(e) => setFormData({ ...formData, loss_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ရွှေတန်ဖိုး စုစုပေါင်း (Total Gold Value)</label>
            <input type="number" value={formData.total_gold_value} onChange={(e) => setFormData({ ...formData, total_gold_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>လက်ခ/အခြား (Charges & Other)</label>
            <input type="number" value={formData.charges_and_other} onChange={(e) => setFormData({ ...formData, charges_and_other: e.target.value })} />
          </div>

          <div className="form-group">
            <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value)</label>
            <input type="number" value={formData.total_value} onChange={(e) => setFormData({ ...formData, total_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Sale Voucher Amount</label>
            <input type="number" value={formData.sale_voucher_amount} onChange={(e) => setFormData({ ...formData, sale_voucher_amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Different Amount</label>
            <input type="number" value={formData.different_amount} onChange={(e) => setFormData({ ...formData, different_amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Stamp</label>
            <input type="number" value={formData.stamp} onChange={(e) => setFormData({ ...formData, stamp: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Total Amount (Voucher+Stamp)</label>
            <input type="number" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပြေစာအမှတ် (Invoice Number)</label>
            <input type="text" value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ဝယ်ယူသူအမည် (Customer Name)</label>
            <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} />
          </div>

          <div className="form-group">
            <label>မှတ်ပုံတင်အမှတ် (NRC No)</label>
            <input type="text" value={formData.nrc_no} onChange={(e) => setFormData({ ...formData, nrc_no: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ဖုန်းနံပါတ် (Phone No)</label>
            <input type="text" value={formData.phone_no} onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })} />
          </div>

          <div className="form-group">
            <label>လိပ်စာ (Address)</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Status (New/Return)</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="new">New</option>
              <option value="return">Return</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transaction Type</label>
            <input type="text" value={formData.transcation_type} onChange={(e) => setFormData({ ...formData, transcation_type: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Prefix</label>
            <input type="text" value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Sale Name (Employee)</label>
            <select value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>On/Off</label>
            <select value={formData.on_off} onChange={(e) => setFormData({ ...formData, on_off: e.target.value })}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="form-group">
            <label>Goldsmith Date</label>
            <input type="date" value={formData.gs_date} onChange={(e) => setFormData({ ...formData, gs_date: e.target.value })} />
          </div>

          <div className="form-group">
            <label>မှတ်ချက် (Remark)</label>
            <textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} rows={3} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save G Sale Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PTSaleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    month: '',
    branch_id: '',
    date: new Date().toISOString().split('T')[0],
    item_code: '',
    item_categories: '',
    quantity: '',
    gold_weight: '',
    gem_weight: '',
    density: '',
    gold_price: '',
    k: '',
    p: '',
    y: '',
    w_gram: '',
    gold_value: '',
    kyattar: '',
    round_kyattar: '',
    loss_k: '',
    loss_p: '',
    loss_y: '',
    loss_gram: '',
    loss_value: '',
    total_gold_value: '',
    total_value: '',
    sale_voucher_amount: '',
    different_amount: '',
    stamp: '',
    total_amount: '',
    invoice_number: '',
    customer_name: '',
    nrc_no: '',
    phone_no: '',
    address: '',
    status: 'new',
    transcation_type: '',
    prefix: '',
    employee_id: '',
    on_off: 'online',
    change: '',
    return: '',
    gs_date: '',
    remark: '',
    sale_status_id: '6', // PT Sale tab ID
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchEmployees();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await saleAnalyticsAPI.getBranches();
      const data = response.data;
      setBranches(data.data || []);
      
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.branch_id) {
          setFormData(prev => ({ ...prev, branch_id: user.branch_id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await saleAnalyticsAPI.getEmployees(user.branch_id);
        const data = response.data;
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleWGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        w_gram: value,
        k: k.toString(),
        p: p.toString(),
        y: y.toString(),
      });
    } else {
      setFormData({ ...formData, w_gram: value, k: '0', p: '0', y: '0' });
    }
  };

  const handleKPYChange = (field: 'k' | 'p' | 'y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.k) || 0;
    const p = parseFloat(newFormData.p) || 0;
    const y = parseFloat(newFormData.y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({ ...newFormData, w_gram: grams.toString() });
    } else {
      setFormData({ ...newFormData, w_gram: '0' });
    }
  };

  const handleLossGramChange = (value: string) => {
    const grams = parseFloat(value) || 0;
    if (grams > 0) {
      const { k, p, y } = convertGramToKPY(grams);
      setFormData({
        ...formData,
        loss_gram: value,
        loss_k: k.toString(),
        loss_p: p.toString(),
        loss_y: y.toString(),
      });
    } else {
      setFormData({ ...formData, loss_gram: value, loss_k: '0', loss_p: '0', loss_y: '0' });
    }
  };

  const handleLossKPYChange = (field: 'loss_k' | 'loss_p' | 'loss_y', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const k = parseFloat(newFormData.loss_k) || 0;
    const p = parseFloat(newFormData.loss_p) || 0;
    const y = parseFloat(newFormData.loss_y) || 0;
    
    if (k > 0 || p > 0 || y > 0) {
      const grams = convertKPYToGram(k, p, y);
      setFormData({ ...newFormData, loss_gram: grams.toString() });
    } else {
      setFormData({ ...newFormData, loss_gram: '0' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const sanitizedData = {
        ...formData,
        quantity: formData.quantity || 0,
        gold_weight: formData.gold_weight || 0,
        gem_weight: formData.gem_weight || 0,
        gold_price: formData.gold_price || 0,
        k: formData.k || 0,
        p: formData.p || 0,
        y: formData.y || 0,
        w_gram: formData.w_gram || 0,
        gold_value: formData.gold_value || 0,
        kyattar: formData.kyattar || 0,
        round_kyattar: formData.round_kyattar || 0,
        loss_k: formData.loss_k || 0,
        loss_p: formData.loss_p || 0,
        loss_y: formData.loss_y || 0,
        loss_gram: formData.loss_gram || 0,
        loss_value: formData.loss_value || 0,
        total_gold_value: formData.total_gold_value || 0,
        total_value: formData.total_value || 0,
        sale_voucher_amount: formData.sale_voucher_amount || 0,
        different_amount: formData.different_amount || 0,
        stamp: formData.stamp || 0,
        total_amount: formData.total_amount || 0,
        change: formData.change || 0,
        return: formData.return || 0,
      };

      const response = await saleAnalyticsAPI.createRecord(sanitizedData);

      if (response.data.success) {
        alert('PT Sale data saved successfully!');
        window.location.reload();
      } else {
        alert('Error saving data: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>ပလတ်တီနမ် အထည်အရောင်းစာရင်း (Platinum Sale)</h2>
      <form onSubmit={handleSubmit} className="sale-form">
        <div className="form-grid">
          <div className="form-group">
            <label>လ (Month) <span className="required">*</span></label>
            <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required>
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
            <label>ဆိုင်ခွဲအမှတ် (Branch) <span className="required">*</span></label>
            <select value={formData.branch_id} onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })} required>
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ရက်စွဲ (Date) <span className="required">*</span></label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>ပစ္စည်း ကုတ်အမှတ် (Item Code)</label>
            <input type="text" value={formData.item_code} onChange={(e) => setFormData({ ...formData, item_code: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပစ္စည်းအမျိုးအစား (Item Categories)</label>
            <input type="text" value={formData.item_categories} onChange={(e) => setFormData({ ...formData, item_categories: e.target.value })} />
          </div>

          <div className="form-group">
            <label>အရေအတွက် (Quantity) <span className="required">*</span></label>
            <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>ရွှေချိန် (Gold Weight)</label>
            <input type="number" step="0.01" value={formData.gold_weight} onChange={(e) => setFormData({ ...formData, gold_weight: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ကျောက်ချိန် (Gem Weight)</label>
            <input type="number" step="0.01" value={formData.gem_weight} onChange={(e) => setFormData({ ...formData, gem_weight: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပဲရည် (Density)</label>
            <input type="text" value={formData.density} onChange={(e) => setFormData({ ...formData, density: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ရွှေဈေးနူန်း (Gold Price)</label>
            <input type="number" value={formData.gold_price} onChange={(e) => setFormData({ ...formData, gold_price: e.target.value })} />
          </div>

          <div className="form-group">
            <label>အထည် ဂရမ် (W Gram)</label>
            <input type="number" step="0.01" value={formData.w_gram} onChange={(e) => handleWGramChange(e.target.value)} placeholder="Enter grams" />
          </div>

          <div className="form-group">
            <label>ကျပ် (K)</label>
            <input type="number" step="0.01" value={formData.k} onChange={(e) => handleKPYChange('k', e.target.value)} placeholder="Enter K" />
          </div>

          <div className="form-group">
            <label>ပဲ (P)</label>
            <input type="number" step="0.01" value={formData.p} onChange={(e) => handleKPYChange('p', e.target.value)} placeholder="Enter P" />
          </div>

          <div className="form-group">
            <label>ရွေး (Y)</label>
            <input type="number" step="0.01" value={formData.y} onChange={(e) => handleKPYChange('y', e.target.value)} placeholder="Enter Y" />
          </div>

          <div className="form-group">
            <label>ရွှေ တန်ဖိုး (Gold Value)</label>
            <input type="number" value={formData.gold_value} onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ကျပ်သား (Kyattar)</label>
            <input type="number" step="0.01" value={formData.kyattar} onChange={(e) => setFormData({ ...formData, kyattar: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Round Kyattar</label>
            <input type="number" step="0.01" value={formData.round_kyattar} onChange={(e) => setFormData({ ...formData, round_kyattar: e.target.value })} />
          </div>

          <div className="form-group">
            <label>အလျော့ ဂရမ် (Loss Gram)</label>
            <input type="number" step="0.01" value={formData.loss_gram} onChange={(e) => handleLossGramChange(e.target.value)} placeholder="Enter grams" />
          </div>

          <div className="form-group">
            <label>အလျော့ ကျပ် (Loss K)</label>
            <input type="number" step="0.01" value={formData.loss_k} onChange={(e) => handleLossKPYChange('loss_k', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ ပဲ (Loss P)</label>
            <input type="number" step="0.01" value={formData.loss_p} onChange={(e) => handleLossKPYChange('loss_p', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ ရွေး (Loss Y)</label>
            <input type="number" step="0.01" value={formData.loss_y} onChange={(e) => handleLossKPYChange('loss_y', e.target.value)} />
          </div>

          <div className="form-group">
            <label>အလျော့ တန်ဖိုး (Loss Value)</label>
            <input type="number" value={formData.loss_value} onChange={(e) => setFormData({ ...formData, loss_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ရွှေတန်ဖိုး စုစုပေါင်း (Total Gold Value)</label>
            <input type="number" value={formData.total_gold_value} onChange={(e) => setFormData({ ...formData, total_gold_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>စုစုပေါင်း ပစ္စည်းတန်ဖိုး (Total Value)</label>
            <input type="number" value={formData.total_value} onChange={(e) => setFormData({ ...formData, total_value: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Sale Voucher Amount</label>
            <input type="number" value={formData.sale_voucher_amount} onChange={(e) => setFormData({ ...formData, sale_voucher_amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Different Amount</label>
            <input type="number" value={formData.different_amount} onChange={(e) => setFormData({ ...formData, different_amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Stamp</label>
            <input type="number" value={formData.stamp} onChange={(e) => setFormData({ ...formData, stamp: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Total Amount (Voucher+Stamp)</label>
            <input type="number" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ပြေစာအမှတ် (Invoice Number)</label>
            <input type="text" value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ဝယ်ယူသူအမည် (Customer Name)</label>
            <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} />
          </div>

          <div className="form-group">
            <label>မှတ်ပုံတင်အမှတ် (NRC No)</label>
            <input type="text" value={formData.nrc_no} onChange={(e) => setFormData({ ...formData, nrc_no: e.target.value })} />
          </div>

          <div className="form-group">
            <label>ဖုန်းနံပါတ် (Phone No)</label>
            <input type="text" value={formData.phone_no} onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })} />
          </div>

          <div className="form-group">
            <label>လိပ်စာ (Address)</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Status (New/Return)</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="new">New</option>
              <option value="return">Return</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transaction Type</label>
            <input type="text" value={formData.transcation_type} onChange={(e) => setFormData({ ...formData, transcation_type: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Prefix</label>
            <input type="text" value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Sale Name (Employee)</label>
            <select value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>On/Off</label>
            <select value={formData.on_off} onChange={(e) => setFormData({ ...formData, on_off: e.target.value })}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="form-group">
            <label>Change (%)</label>
            <input type="number" step="0.01" value={formData.change} onChange={(e) => setFormData({ ...formData, change: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Return (%)</label>
            <input type="number" step="0.01" value={formData.return} onChange={(e) => setFormData({ ...formData, return: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Goldsmith Date</label>
            <input type="date" value={formData.gs_date} onChange={(e) => setFormData({ ...formData, gs_date: e.target.value })} />
          </div>

          <div className="form-group">
            <label>မှတ်ချက် (Remark)</label>
            <textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} rows={3} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save PT Sale Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SaleStatus;
