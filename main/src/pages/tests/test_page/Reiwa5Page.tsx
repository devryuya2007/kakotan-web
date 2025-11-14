import {AppLayout} from '../../../components/layout/AppLayout';

import {useReiwa5Vocab} from './hooks/useReiwaVocab';
import TestPageLayout from './layout/TestPageLayout';

export default function Reiwa5Page() {
  const {status, count, error, questions} = useReiwa5Vocab();
  return (
    <AppLayout>
      <div className='my-auto w-full max-w-3xl rounded-2xl px-6 py-8'>
        <h1 className='mb-4 text-xl font-semibold text-[#f2c97d]'>
          {/* 共通テスト 令和５年（データ読込サンプル） */}
        </h1>
        {status === 'loading' && <p>データを読み込んでいます…</p>}
        {status === 'ready' && (
          <TestPageLayout
            count={count}
            questions={questions}
            sectionId='令和５年'
          />
        )}
        {status === 'error' && (
          <p className='text-red-400'>読み込みに失敗しました: {error}</p>
        )}
      </div>
    </AppLayout>
  );
}
