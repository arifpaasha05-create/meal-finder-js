// ==========================================
// 1. API URLS & HTML ELEMENTS
// ==========================================
const CATEGORIES_API = 'https://www.themealdb.com/api/json/v1/1/categories.php';
const SEARCH_API = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

const categoryGrid = document.getElementById('categoryGrid');
const categoriesStatusMsg = document.getElementById('categoriesStatusMsg');

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const mealsSection = document.getElementById('mealsSection');
const mealsGrid = document.getElementById('mealsGrid');
const searchStatusMsg = document.getElementById('searchStatusMsg');

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarCategoryList = document.getElementById('sidebarCategoryList');

// ==========================================
// 2. DEFAULT CATEGORIES (LOADS INSTANTLY WITH 0 WAIT!)
// ==========================================
const defaultCategories = [
    { strCategory: "Beef", strCategoryThumb: "https://www.themealdb.com/images/category/beef.png" },
    { strCategory: "Chicken", strCategoryThumb: "https://www.themealdb.com/images/category/chicken.png" },
    { strCategory: "Dessert", strCategoryThumb: "https://www.themealdb.com/images/category/dessert.png" },
    { strCategory: "Lamb", strCategoryThumb: "https://www.themealdb.com/images/category/lamb.png" },
    { strCategory: "Miscellaneous", strCategoryThumb: "https://www.themealdb.com/images/category/miscellaneous.png" },
    { strCategory: "Pasta", strCategoryThumb: "https://www.themealdb.com/images/category/pasta.png" },
    { strCategory: "Pork", strCategoryThumb: "https://www.themealdb.com/images/category/pork.png" },
    { strCategory: "Seafood", strCategoryThumb: "https://www.themealdb.com/images/category/seafood.png" },
    { strCategory: "Side", strCategoryThumb: "https://www.themealdb.com/images/category/side.png" },
    { strCategory: "Starter", strCategoryThumb: "https://www.themealdb.com/images/category/starter.png" },
    { strCategory: "Vegan", strCategoryThumb: "https://www.themealdb.com/images/category/vegan.png" },
    { strCategory: "Vegetarian", strCategoryThumb: "https://www.themealdb.com/images/category/vegetarian.png" },
    { strCategory: "Breakfast", strCategoryThumb: "https://www.themealdb.com/images/category/breakfast.png" },
    { strCategory: "Goat", strCategoryThumb: "https://www.themealdb.com/images/category/goat.png" }
];

// ==========================================
// 3. HELPER FUNCTIONS (STORE IN LOCALSTORAGE)
// ==========================================
function selectCategory(name) {
    localStorage.setItem('selectedCategory', name);
}

function selectMeal(id) {
    localStorage.setItem('selectedMealId', id);
}

window.selectCategory = selectCategory;
window.selectMeal = selectMeal;

// Display category cards on homepage & inside sidebar
function displayCategories(categories) {
    if (!categories || categories.length === 0) return;

    // Ensure loading message is hidden
    if (categoriesStatusMsg) {
        categoriesStatusMsg.style.display = 'none';
    }

    // Render cards (Card stays still, ONLY image zooms on hover)
    categoryGrid.innerHTML = categories.map(category => `
        <a href="./meal-category/index.html" onclick="selectCategory('${category.strCategory}')" class="group relative h-36 bg-white rounded shadow-sm overflow-hidden block">
            <span class="absolute top-1.5 right-1.5 z-10 bg-brand text-white px-2 py-1 text-xs font-bold rounded-sm tracking-wide uppercase">
                ${category.strCategory.toUpperCase()}
            </span>
            <div class="w-full h-full flex items-center justify-center p-3 overflow-hidden">
                <img src="${category.strCategoryThumb}" alt="${category.strCategory}" class="max-w-[85%] max-h-[85%] object-contain transition-transform duration-300 ease-in-out group-hover:scale-110" />
            </div>
        </a>
    `).join('');

    // Render sidebar category list
    sidebarCategoryList.innerHTML = categories.map(category => `
        <li>
            <a href="./meal-category/index.html" onclick="selectCategory('${category.strCategory}')" class="block px-6 py-3 text-gray-700 hover:bg-brand-light hover:text-brand hover:pl-7 transition-all duration-200 font-medium">
                ${category.strCategory}
            </a>
        </li>
    `).join('');
}

// ==========================================
// 4. FETCH AND DISPLAY ALL CATEGORIES
// ==========================================
async function fetchCategories() {
    // 1. Show default categories IMMEDIATELY (0 seconds wait, never stuck on loading!)
    displayCategories(defaultCategories);

    // 2. Fetch from API in background to ensure latest list
    const response = await fetch(CATEGORIES_API);
    const data = await response.json();
    if (data && data.categories) {
        displayCategories(data.categories);
    }
}

// ==========================================
// 5. SEARCH MEALS FUNCTION
// ==========================================
async function searchMeals(foodName) {
    const query = foodName.trim();
    if (!query) {
        alert('Please enter a meal name to search!');
        return;
    }

    mealsSection.classList.remove('hidden');
    mealsGrid.innerHTML = '';
    searchStatusMsg.classList.remove('hidden');
    searchStatusMsg.style.display = 'block';
    searchStatusMsg.textContent = `Searching for "${query}" ...`;

    const response = await fetch(SEARCH_API + query);
    const data = await response.json();

    if (!data.meals) {
        searchStatusMsg.textContent = `No meals found for "${query}". Try another search!`;
        return;
    }

    searchStatusMsg.classList.add('hidden');
    searchStatusMsg.style.display = 'none';

    mealsGrid.innerHTML = data.meals.map(meal => `
        <a href="./meal-category/meal-details/index.html" onclick="selectMeal('${meal.idMeal}')" class="group bg-white border border-gray-200 rounded overflow-hidden flex flex-col shadow-sm block">
            <div class="relative w-full aspect-square overflow-hidden bg-gray-100">
                ${meal.strCategory ? `<span class="absolute top-2 right-2 z-10 bg-white text-brand border border-brand px-2 py-0.5 text-[11px] font-semibold rounded-full shadow-sm capitalize">${meal.strCategory}</span>` : ''}
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 block" />
            </div>
            <div class="p-2.5 flex flex-col justify-center min-h-[52px]">
                <span class="text-[11px] font-medium text-gray-500 mb-0.5">${meal.strArea || ''}</span>
                <p class="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">${meal.strMeal}</p>
            </div>
        </a>
    `).join('');
}

// ==========================================
// 6. SIDEBAR OPEN / CLOSE
// ==========================================
function openSidebar() {
    sidebar.classList.remove('translate-x-full');
    sidebar.classList.add('translate-x-0');
    sidebarOverlay.classList.remove('opacity-0', 'pointer-events-none');
    sidebarOverlay.classList.add('opacity-100', 'pointer-events-auto');
}

function closeSidebar() {
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('translate-x-full');
    sidebarOverlay.classList.remove('opacity-100', 'pointer-events-auto');
    sidebarOverlay.classList.add('opacity-0', 'pointer-events-none');
}

menuBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// ==========================================
// 7. INITIAL RUN
// ==========================================
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchMeals(searchInput.value);
});

fetchCategories();

// If another page sent a search query via localStorage
const savedQuery = localStorage.getItem('searchQuery');
if (savedQuery) {
    searchInput.value = savedQuery;
    localStorage.removeItem('searchQuery');
    searchMeals(savedQuery);
}
