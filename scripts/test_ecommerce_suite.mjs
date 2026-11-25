const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🌿 SAGE & BOTANICA E-COMMERCE SUITE TEST RUNNER');
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
    // 1. Homepage
    console.log('Test Group 1: Core Pages & SEO Static Assets');
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, 'Homepage returns 200 OK');
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes('SAGE &amp; BOTANICA') || homeHtml.includes('SAGE & BOTANICA'), 'Homepage contains brand name');
    assert(homeHtml.includes('Botanical Alchemy for Mind &amp; Skin') || homeHtml.includes('Botanical Alchemy'), 'Homepage contains hero headline');

    // 2. Sitemap
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    assert(sitemapRes.status === 200, 'Sitemap.xml returns 200 OK');
    const sitemapXml = await sitemapRes.text();
    assert(sitemapXml.includes('<urlset') && sitemapXml.includes('/product/'), 'Sitemap contains dynamic product entries');

    // 3. Robots.txt
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    assert(robotsRes.status === 200, 'robots.txt returns 200 OK');
    const robotsTxt = await robotsRes.text();
    assert(robotsTxt.includes('Disallow: /admin/'), 'robots.txt disallows /admin/');
    assert(robotsTxt.includes('sitemap.xml'), 'robots.txt declares sitemap location');

    // 4. Custom 404 Page
    const notFoundRes = await fetch(`${BASE_URL}/this-is-an-unknown-url-404`);
    assert(notFoundRes.status === 404, '404 route returns HTTP 404');
    const notFoundHtml = await notFoundRes.text();
    assert(notFoundHtml.includes('Lost in the Botanical Garden'), '404 route renders custom Sage & Botanica 404 page');

    // 5. Categories API
    console.log('\nTest Group 2: Public APIs & Product Catalog');
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    assert(catRes.status === 200, 'GET /api/categories returns 200');
    const catData = await catRes.json();
    assert(Array.isArray(catData.categories) && catData.categories.length > 0, `Categories fetched (${catData.categories?.length || 0} active categories)`);

    // 6. Products API
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    assert(prodRes.status === 200, 'GET /api/products returns 200');
    const prodData = await prodRes.json();
    assert(Array.isArray(prodData.products) && prodData.products.length > 0, `Products fetched (${prodData.products?.length || 0} formulations)`);

    // 7. Product Detail by Slug API
    const slug = prodData.products[0].slug;
    const detailRes = await fetch(`${BASE_URL}/api/products/${slug}`);
    assert(detailRes.status === 200, `GET /api/products/${slug} returns 200`);
    const detailData = await detailRes.json();
    assert(detailData.product?.name && detailData.product.slug === slug, 'Product payload includes verified name & slug');
    assert(Array.isArray(detailData.product.variants) && detailData.product.variants.length > 0, 'Product has interactive variants');

    // 8. Product Page HTML with JSON-LD
    const prodPageRes = await fetch(`${BASE_URL}/product/${slug}`);
    assert(prodPageRes.status === 200, `GET /product/${slug} returns 200`);
    const prodPageHtml = await prodPageRes.text();
    assert(prodPageHtml.includes('"@type":"Product"'), 'Product page contains schema.org/Product JSON-LD structured data');
    assert(prodPageHtml.includes('"@type":"BreadcrumbList"'), 'Product page contains schema.org/BreadcrumbList JSON-LD');

    // 9. Customer Login & Session
    console.log('\nTest Group 3: Customer Authentication & Session');
    const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@sageandbotanica.com',
        password: 'customer12345',
      }),
    });
    assert(custLoginRes.status === 200, 'Customer login credentials accepted');
    const custLoginData = await custLoginRes.json();
    assert(custLoginData.user?.role === 'customer', 'Customer role verified');

    const customerCookie = custLoginRes.headers.get('set-cookie');
    assert(!!customerCookie && customerCookie.includes('sage_auth_token'), 'HttpOnly auth cookie set');

    // 10. Customer Auth /me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: customerCookie },
    });
    assert(meRes.status === 200, 'GET /api/auth/me recognizes logged-in customer');
    const meData = await meRes.json();
    assert(meData.user?.email === 'customer@sageandbotanica.com', 'Authenticated session matches customer email');

    // 11. Cart API (Sync, Fetch, Clear)
    console.log('\nTest Group 4: Cart Synchronization & Coupon Validation');
    const testCartItem = {
      productId: prodData.products[0]._id,
      variantId: prodData.products[0].variants[0]?.id || 'v1',
      title: prodData.products[0].name,
      variantName: prodData.products[0].variants[0]?.name || 'Standard Flacon',
      image: prodData.products[0].images[0],
      price: prodData.products[0].price,
      quantity: 2,
      sku: prodData.products[0].SKU,
      slug: prodData.products[0].slug,
    };

    const cartPostRes = await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ items: [testCartItem] }),
    });
    assert(cartPostRes.status === 200, 'POST /api/cart syncs user cart to MongoDB');

    const cartGetRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: customerCookie },
    });
    const cartGetData = await cartGetRes.json();
    assert(Array.isArray(cartGetData.items) && cartGetData.items.length === 1, 'GET /api/cart retrieves persisted items from MongoDB');

    // 12. Coupon Validation
    const couponRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'WELCOME10', subtotal: 5000 }),
    });
    assert(couponRes.status === 200, 'POST /api/coupons/validate returns 200');
    const couponData = await couponRes.json();
    assert(couponData.valid === true && couponData.discountAmount === 500, 'Coupon WELCOME10 calculated 10% discount on Rs. 5,000 (= Rs. 500)');

    // 13. Cash on Delivery (COD) Order Creation
    console.log('\nTest Group 5: COD Order Creation & Status Tracking');
    const orderPayload = {
      customerDetails: {
        name: 'Amina Khan',
        email: 'customer@sageandbotanica.com',
        phone: '+92 300 7654321',
      },
      shippingAddress: {
        street: 'Suite 4B, Gulberg Heights, Main Boulevard',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '54000',
        country: 'Pakistan',
        notes: 'Please call on arrival, Cash on Delivery prepared',
      },
      items: [testCartItem],
      couponCode: 'WELCOME10',
    };

    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify(orderPayload),
    });
    assert(orderRes.status === 201, 'POST /api/orders places COD order with HTTP 201 Created');
    const orderData = await orderRes.json();
    assert(!!orderData.order?.orderNumber, `Order created with unique orderNumber: ${orderData.order?.orderNumber}`);
    assert(orderData.order?.paymentMethod === 'COD', 'Payment method verified as COD');
    assert(orderData.order?.paymentStatus === 'PENDING', 'Payment status is PENDING (COD upon arrival)');

    const createdOrderNumber = orderData.order.orderNumber;
    const createdOrderId = orderData.order._id;

    // 14. Order Tracking
    const trackRes = await fetch(`${BASE_URL}/api/orders?orderNumber=${createdOrderNumber}`);
    assert(trackRes.status === 200, 'GET /api/orders?orderNumber=... tracks order');
    const trackData = await trackRes.json();
    assert(trackData.order?.orderNumber === createdOrderNumber, 'Tracking returns exact matching order');

    // 15. Customer Review Submission
    console.log('\nTest Group 6: Customer Reviews & Newsletter');
    const reviewRes = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({
        productId: prodData.products[0]._id,
        rating: 5,
        title: 'Remarkable Barrier Calming Elixir',
        comment: 'Absorbs instantly without greasy residue. The alpine sage scent is so serene.',
        customerName: 'Amina K.',
      }),
    });
    assert(reviewRes.status === 201, 'POST /api/reviews submits verified review');

    // 16. Newsletter Subscription
    const newsRes = await fetch(`${BASE_URL}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `patron_${Date.now()}@sageandbotanica.com` }),
    });
    assert(newsRes.status === 201, 'POST /api/newsletter subscribes email to botanical journals');

    // 17. Admin Login & Authorization
    console.log('\nTest Group 7: Admin Privileges & Store Management');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sageandbotanica.com',
        password: 'admin12345',
      }),
    });
    assert(adminLoginRes.status === 200, 'Admin login credentials accepted');
    const adminCookie = adminLoginRes.headers.get('set-cookie');

    // 18. Admin Stats
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: adminCookie },
    });
    assert(statsRes.status === 200, 'GET /api/admin/stats returns 200');
    const statsData = await statsRes.json();
    const sales = statsData.metrics?.totalSales ?? 0;
    const orderCount = statsData.metrics?.totalOrders ?? 0;
    assert(typeof sales === 'number' && orderCount > 0, `Admin stats verified: Rs. ${sales.toLocaleString()} in sales across ${orderCount} orders`);

    // 19. Admin Category Creation & Update
    const newCatRes = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Botanical Hair & Scalp Elixirs',
        description: 'Cold-pressed rosemary and mountain sage scalp rituals.',
      }),
    });
    assert(newCatRes.status === 201, 'Admin can create new product category');
    const newCatData = await newCatRes.json();
    const tempCatId = newCatData.category._id;

    // 20. Admin Product CRUD
    const newProdRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Alpine Rosemary & Sage Scalp Drop',
        shortDescription: 'Stimulating botanical scalp treatment.',
        description: 'Formulated with organic rosemary and cold-pressed alpine sage.',
        category: tempCatId,
        price: 3800,
        SKU: `SAGE-SCALP-${Date.now().toString().slice(-4)}`,
        stock: 30,
        images: ['/images/products/serum-main.jpg'],
        status: 'published',
      }),
    });
    assert(newProdRes.status === 201, 'Admin can create new product formulation');
    const newProdData = await newProdRes.json();
    const tempProdSlug = newProdData.product.slug;

    // Update product
    const updateProdRes = await fetch(`${BASE_URL}/api/products/${tempProdSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ price: 3600 }),
    });
    assert(updateProdRes.status === 200, 'Admin can update product formulation price');

    // Delete product
    const delProdRes = await fetch(`${BASE_URL}/api/products/${tempProdSlug}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(delProdRes.status === 200, 'Admin can delete product formulation');

    // Delete category
    const delCatRes = await fetch(`${BASE_URL}/api/categories/${tempCatId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(delCatRes.status === 200, 'Admin can delete category with 0 products');

    // 21. Admin Order Status Update
    const updateOrderRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        orderStatus: 'DISPATCHED',
        trackingNumber: 'TCS-984712053-PK',
        statusNote: 'Handed over to TCS Express Gulberg hub.',
      }),
    });
    assert(updateOrderRes.status === 200, 'Admin can update order status to DISPATCHED with tracking number');
    const updateOrderData = await updateOrderRes.json();
    assert(updateOrderData.order?.orderStatus === 'DISPATCHED', 'Order status verified as DISPATCHED in MongoDB');

    // 22. Middleware Protection
    console.log('\nTest Group 8: Server-Side Route Protection & Security');
    const unauthAdminRes = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert(unauthAdminRes.status === 307 || unauthAdminRes.status === 302, 'Unauthenticated access to /admin is blocked by middleware and redirected to /login');

    const unauthAccountRes = await fetch(`${BASE_URL}/account`, { redirect: 'manual' });
    assert(unauthAccountRes.status === 307 || unauthAccountRes.status === 302, 'Unauthenticated access to /account is blocked by middleware and redirected to /login');

    console.log('\n====================================================');
    console.log(`📊 FINAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  }
}

runTests();
