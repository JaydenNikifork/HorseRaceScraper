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
        res.json().then(diffs => {
            const thead = document.getElementById('thead');
            const tbody = document.getElementById('tbody');
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