import { notFound } from 'next/navigation'
import { GroupDetailView } from '@/components/groups/group-detail-view'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function GroupPage({ params }: PageProps) {
  const { slug } = await params
  if (!slug) return notFound()

  return <GroupDetailView slug={slug} />
}
