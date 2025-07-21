import jsPDF from "jspdf"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer?: string
}

interface Activity {
  id: string
  name: string
  grade: string
  subject: string
  theme: string
  objective: string
  questions: Question[]
  text?: string // Added text property
}

export async function generatePDF(activity: Activity) {
  const pdf = new jsPDF()

  // Set font
  pdf.setFont("helvetica")

  // Title
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.text("ATIVIDADE", 20, 30)

  // Espaço para o nome do aluno
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  

  // Activity Information
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")

  let yPosition = 48
  const lineHeight = 8

  // Activity details
  const details = [
    `Série: ${activity.grade}`,
    `Disciplina: ${activity.subject}`,
  ]

  pdf.text("Nome do Aluno: ___________________________", 20, 40)

  details.forEach((detail) => {
    // Handle long text wrapping
    const lines = pdf.splitTextToSize(detail, 170)
    lines.forEach((line: string) => {
      pdf.text(line, 20, yPosition)
      yPosition += lineHeight
    })
  })

  // Questions section
  yPosition += 10
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("QUESTÕES", 20, yPosition)
  yPosition += 15

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")

  // Renderizar o texto Markdown das questões
  if (activity.text) {
    // Remove linhas de gabarito
    let lines = activity.text
      .split('\n')
      .filter(line => !line.trim().toLowerCase().startsWith('**gabarito:'));
    // Remove tudo antes da primeira questão (linha que começa com '1.')
    const firstQuestionIdx = lines.findIndex(line => line.trim().match(/^1\./));
    if (firstQuestionIdx !== -1) {
      lines = lines.slice(firstQuestionIdx);
    }
    const textSomenteQuestoes = lines.join('\n');
    // Remove todos os '**' e traços '-' do início das alternativas
    let textoLimpo = textSomenteQuestoes
      .replace(/\*\*/g, '') // remove todos os **
      .replace(/^\s*-\s*(\([a-d]\))/gm, '$1'); // remove traço do início das alternativas
    // Quebra o texto em linhas para evitar overflow
    const markdownLines = pdf.splitTextToSize(textoLimpo, 170)
    markdownLines.forEach((line: string) => {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 30
      }
      pdf.text(line, 20, yPosition)
      yPosition += lineHeight
    })
    yPosition += 10
  }

  // Footer
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text("AtivIA © 202X. All rights reserved.", 20, 280)
    pdf.text(`Página ${i} de ${pageCount}`, 170, 280)
  }

  // Download the PDF
  pdf.save(`${activity.name.replace(/\s+/g, "_")}.pdf`)
}
