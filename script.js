// Library Management System JavaScript

class LibraryManager {
    constructor() {
        this.books = this.loadBooksFromStorage();
        this.currentFilter = 'all';
        this.currentView = 'grid';
        this.currentBookId = null;
        
        this.initializeEventListeners();
        this.renderBooks();
        this.updateStatistics();
        this.checkUserRole();
    }

    // Sample books data
    getSampleBooks() {
        return [
            {
                id: 1,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                category: "fiction",
                isbn: "978-0-7432-7356-5",
                year: 1925,
                status: "available"
            },
            {
                id: 2,
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                category: "fiction",
                isbn: "978-0-06-112008-4",
                year: 1960,
                status: "borrowed"
            },
            {
                id: 3,
                title: "1984",
                author: "George Orwell",
                category: "fiction",
                isbn: "978-0-452-28423-4",
                year: 1949,
                status: "available"
            },
            {
                id: 4,
                title: "A Brief History of Time",
                author: "Stephen Hawking",
                category: "science",
                isbn: "978-0-553-38016-3",
                year: 1988,
                status: "available"
            },
            {
                id: 5,
                title: "Sapiens",
                author: "Yuval Noah Harari",
                category: "history",
                isbn: "978-0-06-231609-7",
                year: 2011,
                status: "borrowed"
            },
            {
                id: 6,
                title: "The Lean Startup",
                author: "Eric Ries",
                category: "non-fiction",
                isbn: "978-0-307-88789-4",
                year: 2011,
                status: "available"
            },
            {
                id: 7,
                title: "Steve Jobs",
                author: "Walter Isaacson",
                category: "biography",
                isbn: "978-1-4516-4853-9",
                year: 2011,
                status: "available"
            },
            {
                id: 8,
                title: "Atomic Habits",
                author: "James Clear",
                category: "non-fiction",
                isbn: "978-0-7352-1129-2",
                year: 2018,
                status: "borrowed"
            }
        ];
    }

    // Load books from localStorage or use sample data
    loadBooksFromStorage() {
        const storedBooks = localStorage.getItem('libraryBooks');
        if (storedBooks) {
            return JSON.parse(storedBooks);
        } else {
            const sampleBooks = this.getSampleBooks();
            this.saveBooksToStorage(sampleBooks);
            return sampleBooks;
        }
    }

    // Save books to localStorage
    saveBooksToStorage(books) {
        localStorage.setItem('libraryBooks', JSON.stringify(books));
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', () => this.handleSearch());
        searchBtn.addEventListener('click', () => this.handleSearch());

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e.target.dataset.category));
        });

        // Add book form
        const addBookForm = document.getElementById('addBookForm');
        addBookForm.addEventListener('submit', (e) => this.handleAddBook(e));

        // View toggle buttons
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        
        gridViewBtn.addEventListener('click', () => this.toggleView('grid'));
        listViewBtn.addEventListener('click', () => this.toggleView('list'));

        // Modal functionality
        const modal = document.getElementById('bookModal');
        const closeBtn = document.querySelector('.close');
        const borrowBtn = document.getElementById('borrowBtn');
        const returnBtn = document.getElementById('returnBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        closeBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        borrowBtn.addEventListener('click', () => this.handleBorrowBook());
        returnBtn.addEventListener('click', () => this.handleReturnBook());
        deleteBtn.addEventListener('click', () => this.handleDeleteBook());
    }

    // Handle search functionality
    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        this.renderBooks(searchTerm);
    }

    // Handle filter functionality
    handleFilter(category) {
        this.currentFilter = category;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.renderBooks();
    }

    // Toggle between grid and list view
    toggleView(view) {
        this.currentView = view;
        const booksContainer = document.getElementById('booksContainer');
        const gridBtn = document.getElementById('gridView');
        const listBtn = document.getElementById('listView');
        
        if (view === 'grid') {
            booksContainer.classList.remove('list-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            booksContainer.classList.add('list-view');
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        }
        
        this.renderBooks();
    }

    // Handle add book form submission
    handleAddBook(e) {
        e.preventDefault();
        
        // Check if user is admin before allowing book addition
        const userRole = localStorage.getItem('role');
        if (userRole !== 'admin') {
            this.showMessage('Only administrators can add books!', 'error');
            return;
        }
        
        const formData = new FormData(e.target);
        const newBook = {
            id: Date.now(), // Simple ID generation
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            category: document.getElementById('bookCategory').value,
            isbn: document.getElementById('bookISBN').value || 'N/A',
            year: parseInt(document.getElementById('bookYear').value) || new Date().getFullYear(),
            status: document.getElementById('bookStatus').value
        };

        this.books.push(newBook);
        this.saveBooksToStorage(this.books);
        this.renderBooks();
        this.updateStatistics();
        this.showMessage('Book added successfully!', 'success');
        
        // Reset form
        e.target.reset();
    }

    // Handle book borrowing
    handleBorrowBook() {
        if (this.currentBookId) {
            const book = this.books.find(b => b.id === this.currentBookId);
            if (book && book.status === 'available') {
                book.status = 'borrowed';
                this.saveBooksToStorage(this.books);
                this.renderBooks();
                this.updateStatistics();
                this.closeModal();
                this.showMessage('Book borrowed successfully!', 'success');
            }
        }
    }

    // Handle book return
    handleReturnBook() {
        if (this.currentBookId) {
            const book = this.books.find(b => b.id === this.currentBookId);
            if (book && book.status === 'borrowed') {
                book.status = 'available';
                this.saveBooksToStorage(this.books);
                this.renderBooks();
                this.updateStatistics();
                this.closeModal();
                this.showMessage('Book returned successfully!', 'success');
            }
        }
    }

    // Handle book deletion
    handleDeleteBook() {
        // Check if user is admin before allowing book deletion
        const userRole = localStorage.getItem('role');
        if (userRole !== 'admin') {
            this.showMessage('Only administrators can delete books!', 'error');
            return;
        }
        
        if (this.currentBookId && confirm('Are you sure you want to delete this book?')) {
            this.books = this.books.filter(b => b.id !== this.currentBookId);
            this.saveBooksToStorage(this.books);
            this.renderBooks();
            this.updateStatistics();
            this.closeModal();
            this.showMessage('Book deleted successfully!', 'success');
        }
    }

    // Open modal with book details
    openModal(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        this.currentBookId = bookId;
        
        // Populate modal with book data
        document.getElementById('modalBookTitle').textContent = book.title;
        document.getElementById('modalBookAuthor').textContent = book.author;
        document.getElementById('modalBookCategory').textContent = book.category.charAt(0).toUpperCase() + book.category.slice(1);
        document.getElementById('modalBookISBN').textContent = book.isbn;
        document.getElementById('modalBookYear').textContent = book.year;
        document.getElementById('modalBookStatus').textContent = book.status.charAt(0).toUpperCase() + book.status.slice(1);

        // Update button visibility
        const borrowBtn = document.getElementById('borrowBtn');
        const returnBtn = document.getElementById('returnBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        
        if (book.status === 'available') {
            borrowBtn.style.display = 'inline-flex';
            returnBtn.style.display = 'none';
        } else {
            borrowBtn.style.display = 'none';
            returnBtn.style.display = 'inline-flex';
        }

        // Show/hide delete button based on user role
        const userRole = localStorage.getItem('role');
        if (userRole === 'admin') {
            deleteBtn.style.display = 'inline-flex';
        } else {
            deleteBtn.style.display = 'none';
        }

        // Show modal
        document.getElementById('bookModal').style.display = 'block';
    }

    // Close modal
    closeModal() {
        document.getElementById('bookModal').style.display = 'none';
        this.currentBookId = null;
    }

    // Render books based on current filter and search
    renderBooks(searchTerm = '') {
        const booksContainer = document.getElementById('booksContainer');
        const noBooksMessage = document.getElementById('noBooksMessage');
        
        let filteredBooks = this.books;

        // Apply search filter
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.category.toLowerCase().includes(searchTerm)
            );
        }

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === this.currentFilter);
        }

        // Clear container
        booksContainer.innerHTML = '';

        if (filteredBooks.length === 0) {
            noBooksMessage.style.display = 'block';
            return;
        }

        noBooksMessage.style.display = 'none';

        // Render books
        filteredBooks.forEach(book => {
            const bookCard = this.createBookCard(book);
            booksContainer.appendChild(bookCard);
        });
    }

    // Create book card element
    createBookCard(book) {
        const card = document.createElement('div');
        card.className = `book-card ${this.currentView === 'list' ? 'list-view' : ''}`;
        card.onclick = () => this.openModal(book.id);

        const statusClass = book.status === 'available' ? 'status-available' : 'status-borrowed';
        const statusIcon = book.status === 'available' ? 'fas fa-check-circle' : 'fas fa-user-check';
        const statusText = book.status === 'available' ? 'Available' : 'Borrowed';

        card.innerHTML = `
            <div class="book-cover">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <span class="book-category">${book.category.charAt(0).toUpperCase() + book.category.slice(1)}</span>
                <div class="book-status">
                    <span class="status-badge ${statusClass}">
                        <i class="${statusIcon}"></i> ${statusText}
                    </span>
                </div>
            </div>
        `;

        return card;
    }

    // Update statistics
    updateStatistics() {
        const totalBooks = this.books.length;
        const availableBooks = this.books.filter(book => book.status === 'available').length;
        const borrowedBooks = this.books.filter(book => book.status === 'borrowed').length;
        const totalCategories = new Set(this.books.map(book => book.category)).size;

        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('availableBooks').textContent = availableBooks;
        document.getElementById('borrowedBooks').textContent = borrowedBooks;
        document.getElementById('totalCategories').textContent = totalCategories;
    }

    // Show message to user
    showMessage(message, type = 'success') {
        const messageContainer = document.getElementById('messageContainer');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        messageEl.innerHTML = `<i class="${icon}"></i> ${message}`;
        
        messageContainer.appendChild(messageEl);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    // Check user role and adjust UI accordingly
    checkUserRole() {
        const userRole = localStorage.getItem('role');
        const addBookSection = document.querySelector('.add-book-section');
        
        if (userRole !== 'admin') {
            // Hide add book section for non-admin users
            if (addBookSection) {
                addBookSection.style.display = 'none';
            }
        } else {
            // Show add book section for admin users
            if (addBookSection) {
                addBookSection.style.display = 'block';
            }
        }
    }
}

// Initialize the library manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userRole = localStorage.getItem('role');
    if (!userRole) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    new LibraryManager();
});

// Add some utility functions for better user experience
document.addEventListener('keydown', (e) => {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('bookModal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
const authBtn = document.getElementById("authBtn");
const userRoleSpan = document.getElementById("userRole");
const role = localStorage.getItem("role");

// Update button text and user role display
if (role) {
  authBtn.textContent = "Logout";
  userRoleSpan.textContent = role;
} else {
  authBtn.textContent = "Login";
  userRoleSpan.textContent = "";
}

authBtn.addEventListener("click", () => {
  if (role) {
    // Logout
    localStorage.removeItem("role");
    window.location.href = "login.html"; 
  } else {
    // Go to login
    window.location.href = "login.html";
  }
});
