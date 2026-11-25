const BASE_URL = 'http://localhost:3000';

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('🌿 SAGE & BOTANICA PHASE 3 BACKEND TEST RUNNER');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // SECTION 1: DATABASE INTEGRATION & PRODUCTS
    console.log('--- Test Suite 1: Database Models & Catalog Search/Filtering ---');
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    assert(prodRes.status === 200, 'GET /api/products returns 200');
    const prodData = await prodRes.json();
    assert(prodData.products?.length >= 6, `Catalog contains ${prodData.products?.length} formulations`);

    // Search query
    const searchRes = await fetch(`${BASE_URL}/api/products?search=sage`);
    const searchData = await searchRes.json();
    assert(searchData.products?.length > 0, `Search query 'sage' returned ${searchData.products?.length} products`);

    // Sorting & Filtering
    const sortRes = await fetch(`${BASE_URL}/api/products?sort=price_asc&minPrice=2000`);
    const sortData = await sortRes.json();
    assert(sortData.products?.length > 0, 'Products filtered by minPrice and sorted by price_asc');
    if (sortData.products?.length >= 2) {
      assert(sortData.products[0].price <= sortData.products[1].price, 'Ascending price sorting verified');
    }

    // SECTION 2: AUTHENTICATION, FORGOT PASSWORD & RECOVERY
    console.log('\n--- Test Suite 2: Complete Authentication & Password Recovery Flow ---');
    const testEmail = `patron_test_${Date.now()}@sageandbotanica.com`;
    const initialPassword = 'securePass123!';
    const newPassword = 'updatedPass456!';

    // Register
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Zahra Al-Hassan',
        email: testEmail,
        password: initialPassword,
        phone: '+92 301 9876543',
      }),
    });
    assert(regRes.status === 201, `Customer registered successfully: ${testEmail}`);
    const regCookie = regRes.headers.get('set-cookie');

    // Forgot Password
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    assert(forgotRes.status === 200, 'POST /api/auth/forgot-password dispatches recovery instructions');
    const forgotData = await forgotRes.json();
    const resetToken = forgotData.resetToken;
    assert(!!resetToken, 'Secure reset token generated for recovery');

    // Reset Password
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword }),
    });
    assert(resetRes.status === 200, 'POST /api/auth/reset-password updates password in MongoDB');

    // Login with new password
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword }),
    });
    assert(loginRes.status === 200, 'Customer authenticated with newly updated password');
    const sessionCookie = loginRes.headers.get('set-cookie');

    // Verify /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meData = await meRes.json();
    assert(meData.user?.email === testEmail, 'Session token verified against user record');

    // SECTION 3: ADDRESS MANAGEMENT & PROFILE UPDATE
    console.log('\n--- Test Suite 3: Profile Management & Addresses ---');
    const addressPayload = [
      {
        title: 'Penthouse Apartment',
        street: '14-C, Upper Mall Avenue',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '54000',
        country: 'Pakistan',
        phone: '+92 301 9876543',
        isDefault: true,
      },
    ];

    const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        name: 'Zahra Al-Hassan (Verified)',
        addresses: addressPayload,
      }),
    });
    assert(profileRes.status === 200, 'PUT /api/auth/profile updates customer name and saved addresses');
    const profileData = await profileRes.json();
    assert(profileData.user?.addresses?.length === 1, 'Address saved into MongoDB user document');

    // SECTION 4: SERVER-PERSISTED WISHLIST
    console.log('\n--- Test Suite 4: Database-Backed Wishlist Operations ---');
    const sampleProduct = prodData.products[0];
    const sampleProduct2 = prodData.products[1];

    // Add to wishlist
    const wishAddRes = await fetch(`${BASE_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({ productId: sampleProduct._id }),
    });
    assert(wishAddRes.status === 200, 'POST /api/wishlist adds product to user wishlist in MongoDB');
    const wishAddData = await wishAddRes.json();
    assert(wishAddData.isInWishlist === true, 'Product confirmed added to wishlist');

    // Add second product
    await fetch(`${BASE_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({ productId: sampleProduct2._id }),
    });

    // Fetch wishlist
    const wishGetRes = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { Cookie: sessionCookie },
    });
    const wishGetData = await wishGetRes.json();
    assert(wishGetData.wishlist?.length === 2, `GET /api/wishlist returns ${wishGetData.wishlist?.length} populated items from MongoDB`);

    // Remove from wishlist
    const wishDelRes = await fetch(`${BASE_URL}/api/wishlist?productId=${sampleProduct._id}`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    assert(wishDelRes.status === 200, 'DELETE /api/wishlist removes product from user wishlist in MongoDB');

    // SECTION 5: CART, STOCK VERIFICATION & COD CHECKOUT
    console.log('\n--- Test Suite 5: Shopping Cart, Stock Validation & COD Checkout ---');
    const initialStock = sampleProduct.stock;

    const cartItem = {
      productId: sampleProduct._id,
      variantId: sampleProduct.variants[0]?.id || 'v1',
      title: sampleProduct.name,
      variantName: sampleProduct.variants[0]?.name || 'Standard',
      image: sampleProduct.images[0],
      price: sampleProduct.price,
      quantity: 2,
      sku: sampleProduct.SKU,
      slug: sampleProduct.slug,
    };

    // Sync cart
    const cartRes = await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({ items: [cartItem] }),
    });
    assert(cartRes.status === 200, 'POST /api/cart syncs user cart in MongoDB Cart collection');

    // Verify persisted cart
    const getCartRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: sessionCookie },
    });
    const getCartData = await getCartRes.json();
    assert(getCartData.items?.length === 1 && getCartData.items[0].quantity === 2, 'GET /api/cart returns persisted items');

    // Place COD order
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        customerDetails: {
          name: 'Zahra Al-Hassan',
          email: testEmail,
          phone: '+92 301 9876543',
        },
        shippingAddress: addressPayload[0],
        items: [cartItem],
        couponCode: 'WELCOME10',
      }),
    });
    assert(orderRes.status === 201, 'POST /api/orders places COD order (201 Created)');
    const orderData = await orderRes.json();
    const createdOrderId = orderData.order._id;
    const createdOrderNumber = orderData.order.orderNumber;
    assert(!!createdOrderNumber, `Order placed with unique orderNumber: ${createdOrderNumber}`);

    // Verify stock deduction in database
    const verifyProdRes = await fetch(`${BASE_URL}/api/products/${sampleProduct.slug}`);
    const verifyProdData = await verifyProdRes.json();
    assert(verifyProdData.product.stock === initialStock - 2, `Inventory deducted atomically: was ${initialStock}, now ${verifyProdData.product.stock}`);

    // SECTION 6: CUSTOMER ORDER CANCELLATION & INVENTORY RESTORATION
    console.log('\n--- Test Suite 6: Customer Order Cancellation & Stock Restoration ---');
    const cancelRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/cancel`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    assert(cancelRes.status === 200, 'POST /api/orders/:id/cancel allows customer to cancel pending order');
    const cancelData = await cancelRes.json();
    assert(cancelData.order?.orderStatus === 'CANCELLED', 'Order status marked CANCELLED in MongoDB');

    // Verify stock restoration
    const restoredProdRes = await fetch(`${BASE_URL}/api/products/${sampleProduct.slug}`);
    const restoredProdData = await restoredProdRes.json();
    assert(restoredProdData.product.stock === initialStock, `Inventory replenished upon cancellation: restored to ${restoredProdData.product.stock}`);

    // SECTION 7: ADMIN PRIVILEGES, CUSTOMERS & COUPON MANAGEMENT
    console.log('\n--- Test Suite 7: Admin Privileges, Customer Directory & Coupon CRUD ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sageandbotanica.com',
        password: 'admin12345',
      }),
    });
    assert(adminLoginRes.status === 200, 'Admin credentials authenticated');
    const adminCookie = adminLoginRes.headers.get('set-cookie');

    // Admin Customer Directory
    const adminCustRes = await fetch(`${BASE_URL}/api/admin/customers`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminCustRes.status === 200, 'GET /api/admin/customers returns 200');
    const adminCustData = await adminCustRes.json();
    assert(Array.isArray(adminCustData.customers) && adminCustData.customers.length > 0, `Admin customer directory lists ${adminCustData.customers.length} patrons with total spend metrics`);

    // Admin Coupon CRUD
    const couponCode = `AUTOSPRING${Date.now().toString().slice(-4)}`;
    const createCouponRes = await fetch(`${BASE_URL}/api/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        code: couponCode,
        discountType: 'percentage',
        value: 15,
        minOrderAmount: 3000,
        validUntil: '2027-12-31',
      }),
    });
    assert(createCouponRes.status === 201, `Admin created promotional coupon ${couponCode}`);
    const createCouponData = await createCouponRes.json();
    const newCouponId = createCouponData.coupon._id;

    // Validate the new coupon
    const validateCouponRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode, subtotal: 4000 }),
    });
    const validateCouponData = await validateCouponRes.json();
    assert(validateCouponData.valid === true && validateCouponData.discountAmount === 600, `Coupon ${couponCode} validated: 15% discount on Rs. 4,000 = Rs. 600`);

    // Delete coupon
    const deleteCouponRes = await fetch(`${BASE_URL}/api/coupons/${newCouponId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteCouponRes.status === 200, 'Admin can delete promotional coupon');

    // Image Upload
    const fakeJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xd9]);
    const formData = new FormData();
    const blob = new Blob([fakeJpg], { type: 'image/jpeg' });
    formData.append('file', blob, 'sample_serum.jpg');

    const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: formData,
    });
    assert(uploadRes.status === 201, 'POST /api/upload accepts and writes product image to public directory');
    const uploadData = await uploadRes.json();
    assert(uploadData.url?.startsWith('/images/products/'), `Uploaded image returned public URL: ${uploadData.url}`);

    console.log('\n====================================================');
    console.log(`📊 PHASE 3 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during Phase 3 test run:', err);
    process.exit(1);
  }
}

runPhase3Tests();
