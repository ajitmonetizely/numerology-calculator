// Event Lists Management Module
class EventListsManager {
    constructor() {
        this.backendUrl = 'https://numerology-backend-87645a83ad1c.herokuapp.com';
        this.currentList = null;
        this.userLists = [];
        this.isAdmin = false;
        this.editingCell = null;
        this.init();
    }

    /**
     * Initialize event lists system
     */
    init() {
        this.setupEventListeners();
        this.checkAdminStatus();
    }

    /**
     * Check if current user is admin
     */
    async checkAdminStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/me`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.isAdmin = data.user && data.user.email === 'admin@numerology.app';
                this.updateUIForAdminStatus();
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-eventlist-action]')) {
                const action = e.target.getAttribute('data-eventlist-action');
                this.handleEventListAction(action, e.target);
            }
        });

        document.addEventListener('dblclick', (e) => {
            if (e.target.matches('.editable-cell')) {
                this.startCellEdit(e.target);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.editingCell) {
                this.finishCellEdit();
            } else if (e.key === 'Escape' && this.editingCell) {
                this.cancelCellEdit();
            }
        });
    }

    /**
     * Handle event list actions
     */
    async handleEventListAction(action, element) {
        const listId = element.getAttribute('data-list-id');
        const itemId = element.getAttribute('data-item-id');

        switch (action) {
            case 'show-lists':
                await this.showEventListsModal();
                break;
            case 'create-list':
                this.showCreateListModal();
                break;
            case 'load-list':
                await this.loadEventList(listId);
                break;
            case 'edit-list':
                await this.editEventList(listId);
                break;
            case 'delete-list':
                await this.deleteEventList(listId);
                break;
            case 'add-item':
                this.addEventItem();
                break;
            case 'delete-item':
                await this.deleteEventItem(itemId);
                break;
            case 'save-list':
                await this.saveCurrentList();
                break;
            case 'export-csv':
                this.exportToCSV();
                break;
            case 'close-modal':
                this.closeModals();
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
     * Show event lists modal
     */
    async showEventListsModal() {
        if (!this.isAuthenticated()) {
            window.authManager.showMessage('Please log in to access event lists', 'error');
            return;
        }

        await this.loadUserEventLists();
        
        const modal = document.getElementById('eventListsModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.renderEventListsGrid();
        }
    }

    /**
     * Load user's event lists
     */
    async loadUserEventLists() {
        try {
            const response = await fetch(`${this.backendUrl}/api/event-lists`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.userLists = data.lists || [];
            } else {
                throw new Error('Failed to load event lists');
            }
        } catch (error) {
            console.error('Load event lists error:', error);
            window.authManager.showMessage('Failed to load event lists', 'error');
            this.userLists = [];
        }
    }

    /**
     * Show create list modal
     */
    showCreateListModal() {
        // Implementation for create list modal
        this.showListFormModal();
    }

    /**
     * Show list form modal
     */
    showListFormModal(list = null) {
        const isEdit = !!list;
        const modalHtml = `
            <div id="listFormModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">${isEdit ? 'Edit' : 'Create'} Event List</h3>
                        <button data-eventlist-action="close-modal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="listForm" onsubmit="return false;">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">List Name</label>
                            <input type="text" id="listName" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                                   value="${list ? list.list_name : ''}" required>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea id="listDescription" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows="3">${list ? list.description : ''}</textarea>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">List Type</label>
                            <select id="listType" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="custom" ${!list || list.list_type === 'custom' ? 'selected' : ''}>Custom</option>
                                <option value="cities" ${list && list.list_type === 'cities' ? 'selected' : ''}>Cities</option>
                                <option value="brands" ${list && list.list_type === 'brands' ? 'selected' : ''}>Brands</option>
                                <option value="events" ${list && list.list_type === 'events' ? 'selected' : ''}>Events</option>
                                <option value="companies" ${list && list.list_type === 'companies' ? 'selected' : ''}>Companies</option>
                            </select>
                        </div>
                        
                        ${this.isAdmin ? `
                            <div class="mb-4">
                                <label class="flex items-center">
                                    <input type="checkbox" id="isPublic" class="mr-2" ${list && list.is_public ? 'checked' : ''}>
                                    <span class="text-sm text-gray-700">Make this list public</span>
                                </label>
                            </div>
                            
                            <div class="mb-4">
                                <label class="flex items-center">
                                    <input type="checkbox" id="isShared" class="mr-2" ${list && list.is_shared ? 'checked' : ''}>
                                    <span class="text-sm text-gray-700">Allow sharing with other users</span>
                                </label>
                            </div>
                        ` : ''}
                        
                        <div class="flex gap-3">
                            <button type="button" data-eventlist-action="close-modal" 
                                    class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" onclick="window.eventListsManager.${isEdit ? 'updateEventList' : 'createEventList'}(${isEdit ? `'${list.list_id}'` : ''})"
                                    class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                ${isEdit ? 'Update' : 'Create'} List
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('listFormModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    }

    /**
     * Create new event list
     */
    async createEventList() {
        const listName = document.getElementById('listName').value.trim();
        const description = document.getElementById('listDescription').value.trim();
        const listType = document.getElementById('listType').value;
        const isPublic = document.getElementById('isPublic')?.checked || false;
        const isShared = document.getElementById('isShared')?.checked || false;

        if (!listName) {
            window.authManager.showMessage('Please enter a list name', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.backendUrl}/api/event-lists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    list_name: listName,
                    description,
                    list_type: listType,
                    is_public: isPublic,
                    is_shared: isShared
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.closeModals();
                window.authManager.showMessage('Event list created successfully!', 'success');
                await this.loadEventList(data.list.list_id);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create list');
            }
        } catch (error) {
            console.error('Create list error:', error);
            window.authManager.showMessage(error.message || 'Failed to create list', 'error');
        }
    }

    /**
     * Load specific event list
     */
    async loadEventList(listId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/event-lists/${listId}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.currentList = data.list;
                this.closeModals();
                this.renderEventListInterface();
                window.authManager.showMessage(`Loaded list: ${this.currentList.list_name}`, 'success');
            } else {
                throw new Error('Failed to load event list');
            }
        } catch (error) {
            console.error('Load event list error:', error);
            window.authManager.showMessage('Failed to load event list', 'error');
        }
    }

    /**
     * Render event list interface
     */
    renderEventListInterface() {
        if (!this.currentList) return;

        const container = document.getElementById('eventListContainer');
        if (!container) {
            this.createEventListContainer();
            return;
        }

        const canEdit = this.currentList.access_level === 'owner' || this.currentList.access_level === 'write';
        
        const html = `
            <div class="event-list-header mb-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">${this.currentList.list_name}</h2>
                        <p class="text-gray-600">${this.currentList.description || 'No description'}</p>
                        <div class="flex gap-2 mt-2">
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">${this.currentList.list_type}</span>
                            <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">${this.currentList.access_level}</span>
                            ${this.currentList.is_public ? '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Public</span>' : ''}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        ${canEdit ? '<button data-eventlist-action="add-item" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Add Row</button>' : ''}
                        <button data-eventlist-action="export-csv" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Export CSV</button>
                        ${canEdit ? '<button data-eventlist-action="save-list" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">Save Changes</button>' : ''}
                    </div>
                </div>
            </div>
            
            <div class="event-list-table bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                        <thead class="bg-gray-50">
                            <tr>
                                ${canEdit ? '<th class="border border-gray-200 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Actions</th>' : ''}
                                <th class="border border-gray-200 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                                <th class="border border-gray-200 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th class="border border-gray-200 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifepath Number</th>
                                <th class="border border-gray-200 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chinese Zodiac</th>
                                <th class="border border-gray-200 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            </tr>
                        </thead>
                        <tbody id="eventListTableBody">
                            ${this.renderEventListRows(canEdit)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';
    }

    /**
     * Render event list rows
     */
    renderEventListRows(canEdit) {
        if (!this.currentList.items || this.currentList.items.length === 0) {
            return `
                <tr>
                    <td colspan="${canEdit ? 6 : 5}" class="border border-gray-200 p-8 text-center text-gray-500">
                        No events added yet. ${canEdit ? 'Click "Add Row" to get started.' : ''}
                    </td>
                </tr>
            `;
        }

        return this.currentList.items.map(item => `
            <tr data-item-id="${item.item_id}">
                ${canEdit ? `
                    <td class="border border-gray-200 p-3">
                        <button data-eventlist-action="delete-item" data-item-id="${item.item_id}" 
                                class="text-red-500 hover:text-red-700 text-sm">
                            ✕
                        </button>
                    </td>
                ` : ''}
                <td class="border border-gray-200 p-3">
                    <div class="editable-cell ${canEdit ? 'cursor-pointer hover:bg-gray-50' : ''}" 
                         data-field="event_name" data-item-id="${item.item_id}">
                        ${item.event_name}
                    </div>
                </td>
                <td class="border border-gray-200 p-3">
                    <div class="editable-cell ${canEdit ? 'cursor-pointer hover:bg-gray-50' : ''}" 
                         data-field="event_date" data-item-id="${item.item_id}">
                        ${item.event_date}
                    </div>
                </td>
                <td class="border border-gray-200 p-3 text-center font-bold text-purple-600">
                    ${item.lifepath_number}
                </td>
                <td class="border border-gray-200 p-3 text-center">
                    ${item.chinese_zodiac}
                </td>
                <td class="border border-gray-200 p-3 text-center">
                    ${item.zodiac_year}
                </td>
            </tr>
        `).join('');
    }

    /**
     * Create event list container if it doesn't exist
     */
    createEventListContainer() {
        const existingContainer = document.getElementById('eventListContainer');
        if (existingContainer) {
            existingContainer.remove();
        }

        const html = `
            <div id="eventListContainer" class="event-lists-interface hidden">
                <!-- Event list interface will be rendered here -->
            </div>
        `;

        // Insert after the main family interface
        const familyInputs = document.getElementById('familyInputs');
        if (familyInputs) {
            familyInputs.insertAdjacentHTML('afterend', html);
        } else {
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // Now render the interface
        this.renderEventListInterface();
    }

    /**
     * Add new event item
     */
    addEventItem() {
        if (!this.currentList) return;

        const newItem = {
            item_id: 'temp_' + Date.now(),
            event_name: 'New Event',
            event_date: new Date().toISOString().split('T')[0],
            lifepath_number: 0,
            chinese_zodiac: '',
            zodiac_year: new Date().getFullYear(),
            sort_order: this.currentList.items.length
        };

        this.currentList.items.push(newItem);
        this.renderEventListInterface();
    }

    /**
     * Start editing a cell
     */
    startCellEdit(cell) {
        if (!cell.dataset.field) return;

        const currentValue = cell.textContent.trim();
        const field = cell.dataset.field;
        
        let inputType = 'text';
        if (field === 'event_date') inputType = 'date';

        const input = document.createElement('input');
        input.type = inputType;
        input.value = currentValue;
        input.className = 'w-full p-1 border border-blue-500 rounded';
        
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();

        this.editingCell = {
            element: cell,
            input: input,
            originalValue: currentValue,
            field: field,
            itemId: cell.dataset.itemId
        };

        input.addEventListener('blur', () => this.finishCellEdit());
    }

    /**
     * Finish cell editing
     */
    finishCellEdit() {
        if (!this.editingCell) return;

        const newValue = this.editingCell.input.value.trim();
        const { element, field, itemId, originalValue } = this.editingCell;

        // Update the cell display
        element.textContent = newValue;

        // Update the data
        const item = this.currentList.items.find(i => i.item_id === itemId);
        if (item) {
            item[field] = newValue;
            
            // Recalculate numerology if date changed
            if (field === 'event_date') {
                const calculations = this.calculateNumerologyAndZodiac(newValue);
                item.lifepath_number = calculations.lifepath_number;
                item.chinese_zodiac = calculations.chinese_zodiac;
                item.zodiac_year = calculations.zodiac_year;
                
                // Re-render to show updated calculations
                this.renderEventListInterface();
            }
        }

        this.editingCell = null;
    }

    /**
     * Cancel cell editing
     */
    cancelCellEdit() {
        if (!this.editingCell) return;

        this.editingCell.element.textContent = this.editingCell.originalValue;
        this.editingCell = null;
    }

    /**
     * Calculate numerology and zodiac for a date
     */
    calculateNumerologyAndZodiac(dateString) {
        const date = new Date(dateString);
        const dateOnly = dateString.replace(/-/g, '');
        
        let sum = 0;
        for (let digit of dateOnly) {
            sum += parseInt(digit);
        }
        
        // Reduce to single digit or master number
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            sum = sum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        }
        
        // Calculate Chinese zodiac
        const year = date.getFullYear();
        const zodiacAnimals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
        const zodiacIndex = (year - 1900) % 12;
        
        return {
            lifepath_number: sum,
            chinese_zodiac: zodiacAnimals[zodiacIndex],
            zodiac_year: year
        };
    }

    /**
     * Save current list changes
     */
    async saveCurrentList() {
        if (!this.currentList) return;

        try {
            // Save individual items
            const promises = this.currentList.items.map(async (item, index) => {
                item.sort_order = index;
                
                if (item.item_id.startsWith('temp_')) {
                    // Create new item
                    const response = await fetch(`${this.backendUrl}/api/event-lists/${this.currentList.list_id}/items`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            event_name: item.event_name,
                            event_date: item.event_date,
                            sort_order: item.sort_order
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        item.item_id = data.item.item_id;
                    }
                } else {
                    // Update existing item
                    await fetch(`${this.backendUrl}/api/event-lists/${this.currentList.list_id}/items/${item.item_id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            event_name: item.event_name,
                            event_date: item.event_date,
                            sort_order: item.sort_order
                        })
                    });
                }
            });

            await Promise.all(promises);
            window.authManager.showMessage('List saved successfully!', 'success');
            
        } catch (error) {
            console.error('Save list error:', error);
            window.authManager.showMessage('Failed to save list', 'error');
        }
    }

    /**
     * Delete event item
     */
    async deleteEventItem(itemId) {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            if (!itemId.startsWith('temp_')) {
                const response = await fetch(`${this.backendUrl}/api/event-lists/${this.currentList.list_id}/items/${itemId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete item');
                }
            }

            // Remove from local data
            this.currentList.items = this.currentList.items.filter(item => item.item_id !== itemId);
            this.renderEventListInterface();
            window.authManager.showMessage('Event deleted successfully', 'success');

        } catch (error) {
            console.error('Delete item error:', error);
            window.authManager.showMessage('Failed to delete event', 'error');
        }
    }

    /**
     * Export list to CSV
     */
    exportToCSV() {
        if (!this.currentList || !this.currentList.items.length) {
            window.authManager.showMessage('No data to export', 'error');
            return;
        }

        const headers = ['Event Name', 'Date', 'Lifepath Number', 'Chinese Zodiac', 'Year'];
        const rows = this.currentList.items.map(item => [
            item.event_name,
            item.event_date,
            item.lifepath_number,
            item.chinese_zodiac,
            item.zodiac_year
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.currentList.list_name.replace(/[^a-z0-9]/gi, '_')}.csv`;
        link.click();
    }

    /**
     * Close all modals
     */
    closeModals() {
        const modals = ['eventListsModal', 'listFormModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.remove();
            }
        });
        document.body.style.overflow = 'auto';
    }

    /**
     * Update UI based on admin status and authentication
     */
    updateUIForAdminStatus() {
        if (this.isAuthenticated()) {
            this.showEventListsUI();
        } else {
            this.hideEventListsUI();
        }
    }

    /**
     * Show event lists UI
     */
    showEventListsUI() {
        const existingControls = document.getElementById('eventListsControls');
        if (existingControls) return;

        const controlsHtml = `
            <div id="eventListsControls" class="event-lists-controls flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <button data-eventlist-action="show-lists" class="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">
                    📊 Event Lists
                </button>
                ${this.isAdmin ? `
                    <button data-eventlist-action="create-list" class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">
                        ➕ Create List
                    </button>
                ` : ''}
            </div>
        `;

        const familyControls = document.querySelector('.family-controls');
        if (familyControls) {
            familyControls.insertAdjacentHTML('afterend', controlsHtml);
        }
    }

    /**
     * Hide event lists UI
     */
    hideEventListsUI() {
        const controls = document.getElementById('eventListsControls');
        if (controls) {
            controls.remove();
        }
        const container = document.getElementById('eventListContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * Render event lists grid in modal
     */
    renderEventListsGrid() {
        const container = document.getElementById('eventListsGrid');
        if (!container) return;

        if (this.userLists.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No event lists found.</p>';
            return;
        }

        const html = this.userLists.map(list => `
            <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${list.list_name}</h4>
                        <p class="text-sm text-gray-600 mt-1">${list.item_count} item${list.item_count !== 1 ? 's' : ''}</p>
                        <div class="flex gap-1 mt-2">
                            <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${list.list_type}</span>
                            ${list.is_public ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Public</span>' : ''}
                        </div>
                        ${list.description ? `<p class="text-sm text-gray-500 mt-2">${list.description}</p>` : ''}
                        <p class="text-xs text-gray-400 mt-2">Created: ${new Date(list.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="flex gap-2 ml-4">
                        <button data-eventlist-action="load-list" data-list-id="${list.list_id}" 
                                class="bg-primary hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Open
                        </button>
                        ${this.isAdmin ? `
                            <button data-eventlist-action="edit-list" data-list-id="${list.list_id}" 
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                Edit
                            </button>
                            <button data-eventlist-action="delete-list" data-list-id="${list.list_id}" 
                                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }
}

// Create global event lists manager instance
window.eventListsManager = new EventListsManager();

// Update UI when authentication status changes
document.addEventListener('authStatusChanged', (e) => {
    if (window.eventListsManager) {
        window.eventListsManager.updateUIForAdminStatus();
    }
});