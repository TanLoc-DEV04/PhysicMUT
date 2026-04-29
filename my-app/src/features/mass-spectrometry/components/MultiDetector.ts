import * as THREE from 'three';

interface BinConfig {
    label: string;
    color: number;
}

/**
 * MultiDetector — 3 Faraday cups placed at the exit of the mass analyzer arc.
 *
 * Physics recap:
 *   Particle exits the 90° arc at position (8+R, 0, −R) moving in −z direction.
 *   Lighter isotopes (smaller R) land closer to the inner edge (smaller x, smaller |z|).
 *   Heavier isotopes (larger R) land further out (larger x, larger |z|).
 *
 * Cup layout (local X axis of this group, centered at the typical exit point):
 *   Cup 0 (light / C-12): xOffset = -1.5
 *   Cup 1 (medium / C-13): xOffset = 0
 *   Cup 2 (heavy / C-14): xOffset = +1.5
 *
 * The group must be positioned in the scene at the analyzer arc exit.
 */
export class MultiDetector {
    public mesh: THREE.Group;
    private bins: Array<{
        cup:      THREE.Mesh;
        lightMat: THREE.MeshBasicMaterial;
        barMesh:  THREE.Mesh;
        count:    number;
    }> = [];
    private barGroup: THREE.Group;

    constructor() {
        this.mesh     = new THREE.Group();
        this.barGroup = new THREE.Group();
        this.mesh.add(this.barGroup);
        this._buildBins();
        this._buildBarBase();
    }

    // ── Build 3 Faraday cups, tightly spaced along the arc-exit X axis ────────
    private _buildBins() {
        const configs: BinConfig[] = [
            { label: 'B1', color: 0x00ff88 },  // light isotope — green
            { label: 'B2', color: 0x4488ff },  // medium isotope — blue
            { label: 'B3', color: 0xff4422 },  // heavy isotope — red
        ];

        configs.forEach((cfg, i) => {
            // Cups spread tightly along X: -1.5, 0, +1.5
            const xOffset = (i - 1) * 1.5;

            // Cup shape — LatheGeometry around Y, then rotated so opening faces +Z
            const pts = [
                new THREE.Vector2(0,    0),
                new THREE.Vector2(0.55, 0),
                new THREE.Vector2(0.55, 1.6),
                new THREE.Vector2(0.75, 1.6),
                new THREE.Vector2(0.75, -0.15),
                new THREE.Vector2(0,   -0.15),
            ];
            const cupGeo = new THREE.LatheGeometry(pts, 20);
            const cupMat = new THREE.MeshStandardMaterial({
                color:     cfg.color,
                metalness: 0.65,
                roughness: 0.25,
            });
            const cup = new THREE.Mesh(cupGeo, cupMat);
            cup.position.set(xOffset, 0, 0);
            // Opening faces +Z (to catch -z moving particles from the analyzer)
            cup.rotation.x = -Math.PI / 2;
            this.mesh.add(cup);

            // LED signal light (above cup)
            const lightMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
            const light = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), lightMat);
            light.position.set(xOffset, 1.2, 0);
            this.mesh.add(light);

            // Thin wire connecting cup to stand
            const wire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8),
                new THREE.MeshBasicMaterial({ color: 0x888888 })
            );
            wire.position.set(xOffset, 0.7, 0);
            this.mesh.add(wire);

            // Bar chart bar (grows upward)
            const barGeo = new THREE.BoxGeometry(0.6, 1, 0.25);
            barGeo.translate(0, 0.5, 0);
            const barMat = new THREE.MeshBasicMaterial({ color: cfg.color });
            const barMesh = new THREE.Mesh(barGeo, barMat);
            barMesh.position.set(xOffset, -2.8, 0.1);
            barMesh.scale.set(1, 0.01, 1);
            this.barGroup.add(barMesh);

            this.bins.push({ cup, lightMat, barMesh, count: 0 });
        });
    }

    private _buildBarBase() {
        // Thin platform / stand
        const stand = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.15, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.4 })
        );
        stand.position.set(0, -1.6, 0);
        this.mesh.add(stand);

        // Chart baseline
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.1, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x111122 })
        );
        base.position.set(0, -2.85, 0.1);
        this.mesh.add(base);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /** Flash bin i (0-based): green on hit, red on miss */
    public flashBin(binIndex: number, success: boolean) {
        const bin = this.bins[binIndex];
        if (!bin) return;
        bin.lightMat.color.setHex(success ? 0x00ff44 : 0xff2200);
        setTimeout(() => bin.lightMat.color.setHex(0x333333), 500);
    }

    /** Increment bar chart for bin i (0-based) */
    public addCount(binIndex: number) {
        const bin = this.bins[binIndex];
        if (!bin) return;
        bin.count++;
        bin.barMesh.scale.y = Math.min(4.5, 0.01 + bin.count * 0.1);
    }

    /** Reset all bins for a new mission */
    public resetCounts() {
        this.bins.forEach(b => {
            b.count = 0;
            b.barMesh.scale.y = 0.01;
            b.lightMat.color.setHex(0x333333);
        });
    }

    get binCount() { return this.bins.length; }
}
