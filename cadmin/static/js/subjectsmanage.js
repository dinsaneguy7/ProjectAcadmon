document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const subjectModal = document.getElementById('subjectModal');
    const closeModal = document.getElementById('closeModal');
    const cancelSubject = document.getElementById('cancelSubject');
    const subjectForm = document.getElementById('subjectForm');
    const modalTitle = document.getElementById('modalTitle');
    const subjectClassSelect = document.getElementById('subjectClassSelect');
    const subjectTeacherSelect = document.getElementById('subjectTeacher');
    const filterClassSelect = document.getElementById('subjectClass');
    
    // Table body
    const subjectsTableBody = document.getElementById('subjectsTableBody');
    
    let subjects = [];
    let classes = [];
    let teachers = [];

    // Fetch classes for dropdowns
    function fetchClasses() {
        return fetch('/cadmin/api/classes/')
            .then(response => response.json())
            .then(data => {
                classes = data;
                populateDropdowns();
            });
    }

    // Fetch teachers for dropdowns
    function fetchTeachers() {
        return fetch('/cadmin/api/teachers/')
            .then(response => response.json())
            .then(data => {
                teachers = data;
                populateDropdowns();
            });
    }

    // Fetch subjects from API
    function fetchSubjects() {
        fetch('/cadmin/api/subjects/')
            .then(response => response.json())
            .then(data => {
                subjects = data;
                renderSubjectsTable();
            });
    }

    // Populate class and teacher dropdowns
    function populateDropdowns() {
        // Class dropdown for form
        subjectClassSelect.innerHTML = '<option value="">-- Select Class --</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            subjectClassSelect.appendChild(option.cloneNode(true));
        });
        // Class dropdown for filter
        filterClassSelect.innerHTML = '<option value="">All Classes</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            filterClassSelect.appendChild(option);
        });
        // Teacher dropdown
        subjectTeacherSelect.innerHTML = '<option value="">-- Select Teacher --</option>';
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.firstname} ${teacher.lastname}`;
            subjectTeacherSelect.appendChild(option);
        });
    }

    // Render subjects table
    function renderSubjectsTable() {
        subjectsTableBody.innerHTML = '';
        subjects.forEach(subject => {
            const row = document.createElement('tr');
            row.className = 'subject-row';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap" data-label="Subject">
                    <div class="text-sm font-medium text-gray-900">${subject.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Class">
                    <span class="class-badge">${subject.subject_class && subject.subject_class.name ? subject.subject_class.name : 'Not assigned'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Teacher">
                    ${subject.teacher ? `
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-6 w-6">
                                <img class="h-6 w-6 rounded-full" src="${subject.teacher.image_url || '/static/img/default-profile.png'}" alt="${subject.teacher.firstname} ${subject.teacher.lastname}">
                            </div>
                            <div class="ml-2">
                                <div class="text-sm text-gray-900">${subject.teacher.firstname} ${subject.teacher.lastname}</div>
                            </div>
                        </div>
                    ` : '<span class="text-sm text-gray-500">Not assigned</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Created">
                    <div class="text-sm text-gray-500">${subject.created_at}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right" data-label="Actions">
                    <div class="flex justify-end space-x-2">
                        <button class="subject-action-btn edit-subject text-indigo-600 hover:text-indigo-900" data-id="${subject.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="subject-action-btn delete-subject text-red-600 hover:text-red-900" data-id="${subject.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            subjectsTableBody.appendChild(row);
        });
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-subject').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.target.closest('button').dataset.id));
        });
        document.querySelectorAll('.delete-subject').forEach(btn => {
            btn.addEventListener('click', (e) => deleteSubject(e.target.closest('button').dataset.id));
        });
    }

    // Open modal for adding a new subject
    addSubjectBtn.addEventListener('click', () => {
        subjectForm.reset();
        document.getElementById('subjectId').value = '';
        modalTitle.textContent = 'Add New Subject';
        subjectModal.classList.remove('hidden');
    });

    // Close modal
    function closeSubjectModal() {
        subjectModal.classList.add('hidden');
    }
    closeModal.addEventListener('click', closeSubjectModal);
    cancelSubject.addEventListener('click', closeSubjectModal);

    // Open modal for editing subject
    function openEditModal(id) {
        const subject = subjects.find(s => s.id == id);
        if (subject) {
            document.getElementById('subjectId').value = subject.id;
            document.getElementById('subjectName').value = subject.name;
            document.getElementById('subjectClassSelect').value = subject.subject_class ? subject.subject_class.id : '';
            document.getElementById('subjectTeacher').value = subject.teacher ? subject.teacher.id : '';
            modalTitle.textContent = 'Edit Subject';
            subjectModal.classList.remove('hidden');
        }
    }

    // Delete subject
    function deleteSubject(id) {
        showConfirm('Are you sure you want to delete this subject? All associated data will be removed.', function(confirmed) {
            if (confirmed) {
                fetch(`/cadmin/api/subjects/${id}/delete/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken(),
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        fetchSubjects();
                        showAlert('Subject deleted successfully', 'success');
                    } else {
                        showAlert('Error deleting subject', 'error');
                    }
                });
            }
        });
    }

    // Form submission for add/edit
    subjectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('subjectId').value;
        const formData = new FormData(subjectForm);
        let url = '/cadmin/api/subjects/create/';
        if (id) {
            url = `/cadmin/api/subjects/${id}/update/`;
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
                fetchSubjects();
                closeSubjectModal();
                showAlert(`Subject ${id ? 'updated' : 'added'} successfully`, 'success');
            } else {
                showAlert('Error saving subject: ' + (data.error || 'Unknown error'), 'error');
            }
        });
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

    // Initial fetch
    Promise.all([fetchClasses(), fetchTeachers()]).then(fetchSubjects);

    // Search functionality
    document.getElementById('subjectSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.subject-row').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Filter by class
    document.getElementById('subjectClass').addEventListener('change', function(e) {
        const classId = e.target.value;
        if (!classId) {
            document.querySelectorAll('.subject-row').forEach(row => {
                row.style.display = '';
            });
            return;
        }
        document.querySelectorAll('.subject-row').forEach(row => {
            const subjectId = row.querySelector('.edit-subject').dataset.id;
            const subject = subjects.find(s => s.id == subjectId);
            const showRow = subject && subject.subject_class && subject.subject_class.id == classId;
            row.style.display = showRow ? '' : 'none';
        });
    });
});