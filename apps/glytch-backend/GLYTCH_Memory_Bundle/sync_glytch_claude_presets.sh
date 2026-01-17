#!/bin/bash

# === GLYTCH Claude Memory Sync Utility ===
# Syncs Claude presets + memory bundle into AnythingLLM, Open WebUI, and LM Studio

# 🛠️ CONFIGURABLE PATHS
MEMORY_BUNDLE_DIR="./GLYTCH_Memory_Bundle"
ANYTHINGLLM_DIR="$HOME/.anythingllm/presets"
OPENWEBUI_DIR="$HOME/open-webui/system-prompts"
LMSTUDIO_DIR="$HOME/LM-Studio/presets"

echo "🔁 Starting GLYTCH memory sync..."

# Create folders if they don't exist
mkdir -p "$ANYTHINGLLM_DIR" "$OPENWEBUI_DIR" "$LMSTUDIO_DIR"

# === Copy Claude Core Presets ===
cp "$MEMORY_BUNDLE_DIR/glytch_claude_anythingllm_preset.json" "$ANYTHINGLLM_DIR/glytch_claude_anythingllm_preset.json"
cp "$MEMORY_BUNDLE_DIR/glytch_claude_webui_prompt.md" "$OPENWEBUI_DIR/glytch_claude_webui_prompt.md"
cp "$MEMORY_BUNDLE_DIR/glytch_claude_lmstudio.txt" "$LMSTUDIO_DIR/glytch_claude_lmstudio.txt"

# === Copy Full Memory Bundle to All Platforms ===
for file in "$MEMORY_BUNDLE_DIR"/*.{md,json,txt}; do
  cp -v "$file" "$ANYTHINGLLM_DIR/"
  cp -v "$file" "$OPENWEBUI_DIR/"
  cp -v "$file" "$LMSTUDIO_DIR/"
done

echo ""
echo "✅ GLYTCH memory presets synced to:"
echo "• AnythingLLM → $ANYTHINGLLM_DIR"
echo "• Open WebUI  → $OPENWEBUI_DIR"
echo "• LM Studio   → $LMSTUDIO_DIR"
