import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page-state">
          <h2>Terjadi kesalahan pada aplikasi.</h2>
          <p>Silakan muat ulang halaman ini.</p>
          <button
            className="btn-primary-lg"
            onClick={() => window.location.reload()}
            style={{ marginTop: "20px" }}
          >
            Muat Ulang
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}