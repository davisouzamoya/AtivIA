import { EditActivity } from "@/components/edit-activity"

export default function EditActivityPage({ params }: { params: { id: string } }) {
  return <EditActivity activityId={params.id} />
}
