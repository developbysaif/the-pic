'use client';
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  Heart,
  CheckCircle2,
  Truck,
  Shield,
  LogOut,
  Plus,
  Trash2,
  ShoppingBag,
  Bell,
  Printer,
  RotateCcw,
  Edit2,
  X,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import PrintableInvoice from '@/components/admin/PrintableInvoice';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  // Return Request Modal State
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Profile Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Address Form state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    street: '',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
    phone: '',
    isDefault: false,
  });

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: true,
    onConfirm: null,
  });

  // Sync tab with URL
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Load orders and populate profile
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');

      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) {
            setOrders(data.orders);
            if (data.orders.length > 0 && !selectedOrderForTracking) {
              setSelectedOrderForTracking(data.orders[0]);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [user, selectedOrderForTracking]);

  // Derived Notifications from orders and store updates
  const notifications = useMemo(() => {
    const list = [];
    orders.forEach((o) => {
      if (o.orderStatus === 'DELIVERED') {
        list.push({
          id: `notif-del-${o._id}`,
          title: `Order Delivered: #${o.orderNumber}`,
          desc: `Your botanical package has been successfully delivered and COD payment collected.`,
          date: o.updatedAt || o.createdAt,
          type: 'success',
        });
      } else if (o.orderStatus === 'DISPATCHED' || o.orderStatus === 'OUT_FOR_DELIVERY') {
        list.push({
          id: `notif-disp-${o._id}`,
          title: `Courier In Transit: #${o.orderNumber}`,
          desc: `Parcel is in transit via ${o.courierCompany || 'TCS Express'} (Tracking: ${o.trackingNumber || 'Assigned'}).`,
          date: o.updatedAt || o.createdAt,
          type: 'info',
        });
      } else if (o.orderStatus === 'CONFIRMED') {
        list.push({
          id: `notif-conf-${o._id}`,
          title: `Order Confirmed: #${o.orderNumber}`,
          desc: `Our herbalists are carefully packing your active cold-pressed formulations.`,
          date: o.createdAt,
          type: 'info',
        });
      } else if (o.orderStatus === 'RETURN_REQUESTED') {
        list.push({
          id: `notif-ret-${o._id}`,
          title: `Return Requested: #${o.orderNumber}`,
          desc: `Your return request is under review by our botanical concierge.`,
          date: o.updatedAt || o.createdAt,
          type: 'warning',
        });
      }
    });

    // Default welcome notice
    list.push({
      id: 'welcome-sage',
      title: 'Welcome to SAGE & BOTANICA Club',
      desc: 'Complimentary Express COD Shipping applies on all orders over Rs. 3,500.',
      date: user?.createdAt || new Date(),
      type: 'info',
    });

    return list;
  }, [orders, user]);

  // Order Cancellation
  const promptCancelOrder = (orderId, orderNumber) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Formulation Order',
      message: `Are you sure you want to cancel order #${orderNumber}? Reserved botanicals will be returned to inventory.`,
      confirmLabel: 'Cancel Order',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
            if (selectedOrderForTracking?._id === orderId) {
              setSelectedOrderForTracking(data.order);
            }
            showToast(`Order #${orderNumber} cancelled successfully`, 'success');
          } else {
            const err = await res.json();
            showToast(err.error || 'Failed to cancel order', 'error');
          }
        } catch {
          showToast('Network error cancelling order', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Submit Return Request
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    setSubmittingReturn(true);

    try {
      const res = await fetch(`/api/orders/${returnModalOrder._id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o._id === returnModalOrder._id ? data.order : o))
        );
        if (selectedOrderForTracking?._id === returnModalOrder._id) {
          setSelectedOrderForTracking(data.order);
        }
        setReturnModalOrder(null);
        setReturnReason('');
        showToast('Return request submitted for concierge review', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to submit return request', 'error');
      }
    } catch {
      showToast('Network error submitting return request', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword('');
        setNewPassword('');
        refreshUser();
        showToast('Profile information saved successfully', 'success');
      } else {
        showToast(data.error || 'Update failed', 'error');
      }
    } catch {
      showToast('Network error updating profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        const profileRes = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: url }),
        });

        if (profileRes.ok) {
          refreshUser();
          showToast('Profile avatar updated', 'success');
        }
      } else {
        showToast('Avatar upload failed. Allowed: JPG, PNG, WebP', 'error');
      }
    } catch {
      showToast('Error uploading avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Address Save (Create or Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.phone) {
      showToast('Please complete required address fields', 'warning');
      return;
    }

    let updated = [...(user.addresses || [])];
    if (editingAddressIndex !== null) {
      updated[editingAddressIndex] = addressForm;
    } else {
      if (addressForm.isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }
      updated.push(addressForm);
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: updated }),
      });

      if (res.ok) {
        setShowAddressModal(false);
        setEditingAddressIndex(null);
        setAddressForm({
          title: 'Home',
          street: '',
          city: 'Lahore',
          state: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
          phone: '',
          isDefault: false,
        });
        refreshUser();
        showToast('Shipping address stored successfully', 'success');
      } else {
        showToast('Failed to save address', 'error');
      }
    } catch {
      showToast('Network error saving address', 'error');
    }
  };

  const promptDeleteAddress = (index) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Address',
      message: 'Are you sure you want to remove this delivery address?',
      confirmLabel: 'Delete Address',
      isDestructive: true,
      onConfirm: async () => {
        const updated = (user.addresses || []).filter((_, i) => i !== index);
        try {
          const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses: updated }),
          });
          if (res.ok) {
            refreshUser();
            showToast('Address removed', 'success');
          }
        } catch {
          showToast('Failed to delete address', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Timeline Step Tracker
  const timelineSteps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'DISPATCHED', label: 'Dispatched' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status) => {
    const idx = timelineSteps.findIndex((s) => s.key === status);
    return idx > -1 ? idx : 0;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-sage-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sage-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
    { id: 'track', label: 'Track Order', icon: Truck },
    { id: 'addresses', label: `Addresses (${user.addresses?.length || 0})`, icon: MapPin },
    { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
    { id: 'notifications', label: `Notifications (${notifications.length})`, icon: Bell },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <div className="bg-sage-ivory min-h-screen py-10 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Patron Greeting Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-sage-primary text-white flex items-center justify-center font-serif text-2xl font-bold shadow-soft">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill sizes="64px" className="object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <label
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white"
                title="Change Avatar"
              >
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                />
              </label>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-2xl text-sage-dark font-normal">Welcome, {user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sage-dark text-sage-ivory">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-sage-muted mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-sage-dark text-sage-ivory text-xs font-semibold hover:bg-black transition-colors flex items-center space-x-1.5 shadow-soft-sm"
              >
                <Shield className="w-3.5 h-3.5 text-sage-bg" />
                <span>Admin Console</span>
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-xl bg-white border border-sage-soft text-sage-dark text-xs font-semibold hover:bg-red-50 hover:text-red-700 transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-sage-soft/40 overflow-x-auto pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-sage-dark text-white shadow-soft-sm'
                    : 'bg-white/70 text-sage-dark hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft">
                <span className="text-[11px] font-bold text-sage-muted uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="font-serif text-3xl font-bold text-sage-dark mt-2 block">
                  {orders.length}
                </span>
                <span className="text-xs text-sage-muted mt-1 block">Lifetime botanical orders</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft">
                <span className="text-[11px] font-bold text-sage-muted uppercase tracking-wider block">
                  Pending / In Transit
                </span>
                <span className="font-serif text-3xl font-bold text-sage-primary mt-2 block">
                  {orders.filter((o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length}
                </span>
                <span className="text-xs text-sage-muted mt-1 block">Handled with TCS Express COD</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft">
                <span className="text-[11px] font-bold text-sage-muted uppercase tracking-wider block">
                  Delivered Rituals
                </span>
                <span className="font-serif text-3xl font-bold text-emerald-700 mt-2 block">
                  {orders.filter((o) => o.orderStatus === 'DELIVERED').length}
                </span>
                <span className="text-xs text-sage-muted mt-1 block">Successfully received & paid</span>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-serif text-xl text-sage-dark">Recent Orders</h3>
                  <p className="text-xs text-sage-muted">Your latest formulations & consignment dispatches</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-sage-primary hover:underline"
                >
                  View All Orders &rarr;
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 text-xs text-sage-muted">
                  You have not placed any botanical orders yet.
                </div>
              ) : (
                <div className="divide-y divide-sage-soft/30">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order._id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-sage-dark">
                            {order.orderNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-sage-soft/40 text-sage-dark">
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-sage-muted mt-1">
                          {order.items?.length || 0} items • Rs. {order.total?.toLocaleString()} • Cash on Delivery
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="px-3 py-1.5 rounded-xl border border-sage-soft text-sage-dark text-xs font-semibold hover:bg-sage-bg/30 flex items-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrderForTracking(order);
                            setActiveTab('track');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-sage-dark text-sage-ivory text-xs font-semibold hover:bg-sage-primary transition-colors"
                        >
                          Track Parcel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl text-sage-dark">Order History</h2>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sage-soft/40">
                <Package className="w-12 h-12 text-sage-muted mx-auto mb-3" />
                <h4 className="font-serif text-lg text-sage-dark">No orders found</h4>
                <p className="text-xs text-sage-muted mt-1">
                  Start your botanical ritual today. All orders feature Cash on Delivery.
                </p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-sage-primary text-white text-xs font-semibold"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sage-soft/30 gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-sage-dark">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-sage-muted ml-3">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'RETURN_REQUESTED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-sage-soft/40 text-sage-dark'
                        }`}
                      >
                        {order.orderStatus}
                      </span>

                      {/* Cancel order button if pending/confirmed */}
                      {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
                        <button
                          onClick={() => promptCancelOrder(order._id, order.orderNumber)}
                          className="px-3 py-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Return request button if delivered */}
                      {order.orderStatus === 'DELIVERED' && (
                        <button
                          onClick={() => setReturnModalOrder(order)}
                          className="px-3 py-1.5 rounded-xl border border-sage-primary text-sage-primary hover:bg-sage-bg/30 text-xs font-semibold transition-colors flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return / Exchange</span>
                        </button>
                      )}

                      {/* Print Invoice */}
                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="px-3 py-1.5 rounded-xl border border-sage-soft text-sage-dark hover:bg-sage-bg/30 text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrderForTracking(order);
                          setActiveTab('track');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-sage-primary text-white text-xs font-semibold hover:bg-sage-accent transition-colors"
                      >
                        Track Progress
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-sage-soft/20">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sage-soft/20 shrink-0">
                            <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                          </div>
                          <div>
                            <Link href={`/product/${item.slug}`} className="font-medium text-sage-dark hover:underline">
                              {item.title}
                            </Link>
                            <p className="text-[11px] text-sage-muted">
                              {item.variantName} &times; {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-sage-dark">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom info */}
                  <div className="pt-3 border-t border-sage-soft/30 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-sage-dark gap-2">
                    <div className="flex items-center space-x-3 text-sage-muted">
                      <span>
                        Payment: <strong>Cash on Delivery ({order.paymentStatus})</strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Courier: <strong>{order.courierCompany || 'TCS Express'}</strong>
                      </span>
                    </div>
                    <div className="text-base font-serif font-bold text-sage-dark">
                      Total: Rs. {order.total?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: TRACK ORDER */}
        {activeTab === 'track' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-sage-dark">Live Delivery Tracker</h2>
                <p className="text-xs text-sage-muted">Track your consignment through every milestone of delivery</p>
              </div>

              {orders.length > 1 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-sage-muted font-medium">Select Order:</span>
                  <select
                    value={selectedOrderForTracking?._id || ''}
                    onChange={(e) => {
                      const found = orders.find((o) => o._id === e.target.value);
                      if (found) setSelectedOrderForTracking(found);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-sage-soft bg-white text-xs font-semibold text-sage-dark"
                  >
                    {orders.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.orderNumber} ({o.orderStatus})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedOrderForTracking ? (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-sage-soft/40 shadow-soft space-y-8">
                {/* Header for tracking */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage-soft/30 gap-4">
                  <div>
                    <span className="text-xs text-sage-muted">Tracking Order:</span>
                    <h3 className="font-mono text-xl font-bold text-sage-dark">
                      {selectedOrderForTracking.orderNumber}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-sage-muted block">Courier Service:</span>
                    <span className="text-xs font-semibold text-sage-dark">
                      {selectedOrderForTracking.courierCompany || 'TCS Courier'} &bull; Tracking #:{' '}
                      {selectedOrderForTracking.trackingNumber || 'Pending Dispatch'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Steps */}
                <div className="py-6">
                  <div className="relative">
                    <div className="absolute top-4 inset-x-8 h-1 bg-sage-soft/50 z-0" />
                    <div
                      className="absolute top-4 left-8 h-1 bg-sage-primary z-0 transition-all duration-700"
                      style={{
                        width: `${
                          (getStepIndex(selectedOrderForTracking.orderStatus) /
                            (timelineSteps.length - 1)) *
                          90
                        }%`,
                      }}
                    />

                    <div className="relative z-10 flex justify-between">
                      {timelineSteps.map((step, idx) => {
                        const currentIdx = getStepIndex(selectedOrderForTracking.orderStatus);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={step.key} className="flex flex-col items-center text-center">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-sage-primary text-white shadow-md'
                                  : 'bg-white border-2 border-sage-soft text-sage-muted'
                              } ${isCurrent ? 'ring-4 ring-sage-primary/30 scale-110' : ''}`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] mt-2 font-medium max-w-[70px] ${
                                isDone ? 'text-sage-dark font-semibold' : 'text-sage-muted'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Status Timeline History */}
                <div className="pt-6 border-t border-sage-soft/30 space-y-4">
                  <h4 className="font-serif text-base text-sage-dark font-semibold">
                    Activity Timeline & Milestone Logs
                  </h4>
                  <div className="space-y-3">
                    {selectedOrderForTracking.statusHistory &&
                    selectedOrderForTracking.statusHistory.length > 0 ? (
                      selectedOrderForTracking.statusHistory.map((hist, idx) => (
                        <div key={idx} className="flex items-start space-x-3 text-xs">
                          <span className="w-2 h-2 rounded-full bg-sage-primary shrink-0 mt-1.5" />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-bold text-sage-dark uppercase tracking-wider text-[11px]">
                                {hist.status}
                              </span>
                              <span className="text-[10px] text-sage-muted">
                                {new Date(hist.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {hist.note && <p className="text-sage-dark/80 mt-0.5">{hist.note}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-sage-muted">No timeline entries yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center text-xs text-sage-muted border border-sage-soft/40">
                Please select an order to inspect live delivery milestones.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl text-sage-dark">Shipping Destinations</h2>
                <p className="text-xs text-sage-muted">Saved delivery addresses for swift Cash on Delivery checkout</p>
              </div>
              <button
                onClick={() => {
                  setEditingAddressIndex(null);
                  setAddressForm({
                    title: 'Home',
                    street: '',
                    city: 'Lahore',
                    state: 'Punjab',
                    postalCode: '54000',
                    country: 'Pakistan',
                    phone: user.phone || '',
                    isDefault: (user.addresses || []).length === 0,
                  });
                  setShowAddressModal(true);
                }}
                className="px-4 py-2 bg-sage-dark hover:bg-sage-primary text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-soft-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Destination</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-6 border border-sage-soft/40 shadow-soft flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-serif text-base font-semibold text-sage-dark">
                          {addr.title}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase">
                            Default Address
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-sage-dark/80 leading-relaxed">{addr.street}</p>
                      <p className="text-xs text-sage-dark/80">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-xs text-sage-muted mt-2">Recipient Phone: {addr.phone}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-sage-soft/30 flex justify-end space-x-3 text-xs">
                      <button
                        onClick={() => {
                          setEditingAddressIndex(idx);
                          setAddressForm({ ...addr });
                          setShowAddressModal(true);
                        }}
                        className="text-sage-primary hover:underline flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => promptDeleteAddress(idx)}
                        className="text-red-600 hover:underline flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white rounded-3xl p-10 text-center text-xs text-sage-muted border border-sage-soft/40">
                  No addresses saved yet. Click &ldquo;Add Destination&rdquo; to store your delivery details.
                </div>
              )}
            </div>

            {/* Address Modal */}
            {showAddressModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                  <h3 className="font-serif text-xl text-sage-dark mb-4">
                    {editingAddressIndex !== null ? 'Edit Shipping Destination' : 'Add Shipping Destination'}
                  </h3>
                  <form onSubmit={handleSaveAddress} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Address Title
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.title}
                        onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                        placeholder="e.g. Home, Office, Villa"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Street Address & House #
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="House, Street, Area"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-sage-dark mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Recipient Contact Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="0300 1234567"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                      />
                    </div>
                    <label className="flex items-center space-x-2 pt-2 text-xs text-sage-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="rounded text-sage-primary"
                      />
                      <span>Set as default delivery address</span>
                    </label>
                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="px-4 py-2 text-xs text-sage-muted hover:text-sage-dark"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-sage-primary text-white rounded-xl text-xs font-semibold hover:bg-sage-accent transition-colors shadow-soft"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl text-sage-dark">Your Curated Wishlist</h2>

            {wishlist.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sage-soft/40">
                <Heart className="w-12 h-12 text-sage-muted mx-auto mb-3" />
                <h4 className="font-serif text-lg text-sage-dark">Your Wishlist is Empty</h4>
                <p className="text-xs text-sage-muted mt-1">
                  Save your favorite botanical formulas while exploring the shop.
                </p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-sage-primary text-white text-xs font-semibold shadow-soft"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-3xl p-5 border border-sage-soft/40 shadow-soft flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-sage-soft/20 mb-3">
                        <Image
                          src={product.images?.[0] || '/images/products/serum-main.jpg'}
                          alt={product.name}
                          fill
                          sizes="300px"
                          className="object-cover"
                        />
                      </div>
                      <h4 className="font-serif text-base text-sage-dark font-medium line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="font-bold text-sm text-sage-dark mt-1">
                        Rs. {(product.salePrice || product.price).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-sage-soft/30 flex space-x-2">
                      <button
                        onClick={() => {
                          addItem({
                            productId: product._id,
                            variantId: product.variants?.[0]?.id || 'default',
                            title: product.name,
                            variantName: product.variants?.[0]?.name || 'Standard',
                            image: product.images?.[0] || '/images/products/serum-main.jpg',
                            price: product.salePrice || product.price,
                            quantity: 1,
                            sku: product.SKU,
                            slug: product.slug,
                          });
                          showToast(`"${product.name}" moved to bag`, 'success');
                        }}
                        className="flex-1 py-2 bg-sage-primary text-white rounded-xl text-xs font-semibold hover:bg-sage-accent transition-colors flex items-center justify-center space-x-1 shadow-soft-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleWishlist(product);
                          showToast('Removed from wishlist', 'info');
                        }}
                        className="p-2 border border-sage-soft rounded-xl text-sage-muted hover:text-red-500"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif text-2xl text-sage-dark">Notification Center</h2>
              <p className="text-xs text-sage-muted">Milestone alerts regarding your Cash on Delivery dispatches</p>
            </div>

            <div className="divide-y divide-sage-soft/30">
              {notifications.map((n) => (
                <div key={n.id} className="py-4 flex items-start space-x-3.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : n.type === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sage-bg text-sage-dark'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-semibold text-sage-dark">{n.title}</h4>
                      <span className="text-[10px] text-sage-muted">
                        {new Date(n.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-sage-muted mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-xl bg-white rounded-3xl p-8 border border-sage-soft/40 shadow-soft space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl text-sage-dark">Profile Settings</h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-sage-ivory/50 border border-sage-soft"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-gray-100 border border-gray-200 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-sage-ivory/50 border border-sage-soft"
                />
              </div>

              <div className="pt-4 border-t border-sage-soft/30 space-y-3">
                <h4 className="text-xs font-bold text-sage-dark uppercase tracking-wider">
                  Update Password (Optional)
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 text-xs rounded-xl bg-sage-ivory/50 border border-sage-soft"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 text-xs rounded-xl bg-sage-ivory/50 border border-sage-soft"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3 bg-sage-dark hover:bg-sage-primary text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-soft"
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </div>

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

      {/* RETURN REQUEST MODAL */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-semibold text-sage-dark">
                Request Return / Exchange
              </h3>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="text-sage-muted hover:text-sage-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-sage-muted mb-4">
              Order #{returnModalOrder.orderNumber}. Our concierge team guarantees hassle-free returns within 7 days of delivery.
            </p>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sage-dark mb-1">
                  Reason for Return or Exchange
                </label>
                <textarea
                  required
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Skin sensitivity, seal damaged, or exchange request..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sage-soft"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="px-4 py-2 text-xs text-sage-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="px-5 py-2 bg-sage-dark text-white rounded-xl text-xs font-semibold hover:bg-sage-primary disabled:opacity-50"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sage-ivory flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sage-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
