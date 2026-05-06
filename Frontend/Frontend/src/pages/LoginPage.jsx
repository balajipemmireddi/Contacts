import { useState, useContext } from "react";
import { loginUser } from "../services/UserService";
import { jwtDecode } from "jwt-decode";
import { Container, Card, Form, Button, Toast, InputGroup } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await loginUser(credentials);

      if (!token || token === "Fail") {
        showToast("Invalid Credentials", "danger");
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(token);

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: decoded.sub,
          role: decoded.role
        })
      );

      // Trigger app-wide login state update
      login();

      showToast("Welcome back!", "success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      showToast(err?.response?.data || "Login Failed", "danger");
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="p-4 glass-card animate-fade-in" style={{ width: "420px" }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
            <FiLogIn size={32} />
          </div>
          <h2 className="fw-bold">Login</h2>
          <p className="text-muted">Enter your details to access your account</p>
        </div>

        <Form onSubmit={handleLogin}>
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
                  setCredentials({ ...credentials, email: e.target.value })
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
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
              />
            </InputGroup>
          </Form.Group>

          <Button type="submit" className="w-100 btn-premium" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted small">
            Don't have an account? <Link to="/signup" className="text-primary fw-bold text-decoration-none">Create one</Link>
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