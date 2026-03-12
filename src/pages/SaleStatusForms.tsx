// This file contains the remaining form implementations for PT RC, G Sale, and PT Sale
// These will be copied into SaleStatus.tsx to replace the placeholder forms

import React, { useState, useEffect } from 'react';

// PT RC Form Implementation
export const PTRCFormImplementation = `
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
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://192.168.100.215:8000/api/sale-analytics/helpers/branches', {
        headers: { 'Authorization': \`Bearer \${token}\` },
      });
      const data = await response.json();
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
        const response = await fetch(\`http://192.168.100.215:8000/api/sale-analytics/helpers/employees?branch_id=\${user.branch_id}\`, {
          headers: { 'Authorization': \`Bearer \${token}\` },
        });
        const data = await response.json();
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

      const response = await fetch('http://192.168.100.215:8000/api/sale-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`,
        },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        alert('PT RC data saved successfully!');
        window.location.reload();
      } else {
        const error = await response.json();
        alert('Error saving data: ' + (error.message || 'Unknown error'));
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
          {/* Month */}
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

          {/* Branch */}
          <div className="form-group">
            <label>ဆိုင်ခွဲအမှတ် (Branch) <span className="required">*</span></label>
            <select value={formData.branch_id} onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })} required>
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label>ရက်စွဲ (Date) <span className="required">*</span></label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          </div>

          {/* Item Code */}
          <div className="form-group">
            <label>ပစ္စည်း ကုတ်အမှတ် (Item Code)</label>
            <input type="text" value={formData.item_code} onChange={(e) => setFormData({ ...formData, item_code: e.target.value })} />
          </div>

          {/* Item Categories */}
          <div className="form-group">
            <label>ပစ္စည်းအမျိုးအစား (Item Categories)</label>
            <input type="text" value={formData.item_categories} onChange={(e) => setFormData({ ...formData, item_categories: e.target.value })} />
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>အရေအတွက် (Quantity) <span className="required">*</span></label>
            <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
          </div>

          {/* Gold Weight */}
          <div className="form-group">
            <label>ရွှေချိန် (Gold Weight)</label>
            <input type="number" step="0.01" value={formData.gold_weight} onChange={(e) => handleGoldWeightChange(e.target.value)} placeholder="Enter grams to auto-calculate K, P, Y" />
          </div>

          {/* Gem Weight */}
          <div className="form-group">
            <label>ကျောက်ချိန် (Gem Weight)</label>
            <input type="number" step="0.01" value={formData.gem_weight} onChange={(e) => setFormData({ ...formData, gem_weight: e.target.value })} />
          </div>

          {/* Density */}
          <div className="form-group">
            <label>ပဲရည် (Density)</label>
            <input type="text" value={formData.density} onChange={(e) => setFormData({ ...formData, density: e.target.value })} />
          </div>

          {/* Gold Price */}
          <div className="form-group">
            <label>ရွှေဈေးနူန်း (Gold Price)</label>
            <input type="number" value={formData.gold_price} onChange={(e) => setFormData({ ...formData, gold_price: e.target.value })} />
          </div>

          {/* K */}
          <div className="form-group">
            <label>ကျပ် (K)</label>
            <input type="number" step="0.01" value={formData.k} onChange={(e) => handleKPYChange('k', e.target.value)} placeholder="Enter K to auto-calculate grams" />
          </div>

          {/* P */}
          <div className="form-group">
            <label>ပဲ (P)</label>
            <input type="number" step="0.01" value={formData.p} onChange={(e) => handleKPYChange('p', e.target.value)} placeholder="Enter P to auto-calculate grams" />
          </div>

          {/* Y */}
          <div className="form-group">
            <label>ရွေး (Y)</label>
            <input type="number" step="0.01" value={formData.y} onChange={(e) => handleKPYChange('y', e.target.value)} placeholder="Enter Y to auto-calculate grams" />
          </div>

          {/* Gold Value */}
          <div className="form-group">
            <label>ရွှေ တန်ဖိုး (Gold Value)</label>
            <input type="number" value={formData.gold_value} onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })} />
          </div>

          {/* Kyattar */}
          <div className="form-group">
            <label>ကျပ်သား (Kyattar)</label>
            <input type="number" step="0.01" value={formData.kyattar} onChange={(e) => setFormData({ ...formData, kyattar: e.target.value })} />
          </div>

          {/* Round Kyattar */}
          <div className="form-group">
            <label>Round Kyattar</label>
            <input type="number" step="0.01" value={formData.round_kyattar} onChange={(e) => setFormData({ ...formData, round_kyattar: e.target.value })} />
          </div>

          {/* Loss K */}
          <div className="form-group">
            <label>အလျော့ ကျပ် (Loss K)</label>
            <input type="number" step="0.01" value={formData.loss_k} onChange={(e) => handleLossKPYChange('loss_k', e.target.value)} placeholder="Enter Loss K to auto-calculate grams" />
          </div>

          {/* Loss P */}
          <div className="form-group">
            <label>အလျော့ ပဲ (Loss P)</label>
            <input type="number" step="0.01" value={formData.loss_p} onChange={(e) => handleLossKPYChange('loss_p', e.target.value)} placeholder="Enter Loss P to auto-calculate grams" />
          </div>

          {/* Loss Y */}
          <div className="form-group">
            <label>အလျော့ ရွေး (Loss Y)</label>
            <input type="number" step="0.01" value={formData.loss_y} onChange={(e) => handleLossKPYChange('loss_y', e.target.value)} placeholder="Enter Loss Y to auto-calculate grams" />
          </div>

          {/* Loss Gram */}
          <div className="form-group">
            <label>အလျော့ ဂရမ် (Loss Gram)</label>
            <input type="number" step="0.01" value={formData.loss_gram} onChange={(e) => handleLossGramChange(e.target.value)} placeholder="Enter grams to auto-calculate Loss K, P, Y" />
          </div>

          {/* Loss Value */}
          <div className="form-group">
            <label>အလျော့ တန်ဖိုး (Loss Value)</label>
            <input type="number" value={formData.loss_value} onChange={(e) => setFormData({ ...formData, loss_value: e.target.value })} />
          </div>

          {/* Total Gold Value */}
          <div className="form-group">
            <label>ရွှေတန်ဖိုး စုစုပေါင်း (Total Gold Value)</label>
            <input type="number" value={formData.total_gold_value} onChange={(e) => setFormData({ ...formData, total_gold_value: e.target.value })} />
          </div>

          {/* Purchase Voucher Amount */}
          <div className="form-group">
            <label>Purchase Voucher Amount</label>
            <input type="number" value={formData.sale_voucher_amount} onChange={(e) => setFormData({ ...formData, sale_voucher_amount: e.target.value })} />
          </div>

          {/* Different Amount */}
          <div className="form-group">
            <label>Different Amount</label>
            <input type="number" value={formData.different_amount} onChange={(e) => setFormData({ ...formData, different_amount: e.target.value })} />
          </div>

          {/* Invoice Number */}
          <div className="form-group">
            <label>ပြေစာအမှတ် (Invoice Number)</label>
            <input type="text" value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} />
          </div>

          {/* Customer Name */}
          <div className="form-group">
            <label>ဝယ်ယူသူအမည် (Customer Name)</label>
            <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} />
          </div>

          {/* NRC No */}
          <div className="form-group">
            <label>မှတ်ပုံတင်အမှတ် (NRC No)</label>
            <input type="text" value={formData.nrc_no} onChange={(e) => setFormData({ ...formData, nrc_no: e.target.value })} />
          </div>

          {/* Phone No */}
          <div className="form-group">
            <label>ဖုန်းနံပါတ် (Phone No)</label>
            <input type="text" value={formData.phone_no} onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })} />
          </div>

          {/* Address */}
          <div className="form-group">
            <label>လိပ်စာ (Address)</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>

          {/* Transaction Type */}
          <div className="form-group">
            <label>Type (Transaction Type)</label>
            <input type="text" value={formData.transcation_type} onChange={(e) => setFormData({ ...formData, transcation_type: e.target.value })} />
          </div>

          {/* Employee */}
          <div className="form-group">
            <label>Sale Name (Employee)</label>
            <select value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Remark */}
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
`;
