/**
 * Shared Footer Component
 * Renders consistent footer across all pages
 */

function createFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <!-- Footer Logo Section -->
        <div class="footer-logo-section">
          <div class="footer-logo">
            <a href="index.html">
              <img src="assets/images/JJ_HERBALS LOGO.png" alt="Naikurana Logo" class="footer-logo-img">
            </a>
          </div>
          <div class="footer-logo-text">
            <h2>Naikurana</h2>
            <p>Ancient Ayurvedic Wisdom for Modern Wellness</p>
          </div>
        </div>
        
        <div class="footer-content">
          <!-- Contact Information -->
          <div class="footer-contact">
            <h3>Contact Us</h3>
            <div class="contact-links">
              <a href="tel:${siteConfig.contact.phone.tel}" 
                 class="contact-link phone-link"
                 aria-label="${siteConfig.contact.phone.ariaLabel}">
                <i class="fas fa-phone"></i>
                <span>Call: ${siteConfig.contact.phone.display}</span>
              </a>
              <a href="${siteConfig.contact.whatsapp.url}" 
                 class="contact-link whatsapp-link"
                 target="_blank"
                 rel="noopener noreferrer"
                 aria-label="${siteConfig.contact.whatsapp.ariaLabel}">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp: ${siteConfig.contact.whatsapp.display}</span>
              </a>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div class="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="about-naikurana.html">About</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="consultation.html">Consultation</a></li>
              <li><a href="blogs.html">Blog</a></li>
              <li><a href="naikurana-4-diabetes.html">Naikurana 4 Diabetes</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          
          <!-- Company Info -->
          <div class="footer-info">
            <h3>${siteConfig.site.name}</h3>
            <p>${siteConfig.site.description}</p>
            <div class="social-links">
              <a href="https://www.facebook.com/jj.Success.Plus" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/jj_herbals_success_plus/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://x.com/jjherbals" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter">
                <i class="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Policies and Copyright -->
        <div class="footer-bottom">
          <div class="footer-policies">
            <a href="https://www.jjherbals.com/privacy-policy">Privacy Policy</a>
            <a href="https://www.jjherbals.com/terms-and-conditions">Terms & Conditions</a>
            <a href="https://www.jjherbals.com/shipping-policy">Shipping Policy</a>
          </div>
          <p class="copyright">&copy; ${new Date().getFullYear()} ${siteConfig.site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

// Function to initialize footer
function initFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = createFooter();
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initFooter);
