document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    const supabase = window.supabase.createClient(
        'https://jitlnpliyugbmgmlgexx.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdGxucGxpeXVnYm1nbWxnZXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjk3MjAsImV4cCI6MjA2OTk0NTcyMH0.cLysTIfJpeR0McvKUQxwBo-8K8ZcKm1ZNL9YqvLquIE'
    );

    const blogContainer = document.getElementById('blog-posts');
    const carouselWrapper = document.querySelector('.blog-carousel-wrapper');
    const leftArrow = document.querySelector('.carousel-arrow-left');
    const rightArrow = document.querySelector('.carousel-arrow-right');
    const paginationDots = document.getElementById('blog-pagination-dots');

    // Carousel functionality variables
    let isScrolling = false;
    let startX = 0;
    let scrollLeft = 0;
    let totalPages = 0;
    let currentPage = 0;
    let cardsPerPage = 3; // Default for desktop

    /**
     * Initialize carousel controls and touch/swipe functionality
     */
    function initializeCarousel() {
        if (!carouselWrapper || !leftArrow || !rightArrow) return;

        // Calculate cards per page based on current screen size
        calculateCardsPerPage();

        // Arrow click handlers
        leftArrow.addEventListener('click', scrollLeftHandler);
        rightArrow.addEventListener('click', scrollRightHandler);

        // Touch/swipe handlers for mobile
        carouselWrapper.addEventListener('touchstart', handleTouchStart);
        carouselWrapper.addEventListener('touchmove', handleTouchMove);
        carouselWrapper.addEventListener('touchend', handleTouchEnd);

        // Mouse drag handlers for desktop
        carouselWrapper.addEventListener('mousedown', handleMouseDown);
        carouselWrapper.addEventListener('mousemove', handleMouseMove);
        carouselWrapper.addEventListener('mouseup', handleMouseUp);
        carouselWrapper.addEventListener('mouseleave', handleMouseUp);

        // Scroll event for pagination updates
        carouselWrapper.addEventListener('scroll', updateCurrentPage);

        // Prevent context menu on right click
        carouselWrapper.addEventListener('contextmenu', (e) => e.preventDefault());

        // Update arrow visibility on load
        updateArrowVisibility();
        
        // Update arrow visibility and recalculate on window resize
        window.addEventListener('resize', () => {
            calculateCardsPerPage();
            updateArrowVisibility();
        });
    }

    /**
     * Scroll carousel to the left
     */
    function scrollLeftHandler() {
        if (isScrolling) return;
        
        const scrollAmount = 400; // Scroll by one card width + gap
        carouselWrapper.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
        
        // Update arrow visibility after scroll
        setTimeout(updateArrowVisibility, 300);
    }

    /**
     * Scroll carousel to the right
     */
    function scrollRightHandler() {
        if (isScrolling) return;
        
        const scrollAmount = 400; // Scroll by one card width + gap
        carouselWrapper.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
        
        // Update arrow visibility after scroll
        setTimeout(updateArrowVisibility, 300);
    }

    /**
     * Calculate cards per page based on screen size
     */
    function calculateCardsPerPage() {
        const cardWidth = 350; // Card width + gap
        const containerWidth = carouselWrapper.clientWidth;
        cardsPerPage = Math.floor(containerWidth / cardWidth);
        return Math.max(1, cardsPerPage);
    }

    /**
     * Create pagination dots
     */
    function createPaginationDots(totalCards) {
        if (!paginationDots) return;
        
        totalPages = Math.ceil(totalCards / cardsPerPage);
        paginationDots.innerHTML = '';
        
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'pagination-dot';
            dot.setAttribute('aria-label', `Go to page ${i + 1}`);
            dot.addEventListener('click', () => goToPage(i));
            paginationDots.appendChild(dot);
        }
        
        updatePaginationDots();
    }

    /**
     * Update pagination dots active state
     */
    function updatePaginationDots() {
        if (!paginationDots) return;
        
        const dots = paginationDots.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
    }

    /**
     * Go to specific page
     */
    function goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= totalPages) return;
        
        currentPage = pageIndex;
        const scrollAmount = pageIndex * cardsPerPage * 400; // 400px per card (350px + 50px gap)
        
        carouselWrapper.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
        
        updatePaginationDots();
        setTimeout(updateArrowVisibility, 300);
    }

    /**
     * Update current page based on scroll position
     */
    function updateCurrentPage() {
        if (!carouselWrapper) return;
        
        const { scrollLeft } = carouselWrapper;
        const cardWidth = 400; // Card width + gap
        const newPage = Math.round(scrollLeft / cardWidth);
        
        if (newPage !== currentPage && newPage >= 0 && newPage < totalPages) {
            currentPage = newPage;
            updatePaginationDots();
        }
    }

    /**
     * Update arrow visibility based on scroll position
     */
    function updateArrowVisibility() {
        if (!carouselWrapper || !leftArrow || !rightArrow) return;

        const { scrollLeft, scrollWidth, clientWidth } = carouselWrapper;
        
        // Show/hide left arrow
        leftArrow.style.opacity = scrollLeft > 0 ? '1' : '0.3';
        leftArrow.style.pointerEvents = scrollLeft > 0 ? 'auto' : 'none';
        
        // Show/hide right arrow
        const maxScroll = scrollWidth - clientWidth;
        rightArrow.style.opacity = scrollLeft < maxScroll - 1 ? '1' : '0.3';
        rightArrow.style.pointerEvents = scrollLeft < maxScroll - 1 ? 'auto' : 'none';
    }

    /**
     * Touch event handlers for mobile swipe
     */
    function handleTouchStart(e) {
        isScrolling = true;
        startX = e.touches[0].pageX - carouselWrapper.offsetLeft;
        scrollLeft = carouselWrapper.scrollLeft;
    }

    function handleTouchMove(e) {
        if (!isScrolling) return;
        e.preventDefault();
        
        const x = e.touches[0].pageX - carouselWrapper.offsetLeft;
        const walk = (x - startX) * 2;
        carouselWrapper.scrollLeft = scrollLeft - walk;
    }

    function handleTouchEnd() {
        isScrolling = false;
        setTimeout(updateArrowVisibility, 100);
    }

    /**
     * Mouse event handlers for desktop drag
     */
    function handleMouseDown(e) {
        isScrolling = true;
        startX = e.pageX - carouselWrapper.offsetLeft;
        scrollLeft = carouselWrapper.scrollLeft;
        carouselWrapper.style.cursor = 'grabbing';
        carouselWrapper.style.userSelect = 'none';
    }

    function handleMouseMove(e) {
        if (!isScrolling) return;
        e.preventDefault();
        
        const x = e.pageX - carouselWrapper.offsetLeft;
        const walk = (x - startX) * 2;
        carouselWrapper.scrollLeft = scrollLeft - walk;
    }

    function handleMouseUp() {
        isScrolling = false;
        carouselWrapper.style.cursor = 'grab';
        carouselWrapper.style.userSelect = 'auto';
        setTimeout(updateArrowVisibility, 100);
    }

    async function loadBlogs() {
        try {
            // Fetch all published blogs from Supabase
            const { data: blogPosts, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching blogs:', error);
                blogContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Unable to load blog posts at the moment. Please check back later!</p>';
                return;
            }

            let postsHtml = '';
            if (!blogPosts || blogPosts.length === 0) {
                postsHtml = '<p style="text-align: center; color: #666; padding: 2rem;">No blog posts available at the moment. Please check back later!</p>';
            } else {
                for (const post of blogPosts) {
                    // Format the date
                    const postDate = post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'No date';

                    // Use excerpt if available, otherwise truncate content
                    const summary = post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'No summary available');

                    // Use image_url from Supabase if available, otherwise use a default image
                    const imageUrl = post.image_url || 'assets/images/naikurana1.jpg';

                    postsHtml += `
                        <article class="blog-card">
                            <img src="${imageUrl}" alt="${post.alt_text || post.title}" loading="lazy">
                            <div class="blog-content">
                                <h3>${post.title || 'Untitled'}</h3>
                                <p class="blog-date">${postDate}</p>
                                <p>${summary}</p>
                                <a href="blog-detail.html?slug=${post.slug || post.id}" class="btn btn-secondary">Read More</a>
                            </div>
                        </article>
                    `;
                }
            }

            blogContainer.innerHTML = postsHtml;
            
            // Initialize carousel after content is loaded
            setTimeout(() => {
                initializeCarousel();
                // Create pagination dots after carousel is initialized
                if (blogPosts && blogPosts.length > 0) {
                    createPaginationDots(blogPosts.length);
                }
            }, 100);
        } catch (err) {
            console.error('Unexpected error loading blogs:', err);
            blogContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">An unexpected error occurred. Please try again later.</p>';
        }
    }

    // Load blogs when page loads
    loadBlogs();
});