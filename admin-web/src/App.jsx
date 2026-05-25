import React, { useState, useEffect } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const API_URL = 'http://34.128.121.83:3001/api';

function Sidebar() {
  const location = useLocation();
  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div>
        <div className="brand">Asset Admin</div>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/assets" className={`nav-link ${location.pathname === '/assets' ? 'active' : ''}`}>Manajemen Aset</Link>
        <Link to="/borrowings" className={`nav-link ${location.pathname === '/borrowings' ? 'active' : ''}`}>Log Peminjaman</Link>
        <Link to="/users" className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}>Daftar Pengguna</Link>
        <Link to="/account" className={`nav-link ${location.pathname === '/account' ? 'active' : ''}`}>Akun Saya</Link>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegister) {
      axios.post(`${API_URL}/auth/register`, { name, email, password, role }).then(res => {
        const user = res.data.user;
        if (user.role === 'admin') {
          onLogin(user);
        } else {
          setSuccessMsg('Akun Employee berhasil dibuat! Silakan gunakan Mobile App untuk login.');
          setIsRegister(false);
          setEmail('');
          setPassword('');
        }
      }).catch(err => {
        setError(err.response?.data?.error || 'Gagal mendaftar.');
      });
    } else {
      axios.post(`${API_URL}/auth/login`, { email, password }).then(res => {
        const user = res.data.user;
        if (user.role !== 'admin') {
          setError('Aplikasi ini khusus Admin. Silakan gunakan Mobile App');
          return;
        }
        onLogin(user);
      }).catch(err => {
        setError('Login gagal. Periksa email & password.');
      });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', padding: '2rem' }}>
      <div className="card" style={{ width: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{isRegister ? 'Sign Up' : 'Admin Login'}</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        {successMsg && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input type="text" required className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" required className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Role Akses</label>
              <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
                <option value="admin">Administrator (Akses Web)</option>
                <option value="employee">Employee (Akses Mobile)</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn" style={{ width: '100%', marginBottom: '1rem' }}>
            {isRegister ? 'Daftar Sekarang' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => {
            setIsRegister(!isRegister);
            setError('');
            setSuccessMsg('');
          }}>
            {isRegister ? 'Login di sini' : 'Sign Up'}
          </span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, borrowed: 0, available: 0, maintenance: 0 });
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/assets`).then(res => {
      const assets = res.data;
      setStats({
        total: assets.length,
        borrowed: assets.filter(a => a.status === 'borrowed').length,
        available: assets.filter(a => a.status === 'available').length,
        maintenance: assets.filter(a => a.status === 'maintenance').length
      });
    });

    axios.get(`${API_URL}/borrowings`).then(res => {
      // Sort newest first
      const sortedLogs = res.data.sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date));
      setRecentLogs(sortedLogs.slice(0, 5));
    });
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <h3 className="form-label">Total Aset</h3>
          <h2 style={{ fontSize: '2.5rem' }}>{stats.total}</h2>
        </div>
        <div className="card">
          <h3 className="form-label">Aset Tersedia</h3>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>{stats.available}</h2>
        </div>
        <div className="card">
          <h3 className="form-label">Aset Dipinjam</h3>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>{stats.borrowed}</h2>
        </div>
        <div className="card">
          <h3 className="form-label">Maintenance</h3>
          <h2 style={{ fontSize: '2.5rem', color: '#f59e0b' }}>{stats.maintenance}</h2>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Peminjaman Terbaru</h2>
        <div className="table-container" style={{ boxShadow: 'none', margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Aset (SN)</th>
                <th>Karyawan ID</th>
                <th>Status</th>
                <th>Tgl Pinjam</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length > 0 ? recentLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.Asset?.name || log.asset_id}</td>
                  <td>{log.User?.name || log.user_id}</td>
                  <td><span className={`status-badge status-${log.status}`}>{log.status}</span></td>
                  <td>{new Date(log.borrow_date).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Belum ada data peminjaman
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Assets() {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', serial_number: '', CategoryId: 1 });
  const [editingAsset, setEditingAsset] = useState(null);
  const [assigningAsset, setAssigningAsset] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchAssets();
    axios.get(`${API_URL}/users`).then(res => setUsers(res.data));
    axios.get(`${API_URL}/categories`).then(res => {
      setCategories(res.data);
      if (res.data.length > 0) {
        setNewAsset(prev => ({ ...prev, CategoryId: res.data[0].id }));
      }
    });
  }, []);

  const fetchAssets = () => {
    axios.get(`${API_URL}/assets`).then(res => setAssets(res.data));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/assets`, newAsset).then(() => {
      setShowModal(false);
      setNewAsset({ name: '', serial_number: '', CategoryId: 1 });
      fetchAssets();
    }).catch(err => {
      alert("Gagal menyimpan aset. Pastikan Serial Number unik!");
      console.error(err);
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios.put(`${API_URL}/assets/${editingAsset.id}`, editingAsset).then(() => {
      setEditingAsset(null);
      fetchAssets();
    });
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId) return alert("Pilih karyawan!");
    axios.post(`${API_URL}/borrowings`, {
      asset_id: assigningAsset.id,
      user_id: parseInt(selectedUserId),
      status: 'pending'
    }).then(() => {
      setAssigningAsset(null);
      setSelectedUserId('');
      alert("Aset berhasil ditugaskan!");
      fetchAssets();
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Manajemen Aset</h1>
        <button className="btn" onClick={() => setShowModal(true)}>+ Tambah Aset</button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Nama Perangkat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <tr key={asset.id}>
                <td>{asset.serial_number}</td>
                <td>{asset.name}</td>
                <td><span className={`status-badge status-${asset.status}`}>{asset.status}</span></td>
                <td>
                  <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => setEditingAsset(asset)}>Edit</button>
                  {asset.status === 'available' && (
                    <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'var(--success)' }} onClick={() => setAssigningAsset(asset)}>Assign</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: '1.5rem' }}>Tambah Aset Baru</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Nama Perangkat</label>
                <input className="form-input" required value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input className="form-input" required value={newAsset.serial_number} onChange={e => setNewAsset({ ...newAsset, serial_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-input" value={newAsset.CategoryId} onChange={e => setNewAsset({ ...newAsset, CategoryId: parseInt(e.target.value) })}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingAsset && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Aset</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Perangkat</label>
                <input className="form-input" required value={editingAsset.name} onChange={e => setEditingAsset({ ...editingAsset, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input className="form-input" required value={editingAsset.serial_number} onChange={e => setEditingAsset({ ...editingAsset, serial_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={editingAsset.status} onChange={e => setEditingAsset({ ...editingAsset, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-danger" onClick={() => setEditingAsset(null)}>Batal</button>
                <button type="submit" className="btn">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assigningAsset && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: '1.5rem' }}>Tugaskan Aset</h2>
            <div className="asset-card" style={{ marginBottom: '1rem' }}>
              <div className="asset-title">{assigningAsset.name}</div>
              <div className="asset-meta">SN: {assigningAsset.serial_number}</div>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Pilih Karyawan</label>
                <select className="form-input" required value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {users.filter(u => u.role === 'employee').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.Department?.name || 'No Dept'}) - {u.email}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-danger" onClick={() => setAssigningAsset(null)}>Batal</button>
                <button type="submit" className="btn">Tugaskan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Borrowings() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/borrowings`).then(res => setLogs(res.data));
  }, []);

  return (
    <div>
      <h1 className="page-title">Log Peminjaman</h1>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID Pinjam</th>
              <th>Aset (SN)</th>
              <th>Karyawan ID</th>
              <th>Status</th>
              <th>Tgl Pinjam</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>#{log.id}</td>
                <td>{log.Asset?.name || log.asset_id}</td>
                <td>{log.User?.name || log.user_id}</td>
                <td><span className={`status-badge status-${log.status}`}>{log.status}</span></td>
                <td>{new Date(log.borrow_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/users`).then(res => setUsers(res.data));
  }, []);

  return (
    <div>
      <h1 className="page-title">Daftar Pengguna</h1>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Lengkap</th>
              <th>Email</th>
              <th>Role</th>
              <th>Departemen</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`status-badge status-${u.role === 'admin' ? 'success' : 'available'}`}>{u.role}</span></td>
                <td>{u.Department?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Account({ adminUser, setAdminUser, onLogout }) {
  const [name, setName] = useState(adminUser.name);
  const [email, setEmail] = useState(adminUser.email);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`${API_URL}/users/${adminUser.id}`, { name, email, password }).then(res => {
      const updatedUser = res.data.user;
      setAdminUser(updatedUser);
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      setMessage('Profil berhasil diperbarui!');
      setPassword('');
    }).catch(err => {
      setMessage('Gagal memperbarui profil.');
    });
  };

  return (
    <div>
      <h1 className="page-title">Akun Saya</h1>
      <div className="card" style={{ maxWidth: '500px', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Detail Profil</h2>
        {message && <div style={{ marginBottom: '1rem', color: message.includes('Gagal') ? 'red' : 'var(--success)' }}>{message}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input type="text" className="form-input" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password Baru (Opsional)</label>
            <input type="password" className="form-input" placeholder="Isi untuk mengganti password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginBottom: '1.5rem' }}>Simpan Perubahan</button>
        </form>

        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
        
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--danger)' }}>Sesi</h2>
        <button className="btn btn-danger" style={{ width: '100%' }} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

function App() {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user) => {
    setAdminUser(user);
    localStorage.setItem('adminUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  if (!adminUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/borrowings" element={<Borrowings />} />
            <Route path="/users" element={<Users />} />
            <Route path="/account" element={<Account adminUser={adminUser} setAdminUser={setAdminUser} onLogout={handleLogout} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
