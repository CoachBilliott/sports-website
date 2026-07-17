import { TeamShell } from "@/components/app/TeamShell";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeamShell>{children}</TeamShell>;
}
