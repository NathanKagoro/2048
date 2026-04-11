// Loads ionicons scripts if not already present
function ensureIoniconsLoaded() {
    if (document.querySelector('script[src*="ionicons"]')) {
        return;
    }
    const iconScript = document.createElement('script');
    iconScript.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js';
    iconScript.setAttribute('nomodule', '');
    document.head.appendChild(iconScript);
    
    const esmScript = document.createElement('script');
    esmScript.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js';
    esmScript.type = 'module';
    document.head.appendChild(esmScript);
}

// Returns color for tile value in 2048 game
function getTileColor(tileValue) {
    switch (tileValue) {
        case 2: return '#eee4da';
        case 4: return '#ede0c8';
        case 8: return '#f2b179';
        case 16: return '#f59563';
        case 32: return '#f67c5f';
        case 64: return '#f65e3b';
        case 128: return '#edcf72';
        case 256: return '#edcc61';
        case 512: return '#edc850';
        case 1024: return '#edc53f';
        case 2048: return '#edc22e';
        default: return tileValue >= 4096 ? '#3c3a32' : '#f9f6f2'; // darker for higher, white for unknown
    }
}

let sharedSidebarOpen = false;

function sidebar_check() {
    sharedSidebarOpen = !sharedSidebarOpen;
    toggleSidebar();
}

// Toggles the sidebar visibility
function toggleSidebar() {
    const sidebar = document.querySelector('.shared-sidebar');
    if (!sidebar) {
        return;
    }
    sidebar.classList.toggle('open');
}

// Handles shared action clicks like navigating to game
function executeSharedAction(actionName) {
    if (actionName === 'gamePlay') {
        window.location.href = '../game/2048 game.html';
    }
}

// Renders the shared header with navigation and user info
function renderSharedHeader(options = {}) {
    const container = document.getElementById('shared-header');
    if (!container) {
        return;
    }

    const backLink = options.backLink || '../entry/2048 entry.html';
    const username = options.username || sessionStorage.loggedInUser || 'Guest';
    const actionButton = options.actionButton || null;
    const homeButton = options.homeButton || null;
    const showUserBanner = options.showUserBanner !== false;
    const showSettings = Boolean(options.showSettings);

    container.innerHTML = `
        <div class="shared-header-top">
            ${showUserBanner ? `<div id="username_header"><p id="username_text">${username}</p></div>` : ''}
            <div class="text-center header-center">
                <a href="${backLink}"><button id="heading">2048</button></a>
            </div>
            <div class="header-actions">
                ${actionButton ? (actionButton.actionName ? `<button type="button" class="button header-button" id="${actionButton.id || 'action-button'}" onclick="executeSharedAction('${actionButton.actionName}')">
                    <ion-icon name="${actionButton.icon}" item-right></ion-icon>
                    <p class="button-text"> ${actionButton.text} </p>
                </button>` : `<a href="${actionButton.link}"><button type="button" class="button header-button" id="${actionButton.id || 'action-button'}">
                    <ion-icon name="${actionButton.icon}" item-right></ion-icon>
                    <p class="button-text"> ${actionButton.text} </p>
                </button></a>`) : ''}
                ${homeButton ? `<a href="${homeButton.link}"><button type="button" class="button header-button" id="${homeButton.id || 'home-button'}">
                    <ion-icon name="${homeButton.icon || 'home'}" item-right></ion-icon>
                    <p class="button-text"> ${homeButton.text || 'Home'} </p>
                </button></a>` : ''}
                ${showSettings ? `<button type="button" class="button header-button" id="settings" onclick="sidebar_check()">
                    <ion-icon name="cog" float-right></ion-icon>
                    <p class="button-text"> Settings </p>
                </button>
                <div class="sidebar shared-sidebar closed">
                    <ul class="nav nav-pills flex-column mb-auto">
                        <li class="nav-item">
                            <a href="${options.accountLink || '../login/2048 login.html'}" class="nav-link text-black" aria-current="page">
                                Change accounts
                            </a>
                        </li>
                        <li>
                            <a href="${options.difficultyLink || '../difficulty/2048 difficulty.html'}" class="nav-link text-black">
                                Game difficulty
                            </a>
                        </li>
                    </ul>
                </div>` : ''}
            </div>
        </div>
    `;

    // Apply dynamic username styling
    const usernameElement = document.getElementById('username_text');
    if (usernameElement) {
        usernameElement.style.fontSize = '1.5em';
        usernameElement.style.fontWeight = 'bold';
    }
}

// Renders the shared footer with social links
function renderSharedFooter() {
    const container = document.getElementById('shared-footer');
    if (!container) {
        return;
    }

    container.innerHTML = `
        <footer>
            <p class="footer-text"> Website developed by Nathan Kagoro. Find me on:
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"><button class="email-btn"><ion-icon name="logo-youtube" size="small"></ion-icon></button></a> &nbsp;
                <a href="https://www.linkedin.com/in/nathan-kagoro/"><button class="linkedin-btn"><ion-icon name="logo-linkedin" size="small"></ion-icon></button></a>
            </p>
        </footer>
    `;
}

function initSharedLayout(options = {}) {
    ensureIoniconsLoaded();
    renderSharedHeader(options);
    renderSharedFooter();
}

window.initSharedLayout = initSharedLayout;

document.addEventListener('DOMContentLoaded', function () {
    if (window.sharedLayoutOptions) {
        initSharedLayout(window.sharedLayoutOptions);
    }
});
