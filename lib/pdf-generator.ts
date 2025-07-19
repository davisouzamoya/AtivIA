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
}

export async function generatePDF(activity: Activity) {
  const pdf = new jsPDF()

  // Set font
  pdf.setFont("helvetica")

  // Title
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.text("ATIVIDADE", 20, 30)

  // Activity Information
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")

  let yPosition = 50
  const lineHeight = 8

  // Activity details
  const details = [
    `Nome: ${activity.name}`,
    `Série: ${activity.grade}`,
    `Disciplina: ${activity.subject}`,
    `Tema: ${activity.theme}`,
    `Objetivo: ${activity.objective}`,
  ]

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

  activity.questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 30
    }

    // Question text
    pdf.setFont("helvetica", "bold")
    const questionText = `${index + 1}. ${question.question}`
    const questionLines = pdf.splitTextToSize(questionText, 170)

    questionLines.forEach((line: string) => {
      pdf.text(line, 20, yPosition)
      yPosition += lineHeight
    })

    yPosition += 5

    // Options
    pdf.setFont("helvetica", "normal")
    question.options.forEach((option, optionIndex) => {
      const optionText = `${String.fromCharCode(65 + optionIndex)}) ${option}`
      const optionLines = pdf.splitTextToSize(optionText, 160)

      optionLines.forEach((line: string) => {
        pdf.text(line, 30, yPosition)
        yPosition += lineHeight
      })
    })

    yPosition += 10
  })

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
