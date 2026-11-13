
export class MapInteractions {
    constructor(map) {
        this.map = map;

        this.searchInput = document.getElementById("stateSearch");
        this.searchButton = document.getElementById("searchButton");

        this.init();
    }

    // =====================================
    // INITIALIZE INTERACTIONS
    // =====================================

    init() {
        if (!this.map) {
            console.warn("3D map instance not found.");
            return;
        }

        this.setupSearch();
        this.setupKeyboardNavigation();
        this.setupStateSelectionListener();
    }

    // =====================================
    // SEARCH INPUT
    // =====================================

    setupSearch() {
        if (!this.searchInput) return;

        this.searchInput.addEventListener("input", () => {
            const query = this.searchInput.value.trim();

            if (!query) {
                this.clearSearch();
            }
        });

        this.searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                this.searchState();
            }

            if (event.key === "Escape") {
                this.clearSearch();
            }
        });

        if (this.searchButton) {
            this.searchButton.addEventListener("click", () => {
                this.searchState();
            });
        }
    }

    // =====================================
    // SEARCH STATE
    // =====================================

    searchState() {
        if (!this.searchInput) return;

        const query = this.searchInput.value.trim();

        if (!query) {
            this.showMessage("Please enter a state name.");
            return;
        }

        const normalizedQuery = this.normalize(query);

        const mapState = this.map.states.find(item => {
            return this.normalize(item.name) === normalizedQuery ||
                this.normalize(item.id) === normalizedQuery;
        });

        const stateData = this.map.stateData.find(item => {
            return this.normalize(item.name) === normalizedQuery ||
                this.normalize(item.id) === normalizedQuery;
        });

        if (!mapState && !stateData) {
            this.showMessage(
                `No state or union territory found for "${query}".`
            );
            return;
        }

        if (mapState && this.map.selectState(mapState.id)) {
            this.highlightSearchResult(mapState.name);
            return;
        }

        if (!stateData) {
            this.showMessage(
                `${mapState.name} is not available in the current GeoJSON map.`
            );
            return;
        }

        this.map.updateStatePanel({
            id: stateData.id,
            name: stateData.name,
            data: stateData
        });
        this.showMessage(
            `${stateData.name} details are shown; its boundary is not available in the 3D map.`
        );
    }

    // =====================================
    // NORMALIZE SEARCH TEXT
    // =====================================

    normalize(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]/g, "");
    }

    // =====================================
    // SEARCH FEEDBACK
    // =====================================

    showMessage(message) {
        let messageElement = document.getElementById(
            "mapSearchMessage"
        );

        if (!messageElement) {
            messageElement = document.createElement("div");

            messageElement.id = "mapSearchMessage";
            messageElement.className = "map-search-message";

            if (this.searchInput) {
                this.searchInput.insertAdjacentElement(
                    "afterend",
                    messageElement
                );
            }
        }

        messageElement.textContent = message;
        messageElement.style.display = "block";

        clearTimeout(this.messageTimeout);

        this.messageTimeout = setTimeout(() => {
            messageElement.style.display = "none";
        }, 3000);
    }

    highlightSearchResult(stateName) {
        let messageElement = document.getElementById(
            "mapSearchMessage"
        );

        if (!messageElement) {
            messageElement = document.createElement("div");
            messageElement.id = "mapSearchMessage";
            messageElement.className = "map-search-message";

            this.searchInput.insertAdjacentElement(
                "afterend",
                messageElement
            );
        }

        messageElement.textContent = `${stateName} selected successfully.`;
        messageElement.style.display = "block";

        clearTimeout(this.messageTimeout);

        this.messageTimeout = setTimeout(() => {
            messageElement.style.display = "none";
        }, 2500);
    }

    // =====================================
    // CLEAR SEARCH
    // =====================================

    clearSearch() {
        const messageElement = document.getElementById(
            "mapSearchMessage"
        );

        if (messageElement) {
            messageElement.style.display = "none";
        }
    }

    // =====================================
    // KEYBOARD NAVIGATION
    // =====================================

    setupKeyboardNavigation() {
        if (!this.searchInput) return;

        this.searchInput.setAttribute(
            "aria-label",
            "Search Indian states and union territories"
        );

        if (this.searchButton) {
            this.searchButton.setAttribute(
                "aria-label",
                "Search state"
            );
        }
    }

    // =====================================
    // STATE SELECTION EVENT
    // =====================================

    setupStateSelectionListener() {
        window.addEventListener(
            "indiaStateSelected",
            event => {
                const state = event.detail;

                if (!state) return;

                console.log(
                    "Selected geographical region:",
                    state.stateName
                );
            }
        );
    }

    // =====================================
    // CLEANUP
    // =====================================

    destroy() {
        clearTimeout(this.messageTimeout);
    }
}

// Initialize map interactions
export function initMapInteractions(map) {
    return new MapInteractions(map);
}
