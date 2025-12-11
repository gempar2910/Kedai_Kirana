"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Navbar,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Modal,
  Form,
  Table,
  InputGroup,
} from "react-bootstrap";
import Link from "next/link";

interface Menu {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  gambar: string;
}

interface CartItem extends Menu {
  qty: number;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  
  // Checkout State
  const [showCartModal, setShowCartModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tunai (Cash)");
  const [customerName, setCustomerName] = useState("");

  const fetchMenus = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/menus");
      const data = await res.json();
      setMenus(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMenus();
    const interval = setInterval(fetchMenus, 2000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (item: Menu) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === item.id);
      if (existing) {
        if (existing.qty < item.stok) {
          return prevCart.map((c) =>
            c.id === item.id ? { ...c, qty: c.qty + 1 } : c
          );
        } else {
          alert("Stok tidak mencukupi!");
          return prevCart;
        }
      } else {
        return [...prevCart, { ...item, qty: 1 }];
      }
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          const originalItem = menus.find((m) => m.id === id);
          const maxStock = originalItem ? originalItem.stok : item.stok;
          if (newQty < 1) return item;
          if (newQty > maxStock) return item;
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const getTotalHarga = () => cart.reduce((total, item) => total + item.harga * item.qty, 0);
  const getTotalItem = () => cart.reduce((total, item) => total + item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) return alert("Mohon isi Nama Pemesan!");

    const itemsToSend = cart.map((item) => ({ id: item.id, qty: item.qty }));

    try {
      const res = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            items: itemsToSend, 
            metode: paymentMethod,
            nama_pelanggan: customerName 
        }),
      });
      const result = await res.json();
      
      if (res.ok) {
        alert(`Terima kasih kak ${customerName}!\nPembayaran Berhasil.\n\nSilakan pesanan diambil di kedai ya!`);
        setCart([]);
        setCustomerName("");
        setShowCartModal(false);
        fetchMenus();
      } else {
        alert("Gagal: " + result.msg);
      }
    } catch (error) { console.error(error); alert("Terjadi kesalahan koneksi."); }
  };

  const filteredMenus = menus.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "all" || item.kategori === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ backgroundColor: "#fffbeb", minHeight: "100vh" }}> {/* Latar Cream Hangat */}
      
      {/* NAVBAR */}
      <Navbar className="shadow-sm sticky-top" style={{ backgroundColor: "#ffffff" }}>
        <Container>
          <Navbar.Brand className="fw-bold d-flex align-items-center gap-2 text-dark" as="span">
             <span className="material-symbols-outlined text-warning" style={{fontSize: '2rem'}}>local_dining</span>
             <span style={{color: '#d35400'}}>Kedai Kirana</span>
          </Navbar.Brand>
          
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="outline-warning" size="sm" className="d-flex align-items-center gap-2 px-3 rounded-pill text-dark fw-bold border-2">
              <span className="material-symbols-outlined">home</span>
              Home
            </Button>
          </Link>
        </Container>
      </Navbar>

      {/* HERO BANNER KECIL */}
      <div className="text-center py-5 mb-4" style={{ background: "linear-gradient(135deg, #fce38a 0%, #f38181 100%)", borderRadius: "0 0 30px 30px" }}>
        <Container>
          <h2 className="fw-bold text-white text-shadow display-5">Mau Makan Apa Hari Ini?</h2>
          <p className="text-white fs-5 fw-light">Pesan makanan favoritmu, kami siapkan dengan cinta 🧡</p>
        </Container>
      </div>

      <Container className="pb-5 mb-5">
        
        {/* SEARCH & FILTER */}
        <Row className="justify-content-center mb-5">
          <Col md={8}>
            <InputGroup className="mb-4 shadow-sm rounded-pill overflow-hidden bg-white">
              <InputGroup.Text className="bg-white border-0 ps-4 text-warning">
                <span className="material-symbols-outlined">search</span>
              </InputGroup.Text>
              <Form.Control
                placeholder="Cari Nasi Goreng, Es Teh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 shadow-none"
                style={{ fontSize: '1.1rem', padding: '15px' }}
              />
            </InputGroup>
            
            <div className="d-flex justify-content-center gap-3">
              <Button 
                className={`rounded-pill px-4 fw-bold ${filterCategory === 'all' ? 'btn-active-dark' : 'btn-outline-custom-dark'}`}
                onClick={() => setFilterCategory('all')}
              >
                Semua
              </Button>
              <Button 
                className={`rounded-pill px-4 fw-bold ${filterCategory === 'makanan' ? 'btn-active-food' : 'btn-outline-custom-food'}`}
                onClick={() => setFilterCategory('makanan')}
              >
                🍛 Makanan
              </Button>
              <Button 
                className={`rounded-pill px-4 fw-bold ${filterCategory === 'minuman' ? 'btn-active-drink' : 'btn-outline-custom-drink'}`}
                onClick={() => setFilterCategory('minuman')}
              >
                🥤 Minuman
              </Button>
            </div>
          </Col>
        </Row>

        {/* GRID MENU */}
        <Row className="g-4">
          {filteredMenus.map((item) => {
            const itemInCart = cart.find((c) => c.id === item.id);
            const qtyInCart = itemInCart ? itemInCart.qty : 0;
            const realStock = item.stok - qtyInCart;

            return (
              <Col key={item.id} md={4} sm={6} xs={12}>
                <Card className="menu-card h-100 border-0 shadow-sm">
                  <div className="img-wrapper">
                    <img src={item.gambar} alt={item.nama} className="menu-img" />
                    <Badge 
                      className={`badge-overlay shadow-sm ${item.kategori === 'makanan' ? 'bg-warning text-dark' : 'bg-success text-white'}`}
                    >
                      {item.kategori}
                    </Badge>
                  </div>
                  <Card.Body className="d-flex flex-column p-4">
                    <Card.Title className="fw-bold mb-1 text-dark" style={{fontSize: '1.2rem'}}>{item.nama}</Card.Title>
                    <h4 className="fw-bold mb-3" style={{color: '#d35400'}}>Rp {item.harga.toLocaleString()}</h4>
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-light">
                         <small className={`fw-bold ${realStock <= 0 ? "text-danger" : "text-muted"}`}>
                            {realStock > 0 ? `Sisa Stok: ${realStock}` : "Habis Terjual"}
                         </small>
                         {qtyInCart > 0 && <Badge bg="danger" className="text-white px-3 py-2 rounded-pill">{qtyInCart} di keranjang</Badge>}
                      </div>
                      <Button 
                        variant={realStock > 0 ? "warning" : "secondary"} 
                        className={`w-100 py-2 fw-bold rounded-pill text-white shadow-sm btn-order ${realStock <= 0 ? 'disabled' : ''}`} 
                        disabled={realStock <= 0} 
                        onClick={() => addToCart(item)}
                      >
                        {realStock > 0 ? "+ Tambah Pesanan" : "Stok Habis"}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>

      {/* FLOATING CART BUTTON */}
      {cart.length > 0 && (
        <div className="fixed-bottom p-4 d-flex justify-content-center" style={{zIndex: 1050}}>
          <Button 
            className="shadow-lg rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-4 border-4 border-white cart-floating-btn"
            onClick={() => setShowCartModal(true)}
            style={{ minWidth: "350px", justifyContent: "space-between", background: "linear-gradient(45deg, #ff9966, #ff5e62)", border: "none" }}
          >
            <div className="d-flex align-items-center gap-3">
              <span className="bg-white text-danger rounded-circle d-flex align-items-center justify-content-center" style={{width:'40px', height:'40px'}}>
                <span className="material-symbols-outlined">shopping_cart</span>
              </span>
              <div className="text-start text-white" style={{ lineHeight: "1.2" }}>
                <div style={{ fontSize: "1rem" }}>{getTotalItem()} Item</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Lihat Keranjang</div>
              </div>
            </div>
            <span className="text-white fs-5">{getTotalHarga().toLocaleString()}</span>
          </Button>
        </div>
      )}

      {/* MODAL CHECKOUT */}
      <Modal show={showCartModal} onHide={() => setShowCartModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-warning text-dark border-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">shopping_basket</span> 
            Keranjang Pesanan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          {cart.length === 0 ? <p className="text-center py-4 text-muted">Keranjang kosong, yuk pesan dulu!</p> : (
            <>
              <Table responsive className="align-middle table-borderless bg-white rounded shadow-sm">
                <thead className="bg-light border-bottom"><tr><th className="ps-4">Menu</th><th>Harga</th><th className="text-center">Qty</th><th>Subtotal</th><th></th></tr></thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4"><div className="fw-bold text-dark">{item.nama}</div></td>
                      <td className="text-muted">Rp {item.harga.toLocaleString()}</td>
                      <td>
                        <div className="d-flex justify-content-center align-items-center gap-2 bg-light rounded-pill p-1 border" style={{width:'fit-content', margin:'0 auto'}}>
                          <Button size="sm" variant="light" className="rounded-circle shadow-none border-0 text-danger fw-bold" onClick={() => updateQty(item.id, -1)} style={{width:'30px', height:'30px'}}>-</Button>
                          <span className="fw-bold mx-2">{item.qty}</span>
                          <Button size="sm" variant="light" className="rounded-circle shadow-none border-0 text-success fw-bold" onClick={() => updateQty(item.id, 1)} style={{width:'30px', height:'30px'}}>+</Button>
                        </div>
                      </td>
                      <td className="fw-bold text-primary">Rp {(item.harga * item.qty).toLocaleString()}</td>
                      <td><Button size="sm" variant="outline-danger" className="border-0 rounded-circle" onClick={() => removeFromCart(item.id)}><span className="material-symbols-outlined" style={{fontSize:'1.2rem'}}>delete</span></Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="bg-white p-4 rounded-4 shadow-sm mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 text-muted">Total Bayar</h5>
                    <h3 className="mb-0 text-danger fw-bold">Rp {getTotalHarga().toLocaleString()}</h3>
                </div>
                <hr className="my-4"/>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">Nama Pemesan <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" placeholder="Masukkan nama Anda..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="py-3 border-2 rounded-3" autoFocus />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">Metode Pembayaran</Form.Label>
                    <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="py-3 border-2 rounded-3">
                    <option value="Tunai (Cash)">💵 Tunai (Cash)</option>
                    <option value="QRIS">📱 QRIS / E-Wallet</option>
                    </Form.Select>
                </Form.Group>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light border-0">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowCartModal(false)}>Tambah Lagi</Button>
          <Button variant="success" size="lg" className="px-5 fw-bold rounded-pill shadow-sm" onClick={handleCheckout} disabled={cart.length === 0} style={{background: "linear-gradient(to right, #11998e, #38ef7d)", border: "none"}}>Pesan Sekarang</Button>
        </Modal.Footer>
      </Modal>

      {/* CUSTOM CSS DI DALAM FILE */}
      <style jsx global>{`
        /* Card & Image Styling */
        .menu-card { transition: all 0.3s ease; border-radius: 20px; overflow: hidden; }
        .menu-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
        
        .img-wrapper { height: 200px; position: relative; overflow: hidden; background: #f0f0f0; }
        .menu-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .menu-card:hover .menu-img { transform: scale(1.1); }
        
        .badge-overlay { position: absolute; top: 15px; right: 15px; padding: 8px 15px; border-radius: 30px; font-size: 0.8rem; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

        /* Button Order */
        .btn-order { background: linear-gradient(to right, #f2994a, #f2c94c); border: none; }
        .btn-order:hover { background: linear-gradient(to right, #e67e22, #f1c40f); transform: scale(1.02); }

        /* Filter Buttons Custom */
        .btn-active-dark { background-color: #343a40; color: white; border: 2px solid #343a40; }
        .btn-outline-custom-dark { background-color: transparent; color: #343a40; border: 2px solid #343a40; }
        .btn-outline-custom-dark:hover { background-color: #343a40; color: white; }

        .btn-active-food { background-color: #ffc107; color: #000; border: 2px solid #ffc107; }
        .btn-outline-custom-food { background-color: transparent; color: #d35400; border: 2px solid #ffc107; }
        .btn-outline-custom-food:hover { background-color: #ffc107; color: #000; }

        .btn-active-drink { background-color: #28a745; color: white; border: 2px solid #28a745; }
        .btn-outline-custom-drink { background-color: transparent; color: #28a745; border: 2px solid #28a745; }
        .btn-outline-custom-drink:hover { background-color: #28a745; color: white; }

        /* Text Shadow */
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        
        /* Floating Button Animation */
        .cart-floating-btn { transition: transform 0.2s; }
        .cart-floating-btn:hover { transform: scale(1.05); }
      `}</style>
    </div>
  );
}