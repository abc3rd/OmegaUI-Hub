import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // New apps data from PDF
    const appsData = [
      { name: "Cloud QR", category: "QR Management", description: "QR Management & Referrals", url: "https://cloud-qr.omegaui.com", status: "active" },
      { name: "UCP GPU Efficiency Demo", category: "AI/Demo", description: "Demonstrates how UCP enhances AI inference efficiency on NVIDIA GPUs by leveraging deterministic caching and execution offloading, leading to more useful work per watt and reduced energy consumption.", url: "https://ucp-gpu-efficiency-demo.omegaui.com", status: "active" },
      { name: "FACE-2-FACE", category: "Social", description: "Revolutionary Social/UI Tool", url: "https://face2face.omegaui.com", status: "active" },
      { name: "OMEGA UCP", category: "AI Protocol", description: "Simulate and optimize AI command processing with the Universal Command Protocol. Analyze natural language inputs, compile them into intent packets, and detokenize into deterministic local steps for efficient execution. Compare standard LLM pipelines against OMEGA UCP for token, energy, and latency savings.", url: "https://omega-ucp.omegaui.com", status: "active" },
      { name: "Cloud Stream", category: "Streaming", description: "Your cloud camera control center. This will successfully stream camera across multiple networks simultaneously", url: "https://cloud-stream.omegaui.com", status: "active" },
      { name: "UCP Efficient AI", category: "AI/Landing", description: "A landing page explaining the Universal Compression Protocol (UCP) for making AI more energy-efficient and sustainable.", url: "https://ucp-efficient-ai-informative.omegaui.com", status: "active" },
      { name: "Cloud BizTrack", category: "Business", description: "A comprehensive dashboard for small business owners to effortlessly track revenue expenses and customers", url: "https://cloud-biztrack.omegaui.com", status: "active" },
      { name: "UCP Interpreter Console", category: "AI Tools", description: "An advanced tool for compiling prompts into Universal Command Protocol (UCP) packets, routing them to AI providers, and analyzing performance with detailed token ledgers and scoring.", url: "https://ucp-interpreter-console.omegaui.com/", status: "active" },
      { name: "Unified App Hub", category: "Hub", description: "A central command center for all of SynCloud Connect and Omega UI's applications and tools including the UCP and other patented projects", url: "https://cloud-hub.omegaui.com/", status: "active" },
      { name: "SynCloud Collection", category: "Showcase", description: "Collection of various apps and features built to showcase possibilities", url: "https://syncloud-collection.omegaui.com", status: "active" },
      { name: "iWitness", category: "Legal/Documentation", description: "Accident Documentation & Evidence affiliate app for ucrash attorney advertisement directory", url: "https://iwitness.omegaui.com", status: "active" },
      { name: "UCP Command Studio", category: "AI Protocol", description: "SYSTEM AND METHOD FOR ENERGY-OPTIMIZED ARTIFICIAL INTELLIGENCE COMMAND PROCESSING THROUGH STANDARDIZED INTERMEDIATE PACKET FORMAT WITH BIDIRECTIONAL STATE VERIFICATION AND MODULAR DRIVER ARCHITECTURE", url: "https://ucp-command-studio.omegaui.com", status: "active" },
      { name: "UCP Runner", category: "AI Tools", description: "A deterministic command-pack runner for Universal Command Protocol (UCP) by Omega UI, LLC. Import, preview, execute, and share UCP packets securely.", url: "https://ucp-runner.omegaui.com", status: "active" },
      { name: "Cloud InfiniGraph", category: "Design", description: "Create stunning infographics with ease using our intuitive design tool, complete with customizable templates and a vast icon library.", url: "https://cloud-infinigraph.omegaui.com/", status: "active" },
      { name: "DevKit Suite", category: "Development", description: "Your all-in-one workbench for modern web development.", url: "https://cloudcode.omegaui.com/", status: "active" },
      { name: "Cloud Resource Connect", category: "Resources", description: "Resource Mapping and Sharing", url: "https://cloud-resource-connection.omegaui.com", status: "active" },
      { name: "U Crash Claims", category: "Legal", description: "Personal Injury Attorney Connection", url: "https://ucrash.claims", status: "active" },
      { name: "Omega Helpdesk", category: "Support", description: "Comprehensive Support System", url: "https://support.glytch.cloud", status: "active" },
      { name: "UCP AI Router", category: "AI Tools", description: "Route your questions to the best AI model with UCP. A smart router for all your AI needs.", url: "https://ucp-ai-router.omegaui.com/", status: "active" },
      { name: "Cloud Mailer", category: "Marketing", description: "Target Campaign Management for emailing in bulk", url: "https://cloud-mailer.omegaui.com", status: "active" },
      { name: "Cloud Legacy Echo", category: "Communication", description: "Legacy Communication Management", url: "https://cloud-legacy-echo.omegaui.com", status: "active" },
      { name: "Cloud StockTrack Pro", category: "Inventory", description: "Inventory & Security Verification", url: "https://cloud-stocktrackpro.omegaui.com/", status: "active" },
      { name: "Cloud Timeline", category: "Planning", description: "Hierarchical Timeline Generation with map integration for events marking", url: "https://cloud-timeline.omegaui.com", status: "active" },
      { name: "Cloud Gourmet", category: "Events", description: "Event & Dining Planning", url: "https://cloud-gourmet.omegaui.com", status: "active" },
      { name: "SynergyScore AI", category: "AI Analytics", description: "Powerful AI Performance Scoring", url: "https://cloud-toolkit.omegaui.com", status: "active" },
      { name: "EcoTrack", category: "Sustainability", description: "Carbon Calculator & Guide", url: "https://cloud-ecotrack.omegaui.com", status: "active" },
      { name: "Synergy Toolkit", category: "Support", description: "App Support & Diagnostics", url: "https://cloud-toolkit.omegaui.com", status: "active" },
      { name: "CronMate", category: "Developer Tools", description: "Cron Schedule Builder (Multi-lang)", url: "https://cloud-cronmate.omegaui.com/", status: "active" },
      { name: "Cloud Synth", category: "Development", description: "Cloud Synth is an advanced code diffing and conversion tool for developers. It provides side-by-side code comparison with intelligent line-by-line diff highlighting", url: "https://cloud-synth.omegaui.com", status: "active" },
      { name: "CreatorFlow", category: "Creative", description: "Digital Asset Workflow", url: "#", status: "coming_soon" },
      { name: "Cloud 64Craft", category: "Utilities", description: "Effortlessly encode and decode text and files into Base64 format with a beautiful, tactile neumorphic interface. Features include large text support, file conversion, and one-click operations for seamless workflow.", url: "https://cloud-craft.omegaui.com", status: "active" },
      { name: "Cloud Connect aiOS", category: "Operating System", description: "Atlantis Operating System Engine", url: "https://app.glytch.cloud/", status: "active" },
      { name: "GLYTCH UI", category: "AI Assistant", description: "Intelligent Butler (SynCloud)", url: "https://glytch-ui.omegaui.com", status: "active" },
      { name: "Murphy Law", category: "Legal AI", description: "Personal AI Assistant and lawyer-client portal butler", url: "https://murphy-law.omegaui.com", status: "active" },
      { name: "Cloud Crypto", category: "Finance", description: "Crypto & Forex Assistant", url: "https://cloud-crypto.omegaui.com/", status: "active" },
      { name: "Cloud Spend", category: "Finance", description: "Expense Management (Champions)", url: "https://cloud-spend.omegaui.com", status: "active" },
      { name: "Legendary Leads", category: "CRM", description: "Lead Management Commander", url: "https://legendaryleads.omegaui.com", status: "active" },
      { name: "Cloud Legal Case Pro", category: "Legal", description: "Task & Law Empowerment, patent and attorney advisory application. portal for law advice and support", url: "https://cloud-legalcase-pro.omegaui.com/", status: "active" },
      { name: "Cloud Chess", category: "Games", description: "Strategy and Game Logic and checkers", url: "https://cloud-chess.omegaui.com", status: "active" },
      { name: "Aura Energy", category: "Analytics", description: "UCP & Energy Consumption Analysis", url: "https://cloud-counter.omegaui.com", status: "active" },
      { name: "Cloud Central", category: "Hub", description: "All base 44 apps in the landing page", url: "https://cloud-central.omegaui.com", status: "active" },
      { name: "UCP Granite Demo", category: "AI Demo", description: "Demonstration utilizing Granite AI", url: "https://ucp-granite-demo.omegaui.com", status: "active" },
      { name: "Synergy Toolkit", category: "IT Tools", description: "All-in-one IT toolkit designed for seamless remote AI support, robust network diagnostics, and efficient API integration management.", url: "https://cloud-synergy.omegaui.com", status: "active" },
      { name: "Cloud Ranking", category: "SEO", description: "Real-time SEO Data & AI-Powered Competition Analysis", url: "https://cloud-ranking.omegaui.com/", status: "active" },
      { name: "Cloud GHL Manager", category: "Integration", description: "Your central hub for managing GoHighLevel snapshots and plug-ins", url: "https://cloud-ghl-manager.omegaui.com/", status: "active" },
      { name: "Cloud Social Hub", category: "Social Media", description: "Your all-in-one social media dashboard to manage and grow your online presence.", url: "https://cloud-social-hub.omegaui.com", status: "active" },
      { name: "Cloud DataFlow", category: "Data", description: "Empower your team to effortlessly manage, query, and visualize data.", url: "https://cloud-dataflow.omegaui.com", status: "active" },
      { name: "Cloud Forms", category: "Forms", description: "Cloud Forms is a clean, neomorphism-styled form builder that allows users to create, share, and collect data through customized forms without distractions.", url: "https://cloud-forms.omegaui.com/", status: "active" },
      { name: "Glytch UCP GPT", category: "AI Assistant", description: "Glytch is your personal AI assistant, engineered to be an intuitive and powerful companion across all your devices.", url: "https://glytch-ucp-gpt.omegaui.com/", status: "active" },
      { name: "SynCloud aiOS", category: "Marketing AI", description: "SynCloud aiOS is your AI-powered, omni-channel marketing command center.", url: "https://syncloud-aios.omegaui.com/", status: "active" },
      { name: "SynCloud ARC", category: "Security", description: "Securely sync, verify, and protect your digital life across all clouds.", url: "https://syncloud-arc.omegaui.com/", status: "active" },
      { name: "Cloud Task", category: "Project Management", description: "Cloud Task is a sleek and powerful task management system for marketing teams", url: "https://cloud-task.omegaui.com", status: "active" },
      { name: "Cloud Champions", category: "Gaming", description: "Explore the vibrant world of League of Legends champions", url: "https://cloud-champions.omegaui.com", status: "active" },
      { name: "Cloud UCP Protocol", category: "AI Protocol", description: "Optimize your AI prompts. ABCP Pro translates natural language into efficient UCP commands", url: "https://cloud-ucp-protocol.omegaui.com", status: "active" },
      { name: "Cloud Claims Collector", category: "Legal", description: "A platform for accident victims to find and connect with experienced legal professionals for free case reviews.", url: "https://cloud-claims-collector.omegaui.com", status: "active" },
      { name: "UCP Reel Builder", category: "Social Media", description: "Energy-Efficient AI Protocol • Social Media Reel Preview", url: "https://ucp-reel-builder.omegaui.com/", status: "active" },
      { name: "Cloud Wednesday", category: "Task Management", description: "A visually stunning and intuitive task management system to organize your projects and boost productivity.", url: "https://cloud-wednesday.omegaui.com/", status: "active" },
      { name: "Cloud Counter", category: "Energy", description: "Cloud counter elegantly tracks and analyzes your home's energy consumption, providing personalized insights and actionable tips to reduce usage and save money. Experience a seamless, visually stunning interface that empowers you to manage your energy efficiently.", url: "https://cloud-counter.omegaui.com", status: "active" },
      { name: "iWitness Incident Reporting", category: "Legal/Safety", description: "Fast, secure incident reporting with GPS tracking, photo evidence, and instant documentation.", url: "https://iwitness.omegaui.com/", status: "active" },
      { name: "Cloud Community Resource Hub", category: "Community", description: "Empowering unhoused individuals with a simple, secure way to receive direct peer-to-peer donations. The usage tracking and sheet and heat maps show where the donations are happening.", url: "https://cloud-qr.omegaui.com", status: "active" },
      { name: "Face 2 Face", category: "Social Network", description: "OMEGA UI AND FACE 2 FACE are a revolutionary social network that prioritizes genuine, in-person connections. Build trust through verified identity and a digital handshake. Share moments with your trusted Circle and leave a lasting digital legacy.", url: "https://face2face.omegaui.com/", status: "active" }
    ];

    // Delete all existing apps
    const existingApps = await base44.asServiceRole.entities.apps.list();
    for (const app of existingApps) {
      await base44.asServiceRole.entities.apps.delete(app.id);
    }

    // Insert new apps
    for (const app of appsData) {
      await base44.asServiceRole.entities.apps.create(app);
    }

    return Response.json({ 
      success: true, 
      message: `Refreshed ${appsData.length} apps`,
      count: appsData.length 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});