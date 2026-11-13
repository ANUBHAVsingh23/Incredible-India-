
document.addEventListener("DOMContentLoaded", () => {
    const foodContainer = document.getElementById("foodContainer");
    const foodSearch = document.getElementById("foodSearch");
    const stateFilter = document.getElementById("foodStateFilter");
    const categoryFilter = document.getElementById("foodCategoryFilter");
    const foodResult = document.getElementById("foodResult");

    let allDishes = [];

    if (!foodContainer) return;

    // Load cuisine data
    async function loadFood() {
        try {
            const response = await fetch("../data/cuisines.json");

            if (!response.ok) {
                throw new Error("Unable to load cuisines.json");
            }

            allDishes = await response.json();

            populateFilters();
            displayFood(allDishes);

        } catch (error) {
            console.error("Food loading error:", error);

            foodContainer.textContent = "";

            const message = document.createElement("p");
            message.className = "empty-state";
            message.textContent =
                "Unable to load cuisine data. Please check data/cuisines.json and run the project using a local server.";

            foodContainer.appendChild(message);

            if (foodResult) {
                foodResult.textContent = "Cuisine data could not be loaded.";
            }
        }
    }

    // Populate filters
    function populateFilters() {
        const states = [
            ...new Set(
                allDishes.map(dish => dish.state).filter(Boolean)
            )
        ].sort();

        const categories = [
            ...new Set(
                allDishes.map(dish => dish.category).filter(Boolean)
            )
        ].sort();

        populateSelect(stateFilter, states);
        populateSelect(categoryFilter, categories);
    }

    function populateSelect(selectElement, values) {
        if (!selectElement) return;

        const existing = new Set(
            Array.from(selectElement.options).map(option =>
                option.value.toLowerCase()
            )
        );

        values.forEach(value => {
            if (existing.has(value.toLowerCase())) return;

            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;

            selectElement.appendChild(option);
        });
    }

    // Create a food card
    function createFoodCard(dish) {
        const card = document.createElement("article");
        card.className = "food-card";

        const image = document.createElement("img");
        image.className = "food-image";
        image.alt = dish.name || "Indian dish";
        image.loading = "lazy";

        image.src = dish.image || "../assets/images/hero-india.jpg";

        image.addEventListener("error", () => {
            image.src = "../assets/images/hero-india.jpg";
        }, { once: true });

        const content = document.createElement("div");
        content.className = "food-card-content";

        const category = document.createElement("span");
        category.className = "food-category";
        category.textContent = dish.category || "Regional Cuisine";

        const name = document.createElement("h3");
        name.textContent = dish.name || "Unnamed Dish";

        const meta = document.createElement("div");
        meta.className = "food-meta";

        const details = [
            dish.state,
            dish.foodType
        ].filter(Boolean);

        meta.textContent = details.join(" • ");

        const description = document.createElement("p");
        description.textContent =
            dish.description || "Discover this traditional Indian dish.";

        const ingredients = document.createElement("p");
        ingredients.className = "food-ingredients";

        const ingredientsLabel = document.createElement("strong");
        ingredientsLabel.textContent = "Ingredients: ";

        const ingredientsText = document.createTextNode(
            Array.isArray(dish.ingredients)
                ? dish.ingredients.join(", ")
                : dish.ingredients || "Not specified"
        );

        ingredients.append(ingredientsLabel, ingredientsText);

        content.append(category, name, meta, description, ingredients);
        card.append(image, content);

        return card;
    }

    // Display food cards
    function displayFood(dishes) {
        foodContainer.textContent = "";

        if (dishes.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-state";
            message.textContent =
                "No dishes found. Try another search or filter.";

            foodContainer.appendChild(message);
        } else {
            const fragment = document.createDocumentFragment();

            dishes.forEach(dish => {
                fragment.appendChild(createFoodCard(dish));
            });

            foodContainer.appendChild(fragment);
        }

        if (foodResult) {
            foodResult.textContent =
                `Showing ${dishes.length} of ${allDishes.length} dishes`;
        }
    }

    // Search and filter dishes
    function filterFood() {
        const searchTerm = foodSearch
            ? foodSearch.value.trim().toLowerCase()
            : "";

        const selectedState = stateFilter
            ? stateFilter.value.toLowerCase()
            : "";

        const selectedCategory = categoryFilter
            ? categoryFilter.value.toLowerCase()
            : "";

        const filteredDishes = allDishes.filter(dish => {
            const searchableText = [
                dish.name,
                dish.state,
                dish.category,
                dish.foodType,
                dish.description,
                dish.ingredients
            ]
                .flat()
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            const matchesState =
                !selectedState ||
                (dish.state || "").toLowerCase() === selectedState;

            const matchesCategory =
                !selectedCategory ||
                (dish.category || "").toLowerCase() === selectedCategory;

            return matchesSearch && matchesState && matchesCategory;
        });

        displayFood(filteredDishes);
    }

    // Event listeners
    if (foodSearch) {
        foodSearch.addEventListener("input", filterFood);
    }

    if (stateFilter) {
        stateFilter.addEventListener("change", filterFood);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterFood);
    }

    // Initialize
    loadFood();
});
