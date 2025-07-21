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
import { createActivity } from "@/lib/activities"

export function CreateActivity() {
  const router = useRouter()
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    theme: "",
    name: "",
    subject: "",
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

    if (!formData.theme || !formData.name || !formData.subject || !formData.grade || !formData.activityType || !formData.questionCount) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsGenerating(true)

    try {
      const isTrueFalse = formData.activityType === "verdadeiro ou falso";
      const isCompleteGaps = formData.activityType === "completar lacunas";
      const isDissertative = formData.activityType === "dissertativa";
      
      const prompt = `
        Gere uma prova escolar com as seguintes características:
        - Nome da atividade: ${formData.name}
        - Tema: ${formData.theme}
        - Disciplina: ${formData.subject}
        - Objetivo pedagógico: ${formData.objective || "não especificado"}
        - Ano/Série: ${formData.grade}
        - Tipo de questão: ${formData.activityType}
        - Quantidade de questões: ${formData.questionCount}
        
        ${isTrueFalse ? `
        REGRAS ESPECÍFICAS PARA VERDADEIRO OU FALSO:
        1. Cada questão deve ser uma afirmação clara e objetiva sobre o tema.
        2. Formate cada questão da seguinte forma:
           **1. [Afirmação sobre o tema]**
           
            ( ) Verdadeiro
           
            ( ) Falso 
           
           **Gabarito:** [Verdadeiro/Falso]
           
        3. Use parênteses vazios ( ) para o aluno marcar a resposta.
        4. As afirmações devem ser adequadas ao nível educacional informado.
        5. Inclua uma mistura equilibrada de afirmações verdadeiras e falsas.
        6. Cada afirmação deve ser específica e testável.
        7. Não use afirmações muito óbvias ou muito complexas.
        8. O gabarito deve vir logo após cada questão, em negrito.
        9. Deixe uma linha em branco entre cada questão.
        10. Comece diretamente pela primeira questão, sem títulos ou cabeçalhos.
        11. Use quebras de linha naturais do Markdown, sem adicionar '\\n' manualmente no final do Verdadeiro, Falso e no final da pergunta.
        12. Remova da resposta os campos "Nome da atividade", "Tema", "Disciplina", "Ano/Série" ou "Objetivo pedagógico", "Tipo de questão" e "Quantidade de questões". Essas informações já serão exibidas separadamente.
        ` : isCompleteGaps ? `
        REGRAS ESPECÍFICAS PARA COMPLETAR LACUNAS:
        1. Cada questão deve ser um texto com lacunas (espaços em branco) para o aluno preencher.
        2. Formate cada questão da seguinte forma:
           **1. [Texto com _____ lacunas para completar]**
           
           **Gabarito:** [Palavra ou frase correta para cada lacuna]
           
        3. Use underscores (_____) para indicar as lacunas no texto.
        4. O texto deve ser contextualizado e adequado ao nível educacional informado.
        5. As lacunas devem ser estratégicas, testando conceitos importantes do tema.
        6. Cada lacuna deve ter uma resposta clara e específica.
        7. O gabarito deve listar todas as respostas corretas na ordem das lacunas.
        8. Deixe uma linha em branco entre cada questão.
        9. Comece diretamente pela primeira questão, sem títulos ou cabeçalhos.
        10. Use quebras de linha naturais do Markdown, sem caracteres especiais.
        11. Remova da resposta os campos "Nome da atividade", "Tema", "Disciplina", "Ano/Série" ou "Objetivo pedagógico", "Tipo de questão" e "Quantidade de questões". Essas informações já serão exibidas separadamente.
        12. Coloque negrito apenas nos números do indice
        ` : `
        REGRAS GERAIS:
        1. As questões devem ser claras, objetivas e adequadas ao nível informado.
        2. Inclua o gabarito ao final de cada questão.
        3. Não repita perguntas.
        4. Formate a resposta como uma lista numerada, cada questão seguida do gabarito.
        5. Gere a prova no formato markdown, usando títulos, listas e negrito para os campos importantes.
        6. Liste as alternativas de cada questão uma embaixo da outra, cada uma em sua própria linha, usando letras (a), (b), (c), (d).
        7. Não use nenhum outro formato além do markdown.
        8. As alternativas de cada questão devem ser apresentadas como uma lista markdown, usando '-' antes de cada alternativa, e a letra entre parênteses, por exemplo:
        - (a) Alternativa 1
        - (b) Alternativa 2
        - (c) Alternativa 3
        - (d) Alternativa 4
        Não use espaços, recuos ou outros marcadores antes do '-'. Não use letras maiúsculas nos marcadores.
        9. Não adicione linha em branco entre as alternativas, apenas entre as alternativas e o gabarito.
        10. Use quebras de linha naturais do Markdown, sem adicionar '\\n' manualmente.
        11. Remova da resposta os campos "Nome da atividade", "Tema", "Disciplina", "Ano/Série" ou "Objetivo pedagógico", "Tipo de questão" e "Quantidade de questões". Essas informações já serão exibidas separadamente.
        12. Não inclua nenhum título, cabeçalho ou linha inicial com o nome da atividade, tema, disciplina, ano/série, objetivo, tipo de questão ou quantidade de questões, nem qualquer combinação desses campos. Comece diretamente pelas questões.
        13. A pergunta deve vir em negrito o gabarito tem que ficar na linha debaixo e ter um espaço entre eles.
        14. O gabarito deve ser em negrito e ter um espaço entre o gabarito e a próxima pergunta.
        15. Depois do gabarito use quebras de linha naturais do Markdown, sem adicionar '\\n\\n' manualmente
        16. Coloque negrito apenas nos números do indice
        `}
      `;

      const body = JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json();

      // Pegando o texto gerado pela IA:
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        // Cria objeto padronizado da atividade
        const activityData = {
          name: formData.name,
          subject: formData.subject,
          text: generatedText,
          theme: formData.theme,
          objective: formData.objective,
          grade: formData.grade,
          activity_type: formData.activityType,
          question_count: parseInt(formData.questionCount),
        };

        // Salva no Supabase
        console.log("Salvando atividade no Supabase...", activityData);
        const savedActivity = await createActivity(activityData);
        
        if (savedActivity) {
          console.log("Atividade salva com sucesso:", savedActivity);
          // Salva também no localStorage para compatibilidade
          localStorage.setItem("generatedActivity", JSON.stringify(savedActivity));
          
          // Redireciona para a página de edição
          router.push(`/edit-activity/${savedActivity.id}`);
        } else {
          throw new Error("Erro ao salvar atividade no banco de dados. Verifique sua conexão.");
        }
      } else {
        throw new Error("A resposta da IA não pôde ser processada.");
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
                <Label htmlFor="name">Nome da Atividade *</Label>
                <Input
                  id="name"
                  placeholder='ex. "Prova de Matemática - Multiplicação"'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Disciplina *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matemática">Matemática</SelectItem>
                    <SelectItem value="Português">Português</SelectItem>
                    <SelectItem value="História">História</SelectItem>
                    <SelectItem value="Geografia">Geografia</SelectItem>
                    <SelectItem value="Ciências">Ciências</SelectItem>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                    <SelectItem value="Artes">Artes</SelectItem>
                    <SelectItem value="Educação Física">Educação Física</SelectItem>
                    <SelectItem value="Filosofia">Filosofia</SelectItem>
                    <SelectItem value="Sociologia">Sociologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
    </div>
  )
}
