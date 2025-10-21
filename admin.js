// Admin Panel JavaScript
class PortfolioAdmin {
    constructor() {
        this.data = this.loadData();
        this.currentEditingId = null;
        this.isAuthenticated = this.checkAuthentication();
        this.adminPassword = 'adminsonu';
        this.init();
    }

    init() {
        this.setupEventListeners();
        
        if (this.isAuthenticated) {
            this.showAdminPanel();
            this.loadDashboard();
            this.loadVideos();
            this.loadTestimonials();
            this.loadServices();
            this.loadAbout();
            this.loadContact();
        } else {
            this.showLoginScreen();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));

        // Sidebar navigation
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section);
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

    handleLogin(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === this.adminPassword) {
            // Set authentication session
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminTimestamp', Date.now().toString());
            
            this.isAuthenticated = true;
            this.showAdminPanel();
            this.loadDashboard();
            this.loadVideos();
            this.loadTestimonials();
            this.loadServices();
            this.loadAbout();
            this.loadContact();
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

    // Data Management
    loadData() {
        const saved = localStorage.getItem('portfolioData');
        return saved ? JSON.parse(saved) : {
            videos: [],
            testimonials: [],
            services: [],
            about: {
                text: "I'm a passionate video editor with over 3 years of experience crafting reels, cinematic brand promos, and YouTube content. My goal is to tell visual stories that captivate audiences and deliver impact.",
                image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1200&auto=format&fit=crop",
                resume: "resume.pdf"
            },
            contact: {
                email: "sonurawat848484@gmail.com",
                whatsapp: "#",
                instagram: "@SK_RAWAT48",
                youtube: "https://youtube.com/@skvlog4848"
            }
        };
    }

    saveData() {
        localStorage.setItem('portfolioData', JSON.stringify(this.data));
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
        document.getElementById(sectionName).classList.add('active');
    }

    // Dashboard
    loadDashboard() {
        document.getElementById('totalVideos').textContent = this.data.videos.length;
        document.getElementById('totalTestimonials').textContent = this.data.testimonials.length;
        document.getElementById('totalServices').textContent = this.data.services.length;
    }

    // Videos Management
    loadVideos() {
        const grid = document.getElementById('videosGrid');
        if (!grid) return;

        if (this.data.videos.length === 0) {
            grid.innerHTML = '<p style="color: var(--admin-muted); text-align: center; padding: 40px;">No videos added yet. Click "Add Video" to get started.</p>';
            return;
        }

        grid.innerHTML = this.data.videos.map(video => `
            <div class="content-card">
                <div class="video-preview">
                    <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}">
                </div>
                <h3>${video.title}</h3>
                <p>${video.description}</p>
                <div class="meta">Category: ${video.category} | ID: ${video.id}</div>
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="admin.editVideo('${video.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="admin.deleteVideo('${video.id}')">Delete</button>
                </div>
            </div>
        `).join('');
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

    deleteVideo(videoId) {
        console.log('Attempting to delete video with ID:', videoId);
        console.log('Current videos:', this.data.videos);
        
        // Find the video to delete
        const videoToDelete = this.data.videos.find(v => v.id === videoId);
        console.log('Video to delete:', videoToDelete);
        
        if (!videoToDelete) {
            console.error('Video not found with ID:', videoId);
            alert('Video not found!');
            return;
        }
        
        if (confirm(`Are you sure you want to delete "${videoToDelete.title}"?`)) {
            // Remove the video using index-based deletion as fallback
            const videoIndex = this.data.videos.findIndex(v => v.id === videoId);
            if (videoIndex !== -1) {
                this.data.videos.splice(videoIndex, 1);
                console.log('Video deleted using splice method');
            } else {
                // Fallback: filter method
                this.data.videos = this.data.videos.filter(v => v.id !== videoId);
                console.log('Video deleted using filter method');
            }
            
            console.log('Video deleted. Remaining videos:', this.data.videos.length);
            
            this.saveData();
            this.loadVideos();
            this.loadDashboard();
            
            // Show success message
            alert('Video deleted successfully!');
        }
    }

    handleVideoSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
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
                id: formData.get('videoId'),
                title: formData.get('videoTitle'),
                description: formData.get('videoDescription'),
                category: formData.get('videoCategory')
            };
            this.data.videos.push(videoData);
        }

        this.saveData();
        this.loadVideos();
        this.loadDashboard();
        this.closeModal();
    }

    // Testimonials Management
    loadTestimonials() {
        const grid = document.getElementById('testimonialsGrid');
        if (!grid) return;

        if (this.data.testimonials.length === 0) {
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

    deleteTestimonial(testimonialId) {
        if (confirm('Are you sure you want to delete this testimonial?')) {
            this.data.testimonials = this.data.testimonials.filter(t => t.id !== testimonialId);
            this.saveData();
            this.loadTestimonials();
            this.loadDashboard();
        }
    }

    handleTestimonialSubmit(e) {
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

        this.saveData();
        this.loadTestimonials();
        this.loadDashboard();
        this.closeModal();
    }

    // Services Management
    loadServices() {
        const grid = document.getElementById('servicesGrid');
        if (!grid) return;

        if (this.data.services.length === 0) {
            grid.innerHTML = '<p style="color: var(--admin-muted); text-align: center; padding: 40px;">No services added yet. Click "Add Service" to get started.</p>';
            return;
        }

        grid.innerHTML = this.data.services.map(service => `
            <div class="content-card">
                <div style="font-size: 24px; margin-bottom: 12px;">${service.icon}</div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="admin.editService('${service.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="admin.deleteService('${service.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    addService() {
        this.currentEditingId = null;
        document.getElementById('serviceModalTitle').textContent = 'Add New Service';
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceModal').classList.add('active');
    }

    editService(serviceId) {
        const service = this.data.services.find(s => s.id === serviceId);
        if (!service) return;

        this.currentEditingId = serviceId;
        document.getElementById('serviceModalTitle').textContent = 'Edit Service';
        document.getElementById('serviceIcon').value = service.icon;
        document.getElementById('serviceTitle').value = service.title;
        document.getElementById('serviceDescription').value = service.description;
        document.getElementById('serviceModal').classList.add('active');
    }

    deleteService(serviceId) {
        if (confirm('Are you sure you want to delete this service?')) {
            this.data.services = this.data.services.filter(s => s.id !== serviceId);
            this.saveData();
            this.loadServices();
            this.loadDashboard();
        }
    }

    handleServiceSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const serviceData = {
            id: this.currentEditingId || Date.now().toString(),
            icon: formData.get('serviceIcon'),
            title: formData.get('serviceTitle'),
            description: formData.get('serviceDescription')
        };

        if (this.currentEditingId) {
            // Update existing service
            const index = this.data.services.findIndex(s => s.id === this.currentEditingId);
            if (index !== -1) {
                this.data.services[index] = serviceData;
            }
        } else {
            // Add new service
            this.data.services.push(serviceData);
        }

        this.saveData();
        this.loadServices();
        this.loadDashboard();
        this.closeModal();
    }

    // About Management
    loadAbout() {
        document.getElementById('aboutText').value = this.data.about.text || '';
        document.getElementById('profileImage').value = this.data.about.image || '';
        document.getElementById('resumeLink').value = this.data.about.resume || '';
    }

    handleAboutSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.data.about = {
            text: formData.get('aboutText'),
            image: formData.get('profileImage'),
            resume: formData.get('resumeLink')
        };
        this.saveData();
        alert('About section updated successfully!');
    }

    // Contact Management
    loadContact() {
        document.getElementById('email').value = this.data.contact.email || 'sonurawat848484@gmail.com';
        document.getElementById('whatsapp').value = this.data.contact.whatsapp || '';
        document.getElementById('instagram').value = this.data.contact.instagram || '';
        document.getElementById('youtube').value = this.data.contact.youtube || '';
    }

    handleContactSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.data.contact = {
            email: formData.get('email'),
            whatsapp: formData.get('whatsapp'),
            instagram: formData.get('instagram'),
            youtube: formData.get('youtube')
        };
        this.saveData();
        alert('Contact information updated successfully!');
    }

    // Modal Management
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.currentEditingId = null;
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

function addService() {
    admin.addService();
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
    admin = new PortfolioAdmin();
});
