# Market Price Finder

A web application developed for managing market product prices and information.

## Features

- Add, edit, and delete products
- Search and filter products
- Sort by price and rating
- Image upload support
- Responsive design

## Installation

1. Clone the project:
```bash
git clone https://github.com/berkan-ridvan/market-product-api.git
cd market-product-api
```

2. Install dependencies:
```bash
npm install
```

3. Start MongoDB:
```bash
mongod
```

4. Start the application:
```bash
npm run dev
```

The application will be running at http://localhost:5000

## Usage

### Adding Products
1. Use the "Add/Edit Item" form on the main page
2. Enter product details (title, type, description, price, rating)
3. Optionally upload a product image
4. Click "Save Item"

### Search and Filter
- Use the search box to search for products
- Use the category filter to filter products by type
- Use the sort option to sort products by price or rating

### Editing Products
1. Click the "Edit" button on a product card
2. The form will be automatically filled
3. Make your changes and click "Save Item"

### Deleting Products
- Click the "Delete" button on a product card to remove it

## Technologies

- Node.js
- Express.js
- MongoDB
- Multer (file upload)
- Bootstrap 5
- JavaScript (ES6+)

## License

MIT
