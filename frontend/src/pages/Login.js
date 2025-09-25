import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/contexts/authContext";
import Qrcode from "../components/QrCode/QrcodeCreate";
import QrcodeRead from "../components/QrCode/QrcodeRead";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await login(form.username, form.password);
      if (success) {
        navigate("/");
      } else {
        setError("Credenciais inválidas");
      }
    } catch (err) {
      setError("Algo deu errado. Tente novamente.");
    }
  };

  const handleQRLogin = async (data) => {
    try {
      const success = await login(data.name, data.password);
      if (success) {
        navigate("/");
      } else {
        setError("QR Code inválido");
      }
    } catch (err) {
      setError("Algo deu errado. Tente novamente.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-sm p-4" style={{ maxWidth: "800px", width: "100%" }}>
        <div className="row">
          <div className="col-md-6">
            <h3 className="text-center mb-4">Login</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Username</label>
                <input
                  type="username"
                  className="form-control"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <button type="submit" className="btn btn-primary w-100 mb-3">
                Entrar
              </button>
            </form>
            <button 
              className="btn btn-secondary w-100" 
              onClick={() => setIsScanning(!isScanning)}
            >
              {isScanning ? "Cancelar Scan" : "Scan QR Code"}
            </button>
            <div className="text-center mt-3">
              <Link to="/resetPassword" className="d-block">
                Esqueceu sua senha? Clique aqui
              </Link>
              <Link to="/register" className="d-block mt-2">
                Não tem uma conta? Registre-se aqui
              </Link>
            </div>
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center">
            {isScanning ? (
              <QrcodeRead setDataLogin={handleQRLogin} />
            ) : (
              <>
                <h4 className="mb-3">Login com QR Code</h4>
                <Qrcode user={form} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;