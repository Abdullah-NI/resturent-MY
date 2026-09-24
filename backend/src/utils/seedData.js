import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import Review from '../models/Review.js';
import Gallery from '../models/Gallery.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';

import path from 'path';

dotenv.config();
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

const categoriesData = [
  { name: 'Starter / Snacks', displayOrder: 1, isPopular: true, popularOrder: 1, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800' },
  { name: 'Chinese', displayOrder: 2, isPopular: true, popularOrder: 2, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800' },
  { name: 'Rice & Noodle', displayOrder: 3, isPopular: true, popularOrder: 3, image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=800' },
  { name: 'Soup', displayOrder: 4, isPopular: false, popularOrder: 4, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800' },
  { name: 'Shakes', displayOrder: 5, isPopular: true, popularOrder: 5, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800' },
  { name: 'Mocktails', displayOrder: 6, isPopular: true, popularOrder: 6, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800' },
  { name: 'Tea & Coffee', displayOrder: 7, isPopular: false, popularOrder: 7, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800' },
  { name: 'Pasta', displayOrder: 8, isPopular: true, popularOrder: 7, image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281270?auto=format&fit=crop&q=80&w=800' },
  { name: 'Appetizer', displayOrder: 9, isPopular: false, popularOrder: 8, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800' },
  { name: 'Momos', displayOrder: 10, isPopular: true, popularOrder: 8, image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800' },
  { name: 'South Indian / Dosa', displayOrder: 11, isPopular: false, popularOrder: 9, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=800' },
  { name: 'Uttapam', displayOrder: 12, isPopular: false, popularOrder: 10, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=800' },
  { name: 'Main Course', displayOrder: 13, isPopular: true, popularOrder: 9, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Breads', displayOrder: 14, isPopular: false, popularOrder: 11, image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800' },
  { name: 'Rice & Biryani', displayOrder: 15, isPopular: false, popularOrder: 12, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800' },
  { name: 'Raita', displayOrder: 16, isPopular: false, popularOrder: 13, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=800' },
  { name: 'Salad', displayOrder: 17, isPopular: false, popularOrder: 14, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800' },
  { name: 'Pizza', displayOrder: 18, isPopular: true, popularOrder: 10, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800' },
  { name: 'Dessert', displayOrder: 19, isPopular: false, popularOrder: 15, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800' },
];

const menuRawData = [
  // Starter / Snacks
  { name: 'Paneer Tikka', price: 270, cat: 'Starter / Snacks', featured: true, popular: true },
  { name: 'Paneer Achari Tikka', price: 280, cat: 'Starter / Snacks', featured: true, popular: true },
  { name: 'Paneer Malai Tikka', price: 290, cat: 'Starter / Snacks', featured: true, popular: true },
  { name: 'Paneer Afgani Tikka', price: 280, cat: 'Starter / Snacks' },
  { name: 'Paneer Hariyali Tikka', price: 290, cat: 'Starter / Snacks' },
  { name: 'Amritsari Paneer Tikka', price: 300, cat: 'Starter / Snacks' },
  { name: 'Mushroom Tikka', price: 270, cat: 'Starter / Snacks' },
  { name: 'Ajwani Mushroom Tikka', price: 280, cat: 'Starter / Snacks' },
  { name: 'Cheese Stuff Mushroom Tikka', price: 320, cat: 'Starter / Snacks' },
  { name: 'Tandoori Soya Chaap', price: 250, cat: 'Starter / Snacks' },
  { name: 'Achari Soya Chaap', price: 270, cat: 'Starter / Snacks' },
  { name: 'Afgani Soya Chaap', price: 280, cat: 'Starter / Snacks' },
  { name: 'Malai Soya Chaap', price: 280, cat: 'Starter / Snacks' },
  { name: 'Garlic Soya Chaap', price: 280, cat: 'Starter / Snacks' },
  { name: 'Cheese Stuff Soya Chaap', price: 300, cat: 'Starter / Snacks' },
  { name: 'Veg Seek Kebab', price: 270, cat: 'Starter / Snacks' },
  { name: 'Paneer Seek Kebab', price: 300, cat: 'Starter / Snacks' },
  { name: 'Corn Seek Kebab', price: 280, cat: 'Starter / Snacks' },
  { name: 'Tandoori Stuff Allu', price: 300, cat: 'Starter / Snacks' },
  { name: 'Hara Bhara Kebab (6pc)', price: 250, cat: 'Starter / Snacks' },
  { name: 'Dahi Kebab (6pc)', price: 280, cat: 'Starter / Snacks' },
  { name: 'Cheese Kebab(6pc)', price: 300, cat: 'Starter / Snacks' },
  { name: 'Multani Kebab(6pc)', price: 300, cat: 'Starter / Snacks' },
  { name: 'Galauti Kebab in Tandoor', price: 250, cat: 'Starter / Snacks' },

  // Chinese
  { name: 'Paneer Crispy', price: 290, cat: 'Chinese', featured: true, popular: true },
  { name: 'Chilly Paneer Gravy/Dry', price: 270, cat: 'Chinese', featured: true, popular: true },
  { name: 'Honey Chilly Paneer', price: 280, cat: 'Chinese', featured: true, popular: true },
  { name: 'Spring Roll', price: 130, cat: 'Chinese' },
  { name: 'Crunchy Spring Roll', price: 160, cat: 'Chinese' },
  { name: 'French Fry', price: 180, cat: 'Chinese' },
  { name: 'Masala Fries', price: 190, cat: 'Chinese' },
  { name: 'Cheese Cigar (6pcs)', price: 220, cat: 'Chinese' },
  { name: 'Crispy Garlic Potato', price: 250, cat: 'Chinese' },
  { name: 'Chilly Paneer Makhani', price: 280, cat: 'Chinese' },
  { name: 'Paneer Tai Chi', price: 290, cat: 'Chinese' },
  { name: 'Paneer 65', price: 290, cat: 'Chinese' },
  { name: 'Paneer Garlic', price: 290, cat: 'Chinese' },
  { name: 'Paneer Pere Pere', price: 290, cat: 'Chinese' },
  { name: 'Paneer Hot Garlic', price: 280, cat: 'Chinese' },
  { name: 'Schezwan Paneer', price: 280, cat: 'Chinese' },
  { name: 'Chilly Mushroom', price: 280, cat: 'Chinese' },
  { name: 'Garlic Mushroom', price: 280, cat: 'Chinese' },
  { name: 'Veg Manchurian', price: 220, cat: 'Chinese' },
  { name: 'Chilly Potato', price: 230, cat: 'Chinese' },
  { name: 'Honey Chilly Potato', price: 240, cat: 'Chinese' },
  { name: 'Mushroom Salt & Pepper', price: 280, cat: 'Chinese' },
  { name: 'Crispy Corn', price: 280, cat: 'Chinese' },
  { name: 'Veg Cutlet', price: 250, cat: 'Chinese' },
  { name: 'Veg Egg (5pcs)', price: 180, cat: 'Chinese' },
  { name: 'Sweet Corn Cutlet', price: 250, cat: 'Chinese' },
  { name: 'Paneer Cutlet', price: 280, cat: 'Chinese' },
  { name: 'Paneer Popcorn', price: 220, cat: 'Chinese' },
  { name: 'Chilly Soya Chaap', price: 250, cat: 'Chinese' },
  { name: 'Chilly Soya Chunks', price: 250, cat: 'Chinese' },

  // Rice & Noodle
  { name: 'Chilly Garlic Noodle', price: 180, cat: 'Rice & Noodle', featured: true, popular: true },
  { name: 'Paneer Hakka Noodle', price: 220, cat: 'Rice & Noodle', featured: true, popular: true },
  { name: 'Paneer Fried Rice', price: 200, cat: 'Rice & Noodle', featured: true, popular: true },
  { name: 'Tandoori Noodle', price: 200, cat: 'Rice & Noodle' },
  { name: 'Veg Noodle', price: 170, cat: 'Rice & Noodle' },
  { name: 'Hakka Noodle', price: 190, cat: 'Rice & Noodle' },
  { name: 'Schezwan Noodle', price: 190, cat: 'Rice & Noodle' },
  { name: 'Paneer Noodle', price: 200, cat: 'Rice & Noodle' },
  { name: 'Ginger Garlic Noodle', price: 190, cat: 'Rice & Noodle' },
  { name: 'Singapore Noodle', price: 200, cat: 'Rice & Noodle' },
  { name: 'Veg Fried Rice', price: 180, cat: 'Rice & Noodle' },
  { name: 'Schezwan Fried Rice', price: 200, cat: 'Rice & Noodle' },
  { name: 'Ginger Garlic Fried Rice', price: 200, cat: 'Rice & Noodle' },

  // Soup
  { name: 'Tomato Soup', price: 130, cat: 'Soup', featured: true, popular: true, options: [{ portion: 'Standard', price: 130 }, { portion: 'Large', price: 150 }] },
  { name: 'Hot & Sour Soup', price: 130, cat: 'Soup', featured: true, popular: true, options: [{ portion: 'Standard', price: 130 }, { portion: 'Large', price: 150 }] },
  { name: 'Sweet Corn Soup', price: 130, cat: 'Soup', featured: true, popular: true, options: [{ portion: 'Standard', price: 130 }, { portion: 'Large', price: 150 }] },
  { name: 'Vegetable Soup', price: 130, cat: 'Soup', options: [{ portion: 'Standard', price: 130 }, { portion: 'Large', price: 150 }] },
  { name: 'Man Chow Soup', price: 130, cat: 'Soup', options: [{ portion: 'Standard', price: 130 }, { portion: 'Large', price: 150 }] },
  { name: 'Lung Fung Soup', price: 130, cat: 'Soup', options: [{ portion: 'Standard', price: 130 }, { portion: 'Large', price: 150 }] },
  { name: 'Tum Yum Soup', price: 130, cat: 'Soup', options: [{ portion: 'Standard', price: 130 }, { portion: 'Large', price: 150 }] },
  { name: 'Lemon Coriander', price: 130, cat: 'Soup', options: [{ portion: 'Standard', price: 130 }, { portion: 'Large', price: 150 }] },

  // Shakes
  { name: 'Blue Berry Shake', price: 80, cat: 'Shakes', featured: true, popular: true },
  { name: 'Chocolate Shake', price: 80, cat: 'Shakes', featured: true, popular: true },
  { name: 'Oreo Shake', price: 90, cat: 'Shakes', featured: true, popular: true },
  { name: 'Sweet Lassi', price: 60, cat: 'Shakes' },
  { name: 'Salted Lassi', price: 60, cat: 'Shakes' },
  { name: 'Chikku Shake', price: 80, cat: 'Shakes' },
  { name: 'Strawberry Shake', price: 80, cat: 'Shakes' },
  { name: 'Butterscotch Shake', price: 80, cat: 'Shakes' },
  { name: 'Mix Fruit Shake', price: 80, cat: 'Shakes' },
  { name: 'Mango Shake', price: 80, cat: 'Shakes' },
  { name: 'Litchi Shake', price: 80, cat: 'Shakes' },
  { name: 'Orange Shake', price: 80, cat: 'Shakes' },
  { name: 'Cold Coffee', price: 80, cat: 'Shakes' },
  { name: 'KitKat Shake', price: 90, cat: 'Shakes' },

  // Mocktails
  { name: 'Water Mellon', price: 70, cat: 'Mocktails', featured: true, popular: true },
  { name: 'Green Apple', price: 80, cat: 'Mocktails', featured: true, popular: true },
  { name: 'Mint Mojito', price: 70, cat: 'Mocktails', featured: true, popular: true },
  { name: 'Kala Khatta', price: 80, cat: 'Mocktails' },
  { name: 'Masala Lemonade', price: 70, cat: 'Mocktails' },
  { name: 'Green Mint', price: 70, cat: 'Mocktails' },
  { name: 'Strawberry', price: 70, cat: 'Mocktails' },
  { name: 'Blue Berry', price: 70, cat: 'Mocktails' },
  { name: 'Lemon Ice Tea', price: 70, cat: 'Mocktails' },
  { name: 'Orange Bliss', price: 70, cat: 'Mocktails' },
  { name: 'Litchi Punch', price: 70, cat: 'Mocktails' },
  { name: 'Blue Curacao', price: 80, cat: 'Mocktails' },

  // Tea & Coffee
  { name: 'Black Coffee', price: 40, cat: 'Tea & Coffee', featured: true, popular: true },
  { name: 'Hot Coffee', price: 50, cat: 'Tea & Coffee', featured: true, popular: true },
  { name: 'Masala Tea', price: 50, cat: 'Tea & Coffee', featured: true, popular: true },
  { name: 'Plain Tea', price: 40, cat: 'Tea & Coffee' },

  // Pasta
  { name: 'Red Sauce Pasta', price: 220, cat: 'Pasta', featured: true, popular: true },
  { name: 'White Sauce Pasta', price: 220, cat: 'Pasta', featured: true, popular: true },
  { name: 'Paneer Cheesy Pasta', price: 250, cat: 'Pasta', featured: true, popular: true },
  { name: 'Mix Sauce Pasta', price: 220, cat: 'Pasta' },
  { name: 'Pink Sauce Pasta', price: 220, cat: 'Pasta' },
  { name: 'Lazania Cheesy Pasta', price: 250, cat: 'Pasta' },

  // Appetizer
  { name: 'Cholay Bhature', price: 130, cat: 'Appetizer', featured: true, popular: true },
  { name: 'Pav Bhaji', price: 120, cat: 'Appetizer', featured: true, popular: true },
  { name: 'Paneer Pakoda', price: 250, cat: 'Appetizer', featured: true, popular: true },
  { name: 'Fried Papad', price: 30, cat: 'Appetizer' },
  { name: 'Rosted Papad', price: 30, cat: 'Appetizer' },
  { name: 'Masala Papad', price: 60, cat: 'Appetizer' },
  { name: 'Allu Chaat', price: 180, cat: 'Appetizer' },
  { name: 'Chana Chaat', price: 180, cat: 'Appetizer' },
  { name: 'Peanut Chat', price: 180, cat: 'Appetizer' },
  { name: 'Sweet Corn Chaat', price: 180, cat: 'Appetizer' },
  { name: 'Mix Pakoda', price: 220, cat: 'Appetizer' },
  { name: 'Butter Sweet Corn', price: 180, cat: 'Appetizer' },

  // Momos
  { name: 'Steam Momo (6pcs)', price: 100, cat: 'Momos', featured: true, popular: true },
  { name: 'Tandoori Momo (6pcs)', price: 180, cat: 'Momos', featured: true, popular: true },
  { name: 'Crunchy Momo (6pcs)', price: 190, cat: 'Momos', featured: true, popular: true },
  { name: 'Fried Momo (6pcs)', price: 120, cat: 'Momos' },
  { name: 'Afghani Momo (6pcs)', price: 180, cat: 'Momos' },
  { name: 'Malai Momo (6pcs)', price: 180, cat: 'Momos' },
  { name: 'Chilly Momo (6pcs)', price: 190, cat: 'Momos' },
  { name: 'Devil Momo (6pcs)', price: 190, cat: 'Momos' },

  // South Indian / Dosa
  { name: 'Plain Dosa', price: 140, cat: 'South Indian / Dosa', featured: true, popular: true },
  { name: 'Masala Dosa', price: 160, cat: 'South Indian / Dosa', featured: true, popular: true },
  { name: 'Paneer Onion Dosa', price: 220, cat: 'South Indian / Dosa', featured: true, popular: true },
  { name: 'Onion Masala Dosa', price: 170, cat: 'South Indian / Dosa' },
  { name: 'Pizza Dosa', price: 200, cat: 'South Indian / Dosa' },
  { name: 'Rava Plain Dosa', price: 160, cat: 'South Indian / Dosa' },
  { name: 'Rava Masala Dosa', price: 180, cat: 'South Indian / Dosa' },
  { name: 'Rava Paneer Dosa', price: 220, cat: 'South Indian / Dosa' },
  { name: 'Chef Special Dosa', price: 220, cat: 'South Indian / Dosa' },

  // Uttapam
  { name: 'Tomoto Uttapam', price: 180, cat: 'Uttapam', featured: true, popular: true },
  { name: 'Onion Uttapam', price: 180, cat: 'Uttapam', featured: true, popular: true },
  { name: 'Paneer Uttapam', price: 220, cat: 'Uttapam', featured: true, popular: true },
  { name: 'Mix Uttapam', price: 200, cat: 'Uttapam' },

  // Main Course
  { name: 'Paneer Lachadar', price: 280, cat: 'Main Course', featured: true, popular: true },
  { name: 'Shahi Paneer', price: 280, cat: 'Main Course', featured: true, popular: true },
  { name: 'Paneer Butter Masala', price: 280, cat: 'Main Course', featured: true, popular: true },
  { name: 'Dal Makhani', price: 220, cat: 'Main Course' },
  { name: 'Dal Fry', price: 190, cat: 'Main Course' },
  { name: 'Dal Tadka', price: 190, cat: 'Main Course' },
  { name: 'Dal Handi', price: 240, cat: 'Main Course' },
  { name: 'Mutter Paneer', price: 250, cat: 'Main Course' },
  { name: 'Paneer Do Pyaza', price: 280, cat: 'Main Course' },
  { name: 'Paneer Lehsuni Do Pyaza', price: 280, cat: 'Main Course' },
  { name: 'Paneer Lababdar', price: 280, cat: 'Main Course' },
  { name: 'Paneer Handi', price: 280, cat: 'Main Course' },
  { name: 'Paneer Kadai', price: 280, cat: 'Main Course' },
  { name: 'Paneer Angara', price: 280, cat: 'Main Course' },
  { name: 'Paneer Patiala', price: 280, cat: 'Main Course' },
  { name: 'Paneer Changezi', price: 280, cat: 'Main Course' },
  { name: 'Paneer Punjabi', price: 280, cat: 'Main Course' },
  { name: 'Paneer Kaleji', price: 290, cat: 'Main Course' },
  { name: 'Paneer Kofta', price: 280, cat: 'Main Course' },
  { name: 'Paneer Rogan Josh', price: 280, cat: 'Main Course' },
  { name: 'Paneer Mushroom Do Pyaza', price: 300, cat: 'Main Course' },
  { name: 'Paneer Bhurji', price: 300, cat: 'Main Course' },
  { name: 'Paneer Afghani Gravy', price: 350, cat: 'Main Course' },
  { name: 'Paneer Methi Malai', price: 300, cat: 'Main Course' },
  { name: 'Kaju Paneer Masala', price: 300, cat: 'Main Course' },
  { name: 'Paneer Tikka Butter Masala', price: 350, cat: 'Main Course' },
  { name: 'Paneer Pasanda', price: 350, cat: 'Main Course' },
  { name: 'Masala Chaap Gravy', price: 250, cat: 'Main Course' },
  { name: 'Chaap Butter Masala', price: 250, cat: 'Main Course' },
  { name: 'Kadai Chaap', price: 280, cat: 'Main Course' },
  { name: 'Chaap Rara', price: 280, cat: 'Main Course' },
  { name: 'Chaap Rogan Josh', price: 280, cat: 'Main Course' },
  { name: 'Aloo Jeera', price: 190, cat: 'Main Course' },
  { name: 'Mix Veg', price: 220, cat: 'Main Course' },
  { name: 'Veg Kofta', price: 250, cat: 'Main Course' },
  { name: 'Malai Kofta', price: 300, cat: 'Main Course' },
  { name: 'Paneer Patiyala', price: 300, cat: 'Main Course' },
  { name: 'Veg Patiala', price: 280, cat: 'Main Course' },
  { name: 'Channa Masala', price: 250, cat: 'Main Course' },
  { name: 'Mutter Mushroom', price: 270, cat: 'Main Course' },
  { name: 'Mushroom Masala', price: 270, cat: 'Main Course' },
  { name: 'Kadai Mushroom', price: 280, cat: 'Main Course' },
  { name: 'Mushroom Do Pyaza', price: 280, cat: 'Main Course' },
  { name: 'Dum Allu Punjabi', price: 280, cat: 'Main Course' },
  { name: 'Dum Allu Kashmiri', price: 300, cat: 'Main Course' },
  { name: 'Dum Allu Bhojpuri', price: 300, cat: 'Main Course' },

  // Breads
  { name: 'Tandoori Roti', price: 20, cat: 'Breads', featured: true, popular: true },
  { name: 'Butter Naan', price: 60, cat: 'Breads', featured: true, popular: true },
  { name: 'Cheese Naan', price: 120, cat: 'Breads', featured: true, popular: true },
  { name: 'Tandoori Butter Roti', price: 25, cat: 'Breads' },
  { name: 'Tawa Plain Roti', price: 20, cat: 'Breads' },
  { name: 'Tawa Butter Roti', price: 25, cat: 'Breads' },
  { name: 'Rumali Roti', price: 30, cat: 'Breads' },
  { name: 'Missi Roti', price: 50, cat: 'Breads' },
  { name: 'Masala Missi Roti', price: 60, cat: 'Breads' },
  { name: 'Lacha Prantha', price: 50, cat: 'Breads' },
  { name: 'Masala Lacha Pratha', price: 60, cat: 'Breads' },
  { name: 'Plain Naan', price: 50, cat: 'Breads' },
  { name: 'Stuff Naan', price: 90, cat: 'Breads' },
  { name: 'Garlic Naan', price: 90, cat: 'Breads' },
  { name: 'Paneer Naan', price: 120, cat: 'Breads' },
  { name: 'Amritsari Naan', price: 120, cat: 'Breads' },
  { name: 'Kashmiri Naan', price: 120, cat: 'Breads' },
  { name: 'Stuff Kulcha', price: 90, cat: 'Breads' },
  { name: 'Onion Kulcha', price: 90, cat: 'Breads' },
  { name: 'Paneer Kulcha', price: 100, cat: 'Breads' },
  { name: 'Aloo Prantha with Achaar', price: 90, cat: 'Breads' },
  { name: 'Gobhi Prantha', price: 90, cat: 'Breads' },
  { name: 'Onion Prantha', price: 90, cat: 'Breads' },
  { name: 'Mix Prantha', price: 120, cat: 'Breads' },
  { name: 'Paneer Prantha', price: 120, cat: 'Breads' },

  // Rice & Biryani
  { name: 'Jeera Rice', price: 190, cat: 'Rice & Biryani', featured: true, popular: true },
  { name: 'Veg Biryani', price: 250, cat: 'Rice & Biryani', featured: true, popular: true },
  { name: 'Paneer Biryani', price: 300, cat: 'Rice & Biryani', featured: true, popular: true },
  { name: 'Lemon Rice', price: 180, cat: 'Rice & Biryani' },
  { name: 'Steam Rice', price: 180, cat: 'Rice & Biryani' },
  { name: 'Onion Rice', price: 220, cat: 'Rice & Biryani' },
  { name: 'Veg Pulao', price: 220, cat: 'Rice & Biryani' },
  { name: 'Mutter Pulao', price: 220, cat: 'Rice & Biryani' },
  { name: 'Handi Biryani', price: 280, cat: 'Rice & Biryani' },
  { name: 'Mushroom Biryani', price: 280, cat: 'Rice & Biryani' },
  { name: 'Chaap Biryani', price: 280, cat: 'Rice & Biryani' },
  { name: 'Handi Dum Biryani', price: 300, cat: 'Rice & Biryani' },

  // Raita
  { name: 'Plain Raita', price: 140, cat: 'Raita', featured: true, popular: true },
  { name: 'Boondi Raita', price: 160, cat: 'Raita', featured: true, popular: true },
  { name: 'Pineapple Raita', price: 160, cat: 'Raita', featured: true, popular: true },
  { name: 'Plain Curd', price: 140, cat: 'Raita' },
  { name: 'Aloo Raita', price: 140, cat: 'Raita' },
  { name: 'Onion Raita', price: 160, cat: 'Raita' },
  { name: 'Aloo Pyaz Raita', price: 160, cat: 'Raita' },
  { name: 'Mix Vegetable Raita', price: 160, cat: 'Raita' },

  // Salad
  { name: 'Green Salad', price: 120, cat: 'Salad', featured: true, popular: true },
  { name: 'Onion Salad', price: 100, cat: 'Salad', featured: true, popular: true },
  { name: 'Tandoori Salad', price: 150, cat: 'Salad', featured: true, popular: true },

  // Pizza
  { name: 'Margarita Pizza', price: 250, cat: 'Pizza', featured: true, popular: true },
  { name: 'Paneer Capsicum', price: 280, cat: 'Pizza', featured: true, popular: true },
  { name: 'Chef Special Pizza', price: 350, cat: 'Pizza', featured: true, popular: true },
  { name: 'Veg Delight', price: 280, cat: 'Pizza' },
  { name: 'Veg Paradise', price: 280, cat: 'Pizza' },
  { name: 'Golden Corn Pizza', price: 280, cat: 'Pizza' },
  { name: 'Pasta Pizza', price: 280, cat: 'Pizza' },
  { name: 'Farm Fresh Pizza', price: 300, cat: 'Pizza' },
  { name: 'Paneer Do Pyaza Pizza', price: 300, cat: 'Pizza' },
  { name: 'Paneer Sweet Corn', price: 300, cat: 'Pizza' },
  { name: 'Tandoori Spicy Pizza', price: 300, cat: 'Pizza' },
  { name: 'Fresh Mushroom Pizza', price: 300, cat: 'Pizza' },
  { name: 'Paneer Makhani Pizza', price: 300, cat: 'Pizza' },
  { name: 'Paneer Schezwan Pizza (Spicy)', price: 300, cat: 'Pizza' },

  // Dessert
  { name: 'Gulab Jamun', price: 40, cat: 'Dessert', featured: true, popular: true },
  { name: 'Rasgulla', price: 40, cat: 'Dessert', featured: true, popular: true },
  { name: 'Choco-Brownie', price: 80, cat: 'Dessert', featured: true, popular: true },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB connection URI is missing in environment variables.');
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Review.deleteMany({});
    await Gallery.deleteMany({});
    await Order.deleteMany({});
    await Reservation.deleteMany({});

    console.log('Cleared existing data...');

    // 1. Create Admin Account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@skylounge.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'Sky Lounge Admin',
      email: adminEmail.toLowerCase(),
      phone: process.env.ADMIN_PHONE || '9760999444',
      password: adminPassword,
      role: 'admin',
    });
    console.log(`Admin user created: ${adminUser.email}`);

    // 2. Create Default Customer
    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9876543210',
      password: 'UserPass123!',
      role: 'customer',
      addresses: [
        {
          street: '12 Railway Road, Near PNB',
          city: 'Deoband',
          state: 'Uttar Pradesh',
          pincode: '247554',
          isDefault: true,
        },
      ],
    });
    console.log(`Customer user created: ${customerUser.email}`);

    // 3. Create Categories
    const createdCategories = {};
    for (const catData of categoriesData) {
      const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const cat = await Category.create({
        name: catData.name,
        slug,
        image: catData.image,
        displayOrder: catData.displayOrder,
      });
      createdCategories[catData.name] = cat._id;
    }
    console.log(`Seeded ${Object.keys(createdCategories).length} menu categories`);

    // 5. Create Menu Items
    let seededItemsCount = 0;
    for (const rawItem of menuRawData) {
      const categoryId = createdCategories[rawItem.cat];
      if (categoryId) {
        await MenuItem.create({
          name: rawItem.name,
          description: `Delicious 100% pure vegetarian ${rawItem.name} prepared fresh with authentic ingredients at Sky Lounge.`,
          price: rawItem.price,
          priceOptions: rawItem.options || [],
          category: categoryId,
          isFeatured: !!rawItem.featured,
          isPopular: !!rawItem.popular,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
          preparationTime: '15-20 mins',
          tags: ['Pure Veg', rawItem.cat],
        });
        seededItemsCount++;
      }
    }
    console.log(`Seeded ${seededItemsCount} menu items from PDF`);

    // 6. Create Approved Reviews
    await Review.create([
      {
        name: 'Amit Verma',
        rating: 5,
        comment: 'Sky Lounge is by far the best pure vegetarian dining restaurant in Deoband! Beautiful ambience and extraordinary Paneer Tikka.',
        isApproved: true,
      },
      {
        name: 'Priya Sharma',
        rating: 5,
        comment: 'Loved the Chilly Garlic Noodles and Cold Coffee. Fast home delivery and hot delicious food!',
        isApproved: true,
      },
      {
        name: 'Vikas Kumar',
        rating: 5,
        comment: 'Great family restaurant, spacious seating on 2nd floor opposite PNB. Staff is very polite.',
        isApproved: true,
      },
    ]);
    console.log('Sample reviews seeded');

    // 7. Create Gallery Items
    await Gallery.create([
      { title: 'Sky Lounge Ambience', category: 'Ambience', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800', displayOrder: 1 },
      { title: 'Sizzling Paneer Tikka', category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', displayOrder: 2 },
      { title: 'Delicious Chinese Platter', category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800', displayOrder: 3 },
      { title: 'Chef Special Pizza', category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800', displayOrder: 4 },
      { title: 'Luxury Dining Area', category: 'Restaurant', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800', displayOrder: 5 },
    ]);
    console.log('Sample gallery seeded');

    // 8. Create Sample Orders & Reservations for Dashboard stats
    await Order.create({
      user: customerUser._id,
      customerName: 'Rahul Sharma',
      phone: '9876543210',
      address: { street: '12 Railway Road, Near PNB', city: 'Deoband', state: 'Uttar Pradesh', pincode: '247554' },
      items: [
        { name: 'Paneer Tikka', price: 270, quantity: 1 },
        { name: 'Butter Naan', price: 60, quantity: 2 },
      ],
      subtotal: 390,
      deliveryFee: 30,
      total: 420,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Delivered',
    });

    await Reservation.create({
      user: customerUser._id,
      name: 'Rahul Sharma',
      phone: '9876543210',
      email: 'rahul@example.com',
      date: new Date().toISOString().split('T')[0],
      time: '07:30 PM',
      numberOfGuests: 4,
      specialRequest: 'Window table please',
      status: 'Confirmed',
    });
    console.log('Sample orders & reservations seeded for dashboard');

    console.log('🌱 Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
