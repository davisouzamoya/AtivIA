"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit, Download } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { generatePDF } from "@/lib/pdf-generator"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

interface Activity {
  id: string
  name: string
  grade: string
  subject: string
  theme: string
  objective: string
  questions: Question[]
  activityType: string
}

export function EditActivity({ activityId }: { activityId: string }) {
  const router = useRouter()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [exportFormat, setExportFormat] = useState("pdf")

  useEffect(() => {
    // Load activity from localStorage
    const storedActivities = localStorage.getItem("userActivities")
    if (storedActivities) {
      const activities = JSON.parse(storedActivities)
      const foundActivity = activities.find((act: Activity) => act.id === activityId)
      if (foundActivity) {
        setActivity(foundActivity)
      }
    }

    // Check user session and redirect if not logged in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
      }
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [activityId, router])

  const handleExport = async () => {
    if (!activity) return

    if (exportFormat === "pdf") {
      await generatePDF(activity)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Atividade não encontrada.</p>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="text-gray-600 text-sm font-bold">AtivIA</span>
            </div>
          </div>
          <Button variant="outline" className="text-blue-600 border-blue-600 bg-transparent" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-white">
          <CardContent className="p-8">
            {/* Activity Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Atividade</h1>
              <div className="flex items-center gap-2">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">Exportar</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Activity Information */}
            <div className="space-y-4 mb-8">
              <div>
                <span className="font-semibold text-gray-900">Nome: </span>
                <span className="text-gray-700">{activity.name}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Série: </span>
                <span className="text-gray-700">{activity.grade}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Disciplina: </span>
                <span className="text-gray-700">{activity.subject}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Tema: </span>
                <span className="text-gray-700">{activity.theme}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Tipo: </span>
                <span className="text-gray-700">{activity.activityType}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Objetivo: </span>
                <span className="text-gray-700">{activity.objective}</span>
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Questões</h2>

              <div className="space-y-8">
                {activity.questions.map((question, index) => (
                  <div key={question.id} className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {index + 1}. {question.question}
                      </h3>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 ml-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`text-gray-700 ${
                            optionIndex === question.correctAnswer ? "font-medium text-green-700" : ""
                          }`}
                        >
                          {activity.activityType === "verdadeiro ou falso" ? (
                            <span className="font-medium">{option}</span>
                          ) : (
                            <>
                              <span className="font-medium">{String.fromCharCode(65 + optionIndex)})</span>
                              <span className="ml-2">{option}</span>
                            </>
                          )}
                          {optionIndex === question.correctAnswer && (
                            <span className="ml-2 text-green-600 text-sm">✓ Correta</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-600 text-white text-center py-4 mt-12">
        <p className="text-sm">AtivIA © 202X. All rights reserved.</p>
      </footer>
    </div>
  )
}
