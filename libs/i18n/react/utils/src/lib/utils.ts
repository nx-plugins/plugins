import {
    getTransMetadata,
    parseTranslationInside,
    removeTags,
  } from '@nx-plugins/i18n-core-utils';
import { isObject } from 'util';
import React from 'react';
export interface TransProps {
    value: any;
    children: any
  }

export function translator(props: TransProps, slot, setSlot, translations){
    const value = props.value;
    let transMedatada = getTransMetadata(value);
    let tmp = [...slot];
    let isEmbededElement = false;
    if (isObject(props)) {
      isEmbededElement = true;
      let translationInside = removeTags(parseTranslationInside(
        translations[transMedatada.id].target
      ));
      for (const [key, value2] of Object.entries(slot)) {
        if (isObject(value2)) {
          tmp[key] = React.cloneElement(slot[key], {
            children: translationInside[key],
            key,
          });
        } else {
          tmp[key] = translationInside[key];
        }
      }
    } else {
      setSlot(translations[transMedatada.id].target);
    }
    if (isEmbededElement) {
      setSlot(tmp);
    }
}
