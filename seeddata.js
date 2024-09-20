require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const dishes = [
  'Pizza',
  'Burger',
  'Sushi',
  'Pasta',
  'Tacos',
  'Salad',
  'Steak',
  'Soup',
  'Sandwich',
  'Ice Cream',
  'Fries',
  'Chocolate',
  'Cake',
  'Lasagna',
  'Noodles',
  'Falafel',
  'Curry',
  'Dumplings',
  'Burrito',
  'Smoothie',
  'Pancakes',
  'Waffles',
  'Risotto',
  'Paella',
  'Shawarma',
  'Kebab',
  'Grilled Cheese',
  'Quesadilla',
  'Nachos',
  'Pad Thai',
  'Ramen',
  'Pho',
  'BBQ Ribs',
  'Chicken Wings',
  'Chicken Noodle Soup',
  'Fried Chicken',
  'Mac and Cheese',
  'Eggs Benedict',
  'Omelette',
  'Samosa',
  'Biryani',
  'Korean Fried Chicken',
  'Bruschetta',
  'Hummus',
  'Guacamole',
  'Mashed Potatoes',
  'Garlic Bread',
  'Stuffed Peppers',
  'Gnocchi',
  'French Toast',
  'Churros',
  'Enchiladas',
  'Tortilla Soup',
  'Chow Mein',
  'Spring Rolls',
  'Jambalaya',
  'Gumbo',
  'Lamb Curry',
  'Fish Tacos',
  'Peking Duck',
  'General Tso Chicken',
  'Goulash',
  'Beef Stroganoff',
  'Chili con Carne',
  'Chicken Parmesan',
  'Fettuccine Alfredo',
  'Lamb Shank',
  'Osso Buco',
  'Polenta',
  'Quiche',
  'Fried Rice',
  'Spaghetti Bolognese',
  'Fried Calamari',
  'Crab Cakes',
  'Clam Chowder',
  'Moules Frites',
  'Lobster Roll',
  'Shrimp Cocktail',
  'Oysters Rockefeller',
  'Ceviche',
  'Tuna Tartare',
  'Beef Tartare',
  'Chicken Cordon Bleu',
  'Mapo Tofu',
  'Kung Pao Chicken',
  'Sweet and Sour Pork',
  'Char Siu',
  'Siu Mai',
  'Lo Mein',
  'Hot Pot',
  'Dim Sum',
  'Wonton Soup',
  'Egg Drop Soup',
  'Chow Fun',
  'Larb',
  'Satay',
  'Tom Kha Gai',
  'Pad See Ew',
  'Som Tum',
  'Khao Pad',
  'Banh Mi',
  'Pho Ga',
  'Bun Cha',
  'Cha Ca',
  'Goi Cuon',
  'Rendang',
  'Nasi Goreng',
  'Satay Chicken',
  'Gado-Gado',
  'Mee Goreng',
  'Laksa',
  'Hainanese Chicken Rice',
  'Tom Yum Goong',
  'Green Curry',
  'Red Curry',
  'Massaman Curry',
  'Panang Curry',
  'Khao Soi',
  'Bibimbap',
  'Kimchi Stew',
  'Japchae',
  'Korean BBQ',
  'Tteokbokki',
  'Bulgogi',
  'Samgyeopsal',
  'Galbi',
  'Sundubu Jjigae',
  'Jajangmyeon',
  'Hoddeok',
  'Kimbap',
  'Hotteok',
  'Okonomiyaki',
  'Takoyaki',
  'Tonkotsu Ramen',
  'Soba Noodles',
  'Udon Noodles',
  'Onigiri',
  'Tempura Udon',
  'Sukiyaki',
  'Shabu-Shabu',
  'Katsu Curry',
  'Chicken Katsu',
  'Gyoza',
  'Hiyayakko',
  'Karaage',
  'Chirashi Bowl',
  'Ebi Tempura',
  'Sashimi',
  'Oyakodon',
  'Miso Glazed Salmon',
  'Teriyaki Beef',
  'Hamachi Kama',
  'Unagi Donburi',
  'Tamago Sushi',
  'Maguro Sushi',
  'Anago Sushi',
  'Taiyaki',
  'Matcha Ice Cream',
  'Dorayaki',
  'Mochi',
  'Wagyu Steak',
  'Ahi Poke',
  'Loco Moco',
  'Kalua Pork',
  'Haupia',
  'Poi',
  'Spam Musubi',
  'Pineapple Fried Rice',
  'Mochiko Chicken',
  'Huli Huli Chicken',
  'Shoyu Chicken',
  'Lau Lau',
  'Katsudon',
  'Nigiri Sushi',
  'Eel Sushi',
  'Crème Brûlée',
  'Tarte Tatin',
  'Mille-Feuille',
  'Croissant',
  'Pain au Chocolat',
  'Profiteroles',
  'Éclair',
  'Madeleines',
  'Macarons',
  'Tarte au Citron',
  'Galette',
  'Coq au Vin',
  'Ratatouille',
  'Bouillabaisse',
  'Cassoulet',
  'Duck à l’Orange',
  'Sole Meunière',
  'Couscous',
  'Harira Soup',
  'Tagine',
  'Bistecca Fiorentina',
  'Risotto alla Milanese',
  'Panzanella',
  'Arancini',
  'Caponata',
  'Focaccia',
  'Truffle Pasta',
  'Gnocchi alla Sorrentina',
  'Tiramisu',
  'Cannoli',
  'Panna Cotta',
  'Affogato',
  'Zabaglione',
  'Tortellini',
  'Chicken Adobo',
  'Fried Plantains',
  'Chicken Marsala',
];

async function seedData() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Clear existing data
    await client.query(
      'TRUNCATE TABLE comments, reviews, items, users RESTART IDENTITY CASCADE;'
    );

    console.log('Seeding Users...');
    const users = Array.from({ length: 200 }, (_, i) => ({
      email: `user${i + 1}@example.com`,
    }));
    for (const user of users) {
      await client.query('INSERT INTO users (email) VALUES ($1)', [user.email]);
    }
    console.log('200 users inserted successfully');

    // Seed Items
    console.log('Seeding Items...');
    for (const dish of dishes) {
      await client.query(
        'INSERT INTO items (name, description) VALUES ($1, $2)',
        [dish, 'This is a description']
      );
    }
    console.log(`${dishes.length} items (dishes) inserted successfully`);

    // Seed Reviews
    console.log('Seeding Reviews...');
    const reviews = Array.from({ length: 200 }, (_, i) => ({
      text: `Review text ${i + 1}`,
      rating: Math.floor(Math.random() * 5) + 1, // Random rating between 1 and 5
      user_id: Math.floor(Math.random() * 200) + 1, // Random user_id between 1 and 200
      item_id: Math.floor(Math.random() * dishes.length) + 1, // Random item_id between 1 and 200
    }));
    for (const review of reviews) {
      await client.query(
        'INSERT INTO reviews (text, rating, user_id, item_id) VALUES ($1, $2, $3, $4)',
        [review.text, review.rating, review.user_id, review.item_id]
      );
    }
    console.log('200 reviews inserted successfully');

    // Seed Comments
    console.log('Seeding Comments...');
    const comments = Array.from({ length: 200 }, (_, i) => ({
      text: `Comment text ${i + 1}`,
      review_id: Math.floor(Math.random() * 200) + 1, // Random review_id between 1 and 200
      user_id: Math.floor(Math.random() * 200) + 1, // Random user_id between 1 and 200
    }));
    for (const comment of comments) {
      await client.query(
        'INSERT INTO comments (text, review_id, user_id) VALUES ($1, $2, $3)',
        [comment.text, comment.review_id, comment.user_id]
      );
    }
    console.log('200 comments inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.end();
  }
}

seedData();
