// scripts/filter.js
// deal with filter logics for course selection page

const NthuCourseFilter = {

    // Get the time slots selected by the user on the time grid
    getSelectedTimeSlots() {
        const selected = [];
        const slots = document.querySelectorAll('.nthu-helper-time-grid .time-slot.selected');
        slots.forEach(slot => {
            selected.push({
                day: parseInt(slot.dataset.day, 10),
                slot: slot.dataset.slot
            });
        });
        return selected;
    },

    // Check if any time slot of the course clashes with selected time slots
    isTimeSlotClashing(courseTimes, selectedTimes) {
        if (!selectedTimes || selectedTimes.length === 0) return false;
        for (const courseTime of courseTimes) {
            for (const selectedTime of selectedTimes) {
                if (courseTime.day === selectedTime.day && courseTime.slot === selectedTime.slot) {
                    return true;
                }
            }
        }
        return false;
    },

    // Check if the courseToCheck clashes with any of the enrolledCourses
    isCourseClashing(courseToCheck, enrolledCourses, allowGeClash, allowXClassClash) {
        if (!enrolledCourses || enrolledCourses.length === 0) return false;

        for (const timeSlot of courseToCheck.time) {
            for (const enrolledCourse of enrolledCourses) {
                for (const enrolledTimeSlot of enrolledCourse.time) {
                    // Check if the time slots clash
                    if (timeSlot.day === enrolledTimeSlot.day && timeSlot.slot === enrolledTimeSlot.slot) {

                        //X-Class clash logic
                        if (allowXClassClash && (courseToCheck.isXClass || enrolledCourse.isXClass)) {
                            continue;
                        }

                        // If GE clash is allowed and both courses are GE courses, do not count as a clash
                        if (allowGeClash && courseToCheck.isGe && enrolledCourse.isGe) {
                            continue;
                        }
                        return true; // Clash detected
                    }
                }
            }
        }
        return false; // No unforgivable clash detected
    },
    
    checkTimeMatch(courseTimes, selectedTimes, isStrict) {
        if (selectedTimes.length === 0) {
            return true;
        }
        
        if (courseTimes.length === 0) {
            return false;
        }

        if (isStrict) {
            // strict mode
            // Condition: All time slots of the course must be within the selected range, and the number of slots must be exactly equal.

            // The number of slots must be exactly equal
            if (courseTimes.length !== selectedTimes.length) {
                return false;
            }

            // Each time slot of the course must be found within the selected time slots.
            const selectedSet = new Set(selectedTimes.map(t => `${t.day}-${t.slot}`));
            return courseTimes.every(ct => selectedSet.has(`${ct.day}-${ct.slot}`));

        } else {
            // fuzzy mode
            // Condition: If any time slot of the course appears within the user's selected range, it is considered a match.
            for (const courseTime of courseTimes) {
                for (const selectedTime of selectedTimes) {
                    if (courseTime.day === selectedTime.day && courseTime.slot === selectedTime.slot) {
                        return true; // Return true as soon as a match is found
                    }
                }
            }
            return false; // No matches found
        }
    },

    // Main filter function
    filterAll(table, courses, enrolledCourses) {
        const nameQuery = document.getElementById('nthu-helper-filter-name').value.toLowerCase();
        const teacherQuery = document.getElementById('nthu-helper-filter-teacher').value.toLowerCase();
        const courseNoQuery = document.getElementById('nthu-helper-filter-courseNo').value.toLowerCase();
        const hideClash = document.getElementById('nthu-helper-hide-clash').checked;
        const strictFilter = document.getElementById('nthu-helper-strict-filter').checked;
        const selectedTimes = this.getSelectedTimeSlots();

        const allowGeClashCheckbox = document.getElementById('nthu-helper-allow-ge-clash');
        const allowGeClash = allowGeClashCheckbox ? allowGeClashCheckbox.checked : false;

        const allowXClassClashCheckbox = document.getElementById('nthu-helper-allow-xclass-clash');
        const allowXClassClash = allowXClassClashCheckbox ? allowXClassClashCheckbox.checked : false;

        const rows = table.querySelectorAll('tbody tr');

        courses.forEach((course, index) => {
            const row = rows[index];
            if (!row || !course) return;

            const nameMatch = !nameQuery || course.name.toLowerCase().includes(nameQuery) || course.nameEn.toLowerCase().includes(nameQuery);
            const teacherMatch = !teacherQuery || course.teacher.toLowerCase().includes(teacherQuery);
            const courseNoMatch = !courseNoQuery || course.id.toLowerCase().includes(courseNoQuery);
            

            const timeSelectMatch = this.checkTimeMatch(course.time, selectedTimes, strictFilter);
            //const timeSelectMatch = selectedTimes.length === 0 || this.isTimeSlotClashing(course.time, selectedTimes);

            const clashMatch = !hideClash || !this.isCourseClashing(course, enrolledCourses, allowGeClash, allowXClassClash);

            if (nameMatch && teacherMatch && courseNoMatch && timeSelectMatch && clashMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
};