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
