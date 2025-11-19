import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';

import HomePage from './HomePage';

const renderHomePage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe('メインメニュー', () => {
  test('ボタン要素が３つ描画される', () => {
    renderHomePage();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });
});
