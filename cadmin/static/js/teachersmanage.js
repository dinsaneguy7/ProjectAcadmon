document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    const teacherModal = document.getElementById('teacherModal');
    const closeModal = document.getElementById('closeModal');
    const cancelTeacher = document.getElementById('cancelTeacher');
    const teacherForm = document.getElementById('teacherForm');
    const modalTitle = document.getElementById('modalTitle');
    const teachersTableBody = document.getElementById('teachersTableBody');

    let teachers = [];

    // Fetch teachers from API
    function fetchTeachers() {
        fetch('/cadmin/api/teachers/')
            .then(response => response.json())
            .then(data => {
                teachers = data;
                renderTeachersTable();
            });
    }

    // Render teachers table
    function renderTeachersTable() {
        teachersTableBody.innerHTML = '';
        teachers.forEach(teacher => {
            const row = document.createElement('tr');
            row.className = 'teacher-row';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap" data-label="Teacher">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" src="${teacher.image_url || '/static/img/default-profile.png'}" alt="${teacher.firstname} ${teacher.lastname}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${teacher.firstname} ${teacher.lastname}</div>
                            <div class="text-sm text-gray-500">${teacher.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Contact">
                    <div class="text-sm text-gray-900">${teacher.phone}</div>
                    <div class="text-sm text-gray-500">${teacher.address.split(',')[0]}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Specialization">
                    <div class="text-sm text-gray-900">${teacher.specialization}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Joined">
                    <div class="text-sm text-gray-500">${teacher.created_at}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right" data-label="Actions">
                    <div class="flex justify-end space-x-2">
                        <button class="action-btn edit-teacher text-indigo-600 hover:text-indigo-900" data-id="${teacher.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-teacher text-red-600 hover:text-red-900" data-id="${teacher.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            teachersTableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.edit-teacher').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.closest('button').dataset.id;
                openEditModal(id);
            });
        });
        document.querySelectorAll('.delete-teacher').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.closest('button').dataset.id;
                deleteTeacher(id);
            });
        });
    }

    // Open modal for adding a new teacher
    addTeacherBtn.addEventListener('click', () => {
        teacherForm.reset();
        document.getElementById('teacherId').value = '';
        modalTitle.textContent = 'Add New Teacher';
        teacherModal.classList.remove('hidden');
    });

    // Close modal
    function closeTeacherModal() {
        teacherModal.classList.add('hidden');
    }
    closeModal.addEventListener('click', closeTeacherModal);
    cancelTeacher.addEventListener('click', closeTeacherModal);

    // Open modal for editing teacher
    function openEditModal(id) {
        const teacher = teachers.find(t => t.id == id);
        if (teacher) {
            document.getElementById('teacherId').value = teacher.id;
            document.getElementById('firstname').value = teacher.firstname;
            document.getElementById('lastname').value = teacher.lastname;
            document.getElementById('email').value = teacher.email;
            document.getElementById('phone').value = teacher.phone;
            document.getElementById('specialization').value = teacher.specialization;
            document.getElementById('address').value = teacher.address;
            var roleField = document.getElementById('role');
            if (roleField && teacher.role) roleField.value = teacher.role;
            var passwordField = document.getElementById('password');
            if (passwordField) passwordField.value = teacher.password || '';
            modalTitle.textContent = 'Edit Teacher';
            teacherModal.classList.remove('hidden');
        }
    }

    // Tailwind dismissible alert
    function showAlert(message, type = 'success') {
        if (!window.alertBox) {
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

    // Delete teacher
    function deleteTeacher(id) {
        showConfirm('Are you sure you want to delete this teacher?', function(confirmed) {
            if (confirmed) {
                fetch(`/cadmin/api/teachers/${id}/delete/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken(),
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        fetchTeachers();
                        showAlert('Teacher deleted successfully', 'success');
                    } else {
                        showAlert('Error deleting teacher', 'error');
                    }
                });
            }
        });
    }

    // Form submission for add/edit
    teacherForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('teacherId').value;
        const formData = new FormData(teacherForm);
        let url = '/cadmin/api/teachers/create/';
        if (id) {
            url = `/cadmin/api/teachers/${id}/update/`;
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
                fetchTeachers();
                closeTeacherModal();
                showAlert(`Teacher ${id ? 'updated' : 'added'} successfully`, 'success');
            } else {
                showAlert('Error saving teacher: ' + (data.error || 'Unknown error'), 'error');
            }
        });
    });

    // Search functionality
    document.getElementById('teacherSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.teacher-row').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Sort functionality
    document.getElementById('teacherSort').addEventListener('change', function(e) {
        const sortValue = e.target.value;
        switch(sortValue) {
            case 'name_asc':
                teachers.sort((a, b) => `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`));
                break;
            case 'name_desc':
                teachers.sort((a, b) => `${b.firstname} ${b.lastname}`.localeCompare(`${a.firstname} ${a.lastname}`));
                break;
            case 'recent':
                teachers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                teachers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
        }
        renderTeachersTable();
    });

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
    fetchTeachers();
});