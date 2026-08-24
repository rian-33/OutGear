import { useState, useEffect } from "react";
import logoImg from "../assets/logo.png";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Ganti span emoji dengan tag img */}
        <img
          src={logoImg}
          alt="OutGear Logo"
          style={{
            height: "100px",
            marginBottom: "20px",
            borderRadius: "12px",
          }}
        />
        <h1>OutGear</h1>
        <p>Your Ultimate Mountain Partner</p>
      </div>
    </div>
  );
}
