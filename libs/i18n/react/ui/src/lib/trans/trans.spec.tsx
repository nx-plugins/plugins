import React from 'react';
import { render } from '@testing-library/react';

import Trans from './trans';

describe('Trans', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Trans />);
    expect(baseElement).toBeTruthy();
  });
});
