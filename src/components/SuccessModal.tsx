import React from 'react';
import './SuccessModal.css';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  recordId?: string;
  recordType?: string;
  onPrintInvoice?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  recordId,
  recordType = 'Record',
  onPrintInvoice
}) => {
  const handlePrintInvoice = () => {
    if (onPrintInvoice) {
      onPrintInvoice();
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
            <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2 className="modal-title">Success!</h2>
        
        <p className="modal-message">
          {recordType} has been saved successfully!
          {recordId && (
            <span className="record-id">ID: {recordId}</span>
          )}
        </p>
        
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          
          <button className="btn btn-primary" onClick={handlePrintInvoice}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
