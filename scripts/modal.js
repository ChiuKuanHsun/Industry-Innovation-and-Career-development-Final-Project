// scripts/modal.js

const NthuCourseModal = {
    show(url, originRect) {
        this.close(true); // Immediately close any existing modal
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'nthu-helper-modal-overlay';
        const modalContent = document.createElement('div');
        modalContent.id = 'nthu-helper-modal-content';
        modalContent.innerHTML = `<button id="nthu-helper-modal-close">&times;</button><iframe src="${url}"></iframe>`;
        

        if (originRect) {
            const originX = originRect.left + originRect.width / 2;
            const originY = originRect.top + originRect.height / 2;
            modalContent.style.transformOrigin = `${originX}px ${originY}px`;
        }
        modalOverlay.classList.add('opening');

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        document.getElementById('nthu-helper-modal-close').addEventListener('click', () => this.close());
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) this.close();
        });
    },

    close(immediately = false) {
        const modalOverlay = document.getElementById('nthu-helper-modal-overlay');
        if (modalOverlay) {
            if (immediately) {
                modalOverlay.remove();
                return;
            }
            modalOverlay.classList.remove('opening');
            modalOverlay.classList.add('closing');
            

            modalOverlay.addEventListener('animationend', () => {
                modalOverlay.remove();
            }, { once: true });
        }
    },
    /**
     * Show the interactive modal for saved courses
     * @param {Array<Object>} savedCourses - Array of saved course objects
     * @param {Function} onRemoveCallback - Callback function to execute when a course is removed
     */
    showSavedCoursesModal(savedCourses, onRemoveCallback, originRect) {
        this.close(true);

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'nthu-helper-modal-overlay';
        const modalContent = document.createElement('div');
        modalContent.id = 'nthu-helper-modal-content';
        modalContent.classList.add('saved-courses-modal');
        if (originRect) {
            const originX = originRect.left + originRect.width / 2;
            const originY = originRect.top + originRect.height / 2;
            modalContent.style.transformOrigin = `${originX}px ${originY}px`;
        }
        modalOverlay.classList.add('opening');
        
        const dayMap = { 1: 'M', 2: 'T', 3: 'W', 4: 'R', 5: 'F', 6: 'S', 7: 'U' };

        const tableRows = savedCourses.length === 0 
            ? '<tr><td colspan="8" class="no-saved-courses">尚未暫存任何課程</td></tr>'
            : savedCourses.map((course, index) => {
                const formattedTime = course.time.map(t => `${dayMap[t.day] || '?'}${t.slot}`).join(' ');
                let addActionCellHTML = '';

                if (course.addActionArgs) {
                    if (course.isGeInput) {
                        addActionCellHTML = `<input type="text" placeholder="志願序" class="ge-priority-input" data-course-index="${index}"><button class="btn2 add-course-btn" data-action="add" data-index="${index}">加 Add</button>`;
                    } else {
                        addActionCellHTML = `<button class="btn2 add-course-btn" data-action="add" data-index="${index}">加 ADD</button>`;
                    }
                }
                const syllabusActionCellHTML = course.syllabusActionArgs 
                    ? `<button class="btn2 syllabus-btn" data-action="syllabus" data-index="${index}">大綱</button>` 
                    : '';

                return `
                    <tr data-course-id="${course.id}">
                        <td>${course.id}</td>
                        <td>${course.name}</td>
                        <td>${course.teacher.split('\n')[0]}</td>
                        <td>${course.credit}</td>
                        <td>${formattedTime}</td>
                        <td class="action-cell">${addActionCellHTML}</td>
                        <td class="action-cell">${syllabusActionCellHTML}</td>
                        <td><button class="remove-btn" data-index="${index}">移除</button></td>
                    </tr>
                `;
            }).join('');

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>已暫存課程清單</h2>
                <div class="betage-label">Beta</div>
                <button class="delete-all-btn" id="nthu-helper-delete-all-saved-courses">清空全部</button>
                <button id="nthu-helper-modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <table class="saved-courses-table">
                    <thead><tr><th>科號</th><th>課程名稱</th><th>教師</th><th>學分</th><th>時間</th><th>加選</th><th>大綱</th><th>操作</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        

        modalContent.querySelector('tbody').addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-btn')) {
                onRemoveCallback(parseInt(event.target.dataset.index, 10));
            }
        });
        modalContent.querySelector('.delete-all-btn').addEventListener('click', () => {
            onRemoveCallback(-1); // remove all
        });
        
        document.getElementById('nthu-helper-modal-close').addEventListener('click', () => this.close());
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) this.close();
        });
        
    }
};