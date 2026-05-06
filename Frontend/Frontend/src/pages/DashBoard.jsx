import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { getAllContacts, addContact, updateContact, deleteContact, toggleFavorite, searchContacts } from "../services/ContactService";
import { Container, Row, Col, Button, Form, Modal, InputGroup, Spinner, Alert } from "react-bootstrap";
import { FiPlus, FiSearch, FiRefreshCw, FiUserPlus } from "react-icons/fi";
import ContactCard from "../components/ContactCard";

export default function DashBoard() {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    isFavorite: false
  });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getAllContacts();
      setContacts(data);
      setError(null);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const results = await searchContacts(query);
        setContacts(results);
      } catch (err) {
        console.error("Search failed", err);
      }
    } else if (query.length === 0) {
      fetchContacts();
    }
  };

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData(contact);
    } else {
      setEditingContact(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        isFavorite: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
      } else {
        await addContact(formData);
      }
      setShowModal(false);
      fetchContacts();
    } catch (err) {
      alert("Error saving contact");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(id);
        fetchContacts();
      } catch (err) {
        alert("Error deleting contact");
      }
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      // Optimistic update
      setContacts(contacts.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  return (
    <Container fluid>
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3 animate-fade-in">
        <div>
          <h2 className="fw-bold mb-1">My Contacts</h2>
          <p className="text-muted mb-0">Manage your network efficiently</p>
        </div>
        <div className="d-flex gap-2">
          <InputGroup style={{ width: '300px' }}>
            <InputGroup.Text className="bg-white border-end-0">
              <FiSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search contacts..."
              className="border-start-0"
              value={searchQuery}
              onChange={handleSearch}
            />
          </InputGroup>
          <Button className="btn-premium" onClick={() => handleOpenModal()}>
            <FiPlus size={20} /> Add Contact
          </Button>
        </div>
      </header>

      {error && <Alert variant="danger" className="rounded-4">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading your contacts...</p>
        </div>
      ) : contacts.length > 0 ? (
        <Row className="g-4">
          {contacts.map(contact => (
            <Col key={contact.id} xs={12} sm={6} lg={4} xl={3}>
              <ContactCard 
                contact={contact} 
                onEdit={handleOpenModal} 
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5 glass-card">
          <div className="d-inline-flex p-4 rounded-circle bg-light text-muted mb-4">
            <FiUserPlus size={48} />
          </div>
          <h3>No Contacts Found</h3>
          <p className="text-muted mb-4">Start by adding your first contact to the list!</p>
          <Button variant="primary" className="rounded-pill px-4" onClick={() => handleOpenModal()}>
            Add First Contact
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card border-0">
        <Modal.Header closeButton className="border-0 p-4 pb-0">
          <Modal.Title className="fw-bold">
            {editingContact ? "Edit Contact" : "Add New Contact"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-medium">First Name</Form.Label>
                  <Form.Control 
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-medium">Last Name</Form.Label>
                  <Form.Control 
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-medium">Email Address</Form.Label>
              <Form.Control 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-medium">Phone Number</Form.Label>
              <Form.Control 
                required
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-medium">Address</Form.Label>
              <Form.Control 
                as="textarea"
                rows={2}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </Form.Group>
            <Form.Check 
              type="switch"
              label="Mark as Favorite"
              checked={formData.isFavorite}
              onChange={e => setFormData({...formData, isFavorite: e.target.checked})}
            />
          </Modal.Body>
          <Modal.Footer className="border-0 p-4 pt-0">
            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill">Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4">
              {editingContact ? "Save Changes" : "Create Contact"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}