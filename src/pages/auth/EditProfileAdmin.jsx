import React from "react";
import DashboardLayout from "../DashboardLayout";
import { Container, Row, Col, Card } from "react-bootstrap";
import EditProfile from "./EditProfile";
import "./ProfileCommon.css";

const EditProfileAdmin = () => {
  return (
    <DashboardLayout title="Edit Profile">
      <Container className="profile-container">
        <Row>
          <Col md={12}>
            <Card className="profile-card mb-4">
              <Card.Header className="profile-header">
                <h4>Personal Information</h4>
              </Card.Header>
              <Card.Body>
                <EditProfile />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
};

export default EditProfileAdmin;





