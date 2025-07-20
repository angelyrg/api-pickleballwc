// export const transformFlatBody = (flatBody: {
export const transformNestedFormDataBody = (
  data: any,
  parentKey: string = '',
  stringOnlyKeys: string[] = [],
): any => {
  if (typeof data === 'string') {
    const lowerCaseValue = data.toLowerCase();
    if (lowerCaseValue === 'true') return true;
    if (lowerCaseValue === 'false') return false;
    if (
      !isNaN(Number(data)) &&
      data.trim() !== '' &&
      !stringOnlyKeys.includes(parentKey)
    ) {
      return Number(data);
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) =>
      transformNestedFormDataBody(item, '', stringOnlyKeys),
    );
  }

  if (typeof data === 'object' && data !== null && !isFile(data)) {
    const transformedObject: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // transformedObject[key] = transformNestedFormDataBody(
        //   data[key],
        //   stringOnlyKeys,
        // );
        const originalValue = data[key];
        const processedValue = transformNestedFormDataBody(
          originalValue,
          key,
          stringOnlyKeys,
        );

        transformedObject[key] = processedValue;
      }
    }
    return transformedObject;
  }
  return data;
};
export const isFile = (data: any): boolean => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.fieldname === 'string' &&
    typeof data.originalname === 'string' &&
    typeof data.encoding === 'string' &&
    typeof data.mimetype === 'string' &&
    (data.buffer instanceof Buffer || typeof data.path === 'string')
  );
};
