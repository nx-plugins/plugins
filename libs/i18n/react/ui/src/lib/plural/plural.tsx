import React, { useContext, useEffect, useState } from 'react';
import { TranslateContext } from '@nx-plugins/i18n/react/data-access';

/* eslint-disable-next-line */
export interface PluralProps {
  value: number;
  zero?: string; 
  one?: string;
  two?: string;
  other?:string;
}

export function Plural(props: PluralProps) {
  const { translations } = useContext(TranslateContext);
  const [slot, setSlot] = useState('Empty');
  debugger;
  useEffect(() => {
    const value = props.value;
    debugger;
    if(value > -1 ){
      switch(value){
        case 0:
        setSlot(props.zero);
        case 1:
        setSlot(props.zero);
        default:
        setSlot(props.other);
      }
    }

    // translator(props, slot, setSlot, translations);
    
  }, [props]);

  return <>
  {slot}
  </>;
}

export default Plural;
