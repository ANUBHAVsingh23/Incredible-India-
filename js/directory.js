
/* =========================================
   INCREDIBLE INDIA - DIRECTORY CONTROLLER
========================================= */

const DIRECTORY_CONFIG = {
    historicalPlaces: {
        container: "placesContainer",
        search: "placesSearch",
        stateFilter: "placesStateFilter",
        categoryFilter: "placesCategoryFilter",
        result: "placesResult",
        data: "../data/historical-places.json",
        fields: ["name", "state", "location", "period", "description", "category"],
        imageFallback: "../assets/images/taj-mahal.jpg",
        emptyMessage: "No historical places found."
    },

    languages: {
        container: "languagesContainer",
        search: "languagesSearch",
        stateFilter: "languagesRegionFilter",
        categoryFilter: "languagesFamilyFilter",
        result: "languagesResult",
        data: "../data/language.json",
        fields: ["name", "region", "family", "description", "script", "speakers"],
        emptyMessage: "No languages found."
    },

    artCulture: {
        container: "artCultureContainer",
        search: "artCultureSearch",
        stateFilter: "artCultureStateFilter",
        categoryFilter: "artCultureCategoryFilter",
        result: "artCultureResult",
        data: "../data/art-culture.json",
        fields: ["name", "state", "category", "description", "origin", "medium"],
        imageFallback: "../assets/images/artculture.jpg",
        emptyMessage: "No art and culture records found."
    },

    personalities: {
        container: "personalitiesContainer",
        search: "personalitiesSearch",
        stateFilter: "personalitiesCategoryFilter",
        categoryFilter: null,
        result: "personalitiesResult",
        data: "../data/personalities.json",
        fields: ["name", "category", "state", "description", "knownFor", "profession"],
        emptyMessage: "No personalities found."
    }
};

const DIRECTORY_ICONS = {
    historicalPlaces: "🏛️",
    languages: "🗣️",
    artCulture: "🎨",
    personalities: "🌟"
};

function getElement(id) {
    return id ? document.getElementById(id) : null;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
}

function getRecordValue(record, keys) {
    for (const key of keys) {
        if (record[key] !== undefined && record[key] !== null && record[key] !== "") {
            return record[key];
        }
    }

    return "";
}

function createDirectoryCard(record, type, fallbackImage, videoHue) {
    const name = getRecordValue(record, ["name", "title"]) || "Untitled";
    const description = getRecordValue(record, ["description", "about"]) ||
        "Discover more about India's cultural heritage.";

    const state = getRecordValue(record, ["state", "region"]);
    const category = getRecordValue(record, ["category", "family", "profession"]);
    const image = record.image || fallbackImage || "";

    const metadata = [
        state ? `<span>📍 ${escapeHTML(state)}</span>` : "",
        category ? `<span>✦ ${escapeHTML(category)}</span>` : ""
    ].filter(Boolean).join("");

    const imageMarkup = image
        ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" loading="lazy"
                onerror="this.style.display='none'">`
        : `<div class="directory-card-placeholder">${DIRECTORY_ICONS[type]}</div>`;

    const extraDetails = [
        record.period ? `<p><strong>Period:</strong> ${escapeHTML(record.period)}</p>` : "",
        record.script ? `<p><strong>Script:</strong> ${escapeHTML(record.script)}</p>` : "",
        record.speakers ? `<p><strong>Speakers:</strong> ${escapeHTML(record.speakers)}</p>` : "",
        record.knownFor ? `<p><strong>Known for:</strong> ${escapeHTML(record.knownFor)}</p>` : "",
        record.medium ? `<p><strong>Medium:</strong> ${escapeHTML(record.medium)}</p>` : "",
        record.origin ? `<p><strong>Origin:</strong> ${escapeHTML(record.origin)}</p>` : ""
    ].filter(Boolean).join("");
    const videoLink = type === "artCulture" && record.videoUrl
        ? `<a class="directory-card-video-link" href="${escapeHTML(record.videoUrl)}"
                style="--video-hover-color: hsl(${videoHue} 68% 42%)"
                target="_blank" rel="noopener noreferrer"
                aria-label="Watch video about ${escapeHTML(name)} (opens in a new tab)">
                Watch video <span aria-hidden="true">↗</span>
            </a>`
        : "";
    const directionsLink = type === "historicalPlaces"
        ? `<a class="maps-directions-link"
                href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(
                    [name, record.location, state, "India"].filter(Boolean).join(", ")
                )}"
                target="_blank" rel="noopener noreferrer"
                aria-label="Get directions to ${escapeHTML(name)} in Google Maps (opens in a new tab)">
                Get directions <span aria-hidden="true">↗</span>
            </a>`
        : "";
    const languageVideoLink = type === "languages"
        ? `<a class="language-youtube-link"
                href="https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${name} spoken language conversation`
                )}"
                target="_blank" rel="noopener noreferrer"
                aria-label="Watch spoken ${escapeHTML(name)} on YouTube (opens in a new tab)">
                Hear ${escapeHTML(name)} <span aria-hidden="true">↗</span>
            </a>`
        : "";

    return `
        <article class="directory-card cultural-card" data-record-id="${escapeHTML(record.id || "")}">
            <div class="directory-card-image">
                ${imageMarkup}
            </div>

            <div class="directory-card-content">
                <div class="directory-card-meta">${metadata}</div>

                <h3>${escapeHTML(name)}</h3>

                <p class="directory-card-description">
                    ${escapeHTML(description)}
                </p>

                ${extraDetails
                    ? `<div class="directory-card-details">${extraDetails}</div>`
                    : ""}
                ${videoLink}
                ${directionsLink}
                ${languageVideoLink}
            </div>
        </article>
    `;
}

async function initializeDirectory(type, config) {
    const container = getElement(config.container);

    if (!container) return;

    const searchInput = getElement(config.search);
    const stateFilter = getElement(config.stateFilter);
    const categoryFilter = getElement(config.categoryFilter);
    const resultElement = getElement(config.result);

    container.innerHTML = `
        <div class="directory-loading">
            <p>Loading India's cultural heritage...</p>
        </div>
    `;

    let records = [];

    try {
        const response = await fetch(config.data);

        if (!response.ok) {
            throw new Error(`Unable to load ${config.data}: ${response.status}`);
        }

        const data = await response.json();

        records = Array.isArray(data)
            ? data
            : Array.isArray(data.items)
                ? data.items
                : Array.isArray(data.data)
                    ? data.data
                    : [];

        if (records.length === 0) {
            throw new Error("The data file contains no records.");
        }

    } catch (error) {
        console.error(`Directory error (${type}):`, error);

        container.innerHTML = `
            <div class="directory-empty">
                <h3>Unable to load content</h3>
                <p>${escapeHTML(error.message)}</p>
                <p>Check that the JSON file exists inside the data folder.</p>
            </div>
        `;

        if (resultElement) {
            resultElement.textContent = "Content unavailable";
        }

        return;
    }

    const videoHueById = new Map(
        records.map((record, index) => [
            record.id,
            Math.round((index * 137.508) % 360)
        ])
    );

    function populateFilter(select, keys, defaultLabel) {
        if (!select) return;

        const previousValue = select.value;

        const values = [...new Set(
            records
                .map(record => getRecordValue(record, keys))
                .filter(Boolean)
                .map(value => String(value).trim())
        )].sort((a, b) => a.localeCompare(b));

        select.innerHTML = `
            <option value="">${escapeHTML(defaultLabel)}</option>
            ${values.map(value => `
                <option value="${escapeHTML(value)}">${escapeHTML(value)}</option>
            `).join("")}
        `;

        if (values.includes(previousValue)) {
            select.value = previousValue;
        }
    }

    populateFilter(
        stateFilter,
        type === "languages" ? ["region"] : ["state"],
        type === "languages" ? "All Regions" : "All States"
    );

    populateFilter(
        categoryFilter,
        type === "languages"
            ? ["family"]
            : ["category"],
        type === "languages" ? "All Language Families" : "All Categories"
    );

    if (type === "personalities" && stateFilter) {
        populateFilter(
            stateFilter,
            ["category", "profession"],
            "All Categories"
        );
    }

    function render() {
        const query = normalize(searchInput?.value);
        const selectedState = normalize(stateFilter?.value);
        const selectedCategory = normalize(categoryFilter?.value);

        const filteredRecords = records.filter(record => {
            const searchableText = config.fields
                .map(field => record[field])
                .filter(Boolean)
                .join(" ");

            const matchesSearch = !query ||
                normalize(searchableText).includes(query);

            const stateValue = type === "languages"
                ? record.region
                : type === "personalities"
                    ? getRecordValue(record, ["category", "profession"])
                    : record.state;

            const matchesState = !selectedState ||
                normalize(stateValue) === selectedState;

            const categoryValue = type === "languages"
                ? record.family
                : record.category;

            const matchesCategory = !selectedCategory ||
                normalize(categoryValue) === selectedCategory;

            return matchesSearch && matchesState && matchesCategory;
        });

        if (filteredRecords.length === 0) {
            container.innerHTML = `
                <div class="directory-empty">
                    <h3>No results found</h3>
                    <p>${escapeHTML(config.emptyMessage)}</p>
                    <p>Try changing your search or filters.</p>
                </div>
            `;
        } else {
            container.innerHTML = filteredRecords
                .map(record => createDirectoryCard(
                    record,
                    type,
                    config.imageFallback,
                    videoHueById.get(record.id) ?? 24
                ))
                .join("");
        }

        if (resultElement) {
            resultElement.textContent =
                `Showing ${filteredRecords.length} of ${records.length} results`;
        }
    }

    searchInput?.addEventListener("input", render);
    stateFilter?.addEventListener("change", render);
    categoryFilter?.addEventListener("change", render);

    render();
}

/* =========================================
   DETECT CURRENT DIRECTORY PAGE
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    for (const [type, config] of Object.entries(DIRECTORY_CONFIG)) {
        if (getElement(config.container)) {
            initializeDirectory(type, config);
            break;
        }
    }
});
