export interface QuizQuestion {
  q: string
  options: string[]
  answer: number // index into options
  explain: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  category: "Interview skills" | "Career skills" | "Technical" | "Business"
  minutes: number
  questions: QuizQuestion[]
}

export const QUIZZES: Quiz[] = [
  {
    id: "interview-etiquette",
    title: "Interview Etiquette & Preparation",
    description: "Do you know the unwritten rules of interviewing?",
    category: "Interview skills",
    minutes: 8,
    questions: [
      { q: "When is the best time to send a thank-you email after an interview?", options: ["Immediately during the interview", "Within 24 hours", "After one week", "Only if you get an offer"], answer: 1, explain: "Within 24 hours keeps you fresh in the interviewer's mind without seeming rushed." },
      { q: "How early should you arrive for an in-person interview?", options: ["30–45 minutes", "10–15 minutes", "Exactly on time", "5 minutes late is fine"], answer: 1, explain: "10–15 minutes early shows punctuality without putting pressure on the host." },
      { q: "An interviewer asks, 'Do you have any questions for us?' What's the best response?", options: ["No, you covered everything", "Ask about salary first", "Ask 2–3 thoughtful questions about the role and team", "Ask what the company does"], answer: 2, explain: "Thoughtful questions show curiosity and help you evaluate the role." },
      { q: "For a video interview, where should your camera be?", options: ["Below your chin", "At eye level", "Above your head", "It doesn't matter"], answer: 1, explain: "Eye level creates natural eye contact and a more flattering angle." },
      { q: "What should you research before an interview?", options: ["Only the job title", "The company, the role, and your interviewers", "Only the salary", "Nothing — be spontaneous"], answer: 1, explain: "Research lets you tailor answers and ask better questions." },
      { q: "You don't know the answer to a technical question. What's best?", options: ["Make something up confidently", "Stay silent", "Say what you do know and explain how you'd find out", "Change the subject"], answer: 2, explain: "Honesty plus a problem-solving approach is valued far more than a bluff." },
      { q: "How should you talk about a previous employer you disliked?", options: ["Explain everything they did wrong", "Stay neutral and focus on what you're moving toward", "Refuse to discuss it", "Joke about them"], answer: 1, explain: "Negativity about past employers is a red flag to interviewers." },
      { q: "What's a good length for most interview answers?", options: ["10 seconds", "1–2 minutes", "5–7 minutes", "As long as possible"], answer: 1, explain: "1–2 minutes is detailed enough to be credible without rambling." },
      { q: "When is it usually best to raise salary in an early-stage interview?", options: ["In the first minute", "When the interviewer brings it up or at offer stage", "Never", "In your thank-you email"], answer: 1, explain: "Let them raise it early, or negotiate once there's an offer and you have leverage." },
      { q: "What should you bring to an in-person interview?", options: ["Nothing", "Copies of your resume, notes and questions", "Your laptop to present unrequested slides", "A friend"], answer: 1, explain: "Resume copies and your prepared questions show organization." },
    ],
  },
  {
    id: "star-behavioral",
    title: "STAR Method & Behavioral Answers",
    description: "Test your understanding of structuring behavioral answers.",
    category: "Interview skills",
    minutes: 8,
    questions: [
      { q: "What does STAR stand for?", options: ["Skills, Tasks, Achievements, Results", "Situation, Task, Action, Result", "Strategy, Tactics, Action, Review", "Story, Theme, Answer, Reflection"], answer: 1, explain: "Situation, Task, Action, Result." },
      { q: "Which part of a STAR answer should usually take the most time?", options: ["Situation", "Task", "Action", "Result"], answer: 2, explain: "Your actions show your skills — they're what interviewers score." },
      { q: "A candidate says 'we' throughout their answer. What's the issue?", options: ["Nothing", "It hides their individual contribution", "It sounds too humble", "It's grammatically wrong"], answer: 1, explain: "Credit the team, but make your personal actions clear." },
      { q: "What's the best kind of Result to include?", options: ["A vague feeling of success", "A measurable outcome plus what you learned", "Your manager's name", "How long the project took, only"], answer: 1, explain: "Specific, measurable outcomes are the most convincing." },
      { q: "'Tell me about a time you failed.' Which answer is strongest?", options: ["'I've never really failed.'", "A trivial failure with no lesson", "A real failure, your role in it, and how you applied the lesson later", "Blaming a colleague"], answer: 2, explain: "Ownership and growth are what this question tests." },
      { q: "How many prepared stories is a good target before an interview loop?", options: ["1", "8–10", "50", "None — improvise"], answer: 1, explain: "8–10 stories can be adapted to cover most behavioral questions." },
      { q: "What is a 'story bank'?", options: ["A list of jokes", "A set of prepared STAR stories mapped to competencies", "A savings account", "A company's case studies"], answer: 1, explain: "Mapping stories to competencies lets you pick the best one quickly." },
      { q: "A behavioral question starts with 'Tell me about a time…'. What is it really assessing?", options: ["Your memory", "How you behaved in a real situation, as a predictor of future behavior", "Your storytelling style only", "Nothing in particular"], answer: 1, explain: "Past behavior is used as a predictor of future performance." },
      { q: "For senior roles, what's a useful addition to STAR?", options: ["A longer situation", "A reflection on what you'd do differently or how you scaled the lesson", "More jargon", "Your salary"], answer: 1, explain: "Reflection demonstrates judgment and leadership maturity." },
      { q: "What's the biggest mistake in the Situation part?", options: ["Being too brief", "Spending too long on background context", "Mentioning the company", "Using numbers"], answer: 1, explain: "Keep context to one or two sentences and move to your actions." },
    ],
  },
  {
    id: "salary-negotiation",
    title: "Salary Negotiation Basics",
    description: "Are you ready to negotiate your next offer?",
    category: "Career skills",
    minutes: 7,
    questions: [
      { q: "What should you do first when you receive an offer?", options: ["Accept immediately", "Thank them and ask for time to review", "Reject it to get a better one", "Ask for double"], answer: 1, explain: "Showing enthusiasm and taking time to review is professional and gives you room to negotiate." },
      { q: "What's the best basis for a counteroffer?", options: ["Your personal expenses", "Market research and the value you bring", "What your friend earns", "A random number"], answer: 1, explain: "Market data and your impact are objective, persuasive reasons." },
      { q: "If base salary is fixed, what else can you negotiate?", options: ["Nothing", "Signing bonus, equity, vacation, flexibility, title, learning budget", "Only the start date", "Your manager"], answer: 1, explain: "Total compensation includes many negotiable elements." },
      { q: "When giving a salary range, where should your target salary be?", options: ["At the top", "In the middle", "At the bottom", "Outside the range"], answer: 2, explain: "Employers often anchor to the bottom of your range, so make it a number you'd be happy with." },
      { q: "After stating your counteroffer, what should you do?", options: ["Keep talking to justify it", "Pause and let them respond", "Lower it immediately", "Hang up"], answer: 1, explain: "Silence gives the other side room to respond and avoids negotiating against yourself." },
      { q: "Is it a good idea to invent a competing offer?", options: ["Yes, always", "No — it can backfire and damage trust", "Only for big companies", "Only by email"], answer: 1, explain: "Fabricated offers can be called out and cost you the opportunity." },
      { q: "When should you resign from your current job?", options: ["As soon as you get a verbal offer", "After you receive and sign the written offer", "Before interviewing", "After your first day"], answer: 1, explain: "Always get the final offer in writing first." },
      { q: "What is a signing bonus?", options: ["A yearly bonus", "A one-time payment for joining", "A stock grant", "A pay cut"], answer: 1, explain: "It's a one-off payment, often used to compensate for a forfeited bonus or when base pay is capped." },
      { q: "What does 'vesting' typically refer to?", options: ["Your dress code", "The schedule over which you earn equity", "Probation period", "Overtime pay"], answer: 1, explain: "Equity usually vests over time, e.g., over four years with a one-year cliff." },
      { q: "How much above the initial offer do people commonly counter?", options: ["1–2%", "Roughly 10–20%, backed by research", "100%", "They never counter"], answer: 1, explain: "10–20% is a common, reasonable range when justified." },
    ],
  },
  {
    id: "resume-ats",
    title: "Resume & ATS Knowledge",
    description: "Will your resume make it past the robots?",
    category: "Career skills",
    minutes: 7,
    questions: [
      { q: "What does ATS stand for?", options: ["Automated Talent Scoring", "Applicant Tracking System", "Application Testing Service", "Advanced Typing Standard"], answer: 1, explain: "Applicant Tracking Systems collect, parse and rank applications." },
      { q: "Which layout is safest for ATS parsing?", options: ["Two columns with icons", "Single column with standard headings", "Infographic", "A table for everything"], answer: 1, explain: "Single-column layouts with standard headings parse most reliably." },
      { q: "Where should your contact information go?", options: ["In the document header/footer area", "In the main body at the top", "At the end", "Only in the cover letter"], answer: 1, explain: "Some parsers skip header/footer areas, so keep contact details in the body." },
      { q: "What's the best way to include keywords?", options: ["Hide them in white text", "Repeat them many times", "Naturally, in skills and in achievement bullets you can back up", "Paste the job description"], answer: 2, explain: "Natural, truthful use in context helps both ATS and humans." },
      { q: "Which bullet is strongest?", options: ["Responsible for social media", "Helped with marketing", "Grew Instagram followers from 2K to 11K in 8 months", "Did social media stuff"], answer: 2, explain: "Action + scope + measurable result." },
      { q: "Should you use the same resume for every application?", options: ["Yes", "No — tailor it to each role", "Only for big companies", "Only if it's one page"], answer: 1, explain: "Tailored resumes match more keywords and requirements." },
      { q: "What's a reasonable resume length for someone with 5 years of experience?", options: ["Half a page", "1–2 pages", "4 pages", "As long as possible"], answer: 1, explain: "1–2 pages covers relevant experience without padding." },
      { q: "Skill bars (e.g., 'Python ●●●○○') are…", options: ["Great for ATS", "Meaningless to ATS and often unclear to recruiters", "Required", "The best way to show skills"], answer: 1, explain: "ATS can't read graphics, and ratings are subjective." },
      { q: "Which file format should you use if the posting requests one?", options: ["Whatever you prefer", "The format they request", "Always .png", "Always .pages"], answer: 1, explain: "Follow instructions — some systems parse specific formats better." },
      { q: "How far back should work history usually go?", options: ["Every job ever", "About the last 10–15 years", "Only the last job", "Only education"], answer: 1, explain: "Older roles can be summarized or removed unless highly relevant." },
    ],
  },
  {
    id: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    description: "Core JavaScript concepts that come up in front-end and full-stack interviews.",
    category: "Technical",
    minutes: 10,
    questions: [
      { q: "What does `typeof null` return?", options: ["'null'", "'object'", "'undefined'", "'number'"], answer: 1, explain: "A long-standing quirk: typeof null is 'object'." },
      { q: "What's the difference between `==` and `===`?", options: ["No difference", "=== compares without type coercion", "== is faster", "=== only works on numbers"], answer: 1, explain: "Strict equality (===) doesn't coerce types." },
      { q: "Which keyword declares a block-scoped variable that can be reassigned?", options: ["var", "let", "const", "static"], answer: 1, explain: "let is block-scoped and reassignable; const cannot be reassigned." },
      { q: "What will `[1, 2, 3].map(n => n * 2)` return?", options: ["[1, 2, 3]", "[2, 4, 6]", "6", "undefined"], answer: 1, explain: "map returns a new array with each element transformed." },
      { q: "What is a closure?", options: ["A syntax error", "A function that retains access to variables from its enclosing scope", "A way to close the browser", "A loop"], answer: 1, explain: "Closures capture the lexical environment where the function was created." },
      { q: "What does `Promise.all` do if one promise rejects?", options: ["Ignores it", "Rejects immediately with that reason", "Waits and resolves anyway", "Retries it"], answer: 1, explain: "Promise.all rejects as soon as any input promise rejects. Use Promise.allSettled to wait for all." },
      { q: "In the event loop, which runs first after the current task: a resolved promise callback or a setTimeout(fn, 0) callback?", options: ["setTimeout", "The promise callback (microtask)", "They run at the same time", "Neither runs"], answer: 1, explain: "Microtasks (promises) run before the next macrotask (timers)." },
      { q: "What does the spread syntax `{...a, ...b}` do when both have the same key?", options: ["Throws an error", "The value from b wins", "The value from a wins", "Creates an array"], answer: 1, explain: "Later spreads overwrite earlier keys." },
      { q: "What is `this` inside an arrow function?", options: ["Always the global object", "Lexically inherited from the surrounding scope", "The arrow function itself", "undefined always"], answer: 1, explain: "Arrow functions don't bind their own this." },
      { q: "Which method creates a shallow copy of an array?", options: ["arr.copy()", "arr.slice()", "arr.clone()", "arr.dup()"], answer: 1, explain: "slice() with no arguments (or [...arr]) makes a shallow copy." },
    ],
  },
  {
    id: "sql-basics",
    title: "SQL Basics",
    description: "Essential SQL for analysts, engineers and data-curious roles.",
    category: "Technical",
    minutes: 10,
    questions: [
      { q: "Which clause filters rows before grouping?", options: ["HAVING", "WHERE", "ORDER BY", "LIMIT"], answer: 1, explain: "WHERE filters rows; HAVING filters groups after GROUP BY." },
      { q: "What does a LEFT JOIN return?", options: ["Only matching rows", "All rows from the left table, plus matches from the right", "All rows from the right table", "A cartesian product"], answer: 1, explain: "Unmatched right-side columns are NULL." },
      { q: "Which function counts non-NULL values in a column?", options: ["COUNT(*)", "COUNT(column)", "SUM(column)", "LEN(column)"], answer: 1, explain: "COUNT(column) ignores NULLs; COUNT(*) counts all rows." },
      { q: "How do you remove duplicate rows in a result?", options: ["UNIQUE", "DISTINCT", "DEDUPE", "ONLY"], answer: 1, explain: "SELECT DISTINCT removes duplicate rows." },
      { q: "What is a primary key?", options: ["Any indexed column", "A column (or set) that uniquely identifies each row", "The first column", "A foreign key"], answer: 1, explain: "Primary keys are unique and not null." },
      { q: "Which query finds the number of orders per customer?", options: ["SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id", "SELECT COUNT(customer_id) FROM orders", "SELECT * FROM orders ORDER BY customer_id", "SELECT DISTINCT COUNT(*) FROM orders"], answer: 0, explain: "GROUP BY customer_id with COUNT(*) aggregates per customer." },
      { q: "What does `NULL = NULL` evaluate to in SQL?", options: ["TRUE", "FALSE", "UNKNOWN (NULL)", "An error"], answer: 2, explain: "Comparisons with NULL are unknown; use IS NULL." },
      { q: "What's a window function used for?", options: ["Creating tables", "Calculations across related rows without collapsing them", "Deleting rows", "Opening a new window"], answer: 1, explain: "e.g., ROW_NUMBER() OVER (PARTITION BY …) keeps each row." },
      { q: "What does an index primarily improve?", options: ["Storage size", "Read/query performance on indexed columns", "Security", "Data accuracy"], answer: 1, explain: "Indexes speed up lookups at some cost to writes and storage." },
      { q: "Which statement changes existing rows?", options: ["INSERT", "UPDATE", "ALTER", "CREATE"], answer: 1, explain: "UPDATE modifies rows; ALTER changes table structure." },
    ],
  },
  {
    id: "system-design-basics",
    title: "System Design Basics",
    description: "Foundational concepts for system design interviews.",
    category: "Technical",
    minutes: 10,
    questions: [
      { q: "What does horizontal scaling mean?", options: ["Buying a bigger server", "Adding more machines to share the load", "Adding more RAM", "Rewriting in a faster language"], answer: 1, explain: "Horizontal = more machines; vertical = bigger machine." },
      { q: "What is the main purpose of a cache?", options: ["Permanent storage", "Serve frequently accessed data faster", "Encrypt data", "Replace the database"], answer: 1, explain: "Caches reduce latency and load on slower backends." },
      { q: "What does a load balancer do?", options: ["Stores backups", "Distributes incoming traffic across servers", "Compresses images", "Manages DNS registration"], answer: 1, explain: "It spreads requests to improve availability and throughput." },
      { q: "In the CAP theorem, during a network partition you must choose between…", options: ["Cost and performance", "Consistency and availability", "Caching and persistence", "Security and speed"], answer: 1, explain: "Under partition, a system favors either consistency or availability." },
      { q: "What is a CDN mainly used for?", options: ["Running SQL", "Serving static content from locations near users", "Sending emails", "Authentication"], answer: 1, explain: "CDNs cache content at edge locations to cut latency." },
      { q: "Why use a message queue?", options: ["To make everything synchronous", "To decouple services and handle work asynchronously", "To store passwords", "To replace APIs entirely"], answer: 1, explain: "Queues buffer work, smooth spikes and decouple producers from consumers." },
      { q: "What is database sharding?", options: ["Deleting old data", "Splitting data across multiple databases by a key", "Encrypting the database", "Taking a backup"], answer: 1, explain: "Sharding partitions data horizontally to scale writes and storage." },
      { q: "What does 'idempotent' mean for an API operation?", options: ["It's very fast", "Repeating it has the same effect as doing it once", "It requires authentication", "It can't fail"], answer: 1, explain: "Idempotency makes retries safe." },
      { q: "What's a good first step in a system design interview?", options: ["Draw the database schema", "Clarify requirements and constraints", "Pick a programming language", "Estimate cost"], answer: 1, explain: "Requirements (functional and non-functional) drive every later decision." },
      { q: "What is rate limiting?", options: ["Limiting data size", "Restricting how many requests a client can make in a time window", "Slowing down the database", "Pricing tiers"], answer: 1, explain: "Rate limiting protects services from abuse and overload." },
    ],
  },
  {
    id: "product-sense",
    title: "Product Sense & Metrics",
    description: "For PMs and anyone who works closely with product teams.",
    category: "Business",
    minutes: 8,
    questions: [
      { q: "What is a North Star metric?", options: ["The company's revenue target", "A single metric that best captures the value users get from the product", "A vanity metric", "The number of features shipped"], answer: 1, explain: "It aligns teams around delivering core user value." },
      { q: "What's a 'guardrail' metric?", options: ["A metric you're trying to maximize", "A metric you watch to make sure a change doesn't cause harm", "A security metric", "A revenue metric"], answer: 1, explain: "Guardrails catch unintended negative effects." },
      { q: "In RICE prioritization, what does the 'C' stand for?", options: ["Cost", "Confidence", "Customers", "Complexity"], answer: 1, explain: "Reach, Impact, Confidence, Effort." },
      { q: "What is an MVP?", options: ["The most valuable player", "The smallest product that lets you test your key hypothesis with real users", "The final product", "A marketing plan"], answer: 1, explain: "Minimum Viable Product — learn fast with minimal build." },
      { q: "Retention measures…", options: ["How many users sign up", "How many users keep coming back over time", "Revenue per user", "Server uptime"], answer: 1, explain: "Retention shows whether users find ongoing value." },
      { q: "A stakeholder demands a feature. What should a PM do first?", options: ["Build it", "Understand the underlying problem and evidence", "Refuse", "Escalate to the CEO"], answer: 1, explain: "Solve the real problem, which may need a different solution." },
      { q: "What's a vanity metric?", options: ["A metric that looks good but doesn't guide decisions", "A privacy metric", "A design metric", "A cost metric"], answer: 0, explain: "E.g., total downloads without activity data." },
      { q: "What does 'activation' usually mean?", options: ["Account creation", "A user reaching the first moment of real value", "Payment", "App installation"], answer: 1, explain: "Activation is the 'aha' moment that predicts retention." },
      { q: "Which is the best way to validate a new idea cheaply?", options: ["Build the full product", "User interviews, prototypes or a landing-page test", "Wait for competitors", "Ask only internal staff"], answer: 1, explain: "Cheap experiments reduce risk before investing heavily." },
      { q: "What is churn?", options: ["New user growth", "The rate at which customers stop using or paying", "Server errors", "Feature adoption"], answer: 1, explain: "Churn is the inverse of retention." },
    ],
  },
  {
    id: "data-statistics",
    title: "Data & Statistics Essentials",
    description: "Stats concepts that come up in analytics and data interviews.",
    category: "Technical",
    minutes: 9,
    questions: [
      { q: "The median of [3, 7, 9, 12, 100] is…", options: ["26.2", "9", "7", "100"], answer: 1, explain: "The middle value of the sorted list." },
      { q: "Which is more robust to outliers?", options: ["Mean", "Median", "Range", "Sum"], answer: 1, explain: "The median barely moves when an extreme value is added." },
      { q: "A p-value of 0.03 in a test with α = 0.05 means…", options: ["The effect is definitely real", "The result is statistically significant at the 5% level", "There's a 3% chance the hypothesis is true", "The test failed"], answer: 1, explain: "p < α, so we reject the null at that significance level — it doesn't prove the effect." },
      { q: "Correlation of −0.9 indicates…", options: ["No relationship", "A strong negative linear relationship", "A weak positive relationship", "Causation"], answer: 1, explain: "As one rises the other falls, strongly and linearly." },
      { q: "In an A/B test, why randomize users?", options: ["To save money", "To make groups comparable so differences can be attributed to the change", "To increase sample size", "It isn't necessary"], answer: 1, explain: "Randomization removes systematic bias between groups." },
      { q: "What is a Type I error?", options: ["Missing a real effect", "A false positive — rejecting a true null hypothesis", "A data entry error", "A coding bug"], answer: 1, explain: "Type II is the false negative." },
      { q: "Increasing sample size generally…", options: ["Increases variance of the estimate", "Increases statistical power", "Has no effect", "Guarantees significance"], answer: 1, explain: "Larger samples make it easier to detect real effects." },
      { q: "Simpson's paradox describes…", options: ["A formula for averages", "A trend that appears in groups but reverses when groups are combined", "A sampling method", "A chart type"], answer: 1, explain: "Always check segments and confounders." },
      { q: "Which chart best shows a trend over time?", options: ["Pie chart", "Line chart", "Scatter of categories", "Word cloud"], answer: 1, explain: "Line charts show change across a continuous axis." },
      { q: "What's a confounding variable?", options: ["A variable you control", "A third variable that influences both the cause and the effect", "A typo in data", "The dependent variable"], answer: 1, explain: "Confounders can create misleading correlations." },
    ],
  },
  {
    id: "workplace-communication",
    title: "Workplace Communication & Judgment",
    description: "Situational judgment for any role.",
    category: "Business",
    minutes: 7,
    questions: [
      { q: "You realize you'll miss a deadline next week. Best action?", options: ["Say nothing and hope", "Tell stakeholders now, with options and a new plan", "Blame another team", "Work all night without telling anyone"], answer: 1, explain: "Early, solution-focused communication maintains trust." },
      { q: "A colleague gives you harsh feedback in a meeting. What's the best first response?", options: ["Argue back immediately", "Thank them and ask to discuss details afterwards", "Ignore it", "Complain to HR right away"], answer: 1, explain: "Staying calm and moving the detail offline de-escalates." },
      { q: "What's the best structure for an update email to a busy executive?", options: ["Long background first", "Bottom line first, then key details and any ask", "Only attachments", "A list of every task"], answer: 1, explain: "Lead with the conclusion (BLUF)." },
      { q: "Two teammates are in conflict and it's affecting work. As a peer, you should…", options: ["Take sides", "Encourage a direct conversation or involve the manager if needed", "Gossip about it", "Do their work for them"], answer: 1, explain: "Facilitate resolution without becoming part of the conflict." },
      { q: "You're asked to do a task outside your expertise. Best approach?", options: ["Refuse", "Accept, clarify expectations, and learn or ask for help", "Pretend you know it", "Delegate it without telling anyone"], answer: 1, explain: "Resourcefulness and honesty about gaps build credibility." },
      { q: "What is active listening?", options: ["Waiting for your turn to speak", "Fully focusing, reflecting back and asking clarifying questions", "Taking notes only", "Nodding constantly"], answer: 1, explain: "It shows understanding and prevents miscommunication." },
      { q: "When should you escalate an issue?", options: ["Never", "When it's beyond your authority or risks a significant impact and you've tried to resolve it", "For every small problem", "Only after it's too late"], answer: 1, explain: "Escalate thoughtfully, with context and a proposed solution." },
      { q: "How should you disagree with your manager?", options: ["Publicly in a team meeting", "Privately, with reasoning and data, then commit to the decision", "By ignoring the decision", "By going over their head immediately"], answer: 1, explain: "Disagree and commit keeps trust and momentum." },
      { q: "Best way to handle a message that could be misread in chat?", options: ["Add more exclamation marks", "Clarify intent or suggest a quick call", "Send it in all caps", "Don't send anything ever"], answer: 1, explain: "Text loses tone; a short call can prevent confusion." },
      { q: "What's the most effective way to run a meeting?", options: ["No agenda", "Clear agenda, owner, decisions and action items", "Invite everyone", "Make it as long as possible"], answer: 1, explain: "Structure makes meetings shorter and more useful." },
    ],
  },
]

export function getQuiz(id: string) {
  return QUIZZES.find((q) => q.id === id)
}

/** sessionStorage key holding an AI-generated quiz between the generator and the runner. */
export const AI_QUIZ_KEY = "applyo:ai-quiz"
/** localStorage key with best scores per quiz id. */
export const QUIZ_BEST_KEY = "applyo:quiz-best"
