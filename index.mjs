import mysql2 from 'mysql2/promise';

class TableAdapter {
    constructor(connection, table) {
        this.connection = connection;
        this.table = table;
    }

    select(rows, where) {
        if (rows === undefined) {
            rows = '*';
        }

        if (where !== undefined) {

        }

        where = '';

        return this.connection.execute(
            `SELECT ${rows} from ${this.table} ${where}`
        ).then(([rows]) => rows);
    }

    insert(insertColumns, insertRows) {
        let placeholder = ''; // question marks for mysql2.execute

        // convert single row to default format
        if (!Array.isArray(insertRows)) {
            insertRows = [insertRows];
        }

        const values = [];
        for (let row = 0; row < insertRows.length; row++) {
            placeholder += '(';
            for (let column = 0; column < insertColumns.length; column++) {
                const columnName = insertColumns[column];
                values.push(insertRows[row][columnName]);
                placeholder += '?';
                if (column !== insertColumns.length - 1) placeholder += ', ';
            }
            placeholder += ')';
            if (row !== insertRows.length - 1) placeholder += ', ';
        }

        return this.connection.execute(
            `INSERT INTO ${this.table} (${insertColumns}) VALUES ${placeholder}`,
            values
        );
    }

    createInsertAdapter(columns) {
        return (data) => this.insert(columns, data);
    }

    delete(column, columnValue) {
        return this.connection.execute(
            `DELETE FROM ${this.table} WHERE ${column} = ?`,
            [columnValue]
        );
    }

    createDeleteAdapter(column) {
        return (columnValue) => this.delete(column, columnValue);
    }

    update(columnValues, selectorColumn, selectorValue) {
        let placeholder = ''; // question marks for mysql2.execute
        
        // convert single row to default format
        if (!Array.isArray(columnValues)) {
            columnValues = [columnValues];
        }
        
        const columns = Object.keys(columnValues[0]);

        const values = [];
        for (let column = 0; column < columns.length; column++) {
            placeholder += `${columns[column]}=?`;
            values.push(columnValues[column][columns[column]]);
            if (column !== columns.length - 1) placeholder += ', ';
        }

        return this.connection.execute(
        // console.log(
            `UPDATE ${this.table} SET ${placeholder} WHERE ${selectorColumn} = ?`,
            [...values, selectorValue]
        );
    }
}

class MySQLJSON {
    constructor(config) {
        this.config = config;
    }

    async connect() {
        if (this.connection === undefined || this.connection === null) {
            this.connection = await mysql2.createConnection(this.config);
        }
    }
    
    async createTableAdapter(table) {
        return new TableAdapter(this.connection, table);
    }
}

export default MySQLJSON;
