export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // www. 제거
    return hostname.replace(/^www\./, '');
  } catch {
    // 유효하지 않은 URL인 경우
    return null;
  }
} 