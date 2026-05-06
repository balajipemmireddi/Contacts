import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { Container, Button, Modal, Form, Row, Col, Toast } from "react-bootstrap";
import { getAllContacts, addContact, updateContact, deleteContact, toggleFavorite } from "../services/ContactService";
import ContactCard from "../components/ContactCard";

export default function DashBoard() {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: ""
  });
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
  };

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (err) {
      console.error("Failed to load contacts:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Failed to load contacts";
      showToast(errorMsg, "danger");
    }
  };

  const handleShowModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phoneNumber: contact.phoneNumber,
        address: contact.address || ""
      });
    } else {
      setEditingContact(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: ""
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
        showToast("Contact updated successfully", "success");
      } else {
        await addContact(formData);
        showToast("Contact added successfully", "success");
      }
      loadContacts();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save contact:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Failed to save contact";
      showToast(errorMsg, "danger");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(id);
        showToast("Contact deleted successfully", "success");
        loadContacts();
      } catch (err) {
        showToast("Failed to delete contact", "danger");
      }
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      loadContacts();
    } catch (err) {
      showToast("Failed to toggle favorite", "danger");
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: 'var(--accent)' }}>My Contacts</h2>
          <p className="text-muted">Welcome, {user?.email}</p>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <h4>No contacts yet</h4>
          <p className="text-muted">Click "Add Contact" to create your first contact</p>
        </div>
      ) : (
        <Row>
          {contacts.map((contact) => (
            <Col key={contact.id} md={4} className="mb-3">
              <ContactCard
                contact={contact}
                onEdit={handleShowModal}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Contact Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingContact ? "Edit Contact" : "Add Contact"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                style={{ color: '#000' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingContact ? "Update" : "Add"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        delay={3000}
        autohide
        bg={toast.type}
        style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}
      >
        <Toast.Body className="text-white">{toast.msg}</Toast.Body>
      </Toast>
    </Container>
  );
}