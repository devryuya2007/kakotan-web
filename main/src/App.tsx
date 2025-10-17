import { useNavigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { BrainBookIcon } from "./components/BrainBookIcon";
import { PromoCard } from "./components/PromoCard";
import { QuickStartButton } from "./components/QuickStartButton";

export default function App() {
  const nav = useNavigate();

  const handleQuickStart = () => {
    nav("/menu");
  };

  return (
    <AppLayout>
      <PromoCard
        brand="LEXIFY"
        title="UNIVERSITY ENTRANCE ENGLISH"
        subtitle="Vocabulary Mastery"
        description="Master 2,000 essential words with quick daily drills. Perfect for commuters and study breaks—always ready, even offline."
        icon={<BrainBookIcon className="h-16 w-16" />}
        action={<QuickStartButton onClick={handleQuickStart} />}
        footerItems={["Daily Practice", "Flashcards", "Review"]}
      />
    </AppLayout>
  );
}

export const QuickStartButtonStyle =
  "btn-text-glow w-full rounded-full border border-[#f2c97d66] bg-[#14141f] px-6 py-3 text-sm font-semibold tracking-[0.3em] text-[#f2c97d] shadow-[0_0_25px_rgba(242,201,125,0.25)] transition hover:border-[#f2c97d] hover:bg-[#1c1c2a] hover:shadow-[0_0_35px_rgba(242,201,125,0.35)]";
