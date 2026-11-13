
/* =========================================
   INCREDIBLE INDIA - 3D MAP ENGINE
   Three.js + GeoJSON
========================================= */

import * as THREE from "three";

/* =========================================
   CONFIGURATION
========================================= */

const GEOJSON_PATH = "./data/india_states_36.geojson";
const STATES_PATH = "./data/states.json";

const MAP_CONFIG = {
    scale: 1.25,
    height: 0.12,
    hoverHeight: 0.08,
    selectedHeight: 0.16,
    cameraDistance: 34,
    minZoom: 18,
    maxZoom: 65,
    rotationSpeed: 0.005
};

const STATE_ALIASES = {
    "andaman and nicobar islands": "andaman nicobar",
    "andaman nicobar islands": "andaman nicobar",
    "andaman nicobar island": "andaman nicobar",
    "dadra and nagar haveli and daman and diu":
        "dadra nagar haveli daman diu",
    "dadra nagar haveli and daman diu":
        "dadra nagar haveli daman diu",
    "nct of delhi": "delhi",
    "national capital territory of delhi": "delhi",
    "jammu and kashmir": "jammu kashmir",
    "orissa": "odisha",
    "uttaranchal": "uttarakhand",
    "andaman and nicobar": "andaman nicobar",
    "dadra and nagar haveli": "dadra nagar haveli daman diu",
    "daman and diu": "dadra nagar haveli daman diu",
    "chandigarh": "chandigarh",
    "pondicherry": "puducherry"
};

/* =========================================
   HELPERS
========================================= */

function normalizeName(value) {
    let name = String(value || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return STATE_ALIASES[name] || name;
}

function getFeatureName(feature) {
    const properties = feature.properties || {};

    const possibleNames = [
        "st_nm",
        "ST_NM",
        "STNAME",
        "STATE",
        "state",
        "State",
        "NAME_1",
        "NAME",
        "name",
        "state_name",
        "STATE_NAME"
    ];

    for (const key of possibleNames) {
        if (properties[key]) {
            return String(properties[key]).trim();
        }
    }

    return "";
}

function getFeatureCoordinates(feature) {
    const geometry = feature.geometry;

    if (!geometry) return [];

    if (geometry.type === "Polygon") {
        return [geometry.coordinates];
    }

    if (geometry.type === "MultiPolygon") {
        return geometry.coordinates;
    }

    return [];
}

/* =========================================
   INDIA MAP CLASS
========================================= */

export class IndiaMap3D {
    constructor(container) {
        if (!container) {
            throw new Error("Map container #indiaMapCanvas was not found.");
        }

        this.container = container;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mapGroup = null;

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this.states = [];
        this.selectedState = null;
        this.hoveredState = null;

        this.isDragging = false;
        this.previousPointer = { x: 0, y: 0 };

        this.frameId = null;
        this.animationStarted = false;

        this.tooltip = this.createTooltip();

        this.init();
        this.addLights();
        this.addControls();
        this.bindEvents();
    }

    /* =====================================
       INITIALIZE THREE.JS
    ===================================== */

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xeaf0eb);

        this.camera = new THREE.PerspectiveCamera(
            38,
            this.getWidth() / this.getHeight(),
            0.1,
            1000
        );

        this.camera.position.set(
            0,
            0,
            MAP_CONFIG.cameraDistance
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2)
        );

        this.renderer.setSize(
            this.getWidth(),
            this.getHeight()
        );

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        this.renderer.domElement.style.display = "block";
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";

        this.container.appendChild(this.renderer.domElement);

        this.mapGroup = new THREE.Group();
        this.scene.add(this.mapGroup);

        this.mapGroup.rotation.x = -0.12;

        this.animate();
    }

    getWidth() {
        return Math.max(this.container.clientWidth, 300);
    }

    getHeight() {
        return Math.max(this.container.clientHeight, 300);
    }

    /* =====================================
       LIGHTING
    ===================================== */

    addLights() {
        const ambient = new THREE.AmbientLight(
            0xffffff,
            1.5
        );

        this.scene.add(ambient);

        const mainLight = new THREE.DirectionalLight(
            0xffe5aa,
            2.2
        );

        mainLight.position.set(-12, 20, 25);
        mainLight.castShadow = true;

        this.scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(
            0x6d9bc4,
            1.1
        );

        fillLight.position.set(15, -10, 12);
        this.scene.add(fillLight);
    }

    /* =====================================
       LOAD GEOJSON AND STATE DATA
    ===================================== */

    async loadMap() {
        this.showLoading(true);

        try {
            const [geoResponse, statesResponse] = await Promise.all([
                fetch(GEOJSON_PATH),
                fetch(STATES_PATH)
            ]);

            if (!geoResponse.ok) {
                throw new Error("Could not load India GeoJSON boundaries.");
            }

            if (!statesResponse.ok) {
                throw new Error("Could not load states.json.");
            }

            const geoData = await geoResponse.json();
            const stateData = await statesResponse.json();

            if (!geoData.features || !Array.isArray(geoData.features)) {
                throw new Error("Invalid GeoJSON: features are missing.");
            }

            if (!Array.isArray(stateData)) {
                throw new Error("Invalid states.json format.");
            }

            this.stateData = stateData;

            for (const feature of geoData.features) {
                this.createState(feature);
            }

            if (this.states.length === 0) {
                throw new Error("No valid state boundaries were found.");
            }

            this.centerMap();
            this.resize();

            this.dispatchEvent("indiaMapLoaded", {
                totalStates: this.states.length
            });

            return this.states;

        } catch (error) {
            console.error("India map loading error:", error);
            this.showError(error.message);
            throw error;

        } finally {
            this.showLoading(false);
        }
    }

    /* =====================================
       MATCH GEOJSON FEATURE TO STATE DATA
    ===================================== */

    findStateData(featureName) {
        const normalized = normalizeName(featureName);

        return this.stateData.find(state => {
            return normalizeName(state.name) === normalized;
        }) || null;
    }

    /* =====================================
       GEOJSON COORDINATE PROJECTION
    ===================================== */

    projectCoordinate(coordinate) {
        const longitude = Number(coordinate[0]);
        const latitude = Number(coordinate[1]);

        return new THREE.Vector2(
            (longitude - 82) * MAP_CONFIG.scale,
            (latitude - 22) * MAP_CONFIG.scale
        );
    }

    /* =====================================
       CREATE POLYGON SHAPE
    ===================================== */

    createPolygonShape(polygonCoordinates) {
        if (!polygonCoordinates || !polygonCoordinates.length) {
            return null;
        }

        const outerRing = polygonCoordinates[0];

        if (!outerRing || outerRing.length < 4) {
            return null;
        }

        const outerPoints = outerRing.map(
            coordinate => this.projectCoordinate(coordinate)
        );

        const shape = new THREE.Shape();

        shape.moveTo(
            outerPoints[0].x,
            outerPoints[0].y
        );

        for (let i = 1; i < outerPoints.length; i++) {
            shape.lineTo(
                outerPoints[i].x,
                outerPoints[i].y
            );
        }

        const holes = [];

        for (let ringIndex = 1;
            ringIndex < polygonCoordinates.length;
            ringIndex++) {

            const ring = polygonCoordinates[ringIndex];

            if (!ring || ring.length < 4) continue;

            const hole = new THREE.Path();

            const first = this.projectCoordinate(ring[0]);

            hole.moveTo(first.x, first.y);

            for (let i = 1; i < ring.length; i++) {
                const point = this.projectCoordinate(ring[i]);
                hole.lineTo(point.x, point.y);
            }

            holes.push(hole);
        }

        shape.holes = holes;

        return shape;
    }

    /* =====================================
       CREATE 3D STATE MESH
    ===================================== */

    createState(feature) {
        const featureName = getFeatureName(feature);

        if (!featureName) {
            console.warn("GeoJSON feature has no state name:", feature);
            return;
        }

        const stateInfo = this.findStateData(featureName);

        if (!stateInfo) {
            console.warn("No matching state data for:", featureName);
        }

        const polygons = getFeatureCoordinates(feature);

        const stateGroup = new THREE.Group();

        const material = new THREE.MeshStandardMaterial({
            color: 0xb98b37,
            roughness: 0.62,
            metalness: 0.2,
            side: THREE.DoubleSide
        });

        const borderMaterial = new THREE.LineBasicMaterial({
            color: 0xf4d77a,
            transparent: true,
            opacity: 0.85
        });

        let polygonCount = 0;

        for (const polygon of polygons) {
            const shape = this.createPolygonShape(polygon);

            if (!shape) continue;

            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth: MAP_CONFIG.height,
                bevelEnabled: true,
                bevelSegments: 1,
                bevelSize: 0.025,
                bevelThickness: 0.025,
                curveSegments: 2
            });

            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(
                geometry,
                material.clone()
            );

            mesh.position.z = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.userData = {
                stateId: stateInfo?.id || normalizeName(featureName),
                stateName: stateInfo?.name || featureName,
                stateInfo: stateInfo,
                feature: feature
            };

            stateGroup.add(mesh);

            const outlinePoints = polygon[0].map(
                coordinate => this.projectCoordinate(coordinate)
            );

            const outlineGeometry = new THREE.BufferGeometry().setFromPoints(
                outlinePoints.map(point => new THREE.Vector3(
                    point.x,
                    point.y,
                    MAP_CONFIG.height + 0.035
                ))
            );

            const outline = new THREE.Line(
                outlineGeometry,
                borderMaterial
            );

            stateGroup.add(outline);

            polygonCount++;
        }

        if (polygonCount === 0) return;

        stateGroup.userData = {
            stateId: stateInfo?.id || normalizeName(featureName),
            stateName: stateInfo?.name || featureName,
            stateInfo: stateInfo
        };

        this.mapGroup.add(stateGroup);

        this.states.push({
            id: stateInfo?.id || normalizeName(featureName),
            name: stateInfo?.name || featureName,
            data: stateInfo,
            mesh: stateGroup
        });
    }

    /* =====================================
       CENTER MAP
    ===================================== */

    centerMap() {
        const box = new THREE.Box3().setFromObject(this.mapGroup);

        if (box.isEmpty()) return;

        const center = box.getCenter(new THREE.Vector3());

        this.mapGroup.position.x -= center.x;
        this.mapGroup.position.y -= center.y;
    }

    /* =====================================
       TOOLTIP
    ===================================== */

    createTooltip() {
        let tooltip = document.getElementById("mapTooltip");

        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.id = "mapTooltip";
            tooltip.className = "map-tooltip";
            document.body.appendChild(tooltip);
        }

        return tooltip;
    }

    showTooltip(name, x, y) {
        this.tooltip.textContent = name;
        this.tooltip.style.display = "block";
        this.tooltip.style.left = `${x + 14}px`;
        this.tooltip.style.top = `${y + 14}px`;
    }

    hideTooltip() {
        this.tooltip.style.display = "none";
    }

    /* =====================================
       POINTER RAYCASTING
    ===================================== */

    updatePointer(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();

        this.pointer.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        this.pointer.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    getIntersectedState(event) {
        this.updatePointer(event);

        this.raycaster.setFromCamera(
            this.pointer,
            this.camera
        );

        const meshes = [];

        this.states.forEach(state => {
            state.mesh.traverse(child => {
                if (child.isMesh) meshes.push(child);
            });
        });

        const intersections = this.raycaster.intersectObjects(
            meshes,
            false
        );

        if (!intersections.length) return null;

        return intersections[0].object;
    }

    /* =====================================
       HOVER EFFECT
    ===================================== */

    handleHover(event) {
        if (this.isDragging) return;

        const intersected = this.getIntersectedState(event);

        if (!intersected) {
            this.clearHover();
            this.hideTooltip();
            return;
        }

        const state = this.states.find(item =>
            item.id === intersected.userData.stateId
        );

        if (!state) return;

        if (this.hoveredState !== state) {
            this.clearHover();

            this.hoveredState = state;

            if (state !== this.selectedState) {
                this.setStateColor(state, 0xf4c95d);
            }
        }

        this.showTooltip(
            state.name,
            event.clientX,
            event.clientY
        );
    }

    clearHover() {
        if (!this.hoveredState) return;

        if (this.hoveredState !== this.selectedState) {
            this.setStateColor(this.hoveredState, 0xb98b37);
        }

        this.hoveredState = null;
    }

    setStateColor(state, color) {
        state.mesh.traverse(child => {
            if (child.isMesh) {
                child.material.color.setHex(color);
            }
        });
    }

    /* =====================================
       SELECT STATE
    ===================================== */

    selectState(identifier) {
        if (!identifier) return false;

        const searchValue = normalizeName(identifier);

        const state = this.states.find(item => {
            return (
                item.id === identifier ||
                normalizeName(item.id) === searchValue ||
                normalizeName(item.name) === searchValue
            );
        });

        if (!state) {
            console.warn("State not found:", identifier);
            return false;
        }

        if (this.selectedState) {
            this.setStateColor(this.selectedState, 0xb98b37);
        }

        this.selectedState = state;
        this.setStateColor(state, 0xffc857);

        this.updateStatePanel(state);
        this.dispatchEvent("indiaStateSelected", {
            id: state.id,
            name: state.name,
            data: state.data
        });

        return true;
    }

    /* =====================================
       STATE INFORMATION PANEL
    ===================================== */

    updateStatePanel(state) {
        const placeholder = document.getElementById("panelPlaceholder");
        const details = document.getElementById("stateDetails");

        const name = document.getElementById("selectedStateName");
        const description = document.getElementById("selectedStateDescription");
        const capital = document.getElementById("selectedStateCapital");
        const region = document.getElementById("selectedStateRegion");
        const exploreButton = document.getElementById("exploreStateButton");

        if (placeholder) placeholder.style.display = "none";
        if (details) {
            details.hidden = false;
            details.style.display = "block";
            details.classList.add("active");
        }

        const data = state.data || {};

        if (name) name.textContent = state.name;

        if (description) {
            description.textContent =
                data.description || "Explore the heritage and culture of this region.";
        }

        if (capital) {
            capital.textContent = data.capital || "Not available";
        }

        if (region) {
            region.textContent = data.region || "Not available";
        }

        if (exploreButton) {
            exploreButton.href =
                `./pages/state.html?id=${encodeURIComponent(state.id)}`;
        }
    }

    /* =====================================
       MOUSE AND TOUCH EVENTS
    ===================================== */

    bindEvents() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener("pointermove", event => {
            if (this.isDragging) {
                const deltaX = event.clientX - this.previousPointer.x;
                const deltaY = event.clientY - this.previousPointer.y;

                this.mapGroup.rotation.z +=
                    deltaX * MAP_CONFIG.rotationSpeed;

                this.mapGroup.rotation.x +=
                    deltaY * MAP_CONFIG.rotationSpeed;

                this.previousPointer = {
                    x: event.clientX,
                    y: event.clientY
                };

                return;
            }

            this.handleHover(event);
        });

        canvas.addEventListener("pointerdown", event => {
            if (event.button !== 0) return;

            this.isDragging = true;

            this.previousPointer = {
                x: event.clientX,
                y: event.clientY
            };

            canvas.setPointerCapture?.(event.pointerId);
        });

        canvas.addEventListener("pointerup", event => {
            this.isDragging = false;

            const selected = this.getIntersectedState(event);

            if (selected) {
                this.selectState(selected.userData.stateId);
            }
        });

        canvas.addEventListener("pointerleave", () => {
            this.isDragging = false;
            this.clearHover();
            this.hideTooltip();
        });

        canvas.addEventListener("pointercancel", () => {
            this.isDragging = false;
        });

        canvas.addEventListener("wheel", event => {
            event.preventDefault();

            const nextDistance =
                this.camera.position.z + event.deltaY * 0.025;

            this.camera.position.z = THREE.MathUtils.clamp(
                nextDistance,
                MAP_CONFIG.minZoom,
                MAP_CONFIG.maxZoom
            );
        }, { passive: false });

        window.addEventListener("resize", () => this.resize());
    }

    /* =====================================
       ZOOM CONTROLS
    ===================================== */

    zoomIn() {
        this.camera.position.z = Math.max(
            MAP_CONFIG.minZoom,
            this.camera.position.z - 3
        );
    }

    zoomOut() {
        this.camera.position.z = Math.min(
            MAP_CONFIG.maxZoom,
            this.camera.position.z + 3
        );
    }

    resetCamera() {
        this.camera.position.set(
            0,
            0,
            MAP_CONFIG.cameraDistance
        );

        this.mapGroup.rotation.set(-0.12, 0, 0);
        this.centerMap();
    }

    addControls() {
        document.getElementById("zoomIn")
            ?.addEventListener("click", () => this.zoomIn());

        document.getElementById("zoomOut")
            ?.addEventListener("click", () => this.zoomOut());

        document.getElementById("resetCamera")
            ?.addEventListener("click", () => this.resetCamera());
    }

    /* =====================================
       LOADING AND ERROR STATES
    ===================================== */

    showLoading(visible) {
        const loading = document.getElementById("mapLoading");

        if (!loading) return;

        loading.classList.toggle("hidden", !visible);
        loading.classList.toggle("loaded", !visible);
    }

    showError(message) {
        const loading = document.getElementById("mapLoading");

        if (loading) {
            loading.classList.remove("hidden", "loaded");

            loading.innerHTML = `
                <div style="font-size: 30px;">⚠️</div>
                <h3>Map could not be loaded</h3>
                <p>${String(message).replace(/[&<>"']/g, char => ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                })[char])}</p>
                <p>Please check your GeoJSON file and run the project using a local server.</p>
            `;
        }
    }

    /* =====================================
       CUSTOM EVENTS
    ===================================== */

    dispatchEvent(name, detail) {
        window.dispatchEvent(
            new CustomEvent(name, { detail })
        );
    }

    /* =====================================
       RESPONSIVE RESIZE
    ===================================== */

    resize() {
        if (!this.camera || !this.renderer) return;

        const width = this.getWidth();
        const height = this.getHeight();

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /* =====================================
       ANIMATION LOOP
    ===================================== */

    animate() {
        if (this.animationStarted) return;

        this.animationStarted = true;

        const render = () => {
            this.frameId = requestAnimationFrame(render);

            this.renderer.render(
                this.scene,
                this.camera
            );
        };

        render();
    }

    /* =====================================
       CLEANUP
    ===================================== */

    destroy() {
        if (this.frameId !== null) {
            cancelAnimationFrame(this.frameId);
        }

        this.renderer?.dispose();

        this.mapGroup?.traverse(child => {
            child.geometry?.dispose();

            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        this.renderer?.domElement.remove();
        this.tooltip?.remove();
    }
}

/* =========================================
   INITIALIZE MAP
========================================= */

export async function initIndiaMap() {
    const container = document.getElementById("indiaMapCanvas");

    if (!container) {
        console.warn("India map container not found.");
        return null;
    }

    const map = new IndiaMap3D(container);

    try {
        await map.loadMap();
        return map;
    } catch (error) {
        console.error("India map initialization failed:", error);
        return null;
    }
}
