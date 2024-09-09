/* eslint-disable react/prop-types */
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Nav, Navbar } from "react-bootstrap";
import styled from "styled-components";

const StyledNavbar = styled(Navbar)`
  background: transparent;
  border-bottom: none;
  margin-bottom: 2rem;
  font-family: "Poppins", sans-serif;
  padding: 1rem 0;

  .navbar-toggler {
    border-color: #3AAEE9;
  }

  .navbar-toggler-icon {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='%233AAEE9' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
  }
`;

const NavbarBrand = styled.h2`
  font-size: 2.5rem;
  color: #3AAEE9;
  font-weight: bold;
  font-family: "Poppins", sans-serif;
  letter-spacing: 1px;
`;

const StyledNav = styled(Nav)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const StyledNavLink = styled(Nav.Link)`
  color: #3AAEE9;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: #ffffff;
  }

  svg {
    width: 28px;
    height: 28px;
  }
`;

const NavbarComponent = ({ onImportJSON, onImportExcel }) => {
  const handleFileUpload = (event, importFunction) => {
    const file = event.target.files[0];
    if (file) {
      importFunction(file);
    }
  };

  return (
    <StyledNavbar expand="lg">
      <Container>
        <NavbarBrand>Invoice App</NavbarBrand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <StyledNav className="ms-auto">
            <StyledNavLink as="label" htmlFor="excel-upload" title="Import Excel">
              <FontAwesomeIcon icon={faFileExcel} />
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, onImportExcel)}
              />
            </StyledNavLink>
            <StyledNavLink as="label" htmlFor="json-upload" title="Import JSON">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.5 5H9a2 2 0 0 0-2 2v2c0 1-.6 3-3 3 1 0 3 .6 3 3v2a2 2 0 0 0 2 2h.5m5-14h.5a2 2 0 0 1 2 2v2c0 1 .6 3 3 3-1 0-3 .6-3 3v2a2 2 0 0 1-2 2h-.5" />
              </svg>
              <input
                id="json-upload"
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, onImportJSON)}
              />
            </StyledNavLink>
          </StyledNav>
        </Navbar.Collapse>
      </Container>
    </StyledNavbar>
  );
};

export default NavbarComponent;