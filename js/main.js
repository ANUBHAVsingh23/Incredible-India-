
document.addEventListener("DOMContentLoaded", async () => {

    // =====================================
    // 1. MOBILE NAVIGATION
    // =====================================

    const menuToggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("navigation");

    if (menuToggle && navigation) {

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.addEventListener("click", () => {
            const isOpen = navigation.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.textContent = isOpen ? "✕" : "☰";
        });

        navigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navigation.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            });
        });

        document.addEventListener("click", event => {
            const clickedInside =
                navigation.contains(event.target) ||
                menuToggle.contains(event.target);

            if (!clickedInside) {
                navigation.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            }
        });
    }


    // =====================================
    // 2. SCROLL REVEAL ANIMATIONS
    // =====================================

    function initializeRevealAnimations() {

        const elements = document.querySelectorAll(
            ".section-heading, .feature-card, .project-card, " +
            ".state-card, .festival-card, .food-card, " +
            ".culture-card, .place-card, .language-card, " +
            ".personality-card, .overview-card, .symbol-card"
        );

        if (!("IntersectionObserver" in window)) {
            elements.forEach(element => {
                element.classList.add("visible");
            });

            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        currentObserver.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        elements.forEach(element => {

            if (!element.classList.contains("reveal")) {
                element.classList.add("reveal");
            }

            observer.observe(element);

        });
    }

    initializeRevealAnimations();


    // =====================================
    // 3. SMOOTH SCROLLING
    // =====================================

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#" || !targetId.startsWith("#")) return;

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        });

    });


    // =====================================
    // 4. FOOTER YEAR
    // =====================================

    document.querySelectorAll(".footer-bottom").forEach(element => {

        element.textContent = element.textContent.replace(
            /©\s*\d{4}/,
            `© ${new Date().getFullYear()}`
        );

    });


    // =====================================
    // 5. ACTIVE NAVIGATION
    // =====================================

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    if (navigation) {

        navigation.querySelectorAll("a").forEach(link => {

            const linkPage = link.pathname
                .split("/")
                .pop()
                .toLowerCase();

            if (
                linkPage &&
                linkPage === currentPage &&
                currentPage !== ""
            ) {
                link.classList.add("active");
            }

        });

    }


    // =====================================
    // 6. LAZY LOADING IMAGES
    // =====================================

    document.querySelectorAll("img").forEach(image => {

        if (!image.hasAttribute("loading")) {
            image.loading = "lazy";
        }

    });


    // =====================================
    // 7. INITIALIZE THREE.JS INDIA MAP
    // =====================================

    const mapCanvas = document.getElementById("indiaMapCanvas");

    if (mapCanvas) {

        try {

            console.log("Initializing Incredible India 3D Map...");

            // Load the 3D map engine only on the homepage
            const { initIndiaMap } = await import("./map3d.js");

            // Create the 3D map
            const indiaMap = await initIndiaMap();

            if (indiaMap && indiaMap.states.length > 0) {

                // Load search and interaction functionality
                const { initMapInteractions } =
                    await import("./map-interactions.js");

                initMapInteractions(indiaMap);

                console.log("India 3D map initialized successfully.");

            } else {

                console.warn(
                    "The map could not be created. Check the GeoJSON data."
                );

            }

        } catch (error) {

            console.error("3D map integration error:", error);

            const loading = document.getElementById("mapLoading");

            if (loading) {
                loading.style.display = "flex";
                loading.textContent =
                    "Unable to initialize the 3D map. Please check your internet connection and project files.";
            }

        }
    }


    // =====================================
    // 8. WEBSITE INITIALIZATION
    // =====================================

    console.log(
        "Incredible India – 3D Cultural Explorer is ready."
    );

});
