import type { NextRequest } from "next/server"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google" // Importar do @ai-sdk/google
import { z } from "zod"

const ActivitySchema = z.object({
  name: z.string().describe("Nome da atividade"),
  questions: z
    .array(
      z.object({
        id: z.number().describe("ID da questão"),
        question: z.string().describe("Texto da pergunta"),
        options: z.array(z.string()).describe("Alternativas para a questão"),
        correctAnswer: z.number().describe("Índice da resposta correta (0-N)"),
      }),
    )
    .describe("Lista de questões geradas"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { theme, objective, grade, activityType, questionCount } = body

    // Validate required fields
    if (!theme || !grade || !activityType || !questionCount) {
      return Response.json(
        { error: "Campos obrigatórios: tema, série, tipo de atividade e quantidade de questões" },
        { status: 400 },
      )
    }

    const prompt = `
Você é um assistente especializado em criar atividades pedagógicas para professores.
Crie uma atividade de "${activityType}" sobre o tema "${theme}" para alunos do "${grade}".

${objective ? `Objetivo da atividade: ${objective}` : ""}

Instruções específicas:
- Gere exatamente ${questionCount} questões.
- Para "múltipla escolha", cada questão deve ter 5 alternativas (A, B, C, D, E).
- Para "verdadeiro ou falso", cada questão deve ter 2 alternativas ("Verdadeiro", "Falso").
- Para "completar lacunas", forneça a frase com a lacuna e as opções para preencher.
- Para "dissertativa", forneça apenas a pergunta.
- As questões devem ser adequadas ao nível educacional especificado.
- Varie a dificuldade das questões (fácil, médio, difícil).
- Use linguagem clara e apropriada para a faixa etária.
- As alternativas incorretas devem ser plausíveis mas claramente erradas.
- Baseie-se no currículo brasileiro (BNCC).

Para o nome da atividade, crie um título atrativo e educativo relacionado ao tema.
`

    const result = await generateObject({
      model: google("gemini-2.0-flash"), // Usando o modelo Gemini
      schema: ActivitySchema,
      prompt: prompt,
    })

    // Generate unique ID for the activity
    const activityId = Date.now().toString()

    const activity = {
      id: activityId,
      name: result.object.name || `${theme} - ${grade}`, // Use o nome gerado pela IA ou um fallback
      theme,
      grade,
      subject: getSubjectFromTheme(theme),
      objective: objective || `Avaliar conhecimentos sobre ${theme}`,
      activityType,
      questions: result.object.questions.map((q, index) => ({
        ...q,
        id: index + 1, // Ensure unique IDs for questions
      })),
      createdAt: new Date().toISOString(),
    }

    return Response.json({
      success: true,
      activity,
    })
  } catch (error) {
    console.error("Error generating activity:", error)
    // Check if it's an API key error for Google
    if (error instanceof Error && error.message.includes("API key")) {
      return Response.json(
        {
          error:
            "Erro na chave da API do Gemini. Por favor, verifique se sua variável de ambiente GOOGLE_API_KEY está configurada corretamente.",
        },
        { status: 500 },
      )
    }
    return Response.json({ error: "Erro interno do servidor. Tente novamente." }, { status: 500 })
  }
}

function getSubjectFromTheme(theme: string): string {
  const themeMap: { [key: string]: string } = {
    fotossíntese: "Biologia",
    "revolução francesa": "História",
    multiplicação: "Matemática",
    "sistema solar": "Ciências",
    verbos: "Português",
    células: "Biologia",
    "segunda guerra": "História",
    frações: "Matemática",
    água: "Ciências",
    literatura: "Português",
  }

  const lowerTheme = theme.toLowerCase()
  for (const [key, subject] of Object.entries(themeMap)) {
    if (lowerTheme.includes(key)) {
      return subject
    }
  }

  return "Geral"
}
