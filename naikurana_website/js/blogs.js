document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    const supabase = window.supabase.createClient(
        'https://jitlnpliyugbmgmlgexx.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdGxucGxpeXVnYm1nbWxnZXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjk3MjAsImV4cCI6MjA2OTk0NTcyMH0.cLysTIfJpeR0McvKUQxwBo-8K8ZcKm1ZNL9YqvLquIE'
    );

    const blogContainer = document.getElementById('blog-posts');

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
        } catch (err) {
            console.error('Unexpected error loading blogs:', err);
            blogContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">An unexpected error occurred. Please try again later.</p>';
        }
    }

    // Load blogs when page loads
    loadBlogs();
});