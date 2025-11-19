import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {vi} from 'vitest';

import {PromoCard} from '@/components/promo/PromoCard';

import HomePage from './HomePage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderHomePage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe('メインメニュー', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });
  test('ボタン要素が３つ描画される', () => {
    renderHomePage();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  test('useNavigateが発火するか', async () => {
    renderHomePage();
    const quickStart = screen.getByRole('button', {name: /start/i});
    await userEvent.click(quickStart);
    expect(mockNavigate).toHaveBeenCalled();
  });

  test('正しいリンク先にnavigateされるか', async () => {
    const routes = [
      {label: /quick start/i, path: '/menu'},
      {label: /setting/i, path: '/pages/user-config'},
      {label: /results/i, path: '/results'},
    ];
    const user = userEvent.setup();
    renderHomePage();

    for (let i = 0; i < routes.length; i++) {
      const button = screen.getByRole('button', {name: routes[i].label});
      await user.click(button);
      expect(mockNavigate).toHaveBeenNthCalledWith(i + 1, routes[i].path);
    }
  });

  test('カードが表示されているか', () => {
    const renderPromoCard = () =>
      render(
        <MemoryRouter>
          <PromoCard
            brand='LEXIFY'
            title='UNIVERSITY ENTRANCE ENGLISH'
            description='Master 2,000 essential words with quick daily drills. Perfect for commuters and study breaks—always ready, even offline.'
          />
        </MemoryRouter>,
      );

    const {container} = renderPromoCard();
    const div = container.querySelector('div');

    expect(div).toBeInTheDocument();
  });

  test('アイコンがあるか', () => {
    renderHomePage();

    const icon = screen.getByTestId('BrainIcon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-16 w-16');
  });
});
