NthuCourseModal.showSavedCoursesModal(savedCourses, (indexToRemove) => {
        if (indexToRemove === -1) {
            savedCourses = [];
            chrome.storage.sync.set({ 'savedCourses': [] }, () => {
                //console.log('所有暫存課程已清空');
                updateSavedListButton();
                const courseTable = document.getElementById('T1');
                if (courseTable) {
                    const rows = courseTable.querySelectorAll('tbody tr');
                    rows.forEach((row, index) => {
                        const bookmarkCheckbox = row.querySelector(`#nthu-helper-bookmark-${index}`);
                        if (bookmarkCheckbox) {
                            bookmarkCheckbox.checked = false;
                        }
                    });
                }
                openSavedCoursesModal();
            });
            return;
        }
        const courseToRemove = savedCourses[indexToRemove];
        if (!courseToRemove) return;

        savedCourses.splice(indexToRemove, 1);
        
        chrome.storage.sync.set({ 'savedCourses': savedCourses }, () => {
            //console.log('課程已從暫存移除');
            
            updateSavedListButton();
            const courseTable = document.getElementById('T1');
            if (courseTable) {
                 const rows = courseTable.querySelectorAll('tbody tr');
                 rows.forEach((row, index) => {
                    const idCell = row.cells[1];
                    if (idCell && idCell.innerText.trim() === courseToRemove.id) {
                        const bookmarkCheckbox = row.querySelector(`#nthu-helper-bookmark-${index}`);
                        if (bookmarkCheckbox) {
                            bookmarkCheckbox.checked = false;
                        }
                    }
                 });
            }
            
            openSavedCoursesModal();
        });

    }, buttonRect);


