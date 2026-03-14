import { AuthGuard } from '@/features/auth';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
