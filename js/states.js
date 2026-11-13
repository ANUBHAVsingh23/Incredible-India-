
document.addEventListener("DOMContentLoaded", () => {
    const statesGrid = document.getElementById("statesGrid");
    const stateSearch = document.getElementById("stateSearch");
    const regionFilter = document.getElementById("regionFilter");
    const typeFilter = document.getElementById("typeFilter");
    const statesResult = document.getElementById("statesResult");

    let allStates = [];

    if (!statesGrid) return;

    // Load state data
    async function loadStates() {
        try {
            const response = await fetch("../data/states.json");

            if (!response.ok) {
                throw new Error("Unable to load states.json.");
            }

            const states = await response.json();
            allStates = states;

            populateRegionFilter();
            displayStates(allStates);
        } catch (error) {
            console.error("States loading error:", error);

            statesGrid.textContent = "";

            const errorMessage = document.createElement("p");
            errorMessage.className = "empty-state";
            errorMessage.textContent =
                "Unable to load state information. Please check your data/states.json file and run the project using a local server.";

            statesGrid.appendChild(errorMessage);

            if (statesResult) {
                statesResult.textContent = "Unable to load states.";
            }

        }
    }

    // Populate region filter using available data
    function populateRegionFilter() {
        if (!regionFilter) return;

        const existingOptions = new Set(
            Array.from(regionFilter.options).map(option =>
                option.value.toLowerCase()
            )
        );

        const regions = [
            ...new Set(
                allStates
                    .map(state => state.region)
                    .filter(Boolean)
            )
        ].sort();

        regions.forEach(region => {
            if (existingOptions.has(region.toLowerCase())) return;

            const option = document.createElement("option");
            option.value = region;
            option.textContent = region;

            regionFilter.appendChild(option);
        });
    }

    // Create a state card
    function createStateCard(state) {
        const card = document.createElement("article");
        card.className = "state-card";

        const cardContent = document.createElement("div");
        cardContent.className = "state-card-content";

        const type = document.createElement("span");
        type.className = "state-type";
        type.textContent = state.type || "Indian Territory";

        const name = document.createElement("h3");
        name.textContent = state.name || "Unknown";

        const capital = document.createElement("p");
        capital.className = "state-capital";
        capital.textContent = `Capital: ${state.capital || "Not specified"}`;

        const region = document.createElement("p");
        region.className = "state-region";
        region.textContent = `Region: ${state.region || "Not specified"}`;

        const description = document.createElement("p");
        description.className = "state-description";
        description.textContent =
            state.description || "Discover the culture and heritage of this region.";

        const famousFor = document.createElement("p");
        famousFor.className = "state-famous";
        famousFor.textContent = `Famous for: ${
            Array.isArray(state.famousFor)
                ? state.famousFor.join(", ")
                : state.famousFor || "Culture and heritage"
        }`;

        const exploreLink = document.createElement("a");
        exploreLink.className = "state-explore-btn";
        exploreLink.href = `state.html?id=${encodeURIComponent(state.id)}`;
        exploreLink.textContent = "Explore State →";

        cardContent.append(
            type,
            name,
            capital,
            region,
            description,
            famousFor,
            exploreLink
        );

        card.appendChild(cardContent);

        return card;
    }

    // Display state cards
    function displayStates(states) {
        statesGrid.textContent = "";

        if (states.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-state";
            emptyMessage.textContent =
                "No states found. Try changing your search or filters.";

            statesGrid.appendChild(emptyMessage);
        } else {
            const fragment = document.createDocumentFragment();

            states.forEach(state => {
                fragment.appendChild(createStateCard(state));
            });

            statesGrid.appendChild(fragment);
        }

        if (statesResult) {
            statesResult.textContent =
                `Showing ${states.length} of ${allStates.length} regions`;
        }
    }

    // Search and filter states
    function filterStates() {
        const searchTerm = stateSearch
            ? stateSearch.value.trim().toLowerCase()
            : "";

        const selectedRegion = regionFilter
            ? regionFilter.value.toLowerCase()
            : "";

        const selectedType = typeFilter
            ? typeFilter.value.toLowerCase()
            : "";

        const filteredStates = allStates.filter(state => {
            const searchableText = [
                state.name,
                state.capital,
                state.region,
                state.description,
                state.famousFor
            ]
                .flat()
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            const matchesRegion =
                !selectedRegion ||
                (state.region || "").toLowerCase() === selectedRegion;

            const matchesType =
                !selectedType ||
                (state.type || "").toLowerCase() === selectedType;

            return matchesSearch && matchesRegion && matchesType;
        });

        displayStates(filteredStates);
    }

    // Event listeners
    if (stateSearch) {
        stateSearch.addEventListener("input", filterStates);
    }

    if (regionFilter) {
        regionFilter.addEventListener("change", filterStates);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", filterStates);
    }

    // Initialize page
    loadStates();
});
