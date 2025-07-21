"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Edit, Download } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { generatePDF } from "@/lib/pdf-generator"
import { supabase } from "@/lib/supabase"
import { getActivityById, updateActivity } from "@/lib/activities"
import { useRouter } from "next/navigation"
import type { Activity } from "@/types/database"
import ReactMarkdown from "react-markdown"

export function EditActivity({ activityId }: { activityId: string }) {
  const router = useRouter()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [exportFormat, setExportFormat] = useState("pdf")
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState("")
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const loadActivity = async () => {
      try {
        console.log("Carregando atividade com ID:", activityId)
        
        // Check user session and redirect if not logged in
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          console.log("Usuário não autenticado, redirecionando para login")
          router.push("/login")
          return
        }

        console.log("Usuário autenticado:", user.id)

        // Teste: verificar se a tabela activities existe e tem dados
        const { data: testData, error: testError } = await supabase
          .from('activities')
          .select('count')
          .limit(1)
        
        console.log("Teste de conexão com activities:", { data: testData, error: testError })

        // Load activity from Supabase
        const foundActivity = await getActivityById(activityId)
        console.log("Atividade encontrada:", foundActivity)
        
        if (foundActivity) {
          setActivity(foundActivity)
          setEditedText(foundActivity.text)
        } else {
          console.log("Atividade não encontrada no banco de dados")
        }
      } catch (error) {
        console.error("Erro ao carregar atividade:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActivity()

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
      // Converter para o formato esperado pelo generatePDF
      const pdfActivity = {
        id: activity.id,
        name: activity.name,
        grade: activity.grade,
        subject: activity.subject,
        theme: activity.theme,
        objective: activity.objective || "",
        text: activity.text,
        questions: [] // Array vazio para compatibilidade
      }
      await generatePDF(pdfActivity)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedText(activity?.text || "")
  }

  const handleSave = async () => {
    if (!activity) return
    
    setSaving(true)
    try {
      const updatedActivity = await updateActivity(activityId, {
        text: editedText
      })
      
      if (updatedActivity) {
        setActivity(updatedActivity)
        setIsEditing(false)
        alert("Atividade salva com sucesso!")
      } else {
        alert("Erro ao salvar atividade. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar atividade. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedText(activity?.text || "")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Carregando atividade...</p>
        </div>
      </div>
    )
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
                <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Activity Information */}
            <div className="space-y-4 mb-8">
              <div>
               <span className="font-semibold text-gray-900">Nome:</span>
                 <span>{activity.name}</span>
                 <br/>
                 <span className="font-semibold text-gray-900">Série:</span>
                 <span>{activity.grade}</span>
                 <br/>
                 <span className="font-semibold text-gray-900">Disciplina:</span>
                 <span>{activity.subject}</span>
                 <br/>
                 <span className="font-semibold text-gray-900">Tema:</span>
                 <span>{activity.theme}</span>
                 <br/>
                 <span className="font-semibold text-gray-900">Objetivo:</span>
                 <span>{activity.objective}</span>
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Conteúdo da Atividade</h2>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPreview(false)}
                        className={!showPreview ? "bg-blue-100 border-blue-300" : ""}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPreview(true)}
                        className={showPreview ? "bg-blue-100 border-blue-300" : ""}
                      >
                        Preview
                      </Button>
                    </div>
                    
                    {!showPreview ? (
                      <Textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        placeholder="Digite o conteúdo da atividade..."
                        className="min-h-[400px] font-mono text-sm"
                      />
                    ) : (
                      <div className="min-h-[400px] bg-white p-4 rounded border">
                        <ReactMarkdown>{editedText}</ReactMarkdown>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ReactMarkdown>{activity.text}</ReactMarkdown>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
