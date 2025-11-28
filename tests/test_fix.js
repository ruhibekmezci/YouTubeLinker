
global.URLSearchParams = require('url').URLSearchParams;

function getVideoID(window) {
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('v');
  if (id) return id;

  const match = window.location.href.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
}

// Test case 1: Standard URL
const window1 = {
  location: {
    search: '?v=dQw4w9WgXcQ',
    href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
};
console.log('Test 1 (Standard):', getVideoID(window1) === 'dQw4w9WgXcQ' ? 'PASS' : 'FAIL');

// Test case 2: Shorts URL
const window2 = {
  location: {
    search: '',
    href: 'https://www.youtube.com/shorts/dQw4w9WgXcQ'
  }
};
console.log('Test 2 (Shorts):', getVideoID(window2) === 'dQw4w9WgXcQ' ? 'PASS' : 'FAIL');

// Test case 3: Shorts URL with extra params
const window3 = {
  location: {
    search: '?feature=share',
    href: 'https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share'
  }
};
console.log('Test 3 (Shorts + Params):', getVideoID(window3) === 'dQw4w9WgXcQ' ? 'PASS' : 'FAIL');

// Test case 4: Invalid URL
const window4 = {
    location: {
        search: '',
        href: 'https://www.youtube.com/'
    }
}
console.log('Test 4 (Invalid):', getVideoID(window4) === null ? 'PASS' : 'FAIL');
