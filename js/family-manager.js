// Family Management Module
class FamilyManager {
    constructor() {
        this.backendUrl = 'https://numerology-email-backend-d74405e8d8d7.herokuapp.com';
        this.currentFamily = null;
        this.userFamilies = [];
        this.init();
    }

    /**
     * Initialize family management system
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for family management
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-family-action]')) {
                const action = e.target.getAttribute('data-family-action');
                this.handleFamilyAction(action, e.target);
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.id === 'saveFamilyForm') {
                e.preventDefault();
                this.handleSaveFamily(e.target);
            }
        });
    }

    /**
     * Handle family actions
     */
    handleFamilyAction(action, element) {
        switch (action) {
            case 'show-save-family':
                this.showSaveFamilyModal();
                break;
            case 'show-load-family':
                this.showLoadFamilyModal();
                break;
            case 'load-family':
                const familyId = element.getAttribute('data-family-id');
                this.loadFamily(familyId);
                break;
            case 'delete-family':
                const deleteFamilyId = element.getAttribute('data-family-id');
                this.deleteFamily(deleteFamilyId);
                break;
            case 'close-family-modal':
                this.closeFamilyModal();
                break;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return window.authManager && window.authManager.getIsAuthenticated();
    }

    /**
     * Show save family modal
     */
    showSaveFamilyModal() {
        if (!this.isAuthenticated()) {
            window.authManager.showMessage('Please log in to save families', 'error');
            return;
        }

        // Get current family data
        const currentFamilyData = this.getCurrentFamilyData();
        if (!currentFamilyData || currentFamilyData.length === 0) {
            window.authManager.showMessage('Please add family members before saving', 'error');
            return;
        }

        const modal = document.getElementById('familyModal');
        const saveContainer = document.getElementById('saveFamilyContainer');
        const loadContainer = document.getElementById('loadFamilyContainer');

        saveContainer.style.display = 'block';
        loadContainer.style.display = 'none';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Pre-fill family name if available
        const familyNameInput = document.getElementById('familyName');
        if (this.currentFamily) {
            familyNameInput.value = this.currentFamily.family_name;
        } else {
            familyNameInput.value = `Family - ${new Date().toLocaleDateString()}`;
        }
    }

    /**
     * Show load family modal
     */
    async showLoadFamilyModal() {
        if (!this.isAuthenticated()) {
            window.authManager.showMessage('Please log in to load families', 'error');
            return;
        }

        await this.loadUserFamilies();

        const modal = document.getElementById('familyModal');
        const saveContainer = document.getElementById('saveFamilyContainer');
        const loadContainer = document.getElementById('loadFamilyContainer');

        saveContainer.style.display = 'none';
        loadContainer.style.display = 'block';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        this.renderFamiliesList();
    }

    /**
     * Close family modal
     */
    closeFamilyModal() {
        const modal = document.getElementById('familyModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clear forms
        document.getElementById('saveFamilyForm').reset();
    }

    /**
     * Get current family data from UI
     */
    getCurrentFamilyData() {
        const members = document.querySelectorAll('.family-member');
        const familyData = [];

        members.forEach((member, index) => {
            const memberNumber = member.getAttribute('data-member');
            const name = document.getElementById(`name${memberNumber}`).value;
            const birthDate = document.getElementById(`birthDate${memberNumber}`).value;

            if (name && birthDate) {
                familyData.push({
                    name: name,
                    birth_date: birthDate,
                    relationship: index === 0 ? 'Self' : `Family Member ${index + 1}`
                });
            }
        });

        return familyData;
    }

    /**
     * Handle save family form submission
     */
    async handleSaveFamily(form) {
        const formData = new FormData(form);
        const familyName = formData.get('family_name');
        const description = formData.get('description');

        if (!familyName) {
            window.authManager.showMessage('Please enter a family name', 'error');
            return;
        }

        const familyData = this.getCurrentFamilyData();
        if (familyData.length === 0) {
            window.authManager.showMessage('Please add family members before saving', 'error');
            return;
        }

        try {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';

            let familyId;
            
            if (this.currentFamily) {
                // Update existing family
                await this.updateFamily(this.currentFamily.family_id, familyName, description);
                familyId = this.currentFamily.family_id;
            } else {
                // Create new family
                const newFamily = await this.createFamily(familyName, description);
                familyId = newFamily.family_id;
                this.currentFamily = newFamily;
            }

            // Save family members
            await this.saveFamilyMembers(familyId, familyData);

            this.closeFamilyModal();
            window.authManager.showMessage('Family saved successfully!', 'success');

        } catch (error) {
            console.error('Save family error:', error);
            window.authManager.showMessage('Failed to save family', 'error');
        } finally {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Save Family';
        }
    }

    /**
     * Create a new family
     */
    async createFamily(familyName, description) {
        const response = await fetch(`${this.backendUrl}/api/families`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                family_name: familyName,
                description: description
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create family');
        }

        const data = await response.json();
        return data.family;
    }

    /**
     * Update existing family
     */
    async updateFamily(familyId, familyName, description) {
        const response = await fetch(`${this.backendUrl}/api/families/${familyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                family_name: familyName,
                description: description
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update family');
        }
    }

    /**
     * Save family members
     */
    async saveFamilyMembers(familyId, membersData) {
        // For now, we'll clear existing members and add new ones
        // In a more sophisticated system, we'd do a proper diff
        
        for (const memberData of membersData) {
            const response = await fetch(`${this.backendUrl}/api/families/${familyId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(memberData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save family member');
            }
        }
    }

    /**
     * Load user families
     */
    async loadUserFamilies() {
        try {
            const response = await fetch(`${this.backendUrl}/api/families`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load families');
            }

            const data = await response.json();
            this.userFamilies = data.families || [];

        } catch (error) {
            console.error('Load families error:', error);
            window.authManager.showMessage('Failed to load families', 'error');
            this.userFamilies = [];
        }
    }

    /**
     * Render families list
     */
    renderFamiliesList() {
        const container = document.getElementById('familiesList');
        
        if (this.userFamilies.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No saved families found.</p>';
            return;
        }

        const html = this.userFamilies.map(family => `
            <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${family.family_name}</h4>
                        <p class="text-sm text-gray-600 mt-1">${family.member_count} member${family.member_count !== 1 ? 's' : ''}</p>
                        ${family.description ? `<p class="text-sm text-gray-500 mt-2">${family.description}</p>` : ''}
                        <p class="text-xs text-gray-400 mt-2">Created: ${new Date(family.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="flex gap-2 ml-4">
                        <button data-family-action="load-family" data-family-id="${family.family_id}" 
                                class="bg-primary hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Load
                        </button>
                        <button data-family-action="delete-family" data-family-id="${family.family_id}" 
                                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * Load a specific family
     */
    async loadFamily(familyId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/families/${familyId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load family');
            }

            const data = await response.json();
            const family = data.family;

            // Clear current family members
            this.clearCurrentFamily();

            // Load family members into UI
            this.populateFamilyInUI(family);

            this.currentFamily = family;
            this.closeFamilyModal();
            window.authManager.showMessage(`Loaded family: ${family.family_name}`, 'success');

        } catch (error) {
            console.error('Load family error:', error);
            window.authManager.showMessage('Failed to load family', 'error');
        }
    }

    /**
     * Delete a family
     */
    async deleteFamily(familyId) {
        if (!confirm('Are you sure you want to delete this family? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.backendUrl}/api/families/${familyId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete family');
            }

            // Remove from local list
            this.userFamilies = this.userFamilies.filter(f => f.family_id !== familyId);
            
            // Re-render list
            this.renderFamiliesList();
            
            window.authManager.showMessage('Family deleted successfully', 'success');

        } catch (error) {
            console.error('Delete family error:', error);
            window.authManager.showMessage('Failed to delete family', 'error');
        }
    }

    /**
     * Clear current family from UI
     */
    clearCurrentFamily() {
        // Reset to single member
        const familyInputs = document.getElementById('familyInputs');
        const members = familyInputs.querySelectorAll('.family-member');
        
        // Remove all but first member
        for (let i = 1; i < members.length; i++) {
            members[i].remove();
        }

        // Clear first member data
        document.getElementById('name1').value = '';
        document.getElementById('birthDate1').value = '';

        // Reset UI manager state
        if (window.uiManager) {
            window.uiManager.familyMemberCount = 1;
            window.uiManager.updateAddButtonState();
            window.uiManager.updateRemoveButtons();
        }

        // Hide results
        document.getElementById('results').classList.add('hidden');
    }

    /**
     * Populate family data in UI
     */
    populateFamilyInUI(family) {
        const members = family.members || [];
        
        members.forEach((member, index) => {
            if (index === 0) {
                // First member uses existing form
                document.getElementById('name1').value = member.name;
                document.getElementById('birthDate1').value = member.birth_date;
            } else {
                // Add additional members
                if (window.uiManager) {
                    window.uiManager.addFamilyMember();
                    const memberNumber = window.uiManager.familyMemberCount;
                    document.getElementById(`name${memberNumber}`).value = member.name;
                    document.getElementById(`birthDate${memberNumber}`).value = member.birth_date;
                }
            }
        });
    }

    /**
     * Update family management UI based on auth status
     */
    updateFamilyManagementUI() {
        if (this.isAuthenticated()) {
            this.showFamilyManagementControls();
        } else {
            this.hideFamilyManagementControls();
        }
    }

    /**
     * Show family management controls
     */
    showFamilyManagementControls() {
        const existingControls = document.getElementById('familyManagementControls');
        if (existingControls) return;

        const controlsHtml = `
            <div id="familyManagementControls" class="family-controls flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <button data-family-action="show-save-family" class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">
                    💾 Save Family
                </button>
                <button data-family-action="show-load-family" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">
                    📂 Load Family
                </button>
            </div>
        `;

        const familyControls = document.querySelector('.family-controls');
        familyControls.insertAdjacentHTML('beforebegin', controlsHtml);
    }

    /**
     * Hide family management controls
     */
    hideFamilyManagementControls() {
        const controls = document.getElementById('familyManagementControls');
        if (controls) {
            controls.remove();
        }
    }
}

// Create global family manager instance
window.familyManager = new FamilyManager();