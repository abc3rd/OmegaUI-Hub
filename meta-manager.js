/**
 * OMEGA UI // DYNAMIC META MANAGER 2026
 * Automates SEO & Social Preview (OG Tags) for SynCloud Connect
 */

const metaData = {
    "index.html": {
        title: "SynCloud Connect | UCP Standard & AI Infrastructure",
        desc: "The all-in-one hub for deterministic AI. Detokenize your enterprise with the Universal Command Protocol.",
        image: "https://syncloudconnect.com/assets/og-home.png"
    },
    "our-technology.html": {
        title: "UCP Architecture | Zero-Waste AI Whitepaper",
        desc: "Deep dive into the 4-Layer UCP Stack. Interpreting intent once to execute infinitely with 99% energy reduction.",
        image: "https://syncloudconnect.com/assets/og-tech.png"
    },
    "ai-roi-cost-recovery.html": {
        title: "AI ROI Calculator | Reclaim your Drift Tax",
        desc: "Calculate your enterprise AI waste. Stop paying for redundant probabilistic inference.",
        image: "https://syncloudconnect.com/assets/og-roi.png"
    },
    "secure-ai-infrastructure.html": {
        title: "Secure AI Infrastructure | Layer 3 HMAC Handshake",
        desc: "Verify intent before execution. Cryptographic security for enterprise-grade AI agents.",
        image: "https://syncloudconnect.com/assets/og-security.png"
    },
    "zero-waste-ai-sustainability.html": {
        title: "Green AI & ESG Compliance | Zero-Waste Protocol",
        desc: "Achieve 2026 ESG mandates by reducing GPU thermal load via UCP semantic caching.",
        image: "https://syncloudconnect.com/assets/og-sustainability.png"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const filename = window.location.pathname.split('/').pop() || "index.html";
    const data = metaData[filename] || metaData["index.html"];

    // Update Title
    document.title = data.title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", data.desc);

    // Update OpenGraph (Social Media)
    const ogTags = [
        { property: "og:title", content: data.title },
        { property: "og:description", content: data.desc },
        { property: "og:image", content: data.image },
        { name: "twitter:title", content: data.title },
        { name: "twitter:description", content: data.desc }
    ];

    ogTags.forEach(tag => {
        let el = tag.property 
            ? document.querySelector(`meta[property="${tag.property}"]`)
            : document.querySelector(`meta[name="${tag.name}"]`);
        
        if (el) el.setAttribute("content", tag.content);
    });
});