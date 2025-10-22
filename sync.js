// Portfolio Data Sync Script
// This script helps sync admin panel data with the main website

class PortfolioSync {
    constructor() {
        this.api = new PortfolioAPI();
        this.data = null;
        // Small delay to ensure DOM is ready
        setTimeout(() => this.init(), 100);
    }

    async init() {
        try {
            // Show loading state
            this.showLoading();
            
            // Load data from cloud
            this.data = await this.api.getData();
            
            if (!this.data) {
                console.error('No data available');
                this.hideLoading();
                return;
            }
            
            // Update all sections
            this.updateVideos();
            this.updateTestimonials();
            this.updateServices();
            this.updateAbout();
            this.updateContact();
            
            // Hide loading state
            this.hideLoading();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.hideLoading();
        }
    }
    
    showLoading() {
        // Add loading indicator to work section
        const workGrid = document.querySelector('#work .work-grid');
        if (workGrid) {
            workGrid.innerHTML = '<div class="loading-placeholder" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">Loading videos...</div>';
        }
        
        // Add loading to profile picture
        const profileImg = document.querySelector('#about .portrait img');
        if (profileImg) {
            profileImg.style.opacity = '0.3';
        }
    }
    
    hideLoading() {
        // Remove loading placeholders
        const loadingPlaceholders = document.querySelectorAll('.loading-placeholder');
        loadingPlaceholders.forEach(el => el.remove());
        
        // Restore profile picture opacity
        const profileImg = document.querySelector('#about .portrait img');
        if (profileImg) {
            profileImg.style.opacity = '1';
        }
    }

    updateVideos() {
        const videosGrid = document.querySelector('#work .grid.work-grid');
        if (!videosGrid) return;

        if (!this.data.videos || this.data.videos.length === 0) {
            // Hide the work section if no videos
            const workSection = document.querySelector('#work');
            if (workSection) {
                workSection.style.display = 'none';
            }
            // Hide the work link in navigation
            const workLink = document.querySelector('a[href="#work"]');
            if (workLink) {
                workLink.style.display = 'none';
            }
            return;
        }

        // Show the work section and update videos
        const workSection = document.querySelector('#work');
        if (workSection) {
            workSection.style.display = 'block';
        }
        // Show the work link in navigation
        const workLink = document.querySelector('a[href="#work"]');
        if (workLink) {
            workLink.style.display = 'block';
        }

        videosGrid.innerHTML = this.data.videos.map((video, index) => {
            const isInstagram = video.platform === 'instagram';
            const isGoogleDrive = video.platform === 'googledrive';
            const isVimeo = video.platform === 'vimeo';
            const isYouTubeShort = video.platform === 'youtube' && video.type === 'short';
            const isYouTubeVideo = video.platform === 'youtube' && video.type === 'video';
            
            let thumbnailUrl, platformIcon, platformBadge;
            
            if (isInstagram) {
                // Instagram doesn't provide reliable public thumbnails, use placeholder
                thumbnailUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjOGI1Y2Y2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTEyLjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW5zdGFncmFtIFJlZWw8L3RleHQ+Cjwvc3ZnPg==';
                platformIcon = '📱';
                platformBadge = 'Instagram Reel';
            } else if (isGoogleDrive) {
                // Use Google Drive thumbnail with multiple fallback options
                thumbnailUrl = `https://drive.google.com/thumbnail?id=${video.id}&sz=w400-h225`;
                platformIcon = '☁️';
                platformBadge = 'Google Drive';
            } else if (isVimeo) {
                // Use Vimeo thumbnail API
                thumbnailUrl = `https://vumbnail.com/${video.id}.jpg`;
                platformIcon = '🎬';
                platformBadge = 'Vimeo Video';
            } else if (isYouTubeShort) {
                thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                platformIcon = '🎬';
                platformBadge = 'YouTube Short';
            } else {
                thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                platformIcon = '🎥';
                platformBadge = 'YouTube Video';
            }
            
            return `
            <article class="work-item" data-video="${video.id}" data-platform="${video.platform}" data-type="${video.type || 'video'}" data-url="${video.url}" data-title="${video.title}" data-desc="${video.description}">
                <div class="thumb">
                    <img src="${thumbnailUrl}" alt="${video.title} thumbnail" ${!isInstagram ? `onerror="this.src='${isGoogleDrive ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjNDI4NWY0Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTEyLjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+R29vZ2xlIERyaXZlPC90ZXh0Pgo8L3N2Zz4=' : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjOGI1Y2Y2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTEyLjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW5zdGFncmFtIFJlZWw8L3RleHQ+Cjwvc3ZnPg=='}"` : ''} />
                    <button class="play-btn" aria-label="Play ${video.title}">${platformIcon}</button>
                </div>
                <div class="work-meta">
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                    <div class="platform-badge">${platformBadge}</div>
                </div>
            </article>
        `;
        }).join('');
        
        // Make sure all video elements are visible
        Array.from(videosGrid.children).forEach((videoElement) => {
            videoElement.style.opacity = '1';
            videoElement.style.transform = 'translateY(0)';
        });
        
        // Add click handlers for video play buttons
        this.setupVideoClickHandlers();
    }

    setupVideoClickHandlers() {
        // Add click handlers for play buttons
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const workItem = button.closest('.work-item');
                const videoId = workItem.getAttribute('data-video');
                const platform = workItem.getAttribute('data-platform');
                const videoUrl = workItem.getAttribute('data-url');
                const videoTitle = workItem.getAttribute('data-title');
                
                if (platform === 'instagram') {
                    // Open Instagram Reel in new tab
                    window.open(videoUrl, '_blank');
                } else if (platform === 'googledrive') {
                    // Open Google Drive video in modal
                    this.openGoogleDriveModal(videoId, videoTitle);
                } else if (platform === 'vimeo') {
                    // Open Vimeo video in modal
                    this.openVimeoModal(videoId, videoTitle);
                } else {
                    // Open YouTube video in modal
                    this.openVideoModal(videoId, videoTitle);
                }
            });
        });
        
        // Add click handlers for entire video cards
        const workItems = document.querySelectorAll('.work-item');
        workItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on the play button (already handled above)
                if (e.target.classList.contains('play-btn') || e.target.closest('.play-btn')) {
                    return;
                }
                
                const videoId = item.getAttribute('data-video');
                const platform = item.getAttribute('data-platform');
                const videoUrl = item.getAttribute('data-url');
                const videoTitle = item.getAttribute('data-title');
                
                if (platform === 'instagram') {
                    // Open Instagram Reel in new tab
                    window.open(videoUrl, '_blank');
                } else if (platform === 'googledrive') {
                    // Open Google Drive video in modal
                    this.openGoogleDriveModal(videoId, videoTitle);
                } else if (platform === 'vimeo') {
                    // Open Vimeo video in modal
                    this.openVimeoModal(videoId, videoTitle);
                } else {
                    // Open YouTube video in modal
                    this.openVideoModal(videoId, videoTitle);
                }
            });
        });
    }

    openVideoModal(videoId, videoTitle) {
        // Remove any existing video modal first
        const existingModal = document.getElementById('videoModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create new video modal
        const modal = document.createElement('div');
        modal.id = 'videoModal';
        modal.className = 'video-modal';
        modal.style.display = 'flex';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'video-modal-content';
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'video-close-btn';
        closeBtn.innerHTML = '&times;';
        
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'videoPlayer';
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.src = embedUrl;
        
        // Assemble the modal
        videoContainer.appendChild(iframe);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(videoContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add close functionality
        closeBtn.addEventListener('click', () => this.closeVideoModal());
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeVideoModal();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.closeVideoModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        if (modal) {
            const iframe = modal.querySelector('#videoPlayer');
            if (iframe) {
                iframe.src = '';
            }
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    openGoogleDriveModal(videoId, videoTitle) {
        // Remove any existing video modal first
        const existingModal = document.getElementById('videoModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create new video modal
        const modal = document.createElement('div');
        modal.id = 'videoModal';
        modal.className = 'video-modal';
        modal.style.display = 'flex';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'video-modal-content';

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'video-close-btn';
        closeBtn.innerHTML = '&times;';

        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';

        // Create iframe for Google Drive
        const iframe = document.createElement('iframe');
        iframe.id = 'videoPlayer';
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.src = `https://drive.google.com/file/d/${videoId}/preview`;

        // Assemble the modal
        videoContainer.appendChild(iframe);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(videoContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Add close functionality
        closeBtn.addEventListener('click', () => this.closeVideoModal());

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeVideoModal();
            }
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.closeVideoModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    updateTestimonials() {
        if (!this.data.testimonials || this.data.testimonials.length === 0) {
            const testimonialsTrack = document.querySelector('.testimonials-track');
            if (testimonialsTrack) {
                testimonialsTrack.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--muted);">No testimonials available yet.</div>';
            }
            return;
        }
        
        const testimonialsTrack = document.querySelector('.testimonials-track');
        if (!testimonialsTrack) {
            return;
        }

        const testimonialHTML = this.data.testimonials.map(testimonial => {
            const initial = testimonial.name.charAt(0).toUpperCase();
            return `
            <article class="testimonial-card">
                <div class="quote-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                    </svg>
                </div>
                <p class="testimonial-text">"${testimonial.text}"</p>
                <div class="testimonial-footer">
                    <div class="client-info">
                        <div class="client-avatar">${initial}</div>
                        <div>
                            <div class="client-name">${testimonial.name}</div>
                            <div class="client-role">${testimonial.role}</div>
                        </div>
                    </div>
                    <div class="stars">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5-testimonial.rating)}</div>
                </div>
            </article>
            `;
        }).join('');
        
        // Duplicate testimonials for infinite scroll effect
        testimonialsTrack.innerHTML = testimonialHTML + testimonialHTML;
        
        // Initialize smooth infinite scroll
        this.initInfiniteScroll();
    }

    initInfiniteScroll() {
        const track = document.querySelector('.testimonials-track');
        if (!track) return;

        // Remove CSS animation
        track.style.animation = 'none';
        
        let position = 0;
        const speed = 1.2; // pixels per frame
        const totalWidth = track.scrollWidth / 2; // Half because we duplicated
        
        const animate = () => {
            position -= speed;
            
            // Reset position when we've scrolled through half the content
            if (position <= -totalWidth) {
                position = 0;
            }
            
            track.style.transform = `translateX(${position}px)`;
            requestAnimationFrame(animate);
        };
        
        // Pause on hover
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
        
        animate();
    }

    reinitializeCarousel() {
        // Find the testimonials carousel
        const carousel = document.querySelector('[data-carousel]');
        if (!carousel) return;

        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(carousel.querySelectorAll('.testimonial'));
        const dotsWrap = carousel.querySelector('.carousel-dots');
        
        if (!track || slides.length === 0 || !dotsWrap) return;

        // Clear existing dots
        dotsWrap.innerHTML = '';

        let index = 0;
        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            dotsWrap.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === index));
        };

        // Create dots for each slide
        slides.forEach((_, i) => {
            const b = document.createElement('button');
            if (i === 0) b.classList.add('active');
            b.addEventListener('click', () => { index = i; update(); });
            dotsWrap.appendChild(b);
        });

        // Clear any existing timer
        if (carousel.timer) {
            clearInterval(carousel.timer);
        }

        // Set up auto-rotation
        carousel.timer = setInterval(() => { 
            index = (index + 1) % slides.length; 
            update(); 
        }, 4500);

        // Handle mouse events
        carousel.addEventListener('mouseenter', () => clearInterval(carousel.timer));
        carousel.addEventListener('mouseleave', () => { 
            carousel.timer = setInterval(() => { 
                index = (index + 1) % slides.length; 
                update(); 
            }, 4500); 
        });
    }

    updateServices() {
        if (!this.data.services || this.data.services.length === 0) return;
        
        const servicesGrid = document.querySelector('.services-grid');
        if (!servicesGrid) return;

        servicesGrid.innerHTML = this.data.services.map(service => `
            <div class="service-card">
                <div class="service-icon">${service.icon}</div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            </div>
        `).join('');
    }

    updateAbout() {
        if (!this.data.about) return;
        
        const aboutText = document.querySelector('#about .about-text');
        if (aboutText && this.data.about.text) {
            aboutText.textContent = this.data.about.text;
        }
        
        const profileImg = document.querySelector('#about .portrait img');
        if (profileImg) {
            if (this.data.about.image) {
                // Add cache buster to force image refresh
                const imageUrl = this.data.about.image;
                const cacheBuster = imageUrl.includes('?') ? '&' : '?';
                profileImg.src = imageUrl + cacheBuster + 't=' + Date.now();
                profileImg.style.opacity = '1';
            } else {
                // Use a default placeholder SVG if no image is set
                profileImg.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#1a1a2e"/>
                        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#8b5cf6" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Profile Image</text>
                    </svg>
                `);
            }
        }
        
        const resumeLink = document.querySelector('.resume-download-icon');
        if (resumeLink && this.data.about.resume) {
            resumeLink.href = this.data.about.resume;
        }
    }

    updateContact() {
        if (!this.data.contact) return;
        
        // Update email link in contact info
        const emailLink = document.querySelector('.contact-text a[href^="mailto:"]');
        if (emailLink && this.data.contact.email) {
            emailLink.href = `mailto:${this.data.contact.email}`;
            emailLink.textContent = this.data.contact.email;
        }
        
        // Update Instagram link
        const instagramLink = document.querySelector('.social[href*="instagram.com"]');
        if (instagramLink && this.data.contact.instagram) {
            // Remove @ symbol if present and format as proper Instagram URL
            const handle = this.data.contact.instagram.replace('@', '');
            instagramLink.href = `https://www.instagram.com/${handle}/`;
        }
        
        // Update YouTube link
        const youtubeLink = document.querySelector('.social[href*="youtube.com"]');
        if (youtubeLink && this.data.contact.youtube) {
            youtubeLink.href = this.data.contact.youtube;
        }
    }
}

// Initialize the sync when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioSync();
});
