/**
 * Student Management System - Main UI Script
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Password Visibility Toggle
    const togglePasswordBtns = document.querySelectorAll('.password-toggle-btn');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling || document.getElementById('passwordInput');
            if (input) {
                const isPassword = input.getAttribute('type') === 'password';
                input.setAttribute('type', isPassword ? 'text' : 'password');
                btn.innerHTML = isPassword 
                    ? `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
                    : `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        });
    });

    // 2. Mobile Sidebar Toggle
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');
    const backdrop = document.querySelector('.sidebar-backdrop');

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (backdrop) {
                backdrop.classList.toggle('show');
            }
        });
    }

    if (backdrop && sidebar) {
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('show');
        });
    }

    // 3. Profile Dropdown Menu
    const profileBtn = document.querySelector('.user-profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown-menu');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // 4. Dismissible Alerts
    const alertCloseBtns = document.querySelectorAll('.alert-close-btn');
    alertCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const alert = btn.closest('.alert');
            if (alert) {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 200);
            }
        });
    });
});
