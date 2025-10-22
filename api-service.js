// API Service for Permanent Storage
class PortfolioAPI {
    constructor() {
        this.binId = '68f78c18ae596e708f21a0a3';
        this.apiKey = '68f78c18ae596e708f21a0a3';
        this.masterKey = '$2a$10$VX4Clif.j6m.t1X0eZ5KgO/AJWfU4xU0L2r5N6lKW7m/wwy3Lw/a6';
        this.baseUrl = 'https://api.jsonbin.io/v3/b';
    }


    async getData() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.masterKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const data = await response.json();
            return data.record;
        } catch (error) {
            return this.getLocalData();
        }
    }

    async saveData(data) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save data');
            }
            
            localStorage.setItem('portfolioData', JSON.stringify(data));
            return true;
        } catch (error) {
            localStorage.setItem('portfolioData', JSON.stringify(data));
            return false;
        }
    }

    getLocalData() {
        const saved = localStorage.getItem('portfolioData');
        return saved ? JSON.parse(saved) : {
            videos: [],
            testimonials: [],
            services: [],
            about: {},
            contact: {},
            submissions: []
        };
    }
}

// Export for use in other files
window.PortfolioAPI = PortfolioAPI;
