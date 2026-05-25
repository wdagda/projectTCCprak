import React, { useState, useEffect } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const API_URL = 'http://34.128.121.83:3001/api';

function Sidebar() {
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="brand">Asset Admin</div>
      <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
      <Link to="/assets" className={`nav-link ${location.pathname === '/assets' ? 'active' : ''}`}>Manajemen Aset</Link>
      <Link to="/borrowings" className={`nav-link ${location.pathname === '/borrowings' ? 'active' : ''}`}>Log Peminjaman</Link>
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
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', serial_number: '', CategoryId: 1 });
  const [editingAsset, setEditingAsset] = useState(null);
  const [assigningAsset, setAssigningAsset] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchAssets();
    axios.get(`${API_URL}/users`).then(res => setUsers(res.data));
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
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
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

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/borrowings" element={<Borrowings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
