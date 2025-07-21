export interface Activity {
  id: string
  user_id: string
  name: string
  subject: string
  theme: string
  objective?: string
  grade: string
  activity_type: string
  question_count: number
  text: string
  created_at: string
  updated_at: string
}

export interface CreateActivityData {
  user_id?: string
  name: string
  subject: string
  theme: string
  objective?: string
  grade: string
  activity_type: string
  question_count: number
  text: string
}

export interface UpdateActivityData {
  name?: string
  subject?: string
  theme?: string
  objective?: string
  grade?: string
  activity_type?: string
  question_count?: number
  text?: string
} 