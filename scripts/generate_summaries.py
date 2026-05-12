#!/usr/bin/env python3
"""Generate HTML marginalia (clarifying comments + animated diagrams) for DeepSeek V4 paper sections."""

import argparse
import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import fitz
from dotenv import load_dotenv
from zai import ZaiClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = PROJECT_ROOT / "projects" / "deepseek_v4_paper" / "deepseek_v4.pdf"
SECTIONS_DIR = PROJECT_ROOT / "projects" / "deepseek_v4_paper" / "sections"
METADATA_PATH = SECTIONS_DIR / "metadata.json"

SYSTEM_PROMPT = """You are a research paper reading companion. You produce an **alternative \
reading angle** for each section — a companion view that helps the reader understand the content \
from a different perspective while keeping their eyes on the paper.

## Core principle

The reader has the paper open. Do not paraphrase it. Instead, provide a complementary layer: \
context, justification, and visual models that reframe the content for clarity.

## Output format

**Valid HTML fragment** (no <html>/<body>), ready to inject into an existing page with a very \
dark background (#0f0f14). All colors must be readable against this dark canvas.

Each section output must contain these three components:

### 1. Short commentary (mandatory, 3-6 sentences)

Three-part structure:
- **Context**: Where does this section sit in the bigger picture? What problem or question \
motivates it? (1-2 sentences)
- **Content angle**: What is the section doing, explained from a different angle than the paper — \
use analogies, real-world mappings, or a "why it matters" framing. (2-3 sentences)
- **Justification**: Why did the authors make these specific choices? What trade-off are they \
navigating, or what constraint are they solving for? (1-2 sentences)

### 2. Diagrams (when the section describes a concrete system)

Produce **inline SVG diagrams** for: architectures, data flows, pipelines, algorithms, attention \
mechanisms, network topologies, training stages, system designs, or any spatial/temporal process.

**Color palette (dark-background compatible):**
Use these semantic colors for component types:

| Type | Fill | Stroke | Use for |
|------|------|--------|---------|
| Input/Frontend | rgba(8, 51, 68, 0.4) | #22d3ee (cyan) | Data sources, user input, embeddings |
| Core/Backend | rgba(6, 78, 59, 0.4) | #34d399 (emerald) | Main processing, model layers, attention |
| Storage/ML | rgba(76, 29, 149, 0.4) | #a78bfa (violet) | Memory, parameters, learned representations |
| Infrastructure | rgba(120, 53, 15, 0.3) | #fbbf24 (amber) | Hardware, clusters, communication |
| Loss/Safety | rgba(136, 19, 55, 0.4) | #fb7185 (rose) | Constraints, penalties, safety mechanisms |
| Pipeline/Flow | rgba(251, 146, 60, 0.3) | #fb923c (orange) | Data pipelines, training stages |
| Generic | rgba(30, 41, 59, 0.5) | #94a3b8 (slate) | External systems, generic components |

**Text colors:** white (#fff) for labels, #94a3b8 for sub-labels.
**Background:** transparent (the page already provides the dark background).
**Component boxes:** rounded rectangles (rx="6"), 1.5px stroke, semi-transparent fills from the \
palette above. Use a solid dark background rect (fill="#0f172a") underneath if you need to mask \
arrows behind a transparent component.
**Arrows:** use SVG markers. Arrow lines in #64748b by default, or match the source/target \
component stroke color for clarity.
**Font sizes:** 11-12px for component names, 9px for sublabels, 8px for annotations.

**Animation rules:**
- **Static by default.** Most diagrams are clearer as static images.
- Only animate when the animation genuinely reveals structure:
  - A sequential pipeline where the order of operations IS the key insight
  - Parallel vs serial paths where timing clarifies the design
  - A data flow where watching the path through components teaches more than a static view
- When animating: use CSS keyframes only (no JavaScript). Subtle opacity or color transitions \
(never flashing, blinking, or pulsing). Use CSS class "anim-flow" on the container. 3-5 steps max.
- Use CSS class "diagram" on the SVG wrapper div.

### 3. Tables (when comparing methods, models, or results)

Produce a clean HTML comparison table. The page already provides table CSS with dark backgrounds \
(thead cells: #1e1e28 background, #8888a0 text; tbody: transparent with subtle borders on dark bg).

**Requirements:**
- Only include metrics that actually differentiate the approaches
- Highlight the best result with a subtle dark-compatible tint: use \
`style="background: rgba(52, 211, 153, 0.15); color: #34d399;"` on the best cell — NOT bright \
green backgrounds with white text
- Keep columns minimal — this is a quick reference, not a reproduction of the paper's tables
- Use <strong> for the best value within a cell

## What NOT to do

- Do NOT paraphrase or rewrite the paper's prose
- Do NOT produce output that makes sense as a standalone summary
- Do NOT add flashing, blinking, or pulsing animations — ever
- Do NOT use light-colored or pastel backgrounds (the page is very dark)
- Do NOT force a diagram when the section is purely theoretical or abstract

## HTML style

- <h3>, <h4> for labels
- <strong> for terms worth remembering
- <code> for short formulas or variable names
- <blockquote> for direct paper quotes worth highlighting
- <details><summary> for optional deeper context (collapsible)

## Language

Write in the **same language as the source text**. If the paper is in English, write in English. \
If in French, write in French.

## Length

The commentary text should be 150-350 words. Diagrams and tables are additional — let the \
visuals carry weight where appropriate."""

SECTION_DEFS = [
    {
        "id": "sec-abstract",
        "title": "Abstract",
        "slug": "00-abstract",
        "start_page": 1,
        "end_page": 3,
    },
    {
        "id": "sec-intro",
        "title": "Introduction",
        "slug": "01-introduction",
        "start_page": 4,
        "end_page": 5,
    },
    {
        "id": "sec-arch",
        "title": "Architecture (MoE, mHC, designs herites de V3)",
        "slug": "02-architecture",
        "start_page": 6,
        "end_page": 8,
    },
    {
        "id": "sec-attention",
        "title": "Attention hybride (CSA & HCA)",
        "slug": "03-hybrid-attention",
        "start_page": 9,
        "end_page": 13,
    },
    {
        "id": "sec-muon",
        "title": "Muon Optimizer",
        "slug": "04-muon-optimizer",
        "start_page": 14,
        "end_page": 14,
    },
    {
        "id": "sec-infra",
        "title": "Infrastructures d'entrainement (EP, TileLang, FP8, KV Cache)",
        "slug": "05-infrastructures",
        "start_page": 15,
        "end_page": 23,
    },
    {
        "id": "sec-pretrain",
        "title": "Pre-entrainement (donnees, setups, resultats base)",
        "slug": "06-pre-training",
        "start_page": 24,
        "end_page": 27,
    },
    {
        "id": "sec-post",
        "title": "Post-entrainement (SFT, RL, distillation, QAT)",
        "slug": "07-post-training",
        "start_page": 28,
        "end_page": 35,
    },
    {
        "id": "sec-eval",
        "title": "Evaluations & taches reelles",
        "slug": "08-evaluation",
        "start_page": 36,
        "end_page": 44,
    },
    {
        "id": "sec-conclusion",
        "title": "Conclusion, limites & perspectives",
        "slug": "09-conclusion",
        "start_page": 45,
        "end_page": 45,
    },
]


def extract_section_text(pdf_path: Path, start_page: int, end_page: int) -> str:
    doc = fitz.open(str(pdf_path))
    pages = []
    for page_num in range(start_page - 1, min(end_page, len(doc))):
        page = doc[page_num]
        pages.append(page.get_text())
    doc.close()
    return "\n\n".join(pages)


def generate_section_html(client: ZaiClient, model: str, temperature: float,
                          section_title: str, section_text: str) -> str:
    user_msg = (
        f"Section: {section_title}\n\n"
        f"Original paper text:\n{section_text}"
    )

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
        temperature=temperature,
        max_tokens=8192,
    )

    content = response.choices[0].message.content
    content = re.sub(r'^```html\s*', '', content)
    content = re.sub(r'\s*```$', '', content)
    return content.strip()


def build_metadata(sections_to_generate):
    return {
        "sections": [
            {
                "id": s["id"],
                "title": s["title"],
                "slug": s["slug"],
                "file": f"{s['slug']}.html",
                "pdf_page_start": s["start_page"],
                "pdf_page_end": s["end_page"],
            }
            for s in sections_to_generate
        ]
    }


def process_section(section, i, total, client, model, temperature):
    title = section["title"]
    slug = section["slug"]
    print(f"[{i + 1}/{total}] Extracting: {title} "
          f"(pages {section['start_page']}-{section['end_page']})...")

    text = extract_section_text(PDF_PATH, section["start_page"], section["end_page"])
    print(f"[{i + 1}/{total}] Extracted {len(text)} chars — generating marginalia with {model}...")

    html_content = generate_section_html(client, model, temperature, title, text)

    output_path = SECTIONS_DIR / f"{slug}.html"
    output_path.write_text(html_content, encoding="utf-8")
    print(f"[{i + 1}/{total}] Saved: {output_path.relative_to(PROJECT_ROOT)}")
    return slug


def main():
    parser = argparse.ArgumentParser(description="Generate FR HTML summaries for DeepSeek V4 paper")
    parser.add_argument(
        "--test-section",
        type=str,
        default=None,
        help="Only generate a specific section by slug (e.g. 02-architecture)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=None,
        help="Number of parallel API calls (default: 80%% of available CPUs)",
    )
    args = parser.parse_args()

    load_dotenv(PROJECT_ROOT / ".env")

    api_key = os.getenv("ZAI_API_KEY")
    base_url = os.getenv("ZAI_BASE_URL", "https://api.z.ai/api/paas/v4/")
    model = os.getenv("ZAI_MODEL", "glm-5.1")
    temperature = float(os.getenv("ZAI_TEMPERATURE", "0.4"))

    if not api_key or api_key == "your_api_key_here":
        print("ERROR: Set ZAI_API_KEY in .env file (see .env.example)")
        sys.exit(1)

    if not PDF_PATH.exists():
        print(f"ERROR: PDF not found at {PDF_PATH}")
        print("Download it from: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/raw/main/DeepSeek_V4.pdf")
        sys.exit(1)

    SECTIONS_DIR.mkdir(parents=True, exist_ok=True)

    sections = SECTION_DEFS
    if args.test_section:
        sections = [s for s in sections if s["slug"] == args.test_section]
        if not sections:
            available = ", ".join(s["slug"] for s in SECTION_DEFS)
            print(f"ERROR: Section '{args.test_section}' not found. Available: {available}")
            sys.exit(1)
        print(f"[TEST MODE] Generating only: {sections[0]['title']}")

    client = ZaiClient(api_key=api_key, base_url=base_url)
    total = len(sections)

    if total == 1:
        process_section(sections[0], 0, 1, client, model, temperature)
    else:
        workers = args.workers if args.workers else max(1, round(os.cpu_count() * 0.8))
        workers = min(workers, total)
        print(f"Generating {total} sections with {workers} parallel workers...\n")
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(process_section, s, i, total, client, model, temperature): s["slug"]
                for i, s in enumerate(sections)
            }
            for future in as_completed(futures):
                slug = futures[future]
                try:
                    future.result()
                except Exception as e:
                    print(f"ERROR processing {slug}: {e}")

    if not args.test_section:
        metadata = build_metadata(SECTION_DEFS)
        METADATA_PATH.write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\nMetadata saved: {METADATA_PATH.relative_to(PROJECT_ROOT)}")

    print("\nDone!")


if __name__ == "__main__":
    main()
