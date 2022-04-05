const modal = document.getElementById('modal');
const modalShow = document.getElementById('show-modal');
const modalClose = document.getElementById('close-modal');
const bookmarkForm = document.getElementById('bookmark-form');
const websiteNameEl = document.getElementById('website-name');
const websiteUrlEl = document.getElementById('website-url');
const bookmarksContainer = document.getElementById('bookmarks-container');

let bookmarks = {};

// Show Modal, Focus on Input
function showModal() {
    modal.classList.add('show-modal');
    websiteNameEl.focus();
}

// Modal Event Listeners
modalShow.addEventListener('click', showModal);
modalClose.addEventListener('click', () => modal.classList.remove('show-modal'));
window.addEventListener('mousedown', (e) => e.target === modal ? modal.classList.remove('show-modal') : false);

// Validate Form
function validate(nameValue, urlValue) {
    const expression = /(https)?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
	const regex = new RegExp(expression);
	if (!nameValue || !urlValue) {
		alert('Please submit values for both fields.');
		return false;
	}
	if (!urlValue.match(regex)) {
		alert('Please provide a valid web address.');
		return false;
	}
    // Valid
    return true;
}

// Add Bookmark
function addBookmark(id) {
    const { name, url, previewImg } = bookmarks[id];
    // Item
    const item = document.createElement('div');
    item.classList.add('item');
    //Close Icon
    const closeIcon = document.createElement('i');
    closeIcon.classList.add('fas', 'fa-trash');
    closeIcon.setAttribute('title', 'Delete Bookmark');
    closeIcon.setAttribute('onclick', `deleteBookmark('${url}')`);
    //Preview
    const previewLink = document.createElement('a');
    if(!previewImg.match('images/loading.svg')) {
        previewLink.setAttribute('href', `${url}`);
        previewLink.setAttribute('target', '_blank');
    }
    previewLink.classList.add('preview-link');
    const preview = document.createElement('img');
    preview.setAttribute('src', previewImg);
    preview.classList.add('preview');
    // Favicon / Link Container
    const linkInfo = document.createElement('div');
    linkInfo.classList.add('name');
    const favicon = document.createElement('img');
    favicon.setAttribute('src', `https://www.google.com/s2/u/0/favicons?domain=${url}`);
    favicon.setAttribute('alt', 'favicon');
    // Link
    const link = document.createElement('a');
    link.setAttribute('href', `${url}`);
    link.setAttribute('target', '_blank');
    link.textContent = name;
    // Append to bookmarks container
    previewLink.appendChild(preview)
    linkInfo.append(favicon, link);
    item.append(closeIcon, previewLink, linkInfo);
    bookmarksContainer.appendChild(item);
    console.log('one')
}

// Build Bookmarks DOM 
function buildBookmarks() {
    // Remove all bookmark elements 
    bookmarksContainer.textContent = '';
    //Build items
    Object.keys(bookmarks).forEach((id) => {
        addBookmark(id);
    })
    console.log('keys')
}

// Fetch Bookmarks
function fetchBookmarks() {
    //Get bookmarks from localStorage if available
    if (localStorage.getItem('bookmarks')) {
        bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    } else {
        // Create bookmarks in localStorage
        const bookmarkId = 'https://google.com';        
        bookmarks[bookmarkId] = {
            name: 'Google',
            url: 'https://google.com',
            previewImg: 'images/googlePreview.webp'
        };
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
    buildBookmarks();
}

// Delete Bookmark
function deleteBookmark(url) {
    if(bookmarks[url]) delete bookmarks[url];
    // Update bookmarks array in localStorage, re-populate DOM
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    fetchBookmarks();
}

//Get Preview Image from API
function getPreview(urlValue) {
    const loadingElements = document.querySelectorAll('[src="images/loading.svg"]');
    const lastElement = loadingElements[loadingElements.length-1];
    fetch(`https://api.apiflash.com/v1/urltoimage?access_key=97668afac9674153a931f8ab879a5eaa&url=${urlValue}&format=webp&quality=20&response_type=json`)
        .then(res => res.json())
        .then(img => {
            // Update Preview Image Link in bookmarks Object
            bookmarks[urlValue].previewImg = img.url || 'images/loading.svg';
            // Update Preview Image Link in localStorage
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            // Update 'img' Element Source, add link to the 'a' parent element and Update DOM
            if(!bookmarks[urlValue].previewImg.match('images/loading.svg')) {
                lastElement.setAttribute('src', bookmarks[urlValue].previewImg);
                lastElement.parentElement.setAttribute('href', `${urlValue}`);
                lastElement.parentElement.setAttribute('target', '_blank');
            }
        });
}

//Handle Data from Form
function storeBookmark(e) {
    e.preventDefault();
    const nameValue = websiteNameEl.value;
    let urlValue = websiteUrlEl.value;    
    if(!urlValue.includes('https://') && !urlValue.includes('http://')) {
        urlValue = `https://${urlValue}`;
    }
    if(!validate(nameValue, urlValue)){
        return false;
    };
    const bookmark = {
        name: nameValue,
        url: urlValue,
        previewImg: 'images/loading.svg'
    };
    bookmarks[urlValue] = bookmark;
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    addBookmark(urlValue);
    getPreview(urlValue);
    bookmarkForm.reset();
    websiteNameEl.focus();
}

// Event Listener
bookmarkForm.addEventListener('submit', storeBookmark);

// On Load
fetchBookmarks();