export interface GuideChapter {
  slug: string
  title: string
  summary: string
  minutes: number
  body: string
  checklist: string[]
  practice?: { label: string; href: string }
}

export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    slug: "how-interviews-work",
    title: "How hiring processes work",
    summary: "The stages you'll go through and what each one is testing.",
    minutes: 4,
    body: `
Most hiring processes follow a similar funnel. Knowing what each stage is for helps you prepare the right way.

## 1. Recruiter screen (15–30 min)

A phone or video call to check basics: your background, interest, location, work authorization and salary expectations. **Goal:** be clear, enthusiastic and concise. Have your "tell me about yourself" ready.

## 2. Hiring manager interview (30–60 min)

The manager wants to know if you can do the job and if they'd enjoy working with you. Expect questions about your experience, how you work, and why this role.

## 3. Skills assessment

Depending on the role: a coding interview, case study, take-home assignment, portfolio review, writing test or presentation. This is where you prove the skills on your resume.

## 4. Team or panel interviews (onsite or virtual)

Several interviews in a row with peers, cross-functional partners and leaders. Often includes behavioral interviews focused on specific competencies.

## 5. Final conversations and references

Sometimes a chat with a senior leader, followed by reference checks.

## 6. Offer and negotiation

You receive a verbal then written offer. This is the best moment to negotiate.

## One-way video interviews

Some companies add an automated recorded interview early on. You'll get a question on screen, time to think, and a fixed recording time. Practice these specifically — they feel very different.
`,
    checklist: [
      "Ask the recruiter what the interview stages are",
      "Ask who you'll meet at each stage",
      "Know what skills each stage is testing",
    ],
  },
  {
    slug: "research",
    title: "Research like an insider",
    summary: "What to learn about the company, role and interviewers — and where to find it.",
    minutes: 5,
    body: `
Research turns generic answers into specific ones. Interviewers notice immediately when a candidate has done their homework.

## The company

- **What they sell and to whom.** Can you explain their product in one sentence?
- **How they make money** and who their competitors are.
- **Recent news:** launches, funding, leadership changes, acquisitions.
- **Mission and values** — and examples of them in action.

Sources: the company website, product pages, blog, press releases, earnings calls (for public companies), employee reviews and LinkedIn.

## The role

Break the job description into three lists:

1. **Must-have skills** (usually listed first or repeated)
2. **Outcomes** the role is responsible for
3. **Challenges** hinted at ("fast-paced", "build from scratch", "scale")

For each must-have, write down one story from your experience that proves it.

## The interviewers

Look them up on LinkedIn. Their role tells you what they care about: engineers want technical depth, managers want ownership and reliability, executives want impact and judgment.

## Turn research into ammunition

- One sentence about why this company, specifically
- Two or three examples connecting your experience to their needs
- Three thoughtful questions to ask

Tip: paste the job link into your Job Tracker to extract the skills, requirements and responsibilities automatically.
`,
    checklist: [
      "Explain the company's product in one sentence",
      "List the top 5 requirements and a story for each",
      "Look up every interviewer",
      "Write down 3 questions to ask",
    ],
    practice: { label: "Parse the job in Job Tracker", href: "/dashboard/job-tracker" },
  },
  {
    slug: "your-pitch",
    title: "Your pitch: “Tell me about yourself”",
    summary: "Build a 60–90 second answer that sets up the whole interview.",
    minutes: 4,
    body: `
This question almost always comes first, and your answer frames everything after it.

## The formula: present → past → future

- **Present:** your current role and a standout result.
- **Past:** the experience that led you here — focus on what's relevant to this job.
- **Future:** why you're excited about *this* role.

## Example

"I'm a customer success manager at a SaaS company, where I manage a portfolio of 40 mid-market accounts — last year I cut churn in my book by a third. Before that I spent three years in support, which is where I learned to turn frustrated customers into advocates. I'm excited about this role because you're building a success team from the ground up, and designing those playbooks is exactly what I want to do next."

## Rules

1. Keep it under 90 seconds.
2. Don't recite your resume line by line.
3. End by connecting to the role — it invites the next question.
4. Practice until it sounds natural, not memorized.
`,
    checklist: ["Write present / past / future bullet points", "Record yourself saying it", "Trim it to under 90 seconds"],
    practice: { label: "Practice it on video", href: "/dashboard/interview/video" },
  },
  {
    slug: "star-method",
    title: "The STAR method & your story bank",
    summary: "Structure behavioral answers so they're easy to follow and score.",
    minutes: 6,
    body: `
Behavioral questions ask about real past situations. The STAR method gives every answer a clear shape.

## STAR

- **Situation** — the context, in one or two sentences.
- **Task** — what you were responsible for.
- **Action** — what *you* did. Spend most of your time here.
- **Result** — what happened, with numbers if possible, and what you learned.

## Build a story bank

Prepare 8–10 stories covering:

- A big achievement
- A failure or mistake
- A conflict with a colleague
- Leading or influencing others
- A tight deadline or high pressure
- Solving a hard problem
- Handling a difficult customer or stakeholder
- Learning something quickly
- Disagreeing with your manager
- Going above and beyond

Tag each story with the competencies it shows (leadership, teamwork, problem-solving…). One strong story can answer several questions.

## Common mistakes

- Too much background, not enough action
- Saying "we" so much your role disappears
- No result
- Rambling past two minutes
`,
    checklist: ["Write 8 stories in STAR format", "Tag each story with 2–3 competencies", "Add a number to every Result"],
    practice: { label: "Practice behavioral questions", href: "/dashboard/interview/practice?category=behavioral" },
  },
  {
    slug: "question-types",
    title: "Question types and how to answer them",
    summary: "General, behavioral, situational, technical and tricky questions.",
    minutes: 5,
    body: `
## General / fit questions

"Why this company?" "Why this role?" "What are your strengths?" — show research and alignment. Be specific.

## Behavioral questions

"Tell me about a time…" — use STAR and a story from your bank.

## Situational questions

"What would you do if…" — walk through your reasoning step by step: clarify, consider options, decide, communicate. If you've faced something similar, mention it.

## Technical / skills questions

Explain your thinking out loud. If you don't know, say what you do know and how you'd find the answer.

## Tricky questions

- **Weakness:** real, not critical, with an improvement story.
- **Gaps:** brief and honest, then move forward.
- **Salary:** ask for their range, or give a researched range.
- **Why leaving:** focus on what you're moving toward.

## Buying time

It's always fine to say "That's a great question — let me think for a moment." A thoughtful pause beats a rushed answer.
`,
    checklist: ["Prepare an answer for each tricky question", "Practice thinking out loud on one problem", "Prepare your salary range"],
    practice: { label: "Open the question bank", href: "/dashboard/interview/practice" },
  },
  {
    slug: "technical-and-case",
    title: "Technical, case & take-home interviews",
    summary: "How to show your skills live — and what interviewers actually grade.",
    minutes: 5,
    body: `
Skills interviews test how you think as much as whether you get the right answer.

## The universal approach

1. **Clarify** the problem and constraints. Ask questions.
2. **Work an example** to confirm understanding.
3. **Outline an approach** before diving in; mention trade-offs.
4. **Execute** — code, calculate or sketch — while narrating.
5. **Check** your work with edge cases or a sanity check.
6. **Summarize** what you'd improve with more time.

## Coding interviews

Practice common patterns (hash maps, two pointers, BFS/DFS, dynamic programming). Write readable code with good names. Test with edge cases.

## System design

Start with requirements (functional and scale), then API, data model, architecture, and bottlenecks. There's no single right answer — justify your trade-offs.

## Case interviews

Structure the problem (e.g., revenue = price × volume), state assumptions, do the math out loud, and finish with a recommendation.

## Take-home assignments

Clarify time expectations, prioritize a working core over extras, document assumptions, and prepare to walk through your decisions.
`,
    checklist: ["Take the technical skill tests", "Do one timed practice problem out loud", "Prepare a structure for case questions"],
    practice: { label: "Take a skill test", href: "/dashboard/interview/tests" },
  },
  {
    slug: "video-interviews",
    title: "Video & phone interviews",
    summary: "Setup, delivery and one-way recorded interviews.",
    minutes: 4,
    body: `
## Setup

- Camera at eye level, face well-lit from the front
- Good audio (earphones with a mic beat laptop speakers)
- Neutral background, notifications off
- Test the platform the day before

## Delivery

- Look at the camera for key points
- Slow down slightly; pause before answering
- Smile and nod while listening
- Keep a sticky note of key points near the camera

## One-way recorded interviews

You'll typically get 30–60 seconds to prepare and 1–3 minutes to answer, sometimes with one retake.

- Use prep time to choose a story and jot STAR notes
- Open with a one-sentence direct answer
- Watch the timer and land your result before it runs out

## Phone interviews

Stand up or smile while speaking — it changes your voice. Have your resume and notes in front of you.
`,
    checklist: ["Test camera, lighting and mic", "Do a full mock video interview", "Review your pace and filler words"],
    practice: { label: "Start a video mock interview", href: "/dashboard/interview/video" },
  },
  {
    slug: "communication",
    title: "Body language & communication",
    summary: "Small delivery habits that make a big difference.",
    minutes: 3,
    body: `
## Voice

- **Pace:** around 130–160 words per minute is comfortable to follow.
- **Filler words:** "um", "like", "you know" are normal, but many of them distract. Replace them with a short pause.
- **Energy:** vary your tone; enthusiasm is contagious.

## Body language

- Sit up, lean slightly forward, keep your hands visible
- Natural eye contact (or camera contact on video)
- Avoid fidgeting with pens or hair

## Structure

Start with a headline answer, then support it. "Yes — I've led three migrations. The biggest was…" Interviewers love answers that are easy to follow.

## Listening

Answer the question that was asked. If it's unclear, ask for clarification.
`,
    checklist: ["Check your words-per-minute in a video practice", "Count your filler words", "Practice headline-first answers"],
    practice: { label: "Measure your pace on video", href: "/dashboard/interview/video" },
  },
  {
    slug: "questions-to-ask",
    title: "Questions to ask the interviewer",
    summary: "End strong with questions that show curiosity and help you decide.",
    minutes: 3,
    body: `
Always have questions. Choose two or three based on who you're talking to.

## For the hiring manager

- What does success look like in the first 90 days?
- What are the biggest challenges for this role?
- How do you support your team's growth?

## For peers

- What does a typical week look like?
- How does the team collaborate and share feedback?

## For leaders

- What are the company's priorities this year?
- How does this team contribute to them?

## Closing

- Is there anything about my background that gives you pause?
- What are the next steps?

Avoid questions easily answered by the website, and save salary for when they raise it or at offer stage.
`,
    checklist: ["Pick 3 questions per interviewer", "Prepare a closing question"],
  },
  {
    slug: "after-the-interview",
    title: "After the interview: follow-up, offers & negotiation",
    summary: "Thank-you notes, following up, evaluating and negotiating offers.",
    minutes: 5,
    body: `
## Within 24 hours

Send a short, specific thank-you email to each interviewer, referencing something you discussed.

## Reflect

Write down every question you were asked and how you answered. Note what went well and what to improve. This is gold for the next interview.

## Following up

If you haven't heard back by the date they gave, send one polite check-in. Then keep applying elsewhere — never pause your search for one opportunity.

## Handling rejection

Reply graciously and ask for feedback. Many people are hired later for another role.

## When the offer arrives

1. Thank them and ask for time to review.
2. Evaluate the whole package: base, bonus, equity, benefits, flexibility, growth.
3. Research the market rate.
4. Counter with a specific number backed by research and your value.
5. Get the final offer in writing before resigning.
`,
    checklist: ["Send thank-you emails", "Log the interview in your Job Tracker", "Research salary before the offer stage"],
    practice: { label: "Take the negotiation quiz", href: "/dashboard/interview/tests/salary-negotiation" },
  },
]
