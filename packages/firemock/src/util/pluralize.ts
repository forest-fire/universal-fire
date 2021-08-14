import { IDictionary } from 'common-types';

const exceptions: IDictionary<string> = {
  child: 'children',
  man: 'men',
  woman: 'women',
  tooth: 'teeth',
  foot: 'feet',
  mouse: 'mice',
  person: 'people',
  company: 'companies',
};


export function pluralize(singular: string): string {
  const rules = [
    { find: /(.*)(ch|sh|ax|ss)$/, replace: '$1$2es' },
    { find: /(.*)(fe|f)$/, replace: '$1ves' },
    { find: /(.*)us$/, replace: '$1i' },
  ];
  for (const r of rules) {
    if (r.find.test(singular)) {
      return singular.replace(r.find, r.replace);
    }
  }

  return exceptions[singular] ? exceptions[singular] : `${singular}s`;
}

export const addException = (singular: string, plural: string): void => {
  exceptions[singular] = plural;
};

