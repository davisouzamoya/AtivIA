"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Edit, Download, Trash2, PenTool } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Activity {
  id: string
  name: string
  theme: string
  grade: string
  subject: string
  activityType: string
  questions: any[]
  createdAt: string
}

export function Dashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Load activities from localStorage
    const storedActivities = localStorage.getItem("userActivities")
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities))
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
  }, [router])

  const handleExportActivity = async (activity: Activity) => {
    const { generatePDF } = await import("@/lib/pdf-generator")
    await generatePDF(activity)
  }

  const handleDeleteActivity = (activityId: string) => {
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
      const updatedActivities = activities.filter((activity) => activity.id !== activityId)
      setActivities(updatedActivities)
      localStorage.setItem("userActivities", JSON.stringify(updatedActivities))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const filteredActivities = activities.filter(
    (activity) =>
      activity.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="text-gray-600 text-sm font-bold">AtivIA</span>
          </div>
          <Button variant="outline" className="text-blue-600 border-blue-600 bg-transparent" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link href="/create-activity">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PenTool className="w-4 h-4 mr-2" />
              Criar atividade
            </Button>
          </Link>
        </div>

        {/* Activities Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Atividades</h2>
                <Badge variant="secondary" className="bg-gray-100">
                  {filteredActivities.length}
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
            </div>
          </div>

          {/* Activities Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tema da atividade</TableHead>
                  <TableHead className="hidden md:table-cell">Série/Ano</TableHead>
                  <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      {searchTerm ? "Nenhuma atividade encontrada." : "Nenhuma atividade criada ainda."}
                      <div className="mt-2">
                        <Link href="/create-activity">
                          <Button variant="outline" size="sm">
                            Criar primeira atividade
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">
                        {activity.theme}
                        <div className="md:hidden text-sm text-gray-500 mt-1">{activity.grade}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{activity.grade}</TableCell>
                      <TableCell className="hidden lg:table-cell">{activity.activityType}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExportActivity(activity)}>
                              <Download className="w-4 h-4 mr-2" />
                              Exportar
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/edit-activity/${activity.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteActivity(activity.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredActivities.length > 0 && (
            <div className="p-4 border-t flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-100 text-blue-600">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Próximo
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-600 text-white text-center py-4 mt-12">
        <p className="text-sm">AtivIA © 202X. All rights reserved.</p>
      </footer>
    </div>
  )
}
