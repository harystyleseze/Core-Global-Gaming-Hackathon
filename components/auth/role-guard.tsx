import { useWalletRoles } from '@/hooks/use-wallet-roles'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type RoleGuardProps = {
  children: React.ReactNode
  requiredRoles: ('admin' | 'minter' | 'game')[]
}

export function RoleGuard({ children, requiredRoles }: RoleGuardProps) {
  const roles = useWalletRoles()
  const hasRequiredRole = requiredRoles.some(role => roles[role])

  if (!hasRequiredRole) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have the required permissions to view this content.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return <>{children}</>
} 