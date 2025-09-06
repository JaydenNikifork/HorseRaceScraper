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
            const payouts = ddData.exactaAmts;
            let avgs = [];
            let avgCnts = [];
            for (let a = 0; a <= numCols; ++a) {
                const col = document.createElement('th');
                col.innerText = a ? a : '';
                thead.insertBefore(col, null);
                if (a < numCols) avgs[a] = 0;
                if (a < numCols) avgCnts[a] = 0;
            }
            let col = document.createElement('th');
            col.innerText = 'Implied Odds';
            thead.insertBefore(col, null);
            col = document.createElement('th');
            col.innerText = 'Win pool odds';
            thead.insertBefore(col, null);

            let rightCol = [];
            for (let a = 0; a < numRows; ++a) {
                let sum = 0;
                for (let b = 0; b < numCols; ++b) {
                    if (payouts[a * numCols + b])
                        sum += 2 / payouts[a * numCols + b] * 0.77;
                }
                rightCol.push(sum);
            }
            rightCol= rightCol.map(el => (1 / el * 0.77) - 1);
            console.log("right col", rightCol)

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
                // sum /= 0.77;
                // sum -= 1;
                // let rowData = document.createElement('td');
                // if (Math.abs(sum) <= 0.01 || !sum) {
                //     rowData.innerText = '-';
                // } else if (sum <= 5) {
                //     rowData.innerText = Math.round(sum * 10) / 10;
                // } else {
                //     rowData.innerText = Math.round(sum);
                // }
                // row.insertBefore(rowData, null);
                // tbody.insertBefore(row, null);

                let rowData = document.createElement('td');
                if (Math.abs(rightCol[a-1]) <= 0.01 || !rightCol[a-1] || rightCol[a-1] === Infinity) {
                    rowData.innerText = '-';
                } else if (rightCol[a-1] <= 5) {
                    rowData.innerText = Math.round(rightCol[a-1] * 10) / 10;
                } else {
                    rowData.innerText = Math.round(rightCol[a-1]);
                }
                row.insertBefore(rowData, null);
                tbody.insertBefore(row, null);
                console.log("win probs", winProbs[a])
                let winPoolOdds = (100 - winProbs[a - 1]) / winProbs[a - 1] * 0.77;
                rowData = document.createElement('td');
                if (Math.abs(winPoolOdds) <= 0.01 || !winPoolOdds || winPoolOdds === Infinity) {
                    rowData.innerText = '-';
                } else if (winPoolOdds <= 5) {
                    rowData.innerText = Math.round(winPoolOdds * 10) / 10;
                } else {
                    rowData.innerText = Math.round(winPoolOdds);
                }
                row.insertBefore(rowData, null);
                tbody.insertBefore(row, null);
            }

            let bottomRow = [];
            for (let a = 0; a < numCols; ++a) {
                let sum = 0;
                for (let b = 0; b < numRows; ++b) {
                    if (payouts[b * numCols + a])
                        sum += 2 / payouts[b * numCols + a] * 0.77;
                }
                bottomRow.push(sum);
            }
            bottomRow = bottomRow.map(el => (1 / el * 0.77) - 1);

            let row = document.createElement('tr');
            let rowData = document.createElement('td');
            rowData.innerText = "Implied Odds";
            row.insertBefore(rowData, null);
            for (let a = 0; a < numCols; ++a) {
                rowData = document.createElement('td');
                if (Math.abs(bottomRow[a]) <= 0.01 || !bottomRow[a]) {
                    rowData.innerText = '-';
                } else if (bottomRow[a] <= 5) {
                    rowData.innerText = Math.round(bottomRow[a] * 10) / 10;
                } else {
                    rowData.innerText = Math.round(bottomRow[a]);
                }
                row.insertBefore(rowData, null);
            }
            tbody.insertBefore(row, null);

            // row = document.createElement('tr');
            // rowStart = document.createElement('td');
            // rowStart.innerText = "Avgs"
            // rowStart.className = 'rowStart';
            // row.insertBefore(rowStart, null)
            // for (const avg of avgs) {
            //     const rowData = document.createElement('td');
            //     if (Math.abs(avg) <= 0.01 || !avg) {
            //         rowData.innerText = '-';
            //     } else if (avg <= 5) {
            //         rowData.innerText = Math.round(avg * 10) / 10;
            //     } else {
            //         rowData.innerText = Math.round(avg);
            //     }
            //     row.insertBefore(rowData, null)
            // }
            // tbody.insertBefore(row, null);

            // DD expected
            thead = document.getElementById('thead3');
            tbody = document.getElementById('tbody3');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            const ddCondProbs = ddData.ddCondProbs;
            const payoutColTotals = [];
            const payoutColRecipTotals = [];
            for (let i = 0; i < numCols; ++i) {
                let colTotal = 0;
                let colRecipTotal = 0;
                for (let j = 0; j < numRows; ++j) {
                    colTotal += payouts[j * numCols + i];
                    if (payouts[j * numCols + i] !== 0) colRecipTotal += 1 / payouts[j * numCols + i];
                }
                payoutColTotals.push(colTotal);
                payoutColRecipTotals.push(colRecipTotal);
            }
            for (let a = 0; a <= numCols; ++a) {
                const col = document.createElement('th');
                col.innerText = a ? a : '';
                thead.insertBefore(col, null);
                if (a < numCols) avgs[a] = 0;
                if (a < numCols) avgCnts[a] = 0;
            }
            col = document.createElement('th');
            col.innerText = 'Row Inefficiency';
            thead.insertBefore(col, null);

            const condProbAvgs = [];
            for (let i = 0; i < numCols; ++i) {
                let avg = 0;
                for (let j = 0; j < numRows; ++j) {
                    if (payouts[j * numCols + i] !== 0) avg += ddCondProbs[j * numCols + i] / payouts[j * numCols + i];
                }
                avg /= payoutColRecipTotals[i];
                condProbAvgs.push(avg);
            }

            for (let a = 1; a <= numRows; ++a) {
                const row = document.createElement('tr');
                const rowStart = document.createElement('td');
                rowStart.innerText = a;
                rowStart.className = 'rowStart';
                row.insertBefore(rowStart, null);
                // let sum = 0;
                for (let b = 0; b < numCols; ++b) {
                    const rowData = document.createElement('td');
                    const payout = payouts[(a - 1) * numCols + b];
                    const odds = 2 * 0.77 / (condProbAvgs[b] * winProbs[a - 1] / 100 * 0.9);
                    // const odds = 2 * 0.77 / (condProbAvgs[b] * winProbs[a - 1] / 100);
                    // const odds = 2 * 0.77 / (ddCondProbs[(a - 1) * numCols + b] * winProbs[a - 1] / 100);
                    // avgs[b] += odds * winProbs[a - 1] / 100;
                    // if (odds && odds !== 0) sum += 1 / (odds / 0.77 + 1);
                    // if (odds > 0) avgCnts[b]++;
                    if (Math.abs(odds) <= 0.01 || !odds || odds === Infinity) {
                        rowData.innerText = '-';
                    } else if (odds <= 5) {
                        const rounded = Math.round(odds * 10) / 10;
                        rowData.innerText = `${payout - rounded} (${payout})`;
                    } else {
                        const rounded = Math.round(odds);
                        rowData.innerText = `${payout - rounded} (${payout})`;
                    }
                    if (payout - odds > 0) rowData.className = "pos"
                    else rowData.className = "neg"
                    row.insertBefore(rowData, null);
                }
                // sum /= 0.77;
                // sum -= 1;
                // const rowData = document.createElement('td');
                // if (Math.abs(sum) <= 0.01 || !sum) {
                //     rowData.innerText = '-';
                // } else if (sum <= 5) {
                //     rowData.innerText = Math.round(sum * 10) / 10;
                // } else {
                //     rowData.innerText = Math.round(sum);
                // }
                // row.insertBefore(rowData, null);
                tbody.insertBefore(row, null);
            }
            // console.log(avgs)
            // avgs = avgs.map((avg, idx) => avg / avgCnts[idx]);
            // row = document.createElement('tr');
            // rowStart = document.createElement('td');
            // rowStart.innerText = "Avgs"
            // rowStart.className = 'rowStart';
            // row.insertBefore(rowStart, null)
            // for (const avg of avgs) {
            //     const rowData = document.createElement('td');
            //     if (Math.abs(avg) <= 0.01 || !avg) {
            //         rowData.innerText = '-';
            //     } else if (avg <= 5) {
            //         rowData.innerText = Math.round(avg * 10) / 10;
            //     } else {
            //         rowData.innerText = Math.round(avg);
            //     }
            //     row.insertBefore(rowData, null)
            // }
            // tbody.insertBefore(row, null);

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