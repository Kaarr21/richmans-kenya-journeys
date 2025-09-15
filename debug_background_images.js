// Debug script for background images
// Run this in the browser console to debug image loading issues

console.log('🔍 Background Image Debug Script');
console.log('================================');

// Check environment
const isProduction = window.location.hostname.includes('onrender.com') || 
                    window.location.hostname.includes('herokuapp.com') ||
                    !window.location.hostname.includes('localhost');

console.log('Environment:', {
    hostname: window.location.hostname,
    isProduction,
    protocol: window.location.protocol,
    port: window.location.port
});

// Test image URLs
const imageUrls = [
    '/static/kenya-safari-hero.jpg',
    '/static/kenya-wildlife-hero.jpg',
    '/static/kenya-landscape-hero.jpg',
    '/static/Masai_Mara_at_Sunset.jpg'
];

console.log('Testing image URLs:');
imageUrls.forEach((url, index) => {
    const fullUrl = window.location.origin + url;
    console.log(`${index + 1}. ${fullUrl}`);
    
    // Test if image loads
    const img = new Image();
    img.onload = () => {
        console.log(`✅ Image ${index + 1} loaded successfully: ${url}`);
    };
    img.onerror = (error) => {
        console.error(`❌ Image ${index + 1} failed to load: ${url}`, error);
    };
    img.src = fullUrl;
});

// Check if images are in DOM
console.log('Checking for background images in DOM...');
const elementsWithBackground = document.querySelectorAll('[style*="background-image"]');
console.log(`Found ${elementsWithBackground.length} elements with background-image`);

elementsWithBackground.forEach((el, index) => {
    const bgImage = el.style.backgroundImage;
    console.log(`Element ${index + 1}: ${bgImage}`);
});

// Check for any image elements
const allImages = document.querySelectorAll('img');
console.log(`Found ${allImages.length} img elements in DOM`);

// Check for any 404 errors in console
console.log('Checking for network errors...');
const originalError = console.error;
console.error = function(...args) {
    if (args[0] && args[0].includes && args[0].includes('404')) {
        console.log('🚨 404 Error detected:', args);
    }
    originalError.apply(console, args);
};

console.log('Debug script completed. Check the results above.');
