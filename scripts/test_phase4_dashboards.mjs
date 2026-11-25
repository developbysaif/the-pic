/**
 * PHASE 4 COMPREHENSIVE AUTOMATED TEST SUITE
 * Tests Master Admin Dashboard APIs and Customer Account Dashboard Operations
 * against real MongoDB.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

// Cookie helper
function parseCookies(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';
  return setCookie
    .split(',')
    .map((c) => c.split(';')[0].trim())
    .join('; ');
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`🌿 SAGE & BOTANICA — PHASE 4 DASHBOARDS TEST SUITE`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let adminCookie = '';
  let customerCookie = '';
  let customerUserId = '';

  // 1. AUTHENTICATION & ROLE-BASED ACCESS
  console.log(`[1] Testing Admin & Customer Authentication & Access Control...`);
  try {
    // Admin login
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sageandbotanica.com',
        password: 'admin12345',
      }),
    });
    const adminData = await adminRes.json();
    adminCookie = parseCookies(adminRes);
    assert(adminRes.status === 200 && adminData.user?.role === 'admin', 'Admin login successful with admin role');

    // Customer login
    const custRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@sageandbotanica.com',
        password: 'customer12345',
      }),
    });
    const custData = await custRes.json();
    customerCookie = parseCookies(custRes);
    customerUserId = custData.user?._id;
    assert(custRes.status === 200 && custData.user?.role === 'customer', 'Customer login successful with customer role');

    // Unauthorized access prevention
    const unauthInventoryRes = await fetch(`${BASE_URL}/api/admin/inventory`);
    assert(unauthInventoryRes.status === 403, 'Unauthenticated access to /api/admin/inventory blocked (403)');

    const custForbiddenRes = await fetch(`${BASE_URL}/api/admin/inventory`, {
      headers: { Cookie: customerCookie },
    });
    assert(custForbiddenRes.status === 403, 'Customer role accessing admin inventory blocked (403 Forbidden)');

    const custSettingsBlocked = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ shippingFee: 999 }),
    });
    assert(custSettingsBlocked.status === 403, 'Customer role updating admin settings blocked (403 Forbidden)');
  } catch (err) {
    assert(false, 'Authentication & Access Control', err.message);
  }

  // 2. ADMIN STATS & OVERVIEW API
  console.log(`\n[2] Testing Master Admin Stats & Overview Data...`);
  try {
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: adminCookie },
    });
    const stats = await statsRes.json();
    assert(statsRes.status === 200, 'Admin stats endpoint returns status 200');
    assert(typeof stats.metrics?.totalSales === 'number', 'Total sales is numeric');
    assert(typeof stats.metrics?.totalOrders === 'number', 'Total orders count is numeric');
    assert(typeof stats.metrics?.totalCustomers === 'number', 'Total customers count is numeric');
    assert(typeof stats.metrics?.lowStockCount === 'number', 'Low stock count is numeric');
    assert(stats.monthlyRevenue && typeof stats.monthlyRevenue === 'object', 'Monthly revenue data object exists');
    assert(Array.isArray(stats.recentOrders), 'Recent orders array returned');
  } catch (err) {
    assert(false, 'Admin Stats API', err.message);
  }

  // 3. STORE SETTINGS & LOGISTICS API
  console.log(`\n[3] Testing Store Configuration & Logistics API...`);
  try {
    const getSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      headers: { Cookie: adminCookie },
    });
    const initialSettings = await getSettingsRes.json();
    assert(getSettingsRes.status === 200 && initialSettings.settings?.siteName, 'GET /api/admin/settings returns configuration');

    const updateSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        freeShippingThreshold: 4000,
        shippingFee: 300,
        announcementText: '🌿 Phase 4 Test: Complimentary Express Delivery over Rs. 4,000',
      }),
    });
    const updatedSettings = await updateSettingsRes.json();
    assert(updateSettingsRes.status === 200, 'PUT /api/admin/settings returns 200');
    assert(
      updatedSettings.settings?.freeShippingThreshold === 4000 &&
      updatedSettings.settings?.shippingFee === 300,
      'Settings successfully updated in MongoDB'
    );
  } catch (err) {
    assert(false, 'Store Settings API', err.message);
  }

  // 4. STOCK & INVENTORY CONSOLE API
  console.log(`\n[4] Testing Stock & Inventory Management Console...`);
  let testProductId = '';
  try {
    const invRes = await fetch(`${BASE_URL}/api/admin/inventory`, {
      headers: { Cookie: adminCookie },
    });
    const invData = await invRes.json();
    assert(invRes.status === 200, 'GET /api/admin/inventory returns 200');
    assert(Array.isArray(invData.items) && invData.items.length > 0, 'Inventory items list populated');
    assert(typeof invData.lowStockCount === 'number', 'lowStockCount metric calculated');

    testProductId = invData.items[0]._id;
    const oldStock = invData.items[0].stock;
    const newStock = oldStock + 15;

    // Update stock quantity
    const updateStockRes = await fetch(`${BASE_URL}/api/admin/inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        productId: testProductId,
        stock: newStock,
      }),
    });
    const updateStockData = await updateStockRes.json();
    assert(updateStockRes.status === 200, 'PUT /api/admin/inventory returns 200');
    assert(updateStockData.product?.stock === newStock, `Stock updated from ${oldStock} to ${newStock} units`);
  } catch (err) {
    assert(false, 'Stock & Inventory Console', err.message);
  }

  // 5. PRODUCT CATALOG MANAGEMENT (CRUD)
  console.log(`\n[5] Testing Product Catalog Management (Admin CRUD)...`);
  let createdProductSlug = '';
  try {
    // Get existing categories to assign
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    const catData = await catRes.json();
    const catId = catData.categories?.[0]?._id;

    const testSKU = `SAGE-P4-${Date.now().toString().slice(-4)}`;
    const createProdRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Phase 4 Rare Alpine Serum',
        shortDescription: 'High potency test formulation with alpine cold-pressed botanicals.',
        description: 'Thoroughly tested active botanical extract for cellular hydration.',
        category: catId,
        price: 4500,
        salePrice: 3800,
        SKU: testSKU,
        stock: 35,
        images: ['/images/products/serum-main.jpg'],
        status: 'published',
        variants: [
          {
            id: 'v1',
            name: 'Standard Flacon',
            value: '#789575',
            sku: testSKU,
            price: 4500,
            salePrice: 3800,
            stock: 35,
            active: true,
            image: '/images/products/serum-main.jpg',
          },
        ],
      }),
    });

    const createProdData = await createProdRes.json();
    assert(createProdRes.status === 201, 'POST /api/products creates formulation (201)');
    createdProductSlug = createProdData.product?.slug;
    assert(Boolean(createdProductSlug), `Product created with slug: ${createdProductSlug}`);

    // Update product
    const updateProdRes = await fetch(`${BASE_URL}/api/products/${createdProductSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Phase 4 Rare Alpine Serum (Updated)',
        price: 4800,
      }),
    });
    assert(updateProdRes.status === 200, 'PUT /api/products/:slug updates formulation');

    // Delete product
    const deleteProdRes = await fetch(`${BASE_URL}/api/products/${createdProductSlug}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteProdRes.status === 200, 'DELETE /api/products/:slug removes formulation');
  } catch (err) {
    assert(false, 'Product Catalog CRUD', err.message);
  }

  // 6. CATEGORY MANAGEMENT (CRUD)
  console.log(`\n[6] Testing Category Management (Admin CRUD)...`);
  let createdCatId = '';
  try {
    const createCatRes = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: `Test Apothecary Collection ${Date.now().toString().slice(-4)}`,
        description: 'Temporary botanical category for testing',
        image: '/images/products/mist-main.jpg',
        displayOrder: 99,
      }),
    });
    const createCatData = await createCatRes.json();
    assert(createCatRes.status === 201, 'POST /api/categories creates category');
    createdCatId = createCatData.category?._id;

    // Delete category
    const deleteCatRes = await fetch(`${BASE_URL}/api/categories/${createdCatId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteCatRes.status === 200, 'DELETE /api/categories/:id deletes category');
  } catch (err) {
    assert(false, 'Category CRUD', err.message);
  }

  // 7. PROMOTIONAL COUPONS MANAGEMENT
  console.log(`\n[7] Testing Promotional Coupons Console...`);
  let createdCouponId = '';
  const testCouponCode = `TESTP4${Math.floor(100 + Math.random() * 900)}`;
  try {
    const createCouponRes = await fetch(`${BASE_URL}/api/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        code: testCouponCode,
        discountType: 'percentage',
        value: 20,
        minOrderAmount: 2000,
        validUntil: '2028-12-31',
        isActive: true,
      }),
    });
    const createCouponData = await createCouponRes.json();
    assert(createCouponRes.status === 201, `POST /api/coupons creates voucher code: ${testCouponCode}`);
    createdCouponId = createCouponData.coupon?._id;

    // Validate coupon
    const validateCouponRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testCouponCode,
        orderAmount: 3000,
      }),
    });
    const valData = await validateCouponRes.json();
    assert(validateCouponRes.status === 200 && valData.discount === 600, 'Coupon validation accurately computes 20% discount');

    // Delete coupon
    const deleteCouponRes = await fetch(`${BASE_URL}/api/coupons/${createdCouponId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteCouponRes.status === 200, 'DELETE /api/coupons/:id removes voucher');
  } catch (err) {
    assert(false, 'Coupon Management', err.message);
  }

  // 8. ORDER LIFECYCLE & RETURN FLOW
  console.log(`\n[8] Testing Order Lifecycle, Status Milestones & Return Flow...`);
  let testOrderId = '';
  try {
    // 1. Customer creates a COD order
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({
        customerDetails: {
          name: 'Patron Tester',
          email: 'customer@sageandbotanica.com',
          phone: '+92 300 9988776',
        },
        shippingAddress: {
          street: '45-B Gulberg Botanical Ave',
          city: 'Lahore',
          state: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
          notes: 'Leave at front reception',
        },
        items: [
          {
            productId: testProductId,
            variantId: 'v1',
            title: 'Sage Balancing Serum',
            variantName: 'Standard Flacon',
            image: '/images/products/serum-main.jpg',
            price: 3200,
            quantity: 1,
            sku: 'SAGE-SER-001',
            slug: 'sage-balancing-serum',
          },
        ],
        subtotal: 3200,
        discount: 0,
        shippingFee: 250,
        total: 3450,
        paymentMethod: 'COD',
      }),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201, 'Customer places Cash on Delivery order (201)');
    testOrderId = orderData.order?._id;
    assert(Boolean(testOrderId), `Order initialized with ID: ${testOrderId} (#${orderData.order?.orderNumber})`);

    // 2. Admin updates order to CONFIRMED and assigns tracking
    const updateOrderRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        orderStatus: 'CONFIRMED',
        courierCompany: 'TCS Express',
        trackingNumber: 'TCS-P4-998811',
      }),
    });
    assert(updateOrderRes.status === 200, 'Admin confirms order and assigns courier tracking');

    // 3. Admin marks order as DELIVERED and COD payment COLLECTED
    const deliverOrderRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        orderStatus: 'DELIVERED',
        paymentStatus: 'COLLECTED',
      }),
    });
    assert(deliverOrderRes.status === 200, 'Admin marks order DELIVERED with COD COLLECTED');

    // 4. Customer requests return on the delivered order
    const returnRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({
        reason: 'Fragrance note differs from preference, requested exchange',
      }),
    });
    const returnData = await returnRes.json();
    assert(returnRes.status === 200, 'Customer submits return request on delivered order (200)');
    assert(returnData.order?.orderStatus === 'RETURN_REQUESTED', 'Order status updated to RETURN_REQUESTED');
    const hasReturnMilestone = returnData.order?.statusHistory?.some((h) => h.status === 'RETURN_REQUESTED');
    assert(hasReturnMilestone, 'Status history timeline includes return request milestone log');
  } catch (err) {
    assert(false, 'Order Lifecycle & Returns', err.message);
  }

  // 9. CUSTOMER ADDRESS BOOK & PROFILE
  console.log(`\n[9] Testing Customer Shipping Address & Profile CRUD...`);
  try {
    const addressPayload = [
      {
        title: 'Penthouse Office',
        street: '88 Tech Boulevard, Phase 5 DHA',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '54792',
        country: 'Pakistan',
        phone: '+92 300 5544332',
        isDefault: true,
      },
    ];

    const addAddressRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ addresses: addressPayload }),
    });
    const addAddressData = await addAddressRes.json();
    assert(addAddressRes.status === 200, 'Customer saves new shipping destination');
    assert(addAddressData.user?.addresses?.length > 0, 'Address saved into customer MongoDB profile');
  } catch (err) {
    assert(false, 'Customer Address Book', err.message);
  }

  // 10. CUSTOMER WISHLIST SYNC
  console.log(`\n[10] Testing Customer Wishlist Database Sync...`);
  try {
    // Add product to wishlist
    const addWishRes = await fetch(`${BASE_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ productId: testProductId }),
    });
    assert(addWishRes.status === 200, 'Customer adds formulation to wishlist');

    // Get wishlist
    const getWishRes = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { Cookie: customerCookie },
    });
    const wishData = await getWishRes.json();
    assert(getWishRes.status === 200, 'GET /api/wishlist returns 200');
    assert(Array.isArray(wishData.items) && wishData.items.length > 0, 'Wishlist contains populated botanical formulations');

    // Remove from wishlist
    const removeWishRes = await fetch(`${BASE_URL}/api/wishlist`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ productId: testProductId }),
    });
    assert(removeWishRes.status === 200, 'Customer removes formulation from wishlist');
  } catch (err) {
    assert(false, 'Customer Wishlist Sync', err.message);
  }

  // SUMMARY REPORT
  console.log(`\n======================================================`);
  console.log(`📊 PHASE 4 TEST RESULTS SUMMARY`);
  console.log(`Total Assertions : ${passed + failed}`);
  console.log(`Passed           : ${passed}`);
  console.log(`Failed           : ${failed}`);
  console.log(`Score            : ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
