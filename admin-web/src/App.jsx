import React, { useState, useEffect } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const API_URL = 'http://34.128.121.83:3001/api';

function Sidebar({ adminUser }) {
  const location = useLocation();
  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="brand" style={{ marginBottom: '1.5rem' }}>Asset Admin</div>
      {adminUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem', padding: '0 1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {adminUser.name.charAt(0)}
          </div>
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>{adminUser.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Admin</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/assets" className={`nav-link ${location.pathname === '/assets' ? 'active' : ''}`}>Manajemen Aset</Link>
        <Link to="/categories" className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}>Kategori</Link>
        <Link to="/departments" className={`nav-link ${location.pathname === '/departments' ? 'active' : ''}`}>Departemen</Link>
        <Link to="/borrowings" className={`nav-link ${location.pathname === '/borrowings' ? 'active' : ''}`}>Log Peminjaman</Link>
        <Link to="/users" className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}>Daftar Pengguna</Link>
        <Link to="/nosql" className={`nav-link ${location.pathname === '/nosql' ? 'active' : ''}`}>Aktivitas (NeDB)</Link>
        <Link to="/account" className={`nav-link ${location.pathname === '/account' ? 'active' : ''}`}>Akun Saya</Link>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/departments`).then(res => {
      setDepartments(res.data);
      if (res.data.length > 0) setDepartmentId(res.data[0].id);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegister) {
      axios.post(`${API_URL}/auth/register`, { name, email, password, role, DepartmentId: parseInt(departmentId) }).then(res => {
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
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{isRegister ? 'Register' : 'Login Admin'}</h1>
        {error && <p className="error">{error}</p>}
        {successMsg && <p className="success">{successMsg}</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <input className="form-input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="form-input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {isRegister && (
            <>
              <input className="form-input" placeholder="Nama Lengkap" value={name} onChange={e => setName(e.target.value)} required />
              
              <select className="form-input" value={role} onChange={e => setRole(e.target.value)} required style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-dark)' }}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>

              <select className="form-input" value={departmentId} onChange={e => setDepartmentId(e.target.value)} required style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-dark)' }}>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </>
          )}
        </div>

        <button className="btn" type="submit" style={{ width: '100%' }}>{isRegister ? 'Daftar' : 'Login'}</button>
        <p style={{ cursor: 'pointer', textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Register'}
        </p>
      </form>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, borrowed: 0, available: 0, maintenance: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
        <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
          <div>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentTime.toLocaleTimeString('id-ID')}</div>
        </div>
      </div>
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
  const [filterCategoryId, setFilterCategoryId] = useState('all');

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

  const filteredAssets = filterCategoryId === 'all' 
    ? assets 
    : assets.filter(a => a.CategoryId === parseInt(filterCategoryId));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Manajemen Aset</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="form-input" style={{ width: 'auto', margin: 0 }} value={filterCategoryId} onChange={e => setFilterCategoryId(e.target.value)}>
            <option value="all">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn" onClick={() => setShowModal(true)}>+ Tambah Aset</button>
        </div>
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
            {filteredAssets.map(asset => (
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
                <label className="form-label">Kategori</label>
                <select className="form-input" value={editingAsset.CategoryId || ''} onChange={e => setEditingAsset({ ...editingAsset, CategoryId: parseInt(e.target.value) })}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
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

  const fetchLogs = () => {
    axios.get(`${API_URL}/borrowings`).then(res => setLogs(res.data));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const updateStatus = (id, newStatus) => {
    axios.put(`${API_URL}/borrowings/${id}/status`, { status: newStatus })
      .then(() => fetchLogs())
      .catch(err => alert('Gagal update status: ' + err.message));
  };

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
              <th>Tgl Kembali</th>
              <th>Aksi</th>
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
                <td>{log.return_date ? new Date(log.return_date).toLocaleDateString() : '-'}</td>
                <td>
                  <select 
                    value={log.status} 
                    onChange={e => updateStatus(log.id, e.target.value)}
                    style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="active">Aktif</option>
                    <option value="returned">Selesai</option>
                    <option value="lost">Hilang</option>
                  </select>
                </td>
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
  const [departmentId, setDepartmentId] = useState(adminUser.DepartmentId || '');
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/departments`).then(res => setDepartments(res.data));
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`${API_URL}/users/${adminUser.id}`, { name, email, password, DepartmentId: departmentId ? parseInt(departmentId) : null }).then(res => {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {adminUser.name.charAt(0)}
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0, marginBottom: '0.2rem' }}>Akun Saya</h1>
          <div style={{ color: 'var(--text-secondary)' }}>{adminUser.email}</div>
        </div>
      </div>
      <div className="card form-card">
        <h2 className="card-title">Detail Profil</h2>
        {message && <div className={`alert ${message.includes('Gagal') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
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
            <label className="form-label">Departemen</label>
            <select className="form-input" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">-- Pilih Departemen --</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Password Baru (Opsional)</label>
            <input type="password" className="form-input" placeholder="Isi untuk mengganti password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-full">Simpan Perubahan</button>
        </form>

        <hr className="divider" />
        
        <h2 className="card-title text-danger">Sesi</h2>
        <button className="btn btn-danger btn-full" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios.get(`${API_URL}/categories`).then(res => setCategories(res.data));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/categories`, { name, description }).then(() => {
      setName('');
      setDescription('');
      fetchCategories();
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios.put(`${API_URL}/categories/${editingCategory.id}`, { name: editingCategory.name, description: editingCategory.description }).then(() => {
      setEditingCategory(null);
      fetchCategories();
    });
  };

  return (
    <div>
      <h1 className="page-title">Manajemen Kategori</h1>
      <div className="card form-card" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title">Tambah Kategori</h2>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Nama Kategori</label>
            <input className="form-input" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn">Simpan</button>
        </form>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Kategori</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description || '-'}</td>
                <td>
                  <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setEditingCategory(c)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Kategori</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Kategori</label>
                <input className="form-input" required value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <input className="form-input" value={editingCategory.description || ''} onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-danger" onClick={() => setEditingCategory(null)}>Batal</button>
                <button type="submit" className="btn">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [editingDepartment, setEditingDepartment] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = () => {
    axios.get(`${API_URL}/departments`).then(res => setDepartments(res.data));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/departments`, { name }).then(() => {
      setName('');
      fetchDepartments();
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios.put(`${API_URL}/departments/${editingDepartment.id}`, { name: editingDepartment.name }).then(() => {
      setEditingDepartment(null);
      fetchDepartments();
    });
  };

  return (
    <div>
      <h1 className="page-title">Manajemen Departemen</h1>
      <div className="card form-card" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title">Tambah Departemen</h2>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Nama Departemen</label>
            <input className="form-input" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <button type="submit" className="btn">Simpan</button>
        </form>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Departemen</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>
                  <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setEditingDepartment(d)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingDepartment && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Departemen</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Departemen</label>
                <input className="form-input" required value={editingDepartment.name} onChange={e => setEditingDepartment({ ...editingDepartment, name: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-danger" onClick={() => setEditingDepartment(null)}>Batal</button>
                <button type="submit" className="btn">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NoSqlLogs() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [handoverDocs, setHandoverDocs] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/activity-logs`).then(res => setActivityLogs(res.data));
    axios.get(`${API_URL}/handover-docs`).then(res => setHandoverDocs(res.data));
  }, []);

  return (
    <div>
      <h1 className="page-title">Data NoSQL (NeDB)</h1>
      
      <h2 style={{ marginBottom: '1rem' }}>Log Aktivitas</h2>
      <div className="card table-container" style={{ marginBottom: '2rem' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
              <th>User ID</th>
              <th>User Email</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.map(log => (
              <tr key={log._id}>
                <td>{log._id}</td>
                <td><span className="status-badge status-active">{log.action}</span></td>
                <td>{log.user_id}</td>
                <td>{log.user_email}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Dokumen Serah Terima</h2>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Document ID</th>
              <th>Borrow Log ID</th>
              <th>Terms Agreed</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {handoverDocs.map(doc => (
              <tr key={doc._id}>
                <td>{doc._id}</td>
                <td>#{doc.borrow_log_id}</td>
                <td>{doc.terms_agreed ? 'Yes' : 'No'}</td>
                <td>{new Date(doc.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <div className="layout" style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar adminUser={adminUser} />
        <div className="main-content" style={{ flex: 1, padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/borrowings" element={<Borrowings />} />
            <Route path="/users" element={<Users />} />
            <Route path="/nosql" element={<NoSqlLogs />} />
            <Route path="/account" element={<Account adminUser={adminUser} setAdminUser={setAdminUser} onLogout={handleLogout} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
