declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  
  export interface LucideIcon extends FC<SVGProps<SVGSVGElement>> {
    displayName?: string
  }
  
  export const ArrowLeft: LucideIcon
  export const Loader2: LucideIcon
  export const Sparkles: LucideIcon
  export const Search: LucideIcon
  export const MoreHorizontal: LucideIcon
  export const Edit: LucideIcon
  export const Download: LucideIcon
  export const Trash2: LucideIcon
  export const PenTool: LucideIcon
  export const Clock: LucideIcon
  export const Copy: LucideIcon
  export const Shield: LucideIcon
  export const RefreshCw: LucideIcon
} 