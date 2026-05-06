import { useState } from "react";
import { registerUser } from "../services/UserService";
import { Container, Card, Form, Button, Toast, InputGroup, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(formData);
      showToast("Account created successfully! Redirecting to login...", "success");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      showToast(err?.message || err || "Signup Failed", "danger");
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="p-4 glass-card animate-fade-in" style={{ width: "460px" }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
            <FiUserPlus size={32} />
          </div>
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted">Join us to manage your contacts easily</p>
        </div>

        <Form onSubmit={handleSignup}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-medium">First Name</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-transparent border-end-0">
                    <FiUser className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    className="border-start-0 ps-0"
                    placeholder="John"
                    type="text"
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-medium">Last Name</Form.Label>
                <Form.Control
                  placeholder="Doe"
                  type="text"
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-medium">Email Address</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-transparent border-end-0">
                <FiMail className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                className="border-start-0 ps-0"
                placeholder="name@example.com"
                type="email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-medium">Password</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-transparent border-end-0">
                <FiLock className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                className="border-start-0 ps-0"
                placeholder="••••••••"
                type="password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </InputGroup>
          </Form.Group>

          <Button type="submit" className="w-100 btn-premium" variant="success" disabled={loading} style={{ background: 'var(--success-color)' }}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted small">
            Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Log in</Link>
          </p>
        </div>
      </Card>

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        delay={3000}
        autohide
        bg={toast.type}
        style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}
      >
        <Toast.Body className="text-white fw-medium">
          {toast.msg}
        </Toast.Body>
      </Toast>
    </Container>
  );
}