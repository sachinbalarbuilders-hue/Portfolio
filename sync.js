// Portfolio Data Sync Script
// This script helps sync admin panel data with the main website

class PortfolioSync {
    constructor() {
        this.data = this.loadData();
        this.init();
    }

    loadData() {
        const saved = localStorage.getItem('portfolioData');
        return saved ? JSON.parse(saved) : null;
    }

    init() {
        if (!this.data) return;
        
        // Update videos
        this.updateVideos();
        
        // Update testimonials
        this.updateTestimonials();
        
        // Update services
        this.updateServices();
        
        // Update about section
        this.updateAbout();
        
        // Update contact info
        this.updateContact();
    }

    updateVideos() {
        if (!this.data.videos || this.data.videos.length === 0) return;
        
        const videosGrid = document.querySelector('#work .work-grid');
        if (!videosGrid) return;

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

    updateTestimonials() {
        if (!this.data.testimonials || this.data.testimonials.length === 0) return;
        
        const testimonialsTrack = document.querySelector('.carousel-track');
        if (!testimonialsTrack) return;

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

    updateServices() {
        if (!this.data.services || this.data.services.length === 0) return;
        
        const servicesGrid = document.querySelector('.services-grid');
        if (!servicesGrid) return;

        servicesGrid.innerHTML = this.data.services.map(service => `
            <article class="service-card tilt reveal-up">
                <div class="icon">${service.icon}</div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            </article>
        `).join('');
    }

    updateAbout() {
        if (!this.data.about) return;
        
        // Update about text
        const aboutText = document.querySelector('.about-text');
        if (aboutText && this.data.about.text) {
            aboutText.textContent = this.data.about.text;
        }
        
        // Update profile image
        const profileImg = document.querySelector('.portrait img');
        if (profileImg && this.data.about.image) {
            profileImg.src = this.data.about.image;
        }
        
        // Update resume link
        const resumeLink = document.querySelector('a[href="resume.pdf"]');
        if (resumeLink && this.data.about.resume) {
            resumeLink.href = this.data.about.resume;
        }
    }

    updateContact() {
        if (!this.data.contact) return;
        
        // Update email
        const emailLink = document.querySelector('a[href^="mailto:"]');
        if (emailLink && this.data.contact.email) {
            emailLink.href = `mailto:${this.data.contact.email}`;
            emailLink.textContent = this.data.contact.email;
        }
        
        // Update WhatsApp
        const whatsappLink = document.querySelector('a[aria-label="WhatsApp link to be added"]');
        if (whatsappLink && this.data.contact.whatsapp) {
            whatsappLink.href = this.data.contact.whatsapp;
            whatsappLink.textContent = this.data.contact.whatsapp;
        }
        
        // Update Instagram
        const instagramLinks = document.querySelectorAll('a[aria-label="Instagram"]');
        instagramLinks.forEach(link => {
            if (this.data.contact.instagram) {
                link.href = `https://instagram.com/${this.data.contact.instagram.replace('@', '')}`;
            }
        });
        
        // Update YouTube
        const youtubeLinks = document.querySelectorAll('a[aria-label="YouTube"]');
        youtubeLinks.forEach(link => {
            if (this.data.contact.youtube) {
                link.href = this.data.contact.youtube;
            }
        });
    }
}

// Initialize sync when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioSync();
});
