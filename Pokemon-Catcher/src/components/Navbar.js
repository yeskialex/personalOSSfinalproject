import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navbar as BootstrapNavbar, Nav, Container } from "react-bootstrap";

export default function Navbar() {
  const { trainer, logout } = useContext(AuthContext);
  let displayName = "";
  if (trainer && typeof trainer.name === "string") {
    // If the name contains '@', assume it's an email and take the part before it.
    // Otherwise, use the name as is.
    const nameParts = trainer.name.split("@");
    displayName = nameParts[0];
  }

  return (
    <BootstrapNavbar
      style={{
        background: "linear-gradient(135deg, #FF1B1C, #4A90E2)",
        borderBottom: "4px solid #2a2a2a",
        position: "relative",
      }}
      expand="lg"
      variant="dark"
      collapseOnSelect
    >
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/" className="pokemon-font d-flex align-items-center">
            <div className="d-flex me-3 gap-2">
              <div className="pokedex-light" style={{ background: '#5DADE2' }}></div>
              <div className="pokedex-light" style={{ background: '#F1C40F' }}></div>
              <div className="pokedex-light" style={{ background: '#48C9B0' }}></div>
            </div>
            <span>Pokédex</span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="navContent" style={{ border: '2px solid rgba(255,255,255,0.7)' }} />

        <BootstrapNavbar.Collapse id="navContent" className="smoother-collapse">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end className="nav-link-pixel">
              Home
            </Nav.Link>
            {trainer && (
              <>
                <Nav.Link as={NavLink} to="/my-pokemons" className="nav-link-pixel">
                  My Pokémons
                </Nav.Link>
                <Nav.Link as={NavLink} to="/teams" className="nav-link-pixel">
                  Teams
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* Right side */}
          <Nav>
            {trainer ? (
              <>
                <BootstrapNavbar.Text className="me-3">
                  Welcome, {displayName}!
                </BootstrapNavbar.Text>
                <button className="btn btn-warning mt-2 mt-lg-0" onClick={logout}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-light pixel-border me-2 mt-2 mt-lg-0" to="/login">
                  Log in
                </Link>
                <Link className="btn btn-outline-light pixel-border mt-2 mt-lg-0" to="/signup">
                  Sign Up
                </Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}
