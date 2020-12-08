export function getTransMetadata(value: string) {
  const id = `@@@${value.split('@@@')[1]}`;
  const description = `${value.split('|')[0]}`;
  const intent = `${value.split('|')[1]}`;
  return { id, description, intent };
}

export function parseTranslationInside(value: string){
  const regexp = /(<[^>]*>)([^]*?)(<[^>]*>)/g;

  return value.split(regexp);

}

export function removeTags(value: string[]){
  return value.map((i)=> {
      if(!i.startsWith('<')){
      return i;
      }
      }).filter(i => i)
}
