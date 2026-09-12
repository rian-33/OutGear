import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Email tidak valid";
    if (!formData.password?.trim()) newErrors.password = "Password wajib diisi";
    return Object.keys(newErrors).length === 0 ? null : newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors) return setErrors(validationErrors);

    try {
      setLoading(true);
      await login(formData);
      showToast("Login berhasil!", "success");
      navigate(location.state?.from || "/account");
    } catch (error) {
      showToast(`Login gagal: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Masuk ke Akun</h1>
        <p className="auth-subtitle">
          Masuk untuk melihat riwayat pesanan dan mengelola profil Anda.
        </p>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-field">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <small className="error-text">{errors.email}</small>}
          </div>
          <div className="form-field">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <small className="error-text">{errors.password}</small>}
          </div>

          <button type="submit" disabled={loading} className="checkout-submit">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="auth-footer">
          Belum punya akun?{" "}
          <Link to="/register" className="auth-link">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}