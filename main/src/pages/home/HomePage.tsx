import { useNavigate } from "react-router-dom";
import { AppLayout } from "../../components/layout/AppLayout";
import { BrainBookIcon } from "../../components/icons/BrainBookIcon";
import { PromoCard } from "../../components/promo/PromoCard";
import { QuickStartButton } from "../../components/buttons/QuickStartButton";

export default function HomePage() {
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
