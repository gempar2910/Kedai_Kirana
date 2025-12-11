"use client";
import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // SIMPAN STATUS LOGIN DI BROWSER
        localStorage.setItem('isLoggedIn', 'true');
        alert("Login Berhasil!");
        router.push('/admin'); // Pindah ke Dashboard
      } else {
        setError(data.message || 'Login Gagal');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan server');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh', backgroundColor: '#f4f6f9' }}>
      <Container style={{ maxWidth: '400px' }}>
        <Card className="shadow border-0">
          <Card.Body className="p-4">
            <h3 className="text-center fw-bold mb-4">Admin Login</h3>
            
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Masukan username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Masukan password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Masuk
              </Button>
            </Form>
            
            <div className="text-center mt-3">
                <a href="/" className="text-decoration-none small">Kembali ke Menu Utama</a>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}