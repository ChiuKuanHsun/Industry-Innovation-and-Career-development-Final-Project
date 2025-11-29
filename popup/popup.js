// popup/popup.js

const nthuTimeSlots = [
    { code: '1', start: '08:00', end: '08:50' },
    { code: '2', start: '09:00', end: '09:50' },
    { code: '3', start: '10:10', end: '11:00' },
    { code: '4', start: '11:10', end: '12:00' },
    { code: 'n', start: '12:10', end: '13:00' },
    { code: '5', start: '13:20', end: '14:10' },
    { code: '6', start: '14:20', end: '15:10' },
    { code: '7', start: '15:30', end: '16:20' },
    { code: '8', start: '16:30', end: '17:20' },
    { code: '9', start: '17:30', end: '18:20' },
    { code: 'a', start: '18:30', end: '19:20' },
    { code: 'b', start: '19:30', end: '20:20' },
    { code: 'c', start: '20:30', end: '21:20' },
    { code: 'd', start: '21:30', end: '22:20' }
];

const colorPalettes = {
    'default': null, 
    'pastel': [
        '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', 
        '#F6EAC2', '#FF9AA2', '#D5AAFF', '#85E3FF', '#B9F6CA'
    ],
    'vibrant': [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
        '#F7DC6F', '#BB8FCE', '#F1948A', '#54A0FF', '#ad5ec5ff'
    ],
    'morandi': [
        '#7A7281', '#A29BFE', '#B2BABB', '#95A5A6', '#D7BDE2', 
        '#A3E4D7', '#FAD7A0', '#EDBB99', '#84817a', '#d1ccc0'
    ]
};

document.addEventListener('DOMContentLoaded', () => {
   
    const wrapper = document.querySelector('.popup-wrapper');
    const schedulePage = document.getElementById('schedule-page');
    const settingsPage = document.getElementById('settings-page');
    const goToSettingsBtn = document.getElementById('go-to-settings');
    const goToScheduleBtn = document.getElementById('go-to-schedule');
    
    
    const allowGeClashCheckbox = document.getElementById('allow-ge-clash');
    const colorThemeSelect = document.getElementById('color-theme'); // 新增

    
    const ratioSlider = document.getElementById('frameset-ratio');
    const saveRatioBtn = document.getElementById('save-ratio-btn');
    
    
    const scheduleContainer = document.getElementById('schedule-container');

    
    goToSettingsBtn.addEventListener('click', () => {
        schedulePage.classList.remove('active');
        settingsPage.classList.add('active');
    });

    goToScheduleBtn.addEventListener('click', () => {
        settingsPage.classList.remove('active');
        schedulePage.classList.add('active');
        loadAndRenderSchedule();
    });

    const toggleWeekendBtn = document.getElementById('toggle-weekend-btn');
    toggleWeekendBtn.addEventListener('click', () => {
        const wrapper = document.querySelector('.schedule-wrapper');
        if (wrapper) {
            wrapper.classList.toggle('weekend-visible');
            const isVisible = wrapper.classList.contains('weekend-visible');
            toggleWeekendBtn.textContent = isVisible ? '隱藏週末' : '顯示週末';
        }
    });

    function loadAndRenderSchedule() {
        chrome.storage.sync.get(['savedSchedule', 'colorTheme'], (result) => {
            const theme = result.colorTheme || 'default';
            if (result.savedSchedule && result.savedSchedule.length > 0) {
                renderSchedule(result.savedSchedule, scheduleContainer, theme);
                highlightCurrentTime();
            } else {
                scheduleContainer.innerHTML = '<p class="no-schedule-msg">尚未儲存課表。請至清大選課結果頁面點擊「儲存課表」按鈕。</p>';
            }
        });
    }

    loadAndRenderSchedule();

    chrome.storage.sync.get(['allowGeClash', 'colorTheme', 'framesetRatio'], (result) => {
        allowGeClashCheckbox.checked = result.allowGeClash || false;
        colorThemeSelect.value = result.colorTheme || 'default'; 
        ratioSlider.value = result.framesetRatio || 350;
    });

    allowGeClashCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ allowGeClash: allowGeClashCheckbox.checked });
    });

    colorThemeSelect.addEventListener('change', () => {
        chrome.storage.sync.set({ colorTheme: colorThemeSelect.value });
    });

    saveRatioBtn.addEventListener('click', () => {
        const newRatio = ratioSlider.value;
        chrome.storage.sync.set({ 'framesetRatio': newRatio }, () => {
            alert('比例已儲存！');
        });
        chrome.tabs.query({ url: "*://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH713003.php*" }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "updateFramesetRatio",
                    ratio: newRatio
                });
            } else {
                alert('找不到選課頁面分頁。此設定將在您下次開啟選課頁面時生效。');
            }
        });
    });

    setInterval(highlightCurrentTime, 60000);
});

function timeSlotToGridRow(slotCode) {
    const slotMap = {
        '1': 1, '2': 2, '3': 3, '4': 4, 'n': 5,
        '5': 6, '6': 7, '7': 8, '8': 9, '9': 10,
        'a': 11, 'b': 12, 'c': 13, 'd': 14
    };
    return slotMap[slotCode] || 0;
}

function highlightCurrentTime() {
    const courseLayer = document.querySelector('.course-layer');
    if (!courseLayer) return;

    let overlay = document.getElementById('current-time-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'current-time-overlay';
        overlay.className = 'current-time-overlay';
        courseLayer.appendChild(overlay);
    }

    let breakIndicator = document.getElementById('break-time-indicator');
    if (!breakIndicator) {
        breakIndicator = document.createElement('div');
        breakIndicator.id = 'break-time-indicator';
        breakIndicator.className = 'break-time-indicator';
        breakIndicator.innerHTML = '<span>下課時間</span>';
        courseLayer.appendChild(breakIndicator);
    }

    const now = new Date();
    const day = now.getDay(); 
    
    const gridCol = (day === 0) ? 8 : day + 1;

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    let isClassTime = false;
    let isBreakTime = false;
    let currentSlotGridRow = 0;
    let breakAfterGridRow = 0; 

    for (const slot of nthuTimeSlots) {
        if (currentTimeStr >= slot.start && currentTimeStr <= slot.end) {
            currentSlotGridRow = timeSlotToGridRow(slot.code) + 1; 
            isClassTime = true;
            break;
        }
    }

    if (!isClassTime) {
        for (let i = 0; i < nthuTimeSlots.length - 1; i++) {
            const currentSlot = nthuTimeSlots[i];
            const nextSlot = nthuTimeSlots[i+1];
            
            if (currentTimeStr > currentSlot.end && currentTimeStr < nextSlot.start) {
                isBreakTime = true;
                breakAfterGridRow = timeSlotToGridRow(currentSlot.code) + 1;
                break;
            }
        }
    }

    if (isClassTime && currentSlotGridRow > 1) {
        overlay.style.display = 'block';
        overlay.style.gridColumn = gridCol; 
        overlay.style.gridRow = currentSlotGridRow;
    } else {
        overlay.style.display = 'none';
    }

    if (isBreakTime && breakAfterGridRow > 1) {
        breakIndicator.style.display = 'flex';
        
        breakIndicator.style.gridColumn = gridCol; 
        
        breakIndicator.style.gridRow = breakAfterGridRow;
        breakIndicator.style.alignSelf = 'end'; 
        breakIndicator.style.transform = 'translateY(50%)'; 
    } else {
        breakIndicator.style.display = 'none';
    }
}

function renderSchedule(courses, container, theme = 'default') {
    container.innerHTML = '';
    const scheduleWrapper = document.createElement('div');
    scheduleWrapper.className = 'schedule-wrapper';
    
    const toggleBtn = document.getElementById('toggle-weekend-btn');
    if (toggleBtn && toggleBtn.textContent === '隱藏週末') {
        scheduleWrapper.classList.add('weekend-visible');
    }

    const timetableGrid = document.createElement('div');
    timetableGrid.className = 'timetable-grid';
    
    let gridHTML = '<div class="grid-cell empty-corner"></div>';
    const daysOfWeek = ['一', '二', '三', '四', '五', '六', '日'];
    daysOfWeek.forEach(day => gridHTML += `<div class="grid-cell day-label">${day}</div>`);
    const timeLabels = ['1', '2', '3', '4', 'n', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd'];
    timeLabels.forEach(slotCode => {
        gridHTML += `<div class="grid-cell time-label-vertical">${slotCode}</div>`;
        for (let i = 0; i < 7; i++) {
            gridHTML += `<div class="grid-cell time-slot-background"></div>`;
        }
    });
    timetableGrid.innerHTML = gridHTML;
    
    const courseLayer = document.createElement('div');
    courseLayer.className = 'course-layer';
    
    const courseColorMap = new Map();
    let paletteIndex = 0; 

    courses.forEach(course => {
        let customColor = null;
        if (theme !== 'default' && colorPalettes[theme]) {
            const palette = colorPalettes[theme];
            
            if (courseColorMap.has(course.name)) {
                customColor = courseColorMap.get(course.name);
            } else {
                customColor = palette[paletteIndex % palette.length];
                courseColorMap.set(course.name, customColor);
                paletteIndex++; 
            }
        }

        const courseTimeSlots = {};
        course.time.forEach(t => {
            if (!courseTimeSlots[t.day]) courseTimeSlots[t.day] = [];
            const gridRow = timeSlotToGridRow(t.slot);
            if (gridRow > 0) courseTimeSlots[t.day].push(gridRow);
        });
        
        for (const day in courseTimeSlots) {
            const slotsInDay = courseTimeSlots[day].sort((a, b) => a - b);
            if (slotsInDay.length === 0) continue;
            
            let startSlot = slotsInDay[0];
            for (let i = 0; i < slotsInDay.length; i++) {
                if (i === slotsInDay.length - 1 || slotsInDay[i + 1] !== slotsInDay[i] + 1) {
                    const endSlot = slotsInDay[i];
                    const courseBlock = document.createElement('div');
                    
                    courseBlock.className = `course-block ${(!customColor && course.isGe) ? 'ge' : ''}`;
                    courseBlock.style.gridColumn = `${parseInt(day) + 1}`;
                    courseBlock.style.gridRow = `${startSlot + 1} / span ${endSlot - startSlot + 1}`;
                    courseBlock.title = `${course.name} (${course.id})`;
                    
                    if (customColor) {
                        courseBlock.style.backgroundColor = customColor;
                        courseBlock.style.borderColor = adjustColor(customColor, -20);
                        courseBlock.style.color = '#333'; 
                    }

                    const textColorStyle = customColor ? 'color:#333' : '';
                    const subTextColorStyle = customColor ? 'color:rgba(0,0,0,0.6)' : '';

                    courseBlock.innerHTML = `<strong style="${textColorStyle}">${course.name}</strong><span style="${subTextColorStyle}">${course.id}</span>`;
                    
                    courseLayer.appendChild(courseBlock);
                    
                    if (i + 1 < slotsInDay.length) {
                        startSlot = slotsInDay[i + 1];
                    }
                }
            }
        }
    });
    
    scheduleWrapper.appendChild(timetableGrid);
    scheduleWrapper.appendChild(courseLayer);
    container.appendChild(scheduleWrapper);
    
    highlightCurrentTime();
}

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}