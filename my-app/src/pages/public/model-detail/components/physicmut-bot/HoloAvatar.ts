
import * as THREE from 'three';
import { createFresnelShader } from './FresnelShader';

export type AvatarState = 'IDLE' | 'THINKING' | 'EXPLAINING' | 'ERROR';

export class HoloAvatar {
    public mesh: THREE.Group;
    
    // Materials
    private bodyMaterial: THREE.ShaderMaterial; // Seamless Fresnel
    private glassesMaterial: THREE.MeshBasicMaterial; // Glowing
    private ipadScreenMaterial: THREE.MeshStandardMaterial; // Emissive
    private eyeMaterial: THREE.MeshBasicMaterial; // Glowing Eyes
    private antennaTipMaterial: THREE.MeshBasicMaterial; // Antenna Light

    // Facial Feature References for Animation
    private leftEyebrow: THREE.Object3D | undefined;
    private rightEyebrow: THREE.Object3D | undefined;
    private mouth: THREE.Object3D | undefined;
    private antennaTip: THREE.Mesh | undefined;

    constructor(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);

        // 1. New Seamless Material (Fresnel)
        this.bodyMaterial = createFresnelShader(0x00ffff);

        // 2. Glasses Material
        this.glassesMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            side: THREE.DoubleSide
        });

        // 3. iPad Material
        this.ipadScreenMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x00ffff,
            emissiveIntensity: 2.0,
            roughness: 0.2,
            metalness: 0.8
        });

        // 4. Face Features Material
        this.eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.antennaTipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });

        this.buildCharacter();
        this.setState('IDLE'); // Force IDLE state on init
    }

    private buildCharacter() {
        // --- HEAD GROUP ---
        const headGroup = new THREE.Group();
        headGroup.position.y = 2.5; // Move head logic here for easier rotation
        this.mesh.add(headGroup);

        // 1. HEAD MESH (Sphere for seamless look, not Icosahedron)
        const headGeo = new THREE.SphereGeometry(1.2, 64, 64);
        const head = new THREE.Mesh(headGeo, this.bodyMaterial);
        headGroup.add(head);

        // 2. ANTENNA
        const antStem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.5), 
            this.bodyMaterial
        );
        antStem.position.y = 1.45;
        headGroup.add(antStem);

        this.antennaTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.15),
            this.antennaTipMaterial
        );
        this.antennaTip.position.y = 1.7;
        headGroup.add(this.antennaTip);


        // 3. FACE FEATURES
        // Eyes
        const eyeGeo = new THREE.CapsuleGeometry(0.15, 0.3, 4, 8);
        const leftEye = new THREE.Mesh(eyeGeo, this.eyeMaterial);
        leftEye.rotation.z = Math.PI / 2;
        leftEye.position.set(-0.4, 0.1, 1.05); // Front of face
        headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, this.eyeMaterial);
        rightEye.rotation.z = Math.PI / 2;
        rightEye.position.set(0.4, 0.1, 1.05);
        headGroup.add(rightEye);

        // Eyebrows
        const browGeo = new THREE.BoxGeometry(0.4, 0.05, 0.05);
        this.leftEyebrow = new THREE.Mesh(browGeo, this.glassesMaterial); // Re-use glowing mat
        this.leftEyebrow.position.set(-0.4, 0.4, 1.1);
        headGroup.add(this.leftEyebrow);

        this.rightEyebrow = new THREE.Mesh(browGeo, this.glassesMaterial);
        this.rightEyebrow.position.set(0.4, 0.4, 1.1);
        headGroup.add(this.rightEyebrow);

        // Mouth (Torus Segment for curve)
        const mouthGeo = new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI); // Half circle
        this.mouth = new THREE.Mesh(mouthGeo, this.glassesMaterial);
        this.mouth.rotation.x = Math.PI; // Smile down? No, standard torus is ring. 
        // Let's position it to smile. 
        this.mouth.position.set(0, -0.4, 1.1);
        headGroup.add(this.mouth);


        // 4. GLASSES (Overlay on eyes)
        const glassesGroup = new THREE.Group();
        const lensGeo = new THREE.TorusGeometry(0.35, 0.05, 16, 32); 
        const lensLeft = new THREE.Mesh(lensGeo, this.glassesMaterial);
        lensLeft.position.set(-0.4, 0, 0);
        const lensRight = new THREE.Mesh(lensGeo, this.glassesMaterial);
        lensRight.position.set(0.4, 0, 0);
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8), this.glassesMaterial);
        bridge.rotation.z = Math.PI / 2;
        glassesGroup.add(lensLeft, lensRight, bridge);
        glassesGroup.position.set(0, 0.12, 1.15); // Slightly in front of eyes
        headGroup.add(glassesGroup);


        // --- BODY ---
        // Seamless connection: rounded cylinder
        const bodyGeo = new THREE.CapsuleGeometry(0.6, 1.5, 4, 16);
        const body = new THREE.Mesh(bodyGeo, this.bodyMaterial);
        body.position.y = 1.0;
        this.mesh.add(body);


        // --- ARMS & IPAD ---
        const armGeo = new THREE.CapsuleGeometry(0.15, 1.0, 4, 16);
        const rightArm = new THREE.Mesh(armGeo, this.bodyMaterial);
        rightArm.position.set(0.8, 1.5, 0.5);
        rightArm.rotation.set(-Math.PI / 4, 0, -Math.PI / 6);
        this.mesh.add(rightArm);

        // iPad
        const ipadGroup = new THREE.Group();
        const caseMat = new THREE.MeshBasicMaterial({ color: 0x003366 }); // Dark blue case
        const ipadCase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.05), caseMat);
        const ipadScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.4), this.ipadScreenMaterial);
        ipadScreen.position.z = 0.03;
        ipadGroup.add(ipadCase, ipadScreen);
        
        // Position iPad in hand
        ipadGroup.position.set(1.1, 1.6, 1.1); 
        ipadGroup.rotation.set(-Math.PI / 6, -Math.PI / 8, 0);
        this.mesh.add(ipadGroup);
    }

    public setState(state: AvatarState) {
        // Base color mapping
        const colorMap: Record<string, number> = {
            'IDLE': 0x00ffff,    // Cyan
            'THINKING': 0xffaa00,// Orange
            'EXPLAINING': 0x00ff00,// Green
            'ERROR': 0xff0000    // Red
        };
        const colorHex = colorMap[state] || 0x00ffff;
        const color = new THREE.Color(colorHex);

        // 1. Update Materials
        this.glassesMaterial.color.set(color);
        this.ipadScreenMaterial.emissive.set(color);
        this.antennaTipMaterial.color.set(color);
        
        // Update Fresnel Shader Uniforms
        this.bodyMaterial.uniforms.glowColor.value.set(color);
        // Define color schemes per state
        let bodyColorHex = 0x00ffff;
        let glassesColorHex = 0x00ffff;
        let ipadColorHex = 0x00ffff;
        let antennaColorHex = 0x00ffff;
        
        let rimIntensity = 1.0;
        let ipadIntensity = 1.0;

        switch (state) {
            case 'IDLE':
                // Body: Pale Blue, Glasses: Dark/Off, iPad: Dark/Off
                bodyColorHex = 0x0088ff; 
                glassesColorHex = 0x111111; // Almost black
                ipadColorHex = 0x222222;    // Dark grey
                antennaColorHex = 0x00aaff;
                
                rimIntensity = 1.5;
                ipadIntensity = 0.5; // Dim
                
                // Expressions: Neutral
                if(this.mouth) this.mouth.scale.set(1, 0.5, 1);
                if(this.leftEyebrow) this.leftEyebrow.rotation.set(0,0,0);
                if(this.rightEyebrow) this.rightEyebrow.rotation.set(0,0,0);
                break;

            case 'THINKING':
                // Body, Glasses, Antenna: Orange. iPad: Yellow
                bodyColorHex = 0xffaa00;
                glassesColorHex = 0xffaa00;
                ipadColorHex = 0xffff00; // Bright Yellow
                antennaColorHex = 0xffaa00;

                rimIntensity = 3.0;
                ipadIntensity = 3.0;

                // Expressions: Thinking/Frown
                if(this.mouth) this.mouth.scale.set(0.5, 0.5, 1);
                if(this.leftEyebrow) { this.leftEyebrow.rotation.z = -0.2; this.leftEyebrow.position.y = 0.4; }
                if(this.rightEyebrow) { this.rightEyebrow.rotation.z = 0.2; this.rightEyebrow.position.y = 0.4; }
                break;

            case 'EXPLAINING':
                // Body: Cyan (Standard Holo). Glasses: Green. iPad: White
                bodyColorHex = 0x00ffff;
                glassesColorHex = 0x00ff00; // Green glasses
                ipadColorHex = 0xffffff;    // White screen
                antennaColorHex = 0x00ff00;

                rimIntensity = 2.0;
                ipadIntensity = 2.0;

                // Expressions: Happy/Raised
                if(this.mouth) this.mouth.scale.set(1, 1, 1);
                if(this.leftEyebrow) { this.leftEyebrow.rotation.z = 0; this.leftEyebrow.position.y = 0.5; }
                if(this.rightEyebrow) { this.rightEyebrow.rotation.z = 0; this.rightEyebrow.position.y = 0.5; }
                break;

            case 'ERROR':
                // All Red
                bodyColorHex = 0xff0000;
                glassesColorHex = 0xff0000;
                ipadColorHex = 0xff0000;
                antennaColorHex = 0xff0000;

                rimIntensity = 5.0;
                ipadIntensity = 5.0;

                // Expressions: Angry
                if(this.mouth) { this.mouth.rotation.z = Math.PI; this.mouth.scale.set(1, 1, 1); }
                if(this.leftEyebrow) { this.leftEyebrow.rotation.z = 0.4; this.leftEyebrow.position.y = 0.4; }
                if(this.rightEyebrow) { this.rightEyebrow.rotation.z = -0.4; this.rightEyebrow.position.y = 0.4; }
                break;
        }

        // Apply Colors
        this.glassesMaterial.color.setHex(glassesColorHex);
        this.ipadScreenMaterial.emissive.setHex(ipadColorHex);
        this.ipadScreenMaterial.emissiveIntensity = ipadIntensity;
        this.antennaTipMaterial.color.setHex(antennaColorHex);
        
        // Update Fresnel Shader Uniforms
        this.bodyMaterial.uniforms.glowColor.value.setHex(bodyColorHex);
        if(this.bodyMaterial.uniforms.rimIntensity) {
             this.bodyMaterial.uniforms.rimIntensity.value = rimIntensity;
        }
    }
    public update(time: number) {
        // 1. Float
        this.mesh.position.y += Math.sin(time * 2) * 0.002;

        // 2. Update Shader Time
        this.bodyMaterial.uniforms.time.value = time;

        // 3. Mouth Animation (Talking effect if Explaining)
        // We can check state by color or store it property, checking logic easier directly here relative to time
        // If Green (Explaining), wobble mouth scale
        if (this.mouth && this.glassesMaterial.color.getHex() === 0x00ff00) {
             const scaleY = 0.5 + Math.abs(Math.sin(time * 10)) * 0.5;
             this.mouth.scale.setY(scaleY);
        }
    }
}
