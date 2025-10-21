// Admin Panel JavaScript
class PortfolioAdmin {
    constructor() {
        this.api = new PortfolioAPI();
        this.data = {};
        this.currentEditingId = null;
        this.isAuthenticated = this.checkAuthentication();
        this.adminPassword = 'adminsonu';
        this.init().catch(console.error);
    }

    async init() {
        this.setupEventListeners();
        
        if (this.isAuthenticated) {
            this.showAdminPanel();
            await this.loadData();
            // Ensure submissions array exists
            if (!this.data.submissions) {
                this.data.submissions = [];
            }
            
            // Migrate existing localStorage submissions to cloud (one-time migration)
            await this.migrateLocalSubmissions();
            this.loadVideos();
            this.loadTestimonials();
            this.loadAbout();
            this.loadContact();
            this.loadSubmissions();
        } else {
            this.showLoginScreen();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));

        // Mobile menu toggle
        document.getElementById('mobileMenuToggle')?.addEventListener('click', () => this.toggleMobileMenu());

        // Sidebar navigation
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section);
                // Close mobile menu when navigating
                this.closeMobileMenu();
            });
        });

        // Form submissions
        document.getElementById('videoForm')?.addEventListener('submit', (e) => this.handleVideoSubmit(e));
        document.getElementById('testimonialForm')?.addEventListener('submit', (e) => this.handleTestimonialSubmit(e));
        document.getElementById('serviceForm')?.addEventListener('submit', (e) => this.handleServiceSubmit(e));
        document.getElementById('aboutForm')?.addEventListener('submit', (e) => this.handleAboutSubmit(e));
        document.getElementById('contactForm')?.addEventListener('submit', (e) => this.handleContactSubmit(e));

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('adminSidebar');
            const toggle = document.getElementById('mobileMenuToggle');
            
            if (sidebar && sidebar.classList.contains('mobile-open') && 
                !sidebar.contains(e.target) && 
                !toggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    // Authentication Methods
    checkAuthentication() {
        const session = sessionStorage.getItem('adminAuthenticated');
        const timestamp = sessionStorage.getItem('adminTimestamp');
        const now = Date.now();
        
        // Check if session is valid (24 hours)
        if (session === 'true' && timestamp && (now - parseInt(timestamp)) < 24 * 60 * 60 * 1000) {
            return true;
        }
        
        // Clear invalid session
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminTimestamp');
        return false;
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }

    showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
    }

    async handleLogin(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === this.adminPassword) {
            // Set authentication session
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminTimestamp', Date.now().toString());
            
            this.isAuthenticated = true;
            this.showAdminPanel();
            await this.loadData();
            this.loadVideos();
            this.loadTestimonials();
            this.loadAbout();
            this.loadContact();
            this.loadSubmissions();
        } else {
            alert('❌ Incorrect password! Please try again.');
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminTimestamp');
            this.isAuthenticated = false;
            this.showLoginScreen();
            document.getElementById('adminPassword').value = '';
        }
    }

    // Mobile menu methods
    toggleMobileMenu() {
        const sidebar = document.getElementById('adminSidebar');
        const toggle = document.getElementById('mobileMenuToggle');
        
        if (sidebar && toggle) {
            sidebar.classList.toggle('mobile-open');
            toggle.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('adminSidebar');
        const toggle = document.getElementById('mobileMenuToggle');
        
        if (sidebar && toggle) {
            sidebar.classList.remove('mobile-open');
            toggle.classList.remove('active');
        }
    }

    // Data Management
    async loadData() {
        try {
            this.data = await this.api.getData();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to empty data structure
            this.data = {
            videos: [],
            testimonials: [],
            services: [],
                about: {},
                contact: {}
            };
        }
    }

    async saveData() {
        await this.api.saveData(this.data);
        this.updateMainWebsite();
    }

    updateMainWebsite() {
        // This will update the main website files
        this.updateIndexHTML();
    }

    updateIndexHTML() {
        // Update videos in index.html
        const videosGrid = document.querySelector('#work .work-grid');
        if (videosGrid && this.data.videos.length > 0) {
            videosGrid.innerHTML = this.data.videos.map((video, index) => `
                <article class="work-item reveal-up" data-video="${video.id}" data-title="${video.title}" data-desc="${video.description}">
                    <div class="thumb">
                        <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title} thumbnail" />
                        <button class="play-btn" aria-label="Play ${video.title}">▶</button>
                    </div>
                    <div class="work-meta">
                        <h3>${video.title}</h3>
                        <p>${video.description}</p>
                    </div>
                </article>
            `).join('');
        }

        // Update testimonials
        const testimonialsTrack = document.querySelector('.carousel-track');
        if (testimonialsTrack && this.data.testimonials.length > 0) {
            testimonialsTrack.innerHTML = this.data.testimonials.map(testimonial => `
                <article class="testimonial">
                    <p>"${testimonial.text}"</p>
                    <div class="meta">
                        <span class="name">${testimonial.name}</span>
                        <span class="role">${testimonial.role}</span>
                    </div>
                    <div class="stars" aria-label="${testimonial.rating} star rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5-testimonial.rating)}</div>
                </article>
            `).join('');
        }

        // Update services
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid && this.data.services.length > 0) {
            servicesGrid.innerHTML = this.data.services.map(service => `
                <article class="service-card tilt reveal-up">
                    <div class="icon">${service.icon}</div>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                </article>
            `).join('');
        }

        // Update about section
        if (this.data.about.text) {
            const aboutText = document.querySelector('.about-text');
            if (aboutText) aboutText.textContent = this.data.about.text;
        }

        // Update contact info
        if (this.data.contact.email) {
            const emailLink = document.querySelector('a[href^="mailto:"]');
            if (emailLink) emailLink.href = `mailto:${this.data.contact.email}`;
        }
    }

    // Navigation
    switchSection(sectionName) {
        // Update sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update main content
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Load submissions when switching to submissions section
        if (sectionName === 'submissions') {
            this.loadSubmissions();
        }
        
        // Simple fix for submissions section
        if (sectionName === 'submissions') {
            setTimeout(() => {
                const submissionsSection = document.getElementById('submissions');
                
                if (submissionsSection) {
                    // Make ALL parent containers visible
                    const adminPanel = document.getElementById('adminPanel');
                    const adminMain = document.querySelector('.admin-main');
                    
                    if (adminPanel) {
                        adminPanel.style.display = 'flex';
                        adminPanel.style.visibility = 'visible';
                        adminPanel.style.opacity = '1';
                    }
                    
                    if (adminMain) {
                        adminMain.style.display = 'block';
                        adminMain.style.visibility = 'visible';
                        adminMain.style.opacity = '1';
                        adminMain.style.overflow = 'visible';
                    }
                    
                    // Make section visible
                    submissionsSection.style.display = 'block';
                    submissionsSection.style.visibility = 'visible';
                    submissionsSection.style.opacity = '1';
                    submissionsSection.classList.add('active');
                    
                    // Remove any existing test elements
                    const existingTest = document.querySelector('[style*="background: red"]');
                    if (existingTest) {
                        existingTest.remove();
                    }
                    
                    // Get submissions from cloud data
                    const submissions = this.data.submissions || [];
                    const submissionsList = document.getElementById('submissionsList');
                    
                    if (submissions.length > 0) {
                    // Create a completely new overlay element to bypass all CSS
                    const overlay = document.createElement('div');
                    overlay.id = 'submissionsOverlay';
                    overlay.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.95) !important; z-index: 99999 !important; overflow: auto !important; padding: 20px !important; display: flex !important; flex-direction: column !important;';
                    
                    // Add close button
                    const closeBtn = document.createElement('button');
                    closeBtn.textContent = '✕ Close';
                    closeBtn.style.cssText = 'position: sticky !important; top: 10px !important; right: 10px !important; align-self: flex-end !important; background: #ef4444 !important; color: white !important; border: none !important; padding: 10px 20px !important; border-radius: 6px !important; cursor: pointer !important; font-size: 16px !important; margin-bottom: 20px !important; z-index: 100000 !important;';
                    closeBtn.onclick = () => {
                        overlay.remove();
                        admin.switchSection('videos'); // Go back to videos section
                    };
                    
                    // Add title
                    const title = document.createElement('h1');
                    title.textContent = 'Form Submissions (' + submissions.length + ')';
                    title.style.cssText = 'color: white !important; text-align: center !important; margin: 0 0 30px 0 !important; font-size: 32px !important;';
                    
                    // Add submissions
                    const container = document.createElement('div');
                    container.style.cssText = 'max-width: 1200px !important; margin: 0 auto !important; width: 100% !important;';
                    
                    if (submissions.length > 0) {
                        container.innerHTML = submissions.map(submission => {
                            const isRead = submission.status === 'read';
                            const borderColor = isRead ? '#888' : '#06b6d4';
                            const statusColor = isRead ? '#888' : '#8b5cf6';
                            const statusText = isRead ? '✓ Read' : '● New';
                            
                            return `
                            <div style="background: #1a1a1a !important; border: 2px solid ${borderColor} !important; padding: 25px !important; margin: 20px 0 !important; border-radius: 12px !important; opacity: ${isRead ? '0.7' : '1'} !important;">
                                <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 15px !important;">
                                    <h3 style="color: #06b6d4 !important; margin: 0 !important; font-size: 24px !important;">${submission.name || 'No name'}</h3>
                                    <span style="color: ${statusColor} !important; font-size: 14px !important; font-weight: 600 !important; background: rgba(${isRead ? '136,136,136' : '139,92,246'},0.2) !important; padding: 6px 12px !important; border-radius: 6px !important;">${statusText}</span>
                                </div>
                                <p style="color: white !important; margin: 10px 0 !important; font-size: 16px !important;"><strong style="color: #888;">Email:</strong> ${submission.email || 'No email'}</p>
                                <p style="color: white !important; margin: 10px 0 !important; font-size: 16px !important;"><strong style="color: #888;">Phone:</strong> ${submission.phone || 'No phone'}</p>
                                <p style="color: white !important; margin: 10px 0 !important; font-size: 16px !important;"><strong style="color: #888;">Message:</strong> ${submission.message || 'No message'}</p>
                                <p style="color: #666 !important; font-size: 14px !important; margin: 20px 0 10px 0 !important;">Submitted: ${new Date(submission.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</p>
                                <div style="margin-top: 20px !important; display: flex !important; gap: 15px !important;">
                                    ${!isRead ? `<button onclick="admin.markAsRead('${submission.id}'); document.getElementById('submissionsOverlay').remove(); admin.switchSection('submissions');" style="background: #06b6d4 !important; color: white !important; border: none !important; padding: 12px 24px !important; border-radius: 8px !important; cursor: pointer !important; font-size: 16px !important; font-weight: 600 !important;">✓ Mark as Read</button>` : `<button disabled style="background: #444 !important; color: #888 !important; border: none !important; padding: 12px 24px !important; border-radius: 8px !important; cursor: not-allowed !important; font-size: 16px !important; font-weight: 600 !important;">✓ Already Read</button>`}
                                    <button onclick="admin.deleteSubmission('${submission.id}'); document.getElementById('submissionsOverlay').remove(); admin.switchSection('submissions');" style="background: #ef4444 !important; color: white !important; border: none !important; padding: 12px 24px !important; border-radius: 8px !important; cursor: pointer !important; font-size: 16px !important; font-weight: 600 !important;">🗑 Delete</button>
                                </div>
                            </div>
                        `;
                        }).join('');
                    } else {
                        container.innerHTML = '<p style="color: white !important; text-align: center !important; font-size: 20px !important; padding: 50px !important;">No submissions yet</p>';
                    }
                    
                    overlay.appendChild(closeBtn);
                    overlay.appendChild(title);
                    overlay.appendChild(container);
                    document.body.appendChild(overlay);
                    } else {
                        alert('No submissions found');
                    }
                } else {
                    console.error('Submissions section not found!');
                }
            }, 100);
        }
    }


    // Videos Management
    loadVideos() {
        const grid = document.getElementById('videosGrid');
        if (!grid) return;

        if (this.data.videos.length === 0) {
            grid.innerHTML = '<p style="color: var(--admin-muted); text-align: center; padding: 40px;">No videos added yet. Click "Add Video" to get started.</p>';
            return;
        }

        grid.innerHTML = this.data.videos.map(video => {
            // Generate thumbnail based on platform
            let thumbnailSrc = '';
            let platformIcon = '';
            
            if (video.platform === 'instagram') {
                // Instagram Reel thumbnail - use SVG placeholder like main page
                thumbnailSrc = `data:image/svg+xml;base64,${btoa(`
                    <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#f58529;stop-opacity:1" />
                                <stop offset="25%" style="stop-color:#dd2a7b;stop-opacity:1" />
                                <stop offset="50%" style="stop-color:#8134af;stop-opacity:1" />
                                <stop offset="75%" style="stop-color:#515bd4;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#405de6;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#instagram-gradient)"/>
                        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Instagram Reel</text>
                    </svg>
                `)}`;
                platformIcon = '📱';
            } else if (video.platform === 'youtube') {
                thumbnailSrc = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                platformIcon = '🎥';
            } else if (video.platform === 'vimeo') {
                thumbnailSrc = `https://vumbnail.com/${video.id}.jpg`;
                platformIcon = '🎬';
            } else if (video.platform === 'googledrive') {
                thumbnailSrc = `https://drive.google.com/thumbnail?id=${video.id}`;
                platformIcon = '☁️';
            } else {
                // Default thumbnail
                thumbnailSrc = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                platformIcon = '🎥';
            }
            
            return `
            <div class="content-card">
                <div class="video-preview">
                        <img src="${thumbnailSrc}" alt="${video.title}" onerror="this.src='data:image/svg+xml;base64,${btoa('<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#333"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="white" font-family="Arial" font-size="16">Thumbnail Error</text></svg>')}'">
                        <div class="platform-badge">${platformIcon} ${video.platform || 'youtube'}</div>
                </div>
                <h3>${video.title}</h3>
                <p>${video.description}</p>
                <div class="meta">Category: ${video.category} | ID: ${video.id}</div>
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="admin.editVideo('${video.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="admin.deleteVideo('${video.id}')">Delete</button>
                </div>
            </div>
            `;
        }).join('');
    }

    addVideo() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Add New Video';
        document.getElementById('videoForm').reset();
        document.getElementById('videoModal').classList.add('active');
    }

    editVideo(videoId) {
        const video = this.data.videos.find(v => v.id === videoId);
        if (!video) {
            console.error('Video not found:', videoId);
            return;
        }

        this.currentEditingId = videoId;
        document.getElementById('modalTitle').textContent = 'Edit Video';
        
        // Populate form fields
        const videoIdField = document.getElementById('videoId');
        const titleField = document.getElementById('videoTitle');
        const descField = document.getElementById('videoDescription');
        const categoryField = document.getElementById('videoCategory');
        
        if (videoIdField) videoIdField.value = video.id;
        if (titleField) titleField.value = video.title || '';
        if (descField) descField.value = video.description || '';
        if (categoryField) categoryField.value = video.category || 'vlog';
        
        document.getElementById('videoModal').classList.add('active');
    }

    async deleteVideo(videoId) {
        if (confirm('Are you sure you want to delete this video?')) {
            this.data.videos = this.data.videos.filter(v => v.id !== videoId);
            await this.saveData();
            this.loadVideos();
            alert('Video deleted successfully!');
        }
    }

    // Extract video ID and platform from URL
    extractVideoInfo(url) {
        if (!url) return { platform: 'unknown', id: '', url: '' };
        
        // If it's already just an ID (no special characters), assume YouTube
        if (!url.includes('/') && !url.includes('=') && !url.includes('&') && !url.includes('?')) {
            return { platform: 'youtube', id: url, url: `https://www.youtube.com/watch?v=${url}` };
        }
        
        // Check for Google Drive
        if (url.includes('drive.google.com/file/d/')) {
            const match = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
            if (match && match[1]) {
                return { 
                    platform: 'googledrive', 
                    type: 'video',
                    id: match[1], 
                    url: url 
                };
            }
        }
        
        // Check for Vimeo
        if (url.includes('vimeo.com/')) {
            const match = url.match(/vimeo\.com\/(\d+)/);
            if (match && match[1]) {
                return { 
                    platform: 'vimeo', 
                    type: 'video',
                    id: match[1], 
                    url: url 
                };
            }
        }
        
        // Check for Instagram Reels
        if (url.includes('instagram.com/reel/')) {
            const match = url.match(/instagram\.com\/reel\/([^\/\?]+)/);
            if (match && match[1]) {
                return { 
                    platform: 'instagram', 
                    type: 'reel',
                    id: match[1], 
                    url: url 
                };
            }
        }
        
        // Check for YouTube URLs
        const youtubePatterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/embed\/([^&\n?#]+)/
        ];
        
        for (const pattern of youtubePatterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                const videoId = match[1].split('?')[0].split('&')[0];
                // Check if it's a YouTube Short (only based on URL path)
                const isShort = url.includes('/shorts/');
                return { 
                    platform: 'youtube', 
                    type: isShort ? 'short' : 'video',
                    id: videoId, 
                    url: `https://www.youtube.com/watch?v=${videoId}` 
                };
            }
        }
        
        return { platform: 'unknown', id: '', url: url };
    }

    async handleVideoSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rawVideoUrl = formData.get('videoId');
        const videoInfo = this.extractVideoInfo(rawVideoUrl);
        
        if (this.currentEditingId) {
            // Update existing video
            const index = this.data.videos.findIndex(v => v.id === this.currentEditingId);
            if (index !== -1) {
                // Update only the fields that can be changed, keep original ID
                this.data.videos[index].title = formData.get('videoTitle');
                this.data.videos[index].description = formData.get('videoDescription');
                this.data.videos[index].category = formData.get('videoCategory');
            }
        } else {
            // Add new video
            const videoData = {
                id: videoInfo.id,
                platform: videoInfo.platform,
                type: videoInfo.type || 'video',
                url: videoInfo.url,
                title: formData.get('videoTitle'),
                description: formData.get('videoDescription'),
                category: formData.get('videoCategory')
            };
            this.data.videos.push(videoData);
        }

        await this.saveData();
        this.loadVideos();
        this.closeModal();
    }

    // Testimonials Management
    loadTestimonials() {
        const grid = document.getElementById('testimonialsGrid');
        if (!grid) return;

        if (!this.data.testimonials || this.data.testimonials.length === 0) {
            grid.innerHTML = '<p style="color: var(--admin-muted); text-align: center; padding: 40px;">No testimonials added yet. Click "Add Testimonial" to get started.</p>';
            return;
        }

        grid.innerHTML = this.data.testimonials.map(testimonial => `
            <div class="content-card">
                <h3>${testimonial.name}</h3>
                <p>${testimonial.text}</p>
                <div class="meta">${testimonial.role} | ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5-testimonial.rating)}</div>
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="admin.editTestimonial('${testimonial.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="admin.deleteTestimonial('${testimonial.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    addTestimonial() {
        this.currentEditingId = null;
        document.getElementById('testimonialModalTitle').textContent = 'Add New Testimonial';
        document.getElementById('testimonialForm').reset();
        document.getElementById('testimonialModal').classList.add('active');
    }

    editTestimonial(testimonialId) {
        const testimonial = this.data.testimonials.find(t => t.id === testimonialId);
        if (!testimonial) return;

        this.currentEditingId = testimonialId;
        document.getElementById('testimonialModalTitle').textContent = 'Edit Testimonial';
        document.getElementById('clientName').value = testimonial.name;
        document.getElementById('clientRole').value = testimonial.role;
        document.getElementById('testimonialText').value = testimonial.text;
        document.getElementById('rating').value = testimonial.rating;
        document.getElementById('testimonialModal').classList.add('active');
    }

    async deleteTestimonial(testimonialId) {
        if (confirm('Are you sure you want to delete this testimonial?')) {
            this.data.testimonials = this.data.testimonials.filter(t => t.id !== testimonialId);
            await this.saveData();
            this.loadTestimonials();
        }
    }

    async handleTestimonialSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const testimonialData = {
            id: this.currentEditingId || Date.now().toString(),
            name: formData.get('clientName'),
            role: formData.get('clientRole'),
            text: formData.get('testimonialText'),
            rating: parseInt(formData.get('rating'))
        };

        if (this.currentEditingId) {
            // Update existing testimonial
            const index = this.data.testimonials.findIndex(t => t.id === this.currentEditingId);
            if (index !== -1) {
                this.data.testimonials[index] = testimonialData;
            }
        } else {
            // Add new testimonial
            this.data.testimonials.push(testimonialData);
        }

        await this.saveData();
        this.loadTestimonials();
        this.closeModal();
    }


    // About Management
    loadAbout() {
        document.getElementById('aboutText').value = this.data.about.text || '';
        document.getElementById('profileImage').value = this.data.about.image || '';
        document.getElementById('resumeLink').value = this.data.about.resume || '';
    }

    async handleAboutSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        let imageUrl = formData.get('profileImage');
        
        // Convert Google Drive link to direct image URL
        if (imageUrl && imageUrl.includes('drive.google.com')) {
            // Extract file ID from various Google Drive URL formats
            let fileId = null;
            
            if (imageUrl.includes('/file/d/')) {
                const match = imageUrl.match(/\/file\/d\/([^\/\?]+)/);
                fileId = match ? match[1] : null;
            } else if (imageUrl.includes('id=')) {
                const match = imageUrl.match(/id=([^&]+)/);
                fileId = match ? match[1] : null;
            }
            
            if (fileId) {
                // Use thumbnail API for better compatibility
                imageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            }
        }
        
        this.data.about = {
            text: formData.get('aboutText'),
            image: imageUrl,
            resume: formData.get('resumeLink')
        };
        await this.saveData();
        alert('About section updated successfully! Profile image will update on the main page.');
    }

    // Contact Management
    loadContact() {
        document.getElementById('email').value = this.data.contact.email || 'sonurawat848484@gmail.com';
        document.getElementById('whatsapp').value = this.data.contact.whatsapp || '';
        document.getElementById('instagram').value = this.data.contact.instagram || '';
        document.getElementById('youtube').value = this.data.contact.youtube || '';
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.data.contact = {
            email: formData.get('email'),
            whatsapp: formData.get('whatsapp'),
            instagram: formData.get('instagram'),
            youtube: formData.get('youtube')
        };
        await this.saveData();
        alert('Contact information updated successfully!');
    }

    // Modal Management
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.currentEditingId = null;
    }

    // Form Submissions Management
    loadSubmissions() {
        try {
            const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        
        // Update stats
        const totalSubmissionsEl = document.getElementById('totalSubmissions');
        const recentSubmissionsEl = document.getElementById('recentSubmissions');
        
        if (totalSubmissionsEl) {
            totalSubmissionsEl.textContent = submissions.length;
        }
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentSubmissions = submissions.filter(sub => new Date(sub.timestamp) > oneWeekAgo);
        
        if (recentSubmissionsEl) {
            recentSubmissionsEl.textContent = recentSubmissions.length;
        }
        
        // Display submissions
        const submissionsList = document.getElementById('submissionsList');
        if (!submissionsList) return;
        
        if (submissions.length === 0) {
            submissionsList.innerHTML = '<div class="no-submissions"><p>No form submissions yet</p></div>';
            return;
        }
        
        submissionsList.innerHTML = submissions.map(submission => `
            <div class="submission-card">
                <div class="submission-header">
                    <h4>${submission.name}</h4>
                    <span class="submission-date">${new Date(submission.timestamp).toLocaleDateString()}</span>
                    <span class="submission-status ${submission.status}">${submission.status}</span>
                </div>
                <div class="submission-details">
                    <p><strong>Email:</strong> ${submission.email}</p>
                    <p><strong>Phone:</strong> ${submission.phone}</p>
                    <p><strong>Message:</strong> ${submission.message}</p>
                </div>
                <div class="submission-actions">
                    <button onclick="admin.markAsRead('${submission.id}')" class="btn btn-sm">Mark as Read</button>
                    <button onclick="admin.deleteSubmission('${submission.id}')" class="btn btn-sm btn-danger">Delete</button>
                </div>
            </div>
        `).join('');
        } catch (error) {
            console.error('Error loading submissions:', error);
            const submissionsList = document.getElementById('submissionsList');
            if (submissionsList) {
                submissionsList.innerHTML = '<div class="no-submissions"><p>Error loading submissions</p></div>';
            }
        }
    }

    async markAsRead(submissionId) {
        const submission = this.data.submissions.find(sub => sub.id === submissionId);
        if (submission) {
            submission.status = 'read';
            await this.saveData();
            this.loadSubmissions();
        } else {
            console.error('Submission not found:', submissionId);
        }
    }

    async deleteSubmission(submissionId) {
        if (confirm('Are you sure you want to delete this submission?')) {
            this.data.submissions = this.data.submissions.filter(sub => sub.id !== submissionId);
            await this.saveData();
            this.loadSubmissions();
        }
    }

    async migrateLocalSubmissions() {
        try {
            // Check if there are any submissions in localStorage
            const localSubmissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            
            if (localSubmissions.length > 0 && this.data.submissions.length === 0) {
                this.data.submissions = localSubmissions;
                await this.saveData();
                // Clear localStorage after successful migration
                localStorage.removeItem('contactSubmissions');
            }
        } catch (error) {
            console.error('Error migrating submissions:', error);
        }
    }


}

// Global functions for onclick handlers
function switchSection(section) {
    admin.switchSection(section);
}

function addVideo() {
    admin.addVideo();
}

function addTestimonial() {
    admin.addTestimonial();
}


function closeModal() {
    admin.closeModal();
}

function logout() {
    admin.logout();
}

// Initialize admin panel
let admin;

document.addEventListener('DOMContentLoaded', () => {
    try {
    admin = new PortfolioAdmin();
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        document.body.innerHTML = '<div style="padding: 20px; color: red;">Error loading admin panel: ' + error.message + '</div>';
    }
});
