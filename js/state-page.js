
document.addEventListener("DOMContentLoaded", () => {
    const stateLoading = document.getElementById("stateLoading");
    const stateContent = document.getElementById("stateContent");

    const params = new URLSearchParams(window.location.search);
    const stateId = params.get("id");
    const stateHeroImages = {
        "andhra-pradesh": "kuchipudi.jfif",
        "arunachal-pradesh": "tawangfestival.jfif",
        assam: "bihuu.jfif",
        bihar: "madhubani-painting.jfif",
        chhattisgarh: "chhau.jfif",
        goa: "goan-fish-curry.jpg",
        gujarat: "rani-ki-vavv.jfif",
        haryana: "dhyan-chand.jfif",
        "himachal-pradesh": "momos.jfif",
        jharkhand: "dhuska.jfif",
        karnataka: "hampii.jfif",
        kerala: "kathakali.jfif",
        "madhya-pradesh": "sanchi-stupaa.jfif",
        maharashtra: "gateway-of-indiaa.jfif",
        manipur: "manipuri-dance.jfif",
        meghalaya: "wangalaa.jfif",
        mizoram: "chapcharkut.jfif",
        nagaland: "hornbillfestival.jpg",
        odisha: "konark-sun-temple.jfif",
        punjab: "golden-templee.jfif",
        rajasthan: "hawa-mahall.jfif",
        sikkim: "momos.jpg",
        "tamil-nadu": "meenakshi-temple.jpg",
        telangana: "charminarr.jfif",
        tripura: "kharchi-pujaa.jfif",
        "uttar-pradesh": "taj-mahall.jfif",
        uttarakhand: "dhyanalinga.jfif",
        "west-bengal": "victoria-memoriall.jfif",
        "andaman-nicobar": "hero-india.jpg",
        chandigarh: "artculture.jpg",
        "dadra-nagar-haveli-daman-diu": "hazar-duari.jfif",
        delhi: "red-fortt.jfif",
        "jammu-kashmir": "pashmina-weaving.jfif",
        ladakh: "losarr.jfif",
        lakshadweep: "puttu.jpg",
        puducherry: "traditional-attire.jpg"
    };

    // Display an error message
    function showError(message) {
        if (stateLoading) {
            stateLoading.textContent = "";

            const heading = document.createElement("h2");
            heading.textContent = "State Not Found";

            const paragraph = document.createElement("p");
            paragraph.textContent = message;

            const link = document.createElement("a");
            link.href = "states.html";
            link.className = "back-states";
            link.textContent = "← Explore All States";

            stateLoading.append(heading, paragraph, link);
            stateLoading.className = "state-error";
        }
    }

    // Safely update text content
    function setText(id, value, fallback = "Not available") {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value || fallback;
        }
    }

    // Display state highlights
    function displayHighlights(highlights) {
        const container = document.getElementById("stateHighlights");

        if (!container) return;

        container.textContent = "";

        const items = Array.isArray(highlights)
            ? highlights
            : highlights
                ? [highlights]
                : [];

        if (items.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No highlights available yet.";
            container.appendChild(message);
            return;
        }

        items.forEach(item => {
            const tag = document.createElement("span");
            tag.className = "highlight-tag";
            tag.textContent = item;
            container.appendChild(tag);
        });
    }

    // Load selected state
    async function loadState() {
        if (!stateId) {
            showError("No state was selected. Please choose a state from the Explore States page.");
            return;
        }

        try {
            const response = await fetch("../data/states.json");

            if (!response.ok) {
                throw new Error("Unable to load states.json.");
            }

            const states = await response.json();

            const state = states.find(
                item => item.id.toLowerCase() === stateId.toLowerCase()
            );

            if (!state) {
                showError("The requested state or union territory could not be found.");
                return;
            }

            // Update browser title
            document.title = `${state.name} | Incredible India`;

            // Update hero section
            setText("breadcrumbState", state.name);
            setText("stateType", state.type);
            setText("stateName", state.name);
            setText("stateDescription", state.description);

            const stateHero = document.querySelector(".state-hero");
            const heroImage = stateHeroImages[state.id];

            if (stateHero && heroImage) {
                const imageUrl = new URL(`../assets/images/${heroImage}`, document.baseURI);
                stateHero.style.setProperty("--state-hero-image", `url("${imageUrl.href}")`);
            }

            // Update overview
            setText("stateCapital", state.capital);
            setText("stateRegion", state.region);
            setText("stateLanguage", state.language);

            // Update highlights
            displayHighlights(state.famousFor);

            // Show content after loading
            if (stateLoading) {
                stateLoading.hidden = true;
            }

            if (stateContent) {
                stateContent.hidden = false;
            }

        } catch (error) {
            console.error("State page error:", error);

            showError(
                "Something went wrong while loading this state's information. Please check your data file and try again."
            );
        }
    }

    loadState();
});
