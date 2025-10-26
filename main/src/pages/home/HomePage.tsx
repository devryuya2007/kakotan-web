import { useNavigate } from "react-router-dom";
import { AppLayout } from "../../components/layout/AppLayout";
import { BrainBookIcon } from "../../components/icons/BrainBookIcon";
import { PromoCard } from "../../components/promo/PromoCard";
import { QuickStartButton } from "../../components/buttons/QuickStartButton";

// 成績を見るボタン用のスタイル。QuickStartと雰囲気をそろえて少し落ち着かせた色味にしている
const SecondaryButtonStyle =
  "w-full rounded-full border border-[#f2c97d33] bg-transparent px-6 py-3 text-sm font-semibold tracking-[0.3em] text-[#f2c97d] shadow-[0_0_25px_rgba(242,201,125,0.15)] transition hover:border-[#f2c97d] hover:bg-[#1c1c2a] hover:shadow-[0_0_35px_rgba(242,201,125,0.25)]";

export default function HomePage() {
  const nav = useNavigate();

  const handleQuickStart = () => {
    // すぐに練習を始めたい場合はメニューへジャンプ
    nav("/menu");
  };

  const handleViewResults = () => {
    // これまでの成績を確認したい場合はダッシュボードへ移動
    nav("/results");
  };

  return (
    <AppLayout>
      <PromoCard
        brand="LEXIFY"
        title="UNIVERSITY ENTRANCE ENGLISH"
        subtitle="Vocabulary Mastery"
        description="Master 2,000 essential words with quick daily drills. Perfect for commuters and study breaks—always ready, even offline."
        icon={<BrainBookIcon className="h-16 w-16" />}
        action={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <QuickStartButton onClick={handleQuickStart} />
            <button
              type="button"
              className={SecondaryButtonStyle}
              onClick={handleViewResults}>
              成績を見る
            </button>
          </div>
        }
        footerItems={["Daily Practice", "Flashcards", "Review"]}
      />
    </AppLayout>
  );
}
