import React from 'react';
import { render } from '@testing-library/react';

import Plural from './plural';

describe('Plural', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Plural />);
    expect(baseElement).toBeTruthy();
  });
});
