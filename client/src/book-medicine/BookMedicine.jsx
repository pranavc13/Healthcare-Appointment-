import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from '@firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import PageTransition from '../components/PageTransition';
import {
  Search, ShoppingCart, X, Plus, Minus, Package, ChevronRight,
  CheckCircle, AlertCircle, Truck, Clock, Star, Shield,
} from 'lucide-react';
import { MEDICINES, CATEGORIES } from './medicineData';

/* ── Medicine Card ──────────────────────────────────────────────── */
function MedicineCard({ med, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(med);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col"
    >
      <div className="relative bg-gray-50 dark:bg-slate-700 p-4 flex items-center justify-center h-36">
        <img
          src={med.img}
          alt={med.productname}
          className="h-28 w-28 object-contain"
          onError={e => { e.target.src = 'https://via.placeholder.com/112?text=Med'; }}
        />
        {med.prescription && (
          <span className="absolute top-2 left-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" /> Rx
          </span>
        )}
        <span className="absolute top-2 right-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {med.offer}% OFF
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide mb-1">{med.category}</p>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2">{med.productname}</h3>
        <p className="text-xs text-gray-400 dark:text-slate-400 mb-3 flex-1 line-clamp-2">{med.contains}</p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-base font-bold text-gray-900 dark:text-white">₹{med.price.toFixed(2)}</span>
            <span className="text-xs text-gray-400 line-through ml-1.5">₹{med.mrp.toFixed(2)}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAdd}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {added ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {added ? 'Added' : 'Add'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Cart Item ──────────────────────────────────────────────────── */
function CartItem({ item, onQty, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
      <img src={item.img} alt={item.productname} className="w-12 h-12 object-contain rounded-xl bg-gray-50 dark:bg-slate-700 p-1 shrink-0" onError={e => { e.target.style.display='none'; }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.productname}</p>
        <p className="text-xs text-gray-400 mt-0.5">₹{item.price.toFixed(2)} each</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onQty(item.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
          <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
        </button>
        <span className="w-5 text-center text-sm font-bold text-gray-900 dark:text-white">{item.qty}</span>
        <button onClick={() => onQty(item.id, 1)} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
          <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={() => onRemove(item.id)} className="w-7 h-7 rounded-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors ml-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Order History Card ─────────────────────────────────────────── */
function OrderCard({ order }) {
  const date = order.placedAt?.toDate ? order.placedAt.toDate() : new Date();
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-400">Order #{order.id?.slice(-6).toUpperCase()}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full">
          <CheckCircle className="w-3 h-3" /> {order.status || 'Placed'}
        </span>
      </div>
      <div className="space-y-1 mb-3">
        {(order.items || []).slice(0, 3).map((item, i) => (
          <p key={i} className="text-xs text-gray-500 dark:text-gray-400">
            {item.qty}× {item.productname}
          </p>
        ))}
        {(order.items || []).length > 3 && (
          <p className="text-xs text-gray-400">+{(order.items || []).length - 3} more items</p>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-700">
        <p className="text-xs text-gray-400">{(order.items || []).length} items</p>
        <p className="font-bold text-gray-900 dark:text-white">₹{(order.total || 0).toFixed(2)}</p>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function BookMedicine() {
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [tab, setTab] = useState('shop'); // 'shop' | 'orders'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  /* Filter medicines */
  const filtered = MEDICINES.filter(m => {
    const matchCat = category === 'All' || m.category === category;
    const matchSearch = !search ||
      m.productname.toLowerCase().includes(search.toLowerCase()) ||
      m.contains.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && m.productname;
  });

  /* Cart operations */
  const addToCart = (med) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === med.id);
      if (existing) return prev.map(i => i.id === med.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...med, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  /* Load order history */
  useEffect(() => {
    if (tab !== 'orders' || !currentUser) return;
    setLoadingOrders(true);
    getDocs(query(collection(db, 'orders'), where('userId', '==', currentUser.uid)))
      .then(snap => {
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.placedAt?.seconds ?? 0) - (a.placedAt?.seconds ?? 0));
        setOrders(data);
      })
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoadingOrders(false));
  }, [tab, currentUser]);

  /* Place order */
  const placeOrder = async () => {
    if (!currentUser) { toast.warning('Sign in required', 'Please log in to place an order.'); return; }
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        items: cart.map(({ id, productname, price, qty, img }) => ({ id, productname, price, qty, img })),
        total: cartTotal,
        status: 'Placed',
        placedAt: serverTimestamp(),
      });
      setCart([]);
      setCartOpen(false);
      setOrderSuccess(true);
      toast.success('Order placed!', 'Your medicines will be delivered in 2–3 days.');
      setTimeout(() => setOrderSuccess(false), 4000);
    } catch {
      toast.error('Order failed', 'Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-16 pb-24 md:pb-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 sm:py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" /> Book Medicine
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">Order medicines online · Delivered to your door</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex rounded-xl overflow-hidden border border-white/30">
                {['shop', 'orders'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white text-emerald-700' : 'text-white hover:bg-white/10'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCartOpen(true)}
                className="relative bg-white text-emerald-700 p-2.5 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* Order success banner */}
          <AnimatePresence>
            {orderSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4 mb-6"
              >
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">Order placed successfully!</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Estimated delivery: 2–3 business days</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {tab === 'shop' ? (
            <>
              {/* Search */}
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medicines, brands, ingredients..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category chips */}
              <div className="flex gap-2 flex-wrap mb-6">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      category === cat
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600 hover:border-emerald-400'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex gap-4 flex-wrap mb-6 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-emerald-500" />Free delivery above ₹499</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" />2–3 day delivery</span>
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-purple-500" />100% genuine medicines</span>
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500" />4.8★ rated service</span>
              </div>

              {/* Results count */}
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{filtered.length} medicine{filtered.length !== 1 ? 's' : ''} found</p>

              {/* Grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
                  <p className="font-medium text-gray-500">No medicines found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term or category</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  layout
                >
                  <AnimatePresence>
                    {filtered.map((med, i) => (
                      <motion.div
                        key={med.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <MedicineCard med={med} onAdd={addToCart} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          ) : (
            /* Order history */
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order History</h2>
              {!currentUser ? (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
                  <p className="font-medium text-gray-500">Sign in to view orders</p>
                </div>
              ) : loadingOrders ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
                  <p className="font-medium text-gray-500">No orders yet</p>
                  <button onClick={() => setTab('shop')} className="mt-4 text-emerald-600 hover:underline text-sm font-medium">Browse medicines →</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map(o => <OrderCard key={o.id} order={o} />)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Drawer */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setCartOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 z-50 flex flex-col shadow-2xl"
              >
                {/* Cart header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" /> Cart ({cartCount})
                  </h2>
                  <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto px-5">
                  {cart.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingCart className="w-12 h-12 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Cart is empty</p>
                      <p className="text-sm text-gray-400 mt-1">Add medicines from the shop</p>
                    </div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <CartItem key={item.id} item={item} onQty={updateQty} onRemove={removeFromCart} />
                      ))}
                      {/* Prescription warning */}
                      {cart.some(i => i.prescription) && (
                        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mt-4 text-xs text-amber-700 dark:text-amber-300">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          Some items require a valid prescription. Please have it ready.
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Cart footer */}
                {cart.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-5 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery</span>
                      <span className={cartTotal >= 499 ? 'text-green-600 font-medium' : 'text-gray-900 dark:text-white font-medium'}>
                        {cartTotal >= 499 ? 'FREE' : '₹49.00'}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-slate-700 pt-3">
                      <span>Total</span>
                      <span>₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toFixed(2)}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={placeOrder}
                      disabled={placing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                    >
                      {placing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {placing ? 'Placing Order...' : 'Place Order'}
                    </motion.button>
                    {!currentUser && (
                      <p className="text-center text-xs text-amber-600 dark:text-amber-400">
                        You need to be logged in to place an order
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
