import { useState, useEffect, FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Calculator, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Leaf, 
  Clock, 
  DollarSign,
  Package,
  Users,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// --- Types ---
interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'client';
}

interface Product {
  id: number;
  name: string;
  unit: string;
}

interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  delivery_date: string;
  status: string;
  product_name: string;
  client_name?: string;
}

interface EfficiencyLog {
  id: number;
  product_name: string;
  price_in_natura: number;
  labor_hours: number;
  waste_percent: number;
  calculated_savings: number;
  created_at: string;
}

// --- Components ---

const Navbar = ({ user, onLogout }: { user: User; onLogout: () => void }) => (
  <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-vitta-green rounded-xl flex items-center justify-center text-white">
        <Leaf size={24} />
      </div>
      <div>
        <h1 className="font-serif text-2xl font-bold text-vitta-green leading-none">Vitta Horta</h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Foodtech Solutions</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-slate-700">{user.name}</p>
        <p className="text-xs text-slate-400 capitalize">{user.role}</p>
      </div>
      <button 
        onClick={onLogout}
        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
      >
        <LogOut size={20} />
      </button>
    </div>
  </nav>
);

const Sidebar = ({ role }: { role: string }) => {
  const links = role === 'admin' ? [
    { to: '/admin', icon: LayoutDashboard, label: 'Produção' },
    { to: '/admin/clients', icon: Users, label: 'Clientes' },
  ] : [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orders', icon: Calendar, label: 'Pedidos' },
    { to: '/calculator', icon: Calculator, label: 'Calculadora' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-73px)] p-4 flex flex-col gap-2 hidden md:flex">
      {links.map(link => (
        <Link 
          key={link.to} 
          to={link.to}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-vitta-light hover:text-vitta-green transition-all"
        >
          <link.icon size={20} />
          <span className="font-medium">{link.label}</span>
        </Link>
      ))}
    </aside>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const user = await res.json();
        onLogin(user);
      } else {
        setError('Credenciais inválidas. Tente admin@vittahorta.com / admin123');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vitta-light p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-vitta-green rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <Leaf size={32} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-800">Bem-vindo à Vitta</h2>
          <p className="text-slate-500">Acesse seu painel exclusivo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-vitta-green/20 focus:border-vitta-green transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-vitta-green/20 focus:border-vitta-green transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <button 
            disabled={loading}
            className="w-full vitta-button mt-2 py-4 text-lg"
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [logs, setLogs] = useState<EfficiencyLog[]>([]);
  
  useEffect(() => {
    fetch(`/api/efficiency/${user.id}`)
      .then(res => res.json())
      .then(setLogs);
  }, [user.id]);

  const totalSavings = logs.reduce((acc, log) => acc + log.calculated_savings, 0);
  const totalWaste = logs.reduce((acc, log) => acc + (log.waste_percent * 50 / 100), 0); // Mocking 50kg per log

  const chartData = logs.slice(0, 7).reverse().map(log => ({
    name: new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    savings: log.calculated_savings
  }));

  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-3xl font-serif font-bold text-slate-800">Olá, {user.name}</h2>
        <p className="text-slate-500">Aqui está o resumo dos seus resultados este mês.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Economia Total</p>
            <p className="text-2xl font-bold text-slate-800">R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <Trash2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desperdício Evitado</p>
            <p className="text-2xl font-bold text-slate-800">{totalWaste.toFixed(1)} kg</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo de Equipe Salvo</p>
            <p className="text-2xl font-bold text-slate-800">{logs.length * 2}h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-vitta-green" />
            Economia por Período
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="savings" fill="#2D5A27" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-800 mb-6">Últimos Cálculos de Eficiência</h3>
          <div className="space-y-4">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{log.product_name}</p>
                    <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">+ R$ {log.calculated_savings.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Economia Real</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic">Nenhum cálculo realizado ainda.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = ({ user }: { user: User }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const fetchOrders = () => {
    fetch(`/api/orders?userId=${user.id}&role=client`)
      .then(res => res.json())
      .then(setOrders);
  };

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
    fetchOrders();
  }, [user.id]);

  const handleAddOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || !deliveryDate) return;

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        productId: parseInt(selectedProduct),
        quantity: parseFloat(quantity),
        deliveryDate
      })
    });

    if (res.ok) {
      fetchOrders();
      setSelectedProduct('');
      setQuantity('');
      setDeliveryDate('');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    fetchOrders();
  };

  // Group orders by date
  const groupedOrders = orders.reduce((acc: any, order) => {
    if (!acc[order.delivery_date]) acc[order.delivery_date] = [];
    acc[order.delivery_date].push(order);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedOrders).sort();

  return (
    <div className="p-6 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-800">Pedidos Programados</h2>
          <p className="text-slate-500">Planeje seu cardápio e garanta seus insumos.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-vitta-green" />
              Novo Pedido
            </h3>
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Produto</label>
                <select 
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vitta-green/20 focus:border-vitta-green outline-none"
                  required
                >
                  <option value="">Selecione...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantidade (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vitta-green/20 focus:border-vitta-green outline-none"
                  placeholder="Ex: 10.5"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data de Entrega</label>
                <input 
                  type="date" 
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vitta-green/20 focus:border-vitta-green outline-none"
                  required
                />
              </div>
              <button className="w-full vitta-button py-3">Adicionar ao Cronograma</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {sortedDates.length > 0 ? sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-100/50 px-4 py-2 rounded-lg w-fit">
                <Calendar size={14} />
                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h4>
              <div className="grid gap-3">
                {groupedOrders[date].map((order: Order) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={order.id} 
                    className="glass-card p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-vitta-light rounded-lg flex items-center justify-center text-vitta-green">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{order.product_name}</p>
                        <p className="text-xs text-slate-400">{order.quantity} kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-amber-100 text-amber-700 rounded">Pendente</span>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )) : (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Calendar size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Nenhum pedido programado</h3>
              <p className="text-slate-400 text-sm">Use o formulário ao lado para começar seu planejamento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalculatorPage = ({ user }: { user: User }) => {
  const [productName, setProductName] = useState('');
  const [priceInNatura, setPriceInNatura] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [wastePercent, setWastePercent] = useState('25');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const price = parseFloat(priceInNatura);
    const hours = parseFloat(laborHours);
    const waste = parseFloat(wastePercent) / 100;
    const laborCostPerHour = 25; // Mocked average labor cost in R$

    // Traditional Method Cost (for 50kg of usable product)
    const rawNeeded = 50 / (1 - waste);
    const costRaw = rawNeeded * price;
    const costLabor = hours * laborCostPerHour;
    const totalTraditional = costRaw + costLabor;

    // Vitta Horta Cost (for 50kg of usable product)
    // Assuming Vitta Horta is ~30% more expensive than raw price but zero labor/waste
    const vittaPrice = price * 1.6; 
    const totalVitta = 50 * vittaPrice;

    const savings = totalTraditional - totalVitta;

    setResult({
      traditional: totalTraditional,
      vitta: totalVitta,
      savings: savings,
      wasteKg: rawNeeded - 50
    });
  };

  const saveResult = async () => {
    if (!result) return;
    await fetch('/api/efficiency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        productName,
        priceInNatura: parseFloat(priceInNatura),
        laborHours: parseFloat(laborHours),
        wastePercent: parseFloat(wastePercent),
        calculatedSavings: result.savings
      })
    });
    alert('Resultado salvo no seu dashboard!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-serif font-bold text-slate-800">Calculadora de Eficiência</h2>
        <p className="text-slate-500">Descubra quanto você economiza trocando o método tradicional pela Vitta Horta.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Dados de Entrada</h3>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Produto</label>
            <input 
              type="text" 
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-vitta-green"
              placeholder="Ex: Cebola Picada"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preço In Natura (R$/kg)</label>
            <input 
              type="number" 
              value={priceInNatura}
              onChange={e => setPriceInNatura(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-vitta-green"
              placeholder="Ex: 4.50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tempo de Preparo (Horas/50kg)</label>
            <input 
              type="number" 
              value={laborHours}
              onChange={e => setLaborHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-vitta-green"
              placeholder="Ex: 3"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Percentual de Perda (Cascas/Descarte)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="50"
                value={wastePercent}
                onChange={e => setWastePercent(e.target.value)}
                className="flex-1 accent-vitta-green"
              />
              <span className="font-bold text-vitta-green w-10">{wastePercent}%</span>
            </div>
          </div>
          <button onClick={calculate} className="w-full vitta-button py-4 mt-4">Calcular Economia</button>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 bg-vitta-green text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Economia Estimada</p>
                  <h4 className="text-5xl font-bold mb-6">R$ {result.savings.toFixed(2)}</h4>
                  
                  <div className="space-y-3 border-t border-white/20 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70">Método Tradicional:</span>
                      <span className="font-bold">R$ {result.traditional.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70">Método Vitta Horta:</span>
                      <span className="font-bold">R$ {result.vitta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-200">
                      <span className="opacity-70">Desperdício Evitado:</span>
                      <span className="font-bold">{result.wasteKg.toFixed(1)} kg</span>
                    </div>
                  </div>

                  <button 
                    onClick={saveResult}
                    className="w-full bg-white text-vitta-green font-bold py-3 rounded-xl mt-8 hover:bg-vitta-light transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Salvar no Dashboard
                  </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              </motion.div>
            ) : (
              <div className="glass-card p-8 h-full flex flex-col items-center justify-center text-center opacity-50 border-dashed border-2">
                <Calculator size={48} className="text-slate-300 mb-4" />
                <h4 className="text-lg font-bold text-slate-400">Aguardando dados...</h4>
                <p className="text-slate-400 text-sm">Preencha os campos ao lado para ver o comparativo de custos.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch(`/api/orders?role=admin&date=${date}`)
      .then(res => res.json())
      .then(setOrders);
  }, [date]);

  // Consolidate production
  const production = orders.reduce((acc: any, order) => {
    if (!acc[order.product_name]) acc[order.product_name] = 0;
    acc[order.product_name] += order.quantity;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-800">Ordens de Produção</h2>
          <p className="text-slate-500">Visão consolidada do que precisa ser entregue.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
          <Calendar size={18} className="text-slate-400 ml-2" />
          <input 
            type="date" 
            value={date}
            onChange={e => setDate(e.target.value)}
            className="outline-none font-bold text-slate-700 pr-2"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Package size={18} className="text-vitta-green" />
              Resumo de Produção
            </h3>
            <div className="space-y-4">
              {Object.keys(production).map(product => (
                <div key={product} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="font-medium text-slate-700">{product}</span>
                  <span className="font-bold text-vitta-green">{production[product]} kg</span>
                </div>
              ))}
              {Object.keys(production).length === 0 && (
                <p className="text-center py-6 text-slate-400 italic text-sm">Sem produção para esta data.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Qtd</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{order.client_name}</td>
                    <td className="px-6 py-4 text-slate-600">{order.product_name}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{order.quantity} kg</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded">Confirmado</span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Nenhum pedido individual encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-vitta-light flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex flex-1">
          <Sidebar role={user.role} />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              {user.role === 'admin' ? (
                <>
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/clients" element={<div className="p-6">Gestão de Clientes em breve...</div>} />
                  <Route path="*" element={<Navigate to="/admin" />} />
                </>
              ) : (
                <>
                  <Route path="/dashboard" element={<Dashboard user={user} />} />
                  <Route path="/orders" element={<OrdersPage user={user} />} />
                  <Route path="/calculator" element={<CalculatorPage user={user} />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
