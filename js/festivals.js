
document.addEventListener("DOMContentLoaded", () => {
    const festivalsContainer = document.getElementById("festivalsContainer");
    const festivalSearch = document.getElementById("festivalSearch");
    const stateFilter = document.getElementById("festivalStateFilter");
    const categoryFilter = document.getElementById("festivalCategoryFilter");
    const festivalResult = document.getElementById("festivalResult");

    let allFestivals = [];

    if (!festivalsContainer) return;

    // Load festival data
    async function loadFestivals() {
        try {
            const response = await fetch("../data/festivals.json");

            if (!response.ok) {
                throw new Error("Unable to load festivals.json");
            }

            allFestivals = await response.json();

            populateFilters();
            displayFestivals(allFestivals);

        } catch (error) {
            console.error("Festival loading error:", error);

            festivalsContainer.textContent = "";

            const message = document.createElement("p");
            message.className = "empty-state";
            message.textContent =
                "Unable to load festivals. Please check data/festivals.json and run the project using a local server.";

            festivalsContainer.appendChild(message);

            if (festivalResult) {
                festivalResult.textContent = "Festival data could not be loaded.";
            }
        }
    }

    // Populate state and category filters
    function populateFilters() {
        const states = [
            ...new Set(
                allFestivals
                    .map(festival => festival.state)
                    .filter(Boolean)
            )
        ].sort();

        const categories = [
            ...new Set(
                allFestivals
                    .map(festival => festival.category)
                    .filter(Boolean)
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

    // Create a festival card
    function createFestivalCard(festival) {
        const card = document.createElement("article");
        card.className = "festival-card";

        const image = document.createElement("img");
        image.className = "festival-image";
        image.alt = festival.name || "Indian festival";
        image.loading = "lazy";

        image.src = festival.image || "../assets/images/hero-india.jpg";

        image.addEventListener("error", () => {
            image.src = "../assets/images/hero-india.jpg";
        }, { once: true });

        const content = document.createElement("div");
        content.className = "festival-card-content";

        const category = document.createElement("span");
        category.className = "festival-category";
        category.textContent = festival.category || "Festival";

        const name = document.createElement("h3");
        name.textContent = festival.name || "Unnamed Festival";

        const meta = document.createElement("div");
        meta.className = "festival-meta";

        const details = [
            festival.state,
            festival.month,
            festival.season
        ].filter(Boolean);

        meta.textContent = details.join(" • ");

        const description = document.createElement("p");
        description.textContent =
            festival.description || "Discover this traditional Indian celebration.";

        content.append(category, name, meta, description);
        card.append(image, content);

        return card;
    }

    // Display festivals
    function displayFestivals(festivals) {
        festivalsContainer.textContent = "";

        if (festivals.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-state";
            message.textContent =
                "No festivals found. Try another search or filter.";

            festivalsContainer.appendChild(message);
        } else {
            const fragment = document.createDocumentFragment();

            festivals.forEach(festival => {
                fragment.appendChild(createFestivalCard(festival));
            });

            festivalsContainer.appendChild(fragment);
        }

        if (festivalResult) {
            festivalResult.textContent =
                `Showing ${festivals.length} of ${allFestivals.length} festivals`;
        }
    }

    // Search and filter festivals
    function filterFestivals() {
        const searchTerm = festivalSearch
            ? festivalSearch.value.trim().toLowerCase()
            : "";

        const selectedState = stateFilter
            ? stateFilter.value.toLowerCase()
            : "";

        const selectedCategory = categoryFilter
            ? categoryFilter.value.toLowerCase()
            : "";

        const filtered = allFestivals.filter(festival => {
            const searchableText = [
                festival.name,
                festival.state,
                festival.category,
                festival.season,
                festival.month,
                festival.description
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            const matchesState =
                !selectedState ||
                (festival.state || "").toLowerCase() === selectedState;

            const matchesCategory =
                !selectedCategory ||
                (festival.category || "").toLowerCase() === selectedCategory;

            return matchesSearch && matchesState && matchesCategory;
        });

        displayFestivals(filtered);
    }

    // Event listeners
    if (festivalSearch) {
        festivalSearch.addEventListener("input", filterFestivals);
    }

    if (stateFilter) {
        stateFilter.addEventListener("change", filterFestivals);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterFestivals);
    }

    // Initialize
    loadFestivals();
});
