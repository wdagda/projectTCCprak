import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'http://localhost:3001/api';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    axios.post(`${API_URL}${endpoint}`, formData)
      .then(res => {
        onLogin(res.data.user);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Authentication failed');
      });
  };

  return (
    <div className="mobile-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: '100%', padding: '2rem'}}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h1 style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>AssetApp</h1>
          <p style={{color: 'var(--text-secondary)'}}>{isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'}</p>
        </div>
        
        {error && <div style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Nama Lengkap</label>
              <input required style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)'}} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Email</label>
            <input type="email" required style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)'}} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Password</label>
            <input type="password" required style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)'}} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn" style={{width: '100%'}}>{isLogin ? 'Masuk' : 'Daftar'}</button>
        </form>

        <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem'}}>
          <span style={{color: 'var(--text-secondary)'}}>{isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}</span>
          <a href="#" style={{color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold'}} onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Daftar Sekarang' : 'Masuk'}
          </a>
        </div>
      </div>
    </div>
  );
}

function MainApp({ user, onLogout, onUpdateUser }) {
  const [borrowings, setBorrowings] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: user.name, email: user.email, password: user.password || '' });

  useEffect(() => {
    fetchBorrowings();
  }, [user]);

  const fetchBorrowings = () => {
    axios.get(`${API_URL}/borrowings/user/${user.id}`).then(res => setBorrowings(res.data)).catch(() => {
      setBorrowings([]);
    });
  };

  const handleConfirm = (logId) => {
    axios.put(`${API_URL}/borrowings/${logId}/status`, { status: 'active' }).then(() => {
      axios.post(`${API_URL}/borrowings/${logId}/handover`, {
        terms_agreed: true,
        signature_url: '/dummy-signature.png'
      }).then(() => {
        alert('Serah terima berhasil dikonfirmasi!');
        fetchBorrowings();
        setSelectedLog(null);
      });
    }).catch(err => alert('Error: ' + err.message));
  };

  const handleReturn = (logId) => {
    if (window.confirm("Yakin ingin mengembalikan perangkat ini?")) {
      axios.put(`${API_URL}/borrowings/${logId}/status`, { status: 'returned' }).then(() => {
        alert('Perangkat berhasil dikembalikan!');
        fetchBorrowings();
      }).catch(err => alert('Error: ' + err.message));
    }
  };

  const activeCount = borrowings.filter(b => b.status === 'active').length;
  const pendingCount = borrowings.filter(b => b.status === 'pending').length;

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    axios.put(`${API_URL}/users/${user.id}`, profileData)
      .then(res => {
        onUpdateUser(res.data.user);
        setIsEditingProfile(false);
        alert('Profil berhasil diperbarui!');
      })
      .catch(err => alert('Error: ' + (err.response?.data?.error || err.message)));
  };

  return (
    <div className="mobile-container">
      <div className="header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>My IT Assets</h1>
            <p>Halo, {user.name.split(' ')[0]}</p>
          </div>
          <div>
            <button onClick={() => setIsEditingProfile(true)} style={{background: 'none', border: 'none', color: 'white', textDecoration: 'underline', cursor: 'pointer', zIndex: 10, position: 'relative', marginRight: '1rem'}}>Edit Profil</button>
            <button onClick={onLogout} style={{background: 'none', border: 'none', color: 'white', textDecoration: 'underline', cursor: 'pointer', zIndex: 10, position: 'relative'}}>Logout</button>
          </div>
        </div>
      </div>
      
      {!selectedLog && !isEditingProfile && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Dipinjam</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Menunggu</div>
          </div>
        </div>
      )}

      <div className="content">
        {isEditingProfile ? (
          <div>
            <button className="btn btn-secondary" style={{marginBottom: '1rem', width: 'auto'}} onClick={() => setIsEditingProfile(false)}>← Kembali</button>
            <h2 className="section-title">Edit Profil</h2>
            <form onSubmit={handleProfileSubmit} style={{background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)'}}>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Nama Lengkap</label>
                <input required style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)'}} value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
              </div>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Email</label>
                <input type="email" required style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)'}} value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
              </div>
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Password</label>
                <input type="password" required style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)'}} value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} />
              </div>
              <button type="submit" className="btn" style={{width: '100%'}}>Simpan Perubahan</button>
            </form>
          </div>
        ) : selectedLog ? (
          <div>
            <button className="btn btn-secondary" style={{marginBottom: '1rem', width: 'auto'}} onClick={() => setSelectedLog(null)}>← Kembali</button>
            <h2 className="section-title">Konfirmasi Serah Terima</h2>
            <div className="asset-card">
              <div className="asset-title">{selectedLog.Asset?.name}</div>
              <div className="asset-meta">SN: {selectedLog.Asset?.serial_number}</div>
            </div>
            <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem'}}>
              Dengan menandatangani di bawah ini, saya menyatakan telah menerima perangkat dalam kondisi baik dan setuju dengan kebijakan IT perusahaan.
            </p>
            <div className="signature-pad">
              (Area Tanda Tangan)
            </div>
            <button className="btn" onClick={() => handleConfirm(selectedLog.id)}>Konfirmasi & Terima</button>
          </div>
        ) : (
          <div>
            <h2 className="section-title">Daftar Perangkat Saya</h2>
            {borrowings.length === 0 && <p style={{color: 'var(--text-secondary)'}}>Belum ada perangkat yang dipinjam.</p>}
            {borrowings.map(log => (
              <div className="asset-card" key={log.id}>
                <div className="asset-header">
                  <div>
                    <div className="asset-title">{log.Asset?.name || 'Unknown Asset'}</div>
                    <div className="asset-meta">
                      <span>Tgl Pinjam: {new Date(log.borrow_date).toLocaleDateString()}</span>
                      {log.return_date && <span>Tgl Kembali: {new Date(log.return_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span className={`status status-${log.status}`}>
                    {log.status === 'pending' ? 'Menunggu' : log.status === 'active' ? 'Aktif' : 'Selesai'}
                  </span>
                </div>
                {log.status === 'pending' && (
                  <button className="btn" style={{marginTop: '0.5rem'}} onClick={() => setSelectedLog(log)}>Konfirmasi Terima</button>
                )}
                {log.status === 'active' && (
                  <button className="btn btn-secondary" style={{marginTop: '0.5rem'}} onClick={() => handleReturn(log.id)}>Kembalikan Perangkat</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('appUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('appUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('appUser');
  };

  const handleUpdateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('appUser', JSON.stringify(userData));
  };

  return user ? <MainApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} /> : <Auth onLogin={handleLogin} />;
}

export default App;
