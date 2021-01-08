import React, { useContext, useEffect, useState } from 'react';
import { translator } from '@nx-plugins/i18n-react-utils';
import { TranslateContext } from '@nx-plugins/i18n-react-data-access';

export function TransUnit(props: any) {
  const [slot, setSlot] = useState(props.children);
  const { config } = useContext(TranslateContext);

  useEffect(() => {
    translator(props, setSlot, config);
  }, [config]);

  return <>{slot}</>;
}

export default TransUnit;
