import React from 'react';
import { Button } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaEdit, FaTrash } from 'react-icons/fa';

export default function ContactCard({ contact, onEdit, onDelete, onToggleFavorite }) {
  const { firstName, lastName, email, phoneNumber, address, favorite } = contact;

  return (
    <div className="glass-card p-4 mb-4 animate-fade-in" style={{ maxWidth: '300px' }}>
      <h5 className="mb-2" style={{ color: 'var(--accent)' }}>
        {firstName} {lastName}
      </h5>
      <p className="mb-1"><strong>Email:</strong> {email}</p>
      <p className="mb-1"><strong>Phone:</strong> {phoneNumber}</p>
      {address && <p className="mb-1"><strong>Address:</strong> {address}</p>}
      <div className="d-flex justify-content-between mt-3">
        <Button variant="link" onClick={() => onToggleFavorite(contact.id)}>
          {favorite ? <FaHeart color="var(--danger)" /> : <FaRegHeart />}
        </Button>
        <div>
          <Button variant="link" onClick={() => onEdit(contact)} className="me-2">
            <FaEdit />
          </Button>
          <Button variant="link" onClick={() => onDelete(contact.id)}>
            <FaTrash color="var(--danger)" />
          </Button>
        </div>
      </div>
    </div>
  );
}
