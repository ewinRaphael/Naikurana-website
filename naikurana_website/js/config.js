/**
 * Site Configuration
 * Centralized configuration for Naikurana website
 */

const siteConfig = {
  // Contact Information
  contact: {
    phone: {
      display: '+91 9946 551 444',
      tel: '+919946551444',
      ariaLabel: 'Call Naikurana at +91 9946 551 444'
    },
    whatsapp: {
      display: '+91 9847 380 987',
      url: 'https://wa.me/919847380987',
      ariaLabel: 'WhatsApp Naikurana at +91 9847 380 987'
    }
  },
  
  // Site Information
  site: {
    name: 'Naikurana',
    description: 'Traditional Ayurvedic solutions for reproductive health and vitality',
    url: 'https://naikurana.com'
  },
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/naikurana',
    instagram: 'https://instagram.com/naikurana',
    twitter: 'https://twitter.com/naikurana'
  }
};

// Make config available globally
window.siteConfig = siteConfig;
