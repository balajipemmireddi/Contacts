import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Container, Card, Row, Col, Badge } from "react-bootstrap";
import { FiUser, FiMail, FiShield, FiCalendar } from "react-icons/fi";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);

  return (
    <Container className="py-4">
      <header className="mb-5 animate-fade-in">
        <h2 className="fw-bold">My Profile</h2>
        <p className="text-muted">Manage your personal account settings</p>
      </header>

      <Row>
        <Col lg={8}>
          <Card className="glass-card border-0 p-4 mb-4">
            <div className="d-flex align-items-center gap-4 mb-5 pb-4 border-bottom">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                <FiUser size={40} />
              </div>
              <div>
                <h3 className="fw-bold mb-1">{user?.email?.split('@')[0]}</h3>
                <Badge bg="primary" className="rounded-pill px-3 py-2">
                  <FiShield className="me-2" />
                  {user?.role} Account
                </Badge>
              </div>
            </div>

            <Row className="g-4">
              <Col md={6}>
                <div className="p-3 rounded-4 bg-light">
                  <p className="text-muted small mb-1">Email Address</p>
                  <div className="d-flex align-items-center gap-2 fw-medium">
                    <FiMail className="text-primary" />
                    {user?.email}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 rounded-4 bg-light">
                  <p className="text-muted small mb-1">Account Role</p>
                  <div className="d-flex align-items-center gap-2 fw-medium">
                    <FiShield className="text-primary" />
                    {user?.role}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 rounded-4 bg-light">
                  <p className="text-muted small mb-1">Member Since</p>
                  <div className="d-flex align-items-center gap-2 fw-medium">
                    <FiCalendar className="text-primary" />
                    May 2026
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="glass-card border-0 p-4 bg-primary text-white">
            <h5 className="fw-bold mb-3">Security Tip</h5>
            <p className="small opacity-75 mb-0">
              Always ensure your password is unique and not shared with other services. 
              Contact support if you notice any unusual activity.
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
