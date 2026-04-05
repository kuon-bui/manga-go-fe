import { redirect } from 'next/navigation'

// /dashboard/groups just redirects back to the dashboard for now;
// individual groups are managed at /dashboard/groups/[groupId]
export default function GroupsPage() {
  redirect('/dashboard')
}
