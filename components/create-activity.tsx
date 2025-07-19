"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function CreateActivity() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    theme: "",
    name: "",
    objective: "",
    grade: "",
    activityType: "",
    questionCount: "",
  })

  useEffect(() => {
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
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.theme || !formData.grade || !formData.activityType || !formData.questionCount) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDWGjC_xsHyfUTqE5phZHhwXHW34_rVSRo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Store the generated activity in localStorage
        localStorage.setItem("generatedActivity", JSON.stringify(data.activity))

        // Also add to activities list for dashboard
        const existingActivities = JSON.parse(localStorage.getItem("userActivities") || "[]")
        existingActivities.push(data.activity)
        localStorage.setItem("userActivities", JSON.stringify(existingActivities))

        // Redirect to the edit page with the generated activity
        router.push(`/edit-activity/${data.activity.id}`)
      } else {
        throw new Error(data.error || "Erro desconhecido")
      }
    } catch (error) {
      console.error("Error:", error)
      alert(
        `Erro ao gerar atividade: ${error instanceof Error ? error.message : "Erro desconhecido"}. Tente novamente.`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Criar Nova Atividade</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Escolher Tema *</Label>
                <Input
                  id="theme"
                  placeholder='ex. "Multiplicação", "Revolução Francesa", etc.)'
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo</Label>
                <Input
                  id="objective"
                  placeholder="Ex: Avaliar a compreensão dos alunos sobre..."
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Ano/Série *</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1º Ano Fundamental">1º Ano Fundamental</SelectItem>
                    <SelectItem value="2º Ano Fundamental">2º Ano Fundamental</SelectItem>
                    <SelectItem value="3º Ano Fundamental">3º Ano Fundamental</SelectItem>
                    <SelectItem value="4º Ano Fundamental">4º Ano Fundamental</SelectItem>
                    <SelectItem value="5º Ano Fundamental">5º Ano Fundamental</SelectItem>
                    <SelectItem value="6º Ano Fundamental">6º Ano Fundamental</SelectItem>
                    <SelectItem value="7º Ano Fundamental">7º Ano Fundamental</SelectItem>
                    <SelectItem value="8º Ano Fundamental">8º Ano Fundamental</SelectItem>
                    <SelectItem value="9º Ano Fundamental">9º Ano Fundamental</SelectItem>
                    <SelectItem value="1º Ano Médio">1º Ano Médio</SelectItem>
                    <SelectItem value="2º Ano Médio">2º Ano Médio</SelectItem>
                    <SelectItem value="3º Ano Médio">3º Ano Médio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityType">Tipo de atividade *</Label>
                <Select
                  value={formData.activityType}
                  onValueChange={(value) => setFormData({ ...formData, activityType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="múltipla escolha">Múltipla escolha</SelectItem>
                    <SelectItem value="verdadeiro ou falso">Verdadeiro ou Falso</SelectItem>
                    <SelectItem value="completar lacunas">Completar lacunas</SelectItem>
                    <SelectItem value="dissertativa">Dissertativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionCount">Quantidade de questões *</Label>
                <Select
                  value={formData.questionCount}
                  onValueChange={(value) => setFormData({ ...formData, questionCount: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questões</SelectItem>
                    <SelectItem value="10">10 questões</SelectItem>
                    <SelectItem value="15">15 questões</SelectItem>
                    <SelectItem value="20">20 questões</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando atividade...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar atividade com IA
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8">
              <Link href="/help" className="text-blue-600 text-sm underline">
                Encontrou algum problema?
              </Link>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Configure sua atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-center text-gray-500">
                  <p>Preencha os campos ao lado para configurar sua atividade personalizada.</p>
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm">
                    Nossa IA criará questões personalizadas baseadas no tema e nível educacional escolhidos.
                  </p>
                  {formData.activityType && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">Tipo selecionado: {formData.activityType}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-600 text-white text-center py-4 mt-12">
        <p className="text-sm">AtivIA © 202X. All rights reserved.</p>
      </footer>
    </div>
  )
}
