import React, { createContext, useEffect, useState } from 'react';

type Translation = {
     [key: string]: any
}
export interface TranslateContextModel {
    translations: Translation;
    locale: string;
    load: (locale: string, translation: Translation) => void;
    activate: (locale: string) => void;
  };
export const TranslateContext = createContext<TranslateContextModel>(undefined);

export const TranslateContextProvider = (props) => {
    const [translations, setTranslations] = useState({});
    const [locale, setLocale] = useState(undefined);

    useEffect(() => { console.log(translations)}, [translations])

    const load = (locale: string, translation: any) => {
        //  setTranslations({ [locale]: translation });
    };

    const activate = (locale: string) => {
        setLocale(locale);
   };
  
    return (
        <TranslateContext.Provider value={{translations, locale, load, activate}}>
            { props.children }
        </TranslateContext.Provider>
    );
  }

  export default TranslateContextProvider;
