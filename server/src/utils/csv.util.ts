export class CsvUtil {
  static jsonToCsv(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    // Extract headers safely, flattening simple nested objects if needed (like vehicle.registrationNumber)
    const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
      let result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && !(value instanceof Date)) {
          // Prevent infinite loops on huge objects, just pick standard identifiers if it's a model
          if (value.hasOwnProperty('id')) {
             result[`${prefix}${key}Id`] = (value as any).id;
             if ((value as any).registrationNumber) result[`${prefix}${key}Reg`] = (value as any).registrationNumber;
             if ((value as any).name) result[`${prefix}${key}Name`] = (value as any).name;
          }
        } else {
          result[`${prefix}${key}`] = value;
        }
      }
      return result;
    };

    const flatData = data.map(item => flattenObject(item));
    
    // Get all unique headers across all objects
    const headersSet = new Set<string>();
    flatData.forEach(item => {
      Object.keys(item).forEach(k => headersSet.add(k));
    });
    
    const headers = Array.from(headersSet);
    
    // Generate CSV string
    const csvRows = [];
    csvRows.push(headers.join(',')); // Header row
    
    for (const row of flatData) {
      const values = headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) return '';
        
        // Escape quotes and wrap in quotes if there's a comma
        const stringVal = String(val);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}
