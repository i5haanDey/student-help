import OpenAI from "openai"

export interface AiSolveResponse {
  text: string
  confidenceLevel: "high" | "medium" | "low"
  subjectDetected: string
}

export interface AiExplainResponse {
  mode: string
  content: string
}

export interface AiPracticeQuestion {
  id: string
  type: "easy" | "medium" | "advanced"
  question: string
  options: string[]
  answer: string
  explanation: string
}

const mockResponses: Record<string, AiSolveResponse> = {
  calculus: {
    text: "The derivative of x² is 2x. This comes from the power rule: d/dx(xⁿ) = nxⁿ⁻¹. So d/dx(x²) = 2x²⁻¹ = 2x.",
    confidenceLevel: "high",
    subjectDetected: "Mathematics - Calculus",
  },
  physics: {
    text: "Newton's Second Law states F = ma (Force = mass × acceleration). This means the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.",
    confidenceLevel: "high",
    subjectDetected: "Physics - Mechanics",
  },
  chemistry: {
    text: "In a balanced chemical equation, the number of atoms of each element must be equal on both sides. For H₂ + O₂ → H₂O, you need 2H₂ + O₂ → 2H₂O.",
    confidenceLevel: "medium",
    subjectDetected: "Chemistry - Stoichiometry",
  },
  default: {
    text: "This is a placeholder AI response. The AI doubt solver will be connected to a real LLM (like DeepSeek or GPT-4o) once the app has funding. For now, this demonstrates the UI and flow of the doubt-solving feature.",
    confidenceLevel: "medium",
    subjectDetected: "General",
  },
}

const mockExplainModes: Record<string, string> = {
  simple: "Think of it like a rule: when you have x raised to a power, you bring the power down in front and reduce the power by one. So x² becomes 2x.",
  visual: "Imagine a curve on a graph. The derivative at any point is the slope of the tangent line touching that curve at that exact point. For x², the slope at x=2 is 4, at x=3 is 6, and so on.",
  analogy: "Derivatives are like a speedometer. If your position is x², then your speed at any moment is 2x. Position tells you where you are, derivative tells you how fast you're changing.",
  step_by_step: "Step 1: Identify the function f(x) = x²\nStep 2: Apply power rule: d/dx(xⁿ) = nxⁿ⁻¹\nStep 3: Here n = 2, so d/dx(x²) = 2x²⁻¹ = 2x\nStep 4: Therefore, f'(x) = 2x",
  exam_oriented: "Common exam question: Find the derivative of f(x) = 3x² + 2x + 1\nSolution: f'(x) = 6x + 2\nKey points: Remember the power rule and that derivative of constant is 0.",
}

const mockPracticeQuestions: AiPracticeQuestion[] = [
  { id: "1", type: "easy", question: "What is the derivative of x³?", options: ["3x²", "3x", "x²", "3x³"], answer: "3x²", explanation: "Using power rule: d/dx(x³) = 3x²" },
  { id: "2", type: "easy", question: "What is the derivative of 5x?", options: ["5", "x", "5x", "0"], answer: "5", explanation: "The derivative of ax is a" },
  { id: "3", type: "easy", question: "What is the derivative of a constant like 7?", options: ["7", "1", "0", "undefined"], answer: "0", explanation: "The derivative of any constant is 0" },
  { id: "4", type: "medium", question: "If f(x) = 2x² + 3x - 5, what is f'(x)?", options: ["4x + 3", "2x + 3", "4x - 5", "4x + 3 - 5"], answer: "4x + 3", explanation: "Apply power rule to each term: d/dx(2x²) = 4x, d/dx(3x) = 3, d/dx(-5) = 0" },
  { id: "5", type: "medium", question: "What is the derivative of x⁴ - 2x²?", options: ["4x³ - 4x", "4x³ - 2x", "x³ - 2x", "4x³ - 4x²"], answer: "4x³ - 4x", explanation: "d/dx(x⁴) = 4x³, d/dx(2x²) = 4x" },
  { id: "6", type: "medium", question: "Find f'(x) if f(x) = (x² + 1)(x - 2)", options: ["3x² - 4x + 1", "2x + 1", "3x² + 1", "2x² - 4"], answer: "3x² - 4x + 1", explanation: "First expand: (x²+1)(x-2) = x³ - 2x² + x - 2, then derivative = 3x² - 4x + 1" },
  { id: "7", type: "advanced", question: "If f(x) = sin(x²), what is f'(x)?", options: ["2x·cos(x²)", "cos(x²)", "2x·sin(x²)", "cos(2x)"], answer: "2x·cos(x²)", explanation: "Using chain rule: derivative of sin(u) = cos(u) · u', where u = x², u' = 2x" },
  { id: "8", type: "advanced", question: "What is the derivative of e^{2x}?", options: ["2e^{2x}", "e^{2x}", "2xe^{2x}", "e^{2}"], answer: "2e^{2x}", explanation: "Using chain rule: derivative of e^{u} = e^{u} · u', where u = 2x, u' = 2" },
]

const mockSummary = `Session Summary

Topics Covered:
1. Derivatives - Power Rule
2. Derivatives - Product Rule
3. Application Problems

Key Takeaways:
• The power rule: d/dx(xⁿ) = nxⁿ⁻¹
• The product rule: (fg)' = f'g + fg'
• Derivative represents rate of change

Student Understanding: The student showed good grasp of basic power rule but needs more practice with chain rule applications.`

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY
  if (!key || key === "" || key.startsWith("sk-") === false) return null
  return new OpenAI({ apiKey: key })
}

const SYSTEM_PROMPTS = {
  solve: `You are an expert tutor helping a student with their doubt. Respond in JSON format with these fields:
- "explanation": a clear, detailed explanation of the answer
- "confidenceLevel": one of "high", "medium", or "low" indicating how confident you are in the answer
- "subjectDetected": the academic subject detected (e.g., "Mathematics - Calculus", "Physics - Mechanics")

Keep the explanation concise but thorough. Use examples where helpful.`,

  explain: (mode: string) => {
    const prompts: Record<string, string> = {
      simple: "Explain this concept in the simplest possible language. Use everyday words. Pretend you're explaining to a 10-year-old. Be concise.",
      visual: "Explain this concept using vivid visual imagery. Describe what it would look like as a graph, diagram, or scene. Help the student picture it in their mind.",
      analogy: "Explain this concept using a real-world analogy or metaphor. Connect it to something the student already understands from daily life.",
      step_by_step: "Break this concept down into clear, numbered steps. Each step should be one logical move. Make it easy to follow sequentially.",
      exam_oriented: "Explain this concept from an exam perspective. Show how it's typically tested. Include common mistakes, time-saving tricks, and what examiners look for.",
    }
    return prompts[mode] ?? prompts.simple
  },

  practice: `You are an expert exam question creator. Generate 8 practice questions on the given subject:
- 3 Easy questions (basic recall)
- 3 Medium questions (application)
- 2 Advanced questions (complex problem-solving)

Respond in JSON format as an array of objects, each with:
- "id": a unique string like "e1", "m2", "a1"
- "type": "easy", "medium", or "advanced"
- "question": the question text
- "options": an array of 4 answer choices
- "answer": the correct answer (must match one of the options exactly)
- "explanation": a brief explanation of why the answer is correct

Make questions specific to the subject requested. Include realistic exam-style distractors in the options.`,

  summary: `You are an AI teaching assistant. Generate a structured session summary based on the session information provided.

Include:
1. Topics Covered (numbered list)
2. Key Takeaways (bullet points with key formulas, concepts, or rules)
3. Student Understanding Assessment (what the student understood well and what needs more practice)

Keep it clear and structured. Use markdown formatting.`,
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function detectMockKey(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes("derivative") || lower.includes("calculus") || lower.includes("integral")) return "calculus"
  if (lower.includes("force") || lower.includes("newton") || lower.includes("physics") || lower.includes("acceleration")) return "physics"
  if (lower.includes("chemical") || lower.includes("equation") || lower.includes("reaction")) return "chemistry"
  return "default"
}

export async function aiSolveDoubt(text: string, imageBase64?: string): Promise<AiSolveResponse> {
  const client = getClient()
  if (!client) {
    await delay(1500 + Math.random() * 1000)
    const key = detectMockKey(text)
    return mockResponses[key]
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPTS.solve },
  ]

  if (imageBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    })
  } else {
    messages.push({ role: "user", content: text })
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  })

  const raw = response.choices[0]?.message?.content ?? "{}"
  const parsed = JSON.parse(raw)
  return {
    text: parsed.explanation ?? parsed.text ?? "No response generated.",
    confidenceLevel: parsed.confidenceLevel ?? "medium",
    subjectDetected: parsed.subjectDetected ?? "General",
  }
}

export async function aiExplainDifferently(mode: string, doubtText: string): Promise<AiExplainResponse> {
  const client = getClient()
  if (!client) {
    await delay(1000 + Math.random() * 500)
    return { mode, content: mockExplainModes[mode] ?? mockExplainModes.simple }
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.explain(mode) },
      { role: "user", content: doubtText },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  })

  return {
    mode,
    content: response.choices[0]?.message?.content ?? "Unable to generate explanation.",
  }
}

export async function aiGeneratePractice(subject: string, context?: string): Promise<AiPracticeQuestion[]> {
  const client = getClient()
  if (!client) {
    await delay(2000 + Math.random() * 1000)
    return mockPracticeQuestions
  }

  const userPrompt = `Subject: ${subject}${context ? `\nContext from session: ${context}` : ""}`

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.practice },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 3000,
  })

  const raw = response.choices[0]?.message?.content ?? "[]"
  const parsed = JSON.parse(raw)
  const questions = Array.isArray(parsed) ? parsed : parsed.questions ?? []
  return questions.map((q: AiPracticeQuestion, i: number) => ({
    id: q.id ?? String(i + 1),
    type: q.type ?? "medium",
    question: q.question,
    options: q.options ?? [],
    answer: q.answer,
    explanation: q.explanation ?? "",
  }))
}

export async function aiGenerateSummary(subject: string, topics?: string[], transcript?: string): Promise<string> {
  const client = getClient()
  if (!client) {
    await delay(3000)
    return mockSummary
  }

  const contextParts: string[] = []
  if (subject) contextParts.push(`Subject: ${subject}`)
  if (topics?.length) contextParts.push(`Topics covered: ${topics.join(", ")}`)
  if (transcript) contextParts.push(`Transcript:\n${transcript.slice(0, 4000)}`)

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.summary },
      { role: "user", content: contextParts.join("\n\n") || "Generate a general session summary." },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  })

  return response.choices[0]?.message?.content ?? mockSummary
}
