class mat {
  themat;
  m;
  n;

  constructor(arr2d) {
    themat = arr2d;
    m = arr2d.length;
    n = arr2d[0].length;
  }

  map(mapfn) {
    const new2darr = [];
    for (let i = 0; i < this.m; ++i) {
      const curRow = arr2d[i];
      const row = [];
      for (let j = 0; j < this.n; ++j) {
        const curCol = [];
        for (let k = 0; k < this.m; ++k) {
          curCol.push(themat[k][j]);
        }
        row.push(mapfn(themat[i][j], i, j, curRow, curCol));
      }
      new2darr.push(row);
    }
    return new mat(new2darr);
  }

  mapRows(mapfn) {
    const mapped = [];
    for (let i = 0; i < this.m; ++i) {
      mapped.push(mapfn(themat[i], i));
    }
    return mapped;
  }

  mapCols(mapfn) {
    const mapped = [];
    for (let j = 0; j < this.n; ++j) {
      const col = [];
      for (let i = 0; i < this.m; ++i) {
        col.push(this.themat[i][j]);
      }
      mapped.push(mapfn(col, j));
    }
    return mapped;
  }
}

class table {
  tblElem = document.createElement('table');
  tbody = document.createElement('tbody');
  thead = document.createElement('thead');

  constructor() {
    this.tblElem.insertBefore(thead);
    this.tblElem.insertBefore(tbody);
  }

  static createFromMat(m) {
    let tbl = new table();
    let themat = m.themat;
    for (let i = 0; i < m.m; ++i) {
      let row = document.createElement('tr');
      for (let j = 0; j < m.n; ++j) {
        let cell = document.createElement('td');
        cell.innerText = themat[i][j];
        row.insertBefore(cell);
      }
      tbl.tbody.insertBefore(row);
    }
    return tbl;
  }

  addHeader(headerRowTexts) {
    let row = document.createElement('tr');
    for (let text of headerRowTexts) {
      let th = document.createElement('th');
      th.innerText = text;
      row.insertBefore(th);
    }
    this.thead.insertBefore(row);
  }

  prependColumn(cellTexts, title) {
    if (title) {
      let th = document.createElement('th');
      th.innerText = title;
      this.thead.firstChild.insertBefore(th, this.thead.firstChild.firstChild);
    }

    this.tbody.childNodes.forEach((tr, idx) => {
      let td = document.createElement('td');
      td.innerText = cellTexts[idx];
      tr.insertBefore(td, tr.firstChild);
    });
  }

  appendColumn(cellTexts, title) {
    if (title) {
      let th = document.createElement('th');
      th.innerText = title;
      this.thead.firstChild.insertBefore(th);
    }

    this.tbody.childNodes.forEach((node, idx) => {
      let td = document.createElement('td');
      td.innerText = cellTexts[idx];
      node.insertBefore(td);
    });
  }

  appendRow(cellTexts, title) {
    let row = document.createElement('tr');
    let titleTd = document.createElement('td');
    if (title) titleTd = title;
    row.insertBefore(titleTd);
    for (let text of cellTexts) {
      let td = document.createElement('td');
      td.innerText = text;
      row.insertBefore(td);
    }
    this.tbody.insertBefore(td);
  }
}

module.exports = {
  mat,
  table
}