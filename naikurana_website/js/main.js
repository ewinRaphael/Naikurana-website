document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('#mobileNav');
    const navLinks = document.querySelector('.nav-links');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const body = document.body;

    // Mobile navigation functionality
    function toggleMobileNav() {
        const isOpen = mobileNav.classList.contains('is-open');
        
        if (isOpen) {
            // Close mobile navigation
            mobileNav.classList.remove('is-open');
            navLinks.classList.remove('is-open');
            backdrop.classList.remove('is-open');
            body.classList.remove('is-locked');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            backdrop.setAttribute('aria-hidden', 'true');
        } else {
            // Open mobile navigation
            mobileNav.classList.add('is-open');
            navLinks.classList.add('is-open');
            backdrop.classList.add('is-open');
            body.classList.add('is-locked');
            mobileNavToggle.setAttribute('aria-expanded', 'true');
            backdrop.setAttribute('aria-hidden', 'false');
        }
    }

    // Close mobile navigation
    function closeMobileNav() {
        mobileNav.classList.remove('is-open');
        navLinks.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        body.classList.remove('is-locked');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        backdrop.setAttribute('aria-hidden', 'true');
    }

    // Event listeners
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileNav();
        });
    }

    // Close on backdrop click
    if (backdrop) {
        backdrop.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileNav();
        });
    }

    // Close on navigation link click
    if (navLinks) {
        navLinks.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                closeMobileNav();
            }
        });
    }

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
            closeMobileNav();
        }
    });

    // Close on window resize (desktop breakpoint)
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && mobileNav.classList.contains('is-open')) {
            closeMobileNav();
        }
    });

    // Scroll-only animation system - triggers once when elements enter viewport
    const scrollObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Main scroll observer for all animated elements
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add in-view class to trigger CSS transitions
                entry.target.classList.add('in-view');
                // Unobserve to ensure animation only runs once
                observer.unobserve(entry.target);
            }
        });
    }, scrollObserverOptions);

                // Observe specific elements for scroll animations (only elements that should animate)
            document.querySelectorAll('.hero h1, .hero p, .cta-section h2, .cta-section p, .content-section h2, .content-section p, .diabetes-text-animate').forEach(element => {
                scrollObserver.observe(element);
            });

    // ===== CURSOR TRAIL ANIMATION =====
    // Create elegant cursor trail effect suitable for Ayurvedic website
    
    // Create cursor trail elements
    function createCursorTrail() {
        const trailContainer = document.createElement('div');
        trailContainer.id = 'cursor-trail-container';
        trailContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
        `;
        
        // Create multiple trail dots
        for (let i = 0; i < 4; i++) {
            const trailDot = document.createElement('div');
            trailDot.className = 'cursor-trail';
            trailDot.style.cssText = `
                position: absolute;
                width: ${8 - i * 2}px;
                height: ${8 - i * 2}px;
                background: linear-gradient(135deg, #566c4f, #8fbc8f);
                border-radius: 50%;
                pointer-events: none;
                opacity: ${0.6 - i * 0.1};
                transition: all 0.3s ease;
                transform: translate(-50%, -50%);
            `;
            trailContainer.appendChild(trailDot);
        }
        
        document.body.appendChild(trailContainer);
        return trailContainer;
    }
    
    // Initialize cursor trail
    let cursorTrailContainer;
    let mouseX = 0;
    let mouseY = 0;
    let trailPositions = [];
    
    // Only create cursor trail on desktop devices
    if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cursorTrailContainer = createCursorTrail();
        
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Store position for trail effect
            trailPositions.unshift({ x: mouseX, y: mouseY });
            if (trailPositions.length > 4) {
                trailPositions.pop();
            }
            
            // Update trail dots with staggered animation
            const trailDots = cursorTrailContainer.querySelectorAll('.cursor-trail');
            trailDots.forEach((dot, index) => {
                if (trailPositions[index]) {
                    const pos = trailPositions[index];
                    dot.style.left = pos.x + 'px';
                    dot.style.top = pos.y + 'px';
                }
            });
        });
        
        // Hide trail when mouse leaves window
        document.addEventListener('mouseleave', () => {
            const trailDots = cursorTrailContainer.querySelectorAll('.cursor-trail');
            trailDots.forEach(dot => {
                dot.style.opacity = '0';
            });
        });
        
        // Show trail when mouse enters window
        document.addEventListener('mouseenter', () => {
            const trailDots = cursorTrailContainer.querySelectorAll('.cursor-trail');
            trailDots.forEach((dot, index) => {
                dot.style.opacity = 0.6 - index * 0.1;
            });
        });
        
        // Enhanced hover effects for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .btn, .nav-links a, input, textarea');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                const trailDots = cursorTrailContainer.querySelectorAll('.cursor-trail');
                trailDots.forEach((dot, index) => {
                    dot.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    dot.style.opacity = 0.8 - index * 0.1;
                    
                    // Special effect for CTA buttons
                    if (element.classList.contains('btn-primary')) {
                        dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
                        dot.style.opacity = 1 - index * 0.1;
                        dot.style.boxShadow = '0 0 15px rgba(86, 108, 79, 0.4)';
                    }
                });
            });
            
            element.addEventListener('mouseleave', () => {
                const trailDots = cursorTrailContainer.querySelectorAll('.cursor-trail');
                trailDots.forEach((dot, index) => {
                    dot.style.transform = 'translate(-50%, -50%) scale(1)';
                    dot.style.opacity = 0.6 - index * 0.1;
                    dot.style.boxShadow = 'none';
                });
            });
        });
    }

    // Observe existing animation classes
    document.querySelectorAll('.fade-in-on-scroll, .slide-in-left-on-scroll, .slide-in-right-on-scroll, .scroll-animate').forEach(element => {
        scrollObserver.observe(element);
    });

    // Section animations - simplified to just fade in
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });

    // Scroll-only animation system is now handled by the IntersectionObserver above
    // All text animations are triggered by CSS transitions when elements enter viewport

    // Enhanced list item animations
    document.querySelectorAll('li').forEach((item, index) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        slideText(entry.target, 'left');
                    }, index * 150);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(item);
    });

    // Hero text typewriter effect
    const heroHeadings = document.querySelectorAll('.hero h1, .hero-carousel .hero-text h1');
    heroHeadings.forEach((heading, index) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        animateText(entry.target);
                    }, index * 1000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(heading);
    });

    // Text glow effect on hover
    document.querySelectorAll('h1, h2, h3').forEach(heading => {
        heading.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 20px rgba(200, 162, 91, 0.6), 0 0 30px rgba(200, 162, 91, 0.4)';
            this.style.transition = 'text-shadow 0.3s ease-in-out';
        });
        
        heading.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });
    });

    // Text color shift effect
    document.querySelectorAll('.benefit-item h3, .doctor-card h3').forEach(heading => {
        heading.addEventListener('mouseenter', function() {
            this.style.color = 'var(--primary-green)';
            this.style.transition = 'color 0.3s ease-in-out';
        });
        
        heading.addEventListener('mouseleave', function() {
            this.style.color = '';
        });
    });

    // Text bounce effect
    document.querySelectorAll('h3').forEach(heading => {
        heading.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease-in-out';
        });
        
        heading.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Text pulse effect
    document.querySelectorAll('.cta-section h2, .cta-banner-section h2').forEach(heading => {
        heading.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease-in-out';
        });
        
        heading.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Enhanced navigation text effects
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.color = 'var(--accent-gold)';
            this.style.textShadow = '0 2px 4px rgba(200, 162, 91, 0.3)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.color = '';
            this.style.textShadow = 'none';
        });
    });

    // Enhanced button text effects
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
            this.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.textShadow = 'none';
        });
    });

    // Enhanced form text effects
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 10px 25px rgba(58, 107, 53, 0.2)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 0 0 4px rgba(58, 107, 53, 0.15)';
        });
    });

    // Enhanced footer text effects
    document.querySelectorAll('.footer-links-inline a').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.color = 'var(--accent-gold)';
            this.style.textShadow = '0 2px 4px rgba(200, 162, 91, 0.3)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.color = '#ffffff';
            this.style.textShadow = 'none';
        });
    });

    // Text reveal on scroll
    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealText(entry.target);
                textObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.content-text h2, .content-text p').forEach(element => {
        textObserver.observe(element);
    });

    // Staggered text animations for lists
    function animateListItems(listSelector) {
        const items = document.querySelectorAll(listSelector);
        items.forEach((item, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            slideText(entry.target, 'left');
                        }, index * 200);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(item);
        });
    }

    // Apply staggered animations to different list types
    animateListItems('.content-section li');
    animateListItems('.contact-details li');
    animateListItems('.study-summaries li');



    // Sticky CTA Button with enhanced functionality
    const stickyCtaButton = document.querySelector('.sticky-cta-button');
    if (stickyCtaButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
                stickyCtaButton.style.display = 'block';
                stickyCtaButton.style.animation = 'fadeInUp 0.5s ease-out';
            } else {
                stickyCtaButton.style.display = 'none';
            }
        });

        // Add click functionality to scroll to top
        stickyCtaButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Enhanced Hero Carousel with smooth transitions
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        let isTransitioning = false;
        const slideInterval = setInterval(nextSlide, 5000); // Set to 5 seconds for better user experience

        function nextSlide() {
            if (isTransitioning) return;
            isTransitioning = true;
            
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
            
            setTimeout(() => {
                isTransitioning = false;
            }, 1500);
        }

        // Initialize first slide
        slides[0].classList.add('active');

        // Add pause on hover functionality
        const heroSection = document.querySelector('.hero-carousel');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });
            
            heroSection.addEventListener('mouseleave', () => {
                setInterval(nextSlide, 5000); // Updated to match new timing
            });
        }
    }

    // Enhanced card hover effects
    document.querySelectorAll('.benefit-item, .doctor-card, .blog-card, .gallery-item').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        });
    });

    // Enhanced image hover effects
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.08) rotate(1deg)';
            this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        });
    });

    // Enhanced section divider animations
    document.querySelectorAll('.section-divider i').forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) rotate(15deg)';
            this.style.color = 'var(--primary-green)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.color = 'var(--accent-gold)';
        });
    });

    // Enhanced social media icon effects
    document.querySelectorAll('.footer-social-center a').forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.3) rotate(10deg)';
            this.style.color = 'var(--accent-gold)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.color = '#ffffff';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Enhanced loading animations
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Animate elements on page load
        setTimeout(() => {
            document.querySelectorAll('.fade-in-on-scroll').forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('is-visible');
                }, index * 100);
            });
        }, 500);
    });

    // Parallax effect for hero backgrounds
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero::before');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Enhanced form submission with loading animation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton) {
                submitButton.classList.add('loading');
                submitButton.textContent = 'Sending...';
                
                // Simulate form submission (replace with actual form handling)
                setTimeout(() => {
                    submitButton.classList.remove('loading');
                    submitButton.textContent = 'Sent Successfully!';
                    submitButton.style.backgroundColor = 'var(--primary-green)';
                }, 2000);
            }
        });
    });



    // Performance optimization: Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-fast', '0s');
        document.documentElement.style.setProperty('--transition-normal', '0s');
        document.documentElement.style.setProperty('--transition-slow', '0s');
    }
});
