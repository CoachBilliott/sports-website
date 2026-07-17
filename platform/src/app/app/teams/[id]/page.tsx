import TeamDetailPage from "./TeamDetailPage";

export function generateStaticParams() {
  return [{ id: "prog-fb-2026" }, { id: "prog-vb-2026" }];
}

export default function Page() {
  return <TeamDetailPage />;
}
