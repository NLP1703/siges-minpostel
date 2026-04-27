import React, { useEffect } from 'react';
import './ModalConfirmation.css';

export function ModalConfirmation({ 
  isOpen = true, 
  title, 
  message, 
  confirmLabel = 'Confirmer', 
  cancelLabel = 'Annuler',
  singleButton = false,
  onConfirm, 
  onCancel,
  children
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return React.createElement('div', { className: 'modal-overlay', onClick: onCancel },
    React.createElement('div', { className: 'modal-container', onClick: e => e.stopPropagation() },
      React.createElement('div', { className: 'modal-header' },
        React.createElement('h3', { className: 'modal-title' }, title)
      ),
      React.createElement('div', { className: 'modal-body' },
        message && React.createElement('p', { className: 'modal-message' }, message),
        children
      ),
      React.createElement('div', { className: 'modal-footer' },
        !singleButton && React.createElement('button', { className: 'modal-btn modal-btn-cancel', onClick: onCancel }, cancelLabel),
        React.createElement('button', { className: 'modal-btn modal-btn-confirm', onClick: onConfirm }, confirmLabel)
      )
    )
  );
}
