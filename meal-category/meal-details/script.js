// ==========================================
// 1. API URLS & HTML ELEMENTS
// ==========================================
const LOOKUP_API = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';
const CATEGORIES_API = 'https://www.themealdb.com/api/json/v1/1/categories.php';

const breadcrumbName = document.getElementById('breadcrumbName');
const mealTitle = document.getElementById('mealTitle');
const mealImage = document.getElementById('mealImage');
const mealCategory = document.getElementById('mealCategory');
const mealSourceRow = document.getElementById('mealSourceRow');
const mealSourceLink = document.getElementById('mealSourceLink');
const mealTagsRow = document.getElementById('mealTagsRow');
const mealTagsContainer = document.getElementById('mealTagsContainer');
const ingredientsGrid = document.getElementById('ingredientsGrid');
const measureCard = document.getElementById('measureCard');
const instructionsList = document.getElementById('instructionsList');
const bottomCategoryGrid = document.getElementById('bottomCategoryGrid');

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarCategoryList = document.getElementById('sidebarCategoryList');

// ==========================================
// 2. READ MEAL ID FROM LOCALSTORAGE
// ==========================================
const mealId = localStorage.getItem('selectedMealId') || '52772';

function selectCategory(categoryName) {
    localStorage.setItem('selectedCategory', categoryName);
}
window.selectCategory = selectCategory;

function renderBottomCategories(categories) {
    bottomCategoryGrid.innerHTML = categories.map(cat => `
        <a href="../index.html" onclick="selectCategory('${cat.strCategory}')" class="group relative h-28 bg-white rounded shadow-sm overflow-hidden block">
            <span class="absolute top-1.5 right-1.5 z-10 bg-brand text-white px-1.5 py-0.5 text-[10.5px] font-bold rounded-sm uppercase">
                ${cat.strCategory}
            </span>
            <div class="w-full h-full flex items-center justify-center p-2.5 overflow-hidden">
                <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" class="max-w-[85%] max-h-[85%] object-contain transition-transform duration-300 ease-in-out group-hover:scale-110" />
            </div>
        </a>
    `).join('');

    sidebarCategoryList.innerHTML = categories.map(cat => `
        <li>
            <a href="../index.html" onclick="selectCategory('${cat.strCategory}')" class="block px-6 py-3 text-gray-700 hover:bg-brand-light hover:text-brand hover:pl-7 transition-all duration-200 font-medium">
                ${cat.strCategory}
            </a>
        </li>
    `).join('');
}

// ==========================================
// 3. FAST LOAD (USE CACHED CATEGORIES + FETCH RECIPE)
// ==========================================
async function loadMealDetails() {
    // 1. Show bottom categories instantly from localStorage if cached
    const savedCategories = localStorage.getItem('cachedCategories');
    if (savedCategories) {
        renderBottomCategories(JSON.parse(savedCategories));
    }

    // 2. Fetch recipe details
    const mealResponse = await fetch(LOOKUP_API + mealId);
    const mealData = await mealResponse.json();
    const meal = mealData.meals[0];

    // Page titles & image
    document.title = `Meal Finder - ${meal.strMeal}`;
    breadcrumbName.textContent = meal.strMeal.toUpperCase();
    mealTitle.textContent = meal.strMeal;
    mealImage.src = meal.strMealThumb;
    mealCategory.textContent = meal.strCategory.toUpperCase();

    // Source link
    if (meal.strSource) {
        mealSourceRow.classList.remove('hidden');
        mealSourceRow.classList.add('flex');
        mealSourceLink.href = meal.strSource;
        mealSourceLink.textContent = meal.strSource;
    }

    // Tags
    if (meal.strTags) {
        mealTagsRow.classList.remove('hidden');
        mealTagsRow.classList.add('flex');
        mealTagsContainer.innerHTML = meal.strTags.split(',').map(tag => `
            <span class="px-2 py-0.5 border border-[#f5ab8c] rounded text-[11px] text-brand bg-white font-medium">${tag.trim()}</span>
        `).join('');
    }

    // Gather ingredients & measures (loop 1 to 20)
    let ingredientsHTML = '';
    let measuresHTML = '';
    let count = 1;

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal['strIngredient' + i];
        const measure = meal['strMeasure' + i];

        if (ingredient && ingredient.trim() !== '') {
            ingredientsHTML += `
                <div class="flex items-center gap-1.5 font-medium">
                    <span class="w-4 h-4 bg-[#00a8cc] rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white shrink-0">${count}</span>
                    <span>${ingredient.trim()}</span>
                </div>
            `;

            measuresHTML += `
                <div class="flex items-center gap-2 text-xs text-[#2b2b2b]">
                    <i class="fa-solid fa-spoon text-brand text-xs -rotate-6 shrink-0"></i>
                    <span>${measure ? measure.trim() : 'as required'}</span>
                </div>
            `;
            count++;
        }
    }

    ingredientsGrid.innerHTML = ingredientsHTML;
    measureCard.innerHTML = measuresHTML;

    // Instructions
    const steps = meal.strInstructions.split('\n').filter(step => step.trim() !== '');
    instructionsList.innerHTML = steps.map(step => `
        <li class="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
            <i class="fa-regular fa-square-check text-brand text-sm mt-0.5 shrink-0"></i>
            <span>${step.trim()}</span>
        </li>
    `).join('');

    // If categories weren't cached yet, fetch and save them now
    if (!savedCategories) {
        const catResponse = await fetch(CATEGORIES_API);
        const catData = await catResponse.json();
        localStorage.setItem('cachedCategories', JSON.stringify(catData.categories));
        renderBottomCategories(catData.categories);
    }
}

// ==========================================
// 4. SEARCH (SAVE TO LOCALSTORAGE & GO HOME)
// ==========================================
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a recipe name!');
        return;
    }
    localStorage.setItem('searchQuery', query);
    window.location.href = '../../index.html';
});

// ==========================================
// 5. SIDEBAR CONTROLS
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

loadMealDetails();
