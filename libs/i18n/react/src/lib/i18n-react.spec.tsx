import React from 'react';
import { render } from '@testing-library/react';

import I18nReact from './i18n-react';

describe('I18nReact', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<I18nReact />);
    expect(baseElement).toBeTruthy();
  });
});
