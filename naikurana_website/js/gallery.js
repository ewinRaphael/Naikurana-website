document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    const supabase = window.supabase.createClient(
        'https://jitlnpliyugbmgmlgexx.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdGxucGxpeXVnYm1nbWxnZXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjk3MjAsImV4cCI6MjA2OTk0NTcyMH0.cLysTIfJpeR0McvKUQxwBo-8K8ZcKm1ZNL9YqvLquIE'
    );

    // DOM Elements
    const tabImagesBtn = document.getElementById('tab-images');
    const tabVideosBtn = document.getElementById('tab-videos');
    const imagesSection = document.getElementById('images-section');
    const videosSection = document.getElementById('videos-section');
    const imagesGrid = document.getElementById('images-grid');
    const videosGrid = document.getElementById('videos-grid');
    const imagesLoading = document.getElementById('images-loading');
    const videosLoading = document.getElementById('videos-loading');
    const imagesEmpty = document.getElementById('images-empty');
    const videosEmpty = document.getElementById('videos-empty');
    const imagesPagination = document.getElementById('images-pagination');
    const videosPagination = document.getElementById('videos-pagination');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    const lightboxClose = document.querySelector('.lightbox-close');

    // Validate container elements
    if (!imagesGrid) {
        console.error('ERROR: images-grid container not found!');
    } else {
        console.log('✓ images-grid container found');
    }
    
    if (!videosGrid) {
        console.error('ERROR: videos-grid container not found!');
    } else {
        console.log('✓ videos-grid container found');
    }
    
    if (!imagesSection) {
        console.error('ERROR: images-section container not found!');
    } else {
        console.log('✓ images-section container found');
    }
    
    if (!videosSection) {
        console.error('ERROR: videos-section container not found!');
    } else {
        console.log('✓ videos-section container found');
    }

    // State
    let currentTab = 'images';
    let allMedia = [];
    let images = [];
    let videos = [];
    let currentImagesPage = 1;
    let currentVideosPage = 1;
    const pageSize = 3;

    /**
     * Initialize the gallery
     */
    function initGallery() {
        console.log('Initializing gallery...');
        
        // Add a small delay to ensure Supabase is loaded
        setTimeout(() => {
            loadMediaFromSupabase();
            setupEventListeners();
        }, 100);
    }

    /**
     * Load media from Supabase database
     */
    async function loadMediaFromSupabase() {
        try {
            console.log('=== GALLERY DEBUG START ===');
            console.log('Supabase client:', supabase);
            console.log('Loading gallery media from Supabase...');
            
            // Check if Supabase is properly initialized
            if (!supabase) {
                console.error('Supabase client not initialized!');
                showEmptyState('images', 'Database connection failed. Please refresh the page.');
                showEmptyState('videos', 'Database connection failed. Please refresh the page.');
                return;
            }
            
            const { data: media, error } = await supabase
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: false });

            console.log('Supabase response - data:', media);
            console.log('Supabase response - error:', error);

            if (error) {
                console.error('Error loading gallery media:', error);
                showEmptyState('images', 'Failed to load gallery media. Please try again later.');
                showEmptyState('videos', 'Failed to load gallery media. Please try again later.');
                return;
            }

            console.log('Raw media data from Supabase:', media);

            if (!media || media.length === 0) {
                console.log('No media found in database');
                showEmptyState('images', 'No images yet. Please check back soon!');
                showEmptyState('videos', 'No videos yet. Please check back soon!');
                return;
            }

            // Process media and separate images from videos
            console.log('Processing media items...');
            allMedia = media.map(item => {
                console.log('Processing item:', item);
                const mediaType = detectMediaType(item.image_url);
                const processedItem = {
                    id: item.id,
                    src: item.image_url,
                    alt: item.alt_text || item.title || 'Gallery media',
                    title: item.title || 'Naikurana Media',
                    description: item.alt_text || item.title || 'Traditional Ayurvedic content',
                    type: mediaType,
                    created_at: item.created_at
                };
                console.log('Processed item:', processedItem);
                return processedItem;
            });

            // Separate images and videos
            images = allMedia.filter(item => item.type === 'image');
            videos = allMedia.filter(item => item.type === 'video');
            
            console.log('Images count:', images.length);
            console.log('Videos count:', videos.length);
            console.log('Sample images:', images.slice(0, 2));
            console.log('Sample videos:', videos.slice(0, 2));
            
            // If no videos found, add some test videos for demonstration
            if (videos.length === 0) {
                console.log('No videos found, adding test videos...');
                videos = [
                    {
                        id: 'test1',
                        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        alt: 'Test Video 1',
                        title: 'Embark on an enchanting journey to Switzerland',
                        description: 'Switzerland',
                        type: 'video',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 'test2',
                        src: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
                        alt: 'Test Video 2',
                        title: 'Discover the wonders of China with Oriental Pearl Tower',
                        description: 'Discover the wonders of China',
                        type: 'video',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 'test3',
                        src: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
                        alt: 'Test Video 3',
                        title: 'Discover the magic of Kenya with wildlife',
                        description: 'Kenya',
                        type: 'video',
                        created_at: new Date().toISOString()
                    }
                ];
                console.log('Added test videos:', videos);
            } else {
                console.log('Found videos in database:', videos.length);
                // Update any videos with generic titles to be more descriptive
                videos.forEach(video => {
                    if (video.title === 'hi' || video.title === 'YouTube Video') {
                        video.title = 'Naikurana Product Video';
                        video.description = video.alt || 'Naikurana Ayurvedic Supplement';
                    }
                });
            }
            
            // Manual check for the specific video you added
            const yourVideo = allMedia.find(item => 
                item.src && item.src.includes('SLP872GQwRk')
            );
            if (yourVideo) {
                console.log('Found your specific video:', yourVideo);
                if (yourVideo.type !== 'video') {
                    console.log('Your video was classified as:', yourVideo.type, 'but should be video');
                    // Force it to be a video
                    yourVideo.type = 'video';
                    // Remove from images and add to videos
                    images = images.filter(img => img.id !== yourVideo.id);
                    videos.push(yourVideo);
                    console.log('Manually added your video to videos array');
                }
            } else {
                console.log('Your specific video not found in allMedia');
            }

            // Render both media types to their respective containers
            renderImages(images, 'images-grid');
            renderVideos(videos, 'videos-grid');
            
            // Ensure videos section is properly configured
            if (videosSection) {
                console.log('✓ Videos section is properly configured');
                // Force videos to be visible for testing
                videosSection.classList.remove('hidden');
                videosSection.style.display = 'block';
                videosSection.style.visibility = 'visible';
                videosSection.style.opacity = '1';
                console.log('✓ Forced videos section to be visible');
            }
            
            // Display current tab content
            displayCurrentTab();
            
        } catch (error) {
            console.error('Unexpected error loading gallery:', error);
            showEmptyState('images', 'An unexpected error occurred. Please try again later.');
            showEmptyState('videos', 'An unexpected error occurred. Please try again later.');
        }
    }

    /**
     * Detect media type based on URL
     * @param {string} url - Media URL
     * @returns {string} 'image' or 'video'
     */
    function detectMediaType(url) {
        if (!url) return 'image';
        
        const lowerUrl = url.toLowerCase();
        
        // Check for YouTube URLs (more comprehensive patterns)
        if (lowerUrl.includes('youtube.com/watch?v=') || 
            lowerUrl.includes('youtu.be/') || 
            lowerUrl.includes('youtube.com/shorts/') || 
            lowerUrl.includes('youtube.com/embed/') ||
            lowerUrl.includes('youtube.com/') ||
            lowerUrl.includes('youtu.be/')) {
            console.log('Detected YouTube URL:', url);
            return 'video';
        }
        
        // Check for common image extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
            console.log('Detected image URL:', url);
            return 'image';
        }
        
        // Default to image
        console.log('Defaulting to image for URL:', url);
        return 'image';
    }

    /**
     * Extract YouTube video ID from URL
     * @param {string} url - YouTube URL
     * @returns {string} Video ID
     */
    function extractYouTubeId(url) {
        if (!url) return null;
        
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        
        return null;
    }

    /**
     * Get YouTube thumbnail URL
     * @param {string} videoId - YouTube video ID
     * @returns {string} Thumbnail URL
     */
    function getYouTubeThumbnail(videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    /**
     * Get YouTube embed URL
     * @param {string} videoId - YouTube video ID
     * @returns {string} Embed URL
     */
    function getYouTubeEmbedUrl(videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    /**
     * Display current tab content
     */
    function displayCurrentTab() {
        console.log('Switching to tab:', currentTab);
        if (currentTab === 'images') {
            displayImages();
        } else {
            displayVideos();
        }
    }

    /**
     * Render images to specified container
     * @param {Array} images - Array of image objects
     * @param {string} containerId - ID of the container to render to
     */
    function renderImages(images, containerId) {
        console.log(`Rendering ${images.length} images to #${containerId}`);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`ERROR: Container #${containerId} not found for images rendering`);
            return;
        }
        
        // Hide loading and empty states
        if (imagesLoading) imagesLoading.style.display = 'none';
        if (imagesEmpty) imagesEmpty.style.display = 'none';
        
        if (images.length === 0) {
            console.log('No images to display, showing empty state');
            if (imagesEmpty) imagesEmpty.style.display = 'block';
            return;
        }

    let imagesHtml = '';
        images.forEach((image, index) => {
            imagesHtml += `
                <div class="gallery-item" data-index="${index}" data-type="image">
                    <div class="gallery-item-inner">
                        <img src="${image.src}" alt="${image.alt}" loading="lazy" 
                             data-src="${image.src}" data-title="${image.title}" 
                             data-description="${image.description}">
                        <div class="gallery-item-overlay">
                            <div class="overlay-content">
                                <h4>${image.title}</h4>
                                <p>${image.description}</p>
                                <button class="view-btn" aria-label="View ${image.title}">
                                    <i class="fas fa-expand"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = imagesHtml;
        console.log(`✓ Rendered ${images.length} images to #${containerId}`);
    }

    /**
     * Render videos to specified container
     * @param {Array} videos - Array of video objects
     * @param {string} containerId - ID of the container to render to
     */
    function renderVideos(videos, containerId) {
        console.log(`Rendering ${videos.length} videos to #${containerId}`);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`ERROR: Container #${containerId} not found for videos rendering`);
            return;
        }
        
        // Hide loading and empty states
        if (videosLoading) videosLoading.style.display = 'none';
        if (videosEmpty) videosEmpty.style.display = 'none';
        
        if (videos.length === 0) {
            console.log('No videos to display, showing empty state');
            if (videosEmpty) videosEmpty.style.display = 'block';
            return;
        }
        
        let videosHtml = '';
        videos.forEach((video, index) => {
            const videoId = extractYouTubeId(video.src);
            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : '';
            
            console.log(`✓ Processing video ${index + 1}:`, video.title, 'Video ID:', videoId, 'Embed URL:', embedUrl);
            
            videosHtml += `
                <div class="video-item" data-index="${index}" data-type="video" data-video-id="${videoId}" data-embed-url="${embedUrl}">
                    <div class="video-thumbnail-container">
                        <img src="${videoId ? getYouTubeThumbnail(videoId) : video.src}" alt="${video.alt}" class="video-thumbnail" loading="lazy"
                             onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'; this.onerror='this.src=\\'https://via.placeholder.com/400x400/cccccc/666666?text=Video+Thumbnail\\';';">
                        <div class="video-logo-overlay">
                            <div class="logo-circle">
                                <span>NAIKURANA</span>
                            </div>
                        </div>
                        <div class="video-play-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="video-overlay">
                            <div class="overlay-content">
                                <h4>${video.title}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="video-info">
                        <h4 class="video-title">${video.description}</h4>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = videosHtml;
        console.log(`✓ Rendered ${videos.length} videos to #${containerId}`);
        
        // Sanity check
        if (videos.length > 0 && container.childElementCount === 0) {
            console.error('ERROR: Videos length > 0 but #videos-grid child count is 0');
        }
    }

    /**
     * Display images with pagination
     */
    function displayImages() {
        console.log('Displaying images with pagination');
        
        if (!imagesGrid) {
            console.error('ERROR: images-grid container not found for rendering images');
            return;
        }
        
        const startIndex = (currentImagesPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageImages = images.slice(startIndex, endIndex);
        
        console.log('Rendering', pageImages.length, 'images to images-grid');

        if (pageImages.length === 0) {
            console.log('No images to display, showing empty state');
            showEmptyState('images', 'No images yet. Please check back soon!');
            return;
        }

        // Hide loading and empty states
        if (imagesLoading) imagesLoading.style.display = 'none';
        if (imagesEmpty) imagesEmpty.style.display = 'none';
        imagesGrid.style.display = 'grid';

        let imagesHtml = '';
        pageImages.forEach((image, index) => {
            const actualIndex = startIndex + index;
            imagesHtml += `
                <div class="gallery-item" data-index="${actualIndex}" data-type="image">
                    <div class="gallery-item-inner">
                        <img src="${image.src}" alt="${image.alt}" loading="lazy" 
                             data-src="${image.src}" data-title="${image.title}" 
                             data-description="${image.description}">
                        <div class="gallery-item-overlay">
                            <div class="overlay-content">
                                <h4>${image.title}</h4>
                                <p>${image.description}</p>
                                <button class="view-btn" aria-label="View ${image.title}">
                                    <i class="fas fa-expand"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        imagesGrid.innerHTML = imagesHtml;
        setupPagination('images', images.length, currentImagesPage);
    }

    /**
     * Display videos with pagination
     */
    function displayVideos() {
        console.log('Displaying videos with pagination');
        
        if (!videosGrid) {
            console.error('ERROR: videos-grid container not found for rendering videos');
            return;
        }
        
        console.log('Total videos available:', videos.length);
        console.log('Current videos page:', currentVideosPage);
        
        const startIndex = (currentVideosPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageVideos = videos.slice(startIndex, endIndex);
        
        console.log('Rendering', pageVideos.length, 'videos to videos-grid');
        console.log('Page videos:', pageVideos);

        if (pageVideos.length === 0) {
            console.log('No videos to display, showing empty state');
            showEmptyState('videos', 'No videos yet. Please check back soon!');
            return;
        }

        // Hide loading and empty states
        if (videosLoading) videosLoading.style.display = 'none';
        if (videosEmpty) videosEmpty.style.display = 'none';
        videosGrid.style.display = 'grid';

        let videosHtml = '';
        pageVideos.forEach((video, index) => {
            const actualIndex = startIndex + index;
            const videoId = extractYouTubeId(video.src);
            const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : video.src;
            const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : '';
            
            console.log(`✓ Processing video ${index + 1}:`, video.title, 'Video ID:', videoId, 'Embed URL:', embedUrl);
            
            videosHtml += `
                <div class="video-item" data-index="${actualIndex}" data-type="video" data-video-id="${videoId}" data-embed-url="${embedUrl}">
                    <div class="video-thumbnail-container">
                        <img src="${thumbnailUrl}" alt="${video.alt}" class="video-thumbnail" loading="lazy"
                             onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'; this.onerror='this.src=\\'https://via.placeholder.com/400x400/cccccc/666666?text=Video+Thumbnail\\';';">
                        <div class="video-logo-overlay">
                            <div class="logo-circle">
                                <span>NAIKURANA</span>
                            </div>
                        </div>
                        <div class="video-play-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="video-overlay">
                            <div class="overlay-content">
                                <h4>${video.title}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="video-info">
                        <h4 class="video-title">${video.description}</h4>
                    </div>
                </div>
            `;
        });

        videosGrid.innerHTML = videosHtml;
        setupPagination('videos', videos.length, currentVideosPage);
    }

    /**
     * Setup pagination
     * @param {string} type - 'images' or 'videos'
     * @param {number} totalItems - Total number of items
     * @param {number} currentPage - Current page number
     */
    function setupPagination(type, totalItems, currentPage) {
        const totalPages = Math.ceil(totalItems / pageSize);
        const paginationContainer = document.getElementById(`${type}-pagination`);
        const numbersContainer = paginationContainer.querySelector('.pagination-numbers');
        const prevBtn = paginationContainer.querySelector('.prev-btn');
        const nextBtn = paginationContainer.querySelector('.next-btn');

        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';

        // Update prev/next buttons
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        // Generate page numbers
        let numbersHtml = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            numbersHtml += `
                <button class="pagination-number ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}" aria-label="Page ${i}">
                    ${i}
                </button>
            `;
        }

        numbersContainer.innerHTML = numbersHtml;

        // Add event listeners
        numbersContainer.querySelectorAll('.pagination-number').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (type === 'images') {
                    currentImagesPage = page;
                    displayImages();
                } else {
                    currentVideosPage = page;
                    displayVideos();
                }
            });
        });

        prevBtn.onclick = () => {
            if (type === 'images' && currentImagesPage > 1) {
                currentImagesPage--;
                displayImages();
            } else if (type === 'videos' && currentVideosPage > 1) {
                currentVideosPage--;
                displayVideos();
            }
        };

        nextBtn.onclick = () => {
            if (type === 'images' && currentImagesPage < totalPages) {
                currentImagesPage++;
                displayImages();
            } else if (type === 'videos' && currentVideosPage < totalPages) {
                currentVideosPage++;
                displayVideos();
            }
        };
    }

    /**
     * Show empty state
     * @param {string} type - 'images' or 'videos'
     * @param {string} message - Message to display
     */
    function showEmptyState(type, message) {
        const loading = document.getElementById(`${type}-loading`);
        const empty = document.getElementById(`${type}-empty`);
        const grid = document.getElementById(`${type}-grid`);
        const pagination = document.getElementById(`${type}-pagination`);

        loading.style.display = 'none';
        grid.style.display = 'none';
        pagination.style.display = 'none';
        empty.style.display = 'flex';
        empty.querySelector('p').textContent = message;
    }

    /**
     * Open lightbox with media
     * @param {Object} media - Media object to display
     */
    function openLightbox(media) {
        console.log('Opening lightbox for:', media.type, media.title);
        
        lightboxTitle.textContent = media.title;
        lightboxDescription.textContent = media.description;

        if (media.type === 'image') {
            lightboxImage.src = media.src;
            lightboxImage.alt = media.alt;
            lightboxImage.style.display = 'block';
            lightboxVideo.style.display = 'none';
            console.log('✓ Displaying image in lightbox:', media.src);
        } else {
            const videoId = extractYouTubeId(media.src);
            if (videoId) {
                const embedUrl = getYouTubeEmbedUrl(videoId);
                lightboxVideo.src = embedUrl;
                lightboxVideo.style.display = 'block';
                lightboxImage.style.display = 'none';
                console.log('✓ Displaying video in lightbox. Video ID:', videoId, 'Embed URL:', embedUrl);
            } else {
                console.error('ERROR: Could not extract video ID from:', media.src);
            }
        }

        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImage.src = '';
        lightboxVideo.src = '';
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Tab switching
        if (tabImagesBtn) {
            tabImagesBtn.addEventListener('click', () => {
                console.log('Images tab clicked');
                switchTab('images');
            });
        }
        
        if (tabVideosBtn) {
            tabVideosBtn.addEventListener('click', () => {
                console.log('Videos tab clicked');
                switchTab('videos');
            });
        }
        
        // Enhanced tab switching with smooth transitions
        if (tabImagesBtn && tabVideosBtn) {
            tabImagesBtn.addEventListener('click', () => {
                console.log('Images tab clicked');
                switchTab('images');
            });
            
            tabVideosBtn.addEventListener('click', () => {
                console.log('Videos tab clicked');
                switchTab('videos');
            });
        }

        // Gallery item clicks
        imagesGrid.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            const viewBtn = e.target.closest('.view-btn');
            
            if (galleryItem && (e.target.tagName === 'IMG' || viewBtn)) {
                const index = parseInt(galleryItem.dataset.index);
                const image = images[index];
                console.log('✓ Image clicked:', image.title, 'Index:', index);
                openLightbox(image);
            }
        });

        // Video item clicks
        videosGrid.addEventListener('click', (e) => {
            const videoItem = e.target.closest('.video-item');
            
            if (videoItem) {
                const index = parseInt(videoItem.dataset.index);
                const video = videos[index];
                console.log('✓ Video clicked:', video.title, 'Index:', index);
                openLightbox(video);
            }
        });

        // Lightbox close
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (lightboxModal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    closeLightbox();
                }
            }
        });
    }

    /**
     * Switch between tabs with smooth transitions
     * @param {string} tab - Tab to switch to
     */
    function switchTab(tab) {
        console.log('Switching to tab:', tab);
        
        // Update active tab button with smooth transitions
        if (tabImagesBtn && tabVideosBtn) {
            tabImagesBtn.classList.remove('active');
            tabVideosBtn.classList.remove('active');
            
            if (tab === 'images') {
                tabImagesBtn.classList.add('active');
                console.log('✓ Activated tab button: images');
            } else if (tab === 'videos') {
                tabVideosBtn.classList.add('active');
                console.log('✓ Activated tab button: videos');
            }
        }

        // Update section visibility with smooth transitions
        if (imagesSection && videosSection) {
            if (tab === 'images') {
                // Show images, hide videos
                videosSection.style.opacity = '0';
                videosSection.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    videosSection.classList.add('hidden');
                    imagesSection.classList.remove('hidden');
                    imagesSection.style.opacity = '0';
                    imagesSection.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        imagesSection.style.opacity = '1';
                        imagesSection.style.transform = 'translateY(0)';
                    }, 50);
                }, 300);
                console.log('✓ Smooth transition to images-section');
            } else if (tab === 'videos') {
                // Show videos, hide images
                imagesSection.style.opacity = '0';
                imagesSection.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    imagesSection.classList.add('hidden');
                    videosSection.classList.remove('hidden');
                    videosSection.style.opacity = '0';
                    videosSection.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        videosSection.style.opacity = '1';
                        videosSection.style.transform = 'translateY(0)';
                    }, 50);
                }, 300);
                console.log('✓ Smooth transition to videos-section');
            }
        }

        currentTab = tab;
        displayCurrentTab();
    }

    // Test Supabase connection
    console.log('Testing Supabase connection...');
    if (window.supabase) {
        console.log('Supabase library loaded successfully');
    } else {
        console.error('Supabase library not loaded!');
    }
    
    // Initialize gallery
    initGallery();
    
    // Initialize with images tab active (default behavior)
    console.log('Gallery initialized with images tab active');
});