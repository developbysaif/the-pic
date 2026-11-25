const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/sage_store');
  const db = mongoose.connection.db;

  const clothesCat = await db.collection('categories').findOne({ slug: 'clothes' });
  const watchesCat = await db.collection('categories').findOne({ slug: 'watches' });
  const shirtsCat = await db.collection('categories').findOne({ slug: 'shirts' });
  const slidesCat = await db.collection('categories').findOne({ slug: 'slides' });

  // 1. Archive all products under shirts and slides
  const inactiveCatIds = [shirtsCat?._id, slidesCat?._id].filter(Boolean);
  const archiveResult = await db.collection('products').updateMany(
    { category: { $in: inactiveCatIds } },
    { $set: { status: 'archived', trending: false, bestSeller: false, featured: false } }
  );
  console.log(`Archived ${archiveResult.modifiedCount} shirts and slides products.`);

  // 2. Fix Royal Obsidian Chronograph image and variants to use real cutout
  const watchUpdate = await db.collection('products').updateOne(
    { slug: 'royal-obsidian-chronograph-x' },
    {
      $set: {
        images: ['/images/watches/watch_obsidian_cutout.png', '/images/watches/watch_obsidian_sm.png'],
        'variants.0.image': '/images/watches/watch_obsidian_cutout.png',
        'variants.1.image': '/images/watches/watch_obsidian_sm.png',
        price: 48500,
        salePrice: 42900,
        status: 'published',
        featured: true,
        trending: true,
        bestSeller: true,
      }
    }
  );
  console.log(`Updated Royal Obsidian watch: ${watchUpdate.modifiedCount} modified.`);

  // 2b. Fix Watches category image in database
  const catUpdate = await db.collection('categories').updateOne(
    { slug: 'watches' },
    { $set: { image: '/images/watches/watch_obsidian_cutout.png' } }
  );
  console.log(`Updated Watches category image: ${catUpdate.modifiedCount} modified.`);

  // 3. Ensure all clothes products are published at PKR 4,200 (original 4,500)
  const clothesCount = await db.collection('products').countDocuments({ category: clothesCat._id, status: 'published' });
  console.log(`Published clothes products: ${clothesCount}`);

  // 4. Summary of published products
  const publishedProducts = await db.collection('products').find({ status: 'published' }).toArray();
  console.log(`Total active published products in store: ${publishedProducts.length}`);
  publishedProducts.forEach(p => {
    console.log(`- [${p.category.toString() === clothesCat._id.toString() ? 'Clothes' : 'Watches'}] ${p.name}: PKR ${p.salePrice || p.price}`);
  });

  await mongoose.disconnect();
  console.log('Database sync complete!');
}

run().catch(console.error);
