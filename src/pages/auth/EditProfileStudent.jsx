import React from "react";
import LayoutStudent from "../dashboard/LayoutStudent";
import { Container, Row, Col, Card } from "react-bootstrap";
import EditProfile from "./EditProfile";
import SkillsManager from "../dashboard/SkillsManager";
import "./ProfileCommon.css";

const EditProfileStudent = () => {
  return (
    <LayoutStudent>
      <Container className="profile-container">
        <Row>
          <Col md={12}>
            <Card className="profile-card mb-4">
              
              <Card.Body>
                <EditProfile />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card className="skills-card">
              <Card.Header className="skills-header">
                <h4>My Skills</h4>
              </Card.Header>
              <Card.Body>
                <SkillsManager />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </LayoutStudent>
  );
};

export default EditProfileStudent;

