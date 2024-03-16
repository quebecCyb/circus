
export function convertTypeToQuery(params: Object): string {
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  
    return queryParams.length > 0 ? `?${queryParams}` : '';
}
