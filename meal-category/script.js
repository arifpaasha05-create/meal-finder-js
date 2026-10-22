// ==========================================
// 1. API URLS & HTML ELEMENTS
// ==========================================
const FILTER_API = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=';
const CATEGORIES_API = 'https://www.themealdb.com/api/json/v1/1/categories.php';

const infoCardTitle = document.getElementById('infoCardTitle');
const infoCardText = document.getElementById('infoCardText');
const categoryStatusMsg = document.getElementById('categoryStatusMsg');
const categoryMealsGrid = document.getElementById('categoryMealsGrid');

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarCategoryList = document.getElementById('sidebarCategoryList');

// ==========================================
// 2. READ SELECTED CATEGORY FROM LOCALSTORAGE
// ==========================================
const currentCategory = localStorage.getItem('selectedCategory') || 'Chicken';
infoCardTitle.textContent = currentCategory;
document.title = `Meal Finder - ${currentCategory}`;

function selectCategory(name) {
    localStorage.setItem('selectedCategory', name);
    window.location.reload();
}

function selectMeal(id) {
    localStorage.setItem('selectedMealId', id);
}

window.selectCategory = selectCategory;
window.selectMeal = selectMeal;

function showCategoryDetails(categories) {
    const categoryInfo = categories.find(c => c.strCategory.toLowerCase() === currentCategory.toLowerCase());
    if (categoryInfo) {
        infoCardText.textContent = categoryInfo.strCategoryDescription;
    }

    sidebarCategoryList.innerHTML = categories.map(c => `
        <li>
            <a href="javascript:void(0)" onclick="selectCategory('${c.strCategory}')" class="block px-6 py-3 text-gray-700 hover:bg-brand-light hover:text-brand-dark hover:pl-7 transition-all duration-200 font-medium">
                ${c.strCategory}
            </a>
        </li>
    `).join('');
}

// ==========================================
// 3. FAST LOAD
// ==========================================
async function loadCategoryPage() {
    const savedCategories = localStorage.getItem('cachedCategories');
    if (savedCategories) {
        showCategoryDetails(JSON.parse(savedCategories));
    }

    const mealsResponse = await fetch(FILTER_API + currentCategory);
    const mealsData = await mealsResponse.json();

    categoryStatusMsg.classList.add('hidden');

    if (mealsData.meals) {
        categoryMealsGrid.innerHTML = mealsData.meals.map(meal => `
            <a href="./meal-details/index.html" onclick="selectMeal('${meal.idMeal}')" class="group bg-white border border-gray-200 rounded overflow-hidden flex flex-col shadow-sm block">
                <div class="w-full aspect-square overflow-hidden bg-gray-100">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 block" />
                </div>
                <div class="p-2.5 min-h-[48px] flex items-center bg-white">
                    <p class="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">${meal.strMeal}</p>
                </div>
            </a>
        `).join('');
    }

    if (!savedCategories) {
        const catResponse = await fetch(CATEGORIES_API);
        const catData = await catResponse.json();
        localStorage.setItem('cachedCategories', JSON.stringify(catData.categories));
        showCategoryDetails(catData.categories);
    }
}

// ==========================================
// 4. SEARCH
// ==========================================
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a recipe name!');
        return;
    }
    localStorage.setItem('searchQuery', query);
    window.location.href = '../index.html';
});

// ==========================================
// 5. SIDEBAR OPEN / CLOSE
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

loadCategoryPage();
