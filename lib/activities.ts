import { supabase } from './supabase'
import type { Activity, CreateActivityData, UpdateActivityData } from '@/types/database'

export async function createActivity(activityData: CreateActivityData): Promise<Activity | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Erro ao obter usuário:', userError)
      return null
    }

    // Add user_id to activity data
    const activityWithUserId = {
      ...activityData,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('activities')
      .insert([activityWithUserId])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar atividade:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao criar atividade:', error)
    return null
  }
}

export async function getActivities(): Promise<Activity[]> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Erro ao obter usuário:', userError)
      return []
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar atividades:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return []
  }
}

export async function getActivityById(id: string): Promise<Activity | null> {
  try {
    console.log("getActivityById chamada com ID:", id)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Erro ao obter usuário:', userError)
      return null
    }

    console.log("Usuário encontrado:", user.id)

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Erro ao buscar atividade:', error)
      return null
    }

    console.log("Atividade retornada do banco:", data)
    return data
  } catch (error) {
    console.error('Erro ao buscar atividade:', error)
    return null
  }
}

export async function updateActivity(id: string, activityData: UpdateActivityData): Promise<Activity | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Erro ao obter usuário:', userError)
      return null
    }

    const { data, error } = await supabase
      .from('activities')
      .update(activityData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar atividade:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error)
    return null
  }
}

export async function deleteActivity(id: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Erro ao obter usuário:', userError)
      return false
    }

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar atividade:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar atividade:', error)
    return false
  }
} 