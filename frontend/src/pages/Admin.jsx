import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Tag, ShoppingBag, Users, Loader2,
  Plus, Trash2, ShieldCheck, ShieldOff, Power, DollarSign,
  Package, TrendingUp, Percent, Euro,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user, authHeader, API, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: '/admin' } });
      return;
    }
    if (!user.is_admin) {
      navigate('/account');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user || !user.is_admin) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { key: 'promos', label: 'Promo codes', Icon: Tag },
    { key: 'orders', label: 'Orders', Icon: ShoppingBag },
    { key: 'users', label: 'Users', Icon: Users },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Admin</p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
            Control Panel
          </h1>
          <p className="mt-2 text-sm text-neutral-500">Signed in as {user.email}</p>
        </header>

        <div className="flex flex-wrap gap-2 mb-8 bg-white border border-neutral-200 p-2">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[12px] uppercase tracking-widest font-semibold transition-colors ${
                tab === key ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && <Dashboard API={API} authHeader={authHeader} />}
        {tab === 'promos' && <Promos API={API} authHeader={authHeader} />}
        {tab === 'orders' && <Orders API={API} authHeader={authHeader} />}
        {tab === 'users' && <UsersTab API={API} authHeader={authHeader} me={user} />}
      </div>
    </div>
  );
};

// -------- Dashboard --------
const StatCard = ({ label, value, Icon, hint }) => (
  <div className="bg-white border border-neutral-200 p-6">
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-widest text-neutral-500">{label}</p>
      <Icon className="w-4 h-4 text-neutral-400" />
    </div>
    <p className="mt-3 text-3xl font-black tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>{value}</p>
    {hint && <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>}
  </div>
);

const Dashboard = ({ API, authHeader }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/admin/stats`, { headers: authHeader() });
        setStats(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [API, authHeader]);

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;
  if (!stats) return <div className="text-sm text-neutral-500">Could not load stats.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} Icon={DollarSign} hint="All paid orders" />
        <StatCard label="Paid orders" value={stats.paid_orders} Icon={Package} hint={`${stats.total_orders} total`} />
        <StatCard label="Avg order" value={`$${stats.avg_order_value.toFixed(2)}`} Icon={TrendingUp} />
        <StatCard label="Users" value={stats.total_users} Icon={Users} />
      </div>

      <div className="bg-white border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-4">Top selling products</h2>
        {stats.top_products.length === 0 ? (
          <p className="text-sm text-neutral-500">No paid orders yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.top_products.map((p, i) => (
              <div key={p.product_id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-sm font-medium">{p.title}</span>
                </div>
                <span className="text-sm text-neutral-600">{p.qty} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// -------- Promos --------
const Promos = ({ API, authHeader }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', max_uses: '', expires_at: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/promos`, { headers: authHeader() });
      setItems(res.data.items || []);
    } finally {
      setLoading(false);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: parseFloat(form.value),
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        active: true,
      };
      await axios.post(`${API}/admin/promos`, payload, { headers: authHeader() });
      setForm({ code: '', type: 'percent', value: '', max_uses: '', expires_at: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (code) => {
    if (!window.confirm(`Delete promo code ${code}?`)) return;
    await axios.delete(`${API}/admin/promos/${code}`, { headers: authHeader() });
    load();
  };

  const toggle = async (code) => {
    await axios.patch(`${API}/admin/promos/${code}/toggle`, {}, { headers: authHeader() });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest">All promo codes ({items.length})</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 bg-black text-white uppercase text-[11px] tracking-widest font-semibold px-4 py-2.5 hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New code
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-neutral-200 p-6 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest font-semibold">Code</label>
            <input required minLength={2} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black" placeholder="SUMMER20" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest font-semibold">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black bg-white">
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount ($)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest font-semibold">Value {form.type === 'percent' ? '(%)' : '($)'}</label>
            <input required type="number" min={0.01} step={0.01} max={form.type === 'percent' ? 100 : undefined}
              value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black" placeholder={form.type === 'percent' ? '20' : '5.00'} />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest font-semibold">Max uses (optional)</label>
            <input type="number" min={1} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black" placeholder="100" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] uppercase tracking-widest font-semibold">Expires at (optional)</label>
            <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black" />
          </div>
          {error && <div className="md:col-span-2 text-xs text-red-600 border border-red-200 bg-red-50 p-3">{error}</div>}
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" disabled={submitting}
              className="bg-black text-white uppercase text-[12px] tracking-widest font-semibold px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-neutral-300 uppercase text-[12px] tracking-widest font-semibold px-6 py-3 hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          No promo codes yet. Create your first one.
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-widest text-neutral-500">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Uses</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.code} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-mono font-semibold">{p.code}</td>
                  <td className="px-4 py-3 flex items-center gap-1">
                    {p.type === 'percent' ? <Percent className="w-3 h-3" /> : <Euro className="w-3 h-3" />}
                    {p.value}{p.type === 'percent' ? '%' : '$'}
                  </td>
                  <td className="px-4 py-3">{p.uses || 0}{p.max_uses ? ` / ${p.max_uses}` : ''}</td>
                  <td className="px-4 py-3 text-neutral-600">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 uppercase tracking-widest font-semibold ${p.active ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'}`}>
                      {p.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggle(p.code)} className="p-2 text-neutral-500 hover:text-black" title="Toggle">
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(p.code)} className="p-2 text-neutral-500 hover:text-red-600" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// -------- Orders --------
const Orders = ({ API, authHeader }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/admin/orders`, { headers: authHeader() });
        setItems(res.data.items || []);
      } finally { setLoading(false); }
    })();
  }, [API, authHeader]);

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;

  return (
    <div className="bg-white border border-neutral-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-[11px] uppercase tracking-widest text-neutral-500">
          <tr>
            <th className="text-left px-4 py-3">Date</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Items</th>
            <th className="text-left px-4 py-3">Amount</th>
            <th className="text-left px-4 py-3">Promo</th>
            <th className="text-left px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-500">No orders yet.</td></tr>
          )}
          {items.map((o) => (
            <tr key={o.id} className="border-t border-neutral-100">
              <td className="px-4 py-3 text-neutral-600">{new Date(o.created_at).toLocaleString()}</td>
              <td className="px-4 py-3">{o.email || <span className="text-neutral-400">guest</span>}</td>
              <td className="px-4 py-3">{(o.items || []).reduce((s, i) => s + i.quantity, 0)}</td>
              <td className="px-4 py-3 font-semibold">${o.amount?.toFixed(2)}</td>
              <td className="px-4 py-3 text-neutral-500">{o.promo_code || '—'}</td>
              <td className="px-4 py-3">
                <span className={`text-[10px] px-2 py-1 uppercase tracking-widest font-semibold ${
                  o.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  o.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-neutral-200 text-neutral-600'
                }`}>
                  {o.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// -------- Users --------
const UsersTab = ({ API, authHeader, me }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/users`, { headers: authHeader() });
      setItems(res.data.items || []);
    } finally {
      setLoading(false);
    }
  }, [API, authHeader]);

  useEffect(() => {
    load();
  }, [load]);

  const promote = async (id) => {
    await axios.post(`${API}/admin/users/${id}/promote`, {}, { headers: authHeader() });
    load();
  };
  const demote = async (id) => {
    if (!window.confirm('Remove admin access from this user?')) return;
    try {
      await axios.post(`${API}/admin/users/${id}/demote`, {}, { headers: authHeader() });
      load();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Failed');
    }
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;

  return (
    <div className="bg-white border border-neutral-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-[11px] uppercase tracking-widest text-neutral-500">
          <tr>
            <th className="text-left px-4 py-3">Signed up</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Role</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-t border-neutral-100">
              <td className="px-4 py-3 text-neutral-600">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{u.name || <span className="text-neutral-400">—</span>}</td>
              <td className="px-4 py-3">
                {u.is_admin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 uppercase tracking-widest font-semibold bg-black text-white">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500">Customer</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {u.id === me.id ? <span className="text-[10px] text-neutral-400 uppercase">You</span> :
                  u.is_admin ? (
                    <button onClick={() => demote(u.id)} className="text-xs text-neutral-500 hover:text-red-600 uppercase tracking-widest inline-flex items-center gap-1">
                      <ShieldOff className="w-3 h-3" /> Remove admin
                    </button>
                  ) : (
                    <button onClick={() => promote(u.id)} className="text-xs text-neutral-500 hover:text-black uppercase tracking-widest inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Make admin
                    </button>
                  )
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
