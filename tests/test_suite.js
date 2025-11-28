
global.URLSearchParams = require('url').URLSearchParams;
const fs = require('fs');

// Improve extraction to be more robust for braces
function extractFunction(fileContent, funcName) {
    const startIndex = fileContent.indexOf(`function ${funcName}(`);
    if (startIndex === -1) return null;

    let braceCount = 0;
    let endIndex = -1;
    let foundStart = false;

    for (let i = startIndex; i < fileContent.length; i++) {
        if (fileContent[i] === '{') {
            braceCount++;
            foundStart = true;
        } else if (fileContent[i] === '}') {
            braceCount--;
            if (foundStart && braceCount === 0) {
                endIndex = i + 1;
                break;
            }
        }
    }

    if (endIndex !== -1) {
        return fileContent.substring(startIndex, endIndex);
    }
    return null;
}

const contentJs = fs.readFileSync('content.js', 'utf8');

// Load functions
const getVideoIDSource = extractFunction(contentJs, 'getVideoID');
const formatTimeSource = extractFunction(contentJs, 'formatTime');

if (!getVideoIDSource || !formatTimeSource) {
    console.error("Failed to extract functions");
    process.exit(1);
}

// Eval functions in global scope
eval(getVideoIDSource);
eval(formatTimeSource);

// --- Tests ---

let failures = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`FAIL: ${message}`);
        failures++;
    } else {
        console.log(`PASS: ${message}`);
    }
}

console.log("--- Testing getVideoID ---");

// Test 1: Watch URL
global.window = { location: { search: '?v=dQw4w9WgXcQ', href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } };
assert(getVideoID() === 'dQw4w9WgXcQ', "Standard Watch URL");

// Test 2: Shorts URL
global.window = { location: { search: '', href: 'https://www.youtube.com/shorts/dQw4w9WgXcQ' } };
assert(getVideoID() === 'dQw4w9WgXcQ', "Shorts URL");

// Test 3: Mobile Shorts URL
global.window = { location: { search: '', href: 'https://m.youtube.com/shorts/dQw4w9WgXcQ' } };
assert(getVideoID() === 'dQw4w9WgXcQ', "Mobile Shorts URL");

// Test 4: Invalid URL
global.window = { location: { search: '', href: 'https://google.com' } };
assert(getVideoID() === null, "Invalid URL");


console.log("\n--- Testing formatTime (Updated) ---");
assert(formatTime(0) === '00:00', "0 seconds -> 00:00");
assert(formatTime(65) === '01:05', "65 seconds -> 01:05");
assert(formatTime(3600) === '1:00:00', "3600 seconds -> 1:00:00");
assert(formatTime(3665) === '1:01:05', "3665 seconds -> 1:01:05");
assert(formatTime(7530) === '2:05:30', "7530 seconds -> 2:05:30");

if (failures > 0) {
    console.error(`\n${failures} tests failed.`);
    process.exit(1);
} else {
    console.log("\nAll tests passed.");
}
