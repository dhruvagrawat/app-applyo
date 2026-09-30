export type Difficulty = "easy" | "medium" | "hard"

export interface InterviewQuestion {
  id: string
  category: string
  question: string
  tip: string
  difficulty: Difficulty
}

export interface QuestionCategory {
  slug: string
  name: string
  description: string
}

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  { slug: "general", name: "General & Fit", description: "Openers every interview starts with." },
  { slug: "behavioral", name: "Behavioral", description: "“Tell me about a time…” — answer with STAR." },
  { slug: "situational", name: "Situational", description: "Hypotheticals that test your judgment." },
  { slug: "leadership", name: "Leadership", description: "Leading people, decisions and change." },
  { slug: "teamwork", name: "Teamwork & Conflict", description: "Collaboration, disagreement and influence." },
  { slug: "problem-solving", name: "Problem Solving", description: "How you think through hard problems." },
  { slug: "career", name: "Career Goals & Motivation", description: "Why this role, why now, what's next." },
  { slug: "software", name: "Software Engineering", description: "Engineering practice, design and debugging." },
  { slug: "data", name: "Data & Analytics", description: "SQL, metrics, experiments and insight." },
  { slug: "product", name: "Product Management", description: "Product sense, prioritization and metrics." },
  { slug: "design", name: "UX & Design", description: "Process, research and critique." },
  { slug: "marketing", name: "Marketing", description: "Growth, campaigns, brand and measurement." },
  { slug: "sales", name: "Sales & Customer Success", description: "Pipeline, objections and retention." },
  { slug: "finance", name: "Finance & Operations", description: "Numbers, process and efficiency." },
  { slug: "tricky", name: "Tricky Questions", description: "Gaps, salary, weaknesses and curveballs." },
  { slug: "remote", name: "Remote & Hybrid Work", description: "Async communication and self-management." },
]

type Row = [question: string, tip: string, difficulty?: Difficulty]

const BANK: Record<string, Row[]> = {
  general: [
    ["Tell me about yourself.", "Use present → past → future in 60–90 seconds and end on why this role.", "easy"],
    ["Why do you want to work here?", "Name something specific about the company — product, mission, recent news — and connect it to your skills.", "easy"],
    ["Why are you interested in this role?", "Link two or three requirements of the role to things you've already done and enjoy.", "easy"],
    ["Walk me through your resume.", "Tell a story with a thread, highlighting the most relevant role in the most detail.", "easy"],
    ["What do you know about our company?", "Show research: customers, product, competitors and a recent development.", "easy"],
    ["Why should we hire you?", "Summarize the top three reasons you fit, each backed by a result.", "medium"],
    ["What are your greatest strengths?", "Pick 2–3 strengths relevant to the job and prove each with a short example.", "easy"],
    ["How would your colleagues describe you?", "Use real feedback you've received and add a quick example.", "easy"],
    ["What makes you unique compared to other candidates?", "Combine skills or experiences that rarely go together.", "medium"],
    ["What type of work environment do you thrive in?", "Be honest, but show you can adapt. Research their culture first.", "easy"],
    ["What are you most proud of in your career?", "Pick an achievement with real stakes and measurable impact.", "medium"],
    ["What do you do outside of work?", "Share genuine interests briefly; a link to skills is a bonus, not required.", "easy"],
  ],
  behavioral: [
    ["Tell me about a time you failed.", "Own it, show what you learned and how you applied the lesson later.", "medium"],
    ["Describe a time you made a mistake at work.", "Focus on how you caught it, fixed it and prevented it happening again.", "medium"],
    ["Tell me about a time you went above and beyond.", "Show initiative and the impact on customers or the team.", "easy"],
    ["Describe a time you had to meet a tight deadline.", "Explain how you prioritized, communicated and delivered.", "easy"],
    ["Tell me about a goal you set and achieved.", "Show planning, tracking and the result with a number.", "easy"],
    ["Give an example of when you had to learn something quickly.", "Describe your learning strategy, not just that you learned it.", "medium"],
    ["Tell me about a time you handled a difficult customer.", "Show empathy, a clear action and the outcome.", "medium"],
    ["Describe a time you had to adapt to a big change.", "Show a positive attitude and practical steps you took.", "medium"],
    ["Tell me about a time you received critical feedback.", "Show you listened, didn't get defensive and changed something.", "medium"],
    ["Describe a time you improved a process.", "Quantify the before and after: time, cost or errors.", "medium"],
    ["Tell me about a time you had too much on your plate.", "Explain how you prioritized and when you asked for help.", "medium"],
    ["Describe a time you took initiative without being asked.", "Show ownership and why it mattered to the business.", "easy"],
    ["Tell me about a time you had to work with incomplete information.", "Show how you reduced uncertainty and made a reasonable decision.", "hard"],
    ["Give an example of a time you showed integrity.", "Pick a real dilemma and explain your reasoning.", "hard"],
  ],
  situational: [
    ["What would you do if you were going to miss a deadline?", "Flag it early, explain options and propose a new plan.", "easy"],
    ["How would you handle a teammate who isn't pulling their weight?", "Start with a private, curious conversation before escalating.", "medium"],
    ["What would you do if you disagreed with your manager's decision?", "Voice concerns with data privately, then commit if the decision stands.", "medium"],
    ["How would you prioritize three urgent requests from different stakeholders?", "Clarify impact and deadlines, align with your manager, communicate trade-offs.", "medium"],
    ["What would you do in your first 90 days here?", "Learn → contribute → lead; mention people, processes and an early win.", "medium"],
    ["How would you handle a client asking for something out of scope?", "Acknowledge the need, explain impact, offer options with costs.", "medium"],
    ["What would you do if you noticed a colleague acting unethically?", "Gather facts, follow policy, escalate appropriately.", "hard"],
    ["How would you handle being asked to do something you've never done?", "Show resourcefulness: research, ask experts, start small, check in.", "easy"],
    ["What would you do if a project you led was failing?", "Diagnose honestly, communicate early, re-plan or stop it.", "hard"],
    ["How would you handle conflicting feedback from two senior people?", "Bring them together or clarify the decision owner.", "hard"],
  ],
  leadership: [
    ["Tell me about a time you led a team.", "Explain the goal, how you organized people and the result.", "medium"],
    ["Describe your leadership style.", "Give a style plus an example; show you adapt to people and situations.", "medium"],
    ["Tell me about a time you had to make an unpopular decision.", "Show how you communicated the why and handled pushback.", "hard"],
    ["How do you motivate a team?", "Talk about purpose, autonomy, recognition and removing blockers.", "medium"],
    ["Describe a time you developed someone on your team.", "Show your coaching approach and their growth.", "medium"],
    ["How do you handle underperformance?", "Clear expectations, support, documented plan, fair follow-through.", "hard"],
    ["Tell me about a time you led without formal authority.", "Show influence through data, relationships and shared goals.", "medium"],
    ["How do you delegate?", "Match tasks to people's growth, set outcomes not steps, check in.", "medium"],
    ["Describe a time you managed a significant change.", "Explain the vision, communication plan and how you supported people.", "hard"],
    ["How do you build trust with a new team?", "Listen first, deliver on small promises, be transparent.", "medium"],
  ],
  teamwork: [
    ["Describe a conflict with a coworker and how you resolved it.", "Stay neutral, focus on the shared goal and the resolution.", "medium"],
    ["Tell me about a time you worked with someone very different from you.", "Show curiosity about their style and how you adapted.", "medium"],
    ["Describe a successful cross-functional project.", "Explain how you aligned goals and communicated across teams.", "medium"],
    ["Tell me about a time you helped a struggling teammate.", "Show empathy and practical help, without taking over.", "easy"],
    ["Describe a time you disagreed with a team decision.", "Show you voiced concerns constructively and then committed.", "medium"],
    ["How do you handle a teammate who takes credit for your work?", "Stay factual and calm; make contributions visible going forward.", "hard"],
    ["Tell me about a time you persuaded others to adopt your idea.", "Show how you understood their concerns and used evidence.", "medium"],
    ["What role do you usually play on a team?", "Be honest and show you can flex into other roles when needed.", "easy"],
    ["Tell me about a team that failed. What was your role?", "Take your share of responsibility and share the lesson.", "hard"],
  ],
  "problem-solving": [
    ["Tell me about the hardest problem you've solved at work.", "Walk through your reasoning step by step, not just the answer.", "hard"],
    ["How do you approach a problem you've never seen before?", "Clarify, break it down, research, test small, iterate.", "medium"],
    ["Describe a decision you made using data.", "Explain the data, the analysis and how it changed the decision.", "medium"],
    ["Tell me about a time you found the root cause of an issue.", "Show a structured method, like the five whys.", "medium"],
    ["Give an example of a creative solution to a constraint.", "Emphasize the constraint and why your idea was unusual.", "medium"],
    ["How do you decide between two good options?", "Criteria, trade-offs, reversibility and who's affected.", "medium"],
    ["Tell me about a time you identified a problem before others did.", "Show how you spotted it and how you raised it.", "medium"],
    ["How do you estimate something you have no data for?", "Use a structured estimate: break down, assume, sanity-check.", "hard"],
  ],
  career: [
    ["Where do you see yourself in five years?", "Show ambition aligned with the role's growth path.", "easy"],
    ["Why are you leaving your current job?", "Stay positive and forward-looking: what you're moving toward.", "medium"],
    ["What motivates you?", "Pick something genuine and relevant to the role.", "easy"],
    ["What are you looking for in your next role?", "Mirror what this role offers, honestly.", "easy"],
    ["Why did you choose this career?", "Tell a short origin story with a real moment of interest.", "easy"],
    ["What would make you leave a job?", "Keep it professional: lack of growth or misaligned values.", "medium"],
    ["What skill are you currently working on?", "Show a learning plan and progress.", "easy"],
    ["How do you define success?", "Balance outcomes, growth and impact on others.", "easy"],
    ["What kind of manager brings out your best?", "Describe behaviors, not personalities.", "medium"],
  ],
  software: [
    ["Walk me through a system you designed.", "Cover requirements, architecture, trade-offs and what you'd change.", "hard"],
    ["How do you approach debugging a production issue?", "Stabilize first, reproduce, isolate, fix, then write a postmortem.", "medium"],
    ["How do you ensure code quality on your team?", "Code review, tests, CI, linting and clear conventions.", "medium"],
    ["Explain a technical concept to a non-technical person.", "Use an analogy and check for understanding.", "medium"],
    ["Tell me about a time you had to refactor legacy code.", "Show how you reduced risk with tests and incremental changes.", "medium"],
    ["How do you decide between building and buying a solution?", "Cost, time, core competency, maintenance and lock-in.", "hard"],
    ["What's your approach to writing tests?", "Test behavior at the right level; pyramid over ice-cream cone.", "medium"],
    ["How would you design a URL shortener?", "API, ID generation, storage, redirects, caching and scale.", "hard"],
    ["Tell me about a time you improved performance.", "Measure first, find the bottleneck, quantify the gain.", "medium"],
    ["How do you handle technical debt?", "Make it visible, tie it to business impact, pay it down continuously.", "medium"],
    ["Describe a time you disagreed in a code review.", "Focus on the code and goals, not the person; seek data.", "medium"],
    ["What happens when you type a URL into a browser?", "DNS, TCP/TLS, HTTP request, server, response, rendering.", "medium"],
  ],
  data: [
    ["How would you measure the success of a new feature?", "Define a primary metric, guardrails and a baseline.", "medium"],
    ["Explain an A/B test you designed or analyzed.", "Hypothesis, metric, sample size, duration and the decision.", "hard"],
    ["What's the difference between correlation and causation?", "Give an example and how you'd test causality.", "easy"],
    ["How do you handle missing or messy data?", "Understand why it's missing, then choose drop, impute or flag.", "medium"],
    ["Walk me through how you'd investigate a sudden drop in a key metric.", "Check data issues first, then segment by time, platform, cohort.", "hard"],
    ["Explain a JOIN in SQL and when you'd use a LEFT JOIN.", "LEFT JOIN keeps all rows from the left table even without matches.", "easy"],
    ["How do you communicate insights to non-technical stakeholders?", "Lead with the answer and the decision, then the evidence.", "medium"],
    ["Tell me about a time your analysis changed a decision.", "Explain the original plan, your finding and the outcome.", "medium"],
    ["What is statistical significance?", "Explain p-values in plain language and their limits.", "medium"],
  ],
  product: [
    ["What's your favorite product and how would you improve it?", "Pick a user segment, a problem, and a measurable improvement.", "medium"],
    ["How do you prioritize a roadmap?", "Impact vs effort, strategy fit, frameworks like RICE, and saying no.", "medium"],
    ["Tell me about a product you launched.", "Problem, discovery, decisions, launch and results.", "medium"],
    ["How do you decide what not to build?", "Tie decisions to strategy and evidence; explain trade-offs.", "hard"],
    ["How would you measure success for our product?", "North-star metric plus input metrics and guardrails.", "hard"],
    ["How do you work with engineering and design?", "Shared problem framing, early involvement, clear decisions.", "medium"],
    ["Tell me about a time you used customer feedback to change a product.", "Show how you separated signal from noise.", "medium"],
    ["Design a product for a specific user group.", "Clarify users and goals, list pain points, prioritize, sketch a solution, define metrics.", "hard"],
    ["How do you handle a stakeholder who insists on a feature?", "Understand the underlying need; use data to find the best solution.", "medium"],
  ],
  design: [
    ["Walk me through your design process.", "Discover, define, ideate, prototype, test — with a real example.", "easy"],
    ["Tell me about a project in your portfolio.", "Problem, your role, constraints, decisions and outcome.", "medium"],
    ["How do you handle negative feedback on your designs?", "Separate yourself from the work; dig into the reason.", "medium"],
    ["How do you balance user needs with business goals?", "Find the overlap; use research and metrics to decide.", "medium"],
    ["How do you conduct user research with limited time?", "Guerrilla testing, quick surveys, analytics, support tickets.", "medium"],
    ["How do you ensure your designs are accessible?", "Contrast, keyboard use, semantics, testing with assistive tech.", "medium"],
    ["Tell me about a time a design didn't perform as expected.", "Show how you measured, learned and iterated.", "hard"],
    ["How do you work with a design system?", "Use and contribute; balance consistency with needs.", "medium"],
  ],
  marketing: [
    ["Tell me about a campaign you're proud of.", "Goal, audience, channels, creative and results.", "medium"],
    ["How do you measure marketing ROI?", "Attribution approach, CAC, LTV and incrementality.", "hard"],
    ["How would you grow our user base?", "Pick one or two channels with a rationale and an experiment plan.", "hard"],
    ["How do you decide which channels to invest in?", "Audience fit, cost, scalability and test results.", "medium"],
    ["Tell me about a campaign that failed.", "What you tested, what you learned, what changed.", "medium"],
    ["How do you stay current with marketing trends?", "Specific sources and something you recently applied.", "easy"],
    ["How do you define a target audience?", "Data, interviews, jobs-to-be-done and segments.", "medium"],
    ["How would you position our product against competitors?", "Unique value, target segment and proof points.", "hard"],
  ],
  sales: [
    ["Sell me this pen.", "Ask questions first to find a need, then sell to it.", "medium"],
    ["How do you handle objections?", "Listen, clarify, acknowledge, respond with evidence, confirm.", "medium"],
    ["Tell me about your biggest deal.", "Context, stakeholders, obstacles and how you closed.", "medium"],
    ["How do you build a pipeline?", "Ideal customer profile, prospecting cadence, qualification.", "medium"],
    ["Tell me about a deal you lost.", "Own your part and what you changed afterwards.", "medium"],
    ["How do you handle a customer who wants to cancel?", "Understand the reason, solve if possible, learn if not.", "medium"],
    ["How do you prioritize accounts?", "Revenue potential, health, strategic value and urgency.", "medium"],
    ["How do you consistently hit your targets?", "Process, metrics you track weekly and discipline.", "easy"],
  ],
  finance: [
    ["Walk me through a budget you managed.", "Size, process, variances and decisions you made.", "medium"],
    ["How do you ensure accuracy in your work?", "Checks, reconciliations and review processes.", "easy"],
    ["Tell me about a time you found a cost saving.", "Quantify the saving and how you found it.", "medium"],
    ["How would you evaluate whether to invest in a new project?", "NPV, payback, risks and strategic fit.", "hard"],
    ["How do you explain financial results to non-finance colleagues?", "Focus on drivers and implications, not jargon.", "medium"],
    ["Describe a process you streamlined.", "Before/after in time or error rate.", "medium"],
    ["How do you handle a tight month-end close?", "Planning, automation and clear ownership.", "medium"],
  ],
  tricky: [
    ["What is your greatest weakness?", "Real but not critical, with evidence of improvement.", "medium"],
    ["What are your salary expectations?", "Ask their range or give a researched range; bottom = your target.", "medium"],
    ["Why is there a gap in your resume?", "Brief, honest, then pivot to your readiness now.", "medium"],
    ["Why have you changed jobs so often?", "Show a thread of growth and commitment to this move.", "hard"],
    ["You seem overqualified. Why this role?", "Give a genuine reason and address retention concerns.", "hard"],
    ["Are you interviewing elsewhere?", "Yes, briefly, and say this role is a top choice if true.", "easy"],
    ["What would you do if you didn't get this job?", "Show resilience and continued interest.", "easy"],
    ["Tell me something that's not on your resume.", "A story that reveals character or a hidden skill.", "medium"],
    ["What's a question you wish I'd asked?", "Use it to share a strength you haven't covered.", "medium"],
    ["Why were you let go?", "Honest, brief, no blame, focus on what you learned.", "hard"],
  ],
  remote: [
    ["How do you stay productive working remotely?", "Routine, focus blocks, clear goals and visible progress.", "easy"],
    ["How do you communicate across time zones?", "Async by default, clear written updates, overlap hours.", "medium"],
    ["Tell me about a remote project you led.", "Tools, rituals and how you kept alignment.", "medium"],
    ["How do you build relationships with remote colleagues?", "Regular 1:1s, informal chats and helping proactively.", "easy"],
    ["How do you handle distractions at home?", "Dedicated space, boundaries and schedules.", "easy"],
    ["What tools do you use to collaborate remotely?", "Name tools and how you use them well, not just that you know them.", "easy"],
    ["How do you make sure your manager knows what you're working on?", "Weekly written updates, visible task boards and proactive flags.", "easy"],
    ["Tell me about a misunderstanding caused by async communication.", "Show how you resolved it and what you changed in your writing.", "medium"],
  ],
}

export const QUESTION_BANK: InterviewQuestion[] = Object.entries(BANK).flatMap(([category, rows]) =>
  rows.map(([question, tip, difficulty = "medium"], i) => ({
    id: `${category}-${i + 1}`,
    category,
    question,
    tip,
    difficulty,
  })),
)

export function questionsFor(category?: string) {
  return category ? QUESTION_BANK.filter((q) => q.category === category) : QUESTION_BANK
}
