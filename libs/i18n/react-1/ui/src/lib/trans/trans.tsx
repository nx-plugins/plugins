import React, { useContext, useEffect, useState } from 'react';
import { translator } from '@nx-plugins/i18n-react-utils';
import { TranslateContext } from '@nx-plugins/i18n-react-data-access';
import {
  getMessageById,
  getTranslatableContent,
} from '@nx-plugins/i18n-core-utils';

export function TransUnit(props: any) {
  const [slot, setSlot] = useState(props.children);
  const { config } = useContext(TranslateContext);

  useEffect(() => {
    let { id } = getTranslatableContent(props.value);
    const message = getMessageById(id, config);
    let target: string;
    if (message.hasOwnProperty('type') === 'TransUnit') {
      target = message.hasOwnProperty('target') ? message.target : message;
    } else {
      target = "Invalid Message";
    }
    translator(target, setSlot);
  }, [config]);

  return <>{slot}</>;
}

export default TransUnit;
