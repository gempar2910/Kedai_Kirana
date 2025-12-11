"use client";
import { useEffect, useState, ChangeEvent } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Modal,
  Nav,
  Badge,
} from "react-bootstrap";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Link from "next/link";
import { useRouter } from "next/navigation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Menu {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  gambar: string;
}
interface DashboardStats {
  totalProduk: number;
  totalPesanan: number;
  totalPendapatan: number;
  grafikBulanan: number[];
}

// INTERFACE PESANAN
interface Order {
  id: number;
  nama_menu: string;
  harga: number;
  metode_pembayaran: string;
  nama_pelanggan: string;
  status: string; // 'Pending' | 'Selesai'
  tanggal: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "produk" | "orders">("dashboard");

  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProduk: 0,
    totalPesanan: 0,
    totalPendapatan: 0,
    grafikBulanan: Array(12).fill(0),
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    nama: "",
    kategori: "makanan",
    harga: "",
    stok: "",
    gambar: "",
  });

  // Proteksi Halaman
  useEffect(() => {
    const isLogin = localStorage.getItem("isLoggedIn");
    if (!isLogin) router.push("/login");
  }, [router]);

  const fetchData = async () => {
    try {
      const [resMenu, resStats, resOrders] = await Promise.all([
        fetch("http://localhost:5000/api/menus"),
        fetch("http://localhost:5000/api/dashboard"),
        fetch("http://localhost:5000/api/pesanan"),
      ]);
      setMenus(await resMenu.json());
      setStats(await resStats.json());
      setOrders(await resOrders.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (!showModal) fetchData();
    }, 2000);
    return () => clearInterval(interval);
  }, [showModal]);

  const barData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ],
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: stats.grafikBulanan,
        backgroundColor: "#0d6efd",
        borderRadius: 5,
      },
    ],
  };

  const pieData = {
    labels: ["Makanan", "Minuman"],
    datasets: [
      {
        data: [
          menus.filter((m) => m.kategori === "makanan").length,
          menus.filter((m) => m.kategori === "minuman").length,
        ],
        backgroundColor: ["#ffc107", "#198754"],
        borderWidth: 0,
      },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData({ ...formData, gambar: reader.result as string });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      id: 0,
      nama: "",
      kategori: "makanan",
      harga: "",
      stok: "",
      gambar: "",
    });
    setShowModal(true);
  };
  const openEditModal = (item: Menu) => {
    setIsEditMode(true);
    setFormData({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga.toString(),
      stok: item.stok.toString(),
      gambar: item.gambar,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus menu ini?")) {
      await fetch(`http://localhost:5000/api/menus/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const handleSubmit = async () => {
    const url = isEditMode
      ? `http://localhost:5000/api/menus/${formData.id}`
      : "http://localhost:5000/api/menus";
    const method = isEditMode ? "PUT" : "POST";
    const payload = {
      ...formData,
      gambar: formData.gambar || "https://placehold.co/600x400?text=No+Img",
    };
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowModal(false);
    fetchData();
    alert(isEditMode ? "Menu Diupdate!" : "Menu Ditambahkan!");
  };

  const handleConfirmOrder = async (id: number) => {
    if (confirm("Konfirmasi pesanan ini sudah diambil/selesai?")) {
      try {
        await fetch(`http://localhost:5000/api/pesanan/${id}`, { method: "PUT" });
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="d-flex">
      <nav className="sidebar d-flex flex-column">
        <div className="mb-5 text-center">
          <h4 className="fw-bold m-0">Admin Panel</h4>
          <small className="text-muted">Kedai Kirana</small>
        </div>
        
        <div className="flex-grow-1">
          <a
            href="#"
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </a>
          <a
            href="#"
            className={`nav-link ${activeTab === "produk" ? "active" : ""}`}
            onClick={() => setActiveTab("produk")}
          >
            🍔 Menu Produk
          </a>
          <a
            href="#"
            className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 Daftar Pesanan
          </a>

          {/* LINK KE WEB PELANGGAN (Update Terbaru) */}
          <hr className="border-secondary my-3" />
          <Link href="/menu" target="_blank" className="nav-link text-info">
            📱 Lihat Web Pelanggan
          </Link>
        </div>

        <button onClick={handleLogout} className="btn btn-outline-danger w-100 mt-4">
          Logout
        </button>
      </nav>

      <main className="main-content w-100">
        
        {/* DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <>
            <h2 className="fw-bold mb-4 text-dark">Dashboard Statistik</h2>
            <Row className="mb-4 g-4">
              <Col md={4}>
                <div className="stat-card p-4 text-center">
                  <h6 className="text-muted mb-2">Total Produk</h6>
                  <h2 className="fw-bold text-dark m-0">{stats.totalProduk}</h2>
                </div>
              </Col>
              <Col md={4}>
                <div className="stat-card p-4 text-center">
                  <h6 className="text-muted mb-2">Total Pesanan</h6>
                  <h2 className="fw-bold text-dark m-0">{stats.totalPesanan}</h2>
                </div>
              </Col>
              <Col md={4}>
                <div className="stat-card p-4 text-center">
                  <h6 className="text-muted mb-2">Pendapatan</h6>
                  <h2 className="fw-bold text-success m-0">
                    Rp {stats.totalPendapatan.toLocaleString()}
                  </h2>
                </div>
              </Col>
            </Row>
            <Row className="g-4">
              <Col lg={8}>
                <div className="chart-card">
                  <h5 className="fw-bold mb-4">Grafik Penjualan</h5>
                  <div style={{ height: "350px" }}>
                    <Bar
                      data={barData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="chart-card">
                  <h5 className="fw-bold mb-4">Kategori</h5>
                  <div
                    style={{
                      height: "250px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Doughnut
                      data={pieData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {/* PRODUK VIEW */}
        {activeTab === "produk" && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold text-dark">Kelola Menu</h2>
              <Button variant="success" onClick={openAddModal}>
                + Tambah Menu Baru
              </Button>
            </div>
            <div className="stat-card p-0 overflow-hidden">
              <Table responsive hover className="table-custom m-0 align-middle">
                <thead>
                  <tr>
                    <th className="ps-4">Foto</th>
                    <th>Nama & Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th className="text-end pe-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <img src={item.gambar} className="table-img" />
                      </td>
                      <td>
                        <div className="fw-bold">{item.nama}</div>
                        <span
                          className={`badge ${
                            item.kategori === "makanan"
                              ? "bg-warning text-dark"
                              : "bg-success"
                          } small mt-1`}
                        >
                          {item.kategori.toUpperCase()}
                        </span>
                      </td>
                      <td className="fw-bold text-secondary">
                        Rp {item.harga.toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.stok <= 0 ? "bg-danger" : "bg-secondary"
                          } px-3 py-2`}
                        >
                          {item.stok}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2 fw-bold"
                          onClick={() => openEditModal(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="fw-bold"
                          onClick={() => handleDelete(item.id)}
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}

        {/* ORDERS VIEW */}
        {activeTab === "orders" && (
          <>
            <h2 className="fw-bold mb-4 text-dark">Daftar Pesanan Masuk</h2>
            <div className="stat-card p-0 overflow-hidden">
              <Table responsive hover className="table-custom m-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3">Pelanggan</th>
                    <th>Menu Dipesan</th>
                    <th>Total</th>
                    <th>Pembayaran</th>
                    <th>Waktu</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        Belum ada pesanan.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="ps-4 fw-bold text-primary">
                          {order.nama_pelanggan || "Tanpa Nama"}
                        </td>
                        <td>{order.nama_menu}</td>
                        <td className="fw-bold">
                          Rp {order.harga.toLocaleString()}
                        </td>
                        <td>
                          <Badge bg="info" className="text-dark">
                            {order.metode_pembayaran || "Cash"}
                          </Badge>
                        </td>
                        <td className="small text-muted">
                          {new Date(order.tanggal).toLocaleString()}
                        </td>
                        <td>
                          {order.status === "Selesai" ? (
                            <Badge bg="success">Selesai</Badge>
                          ) : (
                            <Badge bg="warning" className="text-dark">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          {order.status !== "Selesai" && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              ✓ Konfirmasi
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </main>

      {/* MODAL FORM */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {isEditMode ? "Edit Menu" : "Tambah Menu"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">Nama Makanan</Form.Label>
              <Form.Control
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Kategori</Form.Label>
                  <Form.Select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori: e.target.value })
                    }
                  >
                    <option value="makanan">🍛 Makanan</option>
                    <option value="minuman">🥤 Minuman</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Harga (Rp)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.harga}
                    onChange={(e) =>
                      setFormData({ ...formData, harga: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Stok</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.stok}
                    onChange={(e) =>
                      setFormData({ ...formData, stok: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Gambar</Form.Label>
                  <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>
              </Col>
            </Row>
            {formData.gambar && (
              <div className="text-center mt-2 p-3 bg-light rounded border">
                <img
                  src={formData.gambar}
                  style={{ maxHeight: "150px", borderRadius: "8px" }}
                />
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}