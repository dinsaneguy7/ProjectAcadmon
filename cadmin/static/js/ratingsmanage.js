document.addEventListener('DOMContentLoaded', function () {
    const addRatingTitleBtn = document.getElementById('addRatingTitleBtn');
    const ratingTitleModal = document.getElementById('ratingTitleModal');
    const closeModal = document.getElementById('closeModal');
    const cancelRatingTitle = document.getElementById('cancelRatingTitle');
    const ratingTitleForm = document.getElementById('ratingTitleForm');
    const modalTitle = document.getElementById('modalTitle');
    const ratingMethodSelect = document.getElementById('ratingMethod');
    const numericalFields = document.getElementById('numericalFields');
    const ratingTitlesTableBody = document.getElementById('ratingTitlesTableBody');

    let ratingTitles = [];

    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function fetchRatingTitles() {
        fetch('/cadmin/api/rating-headings/')
            .then(response => response.json())
            .then(data => {
                ratingTitles = data;
                renderRatingTitlesTable();
            });
    }

    ratingMethodSelect.addEventListener('change', function () {
        numericalFields.classList.toggle('hidden', this.value !== 'numerical');
    });

    function renderRatingTitlesTable() {
        ratingTitlesTableBody.innerHTML = '';
        ratingTitles.forEach(function (title) {
            const row = document.createElement('tr');
            row.className = 'rating-title-row';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap" data-label="Criteria Name">
                    <div class="text-sm font-medium text-gray-900">${title.rating_title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Type">
                    <span class="rating-method-badge ${title.method === 'numerical' ? 'numerical-badge' : 'text-badge'}">
                        ${title.method === 'numerical' ? 'Numerical' : 'Text'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Range">
                    ${title.method === 'numerical' ? `${title.floor} - ${title.ceiling}` : 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Created">
                    <div class="text-sm text-gray-500">${title.created_at}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right" data-label="Actions">
                    <div class="flex justify-end space-x-2">
                        <button class="rating-action-btn edit-rating-title text-indigo-600 hover:text-indigo-900" data-id="${title.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="rating-action-btn delete-rating-title text-red-600 hover:text-red-900" data-id="${title.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>`;
            ratingTitlesTableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-rating-title').forEach(btn => {
            btn.addEventListener('click', e => openEditModal(e.target.closest('button').dataset.id));
        });

        document.querySelectorAll('.delete-rating-title').forEach(btn => {
            btn.addEventListener('click', e => deleteRatingTitle(e.target.closest('button').dataset.id));
        });
    }

    addRatingTitleBtn.addEventListener('click', function () {
        ratingTitleForm.reset();
        document.getElementById('ratingTitleId').value = '';
        modalTitle.textContent = 'Add New Rating Criteria';
        numericalFields.classList.add('hidden');
        ratingTitleModal.classList.remove('hidden');
    });

    function closeRatingTitleModal() {
        ratingTitleModal.classList.add('hidden');
    }

    closeModal.addEventListener('click', closeRatingTitleModal);
    cancelRatingTitle.addEventListener('click', closeRatingTitleModal);

    function openEditModal(id) {
        const title = ratingTitles.find(t => t.id == id);
        if (title) {
            document.getElementById('ratingTitleId').value = title.id;
            document.getElementById('ratingTitle').value = title.rating_title;
            document.getElementById('ratingMethod').value = title.method;

            if (title.method === 'numerical') {
                document.getElementById('floorValue').value = title.floor;
                document.getElementById('ceilingValue').value = title.ceiling;
                numericalFields.classList.remove('hidden');
            } else {
                numericalFields.classList.add('hidden');
            }

            modalTitle.textContent = 'Edit Rating Criteria';
            ratingTitleModal.classList.remove('hidden');
        }
    }

    function deleteRatingTitle(id) {
        showConfirm('Are you sure you want to delete this rating criteria? This action cannot be undone.', function (confirmed) {
            if (confirmed) {
                fetch(`/cadmin/api/rating-headings/${id}/delete/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCSRFToken() },
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            fetchRatingTitles();
                            showAlert('Rating criteria deleted successfully', 'success');
                        } else {
                            showAlert('Error deleting rating criteria', 'error');
                        }
                    });
            }
        });
    }

    ratingTitleForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('ratingTitleId').value;
        const ratingTitle = document.getElementById('ratingTitle').value;
        const method = document.getElementById('ratingMethod').value;
        const floor = method === 'numerical' ? parseInt(document.getElementById('floorValue').value) : null;
        const ceiling = method === 'numerical' ? parseInt(document.getElementById('ceilingValue').value) : null;

        if (method === 'numerical' && ceiling <= floor) {
            showAlert('Maximum value must be greater than minimum value', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('rating_title', ratingTitle);
        formData.append('method', method);
        if (method === 'numerical') {
            formData.append('floor', floor);
            formData.append('ceiling', ceiling);
        }

        const url = id
            ? `/cadmin/api/rating-headings/${id}/update/`
            : '/cadmin/api/rating-headings/create/';

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
                    fetchRatingTitles();
                    closeRatingTitleModal();
                    showAlert(`Rating criteria ${id ? 'updated' : 'added'} successfully`, 'success');
                } else {
                    showAlert('Error saving rating criteria', 'error');
                }
            });
    });

    // Toast-style alert
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

    // Modal confirm box
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

    fetchRatingTitles();
});
