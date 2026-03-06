import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { assetsApi, departmentsApi, categoriesApi, manufacturersApi, vendorsApi } from '../api';
import type { Department, AssetCategory, Manufacturer, Vendor, AssetStatus } from '../types';

interface AssetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssetModal({ onClose, onSuccess }: AssetModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    asset_code: '',
    asset_name: '',
    serial_no: '',
    category_id: '',
    owner_dept_id: '',
    manufacturer_id: '',
    vendor_id: '',
    current_status: 'IN_SERVICE',
    risk_class: 'Class A',
    criticality: 'MEDIUM',
    model_name_manual: '',
  });

  const [depts, setDepts] = useState<Department[]>([]);
  const [cats, setCats] = useState<AssetCategory[]>([]);
  const [mans, setMans] = useState<Manufacturer[]>([]);
  const [_vens, setVens] = useState<Vendor[]>([]);

  useEffect(() => {
    Promise.all([
      departmentsApi.list(),
      categoriesApi.list(),
      manufacturersApi.list(),
      vendorsApi.list()
    ]).then(([d, c, m, v]) => {
      setDepts(d.data.results);
      setCats(c.data.results);
      setMans(m.data.results);
      setVens(v.data.results);
    });
  }, []);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validation
    if (!data.asset_code.trim()) {
      setError('Mã thiết bị không được để trống');
      setLoading(false);
      return;
    }
    if (!data.asset_name.trim()) {
      setError('Tên thiết bị không được để trống');
      setLoading(false);
      return;
    }
    
    try {
      const payload: any = {
        asset_code: data.asset_code,
        asset_name: data.asset_name,
        serial_no: data.serial_no,
        model_name_manual: data.model_name_manual,
        current_status: data.current_status as AssetStatus,
        risk_class: data.risk_class,
        criticality: data.criticality,
      };
      
      // Add optional fields if selected
      if (data.category_id) {
        payload.category_id = Number(data.category_id);
      }
      if (data.owner_dept_id) {
        payload.owner_dept_id = Number(data.owner_dept_id);
      }
      if (data.manufacturer_id) {
        payload.manufacturer_id = Number(data.manufacturer_id);
      }
      if (data.vendor_id) {
        payload.vendor_id = Number(data.vendor_id);
      }
      
      console.log('Submitting:', payload);
      await assetsApi.create(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error:', err);
      const detail = err?.response?.data;
      if (detail && typeof detail === 'object') {
        const messages = Object.entries(detail)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        setError(messages);
      } else {
        setError('Có lỗi xảy ra khi tạo thiết bị. Vui lòng kiểm tra lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Nhập mới thiết bị y tế</h3>
          <button className="close-btn" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã thiết bị *</label>
              <input 
                required 
                value={data.asset_code} 
                onChange={e => setData({...data, asset_code: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Tên thiết bị *</label>
              <input 
                required 
                value={data.asset_name} 
                onChange={e => setData({...data, asset_name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Serial Number</label>
              <input 
                value={data.serial_no} 
                onChange={e => setData({...data, serial_no: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Model (nhập tay)</label>
              <input 
                value={data.model_name_manual} 
                onChange={e => setData({...data, model_name_manual: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Chủng loại</label>
              <select value={data.category_id} onChange={e => setData({...data, category_id: e.target.value})}>
                <option value="">-- Chọn --</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Khoa sở hữu</label>
              <select value={data.owner_dept_id} onChange={e => setData({...data, owner_dept_id: e.target.value})}>
                <option value="">-- Chọn --</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Nhà sản xuất</label>
              <select value={data.manufacturer_id} onChange={e => setData({...data, manufacturer_id: e.target.value})}>
                <option value="">-- Chọn --</option>
                {mans.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select value={data.current_status} onChange={e => setData({...data, current_status: e.target.value})}>
                <option value="IN_SERVICE">Đang sử dụng</option>
                <option value="STANDBY">Dự phòng</option>
                <option value="UNDER_MAINTENANCE">Đang bảo trì</option>
                <option value="BREAKDOWN">Hỏng</option>
              </select>
            </div>
          </div>
          {error && (
            <div className="modal-error">
              <span>⚠️ {error}</span>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <RefreshCw className="spin" size={14}/> : <Save size={14}/>} Lưu thiết bị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
