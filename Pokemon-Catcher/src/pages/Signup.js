import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import loginVideo from "../Assets/GIF/toolxox-com-tenor-Scfaoknj4W.mp4";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const [trainerName, setTrainerName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay was prevented:", error);
      });
    }
  }, []);

  const handleSignup = async () => {
    if (!trainerName || !password) {
      alert("Enter trainer name and password.");
      return;
    }

    const success = await signup(trainerName, password);
    if (success) navigate("/");
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "70px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src={loginVideo} type="video/mp4" />
      </video>

      {/* CARD */}
      <div
        className="card shadow p-4 pixel-border"
        style={{
          width: "420px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <h3 className="text-center mb-4 pokemon-font">
          Create Trainer
        </h3>

        <div className="mb-3">
          <label className="form-label fw-bold">Trainer Name</label>
          <input
            className="form-control"
            placeholder="Enter your name..."
            onChange={(e) => setTrainerName(e.target.value)}
            value={trainerName}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password..."
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <button className="btn btn-danger w-100 py-2" onClick={handleSignup}>
          Start Your Journey!
        </button>

        <p className="text-center mt-3">
          Already a trainer?{" "}
          <Link
            to="/login"
            className="fw-bold"
            style={{ color: "#4A90E2" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
