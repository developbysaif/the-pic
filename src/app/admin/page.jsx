'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  Tag,
  Settings,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  X,
  ExternalLink,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Sliders,
  DollarSign,
  Truck,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import SalesChart from '@/components/admin/SalesChart';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import PrintableInvoice from '@/components/admin/PrintableInvoice';
import { MetricSkeleton, TableSkeleton } from '@/components/admin/LoadingSkeleton';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all');
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 8;
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Product Form State
  const [pName, setPName] = useState('');
  const [pShortDesc, setPShortDesc] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCatId, setPCatId] = useState('');
  const [pPrice, setPPrice] = useState(3500);
  const [pSalePrice, setPSalePrice] = useState('');
  const [pSKU, setPSKU] = useState('');
  const [pStock, setPStock] = useState(50);
  const [pImage, setPImage] = useState('/images/products/serum-main.jpg');
  const [pFeatured, setPFeatured] = useState(false);
  const [pTrending, setPTrending] = useState(false);
  const [pBestSeller, setPBestSeller] = useState(false);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('/images/products/serum-main.jpg');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 8;
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');

  // Inventory State
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventorySearch, setInventorySearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [updatingStockId, setUpdatingStockId] = useState(null);

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [cCode, setCCode] = useState('');
  const [cDiscountType, setCDiscountType] = useState('percentage');
  const [cValue, setCValue] = useState(10);
  const [cMinOrder, setCMinOrder] = useState(2000);
  const [cValidUntil, setCValidUntil] = useState('2027-12-31');

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState({
    siteName: 'SAGE & BOTANICA',
    announcementText: '🌿 Complimentary Express Delivery on all orders over Rs. 3,500 | 100% Pure Organic Extracts',
    announcementActive: true,
    freeShippingThreshold: 3500,
    shippingFee: 250,
    supportEmail: 'concierge@sageandbotanica.com',
    supportPhone: '+92 300 1234567',
    instagramUrl: 'https://instagram.com',
    heroTitle: 'Botanical Alchemy for Mind & Skin',
    heroSubtitle: 'Crafted with cold-pressed alpine sage, organic seed elixirs, and restorative earth minerals. Made for timeless rejuvenation.',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: true,
    onConfirm: null,
  });

  // Auth gate
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [authLoading, user, router]);

  // Loaders
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=200');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  const loadInventory = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/inventory?lowStock=${lowStockOnly}&search=${encodeURIComponent(inventorySearch)}`);
      if (res.ok) {
        const data = await res.json();
        setInventoryItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInventory(false);
    }
  }, [lowStockOnly, inventorySearch]);

  const loadCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setStoreSettings(data.settings);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadStats();
      loadProducts();
      loadCategories();
      loadOrders();
      loadCustomers();
      loadInventory();
      loadCoupons();
      loadSettings();
    }
  }, [user, loadStats, loadProducts, loadCategories, loadOrders, loadCustomers, loadInventory, loadCoupons, loadSettings]);

  // Product Actions
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: pName,
      shortDescription: pShortDesc,
      description: pDesc,
      category: pCatId || categories[0]?._id,
      price: Number(pPrice),
      salePrice: pSalePrice ? Number(pSalePrice) : undefined,
      SKU: pSKU,
      stock: Number(pStock),
      images: [pImage],
      featured: pFeatured,
      trending: pTrending,
      bestSeller: pBestSeller,
      status: 'published',
      variants: [
        {
          id: 'v1',
          name: 'Standard Flacon',
          value: '#789575',
          sku: pSKU,
          price: Number(pPrice),
          salePrice: pSalePrice ? Number(pSalePrice) : undefined,
          stock: Number(pStock),
          active: true,
          image: pImage,
        },
      ],
      hotspots: [
        {
          id: 'h1',
          title: 'Precision Botanical Cap',
          partName: 'Natural Bamboo Collar',
          description: 'Airtight protective closure preserving active plant enzymes.',
          benefits: 'Sustains cold-pressed botanical potency.',
          x: 50,
          y: 20,
        },
      ],
      model3D: {
        enabled: true,
        color: '#789575',
        shape: 'serum',
      },
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        showToast(
          editingProduct ? 'Formulation updated successfully' : 'New botanical product published',
          'success'
        );
        loadProducts();
        loadStats();
        loadInventory();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save product', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error saving product', 'error');
    }
  };

  const promptDeleteProduct = (prod) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Formulation',
      message: `Are you sure you want to permanently remove "${prod.name}" (${prod.SKU}) from MongoDB?`,
      confirmLabel: 'Delete Product',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/products/${prod.slug}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Formulation deleted from database', 'success');
            loadProducts();
            loadStats();
            loadInventory();
          } else {
            showToast('Failed to delete product', 'error');
          }
        } catch {
          showToast('Error deleting product', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Category Actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          description: newCatDesc,
          image: newCatImage,
          displayOrder: categories.length + 1,
        }),
      });
      if (res.ok) {
        setShowCategoryModal(false);
        setNewCatName('');
        setNewCatDesc('');
        showToast('Botanical category created successfully', 'success');
        loadCategories();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create category', 'error');
      }
    } catch {
      showToast('Error creating category', 'error');
    }
  };

  const promptDeleteCategory = (cat) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Delete category "${cat.name}"? Products assigned to it must be updated.`,
      confirmLabel: 'Delete Category',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/categories/${cat._id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Category deleted successfully', 'success');
            loadCategories();
          } else {
            const err = await res.json();
            showToast(err.error || 'Cannot delete category', 'error');
          }
        } catch {
          showToast('Error deleting category', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId, orderStatus, paymentStatus, courierCompany, trackingNumber) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          courierCompany,
          trackingNumber,
        }),
      });
      if (res.ok) {
        showToast(`Order status updated to ${orderStatus}`, 'success');
        loadOrders();
        loadStats();
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch {
      showToast('Error updating order', 'error');
    }
  };

  // Inventory Quick Adjustment
  const handleUpdateStock = async (productId, newStock) => {
    setUpdatingStockId(productId);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          stock: Number(newStock),
        }),
      });
      if (res.ok) {
        showToast(`Stock updated to ${newStock} units`, 'success');
        loadInventory();
        loadProducts();
        loadStats();
      } else {
        showToast('Failed to update stock', 'error');
      }
    } catch {
      showToast('Error updating stock', 'error');
    } finally {
      setUpdatingStockId(null);
    }
  };

  // Coupon Actions
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cCode.toUpperCase().trim(),
          discountType: cDiscountType,
          value: Number(cValue),
          minOrderAmount: Number(cMinOrder),
          validUntil: cValidUntil,
          isActive: true,
        }),
      });
      if (res.ok) {
        setShowCouponModal(false);
        setCCode('');
        showToast('Promotional voucher activated', 'success');
        loadCoupons();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create coupon', 'error');
      }
    } catch {
      showToast('Error creating coupon', 'error');
    }
  };

  const promptDeleteCoupon = (couponId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Deactivate Coupon',
      message: 'Are you sure you want to delete this promotional coupon code?',
      confirmLabel: 'Delete Voucher',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/coupons/${couponId}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Coupon deactivated', 'success');
            loadCoupons();
          } else {
            showToast('Failed to delete coupon', 'error');
          }
        } catch {
          showToast('Error deleting coupon', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Store Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeSettings),
      });
      if (res.ok) {
        showToast('Store settings saved to MongoDB', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered & Paginated Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.SKU?.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat =
        productCatFilter === 'all' ||
        (typeof p.category === 'object' ? p.category?._id === productCatFilter : p.category === productCatFilter);
      const matchStock =
        productStockFilter === 'all'
          ? true
          : productStockFilter === 'low'
          ? p.stock <= 20
          : productStockFilter === 'out'
          ? p.stock === 0
          : p.stock > 20;
      return matchSearch && matchCat && matchStock;
    });
  }, [products, productSearch, productCatFilter, productStockFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, productPage]);

  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

  // Filtered & Paginated Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchFilter = orderFilter === 'all' || o.orderStatus === orderFilter;
      const searchLower = orderSearch.toLowerCase();
      const matchSearch =
        !orderSearch ||
        o.orderNumber?.toLowerCase().includes(searchLower) ||
        o.customerDetails?.name?.toLowerCase().includes(searchLower) ||
        o.customerDetails?.phone?.toLowerCase().includes(searchLower) ||
        o.shippingAddress?.city?.toLowerCase().includes(searchLower);
      return matchFilter && matchSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, orderPage]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-sage-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sage-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Navigation Items Definition
  const navItems = [
    { id: 'overview', label: 'Store Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products Catalog', icon: Package, badge: products.length },
    { id: 'categories', label: 'Categories', icon: Layers, badge: categories.length },
    { id: 'orders', label: 'COD Orders', icon: ShoppingBag, badge: orders.length },
    { id: 'customers', label: 'Patron Directory', icon: Users, badge: customers.length },
    { id: 'inventory', label: 'Stock & Inventory', icon: Warehouse, badge: stats?.metrics?.lowStockCount || 0 },
    { id: 'coupons', label: 'Promotional Coupons', icon: Tag, badge: coupons.length },
    { id: 'settings', label: 'Store Configuration', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-sage-ivory flex flex-col lg:flex-row antialiased">
      {/* SIDEBAR (Desktop) */}
      <aside
        className={`hidden lg:flex flex-col bg-sage-dark text-sage-ivory transition-all duration-300 relative z-20 shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-sage-bg/10 flex items-center justify-between">
          {!sidebarCollapsed ? (
            <div className="overflow-hidden">
              <span className="font-serif text-lg font-bold tracking-wider text-white block uppercase truncate">
                SAGE & BOTANICA
              </span>
              <span className="text-[10px] text-sage-muted tracking-widest uppercase font-semibold">
                Admin Console
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-sage-primary text-white flex items-center justify-center font-serif font-bold text-sm mx-auto">
              S
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-sage-muted hover:text-white hover:bg-white/10 transition-colors hidden lg:block"
            aria-label="Toggle sidebar width"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all group ${
                  isCurrent
                    ? 'bg-sage-primary text-white shadow-soft'
                    : 'text-sage-ivory/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.id === 'inventory' && item.badge > 0
                        ? 'bg-amber-500 text-white'
                        : isCurrent
                        ? 'bg-sage-dark/60 text-white'
                        : 'bg-white/10 text-sage-ivory/80'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sage-bg/10 space-y-2">
          <Link
            href="/"
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-sage-ivory/80 hover:text-white hover:bg-white/10 transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Live Storefront"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>View Storefront</span>}
          </Link>
          <button
            onClick={() => logout()}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-red-300 hover:text-red-200 hover:bg-red-950/40 transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-sage-dark/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-sage-dark text-sage-ivory p-6 flex flex-col justify-between shadow-2xl z-10 animate-slide-right">
            <div>
              <div className="flex justify-between items-center pb-5 mb-5 border-b border-sage-bg/10">
                <div>
                  <span className="font-serif text-lg font-bold tracking-wider text-white block uppercase">
                    SAGE & BOTANICA
                  </span>
                  <span className="text-[10px] text-sage-muted tracking-widest uppercase font-semibold">
                    Admin Console
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-sage-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold ${
                        isCurrent ? 'bg-sage-primary text-white shadow-soft' : 'text-sage-ivory/80 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-sage-bg/10 space-y-2">
              <Link href="/" className="flex items-center space-x-2 text-xs text-sage-ivory/80">
                <ExternalLink className="w-4 h-4" />
                <span>View Storefront</span>
              </Link>
              <button onClick={() => logout()} className="flex items-center space-x-2 text-xs text-red-300">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP BAR */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-sage-soft/40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-sage-soft text-sage-dark hover:bg-sage-soft/20"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-lg sm:text-xl font-medium text-sage-dark capitalize">
                  {navItems.find((n) => n.id === activeTab)?.label || 'Console'}
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-sage-primary/10 text-sage-dark text-[10px] font-bold uppercase tracking-wider">
                  MongoDB Connected
                </span>
              </div>
              <p className="text-[11px] text-sage-muted hidden sm:block">
                Role: Master Administrator • Cash on Delivery Operations
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadStats();
                loadProducts();
                loadOrders();
                loadInventory();
                showToast('Refreshed data from database', 'info');
              }}
              className="p-2 rounded-xl border border-sage-soft/60 text-sage-dark hover:bg-sage-bg/30 transition-colors"
              title="Refresh MongoDB Data"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-sage-primary text-white flex items-center justify-center font-serif text-xs font-bold shadow-soft">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Primary KPI Metrics */}
              {loadingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <MetricSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft">
                    <span className="text-[11px] font-bold text-sage-muted uppercase tracking-wider block">
                      Total Gross Revenue
                    </span>
                    <span className="font-serif text-3xl font-bold text-sage-dark mt-2 block">
                      Rs. {stats?.metrics?.totalSales?.toLocaleString() || '0'}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold mt-1 flex items-center space-x-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Real Database Volume</span>
                    </span>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft">
                    <span className="text-[11px] font-bold text-sage-muted uppercase tracking-wider block">
                      Total COD Orders
                    </span>
                    <span className="font-serif text-3xl font-bold text-sage-primary mt-2 block">
                      {stats?.metrics?.totalOrders || 0}
                    </span>
                    <span className="text-xs text-sage-muted mt-1 block">
                      {stats?.metrics?.deliveredOrders || 0} Delivered & Collected
                    </span>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft">
                    <span className="text-[11px] font-bold text-sage-muted uppercase tracking-wider block">
                      Registered Patrons
                    </span>
                    <span className="font-serif text-3xl font-bold text-sage-dark mt-2 block">
                      {stats?.metrics?.totalCustomers || 0}
                    </span>
                    <span className="text-xs text-sage-muted mt-1 block">Verified Customer Profiles</span>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft">
                    <span className="text-[11px] font-bold text-sage-muted uppercase tracking-wider block">
                      Low-Stock Formulations
                    </span>
                    <span className="font-serif text-3xl font-bold text-amber-600 mt-2 block">
                      {stats?.metrics?.lowStockCount || 0}
                    </span>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="text-xs text-amber-700 font-medium mt-1 hover:underline block text-left"
                    >
                      Inspect Inventory &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Order Status Breakdown Strip */}
              <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft">
                <h3 className="font-serif text-base text-sage-dark font-semibold mb-4">
                  Order Lifecycle & Fulfillment Pipeline
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
                  <div className="bg-sage-bg/30 p-3 rounded-2xl">
                    <span className="text-sage-muted block text-[11px]">Pending</span>
                    <span className="font-serif text-xl font-bold text-sage-dark">
                      {stats?.metrics?.pendingOrders || 0}
                    </span>
                  </div>
                  <div className="bg-sage-bg/30 p-3 rounded-2xl">
                    <span className="text-sage-muted block text-[11px]">Confirmed</span>
                    <span className="font-serif text-xl font-bold text-sage-primary">
                      {stats?.metrics?.confirmedOrders || 0}
                    </span>
                  </div>
                  <div className="bg-sage-bg/30 p-3 rounded-2xl">
                    <span className="text-sage-muted block text-[11px]">Processing</span>
                    <span className="font-serif text-xl font-bold text-sage-dark">
                      {stats?.metrics?.processingOrders || 0}
                    </span>
                  </div>
                  <div className="bg-sage-bg/30 p-3 rounded-2xl">
                    <span className="text-sage-muted block text-[11px]">Dispatched</span>
                    <span className="font-serif text-xl font-bold text-blue-700">
                      {stats?.metrics?.dispatchedOrders || 0}
                    </span>
                  </div>
                  <div className="bg-sage-bg/30 p-3 rounded-2xl">
                    <span className="text-sage-muted block text-[11px]">Delivered</span>
                    <span className="font-serif text-xl font-bold text-emerald-700">
                      {stats?.metrics?.deliveredOrders || 0}
                    </span>
                  </div>
                  <div className="bg-sage-bg/30 p-3 rounded-2xl">
                    <span className="text-sage-muted block text-[11px]">Cancelled</span>
                    <span className="font-serif text-xl font-bold text-red-600">
                      {stats?.metrics?.cancelledOrders || 0}
                    </span>
                  </div>
                  <div className="bg-sage-bg/30 p-3 rounded-2xl">
                    <span className="text-sage-muted block text-[11px]">Active SKUs</span>
                    <span className="font-serif text-xl font-bold text-sage-dark">
                      {products.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Sales Revenue Chart */}
              <SalesChart monthlyRevenue={stats?.monthlyRevenue || {}} />

              {/* Recent Orders Overview Table */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-serif text-xl text-sage-dark">Recent Inbound Orders</h3>
                    <p className="text-xs text-sage-muted">Real-time COD customer requests</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-sage-primary hover:underline"
                  >
                    Manage All Orders &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-sage-soft/40 text-sage-muted uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-2">Order #</th>
                        <th className="py-3 px-2">Customer</th>
                        <th className="py-3 px-2">City</th>
                        <th className="py-3 px-2">Total</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2">Payment</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-soft/20 text-sage-dark">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="hover:bg-sage-soft/10">
                          <td className="py-3 px-2 font-mono font-bold">{order.orderNumber}</td>
                          <td className="py-3 px-2">
                            <p className="font-medium text-sage-dark">{order.customerDetails?.name}</p>
                            <p className="text-[10px] text-sage-muted">{order.customerDetails?.phone}</p>
                          </td>
                          <td className="py-3 px-2 text-sage-dark/80">{order.shippingAddress?.city}</td>
                          <td className="py-3 px-2 font-semibold">
                            Rs. {order.total?.toLocaleString()}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sage-soft/50 text-sage-dark">
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.paymentStatus === 'COLLECTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right space-x-1">
                            <button
                              onClick={() => setSelectedOrderForInvoice(order)}
                              className="px-2.5 py-1 rounded-lg bg-sage-bg/60 text-sage-dark text-[10px] font-semibold hover:bg-sage-bg"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5 inline mr-1" />
                              Invoice
                            </button>
                            <button
                              onClick={() => setActiveTab('orders')}
                              className="px-2.5 py-1 rounded-lg bg-sage-dark text-white text-[10px] font-semibold hover:bg-sage-primary"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-sage-dark">Botanical Formulations</h2>
                  <p className="text-xs text-sage-muted">Manage product pricing, stock availability, categories, and 3D models</p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setPName('');
                    setPShortDesc('');
                    setPDesc('');
                    setPCatId(categories[0]?._id || '');
                    setPPrice(3500);
                    setPSalePrice('');
                    setPSKU(`SAGE-${Math.floor(100 + Math.random() * 900)}`);
                    setPStock(50);
                    setPImage('/images/products/serum-main.jpg');
                    setPFeatured(false);
                    setPTrending(false);
                    setPBestSeller(false);
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2.5 bg-sage-dark hover:bg-sage-primary text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-soft-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filters Bar */}
              <div className="bg-white rounded-2xl p-4 border border-sage-soft/40 shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-sage-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title or SKU..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setProductPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-sage-soft bg-white focus:outline-none focus:ring-1 focus:ring-sage-primary"
                  />
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <select
                    value={productCatFilter}
                    onChange={(e) => {
                      setProductCatFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="px-3 py-2 rounded-xl border border-sage-soft bg-white text-xs text-sage-dark font-medium w-full sm:w-auto"
                  >
                    <option value="all">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={productStockFilter}
                    onChange={(e) => {
                      setProductStockFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="px-3 py-2 rounded-xl border border-sage-soft bg-white text-xs text-sage-dark font-medium w-full sm:w-auto"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="low">Low Stock (&le; 20 units)</option>
                    <option value="out">Out of Stock (0 units)</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              {loadingProducts ? (
                <TableSkeleton rows={6} cols={6} />
              ) : (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-sage-soft/40 text-sage-muted uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-2">Image</th>
                          <th className="py-3 px-2">Formulation</th>
                          <th className="py-3 px-2">SKU</th>
                          <th className="py-3 px-2">Price</th>
                          <th className="py-3 px-2">Stock</th>
                          <th className="py-3 px-2">Badges</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sage-soft/20 text-sage-dark">
                        {paginatedProducts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-10 text-sage-muted text-xs">
                              No formulations match your filter criteria.
                            </td>
                          </tr>
                        ) : (
                          paginatedProducts.map((prod) => (
                            <tr key={prod._id} className="hover:bg-sage-soft/10">
                              <td className="py-3 px-2">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sage-soft/20 shrink-0">
                                  <Image
                                    src={prod.images?.[0] || '/images/products/serum-main.jpg'}
                                    alt={prod.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-2 font-medium text-sage-dark">
                                <Link href={`/product/${prod.slug}`} className="hover:underline">
                                  {prod.name}
                                </Link>
                                <p className="text-[10px] text-sage-muted">
                                  {typeof prod.category === 'object' ? prod.category?.name : 'Apothecary'}
                                </p>
                              </td>
                              <td className="py-3 px-2 font-mono text-sage-muted text-[11px]">{prod.SKU}</td>
                              <td className="py-3 px-2">
                                <span className="font-semibold text-sage-dark">
                                  Rs. {prod.price?.toLocaleString()}
                                </span>
                                {prod.salePrice && (
                                  <span className="text-[10px] text-emerald-700 block">
                                    Sale: Rs. {prod.salePrice?.toLocaleString()}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    prod.stock > 20
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : prod.stock > 0
                                      ? 'bg-amber-50 text-amber-800'
                                      : 'bg-red-50 text-red-700'
                                  }`}
                                >
                                  {prod.stock} units
                                </span>
                              </td>
                              <td className="py-3 px-2 space-x-1">
                                {prod.featured && (
                                  <span className="px-1.5 py-0.5 rounded bg-sage-soft/40 text-[9px] font-bold">
                                    Featured
                                  </span>
                                )}
                                {prod.trending && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[9px] font-bold text-emerald-800">
                                    Trending
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setPName(prod.name);
                                    setPShortDesc(prod.shortDescription || '');
                                    setPDesc(prod.description || '');
                                    setPCatId(
                                      typeof prod.category === 'object'
                                        ? prod.category?._id || ''
                                        : prod.category || ''
                                    );
                                    setPPrice(prod.price);
                                    setPSalePrice(prod.salePrice ? String(prod.salePrice) : '');
                                    setPSKU(prod.SKU);
                                    setPStock(prod.stock);
                                    setPImage(prod.images?.[0] || '/images/products/serum-main.jpg');
                                    setPFeatured(prod.featured || false);
                                    setPTrending(prod.trending || false);
                                    setPBestSeller(prod.bestSeller || false);
                                    setShowProductModal(true);
                                  }}
                                  className="p-1.5 text-sage-primary hover:text-sage-dark transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => promptDeleteProduct(prod)}
                                  className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Bar */}
                  {totalProductPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-sage-soft/30 text-xs">
                      <span className="text-sage-muted">
                        Page {productPage} of {totalProductPages} ({filteredProducts.length} formulations)
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={productPage === 1}
                          onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-xl border border-sage-soft text-sage-dark disabled:opacity-40 hover:bg-sage-bg/30"
                        >
                          Previous
                        </button>
                        <button
                          disabled={productPage === totalProductPages}
                          onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                          className="px-3 py-1.5 rounded-xl border border-sage-soft text-sage-dark disabled:opacity-40 hover:bg-sage-bg/30"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl text-sage-dark">Botanical Categories</h2>
                  <p className="text-xs text-sage-muted">Organize shop collections, hero banners, and catalog groups</p>
                </div>

                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-2.5 bg-sage-dark hover:bg-sage-primary text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {loadingCategories ? (
                <TableSkeleton rows={4} cols={4} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-sage-soft/20 shrink-0">
                          <Image
                            src={cat.image || '/images/products/serum-main.jpg'}
                            alt={cat.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-semibold text-sage-dark">{cat.name}</h3>
                          <p className="text-xs text-sage-muted line-clamp-1">{cat.description}</p>
                          <span className="text-[10px] text-sage-primary font-bold uppercase mt-1 inline-block">
                            slug: /{cat.slug} • {cat.productCount || 0} Formulations
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => promptDeleteCategory(cat)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors ml-4"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-sage-dark">Cash on Delivery Orders</h2>
                  <p className="text-xs text-sage-muted">Manage courier dispatch, tracking numbers, and COD cash reconciliation</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-sage-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search order #, patron, phone..."
                      value={orderSearch}
                      onChange={(e) => {
                        setOrderSearch(e.target.value);
                        setOrderPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-sage-soft bg-white focus:outline-none focus:ring-1 focus:ring-sage-primary"
                    />
                  </div>

                  <select
                    value={orderFilter}
                    onChange={(e) => {
                      setOrderFilter(e.target.value);
                      setOrderPage(1);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-sage-soft bg-white text-xs font-semibold text-sage-dark"
                  >
                    <option value="all">All Statuses ({orders.length})</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="PACKED">PACKED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                    <option value="RETURNED">RETURNED</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              {loadingOrders ? (
                <TableSkeleton rows={6} cols={5} />
              ) : (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft">
                  <div className="space-y-6">
                    {paginatedOrders.length === 0 ? (
                      <div className="text-center py-10 text-xs text-sage-muted">
                        No orders matching the selected filter.
                      </div>
                    ) : (
                      paginatedOrders.map((order) => (
                        <div
                          key={order._id}
                          className="p-5 rounded-2xl border border-sage-soft/40 bg-sage-ivory/30 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sage-soft/30 gap-2">
                            <div>
                              <span className="font-mono text-sm font-bold text-sage-dark">
                                {order.orderNumber}
                              </span>
                              <span className="text-xs text-sage-muted ml-3">
                                Placed: {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Status and Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Order Status */}
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    e.target.value,
                                    order.paymentStatus,
                                    order.courierCompany,
                                    order.trackingNumber
                                  )
                                }
                                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase bg-white border border-sage-soft ${
                                  order.orderStatus === 'DELIVERED'
                                    ? 'text-emerald-800'
                                    : order.orderStatus === 'CANCELLED'
                                    ? 'text-red-700'
                                    : order.orderStatus === 'RETURN_REQUESTED'
                                    ? 'text-purple-700'
                                    : 'text-sage-dark'
                                }`}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="PACKED">PACKED</option>
                                <option value="DISPATCHED">DISPATCHED</option>
                                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                                <option value="RETURNED">RETURNED</option>
                              </select>

                              {/* Payment Toggle */}
                              <select
                                value={order.paymentStatus}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    order.orderStatus,
                                    e.target.value,
                                    order.courierCompany,
                                    order.trackingNumber
                                  )
                                }
                                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${
                                  order.paymentStatus === 'COLLECTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                <option value="PENDING">COD PENDING</option>
                                <option value="COLLECTED">COD COLLECTED</option>
                                <option value="FAILED">FAILED</option>
                                <option value="REFUNDED">REFUNDED</option>
                              </select>

                              {/* Print Invoice */}
                              <button
                                onClick={() => setSelectedOrderForInvoice(order)}
                                className="px-3 py-1 bg-sage-dark text-white rounded-xl text-xs font-semibold hover:bg-sage-primary flex items-center space-x-1"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Invoice</span>
                              </button>
                            </div>
                          </div>

                          {/* Customer & Destination info */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-sage-muted block">Recipient Patron:</span>
                              <p className="font-semibold text-sage-dark">{order.customerDetails?.name}</p>
                              <p className="text-sage-muted">{order.customerDetails?.phone}</p>
                              <p className="text-sage-muted truncate">{order.customerDetails?.email}</p>
                            </div>

                            <div>
                              <span className="text-sage-muted block">Shipping Destination:</span>
                              <p className="text-sage-dark">{order.shippingAddress?.street}</p>
                              <p className="text-sage-dark">
                                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                                {order.shippingAddress?.postalCode}
                              </p>
                              {order.shippingAddress?.notes && (
                                <p className="text-sage-muted italic text-[11px]">
                                  Note: {order.shippingAddress.notes}
                                </p>
                              )}
                            </div>

                            <div>
                              <span className="text-sage-muted block">Courier Dispatch:</span>
                              <p className="font-medium text-sage-dark">
                                {order.courierCompany || 'TCS Express'}
                              </p>
                              <p className="text-sage-muted">
                                Tracking: {order.trackingNumber || 'Unassigned'}
                              </p>
                              <p className="font-bold text-sage-dark mt-1">
                                Payable COD: Rs. {order.total?.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Quick Tracking input */}
                          <div className="pt-3 border-t border-sage-soft/30 flex flex-col sm:flex-row items-center gap-3">
                            <input
                              type="text"
                              defaultValue={order.trackingNumber || ''}
                              placeholder="Assign Courier Tracking # (e.g. TCS-9988)"
                              onBlur={(e) => {
                                if (e.target.value !== order.trackingNumber) {
                                  handleUpdateOrderStatus(
                                    order._id,
                                    order.orderStatus,
                                    order.paymentStatus,
                                    order.courierCompany,
                                    e.target.value
                                  );
                                }
                              }}
                              className="px-3 py-1.5 text-xs rounded-xl border border-sage-soft bg-white w-full sm:w-64"
                            />
                            <span className="text-[11px] text-sage-muted">
                              Items: {order.items?.map((i) => `${i.title} (${i.quantity})`).join(', ')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Orders Pagination */}
                  {totalOrderPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-sage-soft/30 text-xs">
                      <span className="text-sage-muted">
                        Page {orderPage} of {totalOrderPages} ({filteredOrders.length} orders)
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={orderPage === 1}
                          onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-xl border border-sage-soft text-sage-dark disabled:opacity-40 hover:bg-sage-bg/30"
                        >
                          Previous
                        </button>
                        <button
                          disabled={orderPage === totalOrderPages}
                          onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                          className="px-3 py-1.5 rounded-xl border border-sage-soft text-sage-dark disabled:opacity-40 hover:bg-sage-bg/30"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-sage-dark">Registered Patrons Directory</h2>
                  <p className="text-xs text-sage-muted">Inspect customer profiles, order history totals, and lifetime revenue contribution</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-sage-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter patrons by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-sage-soft bg-white focus:outline-none focus:ring-1 focus:ring-sage-primary"
                  />
                </div>
              </div>

              {loadingCustomers ? (
                <TableSkeleton rows={5} cols={6} />
              ) : (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-sage-soft/40 text-sage-muted uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-3">Patron Name</th>
                          <th className="py-3 px-3">Contact</th>
                          <th className="py-3 px-3">Joined Date</th>
                          <th className="py-3 px-3 text-center">Orders Placed</th>
                          <th className="py-3 px-3 text-right">Lifetime Spend</th>
                          <th className="py-3 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sage-soft/20 text-sage-dark">
                        {customers
                          .filter(
                            (c) =>
                              c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                              c.email?.toLowerCase().includes(customerSearch.toLowerCase())
                          )
                          .map((cust) => (
                            <tr key={cust._id} className="hover:bg-sage-ivory/50">
                              <td className="py-3 px-3 font-semibold">{cust.name}</td>
                              <td className="py-3 px-3 text-sage-muted">
                                <div>{cust.email}</div>
                                <div className="text-[11px]">{cust.phone || 'No phone'}</div>
                              </td>
                              <td className="py-3 px-3 text-sage-muted">
                                {new Date(cust.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 text-center font-bold">{cust.ordersCount || 0}</td>
                              <td className="py-3 px-3 text-right font-serif font-bold text-sage-dark">
                                Rs. {(cust.totalSpent || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    cust.isActive !== false
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {cust.isActive !== false ? 'Active' : 'Deactivated'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: INVENTORY & STOCK MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-sage-dark">Stock & Inventory Console</h2>
                  <p className="text-xs text-sage-muted">Monitor inventory thresholds, replenish depleted flacons, and prevent stockouts</p>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-sage-dark cursor-pointer bg-white px-3 py-2 rounded-xl border border-sage-soft">
                    <input
                      type="checkbox"
                      checked={lowStockOnly}
                      onChange={(e) => setLowStockOnly(e.target.checked)}
                      className="rounded text-sage-primary"
                    />
                    <span>Show Low Stock Only (&le; 20 units)</span>
                  </label>
                </div>
              </div>

              {/* Quick Search */}
              <div className="bg-white rounded-2xl p-4 border border-sage-soft/40 shadow-soft-sm flex items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-sage-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by SKU or formulation title..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-sage-soft bg-white focus:outline-none focus:ring-1 focus:ring-sage-primary"
                  />
                </div>
                <button
                  onClick={loadInventory}
                  className="px-3.5 py-2 rounded-xl bg-sage-dark text-white text-xs font-semibold hover:bg-sage-primary transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Stock</span>
                </button>
              </div>

              {/* Inventory Table */}
              {loadingInventory ? (
                <TableSkeleton rows={6} cols={6} />
              ) : (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-sage-soft/40 text-sage-muted uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-2">Image</th>
                          <th className="py-3 px-2">Formulation</th>
                          <th className="py-3 px-2">SKU</th>
                          <th className="py-3 px-2">Current Units</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Quick Stock Adjustment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sage-soft/20 text-sage-dark">
                        {inventoryItems.map((item) => (
                          <tr key={item._id} className="hover:bg-sage-soft/10">
                            <td className="py-3 px-2">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sage-soft/20">
                                <Image
                                  src={item.images?.[0] || '/images/products/serum-main.jpg'}
                                  alt={item.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <p className="font-semibold text-sage-dark">{item.name}</p>
                              <p className="text-[10px] text-sage-muted">
                                {typeof item.category === 'object' ? item.category?.name : 'Formulation'}
                              </p>
                            </td>
                            <td className="py-3 px-2 font-mono text-sage-muted">{item.SKU}</td>
                            <td className="py-3 px-2 font-bold text-sm">
                              {item.stock} <span className="text-[10px] font-normal text-sage-muted">flacons</span>
                            </td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  item.stock > 20
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : item.stock > 0
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.stock > 20 ? 'Optimal Stock' : item.stock > 0 ? 'Low Stock' : 'Depleted'}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  disabled={updatingStockId === item._id || item.stock <= 0}
                                  onClick={() => handleUpdateStock(item._id, Math.max(0, item.stock - 5))}
                                  className="px-2 py-1 rounded-lg border border-sage-soft text-sage-dark text-xs hover:bg-sage-soft/30 disabled:opacity-40"
                                  title="Decrease stock by 5"
                                >
                                  -5
                                </button>
                                <button
                                  disabled={updatingStockId === item._id}
                                  onClick={() => handleUpdateStock(item._id, item.stock + 10)}
                                  className="px-2 py-1 rounded-lg border border-sage-soft text-sage-dark text-xs hover:bg-sage-soft/30 disabled:opacity-40"
                                  title="Add 10 units"
                                >
                                  +10
                                </button>
                                <button
                                  disabled={updatingStockId === item._id}
                                  onClick={() => handleUpdateStock(item._id, item.stock + 50)}
                                  className="px-2.5 py-1 rounded-lg bg-sage-dark text-white text-xs font-semibold hover:bg-sage-primary disabled:opacity-40"
                                  title="Replenish 50 units"
                                >
                                  +50
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-sage-dark">Promotional Coupons & Vouchers</h2>
                  <p className="text-xs text-sage-muted">Create seasonal promotional incentives, percentage discounts, or fixed vouchers</p>
                </div>

                <button
                  onClick={() => {
                    setCCode(`SAGE${Math.floor(100 + Math.random() * 900)}`);
                    setShowCouponModal(true);
                  }}
                  className="px-4 py-2.5 bg-sage-dark hover:bg-sage-primary text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-soft-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Coupon</span>
                </button>
              </div>

              {loadingCoupons ? (
                <TableSkeleton rows={4} cols={6} />
              ) : (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-sage-soft/40 text-sage-muted uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-3">Coupon Code</th>
                          <th className="py-3 px-3">Discount</th>
                          <th className="py-3 px-3">Min Order</th>
                          <th className="py-3 px-3">Valid Until</th>
                          <th className="py-3 px-3 text-center">Times Used</th>
                          <th className="py-3 px-3 text-center">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sage-soft/20 text-sage-dark">
                        {coupons.map((c) => (
                          <tr key={c._id} className="hover:bg-sage-ivory/50">
                            <td className="py-3 px-3 font-mono font-bold text-sage-primary text-sm">{c.code}</td>
                            <td className="py-3 px-3 font-semibold">
                              {c.discountType === 'percentage' ? `${c.value}% OFF` : `Rs. ${c.value} OFF`}
                            </td>
                            <td className="py-3 px-3 text-sage-muted">Rs. {c.minOrderAmount?.toLocaleString() || 0}</td>
                            <td className="py-3 px-3 text-sage-muted">
                              {new Date(c.validUntil).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3 text-center font-semibold">{c.usageCount || 0}</td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {c.isActive ? 'Active' : 'Expired'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => promptDeleteCoupon(c._id)}
                                className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-white rounded-3xl p-6 sm:p-10 border border-sage-soft/40 shadow-soft space-y-8 animate-fade-in">
              <div>
                <h2 className="font-serif text-2xl text-sage-dark">Store Configuration & Logistics</h2>
                <p className="text-xs text-sage-muted">Configure shipping rules, announcement banner, contact info, and hero copy</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Brand & Announcement */}
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-semibold text-sage-dark border-b border-sage-soft/30 pb-2">
                    Header Announcement Banner
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-sage-dark mb-1">Store Name</label>
                    <input
                      type="text"
                      value={storeSettings.siteName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, siteName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sage-dark mb-1">Announcement Copy</label>
                    <input
                      type="text"
                      value={storeSettings.announcementText}
                      onChange={(e) => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft bg-white"
                    />
                  </div>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-sage-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storeSettings.announcementActive}
                      onChange={(e) => setStoreSettings({ ...storeSettings, announcementActive: e.target.checked })}
                      className="rounded text-sage-primary"
                    />
                    <span>Activate announcement ribbon across storefront</span>
                  </label>
                </div>

                {/* Shipping & Thresholds */}
                <div className="space-y-4 pt-4 border-t border-sage-soft/30">
                  <h3 className="font-serif text-base font-semibold text-sage-dark border-b border-sage-soft/30 pb-2">
                    Cash on Delivery Shipping Rules
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sage-dark mb-1">
                        Free Shipping Threshold (Rs.)
                      </label>
                      <input
                        type="number"
                        value={storeSettings.freeShippingThreshold}
                        onChange={(e) =>
                          setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft bg-white"
                      />
                      <p className="text-[11px] text-sage-muted mt-1">Orders above this qualify for free COD courier</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sage-dark mb-1">
                        Standard Delivery Fee (Rs.)
                      </label>
                      <input
                        type="number"
                        value={storeSettings.shippingFee}
                        onChange={(e) =>
                          setStoreSettings({ ...storeSettings, shippingFee: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft bg-white"
                      />
                      <p className="text-[11px] text-sage-muted mt-1">Charged on orders below free threshold</p>
                    </div>
                  </div>
                </div>

                {/* Concierge Contact Info */}
                <div className="space-y-4 pt-4 border-t border-sage-soft/30">
                  <h3 className="font-serif text-base font-semibold text-sage-dark border-b border-sage-soft/30 pb-2">
                    Concierge & Patron Support
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sage-dark mb-1">Support Email</label>
                      <input
                        type="email"
                        value={storeSettings.supportEmail}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-sage-dark mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={storeSettings.supportPhone}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-sage-soft/30 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-3 bg-sage-dark hover:bg-sage-primary text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-soft"
                  >
                    {savingSettings ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-center pb-4 border-b border-sage-soft/30 mb-4">
              <h3 className="font-serif text-xl text-sage-dark">
                {editingProduct ? 'Edit Botanical Formulation' : 'Create New Formulation'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-full text-sage-muted hover:text-sage-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Formulation Title</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Alpine Botanical Glow Elixir"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">Category</label>
                  <select
                    value={pCatId}
                    onChange={(e) => setPCatId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={pSKU}
                    onChange={(e) => setPSKU(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">Regular Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    value={pSalePrice}
                    onChange={(e) => setPSalePrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-sage-dark">Primary Image Path</label>
                  <label className="text-[11px] text-sage-primary hover:underline cursor-pointer font-medium">
                    <span>{uploadingImage ? 'Uploading...' : '📁 Upload Local Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingImage(true);
                        const fd = new FormData();
                        fd.append('file', file);
                        try {
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: fd,
                          });
                          if (res.ok) {
                            const d = await res.json();
                            setPImage(d.url);
                            showToast('Image uploaded successfully', 'success');
                          } else {
                            showToast('Upload failed. Allowed: JPG, PNG, WebP', 'error');
                          }
                        } catch (err) {
                          console.error(err);
                          showToast('Error uploading image', 'error');
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Short Summary</label>
                <input
                  type="text"
                  required
                  value={pShortDesc}
                  onChange={(e) => setPShortDesc(e.target.value)}
                  placeholder="1-2 sentences highlighting active botanical properties"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Full Description</label>
                <textarea
                  required
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-sage-dark">
                  <input
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                    className="rounded text-sage-primary"
                  />
                  <span>Featured Hero</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium text-sage-dark">
                  <input
                    type="checkbox"
                    checked={pTrending}
                    onChange={(e) => setPTrending(e.target.checked)}
                    className="rounded text-sage-primary"
                  />
                  <span>Trending</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium text-sage-dark">
                  <input
                    type="checkbox"
                    checked={pBestSeller}
                    onChange={(e) => setPBestSeller(e.target.checked)}
                    className="rounded text-sage-primary"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-sage-soft/30">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs text-sage-muted hover:text-sage-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sage-primary text-white rounded-xl text-xs font-semibold hover:bg-sage-accent transition-colors shadow-soft"
                >
                  Save Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-serif text-xl text-sage-dark mb-4">Create Botanical Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Botanical Facial Hydrosols"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short collection summary"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Image URL</label>
                <input
                  type="text"
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-xs text-sage-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sage-primary text-white rounded-xl text-xs font-semibold hover:bg-sage-accent"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl text-sage-dark font-medium">Create Promotional Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-sage-muted hover:text-sage-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={cCode}
                  onChange={(e) => setCCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAGE15"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">Type</label>
                  <select
                    value={cDiscountType}
                    onChange={(e) => setCDiscountType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={cValue}
                    onChange={(e) => setCValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">Min Spend (Rs.)</label>
                  <input
                    type="number"
                    value={cMinOrder}
                    onChange={(e) => setCMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sage-dark mb-1">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={cValidUntil}
                    onChange={(e) => setCValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-soft/30">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 text-xs text-sage-muted hover:text-sage-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sage-primary text-white rounded-xl text-xs font-semibold hover:bg-sage-accent transition-colors"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* PRINTABLE INVOICE MODAL */}
      {selectedOrderForInvoice && (
        <PrintableInvoice
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </div>
  );
}
