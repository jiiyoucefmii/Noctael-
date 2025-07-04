# Noctael - Premium Clothing E-commerce

A modern, responsive e-commerce website for Noctael, a premium clothing brand that embraces dark aesthetics and high-quality fashion.


USER SHOULD: open and browse without sign in , also order without sign in (his info wont be saved only obviously) , upon sign in ( data is saved ) and user can do the same + save adrresses for delivery + wishlist + cart will be saved also 
Admin : to access admin ui you have to sign in the normal ui but with ADMIN credentials that way he wil have access to special profile where he can see dashboard ( sales ) and can add, modify and delete products and categories + track orders 
## Features

### 🛍️ Shopping Experience
- **Product Catalog**: Browse through a curated collection of premium clothing
- **Advanced Filtering**: Filter by category, size, color, price range, and sale items
- **Product Search**: Find products quickly with the search functionality
- **Product Details**: Detailed product pages with multiple images, size/color selection
- **Shopping Cart**: Add, remove, and modify items in your cart
- **Wishlist**: Save favorite items for later (coming soon)

### 🎨 User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Consistent with the Noctael brand aesthetic
- **Smooth Animations**: Engaging micro-interactions and transitions
- **Modern Components**: Built with React and styled with Tailwind CSS

### 👤 User Management
- **User Registration**: Create new accounts with email verification
- **User Login**: Secure authentication system
- **User Profile**: Manage personal information and preferences
- **Order History**: View past orders and track current ones

### 🛒 E-commerce Features
- **Checkout Process**: Streamlined checkout with shipping and billing information
- **Order Management**: Complete order processing and confirmation
- **Payment Integration**: Ready for payment gateway integration
- **Inventory Management**: Track product availability

### 🔧 Admin Features
- **Admin Dashboard**: Comprehensive admin panel for store management
- **Order Management**: View and manage customer orders
- **Analytics**: Basic sales and performance metrics
- **Product Management**: Add, edit, and manage products (coming soon)

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing for single-page application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Beautiful, customizable icons

### State Management
- **React Context**: For cart management and user state
- **Local Storage**: Persistent storage for cart and user data

### Development Tools
- **Create React App**: Bootstrap and build configuration
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing and optimization

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/noctael-ecommerce.git
   cd noctael-ecommerce
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Start the development server**
   \`\`\`bash
   npm start
   # or
   yarn start
   \`\`\`

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Building for Production

\`\`\`bash
npm run build
# or
yarn build
\`\`\`

This creates an optimized production build in the `build` folder.

## Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── header.jsx      # Navigation header
│   ├── footer.jsx      # Site footer
│   ├── product-card.jsx # Product display card
│   └── ...
├── pages/              # Page components
│   ├── HomePage.jsx    # Landing page
│   ├── ProductsPage.jsx # Product catalog
│   ├── CartPage.jsx    # Shopping cart
│   └── ...
├── hooks/              # Custom React hooks
│   ├── use-cart.js     # Cart management
│   └── use-toast.js    # Toast notifications
├── providers/          # Context providers
│   └── cart-provider.jsx # Cart state management
├── lib/                # Utility functions and data
│   ├── products.js     # Product data
│   └── utils.js        # Helper functions
└── styles/             # CSS files
    ├── index.css       # Global styles
    └── App.css         # Component styles
\`\`\`

## Key Features Explained

### Shopping Cart
The shopping cart uses React Context for state management and persists data in localStorage. Users can:
- Add products with specific size and color combinations
- Update quantities
- Remove items
- View cart totals including tax calculations

### Product Filtering
Advanced filtering system allows users to filter products by:
- Categories (Men, Women, Accessories, etc.)
- Sizes (XS, S, M, L, XL, XXL)
- Colors (Black, White, Gray, etc.)
- Price ranges
- Sale items only

### User Authentication
Simple authentication system with:
- Registration with form validation
- Login with email/password
- User session management
- Admin role detection

### Responsive Design
Mobile-first approach with:
- Responsive grid layouts
- Mobile-optimized navigation
- Touch-friendly interactions
- Optimized images and loading

## Demo Credentials

For testing purposes, you can use these credentials:

**Regular User:**
- Email: user@example.com
- Password: password123

**Admin User:**
- Email: admin@noctael.com
- Password: admin123

## Customization

### Brand Colors
The color scheme can be customized in `tailwind.config.js`:

\`\`\`javascript
colors: {
  primary: {
    // Your brand colors
  }
}
\`\`\`

### Product Data (as admin)
Products are stored in `src/lib/products.js`. You can:
- Add new products
- Modify existing product information
- Update categories and attributes

### Styling
Global styles are in `src/index.css` and component-specific styles use Tailwind classes.

## Future Enhancements

### Planned Features
- [ ] Product reviews and ratings system
- [ ] Wishlist functionality
- [ ] Email notifications(future)
- [ ] Advanced search with filters
- [ ] Product recommendations(maybe)
- [ ] Multi-language support


### Technical Improvements
- [ ] Backend API integration
- [ ] Database integration
- [ ] Performance monitoring (dashboard)


## Support

For support, email support@noctael.com or create an issue in the GitHub repository.

## Acknowledgments

- Design inspiration from modern e-commerce platforms
- Icons provided by Lucide React
- Built with Create React App
- Styled with Tailwind CSS

---

**Noctael** - Embrace the darkness with style. 🌙
