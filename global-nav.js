// Omega UI Global Navigation Injector
(function() {
    const navHTML = `
    <nav style="background: #1a1a1a; border-bottom: 2px solid #ea00ea; padding: 1rem; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; position: sticky; top: 0; z-index: 9999;">
        <div style="display: flex; align-items: center; gap: 20px;">
            <a href="/" style="color: #ea00ea; font-weight: 900; text-decoration: none; font-size: 1.2rem;">OMEGA UI</a>
            <a href="/dashboard.html" style="color: #2699fe; text-decoration: none; font-size: 0.9rem; font-weight: bold;">COMMAND CENTER</a>
        </div>
        <div style="display: flex; gap: 15px;">
            <a href="/apps/UCP-Engine/index.html" style="color: #fff; text-decoration: none; font-size: 0.8rem;">UCP</a>
            <a href="/apps/glytch-aios/index.html" style="color: #fff; text-decoration: none; font-size: 0.8rem;">GLYTCH</a>
            <a href="tel:+12392476030" style="color: #4bce2a; text-decoration: none; font-size: 0.8rem;">SUPPORT</a>
        </div>
    </nav>
    `;

    // Inject at the very top of the body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
})();