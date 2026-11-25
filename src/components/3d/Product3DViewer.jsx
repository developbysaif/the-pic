'use client';
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
export const Product3DViewer = ({ color = '#789575', shape = 'serum', className = 'w-full h-80', }) => {
    const mountRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount)
            return;
        // Dimensions
        const width = mount.clientWidth || 300;
        const height = mount.clientHeight || 300;
        // Scene
        const scene = new THREE.Scene();
        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 7);
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.appendChild(renderer.domElement);
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);
        const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.0);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xd4dbc0, 1.2);
        fillLight.position.set(-5, 3, -2);
        scene.add(fillLight);
        const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
        rimLight.position.set(0, -5, -4);
        scene.add(rimLight);
        // Master Product Group
        const productGroup = new THREE.Group();
        // Materials
        const baseColor = new THREE.Color(color);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: baseColor,
            transmission: 0.7,
            opacity: 1,
            transparent: true,
            roughness: 0.15,
            metalness: 0.05,
            ior: 1.5,
            thickness: 0.6,
            specularIntensity: 1.0,
            specularColor: new THREE.Color(0xffffff),
        });
        const bambooMaterial = new THREE.MeshStandardMaterial({
            color: 0xd9b382,
            roughness: 0.6,
            metalness: 0.05,
        });
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.25,
            metalness: 0.85,
        });
        const liquidMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#5E7A5B'),
            transmission: 0.5,
            transparent: true,
            roughness: 0.1,
            metalness: 0.0,
        });
        if (shape === 'candle') {
            // Ceramic Candle Body
            const candleGeo = new THREE.CylinderGeometry(1.4, 1.3, 2.4, 48);
            const ceramicMat = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: 0.45,
                metalness: 0.05,
            });
            const candleMesh = new THREE.Mesh(candleGeo, ceramicMat);
            candleMesh.castShadow = true;
            productGroup.add(candleMesh);
            // Soy wax top
            const waxGeo = new THREE.CylinderGeometry(1.36, 1.36, 0.2, 48);
            const waxMat = new THREE.MeshStandardMaterial({
                color: 0xfaf9f0,
                roughness: 0.9,
            });
            const waxMesh = new THREE.Mesh(waxGeo, waxMat);
            waxMesh.position.y = 1.1;
            productGroup.add(waxMesh);
            // Wooden Wick
            const wickGeo = new THREE.BoxGeometry(0.08, 0.5, 0.25);
            const wickMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.8 });
            const wickMesh = new THREE.Mesh(wickGeo, wickMat);
            wickMesh.position.y = 1.35;
            productGroup.add(wickMesh);
        }
        else if (shape === 'jar') {
            // Heavy Cream Jar Body
            const jarGeo = new THREE.CylinderGeometry(1.6, 1.6, 1.6, 48);
            const jarMesh = new THREE.Mesh(jarGeo, glassMaterial);
            jarMesh.castShadow = true;
            productGroup.add(jarMesh);
            // Wooden Cap
            const capGeo = new THREE.CylinderGeometry(1.68, 1.68, 0.5, 48);
            const capMesh = new THREE.Mesh(capGeo, bambooMaterial);
            capMesh.position.y = 1.0;
            productGroup.add(capMesh);
        }
        else {
            // Serum / Mist Bottle
            // Glass Body
            const bottleGeo = new THREE.CylinderGeometry(1.0, 1.0, 3.0, 48);
            const bottleMesh = new THREE.Mesh(bottleGeo, glassMaterial);
            bottleMesh.castShadow = true;
            productGroup.add(bottleMesh);
            // Inner Liquid
            const liquidGeo = new THREE.CylinderGeometry(0.92, 0.92, 2.2, 32);
            const liquidMesh = new THREE.Mesh(liquidGeo, liquidMaterial);
            liquidMesh.position.y = -0.3;
            productGroup.add(liquidMesh);
            // Bottle Shoulder / Neck
            const neckGeo = new THREE.CylinderGeometry(0.45, 0.9, 0.5, 32);
            const neckMesh = new THREE.Mesh(neckGeo, glassMaterial);
            neckMesh.position.y = 1.75;
            productGroup.add(neckMesh);
            // Collar (Gold or Bamboo)
            const collarGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.6, 32);
            const collarMesh = new THREE.Mesh(collarGeo, shape === 'mist' ? goldMaterial : bambooMaterial);
            collarMesh.position.y = 2.2;
            productGroup.add(collarMesh);
            // Pipette rubber / Mist nozzle
            const topGeo = new THREE.SphereGeometry(0.38, 24, 24);
            const topMat = new THREE.MeshStandardMaterial({
                color: shape === 'mist' ? 0xffffff : 0x263323,
                roughness: 0.7,
            });
            const topMesh = new THREE.Mesh(topGeo, topMat);
            topMesh.position.y = 2.6;
            topMesh.scale.set(0.9, 1.3, 0.9);
            productGroup.add(topMesh);
        }
        // Shadow Floor
        const shadowGeo = new THREE.PlaneGeometry(10, 10);
        const shadowMat = new THREE.ShadowMaterial({ opacity: 0.15 });
        const shadowFloor = new THREE.Mesh(shadowGeo, shadowMat);
        shadowFloor.rotation.x = -Math.PI / 2;
        shadowFloor.position.y = -2.0;
        shadowFloor.receiveShadow = true;
        scene.add(shadowFloor);
        productGroup.position.y = -0.2;
        scene.add(productGroup);
        // Mouse drag interaction
        let isDragging = false;
        let prevMouseX = 0;
        let prevMouseY = 0;
        const handleMouseDown = (e) => {
            isDragging = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        };
        const handleMouseMove = (e) => {
            if (!isDragging)
                return;
            const deltaX = e.clientX - prevMouseX;
            const deltaY = e.clientY - prevMouseY;
            productGroup.rotation.y += deltaX * 0.01;
            productGroup.rotation.x += deltaY * 0.01;
            // Clamp vertical tilt
            productGroup.rotation.x = Math.max(-0.4, Math.min(0.4, productGroup.rotation.x));
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        };
        const handleMouseUp = () => {
            isDragging = false;
        };
        const domElement = renderer.domElement;
        domElement.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        // Resize handler
        const handleResize = () => {
            if (!mount)
                return;
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);
        // Animation Loop
        let animationFrameId;
        let clock = new THREE.Clock();
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            if (!isDragging && autoRotate) {
                productGroup.rotation.y += 0.008;
            }
            // Gentle floating levitation effect
            productGroup.position.y = -0.2 + Math.sin(elapsedTime * 1.5) * 0.08;
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            cancelAnimationFrame(animationFrameId);
            domElement.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
            if (mount.contains(domElement)) {
                mount.removeChild(domElement);
            }
            renderer.dispose();
        };
    }, [color, shape, autoRotate]);
    return (<div ref={mountRef} className={`relative cursor-grab active:cursor-grabbing select-none ${className}`} onMouseEnter={() => {
            setIsHovered(true);
            setAutoRotate(false);
        }} onMouseLeave={() => {
            setIsHovered(false);
            setAutoRotate(true);
        }}>
      <div className="absolute bottom-2 right-2 z-10 px-2.5 py-1 rounded-full bg-sage-dark/70 text-sage-ivory text-[10px] font-medium backdrop-blur-md pointer-events-none flex items-center space-x-1">
        <span>3D Interactive • Drag to Rotate</span>
      </div>
    </div>);
};
export default Product3DViewer;
