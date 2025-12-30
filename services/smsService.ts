
/**
 * Platform Zero SMS Utility
 * Handles triggering native messaging apps on iOS and Android
 */

export const triggerNativeSms = (phoneNumber: string, message: string) => {
  // Clean phone number (remove spaces/dashes)
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Detection for OS
  const ua = navigator.userAgent.toLowerCase();
  const isIos = /ipad|iphone|ipod/.test(ua);
  
  /**
   * SEPARATOR LOGIC:
   * iOS (8+) uses '&' for the body parameter in the sms: protocol.
   * Android (and older iOS) uses '?' or ';' but '?' is the modern standard for Android.
   */
  const separator = isIos ? '&' : '?';
  
  const smsUrl = `sms:${cleanNumber}${separator}body=${encodeURIComponent(message)}`;
  
  /**
   * TRIGGER LOGIC:
   * Setting window.location.href directly is the most robust way to trigger 
   * a protocol handler (like sms: or tel:) from a web view on mobile devices.
   */
  window.location.href = smsUrl;
};

/**
 * Generates a deep link for external users.
 * In this demo environment, we use the current window location to ensure 
 * the link points back to the live app.
 */
export const generateProductDeepLink = (type: 'product' | 'portal' | 'quote', id: string, extra?: string) => {
  // Use the current origin so the link works in the preview environment
  const baseUrl = window.location.origin + window.location.pathname;
  
  switch(type) {
    case 'product': 
      // Points to the marketplace view
      return `${baseUrl}#/marketplace?item=${id}${extra ? `&ref=${extra}` : ''}`;
    case 'portal': 
      return `${baseUrl}#/join/${id}`;
    case 'quote': 
      return `${baseUrl}#/order/confirm/${id}`;
    default: 
      return baseUrl;
  }
};
