// =================================
// Shared Theme Toggle Logic
// =================================
const themeToggleBtn = document.querySelector('.header__theme-toggle');
const body = document.body;
const themeText = themeToggleBtn?.querySelector('span');
const themeIcon = themeToggleBtn?.querySelector('ion-icon');

// 1. Check saved theme preference on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark');
    if (themeText) themeText.textContent = 'Light Mode';
    if (themeIcon) themeIcon.setAttribute('name', 'sunny');
}

// 2. Handle click event to toggle theme
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark');
        const isDark = body.classList.contains('dark');
        
        if (isDark) {
            localStorage.setItem('theme', 'dark');
            if (themeText) themeText.textContent = 'Light Mode';
            if (themeIcon) themeIcon.setAttribute('name', 'sunny');
        } else {
            localStorage.setItem('theme', 'light');
            if (themeText) themeText.textContent = 'Dark Mode';
            if (themeIcon) themeIcon.setAttribute('name', 'moon-outline');
        }
    });
}