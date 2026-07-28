export type WorkItemIcon = "book" | "clipboard" | "bug" | "none"

export type WorkItemTone = "green" | "amber" | "red"

export interface WorkItem {
  id: string
  action: string
  name: string
  assignment: string
  time: string
  capacity: string
  progress: number
  tone: WorkItemTone
  icon: WorkItemIcon
}
