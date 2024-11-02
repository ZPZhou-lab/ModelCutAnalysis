// define constants
const n_cuts = 99; // number of bins
let thresholds = [20, 40, 60, 80, 90]; // initial thresholds

// get the bar element
const bar = document.getElementById('bar');
const addThresholdBtn = document.getElementById('add-threshold');
const addReportBtn = document.getElementById('add-report');
const reportContainer = document.getElementById('report-container');

// add a new threshold into the bar
function createThresholdElements() {
    bar.innerHTML = ''; // clear the bar
    thresholds.forEach((threshold, index) => {
        const th = document.createElement('div');
        th.classList.add('threshold');
        th.style.left = `${threshold}%`;
        th.setAttribute('thres-idx', index);
        th.setAttribute('data-val', threshold);
        // th.setAttribute('data-name', `cut ${index + 1} ${threshold}`);
        bar.appendChild(th);
    
        // the first line of the threshold name
        const label1 = document.createElement('div');
        label1.classList.add('label-line1');
        label1.innerText = `cut ${index + 1}`;
        th.appendChild(label1);
        // the second line of the threshold idx
        const label2 = document.createElement('div');
        label2.classList.add('label-line2');
        label2.innerText = threshold;
        th.appendChild(label2);

        // delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerText = '×'; // 乘号作为删除标志
        deleteBtn.setAttribute('data-index', index);
        th.appendChild(deleteBtn);
    
        console.log(`Threshold ${index + 1} created at ${threshold}`);

        // add event listener
        th.addEventListener('mousedown', updateThreshold);
        // add event listener to delete button
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteThreshold(index);
        });
    });
}

// update threshold
function updateThreshold(e) {
    e.preventDefault();
    const th = e.target;
    const index = parseInt(th.getAttribute('thres-idx'));
    
    // get the bar's bounding rect
    const barRect = bar.getBoundingClientRect();
    
    // get the min and max value of the threshold
    const min = index === 0 ? 0 : thresholds[index - 1] + 1;
    const max = index === thresholds.length - 1 ? n_cuts : thresholds[index + 1] - 1;
    
    function onMouseMove(event) {
        let newLeft = ((event.clientX - barRect.left) / barRect.width) * 100;

        // get the new left value and transform it into integer
        newLeft = Math.max(min, Math.min(newLeft, max));
        newLeft = Math.round(newLeft);

        th.style.left = `${newLeft}%`;

        // update the threshold
        thresholds[index] = newLeft;
        th.setAttribute('data-val', newLeft);
        // th.setAttribute('data-name', `cut ${index + 1} ${newLeft}`);
        // update the label
        const label2 = th.querySelector('.label-line2');
        label2.innerText = `${newLeft}`;

        // update the report card
        const reportCards = reportContainer.children;
        for (let i = 0; i < reportCards.length; i++) {
            const report = reportCards[i];
            updateReport(report);
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        console.log(`Threshold ${index + 1} updated to ${thresholds[index]}`);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// add a new threshold
function addThreshold() {
    let newThresholdInput = prompt("请输入新阈值的位置（0-100之间的整数）：", "");
    if (newThresholdInput === null) return;

    newThresholdInput = newThresholdInput.trim();
    if (newThresholdInput === '') {
        alert("阈值不能为空！");
        return;
    }

    const newThreshold = parseInt(newThresholdInput, 10);
    if (isNaN(newThreshold) || newThreshold < 0 || newThreshold > n_cuts) {
        alert("请输入一个有效的整数，范围在0到100之间。");
        return;
    }

    // check if the new threshold is a duplicate
    const isDuplicate = thresholds.some(th => Math.abs(th - newThreshold) < 1);
    if (isDuplicate) {
        alert("该阈值已存在！");
        return;
    }

    // add the new threshold and re-sort
    thresholds.push(newThreshold);
    // re-render the threshold elements
    sortThresholds();
    createThresholdElements();
}

// delete a threshold
function deleteThreshold(index) {
    // remove the threshold
    thresholds.splice(index, 1);
    // re-render the threshold elements
    sortThresholds();
    createThresholdElements();
}

// sort the thresholds
function sortThresholds() {
    thresholds.sort((a, b) => a - b);
}

// add event listener to the add threshold button
addThresholdBtn.addEventListener('click', addThreshold);


function addReport() {
    // let reportTitle = prompt("请输入报表名称：", `报表 ${reportContainer.children.length + 1}`);
    // if (reportTitle === null) reportTitle = `报表 ${reportContainer.children.length + 1}`; 

    // create a new report card
    const newCard = document.createElement('div');
    newCard.classList.add('report-card');

    // create report title
    const title = document.createElement('h3');
    title.innerText = "New Report";
    newCard.appendChild(title);

    // create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerText = '×';
    newCard.appendChild(deleteBtn);

    // create chart
    // const chartContainer = document.createElement('div');
    const table = document.createElement('table');
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr');
    // create table header
    const indexHeader = document.createElement('th');
    indexHeader.textContent = 'Index';
    const fpdHeader = document.createElement('th');
    fpdHeader.textContent = 'FPD';

    headerRow.appendChild(indexHeader);
    headerRow.appendChild(fpdHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    // add 100 at the tail of the thresholds
    const _thresholds = [...thresholds, 100];
    _thresholds.forEach((value, index) => {
        const row = document.createElement('tr');

        const indexCell = document.createElement('td');
        indexCell.textContent = index + 1;

        const fpdCell = document.createElement('td');
        const dataBar = document.createElement('div');
        dataBar.classList.add('data-bar');
        dataBar.style.width = (value) + '%';
        dataBar.textContent = value;

        fpdCell.appendChild(dataBar);
        row.appendChild(indexCell);
        row.appendChild(fpdCell);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    // chartContainer.classList.add('chart-container');
    newCard.appendChild(table);

    // add event listener to delete button
    deleteBtn.addEventListener('click', () => {
        if (confirm(`delete report?`)) {
            reportContainer.removeChild(newCard);
        }
    });

    // add the new report card to the report container
    reportContainer.appendChild(newCard);
}


// update the report method
function updateReport(report) {
    const table = report.querySelector('table');
    const tbody = table.querySelector('tbody');
    const rows = tbody.children;
    const _thresholds = [...thresholds, 100];
    _thresholds.forEach((value, index) => {
        const row = rows[index];
        const dataBar = row.querySelector('.data-bar');
        dataBar.style.width = (value) + '%';
        dataBar.textContent = value;
    });
}

/* init */
function init() {
    // initialize the bar
    createThresholdElements();
    addThresholdBtn.addEventListener('click', addThreshold);
    addReportBtn.addEventListener('click', addReport);
}
init();
