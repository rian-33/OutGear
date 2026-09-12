import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Nama lengkap wajib diisi";
    if (!formData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Email tidak valid";
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Password minimal 8 karakter";
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
      await register(formData);
      showToast("Akun berhasil dibuat!", "success");
      navigate("/account");
    } catch (error) {
      showToast(`Pendaftaran gagal: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Daftar Akun Baru</h1>
        <p className="auth-subtitle">
          Buat akun untuk mengelola pesanan dan mempercepat checkout Anda.
        </p>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-field">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <small className="error-text">{errors.name}</small>}
          </div>
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
              placeholder="Password (minimal 8 karakter)"
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <small className="error-text">{errors.password}</small>}
          </div>
          <div className="form-field">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="No Telepon (opsional)"
            />
          </div>
          <div className="form-field">
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Alamat (opsional)"
              rows="2"
            />
          </div>

          <button type="submit" disabled={loading} className="checkout-submit">
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="auth-footer">
          Sudah punya akun?{" "}
          <Link to="/login" className="auth-link">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}