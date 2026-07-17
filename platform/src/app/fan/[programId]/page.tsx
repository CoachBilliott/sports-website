import FanPublicPage from "./FanPublicPage";

export function generateStaticParams() {
  return [
    { programId: "football" },
    { programId: "volleyball" },
    { programId: "prog-fb-2026" },
    { programId: "prog-vb-2026" },
  ];
}

export default function Page() {
  return <FanPublicPage />;
}
