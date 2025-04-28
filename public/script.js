let allItems = [];
let imageUrls = {};

// Sayfa yüklendiğinde JSON'dan resim URL'lerini yükle
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Önce JSON'dan resim URL'lerini al
        const jsonResponse = await fetch('/data/items.json');
        const jsonData = await jsonResponse.json();
        
        // URL'leri title'a göre map'le
        imageUrls = jsonData.reduce((acc, item) => {
            acc[item.title] = item.url;
            return acc;
        }, {});

        // Sonra DB'den verileri al
        await loadItems();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

async function searchItem() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    try {
        const response = await fetch(`http://localhost:5000/api/cheapest?item=${searchTerm}`);
        const data = await response.json();
        displaySearchResults(data);
    } catch (error) {
        console.error('Error searching item:', error);
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredItems = allItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    );
    displayAllItems(filteredItems);
}

function handleSortAndFilter() {
    const sortBy = document.getElementById('sortBy').value;
    const filterType = document.getElementById('filterType').value;
    let filteredItems = [...allItems];

    // Filtreleme
    if (filterType) {
        filteredItems = filteredItems.filter(item => item.type === filterType);
    }

    // Sıralama
    filteredItems.sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'rating-desc':
                return (b.rating || 0) - (a.rating || 0);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    displayAllItems(filteredItems);
}

function createRatingStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push('<span class="material-icons star-filled">star</span>');
        } else if (i === fullStars && hasHalfStar) {
            stars.push('<span class="material-icons star-filled">star_half</span>');
        } else {
            stars.push('<span class="material-icons star-empty">star</span>');
        }
    }

    return stars.join('');
}

function createProductCard(item) {
    const rating = item.rating || 0;
    const ratingStars = createRatingStars(rating);
    
    return `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="product-card">
                <h3>${item.title}</h3>
                <p style="color: grey;">${item.type}</p>
                <div class="rating">
                    ${ratingStars}
                    <span class="ms-2">(${rating.toFixed(1)})</span>
                </div>
                <p class="description">${item.description || ''}</p>
                <p class="price">$${item.price.toFixed(2)}</p>
            </div>
        </div>
    `;
}

// Event listener'ları ayırıyoruz
function setupEventListeners() {
    const sortBy = document.getElementById('sortBy');
    const filterType = document.getElementById('filterType');

    if (sortBy) sortBy.addEventListener('change', handleSortAndFilter);
    if (filterType) filterType.addEventListener('change', handleSortAndFilter);

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchItems(query);
            } else {
                loadItems();
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchItems(query);
                } else {
                    loadItems();
                }
            }
        });
    }

    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', handleFormSubmit);
    }

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            handleEditButton(event);
        } else if (event.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this item?')) {
                deleteItem(event.target.dataset.itemId).catch(error => alert(error.message));
            }
        }
    });
}

// Sıralama ve filtreleme fonksiyonu
function handleSortAndFilter() {
    const sortBy = document.getElementById('sortBy')?.value || '';
    const filterType = document.getElementById('filterType')?.value || '';
    let filteredItems = [...allItems];

    // Filtreleme
    if (filterType) {
        filteredItems = filteredItems.filter(item => item.type === filterType);
    }

    // Sıralama
    filteredItems.sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });

    displayAllItems(filteredItems);
}

function displaySearchResults(items) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    
    if (items.length === 0) {
        resultsContainer.innerHTML = '<div class="col-12 text-center"><p>No results found.</p></div>';
        return;
    }
    
    items.forEach(item => {
        resultsContainer.innerHTML += createProductCard(item);
    });
}

function displayAllItems(items) {
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';

    if (!items || items.length === 0) {
        itemsList.innerHTML = '<div class="col-12 text-center"><p>No items found.</p></div>';
        return;
    }

    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'col-md-4 mb-4';
        
        // Resim URL'sini kontrol et
        const imageUrl = item.url ? `/images/${item.url}` : '/images/default.jpg';
        
        itemCard.innerHTML = `
            <div class="card h-100">
                <img src="${imageUrl}" 
                     class="card-img-top" 
                     alt="${item.title}" 
                     style="height: 200px; object-fit: cover;"
                     onerror="this.src='/images/default.jpg'">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">
                        <strong>Type:</strong> ${item.type}<br>
                        <strong>Description:</strong> ${item.description || 'No description'}<br>
                        <strong>Price:</strong> $${item.price.toFixed(2)}<br>
                        <strong>Rating:</strong> ${item.rating || 'No rating'}
                    </p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-warning edit-btn" data-item-id="${item._id}">Edit</button>
                        <button class="btn btn-danger delete-btn" data-item-id="${item._id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
        itemsList.appendChild(itemCard);
    });
}

// Tüm ürünleri yükle
async function loadItems() {
    try {
        const response = await fetch('/api/items');
        const dbItems = await response.json();
        
        // DB verilerine resim URL'lerini ekle
        allItems = dbItems.map(item => ({
            ...item,
            url: imageUrls[item.title] || `${item.type}.jpg`
        }));
        
        displayAllItems(allItems);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

// Arama fonksiyonu
async function searchItems(query) {
    try {
        const response = await fetch(`/api/items`);
        const items = await response.json();
        
        // DB verilerine resim URL'lerini ekle
        const itemsWithImages = items.map(item => ({
            ...item,
            url: imageUrls[item.title] || `${item.type}.jpg`
        }));
        
        // Filtreleme işlemi
        const filteredItems = itemsWithImages.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );
        
        displayAllItems(filteredItems);
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Create new item
async function createItem(itemData) {
    try {
        const formData = new FormData();
        formData.append('title', itemData.title);
        formData.append('type', itemData.type);
        formData.append('description', itemData.description);
        formData.append('price', itemData.price);
        formData.append('rating', itemData.rating);
        
        // Resim dosyasını ekle
        const imageInput = document.getElementById('image');
        if (imageInput && imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        const response = await fetch('/api/items', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Error creating item');
        }
        
        const newItem = await response.json();
        await loadItems();
        return newItem;
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
}

// Update item
async function updateItem(id, itemData) {
    try {
        const formData = new FormData();
        formData.append('title', itemData.title);
        formData.append('type', itemData.type);
        formData.append('description', itemData.description);
        formData.append('price', itemData.price);
        formData.append('rating', itemData.rating);
        
        // Resim dosyasını ekle
        const imageInput = document.getElementById('image');
        if (imageInput && imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        const response = await fetch(`/api/items/${id}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Error updating item');
        }
        
        const updatedItem = await response.json();
        await loadItems();
        return updatedItem;
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
}

// Delete item
async function deleteItem(id) {
    try {
        const response = await fetch(`/api/items/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error deleting item');
        }
        
        await loadItems(); // Refresh the list
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
}

// Form submission handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const itemData = {
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        rating: parseFloat(formData.get('rating')) || 0
    };
    
    try {
        if (form.dataset.itemId) {
            await updateItem(form.dataset.itemId, itemData);
            form.removeAttribute('data-item-id');
        } else {
            await createItem(itemData);
        }
        form.reset();
    } catch (error) {
        alert(error.message);
    }
}

// Edit button handler
function handleEditButton(event) {
    const itemId = event.target.dataset.itemId;
    const item = allItems.find(item => item._id === itemId);
    
    if (item) {
        const form = document.getElementById('itemForm');
        form.dataset.itemId = itemId;
        
        document.getElementById('title').value = item.title;
        document.getElementById('type').value = item.type;
        document.getElementById('description').value = item.description || '';
        document.getElementById('price').value = item.price;
        document.getElementById('rating').value = item.rating || '';
        
        form.scrollIntoView({ behavior: 'smooth' });
    }
}