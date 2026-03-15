import { useState } from "react";

const sections = [
  {
    id: "mindset",
    icon: "🧠",
    title: "The AI Dev Mindset",
    color: "#00ff88",
    content: {
      summary: "AI is your senior dev pair. You are the architect. Never ask AI to build everything at once — you'll get spaghetti. You direct, AI executes.",
      rules: [
        { title: "You Are the Architect", desc: "You design the structure. AI fills the rooms. If you don't have a plan, AI gives you a mess." },
        { title: "One Feature = One Prompt", desc: "Never say 'build me a full app'. Say 'create the auth module using JWT with refresh tokens in Express'." },
        { title: "Context is King", desc: "Paste your existing folder structure, your current file, your stack. AI without context = guessing." },
        { title: "Review Every Output", desc: "AI hallucinates libraries, misses edge cases, ignores your existing patterns. Always read the code." },
        { title: "Iterate, Don't Regenerate", desc: "Fix errors by pasting the error + relevant code back. Don't restart from scratch." },
      ]
    }
  },
  {
    id: "frontend",
    icon: "🎨",
    title: "Frontend with AI",
    color: "#61dafb",
    content: {
      summary: "The #1 mistake: asking AI to dump one massive file. Always force structure upfront in your prompt.",
      prompts: [
        {
          label: "React Component Prompt Template",
          code: `You are a senior React developer.
Stack: React 18, TypeScript, Tailwind CSS, shadcn/ui

Task: Build a [COMPONENT NAME] component.

Requirements:
- [list your requirements]

Follow this folder structure:
src/
  components/
    [ComponentName]/
      index.tsx        ← exports
      [ComponentName].tsx  ← main logic
      [ComponentName].types.ts ← TypeScript types
      [ComponentName].utils.ts ← helper functions (if needed)
      [ComponentName].test.tsx ← basic tests

Rules:
- Use named exports
- Props must be fully typed
- No inline styles — Tailwind only
- Handle loading + error states
- Add JSDoc comments on props

Give me ALL files separately with full content.`
        },
        {
          label: "Full Next.js Feature Prompt",
          code: `Stack: Next.js 14 (App Router), TypeScript, Tailwind, Prisma, PostgreSQL

I am adding a [FEATURE] feature to my existing app.

Current folder structure:
[PASTE YOUR TREE HERE]

Task: Create the following:
1. app/[route]/page.tsx — server component
2. app/[route]/loading.tsx — skeleton UI
3. components/[Feature]/[Feature]Card.tsx — client component
4. lib/actions/[feature].actions.ts — server actions
5. lib/validators/[feature].schema.ts — Zod schemas

Rules:
- Use server actions for mutations (no API routes)
- Validate with Zod
- Handle errors gracefully with try/catch
- Keep components under 150 lines
- No business logic in components

Give each file separately with the full path as heading.`
        },
        {
          label: "Debugging Prompt",
          code: `I have a bug in my React app.

Error message:
[PASTE EXACT ERROR]

File: src/components/UserCard/UserCard.tsx
[PASTE THE FULL FILE CONTENT]

Related file: src/hooks/useUser.ts
[PASTE CONTENT]

What is causing this? Show me the exact fix with the corrected file.
Do NOT refactor unrelated parts.`
        }
      ],
      tips: [
        "Always include your existing file structure in the prompt",
        "Specify 'give all files separately' — never let AI merge everything",
        "Say 'do NOT refactor unrelated parts' to prevent AI from touching working code",
        "Use 'under 150 lines per component' as a rule in prompts",
        "Ask for TypeScript types in separate .types.ts files always"
      ]
    }
  },
  {
    id: "backend",
    icon: "⚙️",
    title: "Backend with AI",
    color: "#f7df1e",
    content: {
      summary: "Backend AI prompts must enforce separation of concerns. If AI puts DB logic in routes, your codebase collapses when you change anything.",
      prompts: [
        {
          label: "Express Feature Prompt",
          code: `Stack: Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod

I'm adding a [FEATURE] feature.

Current structure:
src/
  routes/
  controllers/
  services/
  repositories/
  middlewares/
  validators/
  types/

Task: Add [feature] with these endpoints:
- POST /api/[resource]
- GET /api/[resource]/:id
- PUT /api/[resource]/:id
- DELETE /api/[resource]/:id

Create these files:
1. routes/[feature].routes.ts — only route definitions
2. controllers/[feature].controller.ts — req/res handling only
3. services/[feature].service.ts — ALL business logic here
4. repositories/[feature].repository.ts — ALL database queries here
5. validators/[feature].validator.ts — Zod schemas
6. types/[feature].types.ts — TypeScript interfaces

Critical rules:
- Controllers NEVER touch the database
- Services NEVER import from express (req, res)
- Repositories ONLY contain Prisma queries
- Every function must have try/catch
- Return { data, error } pattern from services

Give each file with full path as heading.`
        },
        {
          label: "New Feature Without Breaking Existing",
          code: `I want to add [NEW FEATURE] to my existing backend.

Here is my current service file:
[PASTE services/user.service.ts]

Here is my current Prisma schema:
[PASTE schema.prisma]

Rules:
- Do NOT modify existing functions
- Only ADD new functions
- If schema change is needed, show ONLY the new migration addition
- New code must follow the same pattern as existing code
- Show me what to import/export that changes

Output format:
1. New functions to ADD to service (not the full file)
2. Schema additions only
3. New route to add`
        },
        {
          label: "FastAPI Python Backend",
          code: `Stack: Python, FastAPI, SQLAlchemy, Pydantic, PostgreSQL

Task: Build [FEATURE] API module.

Use this structure:
app/
  api/routes/[feature].py  ← only route decorators
  core/[feature]/
    service.py  ← business logic
    repository.py  ← DB queries only
    schemas.py  ← Pydantic models
    models.py  ← SQLAlchemy models

Rules:
- Dependency injection for DB sessions
- Pydantic for all input/output validation
- Repository pattern — no raw SQL in services
- Async all the way (async/await)
- HTTP exceptions with proper status codes
- Type hints on EVERY function

Give each file separately.`
        }
      ],
      tips: [
        "Always show AI your existing file — it will match your patterns",
        "'Add to existing, don't replace' is a critical instruction",
        "Force repository pattern in every prompt — keeps DB swappable",
        "Ask AI to show only the DIFF / additions, not rewrite whole files",
        "Include your Prisma schema so AI generates correct queries"
      ]
    }
  },
  {
    id: "database",
    icon: "🗄️",
    title: "Database & AI",
    color: "#ff6b6b",
    content: {
      summary: "AI is excellent at SQL, schema design, and query optimization. But you must provide context about your data volume and use case.",
      prompts: [
        {
          label: "Schema Design Prompt",
          code: `I'm building [APP TYPE] with these requirements:
[LIST FEATURES]

Design a PostgreSQL schema for this.

Rules:
- Use UUID primary keys
- Add created_at, updated_at on all tables
- Include proper foreign keys with ON DELETE behavior
- Add indexes for fields used in WHERE/JOIN
- Show constraints (unique, not null, check)

Output:
1. Prisma schema format
2. SQL migration file
3. Brief explanation of design decisions
4. What indexes you added and WHY`
        },
        {
          label: "Query Optimization",
          code: `This query is slow (taking 2s on 500k rows):

[PASTE YOUR SQL QUERY]

Table schemas:
[PASTE RELEVANT CREATE TABLE]

Current indexes:
[PASTE \INDEXES output]

EXPLAIN ANALYZE output:
[PASTE EXPLAIN ANALYZE RESULT]

Tasks:
1. Identify why it's slow
2. Suggest missing indexes
3. Rewrite the query if needed
4. Show me the EXPLAIN ANALYZE improvement to expect`
        }
      ],
      tips: [
        "Always tell AI your data volume — 1k rows vs 10M rows = different solutions",
        "Paste your EXPLAIN ANALYZE output for real optimization help",
        "Ask for index explanations — understand WHY not just WHAT",
        "For Redis, tell AI your eviction policy and key TTL requirements",
        "Ask AI to generate seed data scripts for testing"
      ]
    }
  },
  {
    id: "devops",
    icon: "🚀",
    title: "DevOps & Deployment",
    color: "#a855f7",
    content: {
      summary: "AI can write Dockerfiles, CI/CD pipelines, and Terraform — but you must tell it your exact cloud provider, region, and environment setup.",
      prompts: [
        {
          label: "Dockerfile Prompt",
          code: `Create a production Dockerfile for:
- App: [Node.js/Python/Go app]
- Package manager: [npm/pnpm/poetry]
- Build command: [npm run build]
- Start command: [node dist/index.js]
- Port: [3000]

Requirements:
- Multi-stage build (builder + runner stages)
- Non-root user for security
- Minimal final image size
- .dockerignore file included
- Health check endpoint: /health
- Environment variables via ARG/ENV

Show Dockerfile + .dockerignore + docker-compose.yml for local dev`
        },
        {
          label: "GitHub Actions CI/CD",
          code: `Create a GitHub Actions workflow for my [Node.js/Python] app.

Pipeline steps:
1. On push to main: run tests
2. On PR: lint + test + type check  
3. On merge to main: build Docker image, push to ECR, deploy to ECS

Stack:
- Cloud: AWS (ECR + ECS Fargate)
- Registry: Amazon ECR
- Secrets: GitHub Secrets

Required jobs:
- test: run unit tests
- lint: ESLint + Prettier check
- build: Docker multi-stage build
- deploy: push to ECR + update ECS service

Use: ubuntu-latest, actions/checkout@v4, aws-actions/configure-aws-credentials@v4`
        }
      ],
      tips: [
        "Tell AI your cloud provider — AWS, GCP, Azure have different CLI commands",
        "Always ask for health checks in Docker setups",
        "Ask AI to explain what each step does — learn while you build",
        "Request rollback strategy in deployment prompts",
        "Ask for cost estimates when designing cloud architecture"
      ]
    }
  },
  {
    id: "systemdesign",
    icon: "🏗️",
    title: "System Design with AI",
    color: "#f97316",
    content: {
      summary: "Use AI to rubber-duck your designs, generate diagrams, find flaws, and prep for interviews. Don't just ask 'design X' — engage iteratively.",
      prompts: [
        {
          label: "Design Review Prompt",
          code: `I'm designing [SYSTEM NAME] for [USE CASE].

My current design:
[DESCRIBE YOUR DESIGN OR PASTE DIAGRAM]

Expected scale:
- Users: [X DAU]
- Requests: [X req/sec]
- Data: [X GB/TB]

Questions:
1. What are the weakest points in this design?
2. Where will this break at scale?
3. What am I missing?
4. Suggest 2 alternatives for [specific component]
5. What would you change first?

Don't redesign everything — critique what I have.`
        },
        {
          label: "Interview Prep Prompt",
          code: `Act as a system design interviewer at a FAANG company.

Give me the system design question: "Design [SYSTEM]"

After I answer, evaluate me on:
- Requirements clarification (did I ask the right questions?)
- Scale estimation (numbers)
- Component design (appropriate choices)
- Deep dive quality
- Trade-off discussion

Start with the question. I'll answer. Then give harsh feedback.`
        }
      ],
      tips: [
        "Give AI your design first, ask it to CRITIQUE — not rebuild",
        "Use AI to generate Mermaid diagrams for your designs",
        "Ask 'what would break at 10x scale?' for each component",
        "Use AI to quiz you on CAP theorem, consistency models",
        "Practice: Design one system per week with AI as your interviewer"
      ]
    }
  },
  {
    id: "ai_stack",
    icon: "🤖",
    title: "AI/LLM Features in Your App",
    color: "#ec4899",
    content: {
      summary: "Building AI-powered features is the hottest skill right now. Here's how to use AI to build AI features (yes, really).",
      prompts: [
        {
          label: "RAG Pipeline Prompt",
          code: `Build a RAG (Retrieval Augmented Generation) pipeline.

Stack: Python, FastAPI, OpenAI, Pinecone (or pgvector), LangChain

Requirements:
- Ingest: PDF + text files
- Chunking: recursive with 512 tokens, 50 overlap
- Embedding: OpenAI text-embedding-3-small
- Storage: [Pinecone / pgvector]
- Retrieval: top-5 semantic search + MMR reranking
- Generation: GPT-4o with retrieved context
- Streaming response

Create:
1. ingest.py — document processing pipeline
2. retriever.py — semantic search logic
3. chain.py — RAG chain with prompt template
4. api/chat.py — FastAPI streaming endpoint

Include error handling for: rate limits, empty results, context overflow`
        },
        {
          label: "AI Feature in Next.js",
          code: `Add an AI chat feature to my Next.js 14 app.

Stack: Next.js 14, Vercel AI SDK, OpenAI GPT-4o, TypeScript

Create:
1. app/api/chat/route.ts — streaming API route
2. components/Chat/ChatWindow.tsx — UI with message history
3. components/Chat/ChatInput.tsx — input with submit
4. hooks/useChat.ts — chat state management
5. lib/ai/systemPrompt.ts — system prompt config

Features:
- Streaming responses (show tokens as they arrive)
- Message history (last 10 messages as context)
- Loading skeleton while streaming
- Error boundary for API failures
- Copy message button

Use Vercel AI SDK's useChat hook.`
        }
      ],
      tips: [
        "Specify your embedding model — it affects vector dimensions",
        "Always ask for streaming in LLM features — users hate waiting",
        "Ask AI to add token counting to avoid context overflow bugs",
        "Request retry logic with exponential backoff for LLM API calls",
        "Ask for LangSmith/Langfuse tracing to debug your AI pipelines"
      ]
    }
  },
  {
    id: "personal",
    icon: "🛠️",
    title: "Personal Projects Strategy",
    color: "#14b8a6",
    content: {
      summary: "Personal projects built with AI are your portfolio. Build things that SOLVE real problems for you. Recruiters can tell the difference.",
      projects: [
        { name: "AI Second Brain", desc: "RAG on your own notes, voice input, Obsidian integration. Shows: LLMs, vector DB, full-stack." },
        { name: "Job Application Tracker", desc: "With AI email parsing, status auto-updates. Shows: scraping, AI extraction, CRUD." },
        { name: "Personal Finance Dashboard", desc: "Bank CSV imports, AI categorization, charts. Shows: data pipeline, visualization, ML." },
        { name: "Code Review Bot", desc: "GitHub webhook → GPT-4 reviews your PRs. Shows: webhooks, AI integration, DevOps." },
        { name: "Local LLM Interface", desc: "Beautiful UI for Ollama models. Shows: streaming, UI/UX, AI integration." },
        { name: "SaaS Micro-Tool", desc: "One specific tool (e.g., AI resume scorer). Shows: payments, auth, deployment, full product." },
      ],
      workflow: [
        "Week 1: Scaffold with AI — folder structure, auth, DB schema",
        "Week 2: Core feature — one focused AI session per feature",
        "Week 3: Polish — tests, error handling, loading states",
        "Week 4: Deploy + document — Vercel/Railway + README with architecture diagram",
      ]
    }
  },
  {
    id: "jobs",
    icon: "💼",
    title: "Getting a Job in 5 Months",
    color: "#eab308",
    content: {
      summary: "The job market is brutal but there's a formula. Signal matters more than grinding LeetCode. Here's what actually works.",
      phases: [
        {
          phase: "Month 1–2: Foundation",
          items: [
            "Pick ONE stack: Next.js + Node + PostgreSQL (most in-demand)",
            "Build 1 project using AI correctly (see personal projects)",
            "GitHub streak — commit every day, even small things",
            "Use AI to write clean READMEs with architecture diagrams"
          ]
        },
        {
          phase: "Month 3: Portfolio Projects",
          items: [
            "Build 2 production-quality projects (not tutorials)",
            "One must have AI features — it's the differentiator now",
            "One must be deployed and working (not 'under construction')",
            "Record a 2-min Loom demo of each project",
          ]
        },
        {
          phase: "Month 4: Signal Building",
          items: [
            "Write 2 LinkedIn posts about what you built (show the code)",
            "Contribute to 1 open source project (even docs/bugs)",
            "Build in public on Twitter/X — 'I built X today with AI'",
            "Use AI to write your resume: 'rewrite this bullet with STAR format, quantify impact'"
          ]
        },
        {
          phase: "Month 5: Apply Smart",
          items: [
            "Apply to 5 companies/day (not 50 spray-and-pray)",
            "Customize each application — use AI: 'tailor my resume for this JD'",
            "Do 10 mock system design interviews with AI as interviewer",
            "Do 50 LeetCode Easy/Medium — use AI to explain patterns, not solutions",
          ]
        }
      ],
      jobPrompts: [
        {
          label: "Resume Bullet Prompt",
          code: `Rewrite this resume bullet point using STAR format.
Make it quantified and impactful for a [Frontend/Backend/Full-Stack] role.

Original: [your bullet]

Context: I used [technologies], built [what], which resulted in [outcome].

Output: 3 versions from most technical to most business-impact focused.`
        },
        {
          label: "Interview Prep Prompt",
          code: `Act as a tough interviewer at [Company Name] for a [Role] position.

Ask me 5 behavioral questions focused on:
- Handling technical disagreements
- Delivering under pressure
- Learning from failures

After each answer, give me:
1. Score 1-10
2. What was weak
3. Better version of my answer`
        }
      ]
    }
  },
  {
    id: "design",
    icon: "✨",
    title: "AI for Design Projects",
    color: "#f472b6",
    content: {
      summary: "You mentioned using AI for design too — here's how to get stunning results instead of generic outputs.",
      prompts: [
        {
          label: "UI Design System Prompt",
          code: `Create a complete design system component in React + Tailwind.

Brand: [describe your brand — e.g., 'modern fintech, dark mode, trustworthy but bold']
Primary color: [hex]
Font: [font name or 'choose for me']

Components needed:
- Button (primary, secondary, ghost, danger, sizes: sm/md/lg)
- Input (with label, error state, helper text)
- Card (with header, body, footer variants)
- Badge (status colors)
- Modal (with overlay, close button)

Rules:
- Use CSS variables for all colors (easy theming)
- Export each component from index.ts
- Add variant prop using cva() (class-variance-authority)
- Include dark mode variants
- Accessible: aria labels, focus rings`
        },
        {
          label: "Landing Page Prompt",
          code: `Build a landing page for [PRODUCT].

Target audience: [WHO]
Tone: [modern/playful/corporate/minimal]
Color palette preference: [dark/light/colorful]

Sections needed:
1. Hero — headline, subheadline, CTA button, hero image placeholder
2. Features — 3 features with icons
3. How it works — 3 steps
4. Pricing — 3 tiers
5. FAQ — 5 questions
6. Footer

Stack: Next.js, Tailwind CSS, Framer Motion animations
Rules:
- Mobile-first responsive
- Smooth scroll between sections
- Entrance animations on scroll (use Framer Motion)
- Performance: lazy load images
- SEO: proper meta tags, semantic HTML

Give the full page in one file first, then I'll ask to split.`
        }
      ],
      tips: [
        "Always describe your brand personality, not just colors",
        "Ask for 'cva() variants' — makes components way more flexible",
        "Request Framer Motion for animations — transforms average to stunning",
        "Ask for mobile-first always — desktop is secondary",
        "For Figma → Code: screenshot your design and paste it with 'recreate this in React/Tailwind'"
      ]
    }
  },
  {
    id: "masterrules",
    icon: "⚡",
    title: "The Master Rules",
    color: "#00ff88",
    content: {
      rules: [
        { num: "01", rule: "Context First", detail: "Always paste your existing code, folder structure, and stack before asking for new code." },
        { num: "02", rule: "One Task Per Prompt", detail: "One feature. One bug. One refactor. Never bundle 3 things in one prompt." },
        { num: "03", rule: "Force File Structure", detail: "Always specify the output file structure. 'Give all files separately with full path as heading.'" },
        { num: "04", rule: "Protect Existing Code", detail: "'Do NOT modify existing functions. Only add new ones.' Say this every time you're extending." },
        { num: "05", rule: "Ask for Explanation", detail: "After code: 'Explain the 3 most important decisions you made here.' You learn by understanding, not copy-pasting." },
        { num: "06", rule: "Iterate with Errors", detail: "When it breaks: paste error + relevant file + 'fix only this error, show me the changed lines only.'" },
        { num: "07", rule: "Review Everything", detail: "AI is your intern. Smart, fast, but needs review. Check for: security holes, missed edge cases, wrong patterns." },
        { num: "08", rule: "Build Daily", detail: "30 minutes of building > 3 hours of watching tutorials. Use AI to unblock you instantly." },
        { num: "09", rule: "Document with AI", detail: "'Write a README for this project with: overview, tech stack, architecture diagram (Mermaid), setup steps.'" },
        { num: "10", rule: "You + AI = Unstoppable", detail: "In 5 months, you won't just use AI — you'll know WHY the code works. That's what makes you dangerous." },
      ]
    }
  }
];

export default function Aidevmastery() {
  const [active, setActive] = useState("mindset");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const section = sections.find(s => s.id === active);

  return (
    <div style={{ fontFamily: "'Courier New', monospace", background: "#0a0a0a", minHeight: "100vh", color: "#e0e0e0" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "24px 32px", background: "#0d0d0d" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#00ff88", letterSpacing: 2, textTransform: "uppercase" }}>
              AI × Dev Mastery
            </h1>
          </div>
          <p style={{ margin: 0, color: "#555", fontSize: 12, letterSpacing: 1 }}>
            YOUR 5-MONTH WAR PLAN · YOU + AI = UNSTOPPABLE COMBO
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 0, minHeight: "calc(100vh - 80px)" }}>
        {/* Sidebar */}
        <div style={{ width: 220, borderRight: "1px solid #1a1a1a", padding: "20px 0", flexShrink: 0 }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                width: "100%", textAlign: "left", padding: "10px 20px",
                background: active === s.id ? "#111" : "transparent",
                border: "none", borderLeft: active === s.id ? `2px solid ${s.color}` : "2px solid transparent",
                color: active === s.id ? s.color : "#555",
                cursor: "pointer", fontSize: 12, letterSpacing: 0.5,
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.15s"
              }}
            >
              <span>{s.icon}</span>
              <span style={{ fontWeight: active === s.id ? 700 : 400 }}>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
          {section && (
            <div>
              {/* Section Header */}
              <div style={{ marginBottom: 32, borderBottom: "1px solid #1a1a1a", paddingBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>{section.icon}</span>
                  <h2 style={{ margin: 0, fontSize: 24, color: section.color, textTransform: "uppercase", letterSpacing: 2 }}>
                    {section.title}
                  </h2>
                </div>
                {section.content.summary && (
                  <p style={{ margin: 0, color: "#888", fontSize: 14, lineHeight: 1.7, borderLeft: `3px solid ${section.color}`, paddingLeft: 16 }}>
                    {section.content.summary}
                  </p>
                )}
              </div>

              {/* Rules (mindset / masterrules) */}
              {section.content.rules && (
                <div style={{ display: "grid", gap: 12 }}>
                  {section.content.rules.map((r, i) => (
                    <div key={i} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "16px 20px", display: "flex", gap: 20 }}>
                      <span style={{ color: section.color, fontWeight: 700, fontSize: 18, minWidth: 36 }}>{r.num || `0${i+1}`}</span>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{r.title || r.rule}</div>
                        <div style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>{r.desc || r.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prompts */}
              {section.content.prompts && (
                <div style={{ display: "grid", gap: 24 }}>
                  {section.content.prompts.map((p, i) => (
                    <div key={i} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #1a1a1a" }}>
                        <span style={{ color: section.color, fontSize: 13, fontWeight: 700 }}>{p.label}</span>
                        <button
                          onClick={() => copy(p.code, `${section.id}-${i}`)}
                          style={{ background: copiedIndex === `${section.id}-${i}` ? section.color : "#1a1a1a", border: "none", borderRadius: 4, padding: "4px 12px", color: copiedIndex === `${section.id}-${i}` ? "#000" : "#888", cursor: "pointer", fontSize: 11, transition: "all 0.2s" }}
                        >
                          {copiedIndex === `${section.id}-${i}` ? "✓ Copied!" : "Copy Prompt"}
                        </button>
                      </div>
                      <pre style={{ margin: 0, padding: 20, fontSize: 11, lineHeight: 1.8, color: "#aaa", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                        {p.code}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              {section.content.tips && (
                <div style={{ marginTop: 28 }}>
                  <h3 style={{ color: "#444", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Pro Tips</h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    {section.content.tips.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ color: section.color, marginTop: 1 }}>›</span>
                        <span style={{ color: "#777", fontSize: 13, lineHeight: 1.6 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Projects */}
              {section.content.projects && (
                <div>
                  <h3 style={{ color: "#444", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                    Build These Projects
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                    {section.content.projects.map((p, i) => (
                      <div key={i} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: 16 }}>
                        <div style={{ color: section.color, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{p.name}</div>
                        <div style={{ color: "#666", fontSize: 12, lineHeight: 1.6 }}>{p.desc}</div>
                      </div>
                    ))}
                  </div>
                  <h3 style={{ color: "#444", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                    4-Week Build Workflow
                  </h3>
                  {section.content.workflow.map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                      <span style={{ color: section.color, fontWeight: 700, fontSize: 12, minWidth: 60 }}>Week {i + 1}</span>
                      <span style={{ color: "#777", fontSize: 13 }}>{w.split(": ")[1]}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Jobs */}
              {section.content.phases && (
                <div>
                  <div style={{ display: "grid", gap: 20, marginBottom: 32 }}>
                    {section.content.phases.map((p, i) => (
                      <div key={i} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: 20 }}>
                        <div style={{ color: section.color, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{p.phase}</div>
                        {p.items.map((item, j) => (
                          <div key={j} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                            <span style={{ color: section.color }}>›</span>
                            <span style={{ color: "#777", fontSize: 13, lineHeight: 1.6 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {section.content.jobPrompts && (
                    <div style={{ display: "grid", gap: 24 }}>
                      {section.content.jobPrompts.map((p, i) => (
                        <div key={i} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #1a1a1a" }}>
                            <span style={{ color: section.color, fontSize: 13, fontWeight: 700 }}>{p.label}</span>
                            <button
                              onClick={() => copy(p.code, `job-${i}`)}
                              style={{ background: copiedIndex === `job-${i}` ? section.color : "#1a1a1a", border: "none", borderRadius: 4, padding: "4px 12px", color: copiedIndex === `job-${i}` ? "#000" : "#888", cursor: "pointer", fontSize: 11 }}
                            >
                              {copiedIndex === `job-${i}` ? "✓ Copied!" : "Copy Prompt"}
                            </button>
                          </div>
                          <pre style={{ margin: 0, padding: 20, fontSize: 11, lineHeight: 1.8, color: "#aaa", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                            {p.code}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}