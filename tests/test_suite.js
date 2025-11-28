
global.URLSearchParams = require('url').URLSearchParams;

// Helper to load function from content.js
const fs = require('fs');
const contentJs = fs.readFileSync('content.js', 'utf8');

// We need to extract functions. Since content.js is not a module, we have to be a bit hacky.
// We will extract `getVideoID` and `formatTime` for testing.

function getFunction(name) {
    const regex = new RegExp(`function ${name}\\(.*?\\) \\{[\\s\\S]*?\\n\\}`, 'm');
    const match = contentJs.match(regex);
    // Since simple regex might fail with nested braces, let's use the one that worked for getVideoID
    // or just rely on the fact that functions are top-level.

    // Better approach: regex to find start, then count braces.
    const startIdx = contentJs.indexOf(`function ${name}(`);
    if (startIdx === -1) return null;

    let openBraces = 0;
    let endIdx = -1;
    let foundStart = false;

    for (let i = startIdx; i < contentJs.length; i++) {
        if (contentJs[i] === '{') {
            openBraces++;
            foundStart = true;
        } else if (contentJs[i] === '}') {
            openBraces--;
        }

        if (foundStart && openBraces === 0) {
            endIdx = i + 1;
            break;
        }
    }

    if (endIdx !== -1) {
        return contentJs.substring(startIdx, endIdx);
    }
    return null;
}

// Load functions
const getVideoIDSource = getFunction('getVideoID');
const formatTimeSource = getFunction('formatTime');

if (!getVideoIDSource || !formatTimeSource) {
    console.error("Failed to extract functions");
    process.exit(1);
}

// Eval functions in global scope (or create wrapper)
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


console.log("\n--- Testing formatTime ---");
assert(formatTime(0) === '00:00', "0 seconds");
assert(formatTime(65) === '01:05', "65 seconds");
assert(formatTime(3600) === '60:00', "3600 seconds"); // Note: Implementation only handles minutes:seconds based on code review

if (failures > 0) {
    console.error(`\n${failures} tests failed.`);
    process.exit(1);
} else {
    console.log("\nAll tests passed.");
}
