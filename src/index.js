const title = document.getElementById('title');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const updateBtn = document.getElementById('update');

async function login() {
    fetch('http://localhost:8080/login', {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => {
        res.json().then(failed => {
            if (failed) login();
        });
        title.innerText = 'Status: Logged In';
    });
}

function updateTable() {
    title.innerText = "Loading...";

    fetch('http://localhost:8080/getData', {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => {
        res.json().then(data => {
            const diffs = data.diffs;

            let thead = document.getElementById('thead');
            let tbody = document.getElementById('tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            const numHorses = Math.sqrt(diffs.length);
            for (let a = 0; a <= numHorses; ++a) {
                const col = document.createElement('th');
                col.innerText = a ? a : '';
                thead.insertBefore(col, null);

                if (a == 0) continue;

                const row = document.createElement('tr');
                const rowStart = document.createElement('td');
                rowStart.innerText = a;
                rowStart.className = 'rowStart';
                row.insertBefore(rowStart, null);
                for (let b = 0; b < numHorses; ++b) {
                    const rowData = document.createElement('td');
                    rowData.innerText = Math.round(diffs[(a - 1) * numHorses + b] * 100) / 100;
                    if (diffs[(a - 1) * numHorses + b] > 0) rowData.className = 'pos';
                    else rowData.className = 'neg';
                    row.insertBefore(rowData, null);
                }
                tbody.insertBefore(row, null);
            }

            // DD
            const ddData = data.ddOdds;
            thead = document.getElementById('thead2');
            tbody = document.getElementById('tbody2');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            const numRows = ddData.numRows;
            const numCols = ddData.numCols;
            const ddOdds = ddData.ddOdds;
            const winProbs = ddData.winProbs;
            let avgs = [];
            let avgCnts = [];
            for (let a = 0; a <= numCols; ++a) {
                const col = document.createElement('th');
                col.innerText = a ? a : '';
                thead.insertBefore(col, null);
                if (a < numCols) avgs[a] = 0;
                if (a < numCols) avgCnts[a] = 0;
            }
            const col = document.createElement('th');
            col.innerText = 'Row Inefficiency';
            thead.insertBefore(col, null);

            for (let a = 1; a <= numRows; ++a) {
                const row = document.createElement('tr');
                const rowStart = document.createElement('td');
                rowStart.innerText = a;
                rowStart.className = 'rowStart';
                row.insertBefore(rowStart, null);
                let sum = 0;
                for (let b = 0; b < numCols; ++b) {
                    const rowData = document.createElement('td');
                    const odds = ddOdds[(a - 1) * numCols + b];
                    avgs[b] += odds * winProbs[a - 1] / 100;
                    if (odds && odds !== 0) sum += 1 / (odds / 0.77 + 1);
                    if (odds > 0) avgCnts[b]++;
                    if (Math.abs(odds) <= 0.01 || !odds) {
                        rowData.innerText = '-';
                    } else if (odds <= 5) {
                        rowData.innerText = Math.round(odds * 10) / 10;
                    } else {
                        rowData.innerText = Math.round(odds);
                    }
                    row.insertBefore(rowData, null);
                }
                sum /= 0.77;
                sum -= 1;
                const rowData = document.createElement('td');
                if (Math.abs(sum) <= 0.01 || !sum) {
                    rowData.innerText = '-';
                } else if (sum <= 5) {
                    rowData.innerText = Math.round(sum * 10) / 10;
                } else {
                    rowData.innerText = Math.round(sum);
                }
                row.insertBefore(rowData, null);
                tbody.insertBefore(row, null);
            }
            console.log(avgs)
            // avgs = avgs.map((avg, idx) => avg / avgCnts[idx]);
            const row = document.createElement('tr');
            const rowStart = document.createElement('td');
            rowStart.innerText = "Avgs"
            rowStart.className = 'rowStart';
            row.insertBefore(rowStart, null)
            for (const avg of avgs) {
                const rowData = document.createElement('td');
                if (Math.abs(avg) <= 0.01 || !avg) {
                    rowData.innerText = '-';
                } else if (avg <= 5) {
                    rowData.innerText = Math.round(avg * 10) / 10;
                } else {
                    rowData.innerText = Math.round(avg);
                }
                row.insertBefore(rowData, null)
            }
            tbody.insertBefore(row, null);

            title.innerText = 'Status: Last Updated At ' + (((new Date().getHours() - 1) % 12) + 1).toString() + ':' + new Date().getMinutes().toString();
        });
    })
}

async function logout() {
    fetch('http://localhost:8080/logout', {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(_ => {
        title.innerText = "Status: Logged Out";
    })
}

loginBtn.onclick = login;
updateBtn.onclick = updateTable;
logoutBtn.onclick = logout;