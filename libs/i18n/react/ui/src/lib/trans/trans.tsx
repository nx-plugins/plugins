import React, { useContext, useEffect, useState } from 'react';
import { translator } from '@nx-plugins/i18n-react-utils';
import { TranslateContext } from '@nx-plugins/i18n-react-data-access';

/* eslint-disable-next-line */


export function TransUnit(props: any) {
  const { translations } = useContext(TranslateContext);
  const [slot, setSlot] = useState(props.children);
  useEffect(() => {
    translator(props, slot, setSlot, translations);
    
  }, [props]);

  return <>{slot}</>;
}

export default TransUnit;
