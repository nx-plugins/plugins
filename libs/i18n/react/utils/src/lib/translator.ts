import React from 'react';
import { getMessageById, getTranslatableContent } from "@nx-plugins/i18n-core-utils";
export interface TransProps {
  value: any;
  children: any
}

export function translator(props: TransProps, setSlot, config) {
  let { id } = getTranslatableContent(props.value);
  const message = getMessageById(id, config);
  const element = React.createElement(React.Fragment, {
    children: 'target' in message ? message.target : message,
  });
  setSlot(element);
}
