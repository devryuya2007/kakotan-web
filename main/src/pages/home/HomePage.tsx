import {QuickStartButton} from '../../components/buttons/QuickStartButton';
import {BrainBookIcon} from '../../components/icons/BrainBookIcon';
import {AppLayout} from '../../components/layout/AppLayout';
import {PromoCard} from '../../components/promo/PromoCard';

import {useNavigate} from 'react-router-dom';

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
        title='KAKOTAN'
        subtitle='vocabulary mastery'
        description='Master 2,000 essential words with quick daily drills. Perfect for commuters and study breaks—always ready, even offline.'
        icon={<BrainBookIcon dataTestid='BrainIcon' className='h-16 w-16' />}
        action={
          <div className='flex w-full flex-col gap-5 sm:flex-row sm:justify-center sm:gap-4'>
            <QuickStartButton
              onClick={handleSettingConfig}
              label='SETTING'
              className='!px-8 !py-5 !text-base'
            />
            <QuickStartButton
              onClick={handleQuickStart}
              className='!px-8 !py-5 !text-base'
            />
            <QuickStartButton
              onClick={handleViewResults}
              label='VIEW RESULTS'
              className='!px-8 !py-5 !text-base'
            />
          </div>
        }
        footerItems={['Daily Practice', 'Flashcards', 'Review']}
      />
    </AppLayout>
  );
}
