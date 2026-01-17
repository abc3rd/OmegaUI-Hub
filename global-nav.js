(function() {
    const initNav = () => {
        const navHTML = `
            <div style="background:#ea00ea; color:white; padding:10px; display:flex; justify-content:space-between; align-items:center; font-family:sans-serif;">
                <div style="font-weight:bold;">OMEGA UI HUB</div>
                <div>
                    <a href="/dashboard.html" style="color:white; margin-left:15px; text-decoration:none;">DASHBOARD</a>
                    <a href="/" style="color:white; margin-left:15px; text-decoration:none;">HOME</a>
                </div>
            </div>`;
        
        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', navHTML);
        } else {
            // Fallback if body isn't ready
            document.documentElement.innerHTML = navHTML + document.documentElement.innerHTML;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNav);
    } else {
        initNav();
    }
})();