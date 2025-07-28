document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const addClassBtn = document.getElementById('addClassBtn');
    const classModal = document.getElementById('classModal');
    const closeModal = document.getElementById('closeModal');
    const cancelClass = document.getElementById('cancelClass');
    const classForm = document.getElementById('classForm');
    const modalTitle = document.getElementById('modalTitle');
    const classTeacherSelect = document.getElementById('classTeacher');
    
    // Table body
    const classesTableBody = document.getElementById('classesTableBody');
    
    let classes = [];
    let teachers = [];

    // Fetch teachers for dropdown
    function fetchTeachers() {
        return fetch('/cadmin/api/teachers/')
            .then(response => response.json())
            .then(data => {
                teachers = data;
                populateTeacherDropdown();
            });
    }

    // Fetch classes from API
    function fetchClasses() {
        fetch('/cadmin/api/classes/')
            .then(response => response.json())
            .then(data => {
                classes = data;
                renderClassesTable();
            });
    }
    
    // Populate teacher dropdown
    function populateTeacherDropdown() {
        classTeacherSelect.innerHTML = '<option value="">-- Select Teacher --</option>';
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.firstname} ${teacher.lastname}`;
            classTeacherSelect.appendChild(option);
        });
    }
    
    // Initialize the table with sample data
    function renderClassesTable() {
        classesTableBody.innerHTML = '';
        classes.forEach(cls => {
            const row = document.createElement('tr');
            row.className = 'class-row';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap" data-label="Class Name">
                    <div class="text-sm font-medium text-gray-900">${cls.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Class Teacher">
                    ${cls.class_teacher ? `
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-8 w-8">
                                <img class="h-8 w-8 rounded-full" src="${cls.class_teacher.image_url || '/static/img/default-profile.png'}" alt="${cls.class_teacher.firstname} ${cls.class_teacher.lastname}">
                            </div>
                            <div class="ml-3">
                                <div class="text-sm font-medium text-gray-900">${cls.class_teacher.firstname} ${cls.class_teacher.lastname}</div>
                            </div>
                        </div>
                    ` : '<span class="text-sm text-gray-500">Not assigned</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Students">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${cls.student_count} students
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Created">
                    <div class="text-sm text-gray-500">${cls.created_at}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right" data-label="Actions">
                    <div class="flex justify-end space-x-2">
                        <button class="class-action-btn edit-class text-indigo-600 hover:text-indigo-900" data-id="${cls.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="class-action-btn delete-class text-red-600 hover:text-red-900" data-id="${cls.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            classesTableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.edit-class').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.closest('button').dataset.id;
                openEditModal(id);
            });
        });
        document.querySelectorAll('.delete-class').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.closest('button').dataset.id;
                deleteClass(id);
            });
        });
    }
    
    // Open modal for adding a new class
    addClassBtn.addEventListener('click', () => {
        classForm.reset();
        document.getElementById('classId').value = '';
        modalTitle.textContent = 'Add New Class';
        classModal.classList.remove('hidden');
    });
    
    // Close modal
    function closeClassModal() {
        classModal.classList.add('hidden');
    }
    
    closeModal.addEventListener('click', closeClassModal);
    cancelClass.addEventListener('click', closeClassModal);
    
    // Edit class
    function openEditModal(id) {
        const cls = classes.find(c => c.id == id);
        if (cls) {
            document.getElementById('classId').value = cls.id;
            document.getElementById('className').value = cls.name;
            document.getElementById('classTeacher').value = cls.class_teacher ? cls.class_teacher.id : '';
            modalTitle.textContent = 'Edit Class';
            classModal.classList.remove('hidden');
        }
    }
    
    // Tailwind confirmation modal
    function showConfirm(message, callback) {
        let confirmModal = document.getElementById('confirmModal');
        if (!confirmModal) {
            confirmModal = document.createElement('div');
            confirmModal.id = 'confirmModal';
            confirmModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
            confirmModal.innerHTML = `
                <div class="bg-white rounded shadow-lg p-6 w-96">
                    <div id="confirmText" class="mb-4 text-gray-800"></div>
                    <div class="flex justify-end space-x-2">
                        <button id="confirmYes" class="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
                        <button id="confirmNo" class="px-4 py-2 bg-gray-300 text-gray-800 rounded">No</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmModal);
        }
        document.getElementById('confirmText').textContent = message;
        confirmModal.classList.remove('hidden');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        function cleanup() {
            confirmModal.classList.add('hidden');
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
        }
        function onYes() {
            cleanup();
            callback(true);
        }
        function onNo() {
            cleanup();
            callback(false);
        }
        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
    }

    // Delete class
    function deleteClass(id) {
        showConfirm('Are you sure you want to delete this class? All associated data will be removed.', function(confirmed) {
            if (confirmed) {
                fetch(`/cadmin/api/classes/${id}/delete/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken(),
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        fetchClasses();
                        showAlert('Class deleted successfully', 'success');
                    } else {
                        showAlert('Error deleting class', 'error');
                    }
                });
            }
        });
    }
    
    // Form submission
    classForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('classId').value;
        const name = document.getElementById('className').value;
        const teacherId = document.getElementById('classTeacher').value;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('class_teacher', teacherId);
        let url = '/cadmin/api/classes/create/';
        if (id) {
            url = `/cadmin/api/classes/${id}/update/`;
        }
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchClasses();
                closeClassModal();
                showAlert(`Class ${id ? 'updated' : 'added'} successfully`, 'success');
            } else {
                showAlert('Error saving class: ' + (data.error || 'Unknown error'), 'error');
            }
        });
    });
    
    // Tailwind dismissible alert
    function showAlert(message, type = 'success') {
        if (!window.alertBox) {
            // Create alertBox if not present
            const ab = document.createElement('div');
            ab.id = 'alertBox';
            ab.className = 'fixed top-4 right-4 z-50';
            document.body.appendChild(ab);
            window.alertBox = ab;
        }
        const color = type === 'success' ? 'green' : 'red';
        window.alertBox.innerHTML = `
            <div class="flex items-center justify-between px-4 py-2 rounded shadow bg-${color}-100 text-${color}-800 border border-${color}-300 mb-2 animate-fade-in">
                <span>${message}</span>
                <button class="ml-4 text-lg font-bold focus:outline-none" onclick="this.parentElement.remove()">&times;</button>
            </div>
        `;
        setTimeout(() => {
            if (window.alertBox) window.alertBox.innerHTML = '';
        }, 2000);
    }

    // Initialize the table and dropdown
    // CSRF helper
    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === ('csrftoken=')) {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Initial fetch
    fetchTeachers().then(fetchClasses);
    
    // Search functionality
    document.getElementById('classSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        // In a real app, you would filter the data from the server
        document.querySelectorAll('.class-row').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    // Sort functionality
    document.getElementById('classSort').addEventListener('change', function(e) {
        const sortValue = e.target.value;
        // In a real app, you would sort the data from the server
        switch(sortValue) {
            case 'name_asc':
                classes.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                classes.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'recent':
                classes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                classes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
        }
        renderClassesTable();
    });
});
// Usage: showAlert('Your message', 'success');