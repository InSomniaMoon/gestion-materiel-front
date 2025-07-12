import { HttpParams } from '@angular/common/http';

export const queryParams = (params: object) => {
  // Filtrer les valeurs undefined, null et les chaînes vides
  const filteredOpt = Object.entries(params).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  return new HttpParams({
    fromObject: filteredOpt,
  });
};
