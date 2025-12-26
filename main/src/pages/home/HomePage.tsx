import {QuickStartButton} from '../../components/buttons/QuickStartButton';
import {BrainBookIcon} from '../../components/icons/BrainBookIcon';
import {AppLayout} from '../../components/layout/AppLayout';
import {PromoCard} from '../../components/promo/PromoCard';

import {useNavigate} from 'react-router-dom';

// Secondary CTA style for the “View Results” button.
const SecondaryButtonStyle =
  "button-pressable w-full rounded-full border border-[#f2c97d33] bg-transparent px-6 py-3 text-sm font-semibold tracking-[0.3em] text-[#f2c97d] shadow-[0_0_25px_rgba(242,201,125,0.15)] transition hover:border-[#f2c97d] hover:bg-[#1c1c2a] hover:shadow-[0_0_35px_rgba(242,201,125,0.25)]";

export default function HomePage() {
  const nav = useNavigate();

  const handleQuickStart = () => {
    // Take the user straight to the practice menu.
    nav('/menu');
  };

  const handleViewResults = () => {
    // Send the user to the results dashboard.
    nav('/results');
  };

  const handleSettingConfig = () => {
    nav('/pages/user-config');
  };

  return (
    <AppLayout>
      <PromoCard
        brand='LEXIFY'
        title='UNIVERSITY ENTRANCE ENGLISH'
        subtitle='Vocabulary Mastery'
        description='Master 2,000 essential words with quick daily drills. Perfect for commuters and study breaks—always ready, even offline.'
        icon={<BrainBookIcon dataTestid='BrainIcon' className='h-16 w-16' />}
        action={
          <div className='flex w-full flex-col gap-3 sm:flex-row sm:justify-center'>
            <button
              type='button'
              className={SecondaryButtonStyle}
              onClick={handleSettingConfig}
              aria-label='setting'
            >
              Setting
            </button>
            <QuickStartButton onClick={handleQuickStart} aria-label='test' />
            <button
              type='button'
              className={SecondaryButtonStyle}
              onClick={handleViewResults}
              aria-label='results'
            >
              View Results
            </button>
          </div>
        }
        footerItems={['Daily Practice', 'Flashcards', 'Review']}
      />
    </AppLayout>
  );
}
